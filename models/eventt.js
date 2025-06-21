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
        collegeName: {
            type: String,
            required: true,
            trim: true,
        },
        collegeCode: {
            type: String,
            required: true,
            minlength: 4,
            trim: true,
            index: true,
        },
        collegeCity: {
            type: String,
            required: true,
            trim: true,
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
    },
    { timestamps: true }
)

const Eventt = mongoose.model('eventt', eventSchema);

export default Eventt;
