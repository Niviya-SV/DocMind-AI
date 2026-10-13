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
//         const {
//             question,
//             documentId,
//             documentIds = [],
//         } = req.body;

//         const guestId = req.userId
//             ? null
//             : req.headers["x-guest-id"];

//         // ------------------------------------------
//         // VALIDATE QUESTION
//         // ------------------------------------------
//         if (!question) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Question is required",
//             });
//         }

//         // ------------------------------------------
//         // VALIDATE GUEST
//         // ------------------------------------------
//         if (
//             !req.userId &&
//             (
//                 !guestId ||
//                 !/^[a-zA-Z0-9-]{16,100}$/.test(guestId)
//             )
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "A guest session is required",
//             });
//         }

//         console.log("🔎 Searching document...");

//         // ------------------------------------------
//         // SEARCH SIMILAR DOCUMENT CHUNKS
//         // ------------------------------------------
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

//         // ------------------------------------------
//         // NO RESULTS
//         // ------------------------------------------
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

//         // ------------------------------------------
//         // CREATE CONTEXT
//         // ------------------------------------------
//         const context = results
//             .map(
//                 (result, index) =>
//                     `SOURCE ${index + 1}:\n${result.text}`
//             )
//             .join("\n\n");

//         console.log("🤖 Generating AI answer...");

//         // ------------------------------------------
//         // GENERATE AI ANSWER
//         // ------------------------------------------
//         const answer = await generateAnswer(
//             question,
//             context
//         );

//         console.log("✅ Answer generated");

//         // ------------------------------------------
//         // CALCULATE LATENCY
//         // ------------------------------------------
//         const endTime = Date.now();

//         const latency = (
//             (endTime - startTime) / 1000
//         ).toFixed(2);

//         // ------------------------------------------
//         // CALCULATE CONFIDENCE
//         // ------------------------------------------
//         const averageSimilarity =
//             results.reduce(
//                 (sum, result) =>
//                     sum + result.similarity,
//                 0
//             ) / results.length;

//         const confidence = Math.round(
//             averageSimilarity * 100
//         );

//         // ------------------------------------------
//         // PREPARE SOURCES
//         // ------------------------------------------
//         const sources = results.map(
//             (result) => ({
//                 chunkIndex: result.chunkIndex,
//                 similarity: result.similarity,
//             })
//         );

//         // ------------------------------------------
//         // SAVE CHAT HISTORY
//         // ------------------------------------------
//         const chat = await Chat.create({
//             documentId: documentId || null,

//             userId: req.userId || undefined,

//             guestId: guestId || undefined,

//             question,

//             answer,

//             sources,
//         });

//         console.log(
//             "💾 Chat history saved:",
//             chat._id
//         );

//         // ------------------------------------------
//         // FINAL RESPONSE
//         // ------------------------------------------
//         return res.status(200).json({
//             success: true,

//             answer,

//             metrics: {
//                 chunksRetrieved: results.length,
//                 latency: `${latency}s`,
//                 confidence: `${confidence}%`,
//             },

//             sources,

//             chatId: chat._id,

//             documentId: documentId || null,
//         });

//     } catch (error) {
//         console.error(
//             "❌ Question processing error:",
//             error
//         );

//         return res.status(500).json({
//             success: false,
//             message: "Failed to generate answer",
//             error: error.message,
//         });
//     }
// };


// // ==========================================
// // GET CHAT HISTORY FOR ONE DOCUMENT
// // ==========================================
// const getChatHistory = async (req, res) => {
//     try {
//         const { documentId } = req.params;

//         // ------------------------------------------
//         // BUILD QUERY
//         // ------------------------------------------
//         let query = {};

//         if (req.userId) {

//             query = {
//                 documentId,
//                 userId: req.userId,
//             };

//         } else if (req.headers["x-guest-id"]) {

//             query = {
//                 documentId,
//                 guestId: req.headers["x-guest-id"],
//             };

//         } else {

//             query = {
//                 documentId,
//                 _id: null,
//             };
//         }

//         // ------------------------------------------
//         // GET CHAT HISTORY
//         // ------------------------------------------
//         const chats = await Chat.find(query)
//             .populate(
//                 "documentId",
//                 "title fileName filePath createdAt"
//             )
//             .sort({
//                 createdAt: 1,
//             });

