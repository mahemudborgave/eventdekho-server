import express from 'express';
import Query from '../models/query.js';
import nodemailer from 'nodemailer';
import Notification from '../models/notification.js';
const router = express.Router();

// Create a new query
router.post('/', async (req, res) => {
  try {
    const query = new Query(req.body);
    await query.save();
    res.status(201).json(query);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all queries for a specific event
router.get('/event/:eventId', async (req, res) => {
  try {
    const queries = await Query.find({ eventId: req.params.eventId });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all queries (admin)
router.get('/', async (req, res) => {
  try {
    const queries = await Query.find();
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add resolution to a query
router.post('/respond/:queryId', async (req, res) => {
  try {
    const { resolution } = req.body;
    const { queryId } = req.params;
    if (!resolution) return res.status(400).json({ error: 'Resolution is required' });
    const updated = await Query.findByIdAndUpdate(queryId, { resolution }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Query not found' });

    // Add notification for the user
    const notification = await Notification.create({
      userEmail: updated.userEmail,
      eventId: updated.eventId,
      eventName: updated.eventName,
      queryId: updated._id,
      resolution: resolution
    });

    // Emit realtime notification
    const io = req.app.get('io');
    if (io) {
      io.to(updated.userEmail).emit('notification', {
        _id: notification._id,
        userEmail: notification.userEmail,
        eventId: notification.eventId,
        eventName: notification.eventName,
        queryId: notification.queryId,
        resolution: notification.resolution,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt
      });
    }

    // Send email to the query raiser
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: updated.userEmail,
      subject: `Response to your query for event: ${updated.eventName}`,
      text: `Hello ${updated.userName},\n\nYour query: ${updated.message}\n\nAdmin response: ${resolution}\n\nThank you for reaching out!`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Resolution saved and email sent', query: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save resolution or send email' });
  }
});

// Get notifications for a user
router.get('/notifications/:userEmail', async (req, res) => {
  try {
    const notifications = await Notification.find({ userEmail: req.params.userEmail });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Delete a notification (mark as read)
router.delete('/notifications/:notifId', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notifId);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router; 