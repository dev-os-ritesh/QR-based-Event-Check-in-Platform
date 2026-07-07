// ─── Import User model (our DB blueprint) ───────────────────────
const User = require("../models/User");

// ─── Import our JWT generator helper ────────────────────────────
const generateToken = require("../utils/generateToken");

// ════════════════════════════════════════════════════════════════
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (anyone can call this)
// ════════════════════════════════════════════════════════════════
const register = async (req, res) => {
    try {
        // ── Destructure data sent by the client in req.body ─────────
        const { name, email, password, role } = req.body;

        // ── Check if a user with this email already exists ──────────
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // 400 = Bad Request (client sent invalid data)
            return res.status(400).json({ message: "Email already registered" });
        }

        // ── Create new user (password auto-hashed by pre-save hook) ─
        const user = await User.create({ name, email, password, role });
        // User.create() = new User({...}).save() shorthand
        // Our pre-save hook fires here → hashes the password

        // ── Generate JWT for the new user ───────────────────────────
        const token = generateToken(user._id, user.role);

        // ── Send back success response with token ───────────────────
        // 201 = Created (new resource was successfully created)
        res.status(201).json({
            success: true,
            token,           // Frontend stores this
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        // 500 = Internal Server Error (something crashed on our end)
        res.status(500).json({ message: error.message });
    }
};

// ════════════════════════════════════════════════════════════════
// @desc    Login user & return token
// @route   POST /api/auth/login
// @access  Public
// ════════════════════════════════════════════════════════════════
const login = async (req, res) => {
    try {
        // ── Get email and password from request body ─────────────────
        const { email, password } = req.body;

        // ── Find user by email — explicitly include password field ───
        // Remember: select: false hides password by default
        // .select("+password") overrides that for this query only
        const user = await User.findOne({ email }).select("+password");

        // ── If no user found with that email ────────────────────────
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
            // 401 = Unauthorized. Note: we say "email OR password"
            // Never tell the attacker WHICH one was wrong!
        }

        // ── Compare entered password with the hashed one in DB ──────
        const isMatch = await user.comparePassword(password);
        // This calls our custom method defined in User.js
        // bcrypt.compare(enteredPassword, hashedPassword) → true/false

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // ── Generate token for valid user ────────────────────────────
        const token = generateToken(user._id, user.role);

        // ── Send back the token and user info ────────────────────────
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Export both functions ───────────────────────────────────────
module.exports = { register, login };
