const fs = require("fs");

const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");
const Chat = require("../models/chat");

const {
    extractTextFromPDF,
    splitTextIntoChunks,
} = require("../services/pdfService");

const {
    generateEmbedding,
} = require("../services/embeddingService");


// ==========================================
// UPLOAD + PROCESS MULTIPLE PDFs
// ==========================================

const uploadDocument = async (req, res) => {
    try {
        // Check files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one PDF file",
            });
        }

        const processedDocuments = [];

        // Process each PDF
        for (const file of req.files) {
            console.log(
                `📄 Processing: ${file.originalname}`
            );

            // ------------------------------------------
            // Create document
            // ------------------------------------------

            const document = await Document.create({
                title: file.originalname.replace(
                    /\.pdf$/i,
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

            console.log(
                "📖 Extracting text..."
            );

            const pdfData =
                await extractTextFromPDF(
                    file.path
                );

            console.log(
                `📄 Extracted ${pdfData.pages} pages`
            );

            // ------------------------------------------
            // Split text into chunks
            // ------------------------------------------

            const chunks =
                splitTextIntoChunks(
                    pdfData.text
                );

            console.log(
                `✂️ Created ${chunks.length} chunks`
            );

            // ------------------------------------------
            // Generate embeddings
            // ------------------------------------------

            const chunkDocuments = [];

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

                chunkDocuments.push({
                    documentId:
                        document._id,

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

            if (
                chunkDocuments.length > 0
            ) {
                await DocumentChunk.insertMany(
                    chunkDocuments
                );
            }

            console.log(
                "💾 Document chunks saved"
            );

            // ------------------------------------------
            // Update document status
            // ------------------------------------------

            document.status =
                "processed";

            await document.save();

            // ------------------------------------------
            // Add response information
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
                    pdfData.pages,

                chunks:
                    chunks.length,

                status:
                    document.status,
            });

            console.log(
                `✅ Completed: ${file.originalname}`
            );
        }

        // ------------------------------------------
        // Final response
        // ------------------------------------------

        res.status(201).json({
            success: true,

            message:
                "All PDFs uploaded and processed successfully",

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
        const documents =
            await Document.find()
                .sort({
                    createdAt: -1,
                });

        res.status(200).json({
            success: true,

            documents:
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

            document:
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
        // Delete chunks
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