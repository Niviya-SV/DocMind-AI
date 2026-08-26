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
        const { question, documentId } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        console.log("🔎 Searching document...");

        // Search relevant chunks
        const results = await searchSimilarChunks(
            question,
            documentId,
            req.userId,
            5
        );

        console.log(
            `📚 Found ${results.length} relevant chunks`
        );

        // No results
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

        // Create context
        const context = results
            .map(
                (result, index) =>
                    `SOURCE ${index + 1}:\n${result.text}`
            )
            .join("\n\n");

        console.log("🤖 Generating AI answer...");

        // Generate answer using Ollama
        const answer = await generateAnswer(
            question,
            context
        );

        console.log("✅ Answer generated");

        // Calculate latency
        const endTime = Date.now();

        const latency = (
            (endTime - startTime) / 1000
        ).toFixed(2);

        // Calculate confidence
        const averageSimilarity =
            results.reduce(
                (sum, result) =>
                    sum + result.similarity,
                0
            ) / results.length;

        const confidence = Math.round(
            averageSimilarity * 100
        );

        // Prepare sources
        const sources = results.map(
            (result) => ({
                chunkIndex: result.chunkIndex,
                similarity: result.similarity,
            })
        );

        // Save chat
        const chat = await Chat.create({

            documentId: documentId || null,
            question,
            answer,
            sources,
        });

        console.log("💾 Chat history saved");

        // Final response
        res.status(200).json({
            success: true,

            answer,

            metrics: {
                chunksRetrieved: results.length,
                latency: `${latency}s`,
                confidence: `${confidence}%`,
            },

            sources,

            chatId: chat._id,
        });

    } catch (error) {
        console.error(
            "❌ Question processing error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate answer",
            error: error.message,
        });
    }
};


// ==========================================
// GET CHAT HISTORY
// ==========================================
const getChatHistory = async (req, res) => {
    try {
        const { documentId } = req.params;

        const chats = await Chat.find({
            
            documentId,
        }).sort({
            createdAt: 1,
        });

        res.status(200).json({
            success: true,
            chats,
        });

    } catch (error) {
        console.error(
            "❌ Chat history error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load chat history",
            error: error.message,
        });
    }
};


module.exports = {
    askQuestion,
    getChatHistory,
};