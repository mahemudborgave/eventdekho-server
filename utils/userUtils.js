import bcrypt from 'bcrypt';
import Student from '../models/student.js';
import Organization from '../models/organization.js';
import BaseUser from '../models/baseUser.js';

// Create a new user (student or organizer)
export const createUser = async (userData) => {
    const { role, ...userDetails } = userData;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        let userDoc;
        let userModel;
        
        if (role === 'student') {
            // Create student document with only required fields
            const studentData = {
                name: userDetails.name,
                email: userDetails.email,
                password: hashedPassword,
                mobileNumber: userDetails.mobileNumber,
            };
            
            // Add optional fields only if they exist and are not empty
            if (userDetails.gender && userDetails.gender.trim()) {
                studentData.gender = userDetails.gender;
            }
            if (userDetails.collegeName && userDetails.collegeName.trim()) {
                studentData.collegeName = userDetails.collegeName;
            }
            if (userDetails.course && userDetails.course.trim()) {
                studentData.course = userDetails.course;
            }
            if (userDetails.branch && userDetails.branch.trim()) {
                studentData.branch = userDetails.branch;
            }
            if (userDetails.year && userDetails.year.trim()) {
                studentData.year = userDetails.year;
            }
            if (userDetails.semester && userDetails.semester.trim()) {
                studentData.semester = userDetails.semester;
            }
            
            userDoc = new Student(studentData);
            userModel = 'Student';
        } else if (role === 'organizer') {
            // Create organization document
            userDoc = new Organization({
                ...userDetails,
                password: hashedPassword,
            });
            userModel = 'Organization';
        } else {
            throw new Error('Invalid role specified');
        }
        
        // Save the user document
        const savedUser = await userDoc.save();
        
        // Create base user for authentication
        const baseUser = new BaseUser({
            email: userData.email,
            password: hashedPassword,
            role: role,
            userRef: savedUser._id,
            userModel: userModel,
        });
        
        await baseUser.save();
        
        return {
            success: true,
            user: savedUser,
            baseUser: baseUser,
        };
        
    } catch (error) {
        throw error;
    }
};

// Authenticate user
export const authenticateUser = async (email, password) => {
    try {
        // Find base user
        const baseUser = await BaseUser.findOne({ email, isActive: true });
        if (!baseUser) {
            throw new Error('User not found');
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, baseUser.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        
        // Get user details
        const userDetails = await baseUser.populate('userDetails');
        
        // Update login stats
        baseUser.lastLogin = new Date();
        baseUser.loginCount += 1;
        await baseUser.save();
        
        return {
            success: true,
            user: userDetails.userDetails,
            baseUser: baseUser,
        };
        
    } catch (error) {
        throw error;
    }
};

// Get user by email
export const getUserByEmail = async (email) => {
    try {
        const baseUser = await BaseUser.findOne({ email, isActive: true })
            .populate('userDetails');
        
        if (!baseUser) {
            return null;
        }
        
        return {
            ...baseUser.toObject(),
            userDetails: baseUser.userDetails,
        };
        
    } catch (error) {
        throw error;
    }
};

// Update user
export const updateUser = async (email, updateData) => {
    try {
        const baseUser = await BaseUser.findOne({ email });
        if (!baseUser) {
            throw new Error('User not found');
        }
        
        // Update base user if needed
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        
        // Update the specific user document
        const UserModel = baseUser.userModel === 'Student' ? Student : Organization;
        const updatedUser = await UserModel.findByIdAndUpdate(
            baseUser.userRef,
            updateData,
            { new: true, runValidators: true }
        );
        
        return updatedUser;
        
    } catch (error) {
        throw error;
    }
};

// Delete user
export const deleteUser = async (email) => {
    try {
        const baseUser = await BaseUser.findOne({ email });
        if (!baseUser) {
            throw new Error('User not found');
        }
        
        // Delete the specific user document
        const UserModel = baseUser.userModel === 'Student' ? Student : Organization;
        await UserModel.findByIdAndDelete(baseUser.userRef);
        
        // Delete base user
        await BaseUser.findByIdAndDelete(baseUser._id);
        
        return { success: true };
        
    } catch (error) {
        throw error;
    }
}; 