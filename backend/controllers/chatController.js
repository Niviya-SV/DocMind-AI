// const {
//     searchSimilarChunks,
// } = require("../services/vectorSearchService");

// const Chat = require("../models/chat");

// const {
//     generateAnswer,
// } = require("../services/ragService");


// // ==========================================
// // ASK QUESTION
// // ==========================================
// const askQuestion = async (req, res) => {
//     const startTime = Date.now();

//     try {
//         const { question, documentId, documentIds = [] } = req.body;
//         const guestId = req.userId ? null : req.headers["x-guest-id"];

//         if (!question) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Question is required",
//             });
//         }

//         if (!req.userId && (!guestId || !/^[a-zA-Z0-9-]{16,100}$/.test(guestId))) {
//             return res.status(400).json({
//                 success: false,
//                 message: "A guest session is required",
//             });
//         }

//         console.log("🔎 Searching document...");

//         // Search relevant chunks
//         const results = await searchSimilarChunks(
//             question,
//             documentId,
//             req.userId,
//             5,
//             guestId,
//             documentIds
//         );

//         console.log(
//             `📚 Found ${results.length} relevant chunks`
//         );

//         // No results
//         if (results.length === 0) {
//             return res.json({
//                 success: true,
//                 answer:
//                     "I could not find relevant information in the uploaded documents.",
//                 metrics: {
//                     chunksRetrieved: 0,
//                     latency: "0s",
//                     confidence: "0%",
//                 },
//                 sources: [],
//             });
//         }

//         // Create context
//         const context = results
//             .map(
//                 (result, index) =>
//                     `SOURCE ${index + 1}:\n${result.text}`
//             )
//             .join("\n\n");

//         console.log("🤖 Generating AI answer...");

//         // Generate answer using Ollama
//         const answer = await generateAnswer(
//             question,
//             context
//         );

//         console.log("✅ Answer generated");

//         // Calculate latency
//         const endTime = Date.now();

//         const latency = (
//             (endTime - startTime) / 1000
//         ).toFixed(2);

//         // Calculate confidence
//         const averageSimilarity =
//             results.reduce(
//                 (sum, result) =>
//                     sum + result.similarity,
//                 0
//             ) / results.length;

//         const confidence = Math.round(
//             averageSimilarity * 100
//         );

//         // Prepare sources
//         const sources = results.map(
//             (result) => ({
//                 chunkIndex: result.chunkIndex,
//                 similarity: result.similarity,
//             })
//         );

//         // Save chat
//         const chat = await Chat.create({

//             documentId: documentId || null,
//             userId: req.userId || undefined,
//             guestId: guestId || undefined,
//             question,
//             answer,
//             sources,
//         });

//         console.log("💾 Chat history saved");

//         // Final response
//         res.status(200).json({
//             success: true,

//             answer,

//             metrics: {
//                 chunksRetrieved: results.length,
//                 latency: `${latency}s`,
//                 confidence: `${confidence}%`,
//             },

//             sources,

//             chatId: chat._id,
//         });

//     } catch (error) {
//         console.error(
//             "❌ Question processing error:",
//             error
//         );

//         res.status(500).json({
//             success: false,
//             message: "Failed to generate answer",
//             error: error.message,
//         });
//     }
// };


// // ==========================================
// // GET CHAT HISTORY
// // ==========================================
// const getChatHistory = async (req, res) => {
//     try {
//         const { documentId } = req.params;
//         const query = req.userId
//             ? { documentId, userId: req.userId }
//             : req.headers["x-guest-id"]
//             ? { documentId, guestId: req.headers["x-guest-id"] }
//             : { documentId, _id: null };

//         const chats = await Chat.find({
//             ...query,
//         }).sort({
//             createdAt: 1,
//         });

//         res.status(200).json({
//             success: true,
//             chats,
//         });

//     } catch (error) {
//         console.error(
//             "❌ Chat history error:",
//             error
//         );

//         res.status(500).json({
//             success: false,
//             message: "Failed to load chat history",
//             error: error.message,
//         });
//     }
// };


// module.exports = {
//     askQuestion,
//     getChatHistory,
// };

const {
    searchSimilarChunks,
} = require("../services/vectorSearchService");

const Chat = require("../models/chat");

const {
    generateAnswer,
} = require("../services/ragService");


