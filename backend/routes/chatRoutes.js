const express = require("express");

const {
    askQuestion,
    getChatHistory,
} = require("../controllers/chatController");

const router = express.Router();


// ==========================================
// ASK QUESTION
// ==========================================

router.post(
    "/ask",
    askQuestion
);


// ==========================================
// CHAT HISTORY
// ==========================================

router.get(
    "/history/:documentId",
    getChatHistory
);


module.exports = router;