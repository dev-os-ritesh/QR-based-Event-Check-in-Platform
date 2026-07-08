// ─── Import Router ───────────────────────────────────────────────
const express = require("express");
const router = express.Router();

// ─── Import controllers and middleware ───────────────────────────
const { checkInAttendee, getCheckinStats } = require("../controllers/scannerController");
const { protect, restrictTo } = require("../middleware/protect");

// POST /api/scanner/checkin → scan a QR code and check in
router.post("/checkin", protect, restrictTo("organizer", "admin"), checkInAttendee);

// GET /api/scanner/stats/:eventId → live check-in statistics
router.get("/stats/:eventId", protect, restrictTo("organizer", "admin"), getCheckinStats);

// ─── Export ──────────────────────────────────────────────────────
module.exports = router;
