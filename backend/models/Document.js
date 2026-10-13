// const mongoose = require("mongoose");

// const documentSchema = new mongoose.Schema(
//     {
//         userId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: false,
//         },

//         guestId: {
//             type: String,
//             required: false,
//             index: true,
//         },

//         title: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         fileName: {
//             type: String,
//             required: true,
//         },

//         filePath: {
//             type: String,
//             required: true,
//         },

//         fileSize: {
//             type: Number,
//             default: 0,
//         },

//         status: {
//             type: String,
//             enum: ["uploaded", "processing", "processed", "failed"],
//             default: "uploaded",
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// const Document = mongoose.model("Document", documentSchema);

// module.exports = Document;

const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        guestId: {
            type: String,
            required: false,
            index: true,
        },

        // ------------------------------------------
        // DOCUMENT SPACE
        // sandbox = temporary/guest documents
        // workspace = logged-in user's documents
        // ------------------------------------------
        space: {
            type: String,
            enum: ["sandbox", "workspace"],
            default: "workspace",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        fileName: {
            type: String,
            required: true,
        },

        filePath: {
            type: String,
            required: true,
        },

        fileSize: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["uploaded", "processing", "processed", "failed"],
            default: "uploaded",
        },
    },
    {
        timestamps: true,
    }
);

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;