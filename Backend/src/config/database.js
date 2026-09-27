const mongoose = require("mongoose");

async function connectToDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.warn("⚠️  WARNING: MONGO_URI is not set in .env! Database connection skipped until configured.");
        return;
    }
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB successfully.");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
    }
}

module.exports = connectToDB;