//         console.log(
//             `📜 Found ${chats.length} chat records`
//         );

//         // ------------------------------------------
//         // RESPONSE
//         // ------------------------------------------
//         return res.status(200).json({
//             success: true,

//             chats,
//         });

//     } catch (error) {
//         console.error(
//             "❌ Chat history error:",
//             error
//         );

//         return res.status(500).json({
//             success: false,

//             message: "Failed to load chat history",

//             error: error.message,
//         });
//     }
// };


// // ==========================================
// // GET ALL CHAT HISTORY FOR LOGGED-IN USER
// // ==========================================
// // This is useful for the History page.
// // It returns chats from ALL documents belonging
// // to the current logged-in user.
// // ==========================================
// const getAllChatHistory = async (req, res) => {
//     try {

//         // ------------------------------------------
//         // USER MUST BE LOGGED IN
//         // ------------------------------------------
//         if (!req.userId) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authentication required",
//             });
//         }

//         // ------------------------------------------
//         // GET ALL USER CHATS
//         // ------------------------------------------
//         const chats = await Chat.find({
//             userId: req.userId,
//         })
//             .populate(
//                 "documentId",
//                 "title fileName filePath fileSize status createdAt updatedAt"
//             )
//             .sort({
//                 createdAt: -1,
//             });

//         console.log(
//             `📚 Found ${chats.length} total chat records for user`
//         );

//         // ------------------------------------------
//         // RESPONSE
//         // ------------------------------------------
//         return res.status(200).json({
//             success: true,

//             count: chats.length,

//             chats,
//         });

//     } catch (error) {

//         console.error(
//             "❌ All chat history error:",
//             error
//         );

//         return res.status(500).json({
//             success: false,

//             message: "Failed to load all chat history",

//             error: error.message,
//         });
//     }
// };


// // ==========================================
// // EXPORT
// // ==========================================
// module.exports = {
//     askQuestion,
//     getChatHistory,
//     getAllChatHistory,
// };



const {
    searchSimilarChunks,
} = require("../services/vectorSearchService");

const Chat = require("../models/chat");

const Document = require("../models/Document");

const {
    generateAnswer,
} = require("../services/ragService");


// =====================================================
// ASK QUESTION
// =====================================================

