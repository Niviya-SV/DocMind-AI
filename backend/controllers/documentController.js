// const fs = require("fs");

// const Document = require("../models/Document");
// const DocumentChunk = require("../models/DocumentChunk");
// const Chat = require("../models/chat");

// const {
//     extractTextFromPDF,
//     extractTextFromWord,
//     splitTextIntoChunks,
// } = require("../services/pdfService");

// const {
//     generateEmbedding,
// } = require("../services/embeddingService");


// // ======================================================
// // UPLOAD + PROCESS PDF / WORD DOCUMENT
// // ======================================================

// const uploadDocument = async (req, res) => {
//     try {

//         // ==================================================
//         // USER / GUEST
//         // ==================================================

//         const userId = req.userId || null;

//         const guestId = userId
//             ? null
//             : req.headers["x-guest-id"];


//         // ==================================================
//         // SANDBOX / WORKSPACE
//         // ==================================================

//         const space = req.body.space || "sandbox";


//         // Validate space

//         if (!["sandbox", "workspace"].includes(space)) {

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "Invalid space. Use sandbox or workspace.",
//             });

//         }


//         // ==================================================
//         // GET FILES
//         // ==================================================

//         const files = [
//             ...(req.files?.documents || []),
//             ...(req.files?.document || []),
//         ];


//         // ==================================================
//         // CHECK FILE
//         // ==================================================

//         if (files.length === 0) {

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "Please upload at least one PDF or DOCX document",
//             });

//         }


//         // ==================================================
//         // GUEST SANDBOX LIMIT
//         // ==================================================

//         // Guest users can upload only one document
//         // in Sandbox.

//         if (
//             space === "sandbox" &&
//             !userId &&
//             files.length > 1
//         ) {

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "Guest access is limited to one document",
//             });

//         }


//         // ==================================================
//         // GUEST SESSION CHECK
//         // ==================================================

//         if (
//             space === "sandbox" &&
//             !userId &&
//             (
//                 !guestId ||
//                 !/^[a-zA-Z0-9-]{16,100}$/.test(guestId)
//             )
//         ) {

//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "A guest session is required",
//             });

//         }


//         // ==================================================
//         // CHECK EXISTING GUEST SANDBOX DOCUMENT
//         // ==================================================

//         if (
//             space === "sandbox" &&
//             !userId &&
//             await Document.exists({
//                 guestId,
//                 space: "sandbox",
//             })
//         ) {

//             return res.status(409).json({
//                 success: false,
//                 message:
//                     "Guest access is limited to one document. Sign up to upload more.",
//             });

//         }


//         // ==================================================
//         // PROCESS DOCUMENTS
//         // ==================================================

//         const processedDocuments = [];


//         for (const file of files) {

//             console.log("");
//             console.log("==========================================");
//             console.log(`📄 Processing: ${file.originalname}`);
//             console.log(`📦 Space: ${space}`);
//             console.log("==========================================");


//             let document = null;


//             try {

//                 // ==========================================
//                 // CREATE DOCUMENT
//                 // ==========================================

//                 document = await Document.create({

//                     userId,

//                     guestId:
//                         guestId || undefined,

//                     // IMPORTANT
//                     // sandbox OR workspace
//                     space,

//                     title:
//                         file.originalname.replace(
//                             /\.(pdf|docx?)$/i,
//                             ""
//                         ),

//                     fileName:
//                         file.originalname,

//                     filePath:
//                         file.path,

//                     fileSize:
//                         file.size,

//                     status:
//                         "processing",
//                 });


//                 console.log(
//                     `📁 Document created: ${document._id}`
//                 );

//                 console.log(
//                     `📦 Space saved: ${space}`
//                 );


//                 // ==========================================
//                 // EXTRACT TEXT
//                 // ==========================================

//                 console.log(
//                     "📖 Extracting text..."
//                 );


//                 const extractedData =
//                     /\.pdf$/i.test(
//                         file.originalname
//                     )
//                         ? await extractTextFromPDF(
//                             file.path
//                         )
//                         : await extractTextFromWord(
//                             file.path
//                         );


//                 console.log(
//                     `📄 Extracted ${
//                         extractedData.pages || 0
//                     } pages`
//                 );


//                 // ==========================================
//                 // EXTRACTED TEXT
//                 // ==========================================

