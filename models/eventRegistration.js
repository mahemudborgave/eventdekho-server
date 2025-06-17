import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',     // optional: use if you have an Event model
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  studentCollegeName: {
    type: String,
    required: true
  },
  eventCollegeName: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  course: {
    type: String,
    enum: ['B.Tech', 'B.E', 'M.E', 'Diploma'],
    required: true
  },
  year: {
    type: String,
    enum: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    required: true
  },
  mobno: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('eventRegistration', eventRegistrationSchema);
