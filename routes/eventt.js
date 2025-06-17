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
    res.status(201).json({ message: "Event created successfully" });
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

router.get('/getcolleges', async (req, res) => {
    try{
        const colleges = await College.find();
        res.status(200).json(colleges);
    }
    catch(error) {
        console.log(error.message)
        res.status(500).send("Error getting colleges");
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

    const totalEvents = await Eventt.countDocuments({ email });

    const userEvents = await Eventt.find({ email });
    const eventIds = userEvents.map(e => e._id.toString());

    const totalRegistrations = await EventRegistration.countDocuments({
      eventId: { $in: eventIds },
    });

    const upcomingEvents = await Eventt.countDocuments({
      email,
      eventDate: { $gt: new Date() }
    });

    const totalColleges = await College.countDocuments();

    res.status(200).json({
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      totalColleges
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




export default router;