// ─── Import mongoose to connect to MongoDB ──────────────────────
const mongoose = require("mongoose");

// ─── connectDB is an async function (DB calls take time) ────────
const connectDB = async () => {
    try {
        // ─── Attempt to connect using URI from .env ────────────────
        const conn = await mongoose.connect(process.env.MONGO_URI);
        // mongoose.connect() returns a connection object
        // 'await' waits for the connection to be established before moving on

        // ─── Log the host name of the connected cluster ────────────
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        // ─── If connection fails, log the error and EXIT ───────────
        console.error(`MongoDB Connection Error: ${error.message}`);

        // process.exit(1) → Stop the entire Node process
        // '1' means "exit with failure" (0 = success)
        // We EXIT because without DB, our app is useless
        process.exit(1);
    }
};

// ─── Export so server.js can import and call it ─────────────────
module.exports = connectDB;
