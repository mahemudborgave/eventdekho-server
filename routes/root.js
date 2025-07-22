import express from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
import User from '../models/user.js';
import Eventt from '../models/eventt.js';
import eventRegistration from '../models/eventRegistration.js';
import Organization from '../models/organization.js';
import Student from '../models/student.js';
import Payment from '../models/payment.js';
import Query from '../models/query.js';

dotenv.config();
const secret = process.env.JWT_SECRET;
const router = express.Router();

// Root login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if user exists and is root
        const user = await User.findOne({ email, role: 'root' });
        
        if (!user) {
            return res.status(400).json({ message: "Root access denied" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                email: user.email,
                role: 'root',
                userId: user._id
            },
            secret,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: "Root login successful",
            user: {
                name: user.name,
                email: user.email,
                role: 'root'
            },
            token: token
        });

    } catch (error) {
        console.error('Root login error:', error);
        res.status(500).json({ message: "Server error during root login" });
    }
});

// Verify root token endpoint
router.post('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        res.json({
            valid: true,
            user: decoded
        });

    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// Get all events with full details
router.get('/events', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const events = await Eventt.find().sort({ createdAt: -1 });
        
        // Get registration counts for each event
        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const registrationCount = await eventRegistration.countDocuments({ eventId: event._id });
                return {
                    ...event.toObject(),
                    registrationCount
                };
            })
        );

        res.json(eventsWithCounts);

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: "Server error while fetching events" });
    }
});

// Get all users (students and organizers)
router.get('/users', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const students = await Student.find().sort({ createdAt: -1 });
        const organizations = await Organization.find().sort({ createdAt: -1 });

        res.json({
            students,
            organizations,
            totalStudents: students.length,
            totalOrganizations: organizations.length
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Server error while fetching users" });
    }
});

// Get single user by ID
router.get('/users/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const { userId } = req.params;

        // Try to find in students first
        let user = await Student.findById(userId);
        let userType = 'student';

        if (!user) {
            // Try to find in organizations
            user = await Organization.findById(userId);
            userType = 'organization';
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user,
            userType
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: "Server error while fetching user" });
    }
});

// Update user
router.put('/users/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const { userId } = req.params;
        const updateData = req.body;

        // Try to find and update in students first
        let user = await Student.findByIdAndUpdate(userId, updateData, { new: true });
        let userType = 'student';

        if (!user) {
            // Try to find and update in organizations
            user = await Organization.findByIdAndUpdate(userId, updateData, { new: true });
            userType = 'organization';
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            user,
            userType
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: "Server error while updating user" });
    }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const { userId } = req.params;

        // Try to find and delete from students first
        let user = await Student.findByIdAndDelete(userId);
        let userType = 'student';

        if (!user) {
            // Try to find and delete from organizations
            user = await Organization.findByIdAndDelete(userId);
            userType = 'organization';
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Also delete from base user collection
        await User.findOneAndDelete({ email: user.email });

        res.json({
            message: "User deleted successfully",
            userType
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: "Server error while deleting user" });
    }
});

// Toggle user verification status
router.patch('/users/:userId/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const { userId } = req.params;
        const { isVerified } = req.body;

        // Try to find and update in students first
        let user = await Student.findByIdAndUpdate(
            userId, 
            { isVerified: isVerified }, 
            { new: true }
        );
        let userType = 'student';

        if (!user) {
            // Try to find and update in organizations
            user = await Organization.findByIdAndUpdate(
                userId, 
                { isVerified: isVerified }, 
                { new: true }
            );
            userType = 'organization';
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
            user,
            userType
        });

    } catch (error) {
        console.error('Error updating user verification:', error);
        res.status(500).json({ message: "Server error while updating user verification" });
    }
});

// Toggle user active status
router.patch('/users/:userId/status', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const { userId } = req.params;
        const { isActive } = req.body;

        // Try to find and update in students first
        let user = await Student.findByIdAndUpdate(
            userId, 
            { isActive: isActive }, 
            { new: true }
        );
        let userType = 'student';

        if (!user) {
            // Try to find and update in organizations
            user = await Organization.findByIdAndUpdate(
                userId, 
                { isActive: isActive }, 
                { new: true }
            );
            userType = 'organization';
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user,
            userType
        });

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: "Server error while updating user status" });
    }
});

// Get all registrations
router.get('/registrations', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const registrations = await eventRegistration.find().sort({ createdAt: -1 });

        res.json(registrations);

    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: "Server error while fetching registrations" });
    }
});

// Delete registration
router.delete('/registrations/:registrationId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const { registrationId } = req.params;

        const registration = await eventRegistration.findByIdAndDelete(registrationId);

        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        res.json({
            message: "Registration deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ message: "Server error while deleting registration" });
    }
});

// Get all transactions (root)
router.get('/transactions', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, secret);
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }
        const transactions = await Payment.find().sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: "Server error while fetching transactions" });
    }
});
// Get all queries (root)
router.get('/queries', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, secret);
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }
        const queries = await Query.find().sort({ createdAt: -1 });
        res.json(queries);
    } catch (error) {
        console.error('Error fetching queries:', error);
        res.status(500).json({ message: "Server error while fetching queries" });
    }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }

        const totalEvents = await Eventt.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalOrganizations = await Organization.countDocuments();
        const totalRegistrations = await eventRegistration.countDocuments();

        // Get verified users count
        const verifiedStudents = await Student.countDocuments({ isVerified: true });
        const verifiedOrganizations = await Organization.countDocuments({ isVerified: true });

        // Get active users count
        const activeStudents = await Student.countDocuments({ isActive: true });
        const activeOrganizations = await Organization.countDocuments({ isActive: true });

        // Get events by month for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const eventsByMonth = await Eventt.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Get registrations by month for the last 6 months
        const registrationsByMonth = await eventRegistration.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        res.json({
            totalEvents,
            totalStudents,
            totalOrganizations,
            totalRegistrations,
            verifiedStudents,
            verifiedOrganizations,
            activeStudents,
            activeOrganizations,
            eventsByMonth,
            registrationsByMonth
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: "Server error while fetching statistics" });
    }
});

// Get organization by email with events and event payment stats
router.get('/organizations/:email', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, secret);
        if (decoded.role !== 'root') {
            return res.status(403).json({ message: "Root access required" });
        }
        const { email } = req.params;
        const organization = await Organization.findOne({ email });
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }
        // Get all events for this organization
        const events = await Eventt.find({ email });
        // For each event, get total amount received (sum of payments)
        const eventIds = events.map(e => e._id);
        const payments = await Payment.find({ eventId: { $in: eventIds } });
        const eventPayments = {};
        payments.forEach(p => {
            const eid = p.eventId.toString();
            if (!eventPayments[eid]) eventPayments[eid] = 0;
            eventPayments[eid] += p.amount || 0;
        });
        // Attach totalAmountReceived to each event
        const eventsWithStats = events.map(e => ({
            ...e.toObject(),
            totalAmountReceived: eventPayments[e._id.toString()] || 0
        }));
        res.json({ organization, events: eventsWithStats });
    } catch (error) {
        console.error('Error fetching organization details:', error);
        res.status(500).json({ message: "Server error while fetching organization details" });
    }
});

export default router; 