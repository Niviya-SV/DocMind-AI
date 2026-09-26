const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);

// Return API errors as JSON, including Multer upload errors.
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error("❌ API error:", error);
    res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || "Request failed",
    });
});

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DocMind AI Backend is Running 🚀",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});