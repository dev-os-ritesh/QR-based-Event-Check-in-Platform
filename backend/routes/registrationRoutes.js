// ─── Import Express Router ──────────────────────────────────────
const express = require("express");
const router = express.Router();

// ─── Import controller functions ────────────────────────────────
const {
    registerForEvent,
    getMyRegistrations,
    getEventRegistrations,
    getQRCode,
    downloadTicketPDF,
    cancelRegistration,
} = require("../controllers/registrationController");

// ─── Import protect middleware ───────────────────────────────────
const protect = require("../middleware/protect");

// ── All registration routes require login (all protected) ────────

// POST /api/registrations/:eventId → register for a specific event
router.post("/:eventId", protect, registerForEvent);

// GET /api/registrations/my → get all MY registrations (as attendee)
router.get("/my", protect, getMyRegistrations);

// GET /api/registrations/event/:eventId → all registrations for an event (organizer)
router.get("/event/:eventId", protect, getEventRegistrations);

// GET /api/registrations/:registrationId/qr → get QR code for this ticket
router.get("/:registrationId/qr", protect, getQRCode);

// GET /api/registrations/:registrationId/ticket → download PDF ticket
router.get("/:registrationId/ticket", protect, downloadTicketPDF);

// PUT /api/registrations/:registrationId/cancel → cancel a registration (attendee)
router.put("/:registrationId/cancel", protect, cancelRegistration);

// ─── Export the router ──────────────────────────────────────────
module.exports = router;
