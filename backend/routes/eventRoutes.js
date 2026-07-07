// ─── Import Express Router ──────────────────────────────────────
const express = require("express");
const router = express.Router();

// ─── Import all event controller functions ───────────────────────
const {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getOrganizerEvents,
} = require("../controllers/eventController");

// ─── Import protect middleware ───────────────────────────────────
const protect = require("../middleware/protect");

// ────────────────────────────────────────────────────────────────
// PUBLIC ROUTES — no token needed
// ────────────────────────────────────────────────────────────────

// GET /api/events → list all published events
router.get("/", getAllEvents);

// GET /api/events/organizer/my → list all events owned by organizer
router.get("/organizer/my", protect, getOrganizerEvents);

// GET /api/events/:id → get one event by its MongoDB _id
router.get("/:id", getEventById);

// ────────────────────────────────────────────────────────────────
// PROTECTED ROUTES — must send JWT token in Authorization header
// ────────────────────────────────────────────────────────────────

// POST /api/events → create a new event (must be logged in)
router.post("/", protect, createEvent);

// PUT /api/events/:id → update event (must own the event)
router.put("/:id", protect, updateEvent);

// DELETE /api/events/:id → delete event (must own the event)
router.delete("/:id", protect, deleteEvent);

// ─── Export the router ──────────────────────────────────────────
module.exports = router;
