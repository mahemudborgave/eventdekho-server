import express from "express";
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from "dotenv";
import { createUser, authenticateUser } from '../utils/userUtils.js';
import { OAuth2Client } from 'google-auth-library';
import Student from '../models/student.js';
import Organization from '../models/organization.js';
import Eventt from '../models/eventt.js';
import BaseUser from '../models/baseUser.js';

dotenv.config();
const secret = process.env.JWT_SECRET;
const router = express.Router();
const client = new OAuth2Client('1003672145264-datm5nj7uabjeaj07ehfpcbau1lhr1ck.apps.googleusercontent.com');

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { role, ...userData } = req.body;

        // Validate role
        if (!role || !['student', 'organizer'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be 'student' or 'organizer'" });
        }

        // Validate required fields based on role
        if (role === 'student') {
            const requiredFields = ['name', 'email', 'password', 'mobileNumber'];
            for (const field of requiredFields) {
                if (!userData[field] || !userData[field].trim()) {
                    return res.status(400).json({ message: `${field} is required for student registration` });
                }
            }
            
            // Remove empty optional fields to prevent validation errors
            if (!userData.gender || !userData.gender.trim()) {
                delete userData.gender;
            }
        } else if (role === 'organizer') {
            const requiredFields = ['organizationName', 'email', 'password', 'organizationType'];
            for (const field of requiredFields) {
                if (!userData[field] || !userData[field].trim()) {
                    return res.status(400).json({ message: `${field} is required for organization registration` });
                }
            }
            
            // Validate organization type
            if (!['college', 'college_club', 'ngo', 'limited_company'].includes(userData.organizationType)) {
                return res.status(400).json({ message: "Organization type must be 'college', 'college_club', 'ngo', or 'limited_company'" });
            }
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(userData.email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        // Validate password length
        if (userData.password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Create user using utility function
        const result = await createUser({ ...userData, role });

        // Generate JWT token
        const token = jwt.sign(
            {
                email: result.user.email,
                role: role,
                userId: result.baseUser._id
            },
            secret,
            { expiresIn: '7d' }
        );

        // Prepare response data
        const responseData = {
            user: {
                name: role === 'student' ? result.user.name : result.user.organizationName,
                email: result.user.email,
                role: role
            },
            token: token
        };

        res.status(201).json({
            message: "Registration successful",
            ...responseData
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            // Duplicate key error (email already exists)
            return res.status(400).json({ message: "Email already registered" });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: "Server error during registration" });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Authenticate user using utility function
        const result = await authenticateUser(email, password);

        // Generate JWT token
        const token = jwt.sign(
            {
                email: result.baseUser.email,
                role: result.baseUser.role,
                userId: result.baseUser._id
            },
            secret,
            { expiresIn: '7d' }
        );

        // Prepare response data
        let userName = '';
        if (result.user) {
            userName = result.baseUser.role === 'student' ? result.user.name : result.user.organizationName;
        }
        const responseData = {
            user: {
                name: userName,
                email: result.user ? result.user.email : '',
                role: result.baseUser.role
            },
            token: token
        };

        res.status(200).json({
            message: "Login successful",
            ...responseData
        });

    } catch (error) {
        console.error('Login error:', error);
        
        if (error.message === 'User not found') {
            return res.status(400).json({ message: "User does not exist" });
        }
        
        if (error.message === 'Invalid password') {
            return res.status(400).json({ message: "Incorrect password" });
        }
        
        res.status(500).json({ message: "Server error during login" });
    }
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        res.json({
            valid: true,
            user: decoded
        });

    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// Update user profile endpoint
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        const { email } = decoded;

        // Validate gender if provided
        if (req.body.gender && req.body.gender.trim()) {
            const validGenders = ['male', 'female', 'other', 'Male', 'Female', 'Other'];
            if (!validGenders.includes(req.body.gender)) {
                return res.status(400).json({ message: "Gender must be 'male', 'female', or 'other'" });
            }
        }

        // Convert shortName to uppercase if provided
        if (req.body.shortName && req.body.shortName.trim()) {
            req.body.shortName = req.body.shortName.toUpperCase();
        }

        // Get user details to determine the model
        const { getUserByEmail, updateUser } = await import('../utils/userUtils.js');
        const userData = await getUserByEmail(email);
        
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user profile
        const updatedUser = await updateUser(email, req.body);

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: "Server error during profile update" });
    }
});

// Get user profile endpoint
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, secret);
        const { email } = decoded;

        // Get user details
        const { getUserByEmail } = await import('../utils/userUtils.js');
        const userData = await getUserByEmail(email);
        
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user: userData.userDetails
        });

    } catch (error) {
        console.error('Get profile error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        
        res.status(500).json({ message: "Server error while fetching profile" });
    }
});

// Get organizations that have hosted events
router.get('/organizations-with-events', async (req, res) => {
    try {
        const Organization = (await import('../models/organization.js')).default;
        const Eventt = (await import('../models/eventt.js')).default;
        
        // Get all organizations
        const organizations = await Organization.find({ isActive: true });
        
        // Get event counts for each organization
        const organizationsWithEvents = await Promise.all(
            organizations.map(async (org) => {
                const eventCount = await Eventt.countDocuments({ email: org.email });
                return {
                    _id: org._id,
                    parentOrganization: org.parentOrganization,
                    organizationName: org.organizationName,
                    shortName: org.shortName,
                    organizationType: org.organizationType,
                    city: org.city,
                    website: org.website,
                    description: org.description,
                    contactPerson: org.contactPerson,
                    phone: org.phone,
                    email: org.email,
                    eventsHosted: eventCount,
                    createdAt: org.createdAt,
                    updatedAt: org.updatedAt,
                    logo: org.logo,
                };
            })
        );
        
        // Filter organizations that have hosted at least one event
        const activeOrganizations = organizationsWithEvents.filter(org => org.eventsHosted > 0);
        
        // Sort by events hosted (descending)
        activeOrganizations.sort((a, b) => b.eventsHosted - a.eventsHosted);
        
        res.json(activeOrganizations);
        
    } catch (error) {
        console.error('Error fetching organizations with events:', error);
        res.status(500).json({ message: "Server error while fetching organizations" });
    }
});

// Google login endpoint
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        // 1. Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '1003672145264-datm5nj7uabjeaj07ehfpcbau1lhr1ck.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();

        // 2. Check if user exists in BaseUser
        let baseUser = await BaseUser.findOne({ email: payload.email });
        let user;
        if (!baseUser) {
            // 3. If not, create a new student user
            const userData = {
                name: payload.name,
                email: payload.email,
                password: Math.random().toString(36).slice(-8), // random password, not used
                mobileNumber: '', // You can prompt for this later
                role: 'student',
            };
            const result = await createUser(userData);
            baseUser = result.baseUser;
            user = result.user;
        } else {
            // 4. If exists, fetch the student document
            user = await Student.findOne({ email: payload.email });
        }

        // 5. Generate JWT token
        const appToken = jwt.sign(
            {
                email: baseUser.email,
                role: baseUser.role,
                userId: baseUser._id
            },
            secret,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: "Google login successful",
            user: {
                name: user.name,
                email: user.email,
                role: baseUser.role
            },
            token: appToken
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(401).json({ message: 'Invalid Google token' });
    }
});



export default router; 