// ─── Import jsonwebtoken library ────────────────────────────────
const jwt = require("jsonwebtoken");

// ─── Function to generate a signed JWT token ────────────────────
const generateToken = (id, role) => {
    // jwt.sign(payload, secret, options)
    // payload  → data embedded inside the token (never put passwords here!)
    // secret   → private key to sign the token (from .env)
    // expiresIn → token becomes invalid after this duration
    return jwt.sign(
        { id, role },              // Payload: user's ID and role
        process.env.JWT_SECRET,    // Secret from .env
        { expiresIn: process.env.JWT_EXPIRE } // e.g. "7d"
    );
};

// ─── Export the function ─────────────────────────────────────────
module.exports = generateToken;
