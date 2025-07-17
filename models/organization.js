import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: true,
        trim: true,
    },
    shortName: {
        type: String,
        trim: true,
        default: '',
        maxlength: 50,
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
    // Organization type
    organizationType: {
        type: String,
        enum: ['college', 'college_club', 'ngo', 'limited_company'],
        required: true,
    },
    // Parent organization (optional)
    parentOrganization: {
        type: String,
        trim: true,
        default: '',
    },
    // Website URL
    website: {
        type: String,
        trim: true,
        default: '',
    },
    // Organization description
    description: {
        type: String,
        trim: true,
        default: '',
        maxlength: 1000,
    },
    // Contact person
    contactPerson: {
        type: String,
        trim: true,
        default: '',
    },
    // Phone number
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    // City/Location
    city: {
        type: String,
        trim: true,
        default: '',
    },
    // Organization logo URL
    logo: {
        type: String,
        trim: true,
        default: '',
    },
    eventsHosted: {
        type: Number,
        default: 0,
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
    role: {
        type: String,
        default: 'organizer',
        enum: ['organizer'],
    }
}, { timestamps: true });

// Index for better query performance (removed email since unique: true creates it)
OrganizationSchema.index({ organizationType: 1 });
OrganizationSchema.index({ organizationName: 1 });
OrganizationSchema.index({ shortName: 1 });
OrganizationSchema.index({ parentOrganization: 1 });

// Pre-save middleware to convert shortName to uppercase
OrganizationSchema.pre('save', function(next) {
    if (this.shortName && this.shortName.trim()) {
        this.shortName = this.shortName.toUpperCase();
    }
    next();
});

// Pre-update middleware to convert shortName to uppercase
OrganizationSchema.pre('findOneAndUpdate', function(next) {
    if (this._update.shortName && this._update.shortName.trim()) {
        this._update.shortName = this._update.shortName.toUpperCase();
    }
    next();
});

const Organization = mongoose.model('Organization', OrganizationSchema);
export default Organization; 