const askQuestion = async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            question,
            documentId,
            documentIds = [],
            space = "workspace",
        } = req.body;

        // =================================================
        // GUEST ID
        // =================================================

        const guestId = req.userId
            ? null
            : req.headers["x-guest-id"];

        // =================================================
        // VALIDATE SPACE
        // =================================================

        if (
            !["sandbox", "workspace"].includes(space)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid space. Use sandbox or workspace.",
            });
        }

        // =================================================
        // VALIDATE QUESTION
        // =================================================

        if (
            !question ||
            typeof question !== "string" ||
            !question.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        if (space === "workspace" && !req.userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Authentication is required for Workspace questions.",
            });
        }

        // Sandbox questions may be asked without an account.
        if (
            space === "sandbox" &&
            !req.userId &&
            (
                !guestId ||
                !/^[a-zA-Z0-9-]{16,100}$/.test(
                    guestId
                )
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "A guest session is required. Refresh the page and try again.",
            });
        }


        // =================================================
        // =================================================
        // SANDBOX
        // =================================================
        // =================================================

        if (space === "sandbox") {

            console.log(
                "=========================================="
            );

            console.log(
                "🧪 SANDBOX QUESTION"
            );

            console.log(
                "=========================================="
            );


            // ---------------------------------------------
            // Sandbox requires exactly ONE document
            // ---------------------------------------------

            if (!documentId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Sandbox requires a documentId",
                });
            }


            // ---------------------------------------------
            // Build document ownership query
            // ---------------------------------------------

            const documentQuery = {
                _id: documentId,
                space: "sandbox",
            };


            // Logged-in user
            if (req.userId) {

                documentQuery.userId =
                    req.userId;

            }

            // Guest user
            else {

                documentQuery.guestId =
                    guestId;

            }


            // ---------------------------------------------
            // Find Sandbox document
            // ---------------------------------------------

            const document =
                await Document.findOne(
                    documentQuery
                );


            if (!document) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Sandbox document not found or access denied.",
                });

            }


            console.log(
                "📄 Sandbox document:",
                document._id
            );


            // ---------------------------------------------
            // Check processing status
            // ---------------------------------------------

            if (
                document.status !==
                "processed"
            ) {

                return res.status(409).json({
                    success: false,
                    message:
                        "The PDF is still being processed. Please wait until processing is complete.",
                    status:
                        document.status,
                });

            }


            // =================================================
            // SEARCH ONLY THIS PDF
            // =================================================

            const results =
                await searchSimilarChunks(
                    question.trim(),

                    documentId,

                    req.userId,

                    4,

                    guestId,

                    []
                );


            console.log(
                `📚 Sandbox chunks found: ${results.length}`
            );


            // =================================================
            // NO RESULTS
            // =================================================

            if (results.length === 0) {

                return res.status(200).json({

                    success: true,

                    answer:
                        "I could not find this information in the document.",

                    metrics: {

                        chunksRetrieved: 0,

                        latency: "0s",

                        confidence: "0%",

                    },

                    sources: [],

                    chatId: null,

                    documentId,

                });

            }


            // =================================================
            // CREATE CONTEXT
            // =================================================

            const context =
                results
                    .map(
                        (result, index) =>
                            `SOURCE ${index + 1}:\n${result.text}`
                    )
                    .join("\n\n");


            console.log(
                "🤖 Generating Sandbox answer..."
            );


            // =================================================
            // GENERATE ANSWER
            // =================================================

            const answer =
                await generateAnswer(
                    question.trim(),
                    context
                );


            console.log(
                "✅ Sandbox answer generated"
            );


            // =================================================
            // LATENCY
            // =================================================

            const endTime =
                Date.now();

            const latency =
                (
                    (endTime - startTime) /
                    1000
                ).toFixed(2);


            // =================================================
            // CONFIDENCE
            // =================================================

            const averageSimilarity =
                results.reduce(
                    (sum, result) =>
                        sum +
                        result.similarity,
                    0
                ) / results.length;


            const confidence =
                Math.round(
                    averageSimilarity * 100
                );


            // =================================================
            // SOURCES
            // =================================================

            const sources =
                results.map(
                    (result) => ({

                        chunkIndex:
                            result.chunkIndex,

                        similarity:
                            result.similarity,

                        documentId:
                            result.documentId,

                        documentName:
                            document.fileName ||
                            document.title ||
                            "Sandbox PDF",

                        pageNumber:
                            result.pageNumber ||
                            null,

                    })
                );


            // =================================================
            // IMPORTANT
            // =================================================
            // Sandbox questions are NOT saved
            // in Chat collection.
            // =================================================

            console.log(
                "🚫 Sandbox chat NOT saved"
            );


            // =================================================
            // SANDBOX RESPONSE
            // =================================================

            return res.status(200).json({

                success: true,

                answer,

                metrics: {

                    chunksRetrieved:
                        results.length,

                    latency:
                        `${latency}s`,

                    confidence:
                        `${confidence}%`,

                },

                sources,

                chatId: null,

                documentId,

            });

        }


        // =================================================
        // =================================================
        // WORKSPACE
        // =================================================
        // =================================================

        console.log(
            "=========================================="
        );

        console.log(
            "🏢 WORKSPACE QUESTION"
        );

        console.log(
            "=========================================="
        );


        // =================================================
        // SEARCH WORKSPACE DOCUMENTS
        // =================================================

        const results =
            await searchSimilarChunks(

                question.trim(),

                documentId,

                req.userId,

                4,

                guestId,

                documentIds
            );


        console.log(
            `📚 Found ${results.length} relevant chunks`
        );


        // =================================================
        // NO RESULTS
        // =================================================

        if (results.length === 0) {

            return res.status(200).json({

                success: true,

                answer:
                    "I could not find relevant information in the uploaded documents.",

                metrics: {

                    chunksRetrieved: 0,

                    latency: "0s",

                    confidence: "0%",

                },

                sources: [],

                chatId: null,

                documentId:
                    documentId || null,

            });

        }


        // =================================================
        // CREATE CONTEXT
        // =================================================

        const context =
            results
                .map(
                    (result, index) =>
                        `SOURCE ${index + 1}:\n${result.text}`
                )
                .join("\n\n");


        console.log(
            "🤖 Generating Workspace answer..."
        );


        // =================================================
        // GENERATE WORKSPACE ANSWER
        // =================================================

        const answer =
            await generateAnswer(
                question.trim(),
                context
            );


        console.log(
            "✅ Workspace answer generated"
        );


        // =================================================
        // LATENCY
        // =================================================

        const endTime =
            Date.now();

        const latency =
            (
                (endTime - startTime) /
                1000
            ).toFixed(2);


        // =================================================
        // CONFIDENCE
        // =================================================

        const averageSimilarity =
            results.reduce(
                (sum, result) =>
                    sum +
                    result.similarity,
                0
            ) / results.length;


        const confidence =
            Math.round(
                averageSimilarity * 100
            );


        // =================================================
        // SOURCES
        // =================================================

        const sources =
            results.map(
                (result) => ({

                    chunkIndex:
                        result.chunkIndex,

                    similarity:
                        result.similarity,

                    documentId:
                        result.documentId,

                })
            );


        // =================================================
        // SAVE WORKSPACE CHAT
        // =================================================

        const chat =
            await Chat.create({

                documentId:
                    documentId || null,

                userId:
                    req.userId ||
                    undefined,

                guestId:
                    guestId ||
                    undefined,

                question:
                    question.trim(),

                answer,

                sources,

            });


        console.log(
            "💾 Workspace chat saved:",
            chat._id
        );


        // =================================================
        // WORKSPACE RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            answer,

            metrics: {

                chunksRetrieved:
                    results.length,

                latency:
                    `${latency}s`,

                confidence:
                    `${confidence}%`,

            },

            sources,

            chatId:
                chat._id,

            documentId:
                documentId || null,

        });


    } catch (error) {

        console.error(
            "❌ Question processing error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to generate answer",

            error:
                error.message,

        });

    }
};


