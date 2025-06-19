import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name : {
        type:String,
        required: true,
        trim: true,
    },
    email : {
        type:String,
        required: true,
        trim: true,
        unique: true,
    },
    role : {
        type:String,
        required: true,
        trim: true,
    },
    password : {
        type:String,
        required: true,
        minlength: 6,
    },
    gender: {
        type: String,
        default: '',
        trim: true,
    },
    studentCollegeName: {
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
    mobno: {
        type: String,
        default: '',
        trim: true,
    }
},
{ timestamps: true })


const User = mongoose.model('User', UserSchema);
export default User;