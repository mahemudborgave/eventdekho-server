import mongoose from 'mongoose';

const collegeSchema = mongoose.Schema( {
    collegeCode : {
        type: String,
        required: true,
        minlength: 4,
        trim: true,
    },
    collegeName : {
        type: String,
        required: true,
        trim: true,
    },
    collegeEventCount: {
        type: Number,
        trim: true,
    }
},{ timestamps: true }
)

const College = mongoose.model('college', collegeSchema);
export default College;