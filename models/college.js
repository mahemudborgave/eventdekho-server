import mongoose from 'mongoose';

const collegeSchema = mongoose.Schema({

    collegeName: {
        type: String,
        required: true,
        trim: true,
    },
    collegeCode: {
        type: String,
        trim: true,
        default: '',
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
}, { timestamps: true });

const College = mongoose.model('college', collegeSchema);
export default College;