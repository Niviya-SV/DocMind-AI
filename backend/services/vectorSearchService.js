// const DocumentChunk = require("../models/DocumentChunk");
// const { generateEmbedding } = require("./embeddingService");

// // ==========================================
// // COSINE SIMILARITY
// // ==========================================
// const cosineSimilarity = (vectorA, vectorB) => {
//     if (
//         !Array.isArray(vectorA) ||
//         !Array.isArray(vectorB) ||
//         vectorA.length === 0 ||
//         vectorB.length === 0
//     ) {
//         return 0;
//     }

//     if (vectorA.length !== vectorB.length) {
//         console.warn(
//             `⚠️ Embedding dimension mismatch: ${vectorA.length} vs ${vectorB.length}`
//         );
//         return 0;
//     }

//     let dotProduct = 0;
//     let magnitudeA = 0;
//     let magnitudeB = 0;

//     for (let i = 0; i < vectorA.length; i++) {
//         dotProduct += vectorA[i] * vectorB[i];

//         magnitudeA += vectorA[i] * vectorA[i];

//         magnitudeB += vectorB[i] * vectorB[i];
//     }

//     if (magnitudeA === 0 || magnitudeB === 0) {
//         return 0;
//     }

//     return (
//         dotProduct /
//         (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
//     );
// };

// // ==========================================
// // SEARCH SIMILAR CHUNKS
// // ==========================================
// const searchSimilarChunks = async (
//     question,
//     documentId,
//     userId = null,
//     topK = 5,
//     guestId = null,
//     documentIds = []
// ) => {
//     console.log("🔎 Vector search started");
//     console.log("📄 Document ID:", documentId);
//     console.log("👤 User ID:", userId || "Guest / No Authentication");

//     // ------------------------------------------
//     // Validate question
//     // ------------------------------------------
//     if (!question || !question.trim()) {
//         return [];
//     }

//     // ------------------------------------------
//     // Generate question embedding
//     // ------------------------------------------
//     console.log("🧠 Generating embedding...");

//     const questionEmbedding =
//         await generateEmbedding(question);

//     console.log(
//         `✅ Question embedding generated (${questionEmbedding.length} dimensions)`
//     );

//     // ------------------------------------------
//     // Build MongoDB query
//     // ------------------------------------------
//     const query = {
//         documentId: documentIds.length > 0
//             ? { $in: documentIds }
//             : documentId,
//     };

//     // IMPORTANT:
//     // Only filter by userId when authentication exists.
//     //
//     // Option B = No login/register
//     // Therefore userId can be undefined.
//     if (userId) {
//         query.userId = userId;
//     } else if (guestId) {
//         query.guestId = guestId;
//     }

//     console.log("🔍 MongoDB chunk query:", query);

//     // ------------------------------------------
//     // Get document chunks
//     // ------------------------------------------
//     const chunks = await DocumentChunk.find(query)
//         .lean();

//     console.log(
//         `📦 Found ${chunks.length} chunks in MongoDB`
//     );

//     // ------------------------------------------
//     // No chunks
//     // ------------------------------------------
//     if (chunks.length === 0) {
//         console.log(
//             "⚠️ No chunks found for this document"
//         );

//         return [];
//     }

//     // ------------------------------------------
//     // Calculate similarity
//     // ------------------------------------------
//     const results = chunks
//         .map((chunk) => {
//             const similarity = cosineSimilarity(
//                 questionEmbedding,
//                 chunk.embedding
//             );

//             return {
//                 chunkId: chunk._id,
//                 chunkIndex: chunk.chunkIndex,
//                 text: chunk.text,
//                 similarity,
//                 documentId: chunk.documentId,
//             };
//         })
//         .filter(
//             (result) =>
//                 result.similarity > 0
//         );

//     // ------------------------------------------
//     // Sort by similarity
//     // ------------------------------------------
//     results.sort(
//         (a, b) =>
//             b.similarity - a.similarity
//     );

//     // ------------------------------------------
//     // Show similarity scores
//     // ------------------------------------------
//     console.log("📊 Similarity results:");

//     results.slice(0, topK).forEach(
//         (result, index) => {
//             console.log(
//                 `${index + 1}. Chunk ${result.chunkIndex} → ${(
//                     result.similarity * 100
//                 ).toFixed(2)}%`
//             );
//         }
//     );
//     console.log("\n📚 TOP RETRIEVED CHUNKS");

