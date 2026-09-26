const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        guestId: {
            type: String,
            required: false,
        },

        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
        },

        question: {
            type: String,
            required: true,
        },

        answer: {
            type: String,
            required: true,
        },

        sources: [
            {
                chunkIndex: Number,
                similarity: Number,
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Chat", chatSchema);