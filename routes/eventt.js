import express from 'express';
import Eventt from '../models/eventt.js';
import College from '../models/college.js';
import EventRegistration from '../models/eventRegistration.js';
const router = express.Router();


router.post('/add-event', async (req, res) => {
    try {
        const {eventName, collegeName, eventDate, eventLocation, postedOn, closeOn} = req.body;

        const newEvent = new Eventt (
            {
                eventName, 
                collegeName, 
                eventDate, 
                eventLocation, 
                postedOn, 
                closeOn
            }
        );
        await newEvent.save();
        res.status(200).json({message:"Event Added Successfully"});
    }
    catch(error) {
        console.log(error.message)
        res.status(500).send("Error adding event");
    }
})

router.post("/addevent", async (req, res) => {
  try {
    const newEvent = new Eventt(req.body);
    await newEvent.save();
    
    // Increment eventsHosted count for the college using collegeCode
    try {
      await College.findOneAndUpdate(
        { collegeCode: req.body.collegeCode },
        { $inc: { eventsHosted: 1 } },
        { new: true }
      );
    } catch (collegeError) {
      console.error('Error updating college events count:', collegeError);
      // Don't fail the event creation if college update fails
    }
    
    res.status(201).json({ 
      message: "Event created successfully",
      success: true,
      event: newEvent
    });
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

router.get('/getevents', async (req, res) => {
    try{
        const events = await Eventt.find();
        res.status(200).json(events);
    }
    catch(error) {
        console.log(error.message)
        res.status(500).send("Error getting events");
    }
})

router.get('/getevents/:code', async (req, res) => {
    try{
        const collegeCode = String(req.params.code.trim());
        const events = await Eventt.find({collegeCode});
        console.log(events);
        res.status(200).json(events);
    }
    catch(error) {
        console.log(error.message)
        res.status(500).send("Error getting specific events");
    }
})

router.get('/getevent/:eventId', async (req, res) => {
    try{
        const eventId = req.params.eventId.trim();
        const event = await Eventt.findOne({ _id: eventId });
        console.log(event);
        res.status(200).json(event);
    }
    catch(error) {
        console.log(error.message)
        res.status(500).send("Error getting specific event");
    }
})



router.get('/getcollege/:code', async (req, res) => {
    try{
        const collegeCode = String(req.params.code.trim()); // Convert to number
        const college = await College.findOne({collegeCode}); 
        // console.log(college)
        res.status(200).json(college);
    }
    catch(error) {
        console.log(error.message)
        res.status(500).send("Error getting specific college");
    }
})


// Event registration /api

router.post('/registerevent', async (req, res) => {    
  try {
    // console.log(req.body);
    
    const registration = new EventRegistration(req.body);
    
    await registration.save();
    res.status(201).json({ message: 'Registration successful', data: registration });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

router.post('/geteventsfromemail', async (req, res) => {
  try {
    const email = req.body.email;
    const data = await EventRegistration.find({ email }); // Ensure you store 'email' during registration
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
})

router.get('/geteventregfromeventid/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId.trim();
    const data = await EventRegistration.find({ eventId: eventId }); 
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
})

// Delete event api

router.post('/deleteRegistration', async (req, res) => {
    console.log("some");
    
  const { eventId, email } = req.body;

  if (!eventId || !email) {
    return res.status(400).json({ error: 'Missing eventId or email' });
  }

  try {
    const result = await EventRegistration.findOneAndDelete({ eventId, email });

    if (!result) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/stats', async (req, res) => {
  try {
    const { email } = req.body;

    // Total events hosted by user
    const totalEvents = await Eventt.countDocuments({ email });
    const userEvents = await Eventt.find({ email });
    const eventIds = userEvents.map(e => e._id.toString());

    // Total registrations for user's events
    const totalRegistrations = await EventRegistration.countDocuments({ eventId: { $in: eventIds } });

    // Upcoming events
    const upcomingEvents = await Eventt.countDocuments({ email, eventDate: { $gt: new Date() } });

    // Total colleges
    const totalColleges = await College.countDocuments();

    // Top 5 events by registrations (only existing events)
    const topEventsAgg = await EventRegistration.aggregate([
      { $match: { eventId: { $in: userEvents.map(e => e._id) } } },
      { $group: { _id: "$eventId", registrations: { $sum: 1 } } },
      { $lookup: {
          from: "eventts", // collection name in MongoDB (usually plural, lowercase)
          localField: "_id",
          foreignField: "_id",
          as: "eventInfo"
        }
      },
      { $unwind: "$eventInfo" }, // Only keep if event still exists
      { $project: { eventName: "$eventInfo.eventName", registrations: 1 } },
      { $sort: { registrations: -1 } },
      { $limit: 5 }
    ]);

    // Average registrations per event
    const avgRegistrations = totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(2) : 0;

    // 5 most recent events
    const recentEvents = await Eventt.find({ email })
      .sort({ eventDate: -1 })
      .limit(5)
      .select('eventName eventDate');

    // Event type distribution (using eventTags)
    const eventTypeDistribution = await Eventt.aggregate([
      { $match: { email } },
      { $unwind: "$eventTags" },
      { $group: { _id: "$eventTags", count: { $sum: 1 } } },
      { $project: { _id: 0, type: "$_id", count: 1 } }
    ]);

    // Previous period stats (previous week)
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    const prevEvents = await Eventt.countDocuments({ email, eventDate: { $lt: lastWeek } });
    const prevRegistrations = await EventRegistration.countDocuments({ eventId: { $in: eventIds }, createdAt: { $lt: lastWeek } });

    res.status(200).json({
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      totalColleges,
      topEvents: topEventsAgg,
      avgRegistrations,
      recentEvents,
      eventTypeDistribution,
      previousStats: {
        events: prevEvents,
        registrations: prevRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
}); 

router.post('/checkregistered', async (req, res) => {
  const { email, eventId } = req.body;

  if (!email || !eventId) {
    return res.status(400).json({ registered: false, message: "Missing email or eventId" });
  }

  try {
    const registration = await EventRegistration.findOne({ email, eventId });
    if (registration) {
      return res.status(200).json({ registered: true });
    } else {
      return res.status(200).json({ registered: false });
    }
  } catch (err) {
    console.error("Error checking registration:", err);
    return res.status(500).json({ registered: false, message: "Server error" });
  }
});

// Update event by ID
router.put('/updateevent/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const update = req.body;
    const updatedEvent = await Eventt.findByIdAndUpdate(eventId, update, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event by ID
router.delete('/deleteevent/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const deletedEvent = await Eventt.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Decrement eventsHosted count for the college using collegeCode
    try {
      await College.findOneAndUpdate(
        { collegeCode: deletedEvent.collegeCode },
        { $inc: { eventsHosted: -1 } },
        { new: true }
      );
    } catch (collegeError) {
      console.error('Error updating college events count:', collegeError);
      // Don't fail the event deletion if college update fails
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get registration count for an event
router.get('/registrations/count/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId.trim();
    const count = await EventRegistration.countDocuments({ eventId });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching registration count' });
  }
});

export default router;