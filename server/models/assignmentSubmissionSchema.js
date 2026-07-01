import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answerText: { type: String, default: '' },
  fileUrl: { type: String, default: null },
  marks: { type: Number, default: null },
  feedback: { type: String, default: '' },
  status: {
    type: String,
    enum: ['submitted', 'late', 'reviewed'],
    default: 'submitted'
  },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// One submission per student per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const SubmissionModel = mongoose.model('AssignmentSubmission', submissionSchema);
export default SubmissionModel;