// ==========================================
// ASK QUESTION
// ==========================================
const askQuestion = async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            question,
            documentId,
            documentIds = [],
        } = req.body;

        const guestId = req.userId
            ? null
            : req.headers["x-guest-id"];

        // ------------------------------------------
        // VALIDATE QUESTION
        // ------------------------------------------
        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        // ------------------------------------------
        // VALIDATE GUEST
        // ------------------------------------------
        if (
            !req.userId &&
            (
                !guestId ||
                !/^[a-zA-Z0-9-]{16,100}$/.test(guestId)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "A guest session is required",
            });
        }

        console.log("🔎 Searching document...");

        // ------------------------------------------
        // SEARCH SIMILAR DOCUMENT CHUNKS
        // ------------------------------------------
        const results = await searchSimilarChunks(
            question,
            documentId,
            req.userId,
            5,
            guestId,
            documentIds
        );

        console.log(
            `📚 Found ${results.length} relevant chunks`
        );

        // ------------------------------------------
        // NO RESULTS
        // ------------------------------------------
        if (results.length === 0) {
            return res.json({
                success: true,

                answer:
                    "I could not find relevant information in the uploaded documents.",

                metrics: {
                    chunksRetrieved: 0,
                    latency: "0s",
                    confidence: "0%",
                },

                sources: [],
            });
        }

        // ------------------------------------------
        // CREATE CONTEXT
        // ------------------------------------------
        const context = results
            .map(
                (result, index) =>
                    `SOURCE ${index + 1}:\n${result.text}`
            )
            .join("\n\n");

        console.log("🤖 Generating AI answer...");

        // ------------------------------------------
        // GENERATE AI ANSWER
        // ------------------------------------------
        const answer = await generateAnswer(
            question,
            context
        );

        console.log("✅ Answer generated");

        // ------------------------------------------
        // CALCULATE LATENCY
        // ------------------------------------------
        const endTime = Date.now();

        const latency = (
            (endTime - startTime) / 1000
        ).toFixed(2);

        // ------------------------------------------
        // CALCULATE CONFIDENCE
        // ------------------------------------------
        const averageSimilarity =
            results.reduce(
                (sum, result) =>
                    sum + result.similarity,
                0
            ) / results.length;

        const confidence = Math.round(
            averageSimilarity * 100
        );

        // ------------------------------------------
        // PREPARE SOURCES
        // ------------------------------------------
        const sources = results.map(
            (result) => ({
                chunkIndex: result.chunkIndex,
                similarity: result.similarity,
            })
        );

        // ------------------------------------------
        // SAVE CHAT HISTORY
        // ------------------------------------------
        const chat = await Chat.create({
            documentId: documentId || null,

            userId: req.userId || undefined,

            guestId: guestId || undefined,

            question,

            answer,

            sources,
        });

        console.log(
            "💾 Chat history saved:",
            chat._id
        );

        // ------------------------------------------
        // FINAL RESPONSE
        // ------------------------------------------
        return res.status(200).json({
            success: true,

            answer,

            metrics: {
                chunksRetrieved: results.length,
                latency: `${latency}s`,
                confidence: `${confidence}%`,
            },

            sources,

            chatId: chat._id,

            documentId: documentId || null,
        });

    } catch (error) {
        console.error(
            "❌ Question processing error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to generate answer",
            error: error.message,
        });
    }
};


// ==========================================
// GET CHAT HISTORY FOR ONE DOCUMENT
// ==========================================
const getChatHistory = async (req, res) => {
    try {
        const { documentId } = req.params;

        // ------------------------------------------
        // BUILD QUERY
        // ------------------------------------------
        let query = {};

        if (req.userId) {

            query = {
                documentId,
                userId: req.userId,
            };

        } else if (req.headers["x-guest-id"]) {

            query = {
                documentId,
                guestId: req.headers["x-guest-id"],
            };

        } else {

            query = {
                documentId,
                _id: null,
            };
        }

        // ------------------------------------------
        // GET CHAT HISTORY
        // ------------------------------------------
        const chats = await Chat.find(query)
            .populate(
                "documentId",
                "title fileName filePath createdAt"
            )
            .sort({
                createdAt: 1,
            });

        console.log(
            `📜 Found ${chats.length} chat records`
        );

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------
        return res.status(200).json({
            success: true,

            chats,
        });

    } catch (error) {
        console.error(
            "❌ Chat history error:",
            error
        );

        return res.status(500).json({
            success: false,

            message: "Failed to load chat history",

            error: error.message,
        });
    }
};


// ==========================================
// GET ALL CHAT HISTORY FOR LOGGED-IN USER
// ==========================================
// This is useful for the History page.
// It returns chats from ALL documents belonging
// to the current logged-in user.
// ==========================================
const getAllChatHistory = async (req, res) => {
    try {

        // ------------------------------------------
        // USER MUST BE LOGGED IN
        // ------------------------------------------
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // ------------------------------------------
        // GET ALL USER CHATS
        // ------------------------------------------
        const chats = await Chat.find({
            userId: req.userId,
        })
            .populate(
                "documentId",
                "title fileName filePath fileSize status createdAt updatedAt"
            )
            .sort({
                createdAt: -1,
            });

        console.log(
            `📚 Found ${chats.length} total chat records for user`
        );

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------
        return res.status(200).json({
            success: true,

            count: chats.length,

            chats,
        });

    } catch (error) {

        console.error(
            "❌ All chat history error:",
            error
        );

        return res.status(500).json({
            success: false,

            message: "Failed to load all chat history",

            error: error.message,
        });
    }
};


// ==========================================
// EXPORT
// ==========================================
module.exports = {
    askQuestion,
    getChatHistory,
    getAllChatHistory,
};