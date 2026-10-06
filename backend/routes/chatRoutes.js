// const express = require("express");
// const optionalAuth = require("../middleware/optionalAuthMiddleware");

// const {
//     askQuestion,
//     getChatHistory,
// } = require("../controllers/chatController");

// const router = express.Router();


// // ==========================================
// // ASK QUESTION
// // ==========================================

// router.post(
//     "/ask",
//     optionalAuth,
//     askQuestion
// );


// // ==========================================
// // CHAT HISTORY
// // ==========================================

// router.get(
//     "/history/:documentId",
//     optionalAuth,
//     getChatHistory
// );


// module.exports = router;


const express = require("express");

const optionalAuth = require("../middleware/optionalAuthMiddleware");

const {
    askQuestion,
    getChatHistory,
    getAllChatHistory,
} = require("../controllers/chatController");

const router = express.Router();


// ==========================================
// ASK QUESTION
// ==========================================
router.post(
    "/ask",
    optionalAuth,
    askQuestion
);


// ==========================================
// CHAT HISTORY FOR ONE DOCUMENT
// ==========================================
router.get(
    "/history/:documentId",
    optionalAuth,
    getChatHistory
);


// ==========================================
// ALL CHAT HISTORY FOR LOGGED-IN USER
// ==========================================
router.get(
    "/history",
    optionalAuth,
    getAllChatHistory
);


module.exports = router;