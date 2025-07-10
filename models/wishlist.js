import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'eventt',
  },
  eventName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model('Wishlist', wishlistSchema); 