// results.slice(0, topK).forEach((result, index) => {
//     console.log("\n-------------------------");
//     console.log(`Chunk Rank: ${index + 1}`);
//     console.log(`Chunk Index: ${result.chunkIndex}`);
//     console.log(
//         `Similarity: ${(result.similarity * 100).toFixed(2)}%`
//     );
//     console.log("Text Preview:");
//     console.log(result.text.substring(0, 500));
//     console.log("-------------------------");
// });

//     // ------------------------------------------
//     // Return top K
//     // ------------------------------------------
//     return results.slice(0, topK);
// };

// // ==========================================
// // EXPORT
// // ==========================================
// module.exports = {
//     searchSimilarChunks,
// };


const DocumentChunk = require("../models/DocumentChunk");
const { generateEmbedding } = require("./embeddingService");

// ==========================================
// COSINE SIMILARITY
// ==========================================
const cosineSimilarity = (vectorA, vectorB) => {
    if (
        !Array.isArray(vectorA) ||
        !Array.isArray(vectorB) ||
        vectorA.length === 0 ||
        vectorB.length === 0
    ) {
        return 0;
    }

    if (vectorA.length !== vectorB.length) {
        console.warn(
            `⚠️ Embedding dimension mismatch: ${vectorA.length} vs ${vectorB.length}`
        );

        return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];

        magnitudeA += vectorA[i] * vectorA[i];

        magnitudeB += vectorB[i] * vectorB[i];
    }

    if (
        magnitudeA === 0 ||
        magnitudeB === 0
    ) {
        return 0;
    }

    return (
        dotProduct /
        (
            Math.sqrt(magnitudeA) *
            Math.sqrt(magnitudeB)
        )
    );
};

const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for",
    "from", "how", "in", "is", "it", "of", "on", "or", "that",
    "the", "this", "to", "was", "what", "when", "where", "which",
    "who", "why", "with",
]);

const tokenize = (text) =>
    text
        .toLowerCase()
        .match(/[a-z0-9]+/g)
        ?.filter((token) => token.length > 1 && !STOP_WORDS.has(token)) || [];

const lexicalSimilarity = (question, text) => {
    const questionTokens = new Set(tokenize(question));
    const textTokens = new Set(tokenize(text));

    if (questionTokens.size === 0 || textTokens.size === 0) {
        return 0;
    }

    let matches = 0;
    for (const token of questionTokens) {
        if (textTokens.has(token)) {
            matches += 1;
        }
    }

    return matches / questionTokens.size;
};

