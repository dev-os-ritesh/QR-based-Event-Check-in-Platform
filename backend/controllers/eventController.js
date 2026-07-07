// ─── Import Event model ──────────────────────────────────────────
const Event = require("../models/Event");

// ════════════════════════════════════════════════════════════════
// @desc    Create a new event
// @route   POST /api/events
// @access  Private (organizer only — requires token)
// ════════════════════════════════════════════════════════════════
const createEvent = async (req, res) => {
    try {
        // ── Destructure all event fields from request body ───────────
        const { title, description, location, date, startTime,
            endTime, capacity, ticketPrice, category, tags, status } = req.body;

        // ── Create the event, attaching the logged-in user as organizer
        // req.user is set by our protect middleware after verifying JWT
        const event = await Event.create({
            title, description, location, date,
            startTime, endTime, capacity, ticketPrice,
            category, tags, status,
            organizer: req.user._id, // ← automatically set from JWT token
        });

        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get all PUBLISHED events (public listing page)
// @route   GET /api/events
// @access  Public
// ════════════════════════════════════════════════════════════════
const getAllEvents = async (req, res) => {
    try {
        // ── Only show published events to the public ─────────────────
        // req.query.category → optional filter: /api/events?category=music
        const filter = { status: "published" };

        // ── If category query param exists, add it to the filter ─────
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // ── Fetch events, newest first, with organizer name populated ─
        const events = await Event.find(filter)
            .populate("organizer", "name email") // replace ObjectId with name+email
            .sort({ date: 1 });                  // sort ascending by date (soonest first)

        res.status(200).json({
            success: true,
            count: events.length,  // total results
            data: events,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
// ════════════════════════════════════════════════════════════════
const getEventById = async (req, res) => {
    try {
        // ── req.params.id → the :id from the URL ─────────────────────
        const event = await Event.findById(req.params.id)
            .populate("organizer", "name email avatar");

        // ── If no event found with that ID ───────────────────────────
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (only the organizer who created it)
// ════════════════════════════════════════════════════════════════
const updateEvent = async (req, res) => {
    try {
        // ── Find the event first ──────────────────────────────────────
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // ── OWNERSHIP CHECK: does this user own this event? ───────────
        // event.organizer = ObjectId stored in DB
        // req.user._id    = ObjectId from the JWT token
        // .toString() converts ObjectId to string for comparison
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized — you can only edit your own events",
            });
            // 403 = Forbidden (authenticated but not permitted)
        }

        // ── Update only the fields sent in req.body ───────────────────
        // { returnDocument: "after" } → return the UPDATED document
        // Mongoose v9 prefers "after"/"before" over deprecated { new: true }
        // { runValidators: true } → re-run schema validators on update
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after", runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (only the organizer who created it)
// ════════════════════════════════════════════════════════════════
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // ── Same ownership check as updateEvent ───────────────────────
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized — you can only delete your own events",
            });
        }

        // ── Delete the event from DB ──────────────────────────────────
        await event.deleteOne();

        res.status(200).json({ success: true, message: "Event deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get all events created by the logged-in organizer
// @route   GET /api/events/organizer/my
// @access  Private (organizer only)
// ════════════════════════════════════════════════════════════════
const getOrganizerEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id })
            .sort({ date: 1 });
        res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Export all controller functions ────────────────────────────
module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getOrganizerEvents };
