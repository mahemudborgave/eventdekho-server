import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  userAgent: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const Visitor = mongoose.model('Visitor', VisitorSchema);
export default Visitor; 