const express = require("express");
const router = express.Router();
const { getEventAnalytics, getOrganizerDashboard } = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../middleware/protect");

// GET /api/analytics/dashboard → organizer's overview
router.get("/dashboard", protect, restrictTo("organizer", "admin"), getOrganizerDashboard);

// GET /api/analytics/event/:eventId → single event deep dive
router.get("/event/:eventId", protect, restrictTo("organizer", "admin"), getEventAnalytics);

module.exports = router;
