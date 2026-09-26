const fs = require("fs");

const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");
const Chat = require("../models/chat");

const {
    extractTextFromPDF,
    extractTextFromWord,
    splitTextIntoChunks,
} = require("../services/pdfService");

const {
    generateEmbedding,
} = require("../services/embeddingService");

// ==========================================
// UPLOAD + PROCESS ONE PDF OR WORD DOCUMENT
// ==========================================

const uploadDocument = async (req, res) => {
    try {
        // ------------------------------------------
        const userId = req.userId || null;
        const guestId = userId ? null : req.headers["x-guest-id"];

        // Check uploaded file and guest session
        // ------------------------------------------

        const files = [
            ...(req.files?.documents || []),
            ...(req.files?.document || []),
        ];

        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one PDF or DOCX document",
            });
        }

        if (!userId && files.length > 1) {
            return res.status(400).json({
                success: false,
                message: "Guest access is limited to one document",
            });
        }

        if (!userId && (!guestId || !/^[a-zA-Z0-9-]{16,100}$/.test(guestId))) {
            return res.status(400).json({
                success: false,
                message: "A guest session is required",
            });
        }

        if (!userId && await Document.exists({ guestId })) {
            return res.status(409).json({
                success: false,
                message: "Guest access is limited to one document. Sign up to upload more.",
            });
        }

        const processedDocuments = [];

        // ------------------------------------------
        // Process every uploaded PDF
        // ------------------------------------------

        for (const file of files) {
            console.log("");
            console.log("==========================================");
            console.log(`📄 Processing: ${file.originalname}`);
            console.log("==========================================");

            let document = null;

            try {
                // ------------------------------------------
                // Create document record
                // ------------------------------------------

                document = await Document.create({
                    userId,
                    guestId: guestId || undefined,
                    title: file.originalname.replace(
                        /\.(pdf|docx?)$/i,
                        ""
                    ),

                    fileName: file.originalname,

                    filePath: file.path,

                    fileSize: file.size,

                    status: "processing",
                });

                console.log(
                    `📁 Document created: ${document._id}`
                );

                // ------------------------------------------
                // Extract PDF text
                // ------------------------------------------

                console.log("📖 Extracting text...");

                const extractedData = /\.pdf$/i.test(file.originalname)
                    ? await extractTextFromPDF(file.path)
                    : await extractTextFromWord(file.path);

                console.log(
                    `📄 Extracted ${extractedData.pages || 0} pages`
                );

                // ------------------------------------------
                // DEBUG: Check extracted text
                // ------------------------------------------

                const extractedText =
                    extractedData.text || "";

                console.log(
                    "📝 Extracted text length:",
                    extractedText.length
                );

                console.log(
                    "📝 Extracted text preview:"
                );

                console.log(
                    extractedText.length > 0
                        ? extractedText.substring(
                              0,
                              500
                          )
                        : "❌ NO TEXT FOUND"
                );

                // ------------------------------------------
                // Check whether text was extracted
                // ------------------------------------------

                if (!extractedText.trim()) {
                    console.warn(
                        `⚠️ No text extracted from ${file.originalname}`
                    );

                    document.status = "failed";

                    await document.save();

                    processedDocuments.push({
                        id: document._id,
                        title: document.title,
                        fileName: document.fileName,
                        fileSize: document.fileSize,
                        pages: extractedData.pages || 0,
                        chunks: 0,
                        status: "failed",
                        message:
                            "No readable text was found in this PDF. The PDF may be scanned/image-based.",
                    });

                    continue;
                }

                // ------------------------------------------
                // Split text into chunks
                // ------------------------------------------

                console.log(
                    "✂️ Splitting extracted text..."
                );

                const chunks =
                    splitTextIntoChunks(
                        extractedText
                    );

                console.log(
                    `✂️ Created ${chunks.length} chunks`
                );

                // ------------------------------------------
                // Check chunks
                // ------------------------------------------

                if (chunks.length === 0) {
                    console.warn(
                        "⚠️ Text was extracted but no chunks were created"
                    );

                    document.status = "failed";

                    await document.save();

                    processedDocuments.push({
                        id: document._id,
                        title: document.title,
                        fileName: document.fileName,
                        fileSize: document.fileSize,
                        pages: extractedData.pages || 0,
                        chunks: 0,
                        status: "failed",
                        message:
                            "Text was extracted but no chunks could be created.",
                    });

                    continue;
                }

                // ------------------------------------------
                // Generate embeddings
                // ------------------------------------------

                const chunkDocuments = [];

                console.log(
                    `🧠 Generating ${chunks.length} embeddings...`
                );

                for (
                    let index = 0;
                    index < chunks.length;
                    index++
                ) {
                    console.log(
                        `🧠 Embedding ${index + 1}/${chunks.length}`
                    );

                    const embedding =
                        await generateEmbedding(
                            chunks[index]
                        );

                    if (
                        !embedding ||
                        !Array.isArray(embedding) ||
                        embedding.length === 0
                    ) {
                        throw new Error(
                            `Invalid embedding generated for chunk ${index}`
                        );
                    }

                    chunkDocuments.push({
                        documentId:
                            document._id,

                        userId,

                        guestId: guestId || undefined,

                        chunkIndex:
                            index,

                        text:
                            chunks[index],

                        embedding:
                            embedding,
                    });
                }

                // ------------------------------------------
                // Save chunks
                // ------------------------------------------

                console.log(
                    "💾 Saving document chunks..."
                );

                if (
                    chunkDocuments.length > 0
                ) {
                    await DocumentChunk.insertMany(
                        chunkDocuments
                    );
                }

                console.log(
                    `💾 Saved ${chunkDocuments.length} chunks`
                );

                // ------------------------------------------
                // Update document status
                // ------------------------------------------

                document.status =
                    "processed";

                await document.save();

                // ------------------------------------------
                // Add processed document
                // ------------------------------------------

                processedDocuments.push({
                    id: document._id,

                    title:
                        document.title,

                    fileName:
                        document.fileName,

                    fileSize:
                        document.fileSize,

                        pages:
                            extractedData.pages || 0,

                    chunks:
                        chunks.length,

                    status:
                        document.status,
                });

                console.log(
                    `✅ Completed: ${file.originalname}`
                );
            } catch (fileError) {
                console.error(
                    `❌ Failed processing ${file.originalname}:`,
                    fileError
                );

                // ------------------------------------------
                // Mark document as failed
                // ------------------------------------------

                if (document) {
                    document.status =
                        "failed";

                    await document.save();
                }

                processedDocuments.push({
                    id:
                        document
                            ? document._id
                            : null,

                    title:
                        file.originalname.replace(
                            /\.pdf$/i,
                            ""
                        ),

                    fileName:
                        file.originalname,

                    fileSize:
                        file.size,

                    status:
                        "failed",

                    chunks: 0,

                    message:
                        fileError.message,
                });
            }
        }

        // ------------------------------------------
        // Final response
        // ------------------------------------------

        const successfulDocuments =
            processedDocuments.filter(
                (doc) =>
                    doc.status ===
                    "processed"
            );

        const failedDocuments =
            processedDocuments.filter(
                (doc) =>
                    doc.status !==
                    "processed"
            );

        res.status(201).json({
            success:
                successfulDocuments.length >
                0,

            message:
                failedDocuments.length === 0
                    ? "All PDFs uploaded and processed successfully"
                    : `${successfulDocuments.length} PDF(s) processed, ${failedDocuments.length} PDF(s) failed`,

            documents:
                processedDocuments,
        });
    } catch (error) {
        console.error(
            "❌ Multiple PDF processing error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to process PDFs",

            error:
                error.message,
        });
    }
};

