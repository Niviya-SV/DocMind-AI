

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


// ======================================================
// UPLOAD + PROCESS PDF / WORD DOCUMENT
// ======================================================

const uploadDocument = async (req, res) => {
    try {

        // ==================================================
        // USER / GUEST
        // ==================================================

        const userId = req.userId || null;

        const guestId = userId
            ? null
            : req.headers["x-guest-id"];


        // ==================================================
        // SANDBOX / WORKSPACE
        // ==================================================

        const space = req.body.space || "sandbox";


        // Validate space

        if (!["sandbox", "workspace"].includes(space)) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid space. Use sandbox or workspace.",
            });

        }


        // ==================================================
        // GET FILES
        // ==================================================

        const files = [
            ...(req.files?.documents || []),
            ...(req.files?.document || []),
        ];


        // ==================================================
        // CHECK FILE
        // ==================================================

        if (files.length === 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Please upload at least one PDF or DOCX document",
            });

        }


        // ==================================================
        // GUEST SANDBOX LIMIT
        // ==================================================

        // Guest users can upload only one document
        // in Sandbox.

        if (
            space === "sandbox" &&
            !userId &&
            files.length > 1
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Guest access is limited to one document",
            });

        }


        // ==================================================
        // GUEST SESSION CHECK
        // ==================================================

        if (
            space === "sandbox" &&
            !userId &&
            (
                !guestId ||
                !/^[a-zA-Z0-9-]{16,100}$/.test(guestId)
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "A guest session is required",
            });

        }


        // ==================================================
        // CHECK EXISTING GUEST SANDBOX DOCUMENT
        // ==================================================

        if (
            space === "sandbox" &&
            !userId &&
            await Document.exists({
                guestId,
                space: "sandbox",
            })
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "Guest access is limited to one document. Sign up to upload more.",
            });

        }


        // ==================================================
        // PROCESS DOCUMENTS
        // ==================================================

        const processedDocuments = [];


        for (const file of files) {

            console.log("");
            console.log("==========================================");
            console.log(`📄 Processing: ${file.originalname}`);
            console.log(`📦 Space: ${space}`);
            console.log("==========================================");


            let document = null;


            try {

                // ==========================================
                // CREATE DOCUMENT
                // ==========================================

                document = await Document.create({

                    userId,

                    guestId:
                        guestId || undefined,

                    // IMPORTANT
                    // sandbox OR workspace
                    space,

                    title:
                        file.originalname.replace(
                            /\.(pdf|docx?)$/i,
                            ""
                        ),

                    fileName:
                        file.originalname,

                    filePath:
                        file.path,

                    fileSize:
                        file.size,

                    status:
                        "processing",
                });


                console.log(
                    `📁 Document created: ${document._id}`
                );

                console.log(
                    `📦 Space saved: ${space}`
                );


                // ==========================================
                // EXTRACT TEXT
                // ==========================================

                console.log(
                    "📖 Extracting text..."
                );


                const extractedData =
                    /\.pdf$/i.test(
                        file.originalname
                    )
                        ? await extractTextFromPDF(
                            file.path
                        )
                        : await extractTextFromWord(
                            file.path
                        );


                console.log(
                    `📄 Extracted ${
                        extractedData.pages || 0
                    } pages`
                );


                // ==========================================
                // EXTRACTED TEXT
                // ==========================================

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


                // ==========================================
                // CHECK TEXT
                // ==========================================

                if (!extractedText.trim()) {

                    console.warn(
                        `⚠️ No text extracted from ${file.originalname}`
                    );


                    document.status =
                        "failed";

                    await document.save();


                    processedDocuments.push({

                        id:
                            document._id,

                        title:
                            document.title,

                        fileName:
                            document.fileName,

                        fileSize:
                            document.fileSize,

                        pages:
                            extractedData.pages || 0,

                        chunks:
                            0,

                        status:
                            "failed",

                        message:
                            "No readable text was found in this PDF. The PDF may be scanned/image-based.",
                    });


                    continue;
                }


                // ==========================================
                // SPLIT INTO CHUNKS
                // ==========================================

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


                // ==========================================
                // CHECK CHUNKS
                // ==========================================

                if (chunks.length === 0) {

                    console.warn(
                        "⚠️ Text was extracted but no chunks were created"
                    );


                    document.status =
                        "failed";

                    await document.save();


                    processedDocuments.push({

                        id:
                            document._id,

                        title:
                            document.title,

                        fileName:
                            document.fileName,

                        fileSize:
                            document.fileSize,

                        pages:
                            extractedData.pages || 0,

                        chunks:
                            0,

                        status:
                            "failed",

                        message:
                            "Text was extracted but no chunks could be created.",
                    });


                    continue;
                }


                // ==========================================
                // GENERATE EMBEDDINGS
                // ==========================================

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
                        `🧠 Embedding ${
                            index + 1
                        }/${chunks.length}`
                    );


                    const embedding =
                        await generateEmbedding(
                            chunks[index]
                        );


                    if (
                        !embedding ||
                        !Array.isArray(
                            embedding
                        ) ||
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

                        guestId:
                            guestId || undefined,

                        chunkIndex:
                            index,

                        text:
                            chunks[index],

                        embedding,
                    });
                }


                // ==========================================
                // SAVE CHUNKS
                // ==========================================

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
                    `💾 Saved ${
                        chunkDocuments.length
                    } chunks`
                );


                // ==========================================
                // UPDATE DOCUMENT
                // ==========================================

                document.status =
                    "processed";


                await document.save();


                // ==========================================
                // ADD PROCESSED DOCUMENT
                // ==========================================

                processedDocuments.push({

                    id:
                        document._id,

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

                    // Return space to frontend
                    space:
                        document.space,
                });


                console.log(
                    `✅ Completed: ${file.originalname}`
                );

            } catch (fileError) {

                console.error(
                    `❌ Failed processing ${file.originalname}:`,
                    fileError
                );


                // ==========================================
                // MARK DOCUMENT FAILED
                // ==========================================

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
                            /\.(pdf|docx?)$/i,
                            ""
                        ),

                    fileName:
                        file.originalname,

                    fileSize:
                        file.size,

                    status:
                        "failed",

                    chunks:
                        0,

                    space,

                    message:
                        fileError.message,
                });
            }
        }


        // ==================================================
        // SUCCESS / FAILED DOCUMENTS
        // ==================================================

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


        // ==================================================
        // FINAL RESPONSE
        // ==================================================

        res.status(201).json({

            success:
                successfulDocuments.length >
                0,

            message:
                failedDocuments.length === 0
                    ? "All documents uploaded and processed successfully"
                    : `${successfulDocuments.length} document(s) processed, ${failedDocuments.length} failed`,

            documents:
                processedDocuments,
        });


    } catch (error) {

        console.error(
            "❌ Multiple document processing error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to process documents",

            error:
                error.message,
        });
    }
};


