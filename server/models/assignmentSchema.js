import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  subject: { type: String, required: true, trim: true },
  deadline: { type: Date, required: true },
  totalMarks: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'published'
  },
  audience: {
    type: String,
    enum: ['all', 'students', 'teachers'],
    default: 'all'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const AssignmentModel = mongoose.model('Assignment', assignmentSchema);
export default AssignmentModel;