//                 const extractedText =
//                     extractedData.text || "";


//                 console.log(
//                     "📝 Extracted text length:",
//                     extractedText.length
//                 );


//                 console.log(
//                     "📝 Extracted text preview:"
//                 );


//                 console.log(
//                     extractedText.length > 0
//                         ? extractedText.substring(
//                             0,
//                             500
//                         )
//                         : "❌ NO TEXT FOUND"
//                 );


//                 // ==========================================
//                 // CHECK TEXT
//                 // ==========================================

//                 if (!extractedText.trim()) {

//                     console.warn(
//                         `⚠️ No text extracted from ${file.originalname}`
//                     );


//                     document.status =
//                         "failed";

//                     await document.save();


//                     processedDocuments.push({

//                         id:
//                             document._id,

//                         title:
//                             document.title,

//                         fileName:
//                             document.fileName,

//                         fileSize:
//                             document.fileSize,

//                         pages:
//                             extractedData.pages || 0,

//                         chunks:
//                             0,

//                         status:
//                             "failed",

//                         message:
//                             "No readable text was found in this PDF. The PDF may be scanned/image-based.",
//                     });


//                     continue;
//                 }


//                 // ==========================================
//                 // SPLIT INTO CHUNKS
//                 // ==========================================

//                 console.log(
//                     "✂️ Splitting extracted text..."
//                 );


//                 const chunks =
//                     splitTextIntoChunks(
//                         extractedText
//                     );


//                 console.log(
//                     `✂️ Created ${chunks.length} chunks`
//                 );


//                 // ==========================================
//                 // CHECK CHUNKS
//                 // ==========================================

//                 if (chunks.length === 0) {

//                     console.warn(
//                         "⚠️ Text was extracted but no chunks were created"
//                     );


//                     document.status =
//                         "failed";

//                     await document.save();


//                     processedDocuments.push({

//                         id:
//                             document._id,

//                         title:
//                             document.title,

//                         fileName:
//                             document.fileName,

//                         fileSize:
//                             document.fileSize,

//                         pages:
//                             extractedData.pages || 0,

//                         chunks:
//                             0,

//                         status:
//                             "failed",

//                         message:
//                             "Text was extracted but no chunks could be created.",
//                     });


//                     continue;
//                 }


//                 // ==========================================
//                 // GENERATE EMBEDDINGS
//                 // ==========================================

//                 const chunkDocuments = [];


//                 console.log(
//                     `🧠 Generating ${chunks.length} embeddings...`
//                 );


//                 for (
//                     let index = 0;
//                     index < chunks.length;
//                     index++
//                 ) {

//                     console.log(
//                         `🧠 Embedding ${
//                             index + 1
//                         }/${chunks.length}`
//                     );


//                     const embedding =
//                         await generateEmbedding(
//                             chunks[index]
//                         );


//                     if (
//                         !embedding ||
//                         !Array.isArray(
//                             embedding
//                         ) ||
//                         embedding.length === 0
//                     ) {

//                         throw new Error(
//                             `Invalid embedding generated for chunk ${index}`
//                         );

//                     }


//                     chunkDocuments.push({

//                         documentId:
//                             document._id,

//                         userId,

//                         guestId:
//                             guestId || undefined,

//                         chunkIndex:
//                             index,

//                         text:
//                             chunks[index],

//                         embedding,
//                     });
//                 }


//                 // ==========================================
//                 // SAVE CHUNKS
//                 // ==========================================

//                 console.log(
//                     "💾 Saving document chunks..."
//                 );


//                 if (
//                     chunkDocuments.length > 0
//                 ) {

//                     await DocumentChunk.insertMany(
//                         chunkDocuments
//                     );

//                 }


//                 console.log(
//                     `💾 Saved ${
//                         chunkDocuments.length
//                     } chunks`
//                 );


//                 // ==========================================
//                 // UPDATE DOCUMENT
//                 // ==========================================

//                 document.status =
//                     "processed";


//                 await document.save();


//                 // ==========================================
//                 // ADD PROCESSED DOCUMENT
//                 // ==========================================

//                 processedDocuments.push({

//                     id:
//                         document._id,

//                     title:
//                         document.title,

//                     fileName:
//                         document.fileName,

//                     fileSize:
//                         document.fileSize,

//                     pages:
//                         extractedData.pages || 0,

