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

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return (
        dotProduct /
        (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
    );
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
    console.log("🔎 Vector search started");
    console.log("📄 Document ID:", documentId);
    console.log("👤 User ID:", userId || "Guest / No Authentication");

    // ------------------------------------------
    // Validate question
    // ------------------------------------------
    if (!question || !question.trim()) {
        return [];
    }

    // ------------------------------------------
    // Generate question embedding
    // ------------------------------------------
    console.log("🧠 Generating embedding...");

    const questionEmbedding =
        await generateEmbedding(question);

    console.log(
        `✅ Question embedding generated (${questionEmbedding.length} dimensions)`
    );

    // ------------------------------------------
    // Build MongoDB query
    // ------------------------------------------
    const query = {
        documentId: documentIds.length > 0
            ? { $in: documentIds }
            : documentId,
    };

    // IMPORTANT:
    // Only filter by userId when authentication exists.
    //
    // Option B = No login/register
    // Therefore userId can be undefined.
    if (userId) {
        query.userId = userId;
    } else if (guestId) {
        query.guestId = guestId;
    }

    console.log("🔍 MongoDB chunk query:", query);

    // ------------------------------------------
    // Get document chunks
    // ------------------------------------------
    const chunks = await DocumentChunk.find(query)
        .lean();

    console.log(
        `📦 Found ${chunks.length} chunks in MongoDB`
    );

    // ------------------------------------------
    // No chunks
    // ------------------------------------------
    if (chunks.length === 0) {
        console.log(
            "⚠️ No chunks found for this document"
        );

        return [];
    }

    // ------------------------------------------
    // Calculate similarity
    // ------------------------------------------
    const results = chunks
        .map((chunk) => {
            const similarity = cosineSimilarity(
                questionEmbedding,
                chunk.embedding
            );

            return {
                chunkId: chunk._id,
                chunkIndex: chunk.chunkIndex,
                text: chunk.text,
                similarity,
                documentId: chunk.documentId,
            };
        })
        .filter(
            (result) =>
                result.similarity > 0
        );

    // ------------------------------------------
    // Sort by similarity
    // ------------------------------------------
    results.sort(
        (a, b) =>
            b.similarity - a.similarity
    );

    // ------------------------------------------
    // Show similarity scores
    // ------------------------------------------
    console.log("📊 Similarity results:");

    results.slice(0, topK).forEach(
        (result, index) => {
            console.log(
                `${index + 1}. Chunk ${result.chunkIndex} → ${(
                    result.similarity * 100
                ).toFixed(2)}%`
            );
        }
    );
    console.log("\n📚 TOP RETRIEVED CHUNKS");

results.slice(0, topK).forEach((result, index) => {
    console.log("\n-------------------------");
    console.log(`Chunk Rank: ${index + 1}`);
    console.log(`Chunk Index: ${result.chunkIndex}`);
    console.log(
        `Similarity: ${(result.similarity * 100).toFixed(2)}%`
    );
    console.log("Text Preview:");
    console.log(result.text.substring(0, 500));
    console.log("-------------------------");
});

    // ------------------------------------------
    // Return top K
    // ------------------------------------------
    return results.slice(0, topK);
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    searchSimilarChunks,
};