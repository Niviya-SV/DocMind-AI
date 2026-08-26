const DocumentChunk = require("../models/DocumentChunk");
const { generateEmbedding } = require("./embeddingService");

const cosineSimilarity = (vectorA, vectorB) => {
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


const searchSimilarChunks = async (
    question,
    documentId,
    userId,
    topK = 5
) => {
    // Generate embedding for the question
    const questionEmbedding =
        await generateEmbedding(question);

    // Get chunks belonging to this document/user
    const chunks = await DocumentChunk.find({
        documentId,
        userId,
    }).lean();

    // Calculate similarity
    const results = chunks.map((chunk) => {
        const similarity = cosineSimilarity(
            questionEmbedding,
            chunk.embedding
        );

        return {
            chunkId: chunk._id,
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
            similarity,
        };
    });

    // Sort highest similarity first
    results.sort(
        (a, b) => b.similarity - a.similarity
    );

    // Return top results
    return results.slice(0, topK);
};


module.exports = {
    searchSimilarChunks,
};