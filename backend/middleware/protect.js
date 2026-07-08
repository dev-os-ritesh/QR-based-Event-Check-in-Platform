// ─── Import JWT to verify tokens ────────────────────────────────
const jwt = require("jsonwebtoken");

// ─── Import User model to find user by ID ───────────────────────
const User = require("../models/User");

// ─── protect middleware function ────────────────────────────────
// Every middleware receives: req, res, next
// next() = "I'm done, pass to the next middleware/controller"
const protect = async (req, res, next) => {
    let token;

    // ── Check if Authorization header exists and starts with "Bearer"
    // Header format: Authorization: Bearer <token>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        // ── Extract just the token part (remove "Bearer " prefix) ───
        token = req.headers.authorization.split(" ")[1];
        // "Bearer eyJhbG...".split(" ") → ["Bearer", "eyJhbG..."]
        // [1] → "eyJhbG..."
    }

    // ── If no token found, reject the request ────────────────────
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        // ── Verify the token using our secret key ────────────────────
        // jwt.verify() decodes AND validates the token
        // If token is expired or tampered → it throws an error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // decoded = { id: "abc123", role: "user", iat: 1234, exp: 5678 }
        // iat = issued at (timestamp), exp = expiry (timestamp)

        // ── Find the user in DB using ID from the token ───────────
        // We attach user to req so any controller can access it
        req.user = await User.findById(decoded.id).select("-password");
        // -password → exclude password (same as select: false)

        // ── If user no longer exists (deleted account) ────────────
        if (!req.user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        // ── All good! Move to the next middleware or controller ───
        next();
    } catch (error) {
        // jwt.verify() throws: TokenExpiredError, JsonWebTokenError
        return res.status(401).json({ message: "Not authorized, invalid token" });
    }
};

// ─── Export the middleware ───────────────────────────────────────
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Not authorized - role '${req.user?.role || "guest"}' does not have access to this resource`
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
