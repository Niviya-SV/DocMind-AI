const mongoose = require("mongoose");

const documentChunkSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        chunkIndex: {
            type: Number,
            required: true,
        },

        text: {
            type: String,
            required: true,
        },

        embedding: {
            type: [Number],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const DocumentChunk = mongoose.model(
    "DocumentChunk",
    documentChunkSchema
);

module.exports = DocumentChunk;