// ─── Import mongoose ────────────────────────────────────────────
const mongoose = require("mongoose");

// ─── Define the Event Schema ────────────────────────────────────
const eventSchema = new mongoose.Schema(
    {
        // ── Event title (shown on listing page) ───────────────────
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },

        // ── Detailed description of the event ─────────────────────
        description: {
            type: String,
            required: [true, "Event description is required"],
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },

        // ── Physical or online location ────────────────────────────
        location: {
            type: String,
            required: [true, "Event location is required"],
            trim: true,
        },

        // ── When the event starts ──────────────────────────────────
        date: {
            type: Date,
            required: [true, "Event date is required"],
        },

        // ── When doors open (check-in begins) ─────────────────────
        startTime: {
            type: String,   // e.g. "09:00 AM"
            required: [true, "Start time is required"],
        },

        // ── When event ends ────────────────────────────────────────
        endTime: {
            type: String,   // e.g. "06:00 PM"
            required: [true, "End time is required"],
        },

        // ── Maximum number of attendees allowed ───────────────────
        capacity: {
            type: Number,
            required: [true, "Capacity is required"],
            min: [1, "Capacity must be at least 1"],
        },

        // ── Ticket price (0 = free event) ─────────────────────────
        ticketPrice: {
            type: Number,
            default: 0,     // Free by default
            min: [0, "Price cannot be negative"],
        },

        // ── Banner image URL (uploaded to Cloudinary later) ───────
        image: {
            type: String,
            default: "",    // Empty until organizer uploads one
        },

        // ── Event lifecycle status ─────────────────────────────────
        status: {
            type: String,
            enum: ["draft", "published", "cancelled"],
            // draft     = organizer still editing, not visible to public
            // published = live and accepting registrations
            // cancelled = event called off
            default: "draft",
        },

        // ── Category for filtering/searching ──────────────────────
        category: {
            type: String,
            enum: ["technology", "music", "sports", "education", "business", "other"],
            default: "other",
        },

        // ── WHO created this event (links to User model) ──────────
        organizer: {
            type: mongoose.Schema.Types.ObjectId, // Stores MongoDB _id
            ref: "User",    // "User" = the model name in mongoose.model("User", ...)
            required: true, // Every event must have an organizer
        },

        // ── Tags for searching (e.g. ["AI", "Web3", "Startup"]) ───
        tags: {
            type: [String], // Array of strings
            default: [],
        },
    },
    {
        // ── Auto-add createdAt and updatedAt ───────────────────────
        timestamps: true,
    }
);

// ─── Create and export the Model ────────────────────────────────
const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
