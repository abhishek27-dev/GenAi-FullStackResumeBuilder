const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    ...(process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(",").map((url) =>
              url.trim().replace(/\/$/, ""),
          )
        : []),
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, curl, server-to-server) or allowed origins
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                process.env.NODE_ENV !== "production"
            ) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
    }),
);

// Health check and root route for deployment platforms
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.status(200).json({ message: "GenAI Interview Architect API is operational." });
});

/* require all the routes here */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

/* using all the routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "File size limit exceeded. Maximum file size is 5MB.",
        });
    }
    res.status(err.status || 500).json({
        message: err.message || "Internal server error occurred.",
    });
});

module.exports = app;
