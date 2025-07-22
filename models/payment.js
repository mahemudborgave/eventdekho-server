import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'eventt', required: true },
  studentId: { type: String, required: true }, // storing email for now
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  amount: { type: Number, required: true }, // in paise
  status: { type: String, default: 'success' },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment; 