// ======================================================
// GET ALL DOCUMENTS
// ======================================================

const getDocuments = async (req, res) => {

    try {

        // ================================================
        // GET SPACE FROM QUERY
        // ================================================

        const space =
            req.query.space ||
            "sandbox";


        // ================================================
        // VALIDATE SPACE
        // ================================================

        if (
            !["sandbox", "workspace"]
                .includes(space)
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid space. Use sandbox or workspace.",
            });

        }


        // ================================================
        // BUILD QUERY
        // ================================================

        let query;


        // Logged-in user

        if (req.userId) {

            query = {

                userId:
                    req.userId,

                space,
            };

        }


        // Guest user
        // Guests only use Sandbox

        else if (
            req.headers["x-guest-id"]
        ) {

            query = {

                guestId:
                    req.headers["x-guest-id"],

                space:
                    "sandbox",
            };

        }


        // No user / guest

        else {

            query = {
                _id: null,
            };

        }


        // ================================================
        // FIND DOCUMENTS
        // ================================================

        const documents =
            await Document.find(
                query
            ).sort({
                createdAt:
                    -1,
            });


        // ================================================
        // RESPONSE
        // ================================================

        res.status(200).json({

            success:
                true,

            documents,
        });


    } catch (error) {

        console.error(
            "❌ Get documents error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to fetch documents",

            error:
                error.message,
        });
    }
};


