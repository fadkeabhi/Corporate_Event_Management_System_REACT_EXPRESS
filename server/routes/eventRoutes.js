const express = require("express");
const { Event, User, Guest  } = require("../models/model"); // Adjust path if needed
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

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

module.exports = router;
