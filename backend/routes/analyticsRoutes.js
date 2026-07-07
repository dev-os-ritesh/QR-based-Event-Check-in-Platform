const express = require("express");
const router = express.Router();
const { getEventAnalytics, getOrganizerDashboard } = require("../controllers/analyticsController");
const protect = require("../middleware/protect");

// GET /api/analytics/dashboard → organizer's overview
router.get("/dashboard", protect, getOrganizerDashboard);

// GET /api/analytics/event/:eventId → single event deep dive
router.get("/event/:eventId", protect, getEventAnalytics);

module.exports = router;
