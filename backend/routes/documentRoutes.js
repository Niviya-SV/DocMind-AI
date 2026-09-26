const express = require("express");
const multer = require("multer");
const path = require("path");
const optionalAuth = require("../middleware/optionalAuthMiddleware");

const {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${file.originalname}`;

        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,

    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if ([".pdf", ".docx"].includes(extension)) {
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

    limits: {
        fileSize:
            20 * 1024 * 1024,
    },
});


// ==========================================
// Upload up to ten documents for authenticated users. Guest requests are
// restricted to one document by the controller.
// ==========================================

router.post(
    "/upload",
    optionalAuth,
    upload.fields([
        { name: "documents", maxCount: 10 },
        { name: "document", maxCount: 1 },
    ]),
    uploadDocument
);


// ==========================================
// GET DOCUMENTS
// ==========================================

router.get(
    "/",
    optionalAuth,
    getDocuments
);


// ==========================================
// GET SINGLE DOCUMENT
// ==========================================

router.get(
    "/:id",
    getDocumentById
);


// ==========================================
// DELETE DOCUMENT
// ==========================================

router.delete(
    "/:id",
    deleteDocument
);


module.exports = router;