const express = require("express");
const multer = require("multer");

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
        if (
            file.mimetype === "application/pdf"
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF files are allowed"
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
// UPLOAD MULTIPLE PDFs
// ==========================================

router.post(
    "/upload",
    upload.array("pdfs", 10),
    uploadDocument
);


// ==========================================
// GET DOCUMENTS
// ==========================================

router.get(
    "/",
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