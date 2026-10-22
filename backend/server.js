// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");

// dotenv.config();

// const connectDB = require("./config/db");
// const authRoutes = require("./routes/authRoutes");
// const documentRoutes = require("./routes/documentRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const sandboxRoutes = require("./routes/sandboxRoutes");

// // Connect MongoDB
// connectDB();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Authentication routes
// app.use("/api/auth", authRoutes);
// app.use("/api/documents", documentRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api", sandboxRoutes);
// // Return API errors as JSON, including Multer upload errors.
// app.use((error, req, res, next) => {
//     if (res.headersSent) {
//         return next(error);
//     }

//     console.error("❌ API error:", error);
//     res.status(error.statusCode || 400).json({
//         success: false,
//         message: error.message || "Request failed",
//     });
// });

// // Test route
// app.get("/", (req, res) => {
//     res.json({
//         success: true,
//         message: "DocMind AI Backend is Running 🚀",
//     });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`🚀 Backend running on http://localhost:${PORT}`);
// });



const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from backend/.env
dotenv.config({
    path: path.join(__dirname, ".env"),
});

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const sandboxRoutes = require("./routes/sandboxRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", sandboxRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DocMind AI Backend is Running 🚀",
    });
});

// Error-handling middleware
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

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
const startServer = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error(
                "MONGO_URI is missing. Check backend/.env"
            );
        }

        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `🚀 Backend running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "❌ Failed to start backend:",
            error.message
        );
        process.exit(1);
    }
};

startServer();
