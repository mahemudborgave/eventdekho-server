import mongoose from 'mongoose';

const organizationSchema = mongoose.Schema({
    organizationName: {
        type: String,
        required: true,
        trim: true,
    },
    organizationCode: {
        type: String,
        trim: true,
        default: '',
        index: true,
    },
    shortName: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Government Aided', 'Unaided', 'Autonomous', 'Deemed University', 'Non-autonomous'],
        trim: true,
    },
    tier: {
        type: String,
        trim: true,
        default: '',
    },
    eventsHosted: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Organization = mongoose.model('organization', organizationSchema);
export default Organization;