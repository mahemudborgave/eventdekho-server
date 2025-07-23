import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
        },
        eventName: {
            type: String,
            required: true,
            trim: true,
        },
        clubName: {
            type: String,
            trim: true,
        },
        organizationName: {
            type: String,
            required: true,
            trim: true,
        },
        organizationId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        organizationCity: {
            type: String,
            required: true,
            trim: true,
        },
        parentOrganization: {
            type: String,
            trim: true,
            default: '',
        },
        eventDate: {
            type: Date,
            required: true,
            trim: true,
        },
        eventLocation: {
            type: String,
            required: true,
            trim: true,
        },
        eventMode: {
            type: String,
            enum: ['Onsite', 'Online'],
            required: true,
            trim: true,
        },
        eventTags: {
            type: [String],
            default: [],
        },
        postedOn: {
            type: Date,
            default: Date.now
        },
        closeOn: {
            type: Date,
            required: true,
            trim: true,
        },
        eventDescription: {
            type: String,
            required: true,
            trim: true,
        },
        posterUrl: {
            type: String,
            trim: true,
            default: '',
        },
        stages: [
            {
                title: { type: String, trim: true },
                description: { type: String, trim: true },
            }
        ],
        prizes: [
            {
                title: { type: String, trim: true },
                amount: { type: String, trim: true },
                description: { type: String, trim: true },
            }
        ],
        benefits: [
            { type: String, trim: true }
        ],
        rules: [
            { type: String, trim: true }
        ],
        guidelines: [
            { type: String, trim: true }
        ],
        bring: [
            { type: String, trim: true }
        ],
        // Payment fields for Razorpay integration
        fee: {
            type: Number,
            default: 0,
        },
        upiId: {
            type: String,
            trim: true,
            default: '',
        },
        bankDetails: {
            type: String,
            trim: true,
            default: '',
        },
        minParticipants: {
            type: Number,
            required: true,
            default: 1,
        },
        maxParticipants: {
            type: Number,
            required: true,
            default: 1,
        },
        registrationPlatform: {
            type: String,
            enum: ['eventapply', 'external'],
            default: 'eventapply',
            required: true,
        },
        registrationUrl: {
            type: String,
            trim: true,
            default: '',
        },
        registrationStartOn: {
            type: Date,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
)

const Eventt = mongoose.model('eventt', eventSchema);

export default Eventt;
