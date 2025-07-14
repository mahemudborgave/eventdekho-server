import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  email: { type: String, required: true }, // Add email for unique user identification
}, { timestamps: true });

export default mongoose.model('Blog', blogSchema); 