import razorpay from './utils/razorpay.js';
import Payment from './models/payment.js';
import crypto from 'crypto';
import EventRegistration from './models/eventRegistration.js';
import Eventt from './models/eventt.js';
import Student from './models/student.js';

const paymentController = {
  createOrder: async (req, res) => {
    try {
      console.log('[DEBUG] /api/payment/create-order request body:', req.body);
      const { amount, eventId, studentId } = req.body;
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
      console.log('[DEBUG] /api/payment/verify request body:', req.body);
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, studentId } = req.body;
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');
      console.log('[DEBUG] Calculated signature:', expectedSignature);
      console.log('[DEBUG] Provided signature:', razorpay_signature);
      if (expectedSignature === razorpay_signature) {
        console.log('[DEBUG] Signature valid. Creating Payment document...');
        const paymentDoc = await Payment.create({
          eventId,
          studentId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount: req.body.amount, // in paise
          status: 'success',
        });
        console.log('[DEBUG] Payment document created:', paymentDoc);
        // Fetch event and student details
        const event = await Eventt.findById(eventId);
        const student = await Student.findOne({ email: studentId });
        console.log('[DEBUG] Event found:', event);
        console.log('[DEBUG] Student found:', student);
        if (!event || !student) {
          console.error('[ERROR] Event or student not found for registration', { event, student });
          return res.status(400).json({ success: false, message: 'Event or student not found for registration' });
        }
        // Check for existing registration
        const existingRegistration = await EventRegistration.findOne({ eventId: event._id, email: student.email });
        if (existingRegistration) {
          return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
        }
        // Create event registration
        console.log('[DEBUG] Creating EventRegistration...');
        const registration = new EventRegistration({
          eventId: event._id,
          eventName: event.eventName,
          studentName: student.name,
          email: student.email,
          gender: student.gender || '',
          studentCollegeName: student.collegeName || '',
          organizationName: event.organizationName,
          parentOrganization: event.parentOrganization || '',
          branch: student.branch || '',
          course: student.course || '',
          year: student.year || '',
          mobno: student.mobileNumber || '',
          fee: typeof event.fee === 'number' ? event.fee : (req.body.amount ? req.body.amount / 100 : 0),
        });
        await registration.save();
        // Increment participationsCount for the event
        await Eventt.findByIdAndUpdate(event._id, { $inc: { participationsCount: 1 } });
        console.log('[DEBUG] EventRegistration created:', registration);
        return res.status(200).json({ success: true, message: 'Payment and registration successful', payment: paymentDoc, registration });
      } else {
        console.error('[ERROR] Invalid Razorpay signature:', { expectedSignature, razorpay_signature });
        res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    } catch (err) {
      console.error('[ERROR] Payment verification failed:', err);
      if (err && err.stack) console.error('[ERROR] Stack trace:', err.stack);
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