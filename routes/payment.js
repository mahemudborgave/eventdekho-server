import express from 'express';
import paymentController from '../paymentController.js';

const router = express.Router();

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/organizer-transactions', paymentController.getOrganizerTransactions);

export default router; 