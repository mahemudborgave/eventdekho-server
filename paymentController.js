import razorpay from './utils/razorpay.js';
import Payment from './models/payment.js';
import crypto from 'crypto';

const paymentController = {
  createOrder: async (req, res) => {
    try {
      const { amount, eventId, studentId } = req.body;
      console.log('[DEBUG] /api/payment/create-order body:', req.body);
      // Shorten studentId to username part only
      const studentShort = studentId && typeof studentId === 'string' ? studentId.split('@')[0] : 'user';
      // Compose a short receipt string (max 40 chars)
      const shortReceipt = `evt${eventId}_${studentShort}_${Date.now()}`.slice(0, 40);
      const options = {
        amount: amount * 100, // Razorpay expects paise
        currency: 'INR',
        receipt: shortReceipt,
      };
      console.log('[DEBUG] Razorpay order options:', options);
      const order = await razorpay.orders.create(options);
      console.log('[DEBUG] Razorpay order created:', order);
      res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (err) {
      console.error('[ERROR] Razorpay order creation error:', err);
      res.status(500).json({ error: 'Failed to create Razorpay order', details: err.message });
    }
  },
  verifyPayment: async (req, res) => {
    try {
      console.log('[DEBUG] /api/payment/verify body:', req.body);
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, studentId } = req.body;
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');
      if (expectedSignature === razorpay_signature) {
        const paymentDoc = await Payment.create({
          eventId,
          studentId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status: 'success',
        });
        console.log('[DEBUG] Payment document created:', paymentDoc);
        res.json({ success: true, message: 'Payment verified and registration complete' });
      } else {
        console.error('[ERROR] Invalid Razorpay signature:', { expectedSignature, razorpay_signature });
        res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    } catch (err) {
      console.error('[ERROR] Payment verification failed:', err);
      res.status(500).json({ error: 'Payment verification failed', details: err.message });
    }
  },
  // it is not yet completely readty !!!!!!!!!!!!!!!!!!!!!!!!!!
  getOrganizerTransactions: async (req, res) => {
    try {
      const { organizerEmail } = req.query;
      if (!organizerEmail) return res.status(400).json({ error: 'Missing organizerEmail' });
      // Find all events by this organizer
      const events = await import('./models/eventt.js').then(m => m.default.find({ email: organizerEmail }));
      const eventIds = events.map(e => e._id);
      // Find all payments for these events
      const payments = await Payment.find({ eventId: { $in: eventIds } }).sort({ createdAt: -1 });
      res.json(payments);
    } catch (err) {
      console.error('[ERROR] Fetching organizer transactions:', err);
      res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
  }
};

export default paymentController; 