import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
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
    mobileNumber: {
        type: String,
        required: true,
        trim: true,
    },
    // Student-specific fields (optional - to be filled in profile)
    collegeName: {
        type: String,
        default: '',
        trim: true,
    },
    course: {
        type: String,
        default: '',
        trim: true,
    },
    branch: {
        type: String,
        default: '',
        trim: true,
    },
    year: {
        type: String,
        default: '',
        trim: true,
    },
    semester: {
        type: String,
        default: '',
        trim: true,
    },
    gender: {
        type: String,
        default: '',
        trim: true,
    },
    // Account status
    isActive: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        default: 'student',
        enum: ['student'],
    },
}, { timestamps: true });

// Index for better query performance (removed email since unique: true creates it)
StudentSchema.index({ name: 1 });
StudentSchema.index({ collegeName: 1 });

const Student = mongoose.model('Student', StudentSchema);
export default Student; 