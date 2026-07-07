// ─── Imports ────────────────────────────────────────────────────
const Registration = require("../models/Registration");
const Event = require("../models/Event");
// ── Add this import at the top of registrationController.js ─────
const sendTicketEmail = require("../utils/sendEmail");
const generateQRCode = require("../utils/generateQR");
const generateTicketPDF = require("../utils/generatePDF");



// ─── Import uuid to generate unique QR code strings ─────────────
const { v4: uuidv4 } = require("uuid");
// v4 = version 4 UUID = randomly generated
// We rename it to uuidv4 for clarity
// uuidv4() → "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"

// ════════════════════════════════════════════════════════════════
// @desc    Register current user for an event
// @route   POST /api/registrations/:eventId
// @access  Private (must be logged in)
// ════════════════════════════════════════════════════════════════
const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.params; // the event ID from the URL

        // ── Step 1: Find the event ───────────────────────────────────
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // ── Step 2: Check if the event is published ──────────────────
        if (event.status !== "published") {
            return res.status(400).json({ message: "Event is not open for registration" });
        }

        // ── Step 3: Check capacity ───────────────────────────────────
        // Count how many registrations already exist for this event
        const registrationCount = await Registration.countDocuments({
            event: eventId,
            status: { $ne: "cancelled" }, // don't count cancelled registrations
            // $ne = "not equal" — MongoDB query operator
        });

        if (registrationCount >= event.capacity) {
            return res.status(400).json({ message: "Event is fully booked" });
        }

        // ── Step 4: Check if user already registered ─────────────────
        const existingRegistration = await Registration.findOne({
            user: req.user._id,
            event: eventId,
        });

        if (existingRegistration) {
            return res.status(400).json({ message: "You are already registered for this event" });
        }

        // ── Step 5: Generate unique QR code string ───────────────────
        const qrCode = uuidv4();
        // Example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
        // This unique string is what gets encoded into the QR image

        // ── Step 6: Generate human-readable ticket number ────────────
        // Format: TKT-XXXXXX (6 random uppercase alphanumeric characters)
        const ticketNumber = "TKT-" + Math.random().toString(36)
            .substring(2, 8)
            .toUpperCase();
        // Math.random() → 0.4fzyo82mvyr
        // .toString(36)  → converts to base36 (0-9, a-z)
        // .substring(2,8)→ takes 6 characters
        // .toUpperCase() → "4FZYO8"
        // Result: "TKT-4FZYO8"

        // ── Step 7: Create the registration document ─────────────────
        const registration = await Registration.create({
            user: req.user._id,    // from JWT via protect middleware
            event: eventId,
            qrCode,                // the UUID string
            ticketNumber,          // TKT-XXXXXX
        });
        // ── Step 8: Generate QR image and send confirmation email ────────
        try {
            // Generate the QR code image from the UUID string
            const qrImage = await generateQRCode(registration.qrCode);

            // Send the ticket email (we wrap in try/catch so email failure
            // doesn't break the registration — user is already registered)
            await sendTicketEmail({
                toEmail: req.user.email,
                userName: req.user.name,
                eventTitle: event.title,
                eventDate: event.date,
                eventLocation: event.location,
                startTime: event.startTime,
                ticketNumber,
                qrImage,              // base64 PNG embedded in email
                qrCode: registration.qrCode, // unique UUID string
            });
        } catch (emailError) {
            // Log the error but DON'T fail the request
            // User is registered successfully — email is just a bonus
            console.error("Email sending failed:", emailError.message);
        }


        // ── Step 8: Populate user and event details for response ─────
        const populatedRegistration = await Registration.findById(registration._id)
            .populate("user", "name email")
            .populate("event", "title date location startTime");

        res.status(201).json({
            success: true,
            message: "Successfully registered!",
            data: populatedRegistration,
        });
    } catch (error) {
        // ── Handle duplicate registration (compound index violation) ──
        // MongoDB error code 11000 = duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: "You are already registered for this event" });
        }
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get all registrations for the logged-in user
// @route   GET /api/registrations/my
// @access  Private
// ════════════════════════════════════════════════════════════════
const getMyRegistrations = async (req, res) => {
    try {
        // ── Find all registrations belonging to this user ─────────
        const registrations = await Registration.find({ user: req.user._id })
            .populate("event", "title date location image status") // get event details
            .sort({ createdAt: -1 }); // newest first

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get all registrations for an event (organizer view)
// @route   GET /api/registrations/event/:eventId
// @access  Private (organizer only)
// ════════════════════════════════════════════════════════════════
const getEventRegistrations = async (req, res) => {
    try {
        // ── First verify the requester owns this event ────────────
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // ── Get all registrations for this event ──────────────────
        const registrations = await Registration.find({
            event: req.params.eventId,
        }).populate("user", "name email avatar");

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get QR code image for a specific registration
// @route   GET /api/registrations/:registrationId/qr
// @access  Private (only the owner of this registration)
// ════════════════════════════════════════════════════════════════
const getQRCode = async (req, res) => {
    try {
        // ── Find the registration by its ID ──────────────────────────
        const registration = await Registration.findById(req.params.registrationId);
        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }
        // ── Ensure only the ticket owner can see their QR code ───────
        if (registration.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // ── Check registration is still valid ────────────────────────
        if (registration.status === "cancelled") {
            return res.status(400).json({ message: "This registration has been cancelled" });
        }
        // ── Generate QR code from the stored UUID string ──────────────
        const qrImage = await generateQRCode(registration.qrCode);
        // qrImage = "data:image/png;base64,iVBORw0KGgoAAAANS..."
        // ── Return the QR image + registration details ────────────────
        res.status(200).json({
            success: true,
            data: {
                qrImage,                           // base64 image for <img> tag
                ticketNumber: registration.ticketNumber,
                status: registration.status,
                checkedIn: registration.checkedIn,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Download ticket as a PDF document
// @route   GET /api/registrations/:registrationId/ticket
// @access  Private (only the owner of this registration)
// ════════════════════════════════════════════════════════════════
const downloadTicketPDF = async (req, res) => {
    try {
        // ── Find registration and populate details ───────────────────
        const registration = await Registration.findById(req.params.registrationId)
            .populate("user", "name email")
            .populate("event", "title date location startTime");

        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        // ── Check Ownership ──────────────────────────────────────────
        if (registration.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to download this ticket" });
        }

        // ── Generate QR Code image url ───────────────────────────────
        const qrImage = await generateQRCode(registration.qrCode);

        // ── Set response headers for file download ───────────────────
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=ticket-${registration.ticketNumber}.pdf`
        );

        // ── Generate the PDF and pipe it directly to res ─────────────
        const doc = generateTicketPDF(registration, qrImage);
        doc.pipe(res); // Express response acts as write destination
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Cancel a registration (attendee)
// @route   PUT /api/registrations/:registrationId/cancel
// @access  Private
// ════════════════════════════════════════════════════════════════
const cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.registrationId);
        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        // Ensure user owns this registration
        if (registration.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to cancel this ticket" });
        }

        if (registration.status === "cancelled") {
            return res.status(400).json({ message: "Registration is already cancelled" });
        }

        if (registration.checkedIn) {
            return res.status(400).json({ message: "Cannot cancel a ticket that has already been checked in" });
        }

        registration.status = "cancelled";
        await registration.save();

        res.status(200).json({ 
            success: true, 
            message: "Registration cancelled successfully", 
            data: registration 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Export all functions ────────────────────────────────────────
module.exports = { registerForEvent, getMyRegistrations, getEventRegistrations, getQRCode, downloadTicketPDF, cancelRegistration };
