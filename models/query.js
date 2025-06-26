import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  eventName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  resolution: { type: String },
}, { timestamps: true });

export default mongoose.model('Query', querySchema); 