import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { _id: true });

const pollSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['single', 'multiple'], default: 'single' },
  options: { type: [pollOptionSchema], required: true },
  deadline: { type: Date, default: null },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  anonymous: { type: Boolean, default: false },
  audience: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const PollModel = mongoose.model('Poll', pollSchema);
export default PollModel;
