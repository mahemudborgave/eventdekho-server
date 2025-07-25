import express from 'express';
import College from '../models/college.js';

const router = express.Router();

// GET /college/getallcolleges
router.get('/getallcolleges', async (req, res) => {
  try {
    const colleges = await College.find();
    res.status(200).json(colleges);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching colleges', error: err.message });
  }
});

// Register a new parent organization as a college
router.post('/registerparentcollege', async (req, res) => {
  try {
    const { collegeName, city, shortName, type, tier } = req.body;
    if (!collegeName || !city) {
      return res.status(400).json({ message: 'collegeName and city are required.' });
    }
    const college = new College({ collegeName, city, shortName, type, tier });
    await college.save();
    res.status(201).json({ message: 'Parent college registered successfully', college });
  } catch (err) {
    res.status(500).json({ message: 'Error registering parent college', error: err.message });
  }
});

export default router; 