//                     chunks:
//                         chunks.length,

//                     status:
//                         document.status,

//                     // Return space to frontend
//                     space:
//                         document.space,
//                 });


//                 console.log(
//                     `✅ Completed: ${file.originalname}`
//                 );

//             } catch (fileError) {

//                 console.error(
//                     `❌ Failed processing ${file.originalname}:`,
//                     fileError
//                 );


//                 // ==========================================
//                 // MARK DOCUMENT FAILED
//                 // ==========================================

//                 if (document) {

//                     document.status =
//                         "failed";

//                     await document.save();

//                 }


//                 processedDocuments.push({

//                     id:
//                         document
//                             ? document._id
//                             : null,

//                     title:
//                         file.originalname.replace(
//                             /\.(pdf|docx?)$/i,
//                             ""
//                         ),

//                     fileName:
//                         file.originalname,

//                     fileSize:
//                         file.size,

//                     status:
//                         "failed",

//                     chunks:
//                         0,

//                     space,

//                     message:
//                         fileError.message,
//                 });
//             }
//         }


//         // ==================================================
//         // SUCCESS / FAILED DOCUMENTS
//         // ==================================================

//         const successfulDocuments =
//             processedDocuments.filter(
//                 (doc) =>
//                     doc.status ===
//                     "processed"
//             );


//         const failedDocuments =
//             processedDocuments.filter(
//                 (doc) =>
//                     doc.status !==
//                     "processed"
//             );


//         // ==================================================
//         // FINAL RESPONSE
//         // ==================================================

//         res.status(201).json({

//             success:
//                 successfulDocuments.length >
//                 0,

//             message:
//                 failedDocuments.length === 0
//                     ? "All documents uploaded and processed successfully"
//                     : `${successfulDocuments.length} document(s) processed, ${failedDocuments.length} failed`,

//             documents:
//                 processedDocuments,
//         });


//     } catch (error) {

//         console.error(
//             "❌ Multiple document processing error:",
//             error
//         );


//         res.status(500).json({

//             success:
//                 false,

//             message:
//                 "Failed to process documents",

//             error:
//                 error.message,
//         });
//     }
// };


// // ======================================================
// // GET ALL DOCUMENTS
// // ======================================================

// const getDocuments = async (req, res) => {

//     try {

//         // ================================================
//         // GET SPACE FROM QUERY
//         // ================================================

//         const space =
//             req.query.space ||
//             "sandbox";


//         // ================================================
//         // VALIDATE SPACE
//         // ================================================

//         if (
//             !["sandbox", "workspace"]
//                 .includes(space)
//         ) {

//             return res.status(400).json({

//                 success:
//                     false,

//                 message:
//                     "Invalid space. Use sandbox or workspace.",
//             });

//         }


//         // ================================================
//         // BUILD QUERY
//         // ================================================

//         let query;


//         // Logged-in user

//         if (req.userId) {

//             query = {

//                 userId:
//                     req.userId,

//                 space,
//             };

//         }


//         // Guest user
//         // Guests only use Sandbox

//         else if (
//             req.headers["x-guest-id"]
//         ) {

//             query = {

//                 guestId:
//                     req.headers["x-guest-id"],

//                 space:
//                     "sandbox",
//             };

//         }


//         // No user / guest

//         else {

//             query = {
//                 _id: null,
//             };

//         }


//         // ================================================
//         // FIND DOCUMENTS
//         // ================================================

//         const documents =
//             await Document.find(
//                 query
//             ).sort({
//                 createdAt:
//                     -1,
//             });


//         // ================================================
//         // RESPONSE
//         // ================================================

//         res.status(200).json({

//             success:
//                 true,

//             documents,
//         });


//     } catch (error) {

//         console.error(
//             "❌ Get documents error:",
//             error
//         );


//         res.status(500).json({

//             success:
//                 false,

//             message:
//                 "Failed to fetch documents",

//             error:
//                 error.message,
//         });
//     }
// };


// // ======================================================
// // GET SINGLE DOCUMENT
// // ======================================================

// const getDocumentById = async (
//     req,
//     res
// ) => {

//     try {

//         const space =
//             req.query.space ||
//             "sandbox";


//         // ================================================
//         // VALIDATE SPACE
//         // ================================================

//         if (
//             !["sandbox", "workspace"]
//                 .includes(space)
//         ) {

