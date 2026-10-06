
const express = require("express");
const multer = require("multer");

const {
  uploadSandboxPDF,
  askSandboxQuestion,
} = require("../controllers/sandboxController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype !== "application/pdf" &&
      !file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      return callback(new Error("Only PDF files are allowed."));
    }

    callback(null, true);
  },
});

router.post(
  "/documents/upload",
  upload.single("documents"),
  (req, res, next) => {
    if (req.body.space !== "sandbox") {
      return res.status(400).json({
        success: false,
        message: "Sandbox uploads must include space=sandbox.",
      });
    }

    next();
  },
  uploadSandboxPDF
);

router.post("/chat/ask", askSandboxQuestion);

module.exports = router;
