import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  _id: String,
  title: { type: String, default: 'Untitled' },
  data: String,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Document', DocumentSchema);
