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
