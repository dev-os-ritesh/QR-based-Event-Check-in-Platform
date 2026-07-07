// ─── Import Express Router ──────────────────────────────────────
const express = require("express");

// ─── Create a router instance ───────────────────────────────────
// Router is like a mini Express app — just for these routes
const router = express.Router();

// ─── Import controller functions ────────────────────────────────
const { register, login } = require("../controllers/authController");

// ─── Define Routes ──────────────────────────────────────────────
// router.post(path, controllerFunction)

// POST /api/auth/register → calls register() from authController
router.post("/register", register);

// POST /api/auth/login → calls login() from authController
router.post("/login", login);

// ─── Export the router ──────────────────────────────────────────
module.exports = router;
