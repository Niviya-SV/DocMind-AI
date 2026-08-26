const express = require("express");

const {
    registerUser,
    loginUser,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected test route
router.get("/profile", protect, (req, res) => {
    res.json({
        success: true,
        message: "You are authenticated 🎉",
        userId: req.userId,
    });
});

module.exports = router;