// ==========================================
// GET ALL DOCUMENTS
// ==========================================

const getDocuments = async (req, res) => {
    try {
        const query = req.userId
            ? { userId: req.userId }
            : req.headers["x-guest-id"]
            ? { guestId: req.headers["x-guest-id"] }
            : { _id: null };

        const documents =
            await Document.find(query)
                .sort({
                    createdAt: -1,
                });

        res.status(200).json({
            success: true,
            documents,
        });
    } catch (error) {
        console.error(
            "❌ Get documents error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to fetch documents",

            error:
                error.message,
        });
    }
};

// ==========================================
// GET SINGLE DOCUMENT
// ==========================================

const getDocumentById = async (
    req,
    res
) => {
    try {
        const document =
            await Document.findById(
                req.params.id
            );

        if (!document) {
            return res.status(404).json({
                success: false,

                message:
                    "Document not found",
            });
        }

        res.status(200).json({
            success: true,
            document,
        });
    } catch (error) {
        console.error(
            "❌ Get document error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to fetch document",

            error:
                error.message,
        });
    }
};

// ==========================================
// DELETE DOCUMENT
// ==========================================

const deleteDocument = async (
    req,
    res
) => {
    try {
        const document =
            await Document.findById(
                req.params.id
            );

        if (!document) {
            return res.status(404).json({
                success: false,

                message:
                    "Document not found",
            });
        }

        // ------------------------------------------
        // Delete physical PDF
        // ------------------------------------------

        if (
            document.filePath &&
            fs.existsSync(
                document.filePath
            )
        ) {
            fs.unlinkSync(
                document.filePath
            );

            console.log(
                "🗑️ PDF file deleted"
            );
        }

        // ------------------------------------------
        // Delete document chunks
        // ------------------------------------------

        await DocumentChunk.deleteMany({
            documentId:
                document._id,
        });

        console.log(
            "🗑️ Document chunks deleted"
        );

        // ------------------------------------------
        // Delete chat history
        // ------------------------------------------

        await Chat.deleteMany({
            documentId:
                document._id,
        });

        console.log(
            "🗑️ Chat history deleted"
        );

        // ------------------------------------------
        // Delete document
        // ------------------------------------------

        await Document.deleteOne({
            _id:
                document._id,
        });

        console.log(
            "✅ Document deleted"
        );

        res.status(200).json({
            success: true,

            message:
                "Document deleted successfully",
        });
    } catch (error) {
        console.error(
            "❌ Delete document error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to delete document",

            error:
                error.message,
        });
    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
};