import express from "express";
import Organization from '../models/organization.js';
const router = express.Router();

// Register a new organization
router.post('/registerorganization', async (req, res) => {
  try {
    let { organizationName, organizationCode, shortName, city, type, tier } = req.body;
    if (!organizationName || !shortName || !city || !type) {
      return res.status(400).json({ message: 'organizationName, city, and type are required.' });
    }
    if (!organizationCode || organizationCode.trim() === '') {
      organizationCode = 'OC' + Date.now();
    }
    const organization = new Organization({ organizationName, organizationCode, shortName, city, type, tier });
    await organization.save();
    res.status(201).json({ message: 'Organization registered successfully', organization });
  } catch (err) {
    res.status(500).json({ message: 'Error registering organization', error: err.message });
  }
});

// Increment events hosted count for a organization
router.put('/incrementEvents', async (req, res) => {
  try {
    const { organizationCode } = req.body;
    if (!organizationCode) {
      return res.status(400).json({ message: 'Organization code is required.' });
    }
    
    const organization = await Organization.findOneAndUpdate(
      { organizationCode: organizationCode },
      { $inc: { eventsHosted: 1 } },
      { new: true }
    );
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }
    
    res.status(200).json({ message: 'Events count updated successfully', organization });
  } catch (err) {
    res.status(500).json({ message: 'Error updating events count', error: err.message });
  }
});

// Recalculate all organization event counts (utility endpoint)
router.post('/recalculateEventCounts', async (req, res) => {
  try {
    const Eventt = (await import('../models/eventt.js')).default;
    
    // Get all organizations
    const organizations = await Organization.find();
    
    for (const organization of organizations) {
      // Count events for this organization using organizationCode
      const eventCount = await Eventt.countDocuments({ organizationCode: organization.organizationCode });
      
      // Update the organization's eventsHosted count
      await Organization.findByIdAndUpdate(organization._id, { eventsHosted: eventCount });
    }
    
    res.status(200).json({ message: 'All organization event counts recalculated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error recalculating event counts', error: err.message });
  }
});

router.get('/organizationlist', async (req, res) => {
  try {
    const organizations = await Organization.find({}, 'organization_name organization_code city type tier');
    res.json({ organizations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching organization list', error: err.message });
  }
});

router.get('/getorganizations', async (req, res) => {
  try {
    // Only return organizations that have hosted events
    const organizations = await Organization.find({ eventsHosted: { $gt: 0 } });
    res.status(200).json(organizations);
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send("Error getting organizations");
  }
})

// Get all organizations (including those without events) - for admin use
router.get('/getallorganizations', async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.status(200).json(organizations);
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send("Error getting all organizations");
  }
})

export default router;