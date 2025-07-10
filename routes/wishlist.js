import express from 'express';
import Wishlist from '../models/wishlist.js';
const router = express.Router();

// Add to wishlist
router.post('/add', async (req, res) => {
  try {
    const { eventId, eventName, userEmail } = req.body;
    if (!eventId || !eventName || !userEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Prevent duplicates
    const exists = await Wishlist.findOne({ eventId, userEmail });
    if (exists) {
      return res.status(200).json({ message: 'Already wishlisted' });
    }
    const wish = new Wishlist({ eventId, eventName, userEmail });
    await wish.save();
    res.status(201).json({ message: 'Added to wishlist', wish });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove from wishlist
router.post('/remove', async (req, res) => {
  try {
    const { eventId, userEmail } = req.body;
    if (!eventId || !userEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await Wishlist.findOneAndDelete({ eventId, userEmail });
    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all wishlisted events for a user
router.get('/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    // Populate eventId to get full event details
    const wishes = await Wishlist.find({ userEmail }).populate('eventId');
    // Map to return the event object directly, or fallback to eventName if event is missing
    const events = wishes
      .map(wish => wish.eventId ? wish.eventId : null)
      .filter(Boolean);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router; 