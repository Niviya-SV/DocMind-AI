const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// ==========================================
// EXTRACT TEXT FROM PDF
// ==========================================
const extractTextFromPDF = async (filePath) => {
    try {
        console.log("📖 Reading PDF:", filePath);

        // Check file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(
                `PDF file not found: ${filePath}`
            );
        }

        const dataBuffer = fs.readFileSync(filePath);

        console.log(
            `📦 PDF buffer size: ${dataBuffer.length} bytes`
        );

        if (dataBuffer.length === 0) {
            throw new Error(
                "PDF file is empty"
            );
        }

        // ------------------------------------------
        // Parse PDF
        // ------------------------------------------

        const data = await pdfParse(dataBuffer);

        const text = data.text || "";

        console.log(
            `📄 PDF extracted successfully: ${data.numpages} pages`
        );

        console.log(
            `📝 Extracted text length: ${text.length}`
        );

        // ------------------------------------------
        // Debug preview
        // ------------------------------------------

        if (text.trim().length > 0) {

            console.log(
                "📝 Extracted text preview:"
            );

            console.log(
                text
                    .trim()
                    .substring(0, 1000)
            );

        } else {

            console.log(
                "❌ NO TEXT FOUND IN PDF"
            );

        }

        return {
            text: text,
            pages: data.numpages || 0,
        };

    } catch (error) {

        console.error(
            "❌ PDF extraction error:"
        );

        console.error(error);

        throw new Error(
            `Failed to extract PDF text: ${error.message}`
        );
    }
};


// ==========================================
// SPLIT TEXT INTO CHUNKS
// ==========================================
const splitTextIntoChunks = (
    text,
    chunkSize = 1000,
    overlap = 200
) => {

    console.log("✂️ Starting text chunking...");

    // ------------------------------------------
    // Validate text
    // ------------------------------------------

    if (
        !text ||
        typeof text !== "string" ||
        !text.trim()
    ) {

        console.log(
            "❌ Cannot create chunks: empty text"
        );

        return [];
    }

    // ------------------------------------------
    // Clean text
    // ------------------------------------------

    const cleanedText = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    console.log(
        `📝 Cleaned text length: ${cleanedText.length}`
    );

    // ------------------------------------------
    // Create chunks
    // ------------------------------------------

    const chunks = [];

    let start = 0;

    while (start < cleanedText.length) {

        let end = Math.min(
            start + chunkSize,
            cleanedText.length
        );

        let chunk = cleanedText
            .slice(start, end)
            .trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        // Stop when we reach the end
        if (end >= cleanedText.length) {
            break;
        }

        // Move forward with overlap
        start = end - overlap;

        // Safety check
        if (start < 0) {
            start = 0;
        }
    }

    console.log(
        `✂️ Text split into ${chunks.length} chunks`
    );

    // ------------------------------------------
    // Show first chunk
    // ------------------------------------------

    if (chunks.length > 0) {

        console.log(
            "📦 First chunk preview:"
        );

        console.log(
            chunks[0].substring(0, 500)
        );
    }

    return chunks;
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    extractTextFromPDF,
    extractTextFromWord: async (filePath) => {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Word file not found: ${filePath}`);
        }

        const result = await mammoth.extractRawText({ path: filePath });
        return { text: result.value || "", pages: 0 };
    },
    splitTextIntoChunks,
};