//             return res.status(400).json({

//                 success:
//                     false,

//                 message:
//                     "Invalid space.",
//             });

//         }


//         // ================================================
//         // BUILD OWNERSHIP QUERY
//         // ================================================

//         let query = {

//             _id:
//                 req.params.id,

//             space,
//         };


//         // Logged-in user

//         if (req.userId) {

//             query.userId =
//                 req.userId;

//         }


//         // Guest

//         else if (
//             req.headers["x-guest-id"]
//         ) {

//             query.guestId =
//                 req.headers["x-guest-id"];

//             query.space =
//                 "sandbox";

//         }


//         // No authentication

//         else {

//             return res.status(401).json({

//                 success:
//                     false,

//                 message:
//                     "Authentication or guest session required",
//             });

//         }


//         // ================================================
//         // FIND DOCUMENT
//         // ================================================

//         const document =
//             await Document.findOne(
//                 query
//             );


//         if (!document) {

//             return res.status(404).json({

//                 success:
//                     false,

//                 message:
//                     "Document not found",
//             });

//         }


//         // ================================================
//         // RESPONSE
//         // ================================================

//         res.status(200).json({

//             success:
//                 true,

//             document,
//         });


//     } catch (error) {

//         console.error(
//             "❌ Get document error:",
//             error
//         );


//         res.status(500).json({

//             success:
//                 false,

//             message:
//                 "Failed to get document",

//             error:
//                 error.message,
//         });
//     }
// };


// // ======================================================
// // DELETE DOCUMENT
// // ======================================================

// const deleteDocument = async (
//     req,
//     res
// ) => {

//     try {

//         const space =
//             req.query.space ||
//             "sandbox";


//         // ================================================
//         // VALIDATE SPACE
//         // ================================================

//         if (
//             !["sandbox", "workspace"]
//                 .includes(space)
//         ) {

//             return res.status(400).json({

//                 success:
//                     false,

//                 message:
//                     "Invalid space.",
//             });

//         }


//         // ================================================
//         // BUILD OWNERSHIP QUERY
//         // ================================================

//         let query = {

//             _id:
//                 req.params.id,

//             space,
//         };


//         // Logged-in user

//         if (req.userId) {

//             query.userId =
//                 req.userId;

//         }


//         // Guest

//         else if (
//             req.headers["x-guest-id"]
//         ) {

//             query.guestId =
//                 req.headers["x-guest-id"];

//             query.space =
//                 "sandbox";

//         }


//         // No authentication

//         else {

//             return res.status(401).json({

//                 success:
//                     false,

//                 message:
//                     "Authentication or guest session required",
//             });

//         }


//         // ================================================
//         // FIND DOCUMENT
//         // ================================================

//         const document =
//             await Document.findOne(
//                 query
//             );


//         if (!document) {

//             return res.status(404).json({

//                 success:
//                     false,

//                 message:
//                     "Document not found",
//             });

//         }


//         // ================================================
//         // DELETE PHYSICAL FILE
//         // ================================================

//         if (
//             document.filePath &&
//             fs.existsSync(
//                 document.filePath
//             )
//         ) {

//             fs.unlinkSync(
//                 document.filePath
//             );


//             console.log(
//                 "🗑️ PDF file deleted"
//             );
//         }


//         // ================================================
//         // DELETE DOCUMENT CHUNKS
//         // ================================================

//         await DocumentChunk.deleteMany({

//             documentId:
//                 document._id,
//         });


//         console.log(
//             "🗑️ Document chunks deleted"
//         );


//         // ================================================
//         // DELETE CHAT HISTORY
//         // ================================================

//         await Chat.deleteMany({

//             documentId:
//                 document._id,
//         });


//         console.log(
//             "🗑️ Chat history deleted"
//         );


//         // ================================================
//         // DELETE DOCUMENT
//         // ================================================

//         await Document.deleteOne({

//             _id:
//                 document._id,
//         });


//         console.log(
//             "✅ Document deleted"
//         );


//         // ================================================
//         // RESPONSE
//         // ================================================

//         res.status(200).json({

//             success:
//                 true,

//             message:
//                 "Document deleted successfully",
//         });


//     } catch (error) {

//         console.error(
//             "❌ Delete document error:",
//             error
//         );


//         res.status(500).json({

//             success:
//                 false,

