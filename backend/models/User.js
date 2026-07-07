// ─── Import mongoose to define schema ──────────────────────────
const mongoose = require("mongoose");

// ─── Import bcryptjs for password hashing ──────────────────────
const bcrypt = require("bcryptjs");

// ─── Define the shape of a User document ────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Full name of the user ──────────────────────────────────
    name: {
      type: String,       // Must be a string
      required: [true, "Name is required"], // Custom error message
      trim: true,         // Removes leading/trailing spaces
    },

    // ── Email - used for login ─────────────────────────────────
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,       // No two users can have same email
      lowercase: true,    // Always stored as lowercase
      trim: true,
    },

    // ── Hashed password (never store plain text!) ──────────────
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,      // NEVER return password in queries by default
    },

    // ── Role controls what user can do ────────────────────────
    role: {
      type: String,
      enum: ["user", "organizer", "admin"], // Only these 3 values allowed
      default: "user",    // New signups are regular users
    },

    // ── Profile picture URL (stored in Cloudinary later) ──────
    avatar: {
      type: String,
      default: "",        // Empty string if no photo uploaded
    },
  },
  {
    // ── Automatically adds createdAt and updatedAt fields ──────
    timestamps: true,
  }
);

// ─── PRE-SAVE HOOK: Hash password before saving to DB ───────────
// NOTE: Mongoose v7+ with async functions does NOT use next()
// Mongoose automatically awaits the promise — no next() needed
userSchema.pre("save", async function () {
  // 'this' refers to the current user document being saved

  // ── Only hash if password was changed (or is new) ────────────
  // Just return (no next) — Mongoose handles the rest
  if (!this.isModified("password")) return;

  // ── Generate a salt with cost factor 10 ──────────────────────
  const salt = await bcrypt.genSalt(10);

  // ── Hash the plain text password with the salt ────────────────
  this.password = await bcrypt.hash(this.password, salt);

  // ── Async function ends → Mongoose knows hook is complete ─────
});

// ─── INSTANCE METHOD: Compare entered password with hashed ──────
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare() returns true or false
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Create the Model from the Schema ───────────────────────────
// "User" → MongoDB will create a collection called "users"
const User = mongoose.model("User", userSchema);

// ─── Export so other files can use it ───────────────────────────
module.exports = User;
