import express from 'express';
import ContactUs from '../models/contactus.js';
const router = express.Router();

// Create ContactUs message
router.post('/', async (req, res) => {
  try {
    const contact = new ContactUs(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await ContactUs.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get message by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await ContactUs.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    const message = await ContactUs.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 