//             message:
//                 "Failed to delete document",

//             error:
//                 error.message,
//         });
//     }
// };


// // ======================================================
// // EXPORT
// // ======================================================

// module.exports = {

//     uploadDocument,

//     getDocuments,

//     getDocumentById,

//     deleteDocument,
// };


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

const reprocessWorkspaceDocuments = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication is required for Workspace documents.",
            });
        }

        const documents = await Document.find({
            userId: req.userId,
            space: "workspace",
        });

        const results = [];

        for (const document of documents) {
            const chunkCount = await DocumentChunk.countDocuments({
                documentId: document._id,
            });

            if (chunkCount > 0 && document.status === "processed") {
                results.push({
                    id: document._id,
                    status: "processed",
                    chunks: chunkCount,
                });
                continue;
            }

            if (!document.filePath || !fs.existsSync(document.filePath)) {
                document.status = "failed";
                await document.save();
                results.push({
                    id: document._id,
                    status: "failed",
                    chunks: 0,
                    message: "The original document file is missing from the server.",
                });
                continue;
            }

            try {
                const extractedData = /\.pdf$/i.test(document.fileName)
                    ? await extractTextFromPDF(document.filePath)
                    : await extractTextFromWord(document.filePath);
                const chunks = splitTextIntoChunks(extractedData.text || "");

                if (chunks.length === 0) {
                    throw new Error("No readable text was found in the document.");
                }

                const chunkDocuments = [];
                for (let index = 0; index < chunks.length; index += 1) {
                    const embedding = await generateEmbedding(chunks[index]);
                    if (!Array.isArray(embedding) || embedding.length === 0) {
                        throw new Error(`Invalid embedding generated for chunk ${index}`);
                    }

                    chunkDocuments.push({
                        documentId: document._id,
                        userId: document.userId,
                        chunkIndex: index,
                        text: chunks[index],
                        embedding,
                    });
                }

                await DocumentChunk.deleteMany({
                    documentId: document._id,
                });
                await DocumentChunk.insertMany(chunkDocuments);

                document.status = "processed";
                await document.save();
                results.push({
                    id: document._id,
                    status: "processed",
                    chunks: chunkDocuments.length,
                });
            } catch (error) {
                await DocumentChunk.deleteMany({
                    documentId: document._id,
                });
                document.status = "failed";
                await document.save();
                results.push({
                    id: document._id,
                    status: "failed",
                    chunks: 0,
                    message: error.message,
                });
            }
        }

        return res.status(200).json({
            success: results.every((result) => result.status === "processed"),
            documents: results,
        });
    } catch (error) {
        console.error("❌ Workspace reprocessing error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to prepare Workspace documents.",
            error: error.message,
        });
    }
};


