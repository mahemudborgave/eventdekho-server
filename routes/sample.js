import express from "express";
import College from '../models/college.js';
const router = express.Router();

router.get('/one', (req, res) => {
    console.log('from sample file');
    res.send("from sample file");
});

// Register a new college
router.post('/registercollege', async (req, res) => {
  try {
    const { collegeName, collegeCode, city, type, tier } = req.body;
    if (!collegeName || !city || !type) {
      return res.status(400).json({ message: 'collegeName, city, and type are required.' });
    }
    const college = new College({ collegeName, collegeCode, city, type, tier });
    await college.save();
    res.status(201).json({ message: 'College registered successfully', college });
  } catch (err) {
    res.status(500).json({ message: 'Error registering college', error: err.message });
  }
});

// Get all colleges (for suggestions)
router.get('/collegelist', async (req, res) => {
  try {
    const colleges = await College.find({}, 'collegeName collegeCode city type tier');
    res.json({ colleges });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching college list', error: err.message });
  }
});

export default router;