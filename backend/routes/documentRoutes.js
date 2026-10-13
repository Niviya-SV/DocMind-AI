

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

// // ==========================================
// // UPLOAD DIRECTORY
// // ==========================================

// const uploadDirectory = path.join(__dirname, "../uploads");

// fs.mkdirSync(uploadDirectory, {
//     recursive: true,
// });

// // ==========================================
// // MULTER STORAGE CONFIGURATION
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

// // ==========================================
// // MULTER CONFIGURATION
// // ==========================================

// const upload = multer({

//     storage,

//     fileFilter: (req, file, cb) => {

//         const extension =
//             path.extname(file.originalname).toLowerCase();

//         // Allow only PDF and DOCX
//         if (
//             extension === ".pdf" ||
//             extension === ".docx"
//         ) {
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

//     // Maximum file size = 20 MB
//     limits: {
//         fileSize: 20 * 1024 * 1024,
//     },
// });

// // ==========================================
// // UPLOAD DOCUMENTS
// // ==========================================
// //
// // Sandbox:
// // - Guest allowed
// // - One document
// //
// // Workspace:
// // - Login required
// // - Up to 10 documents
// //
// // The controller handles the Sandbox/Workspace
// // authorization rules.
// //

// router.post(
//     "/upload",

//     optionalAuth,

//     upload.fields([
//         {
//             name: "documents",
//             maxCount: 10,
//         },
//         {
//             name: "document",
//             maxCount: 1,
//         },
//     ]),

//     uploadDocument
// );

// // ==========================================
// // GET ALL DOCUMENTS
// // ==========================================
// //
// // Example:
// //
// // Sandbox:
// // GET /documents?space=sandbox
// //
// // Workspace:
// // GET /documents?space=workspace
// //
// // The controller handles ownership filtering.
// //

// router.get(
//     "/",

//     optionalAuth,

//     getDocuments
// );

// // ==========================================
// // GET SINGLE DOCUMENT
// // ==========================================
// //
// // The optionalAuth middleware allows the controller
// // to identify either:
// //
// // 1. Logged-in user
// // 2. Guest using x-guest-id
// //

// router.get(
//     "/:id",

//     optionalAuth,

//     getDocumentById
// );

// // ==========================================
// // DELETE DOCUMENT
// // ==========================================
// //
// // The controller verifies ownership before deleting.
// //

// router.delete(
//     "/:id",

//     optionalAuth,

//     deleteDocument
// );

// // ==========================================
// // EXPORT ROUTER
// // ==========================================

// module.exports = router;

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const express = require("express");
const router = express.Router();
const optionalAuth = require("../middleware/optionalAuthMiddleware");

const {
    uploadDocument,
    reprocessWorkspaceDocuments,
    getDocuments,
    getDocumentById,
    deleteDocument,
} = require("../controllers/documentController");


// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDir = path.join(
    __dirname,
    "../uploads"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true,
    });
}


// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    },
});


// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
    const isPDF =
        file.mimetype === "application/pdf" ||
        path.extname(file.originalname)
            .toLowerCase() === ".pdf";

    const isWord =
        file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        path.extname(file.originalname)
            .toLowerCase() === ".docx";

    // Sandbox accepts the same document formats as Workspace.
    if (req.body?.space === "sandbox") {
        if (!isPDF && !isWord) {
            return cb(
                new Error(
                    "Only PDF or DOCX files are allowed."
                )
            );
        }

        return cb(null, true);
    }

    // Workspace = PDF / DOCX
    if (isPDF || isWord) {
        return cb(null, true);
    }

    return cb(
        new Error(
            "Only PDF or DOCX files are allowed."
        )
    );
};


// ======================================================
// MULTER
// ======================================================

const upload = multer({
    storage,

    limits: {
        // 500 MB
        fileSize:
            500 * 1024 * 1024,
    },

    fileFilter,
});


// ======================================================
// UPLOAD
// ======================================================

router.post(
    "/upload",

    optionalAuth,

    upload.fields([
        {
            name: "documents",
        },
        {
            name: "document",
            maxCount: 1,
        },
    ]),

    uploadDocument
);


// ======================================================
// GET DOCUMENTS
// ======================================================

router.get(
    "/",
    optionalAuth,
    getDocuments
);

router.post(
    "/reprocess",
    optionalAuth,
    reprocessWorkspaceDocuments
);


// ======================================================
// GET SINGLE DOCUMENT
// ======================================================

router.get(
    "/:id",
    optionalAuth,
    getDocumentById
);


// ======================================================
// DELETE DOCUMENT
// ======================================================

router.delete(
    "/:id",
    optionalAuth,
    deleteDocument
);


// ======================================================
// MULTER ERROR HANDLER
// ======================================================

router.use(
    (error, req, res, next) => {
        if (error instanceof multer.MulterError) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {
                return res.status(413).json({
                    success: false,
                    message:
                        "File is too large. Maximum allowed size is 500 MB.",
                });
            }

            if (
                error.code ===
                "LIMIT_UNEXPECTED_FILE"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Too many files uploaded.",
                });
            }

            return res.status(400).json({
                success: false,
                message:
                    error.message,
            });
        }


        if (error) {
            return res.status(400).json({
                success: false,
                message:
                    error.message,
            });
        }

        next();
    }
);


module.exports = router;