// ==========================================
// SEARCH SIMILAR CHUNKS
// ==========================================
const searchSimilarChunks = async (
    question,
    documentId,
    userId = null,
    topK = 5,
    guestId = null,
    documentIds = []
) => {
    try {
        console.log("==========================================");
        console.log("🔎 VECTOR SEARCH STARTED");
        console.log("==========================================");

        console.log(
            "📄 Document ID:",
            documentId || "Multiple Documents"
        );

        console.log(
            "👤 User ID:",
            userId || "Guest"
        );

        console.log(
            "👥 Guest ID:",
            guestId || "None"
        );

        console.log(
            "📚 Document IDs:",
            documentIds
        );

        // ==========================================
        // VALIDATE QUESTION
        // ==========================================

        if (
            !question ||
            typeof question !== "string" ||
            !question.trim()
        ) {
            console.log(
                "⚠️ Empty question"
            );

            return [];
        }

        // ==========================================
        // VALIDATE DOCUMENT
        // ==========================================

        if (
            !documentId &&
            (
                !Array.isArray(documentIds) ||
                documentIds.length === 0
            )
        ) {
            console.log(
                "⚠️ No document ID provided"
            );

            return [];
        }

        // ==========================================
        // VALIDATE OWNER
        // ==========================================

        if (!userId && !guestId) {
            console.log(
                "⚠️ No userId or guestId provided"
            );

            return [];
        }

        // ==========================================
        // GENERATE QUESTION EMBEDDING
        // ==========================================

        console.log(
            "🧠 Generating question embedding..."
        );

        const questionEmbedding =
            await generateEmbedding(
                question.trim()
            );

        if (
            !Array.isArray(questionEmbedding) ||
            questionEmbedding.length === 0
        ) {
            console.error(
                "❌ Invalid question embedding"
            );

            return [];
        }

        console.log(
            `✅ Question embedding generated (${questionEmbedding.length} dimensions)`
        );

        // ==========================================
        // BUILD MONGODB QUERY
        // ==========================================

        const query = {};

        // ------------------------------------------
        // DOCUMENT FILTER
        // ------------------------------------------
        //
        // If documentId exists:
        // ONLY that document is searched.
        //
        // If documentIds exists:
        // ONLY those documents are searched.
        //
        // This prevents Sandbox questions from
        // searching other documents.
        // ------------------------------------------

        if (documentId) {
            query.documentId = documentId;
        } else if (
            Array.isArray(documentIds) &&
            documentIds.length > 0
        ) {
            query.documentId = {
                $in: documentIds,
            };
        }

        // ==========================================
        // USER / GUEST FILTER
        // ==========================================

        if (userId) {
            query.userId = userId;
        } else {
            query.guestId = guestId;
        }

        console.log(
            "🔍 MongoDB chunk query:",
            JSON.stringify(query, null, 2)
        );

        // ==========================================
        // GET CHUNKS
        // ==========================================

        const chunks =
            await DocumentChunk
                .find(query)
                .lean();

        console.log(
            `📦 Found ${chunks.length} chunks`
        );

        // ==========================================
        // NO CHUNKS
        // ==========================================

        if (chunks.length === 0) {
            console.log(
                "⚠️ No chunks found"
            );

            return [];
        }

        // ==========================================
        // CALCULATE SIMILARITY
        // ==========================================

        const results = [];

        for (const chunk of chunks) {
            if (
                !Array.isArray(chunk.embedding) ||
                chunk.embedding.length === 0
            ) {
                console.warn(
                    `⚠️ Skipping chunk ${chunk._id} because embedding is missing`
                );

                continue;
            }

            const similarity =
                cosineSimilarity(
                    questionEmbedding,
                    chunk.embedding
                );

            const lexicalScore = lexicalSimilarity(
                question,
                chunk.text
            );

            // Keep chunks even when the embedding model returns a negative
            // score or a different vector size. The lexical score provides a
            // reliable fallback for exact terms present in the document.
            results.push({
                chunkId: chunk._id,

                chunkIndex:
                    chunk.chunkIndex,

                text:
                    chunk.text,

                similarity,

                lexicalScore,

                rankingScore:
                    (Math.max(0, similarity) * 0.7) +
                    (lexicalScore * 0.3),

                documentId:
                    chunk.documentId,
            });
        }

        // Do not send arbitrary document text to the model when neither
        // retrieval strategy found evidence for the question.
        if (!results.some((result) => result.rankingScore > 0)) {
            console.log(
                "⚠️ No semantic or lexical match found"
            );

            return [];
        }

        // ==========================================
        // SORT BY SIMILARITY
        // ==========================================

        results.sort(
            (a, b) =>
                b.rankingScore -
                a.rankingScore
        );

        // ==========================================
        // TOP K RESULTS
        // ==========================================

        const topResults =
            results.slice(
                0,
                Math.max(1, topK)
            );

        // ==========================================
        // LOG RESULTS
        // ==========================================

        console.log(
            "=========================================="
        );

        console.log(
            "📊 SIMILARITY RESULTS"
        );

        console.log(
            "=========================================="
        );

        topResults.forEach(
            (result, index) => {
                console.log(
                    `${index + 1}. ` +
                    `Document: ${result.documentId} | ` +
                    `Chunk: ${result.chunkIndex} | ` +
                    `Similarity: ${(result.similarity * 100).toFixed(2)}%`
                );
            }
        );

        // ==========================================
        // DEBUG PREVIEW
        // ==========================================

        console.log(
            "\n📚 TOP RETRIEVED CHUNKS"
        );

        topResults.forEach(
            (result, index) => {
                console.log(
                    "\n-------------------------"
                );

                console.log(
                    `Rank: ${index + 1}`
                );

                console.log(
                    `Document ID: ${result.documentId}`
                );

                console.log(
                    `Chunk Index: ${result.chunkIndex}`
                );

                console.log(
                    `Similarity: ${(result.similarity * 100).toFixed(2)}%`
                );

                console.log(
                    "Text Preview:"
                );

                console.log(
                    (result.text || "")
                        .substring(0, 500)
                );

                console.log(
                    "-------------------------"
                );
            }
        );

        console.log(
            "\n✅ Vector search completed"
        );

        console.log(
            "=========================================="
        );

        return topResults;

    } catch (error) {
        console.error(
            "❌ Vector search failed:",
            error
        );

        throw error;
    }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    searchSimilarChunks,
    cosineSimilarity,
};