import mongoose from "mongoose";

const BaseUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'organizer'],
    },
    // Reference to the actual user document
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel',
    },
    // Dynamic reference based on role
    userModel: {
        type: String,
        required: true,
        enum: ['Student', 'Organization'],
    },
    // Account status
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    loginCount: {
        type: Number,
        default: 0,
    },
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,
}, { timestamps: true });

// Index for better query performance (removed email since unique: true creates it)
BaseUserSchema.index({ role: 1 });
BaseUserSchema.index({ isActive: 1 });

// Virtual for getting user details
BaseUserSchema.virtual('userDetails', {
    refPath: 'userModel',
    localField: 'userRef',
    foreignField: '_id',
    justOne: true,
});

// Ensure virtuals are serialized
BaseUserSchema.set('toJSON', { virtuals: true });
BaseUserSchema.set('toObject', { virtuals: true });

const BaseUser = mongoose.model('BaseUser', BaseUserSchema);
export default BaseUser; 