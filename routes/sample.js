import express from "express";
import Organization from '../models/organization.js';
const router = express.Router();

router.get('/one', (req, res) => {
    console.log('from sample file');
    res.send("from sample file");
});

// Register a new organization
router.post('/registerorganization', async (req, res) => {
  try {
    const { organizationName, organizationCode, city, type, tier } = req.body;
    if (!organizationName || !city || !type) {
      return res.status(400).json({ message: 'organizationName, city, and type are required.' });
    }
    const organization = new Organization({ organizationName, organizationCode, city, type, tier });
    await organization.save();
    res.status(201).json({ message: 'Organization registered successfully', organization });
  } catch (err) {
    res.status(500).json({ message: 'Error registering organization', error: err.message });
  }
});

// Get all organizations (for suggestions)
router.get('/organizationlist', async (req, res) => {
  try {
    const organizations = await Organization.find({}, 'organizationName organizationCode city type tier');
    res.json({ organizations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching organization list', error: err.message });
  }
});

export default router;