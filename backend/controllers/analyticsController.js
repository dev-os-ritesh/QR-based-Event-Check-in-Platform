// ─── Imports ────────────────────────────────────────────────────
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const mongoose = require("mongoose");

// ════════════════════════════════════════════════════════════════
// @desc    Full analytics for a single event
// @route   GET /api/analytics/event/:eventId
// @access  Private (organizer only)
// ════════════════════════════════════════════════════════════════
const getEventAnalytics = async (req, res) => {
    try {
        const eventId = new mongoose.Types.ObjectId(req.params.eventId);
        // Convert string ID to MongoDB ObjectId — required for aggregation

        // ── Verify organizer owns this event ─────────────────────────
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // ── Query 1: Basic counts (fast — uses countDocuments) ────────
        const [totalRegistered, totalCheckedIn, totalCancelled] = await Promise.all([
            // Promise.all runs all 3 queries IN PARALLEL — much faster than sequential
            Registration.countDocuments({ event: eventId, status: { $ne: "cancelled" } }),
            Registration.countDocuments({ event: eventId, checkedIn: true }),
            Registration.countDocuments({ event: eventId, status: "cancelled" }),
        ]);

        // ── Query 2: Registrations per day (aggregation pipeline) ─────
        const registrationsByDay = await Registration.aggregate([
            // Stage 1: Only look at registrations for THIS event
            { $match: { event: eventId } },

            // Stage 2: Group by date, count each day's registrations
            {
                $group: {
                    _id: {
                        // $dateToString converts Date → "2025-12-01" string
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }, // $sum: 1 = count each document as 1
                }
            },

            // Stage 3: Sort by date ascending (oldest first)
            { $sort: { _id: 1 } },

            // Stage 4: Rename fields for cleaner output
            { $project: { date: "$_id", count: 1, _id: 0 } },
        ]);

        // ── Query 3: Check-in timeline (when did people arrive?) ──────
        const checkinTimeline = await Registration.aggregate([
            // Only checked-in registrations for this event
            { $match: { event: eventId, checkedIn: true } },

            // Group by hour of check-in
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%H:00", date: "$checkedInAt" }
                        // "%H:00" → "09:00", "10:00", "14:00"
                    },
                    count: { $sum: 1 },
                }
            },
            { $sort: { _id: 1 } },
            { $project: { hour: "$_id", count: 1, _id: 0 } },
        ]);

        // ── Calculate derived metrics ─────────────────────────────────
        const checkInRate = totalRegistered > 0
            ? Math.round((totalCheckedIn / totalRegistered) * 100)
            : 0;

        const capacityUsed = event.capacity > 0
            ? Math.round((totalRegistered / event.capacity) * 100)
            : 0;

        const estimatedRevenue = totalRegistered * event.ticketPrice;

        // ── Send complete analytics object ────────────────────────────
        res.status(200).json({
            success: true,
            data: {
                // Event info
                event: {
                    title: event.title,
                    date: event.date,
                    capacity: event.capacity,
                    ticketPrice: event.ticketPrice,
                    status: event.status,
                },
                // Key metrics
                metrics: {
                    totalRegistered,
                    totalCheckedIn,
                    totalCancelled,
                    notYetArrived: totalRegistered - totalCheckedIn,
                    checkInRate,         // e.g. 73 (percent)
                    capacityUsed,        // e.g. 85 (percent of capacity filled)
                    estimatedRevenue,    // totalRegistered × ticketPrice
                },
                // Chart data for frontend graphs
                charts: {
                    registrationsByDay,  // [{ date: "2025-12-01", count: 5 }, ...]
                    checkinTimeline,     // [{ hour: "09:00", count: 12 }, ...]
                },
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Organizer's overall dashboard stats (all their events)
// @route   GET /api/analytics/dashboard
// @access  Private (organizer)
// ════════════════════════════════════════════════════════════════
const getOrganizerDashboard = async (req, res) => {
    try {
        const organizerId = new mongoose.Types.ObjectId(req.user._id);

        // ── Get all events by this organizer ──────────────────────────
        const events = await Event.find({ organizer: organizerId });
        const eventIds = events.map(e => e._id); // extract IDs for registration queries

        // ── Run all dashboard queries in parallel ─────────────────────
        const [totalEvents, totalRegistrations, totalCheckins, eventsByCategory] =
            await Promise.all([

                // Count their events by status
                Event.aggregate([
                    { $match: { organizer: organizerId } },
                    { $group: { _id: "$status", count: { $sum: 1 } } },
                ]),

                // Total registrations across all their events
                Registration.countDocuments({
                    event: { $in: eventIds },   // $in = event is in this array of IDs
                    status: { $ne: "cancelled" },
                }),

                // Total check-ins across all their events
                Registration.countDocuments({
                    event: { $in: eventIds },
                    checkedIn: true,
                }),

                // Events grouped by category
                Event.aggregate([
                    { $match: { organizer: organizerId } },
                    { $group: { _id: "$category", count: { $sum: 1 } } },
                    { $project: { category: "$_id", count: 1, _id: 0 } },
                ]),
            ]);

        // ── Format event counts by status ─────────────────────────────
        const eventCounts = { draft: 0, published: 0, cancelled: 0 };
        totalEvents.forEach(item => {
            eventCounts[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            data: {
                eventCounts,          // { draft: 2, published: 5, cancelled: 1 }
                totalRegistrations,   // 342
                totalCheckins,        // 287
                overallCheckInRate: totalRegistrations > 0
                    ? Math.round((totalCheckins / totalRegistrations) * 100) : 0,
                eventsByCategory,     // [{ category: "technology", count: 3 }, ...]
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Export ──────────────────────────────────────────────────────
module.exports = { getEventAnalytics, getOrganizerDashboard };
