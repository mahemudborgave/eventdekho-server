import express from "express";
import College from '../models/college.js';
const router = express.Router();

// Register a new college
router.post('/registercollege', async (req, res) => {
  try {
    let { collegeName, collegeCode, shortName, city, type, tier } = req.body;
    if (!collegeName || !shortName || !city || !type) {
      return res.status(400).json({ message: 'collegeName, city, and type are required.' });
    }
    if (!collegeCode || collegeCode.trim() === '') {
      collegeCode = 'CC' + Date.now();
    }
    const college = new College({ collegeName, collegeCode, shortName, city, type, tier });
    await college.save();
    res.status(201).json({ message: 'College registered successfully', college });
  } catch (err) {
    res.status(500).json({ message: 'Error registering college', error: err.message });
  }
});

router.get('/collegelist', async (req, res) => {
  try {
    const colleges = await College.find({}, 'college_name college_code city type tier');
    res.json({ colleges });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching college list', error: err.message });
  }
});

router.get('/getcolleges', async (req, res) => {
  try {
    const colleges = await College.find();
    res.status(200).json(colleges);
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send("Error getting colleges");
  }
})

export default router;