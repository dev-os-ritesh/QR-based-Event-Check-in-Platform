// ─── Import Router ───────────────────────────────────────────────
const express = require("express");
const router = express.Router();

// ─── Import controllers and middleware ───────────────────────────
const { checkInAttendee, getCheckinStats } = require("../controllers/scannerController");
const protect = require("../middleware/protect");

// POST /api/scanner/checkin → scan a QR code and check in
router.post("/checkin", protect, checkInAttendee);

// GET /api/scanner/stats/:eventId → live check-in statistics
router.get("/stats/:eventId", protect, getCheckinStats);

// ─── Export ──────────────────────────────────────────────────────
module.exports = router;
