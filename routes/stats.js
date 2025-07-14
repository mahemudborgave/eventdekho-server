import express from "express"
const router = express.Router();
import Student from '../models/student.js';
import Organization from '../models/organization.js';
import Eventt from '../models/eventt.js';
import Visitor from '../models/visitor.js';


// Public stats endpoint
router.get('', async (req, res) => {
    try {
      const totalStudents = await Student.countDocuments();
      const totalOrganizations = await Organization.countDocuments();
      const totalEvents = await Eventt.countDocuments();
      res.json({
        totalStudents,
        totalOrganizations,
        totalEvents
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching public stats' });
    }
  });

// Save a visitor hit
router.post('/visitors', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';
    await Visitor.create({ ip, userAgent });
    res.status(201).json({ message: 'Visitor recorded' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving visitor' });
  }
});

// Get total visitors
router.get('/visitors/total', async (req, res) => {
  try {
    const count = await Visitor.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching visitor count' });
  }
});


export default router;