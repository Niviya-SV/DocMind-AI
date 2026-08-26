const fs = require("fs");
const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
    try {
        console.log("📖 Reading PDF:", filePath);

        const dataBuffer = fs.readFileSync(filePath);

        const data = await pdfParse(dataBuffer);

        console.log(
            `📄 PDF extracted successfully: ${data.numpages} pages`
        );

        return {
            text: data.text,
            pages: data.numpages,
        };

    } catch (error) {
        console.error(
            "PDF extraction error:",
            error
        );

        throw new Error(
            "Failed to extract PDF text"
        );
    }
};


const splitTextIntoChunks = (
    text,
    chunkSize = 1000,
    overlap = 200
) => {
    if (!text || !text.trim()) {
        return [];
    }

    const chunks = [];

    let start = 0;

    while (start < text.length) {
        const end = Math.min(
            start + chunkSize,
            text.length
        );

        const chunk = text
            .slice(start, end)
            .trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        if (end >= text.length) {
            break;
        }

        start = end - overlap;
    }

    console.log(
        `✂️ Text split into ${chunks.length} chunks`
    );

    return chunks;
};


module.exports = {
    extractTextFromPDF,
    splitTextIntoChunks,
};