// ─── Imports ────────────────────────────────────────────────────
const Registration = require("../models/Registration");
const Event = require("../models/Event");

// ════════════════════════════════════════════════════════════════
// @desc    Scan a QR code and check in an attendee
// @route   POST /api/scanner/checkin
// @access  Private (organizer only)
// ════════════════════════════════════════════════════════════════
const checkInAttendee = async (req, res) => {
    try {
        // ── Get the scanned QR string and event ID from the request ──
        const { qrCode, eventId } = req.body;
        // qrCode  → the UUID string read by the phone camera
        // eventId → which event this scanner is checking in for

        // ── Validate input ────────────────────────────────────────────
        if (!qrCode || !eventId) {
            return res.status(400).json({
                message: "QR code and event ID are required",
            });
        }

        // ── Step 1: Find the registration by QR code ──────────────────
        const registration = await Registration.findOne({ qrCode })
            .populate("user", "name email avatar")  // get attendee details
            .populate("event", "title date location"); // get event details

        // ── Step 2: QR code doesn't exist in DB ───────────────────────
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "❌ Invalid QR Code — not found",
            });
        }

        // ── Step 3: Check if QR belongs to THIS event ─────────────────
        // Prevents using a valid QR from Event A to enter Event B!
        if (registration.event._id.toString() !== eventId) {
            return res.status(400).json({
                success: false,
                message: "❌ This ticket is for a different event",
            });
        }

        // ── Step 4: Verify the organizer owns this event ──────────────
        const event = await Event.findById(eventId);
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized to scan for this event",
            });
        }

        // ── Step 5: Check if already checked in ──────────────────────
        if (registration.checkedIn) {
            // Return the original check-in time so staff knows when
            const checkedInTime = registration.checkedInAt.toLocaleTimeString("en-IN", {
                hour: "2-digit", minute: "2-digit",
            });
            return res.status(400).json({
                success: false,
                alreadyCheckedIn: true,           // flag for frontend to show warning
                message: `⚠️ Already checked in at ${checkedInTime}`,
                data: {
                    name: registration.user.name,
                    ticketNumber: registration.ticketNumber,
                    checkedInAt: registration.checkedInAt,
                },
            });
        }

        // ── Step 6: Check if registration is cancelled ────────────────
        if (registration.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "❌ This ticket has been cancelled",
            });
        }

        // ── Step 7: All checks passed — perform the check-in! ─────────
        // findByIdAndUpdate with atomic update for safety
        const updatedRegistration = await Registration.findByIdAndUpdate(
            registration._id,
            {
                checkedIn: true,           // mark as checked in
                checkedInAt: new Date(),   // record exact timestamp
                status: "attended",        // update status lifecycle
            },
            { returnDocument: "after" }  // return updated document
        ).populate("user", "name email avatar");

        // ── Step 8: Send success response ────────────────────────────
        res.status(200).json({
            success: true,
            message: `✅ Welcome, ${updatedRegistration.user.name}!`,
            data: {
                name: updatedRegistration.user.name,
                email: updatedRegistration.user.email,
                avatar: updatedRegistration.user.avatar,
                ticketNumber: updatedRegistration.ticketNumber,
                checkedInAt: updatedRegistration.checkedInAt,
                eventTitle: registration.event.title,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get live check-in stats for an event
// @route   GET /api/scanner/stats/:eventId
// @access  Private (organizer only)
// ════════════════════════════════════════════════════════════════
const getCheckinStats = async (req, res) => {
    try {
        const { eventId } = req.params;

        // ── Verify organizer owns this event ─────────────────────────
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // ── Count different registration states ───────────────────────
        // MongoDB countDocuments is much faster than fetching all docs
        const totalRegistered = await Registration.countDocuments({
            event: eventId,
            status: { $ne: "cancelled" },  // exclude cancelled
        });

        const totalCheckedIn = await Registration.countDocuments({
            event: eventId,
            checkedIn: true,
        });

        const totalCancelled = await Registration.countDocuments({
            event: eventId,
            status: "cancelled",
        });

        // ── Calculate derived stats ───────────────────────────────────
        const notYetArrived = totalRegistered - totalCheckedIn;
        const checkInPercentage = totalRegistered > 0
            ? Math.round((totalCheckedIn / totalRegistered) * 100)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                eventTitle: event.title,
                capacity: event.capacity,
                totalRegistered,    // people who signed up
                totalCheckedIn,     // people who arrived
                notYetArrived,      // registered but not arrived yet
                totalCancelled,     // cancelled registrations
                checkInPercentage,  // e.g. 73 (means 73% have checked in)
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Export ──────────────────────────────────────────────────────
module.exports = { checkInAttendee, getCheckinStats };
