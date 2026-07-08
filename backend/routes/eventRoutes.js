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

// ─── Import protect & restrictTo middleware ──────────────────────
const { protect, restrictTo } = require("../middleware/protect");

// ────────────────────────────────────────────────────────────────
// PUBLIC ROUTES — no token needed
// ────────────────────────────────────────────────────────────────

// GET /api/events → list all published events
router.get("/", getAllEvents);

// GET /api/events/organizer/my → list all events owned by organizer
router.get("/organizer/my", protect, restrictTo("organizer", "admin"), getOrganizerEvents);

// GET /api/events/:id → get one event by its MongoDB _id
router.get("/:id", getEventById);

// ────────────────────────────────────────────────────────────────
// PROTECTED ROUTES — must send JWT token in Authorization header
// ────────────────────────────────────────────────────────────────

// POST /api/events → create a new event (must be logged in as organizer)
router.post("/", protect, restrictTo("organizer", "admin"), createEvent);

// PUT /api/events/:id → update event (must own the event)
router.put("/:id", protect, restrictTo("organizer", "admin"), updateEvent);

// DELETE /api/events/:id → delete event (must own the event)
router.delete("/:id", protect, restrictTo("organizer", "admin"), deleteEvent);

// ─── Export the router ──────────────────────────────────────────
module.exports = router;
