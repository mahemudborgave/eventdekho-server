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

// POST /college/registerparentcollege
router.post('/registerparentcollege', async (req, res) => {
  try {
    const { organizationName, dteCode, city, type, tier } = req.body;
    
    // Validate required fields
    if (!organizationName || !organizationName.trim()) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({ message: 'City is required' });
    }

    // Check if organization already exists
    const existingCollege = await College.findOne({ collegeName: organizationName.trim() });
    if (existingCollege) {
      return res.status(400).json({ message: 'Organization already exists' });
    }

    // Generate short name from organization name
    const shortName = organizationName.trim().split(' ').map(word => word[0]).join('').toUpperCase();

    // Create new college
    const newCollege = new College({
      collegeName: organizationName.trim(),
      collegeCode: dteCode || '',
      shortName: shortName,
      city: city.trim(),
      type: type && type.length > 0 ? type[0] : 'Unaided', // Take first type if array, default to Unaided
      tier: tier || '',
      eventsHosted: 0
    });

    const savedCollege = await newCollege.save();
    res.status(201).json({ 
      message: 'Organization registered successfully', 
      college: savedCollege 
    });
  } catch (err) {
    console.error('Error registering college:', err);
    res.status(500).json({ message: 'Error registering organization', error: err.message });
  }
});

export default router; 