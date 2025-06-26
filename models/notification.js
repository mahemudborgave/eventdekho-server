import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  eventId: { type: String, required: true },
  eventName: { type: String, required: true },
  queryId: { type: String, required: true },
  resolution: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema); 