// ======================================================
// GET SINGLE DOCUMENT
// ======================================================

const getDocumentById = async (
    req,
    res
) => {

    try {

        const space =
            req.query.space ||
            "sandbox";


        // ================================================
        // VALIDATE SPACE
        // ================================================

        if (
            !["sandbox", "workspace"]
                .includes(space)
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid space.",
            });

        }


        // ================================================
        // BUILD OWNERSHIP QUERY
        // ================================================

        let query = {

            _id:
                req.params.id,

            space,
        };


        // Logged-in user

        if (req.userId) {

            query.userId =
                req.userId;

        }


        // Guest

        else if (
            req.headers["x-guest-id"]
        ) {

            query.guestId =
                req.headers["x-guest-id"];

            query.space =
                "sandbox";

        }


        // No authentication

        else {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Authentication or guest session required",
            });

        }


        // ================================================
        // FIND DOCUMENT
        // ================================================

        const document =
            await Document.findOne(
                query
            );


        if (!document) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Document not found",
            });

        }


        // ================================================
        // RESPONSE
        // ================================================

        res.status(200).json({

            success:
                true,

            document,
        });


    } catch (error) {

        console.error(
            "❌ Get document error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to get document",

            error:
                error.message,
        });
    }
};


// ======================================================
// DELETE DOCUMENT
// ======================================================

const deleteDocument = async (
    req,
    res
) => {

    try {

        const space =
            req.query.space ||
            "sandbox";


        // ================================================
        // VALIDATE SPACE
        // ================================================

        if (
            !["sandbox", "workspace"]
                .includes(space)
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid space.",
            });

        }


        // ================================================
        // BUILD OWNERSHIP QUERY
        // ================================================

        let query = {

            _id:
                req.params.id,

            space,
        };


        // Logged-in user

        if (req.userId) {

            query.userId =
                req.userId;

        }


        // Guest

        else if (
            req.headers["x-guest-id"]
        ) {

            query.guestId =
                req.headers["x-guest-id"];

            query.space =
                "sandbox";

        }


        // No authentication

        else {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Authentication or guest session required",
            });

        }


        // ================================================
        // FIND DOCUMENT
        // ================================================

        const document =
            await Document.findOne(
                query
            );


        if (!document) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Document not found",
            });

        }


        // ================================================
        // DELETE PHYSICAL FILE
        // ================================================

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


        // ================================================
        // DELETE DOCUMENT CHUNKS
        // ================================================

        await DocumentChunk.deleteMany({

            documentId:
                document._id,
        });


        console.log(
            "🗑️ Document chunks deleted"
        );


        // ================================================
        // DELETE CHAT HISTORY
        // ================================================

        await Chat.deleteMany({

            documentId:
                document._id,
        });


        console.log(
            "🗑️ Chat history deleted"
        );


        // ================================================
        // DELETE DOCUMENT
        // ================================================

        await Document.deleteOne({

            _id:
                document._id,
        });


        console.log(
            "✅ Document deleted"
        );


        // ================================================
        // RESPONSE
        // ================================================

        res.status(200).json({

            success:
                true,

            message:
                "Document deleted successfully",
        });


    } catch (error) {

        console.error(
            "❌ Delete document error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to delete document",

            error:
                error.message,
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    uploadDocument,

    getDocuments,

    getDocumentById,

    deleteDocument,
};