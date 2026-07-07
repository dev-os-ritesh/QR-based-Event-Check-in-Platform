// ─── Import mongoose ────────────────────────────────────────────
const mongoose = require("mongoose");

// ─── Define the Registration Schema ─────────────────────────────
const registrationSchema = new mongoose.Schema(
    {
        // ── Which user registered ─────────────────────────────────
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",          // Links to Users collection
            required: true,
        },

        // ── Which event they registered for ───────────────────────
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",         // Links to Events collection
            required: true,
        },

        // ── Unique QR code string (generated on registration) ─────
        // Will be a UUID or random string — scanner reads this
        qrCode: {
            type: String,
            unique: true,         // No two registrations can share a QR
            required: true,
        },

        // ── Current status of this registration ───────────────────
        status: {
            type: String,
            enum: ["registered", "attended", "cancelled"],
            default: "registered",
        },

        // ── Has this person physically checked in at the venue? ───
        checkedIn: {
            type: Boolean,
            default: false,       // false until QR is scanned
        },

        // ── When they checked in (useful for analytics) ───────────
        checkedInAt: {
            type: Date,
            default: null,        // null until check-in happens
        },

        // ── Ticket number (human-readable, e.g. TKT-00042) ────────
        ticketNumber: {
            type: String,
            unique: true,
            required: true,
        },
    },
    {
        // ── Auto-add createdAt (= registration date) ───────────────
        timestamps: true,
    }
);

// ─── Compound Index: prevent duplicate registrations ────────────
// A user should NOT be able to register for the same event twice
// This creates a unique index on the COMBINATION of user + event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });
// { user: "abc", event: "xyz" } → can only exist ONCE in the collection

// ─── Create and export the Model ────────────────────────────────
const Registration = mongoose.model("Registration", registrationSchema);
module.exports = Registration;
