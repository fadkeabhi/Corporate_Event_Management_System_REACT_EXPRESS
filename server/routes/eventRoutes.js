const express = require("express");
const { Event } = require("../models/model"); // Adjust path if needed
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

module.exports = router;
