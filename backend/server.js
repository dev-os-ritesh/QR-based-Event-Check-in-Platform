// ─── Importing required packages ────────────────────────────────
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const scannerRoutes = require("./routes/scannerRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes")

// ─── NEW: Import auth routes ─────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");


// ─── Load environment variables ─────────────────────────────────
dotenv.config();

// ─── Connect to MongoDB ──────────────────────────────────────────
connectDB();

// ─── Create the Express application ─────────────────────────────
const app = express();

// ─── Middleware Setup ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use("/api/scanner", scannerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/registrations", registrationRoutes);

// ─── Root test route ─────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "QR Event Check-In API is running 🚀" });
});

// ─── NEW: Mount auth routes ──────────────────────────────────────
// All routes in authRoutes will be prefixed with /api/auth
// So: router.post("/register") → becomes → POST /api/auth/register
// So: router.post("/login")    → becomes → POST /api/auth/login
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// ─── Define PORT & Start Server ──────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
