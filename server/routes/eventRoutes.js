const express = require("express");
const { Event, User, Guest  } = require("../models/model"); // Adjust path if needed
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: -1 })
      .populate("attendees guests createdBy");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Create a new event (Any authenticated user)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description, date, venue, agenda, speakers, capacity } = req.body;

    if (!title || !date || !venue || !capacity) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      venue,
      agenda,
      speakers,
      capacity,
      createdBy: req.user.id, // Authenticated user
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });

  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
});

// Search Users
router.get("/search-users", authMiddleware, async (req, res) => {
  try {
      const { query } = req.query;
      if (!query) {
          return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const users = await User.find({
          $or: [
              { name: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
          ],
      }).select("name email").limit(10);

      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: "Error searching users", error });
  }
});

// Get event by ID
router.get("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate("createdBy", "name email")
      .populate("attendees", "name email")
      .populate("guests", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error });
  }
});


// Edit an event (Only creator can edit)
router.put("/edit/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id; // Logged-in user

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own events" });
    }

    const { title, description, date, venue, agenda, speakers, capacity, attendees, guests } = req.body;

    // Update fields if provided
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.venue = venue || event.venue;
    event.agenda = agenda || event.agenda;
    event.capacity = capacity || event.capacity;
    event.speakers = speakers || event.speakers;

    await event.save();
    res.status(200).json({ message: "Event updated successfully", event });

  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
});

// Add attendee to event
router.post("/:eventId/add-attendee", authMiddleware, async (req, res) => {
    try {
      const { eventId } = req.params;
      const { email } = req.body;
      const userId = req.user.id;
  
      // Find the event
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
  
      // Only the event creator can add attendees
      if (event.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "You are not allowed to add attendees" });
      }
  
      // Find user by email
      const attendee = await User.findOne({ email });
      if (!attendee) return res.status(404).json({ message: "User not found" });
  
      // Check if attendee is already added
      if (event.attendees.includes(attendee._id)) {
        return res.status(400).json({ message: "Attendee already added" });
      }
  
      // Check if event is full
      if (event.attendees.length >= event.capacity) {
        return res.status(400).json({ message: "Event is full" });
      }
  
      // Add attendee
      event.attendees.push(attendee._id);
      await event.save();
  
      res.status(200).json({ message: "Attendee added successfully", user: attendee });
  
    } catch (error) {
      res.status(500).json({ message: "Error adding attendee", error });
    }
  });
  
  // Remove attendee from event
  router.delete("/:eventId/remove-attendee/:userId", authMiddleware, async (req, res) => {
    try {
      const { eventId, userId } = req.params;
      const loggedInUserId = req.user.id;
  
      // Find the event
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
  
      // Only the event creator can remove attendees
      if (event.createdBy.toString() !== loggedInUserId) {
        return res.status(403).json({ message: "You are not allowed to remove attendees" });
      }
  
      // Remove attendee
      event.attendees = event.attendees.filter(attendeeId => attendeeId.toString() !== userId);
      await event.save();
  
      res.status(200).json({ message: "Attendee removed successfully" });
  
    } catch (error) {
      res.status(500).json({ message: "Error removing attendee", error });
    }
  });


// Add Guest
router.post("/:eventId/add-guest", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const { eventId } = req.params;
    const userId = req.user.id;

    // Ensure event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Create and save guest
    const guest = new Guest({ name, email, event: eventId, invitedBy: userId });
    await guest.save();

    // Add guest to event
    event.guests.push(guest._id);
    await event.save();

    res.status(201).json({ message: "Guest added", guest });
  } catch (error) {
    res.status(500).json({ message: "Error adding guest", error });
  }
});

// Remove Guest
router.delete("/:eventId/remove-guest/:guestId", authMiddleware, async (req, res) => {
  try {
    const { eventId, guestId } = req.params;

    // Ensure event and guest exist
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const guest = await Guest.findById(guestId);
    if (!guest) return res.status(404).json({ message: "Guest not found" });

    // Remove guest from event
    event.guests = event.guests.filter((id) => id.toString() !== guestId);
    await event.save();

    // Delete guest
    await Guest.findByIdAndDelete(guestId);

    res.json({ message: "Guest removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing guest", error });
  }
});




module.exports = router;
