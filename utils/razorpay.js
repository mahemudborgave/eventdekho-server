import Razorpay from 'razorpay';

console.log('[DEBUG] RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('[DEBUG] RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***' : undefined);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay; 