// ======================================================
// UPLOAD + PROCESS DOCUMENT
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


        // ==================================================
        // VALIDATE SPACE
        // ==================================================

        if (!["sandbox", "workspace"].includes(space)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid space. Use sandbox or workspace.",
            });
        }


        // ==================================================
        // GET UPLOADED FILES
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
                    "Please upload a document.",
            });
        }


        // ==================================================
        // SANDBOX = EXACTLY ONE FILE
        // ==================================================

        if (space === "sandbox" && files.length !== 1) {
            return res.status(400).json({
                success: false,
                message:
                    "Sandbox allows exactly one document.",
            });
        }


        // ==================================================
        // SANDBOX = ONE DOCUMENT
        // ==================================================

        if (space === "sandbox") {
            const file = files[0];

            const isPDF =
                file.mimetype === "application/pdf" ||
                file.originalname
                    .toLowerCase()
                    .endsWith(".pdf");

            const isWord =
                file.mimetype ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                file.originalname
                    .toLowerCase()
                    .endsWith(".docx");

            if (!isPDF && !isWord) {
                // Delete uploaded invalid file
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }

                return res.status(400).json({
                    success: false,
                    message:
                        "Sandbox accepts PDF or DOCX files only.",
                });
            }
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
                    "A guest session is required.",
            });
        }


        // ==================================================
        // CHECK EXISTING SANDBOX DOCUMENT
        // ==================================================

        if (space === "sandbox") {
            let existingQuery;

            if (userId) {
                existingQuery = {
                    userId: userId,
                    space: "sandbox",
                };
            } else {
                existingQuery = {
                    guestId: guestId,
                    space: "sandbox",
                };
            }

            const existingSandboxDocument =
                await Document.findOne(existingQuery);

            if (existingSandboxDocument) {
                if (
                    existingSandboxDocument.filePath &&
                    fs.existsSync(existingSandboxDocument.filePath)
                ) {
                    fs.unlinkSync(existingSandboxDocument.filePath);
                }

                await Promise.all([
                    DocumentChunk.deleteMany({
                        documentId: existingSandboxDocument._id,
                    }),
                    Chat.deleteMany({
                        documentId: existingSandboxDocument._id,
                    }),
                ]);

                await Document.deleteOne({
                    _id: existingSandboxDocument._id,
                });
            }
        }


        // ==================================================
        // PROCESS DOCUMENTS
        // ==================================================

        const processedDocuments = [];


        for (const file of files) {
            console.log("");
            console.log("==========================================");
            console.log(
                `📄 Processing: ${file.originalname}`
            );
            console.log(`📦 Space: ${space}`);
            console.log("==========================================");


            let document = null;


            try {
                // ==========================================
                // CREATE DOCUMENT
                // ==========================================

                document = await Document.create({
                    userId: userId || undefined,

                    guestId:
                        guestId || undefined,

                    space: space,

                    title: file.originalname.replace(
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


                const isPDF =
                    /\.pdf$/i.test(
                        file.originalname
                    );


                const extractedData = isPDF
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
                // GET EXTRACTED TEXT
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

                        space:
                            document.space,

                        message:
                            "No readable text was found in this PDF. The PDF may be scanned or image-based.",
                    });


                    continue;
                }


                // ==========================================
                // SPLIT TEXT INTO CHUNKS
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

                        space:
                            document.space,

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

                        userId:
                            userId || undefined,

                        guestId:
                            guestId || undefined,

                        chunkIndex:
                            index,

                        text:
                            chunks[index],

                        embedding:
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
                    `💾 Saved ${chunkDocuments.length} chunks`
                );


                // ==========================================
                // UPDATE DOCUMENT STATUS
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

                    _id:
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
                // DELETE PARTIALLY CREATED CHUNKS
                // ==========================================

                if (document) {
                    try {
                        await DocumentChunk.deleteMany({
                            documentId:
                                document._id,
                        });
                    } catch (chunkDeleteError) {
                        console.error(
                            "Failed to cleanup chunks:",
                            chunkDeleteError
                        );
                    }
                }


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

                    _id:
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

                    space:
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
        // SANDBOX RESPONSE
        // ==================================================

        if (space === "sandbox") {
            const processed =
                successfulDocuments[0];

            if (!processed) {
                return res.status(500).json({
                    success: false,
                    message:
                        failedDocuments[0]?.message ||
                        "Failed to process Sandbox PDF.",
                    documents:
                        processedDocuments,
                });
            }


            return res.status(201).json({
                success: true,

                message:
                    "Sandbox PDF uploaded and processed successfully.",

                document:
                    processed,

                documents:
                    [processed],
            });
        }


        // ==================================================
        // WORKSPACE RESPONSE
        // ==================================================

        res.status(201).json({
            success:
                successfulDocuments.length > 0,

            message:
                failedDocuments.length === 0
                    ? "All documents uploaded and processed successfully"
                    : `${successfulDocuments.length} document(s) processed, ${failedDocuments.length} failed`,

            documents:
                processedDocuments,
        });


    } catch (error) {
        console.error(
            "❌ Document processing error:",
            error
        );


        res.status(500).json({
            success: false,

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
        // GET SPACE
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
                success: false,
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

                space:
                    space,
            };
        }

        // Guest user
        // Guests can only access Sandbox
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
                success: false,
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

            space:
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
                success: false,
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
                success: false,
                message:
                    "Document not found",
            });
        }


        // ================================================
        // RESPONSE
        // ================================================

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
                success: false,
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

            space:
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
                success: false,
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
                success: false,
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

        /*
         * Workspace:
         * Chat history can be deleted normally.
         *
         * Sandbox:
         * Normally no Sandbox chat history should exist,
         * but this cleanup is safe if any old records exist.
         */

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


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    uploadDocument,

    reprocessWorkspaceDocuments,

    getDocuments,
    getDocumentById,
    deleteDocument,
};