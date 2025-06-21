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

// Increment events hosted count for a college
router.put('/incrementEvents', async (req, res) => {
  try {
    const { collegeCode } = req.body;
    if (!collegeCode) {
      return res.status(400).json({ message: 'College code is required.' });
    }
    
    const college = await College.findOneAndUpdate(
      { collegeCode: collegeCode },
      { $inc: { eventsHosted: 1 } },
      { new: true }
    );
    
    if (!college) {
      return res.status(404).json({ message: 'College not found.' });
    }
    
    res.status(200).json({ message: 'Events count updated successfully', college });
  } catch (err) {
    res.status(500).json({ message: 'Error updating events count', error: err.message });
  }
});

// Recalculate all college event counts (utility endpoint)
router.post('/recalculateEventCounts', async (req, res) => {
  try {
    const Eventt = (await import('../models/eventt.js')).default;
    
    // Get all colleges
    const colleges = await College.find();
    
    for (const college of colleges) {
      // Count events for this college using collegeCode
      const eventCount = await Eventt.countDocuments({ collegeCode: college.collegeCode });
      
      // Update the college's eventsHosted count
      await College.findByIdAndUpdate(college._id, { eventsHosted: eventCount });
    }
    
    res.status(200).json({ message: 'All college event counts recalculated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error recalculating event counts', error: err.message });
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
    // Only return colleges that have hosted events
    const colleges = await College.find({ eventsHosted: { $gt: 0 } });
    res.status(200).json(colleges);
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send("Error getting colleges");
  }
})

// Get all colleges (including those without events) - for admin use
router.get('/getallcolleges', async (req, res) => {
  try {
    const colleges = await College.find();
    res.status(200).json(colleges);
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send("Error getting all colleges");
  }
})

export default router;