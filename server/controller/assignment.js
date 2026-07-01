import AssignmentModel from '../models/assignmentSchema.js';
import SubmissionModel from '../models/assignmentSubmissionSchema.js';

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────

const createAssignment = async (req, res) => {
    try {
        const { title, description, subject, deadline, totalMarks, status, audience } = req.body;
        const createdBy = req.user._id;

        if (!title || !description || !subject || !deadline || !totalMarks) {
            return res.status(400).json({ status: false, message: "All required fields must be provided" });
        }

        const assignment = new AssignmentModel({
            title, description, subject, deadline, totalMarks,
            status: status || 'published',
            audience: audience || 'all',
            createdBy
        });
        await assignment.save();
        return res.status(201).json({ status: true, message: "Assignment created successfully", assignment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getAssignments = async (req, res) => {
    try {
        const { search, subject, status, sort = 'deadline', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        // Non-admin only see published
        if (!req.user || req.user.role === 'user') {
            filter.status = 'published';
        } else if (status) {
            filter.status = status;
        }
        if (subject) filter.subject = { $regex: subject, $options: 'i' };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sortMap = {
            deadline: { deadline: 1 },
            newest: { createdAt: -1 },
            title: { title: 1 }
        };

        const [assignments, total] = await Promise.all([
            AssignmentModel.find(filter)
                .populate('createdBy', 'fullName image role')
                .sort(sortMap[sort] || { deadline: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            AssignmentModel.countDocuments(filter)
        ]);

        // If authenticated, attach submission status for each assignment
        let submissionMap = {};
        if (req.user) {
            const subs = await SubmissionModel.find({
                studentId: req.user._id,
                assignmentId: { $in: assignments.map(a => a._id) }
            }).select('assignmentId status marks');
            subs.forEach(s => { submissionMap[s.assignmentId.toString()] = s; });
        }

        const enriched = assignments.map(a => ({
            ...a.toObject(),
            mySubmission: submissionMap[a._id.toString()] || null
        }));

        return res.status(200).json({ status: true, message: "Fetched", assignments: enriched, total, page: parseInt(page) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await AssignmentModel.findById(assignmentId)
            .populate('createdBy', 'fullName image role');
        if (!assignment) return res.status(404).json({ status: false, message: "Assignment not found" });

        let mySubmission = null;
        if (req.user) {
            mySubmission = await SubmissionModel.findOne({
                assignmentId,
                studentId: req.user._id
            });
        }

        return res.status(200).json({ status: true, message: "Fetched", assignment, mySubmission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const userId = req.user._id.toString();

        const assignment = await AssignmentModel.findById(assignmentId);
        if (!assignment) return res.status(404).json({ status: false, message: "Assignment not found" });

        if (assignment.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        const allowed = ['title', 'description', 'subject', 'deadline', 'totalMarks', 'status', 'audience'];
        allowed.forEach(field => { if (req.body[field] !== undefined) assignment[field] = req.body[field]; });
        await assignment.save();
        return res.status(200).json({ status: true, message: "Assignment updated", assignment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const userId = req.user._id.toString();

        const assignment = await AssignmentModel.findById(assignmentId);
        if (!assignment) return res.status(404).json({ status: false, message: "Assignment not found" });
        if (assignment.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        await AssignmentModel.findByIdAndDelete(assignmentId);
        await SubmissionModel.deleteMany({ assignmentId });
        return res.status(200).json({ status: true, message: "Assignment deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────────

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user._id;
        const { answerText } = req.body;

        const assignment = await AssignmentModel.findById(assignmentId);
        if (!assignment) return res.status(404).json({ status: false, message: "Assignment not found" });
        if (assignment.status === 'closed') {
            return res.status(400).json({ status: false, message: "Assignment is closed" });
        }

        const existing = await SubmissionModel.findOne({ assignmentId, studentId });
        if (existing) return res.status(400).json({ status: false, message: "Already submitted" });

        const isLate = assignment.deadline && new Date() > assignment.deadline;
        const submission = new SubmissionModel({
            assignmentId,
            studentId,
            answerText: answerText || '',
            status: isLate ? 'late' : 'submitted'
        });
        await submission.save();
        return res.status(201).json({ status: true, message: "Submitted successfully", submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const userId = req.user._id.toString();

        const assignment = await AssignmentModel.findById(assignmentId);
        if (!assignment) return res.status(404).json({ status: false, message: "Assignment not found" });
        if (assignment.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        const submissions = await SubmissionModel.find({ assignmentId })
            .populate('studentId', 'fullName image email');
        return res.status(200).json({ status: true, message: "Fetched", submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const reviewSubmission = async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const userId = req.user._id.toString();
        const { marks, feedback } = req.body;

        const assignment = await AssignmentModel.findById(assignmentId);
        if (!assignment) return res.status(404).json({ status: false, message: "Assignment not found" });
        if (assignment.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        const submission = await SubmissionModel.findById(submissionId);
        if (!submission) return res.status(404).json({ status: false, message: "Submission not found" });

        if (marks !== undefined) submission.marks = marks;
        if (feedback !== undefined) submission.feedback = feedback;
        submission.status = 'reviewed';
        await submission.save();
        return res.status(200).json({ status: true, message: "Review saved", submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getMySubmissions = async (req, res) => {
    try {
        const studentId = req.user._id;
        const submissions = await SubmissionModel.find({ studentId })
            .populate('assignmentId', 'title subject deadline totalMarks status');
        return res.status(200).json({ status: true, message: "Fetched", submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

export {
    createAssignment, getAssignments, getAssignment, updateAssignment, deleteAssignment,
    submitAssignment, getSubmissions, reviewSubmission, getMySubmissions
};
