// scripts/backfillParticipationsCount.js
import mongoose from 'mongoose';
import Eventt from '../models/eventt.js';
import EventRegistration from '../models/eventRegistration.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahemud:mahemud@cluster0.y3zrjtm.mongodb.net/eventdekho';

async function backfillParticipationsCount() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const events = await Eventt.find({});
  let updated = 0;

  for (const event of events) {
    const count = await EventRegistration.countDocuments({ eventId: event._id });
    await Eventt.findByIdAndUpdate(event._id, { participationsCount: count });
    console.log(`Event: ${event.eventName} (${event._id}) -> participationsCount: ${count}`);
    updated++;
  }

  console.log(`\nUpdated participationsCount for ${updated} events.`);
  await mongoose.disconnect();
}

backfillParticipationsCount().catch(err => {
  console.error('Error during backfill:', err);
  process.exit(1);
});