import PollModel from '../models/pollSchema.js';

const createPoll = async (req, res) => {
    try {
        const { title, description, type, options, deadline, anonymous, audience } = req.body;
        const createdBy = req.user._id;

        if (!title || !options || options.length < 2) {
            return res.status(400).json({ status: false, message: "Title and at least 2 options are required" });
        }

        const poll = new PollModel({
            title, description, type, deadline, anonymous, audience, createdBy,
            options: options.map(text => ({ text, votes: [] }))
        });
        await poll.save();
        return res.status(201).json({ status: true, message: "Poll created", poll });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getPolls = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (status) filter.status = status;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const [polls, total] = await Promise.all([
            PollModel.find(filter)
                .populate('createdBy', 'fullName image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PollModel.countDocuments(filter)
        ]);

        // Attach whether current user voted
        const userId = req.user ? req.user._id.toString() : null;
        const enriched = polls.map(p => {
            const pObj = p.toObject();
            if (userId) {
                pObj.myVotes = pObj.options
                    .filter(o => o.votes.map(v => v.toString()).includes(userId))
                    .map(o => o._id.toString());
            }
            return pObj;
        });

        return res.status(200).json({ status: true, message: "Fetched", polls: enriched, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getPoll = async (req, res) => {
    try {
        const poll = await PollModel.findById(req.params.pollId)
            .populate('createdBy', 'fullName image');
        if (!poll) return res.status(404).json({ status: false, message: "Poll not found" });

        const userId = req.user ? req.user._id.toString() : null;
        const pObj = poll.toObject();
        if (userId) {
            pObj.myVotes = pObj.options
                .filter(o => o.votes.map(v => v.toString()).includes(userId))
                .map(o => o._id.toString());
        }
        return res.status(200).json({ status: true, message: "Fetched", poll: pObj });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const votePoll = async (req, res) => {
    try {
        const { pollId } = req.params;
        const { optionIds } = req.body; // array of option _ids
        const userId = req.user._id;

        if (!optionIds || !optionIds.length) {
            return res.status(400).json({ status: false, message: "Select at least one option" });
        }

        const poll = await PollModel.findById(pollId);
        if (!poll) return res.status(404).json({ status: false, message: "Poll not found" });
        if (poll.status === 'closed') return res.status(400).json({ status: false, message: "Poll is closed" });
        if (poll.deadline && new Date() > poll.deadline) {
            poll.status = 'closed';
            await poll.save();
            return res.status(400).json({ status: false, message: "Poll deadline has passed" });
        }

        // Remove existing votes by this user
        poll.options.forEach(option => {
            option.votes = option.votes.filter(v => v.toString() !== userId.toString());
        });

        // Add new votes
        const allowMultiple = poll.type === 'multiple';
        const selectedIds = allowMultiple ? optionIds : [optionIds[0]];
        selectedIds.forEach(optId => {
            const option = poll.options.id(optId);
            if (option) option.votes.push(userId);
        });

        await poll.save();
        return res.status(200).json({ status: true, message: "Vote recorded" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const deletePoll = async (req, res) => {
    try {
        const { pollId } = req.params;
        const userId = req.user._id.toString();

        const poll = await PollModel.findById(pollId);
        if (!poll) return res.status(404).json({ status: false, message: "Poll not found" });
        if (poll.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        await PollModel.findByIdAndDelete(pollId);
        return res.status(200).json({ status: true, message: "Poll deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

export { createPoll, getPolls, getPoll, votePoll, deletePoll };
