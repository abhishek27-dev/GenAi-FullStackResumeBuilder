const mongoose = require("mongoose");
const dns = require("node:dns");

async function connectToDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.warn("⚠️  WARNING: MONGO_URI is not set in .env! Database connection skipped until configured.");
        return;
    }
    try {
        // Fix for Windows DNS resolution for MongoDB Atlas SRV records
        try {
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
        } catch (e) {
            // Ignore DNS set failure if default DNS is read-only
        }

        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB successfully.");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
    }
}

module.exports = connectToDB;
