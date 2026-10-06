// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const optionalAuth = require("../middleware/optionalAuthMiddleware");

// const {
//     uploadDocument,
//     getDocuments,
//     getDocumentById,
//     deleteDocument,
// } = require("../controllers/documentController");

// const router = express.Router();

// const uploadDirectory = path.join(__dirname, "../uploads");
// fs.mkdirSync(uploadDirectory, { recursive: true });

// // ==========================================
// // MULTER CONFIGURATION
// // ==========================================

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDirectory);
//     },

//     filename: (req, file, cb) => {
//         const uniqueName =
//             `${Date.now()}-${file.originalname}`;

//         cb(null, uniqueName);
//     },
// });

// const upload = multer({
//     storage,

//     fileFilter: (req, file, cb) => {
//         const extension = path.extname(file.originalname).toLowerCase();
//         if ([".pdf", ".docx"].includes(extension)) {
//             cb(null, true);
//         } else {
//             cb(
//                 new Error(
//                     "Only PDF and DOCX files are allowed"
//                 ),
//                 false
//             );
//         }
//     },

//     limits: {
//         fileSize:
//             20 * 1024 * 1024,
//     },
// });


// // ==========================================
// // Upload up to ten documents for authenticated users. Guest requests are
// // restricted to one document by the controller.
// // ==========================================

// router.post(
//     "/upload",
//     optionalAuth,
//     upload.fields([
//         { name: "documents", maxCount: 10 },
//         { name: "document", maxCount: 1 },
//     ]),
//     uploadDocument
// );


// // ==========================================
// // GET DOCUMENTS
// // ==========================================

// router.get(
//     "/",
//     optionalAuth,
//     getDocuments
// );


// // ==========================================
// // GET SINGLE DOCUMENT
// // ==========================================

// router.get(
//     "/:id",
//     getDocumentById
// );


// // ==========================================
// // DELETE DOCUMENT
// // ==========================================

// router.delete(
//     "/:id",
//     deleteDocument
// );


// module.exports = router;

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const optionalAuth = require("../middleware/optionalAuthMiddleware");

const {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.join(__dirname, "../uploads");

fs.mkdirSync(uploadDirectory, {
    recursive: true,
});

// ==========================================
// MULTER STORAGE CONFIGURATION
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}-${file.originalname}`;

        cb(null, uniqueName);
    },
});

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        const extension =
            path.extname(file.originalname).toLowerCase();

        // Allow only PDF and DOCX
        if (
            extension === ".pdf" ||
            extension === ".docx"
        ) {
            cb(null, true);
        } else {

            cb(
                new Error(
                    "Only PDF and DOCX files are allowed"
                ),
                false
            );
        }
    },

    // Maximum file size = 20 MB
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});

// ==========================================
// UPLOAD DOCUMENTS
// ==========================================
//
// Sandbox:
// - Guest allowed
// - One document
//
// Workspace:
// - Login required
// - Up to 10 documents
//
// The controller handles the Sandbox/Workspace
// authorization rules.
//

router.post(
    "/upload",

    optionalAuth,

    upload.fields([
        {
            name: "documents",
            maxCount: 10,
        },
        {
            name: "document",
            maxCount: 1,
        },
    ]),

    uploadDocument
);

// ==========================================
// GET ALL DOCUMENTS
// ==========================================
//
// Example:
//
// Sandbox:
// GET /documents?space=sandbox
//
// Workspace:
// GET /documents?space=workspace
//
// The controller handles ownership filtering.
//

router.get(
    "/",

    optionalAuth,

    getDocuments
);

// ==========================================
// GET SINGLE DOCUMENT
// ==========================================
//
// The optionalAuth middleware allows the controller
// to identify either:
//
// 1. Logged-in user
// 2. Guest using x-guest-id
//

router.get(
    "/:id",

    optionalAuth,

    getDocumentById
);

// ==========================================
// DELETE DOCUMENT
// ==========================================
//
// The controller verifies ownership before deleting.
//

router.delete(
    "/:id",

    optionalAuth,

    deleteDocument
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;