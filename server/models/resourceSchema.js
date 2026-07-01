import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  subject: { type: String, default: '' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  audience: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const ResourceModel = mongoose.model('Resource', resourceSchema);
export default ResourceModel;
