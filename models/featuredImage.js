import mongoose from 'mongoose';

const featuredImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String },
  eventName: { type: String, required: true },
  eventUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('FeaturedImage', featuredImageSchema); 