// =====================================================
// GET CHAT HISTORY FOR ONE DOCUMENT
// =====================================================

const getChatHistory = async (req, res) => {

    try {

        const {
            documentId,
        } = req.params;


        // =================================================
        // CHECK DOCUMENT SPACE
        // =================================================

        const document =
            await Document.findById(
                documentId
            ).select("space");


        // =================================================
        // SANDBOX HAS NO BACKEND HISTORY
        // =================================================

        if (
            document &&
            document.space === "sandbox"
        ) {

            return res.status(200).json({

                success: true,

                chats: [],

            });

        }


        // =================================================
        // WORKSPACE HISTORY
        // =================================================

        let query = {};


        // Logged-in user
        if (req.userId) {

            query = {

                documentId,

                userId:
                    req.userId,

            };

        }

        // Guest
        else if (
            req.headers["x-guest-id"]
        ) {

            query = {

                documentId,

                guestId:
                    req.headers[
                        "x-guest-id"
                    ],

            };

        }

        // No authentication
        else {

            query = {

                documentId,

                _id: null,

            };

        }


        const chats =
            await Chat.find(
                query
            )
                .populate(
                    "documentId",
                    "title fileName filePath createdAt"
                )
                .sort({
                    createdAt: 1,
                });


        console.log(
            `📜 Found ${chats.length} Workspace chat records`
        );


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

            message:
                "Failed to load chat history",

            error:
                error.message,

        });

    }
};


// =====================================================
// GET ALL CHAT HISTORY FOR LOGGED-IN USER
// =====================================================

const getAllChatHistory = async (
    req,
    res
) => {

    try {

        // =================================================
        // USER MUST BE LOGGED IN
        // =================================================

        if (!req.userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required",

            });

        }


        // =================================================
        // GET ALL USER CHATS
        // =================================================

        const chats =
            await Chat.find({

                userId:
                    req.userId,

            })
                .populate(
                    "documentId",
                    "title fileName filePath fileSize status space createdAt updatedAt"
                )
                .sort({
                    createdAt: -1,
                });


        // =================================================
        // ONLY KEEP WORKSPACE CHATS
        // =================================================

        const workspaceChats =
            chats.filter(
                (chat) =>
                    chat.documentId &&
                    chat.documentId.space !==
                        "sandbox"
            );


        console.log(
            `📚 Found ${workspaceChats.length} Workspace chat records`
        );


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            count:
                workspaceChats.length,

            chats:
                workspaceChats,

        });


    } catch (error) {

        console.error(
            "❌ All chat history error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load all chat history",

            error:
                error.message,

        });

    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    askQuestion,

    getChatHistory,

    getAllChatHistory,

};