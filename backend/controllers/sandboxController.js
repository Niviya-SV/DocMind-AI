
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const crypto = require("crypto");

// Sandbox documents exist only in memory.
// They are not saved to MongoDB or Workspace history.
const sandboxDocuments = new Map();

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

function splitIntoChunks(text, size = 1200, overlap = 200) {
  const chunks = [];
  const cleanText = text.replace(/\s+/g, " ").trim();

  for (let start = 0; start < cleanText.length; start += size - overlap) {
    const chunk = cleanText.slice(start, start + size);
    if (chunk) chunks.push(chunk);
  }

  return chunks;
}

async function uploadSandboxPDF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF using the "documents" field.',
      });
    }

    const parsed = await pdfParse(req.file.buffer);
    const chunks = splitIntoChunks(parsed.text || "");

    if (!chunks.length) {
      return res.status(400).json({
        success: false,
        message: "No readable text was found in this PDF.",
      });
    }

    const id = crypto.randomUUID();

    sandboxDocuments.set(id, {
      name: req.file.originalname,
      chunks,
      pages: parsed.numpages || 0,
      createdAt: Date.now(),
    });

    return res.status(201).json({
      success: true,
      message: "Sandbox PDF uploaded successfully.",
      document: {
        id,
        name: req.file.originalname,
        space: "sandbox",
        pages: parsed.numpages || 0,
        chunks: chunks.length,
      },
    });
  } catch (error) {
    console.error("Sandbox PDF upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not process this PDF.",
    });
  }
}

async function askSandboxQuestion(req, res) {
  try {
    const { question, documentId, space } = req.body;

    if (space !== "sandbox") {
      return res.status(400).json({
        success: false,
        message: "This route accepts Sandbox questions only.",
      });
    }

    if (!question || !question.trim() || !documentId) {
      return res.status(400).json({
        success: false,
        message: "A question and document ID are required.",
      });
    }

    const document = sandboxDocuments.get(String(documentId));

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Sandbox PDF not found. Please upload it again.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing from backend/.env.",
      });
    }

    // Simple keyword-based retrieval, not vector search.
    const startedAt = Date.now();
    const terms = question.toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2);

    const ranked = document.chunks
      .map((text, index) => {
        const lower = text.toLowerCase();
        const score = terms.reduce(
          (total, term) => total + (lower.includes(term) ? 1 : 0),
          0
        );

        return { text, index, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const selected = ranked.filter((item) => item.score > 0);

    const contextChunks = selected.length
      ? selected
      : document.chunks.slice(0, 3).map((text, index) => ({
          text,
          index,
          score: 0,
        }));

    const context = contextChunks
      .map((item) => `[Chunk ${item.index + 1}]\n${item.text}`)
      .join("\n\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(`
Answer the question using the PDF excerpts below.
If the excerpts do not contain the answer, say that the PDF does not provide enough information.
Do not invent facts.

PDF excerpts:
${context}

Question: ${question.trim()}
`);

    const answer = result.response.text();

    return res.json({
      success: true,
      answer,
      sources: contextChunks.map((item) => ({
        chunkIndex: item.index + 1,
        similarity: item.score > 0
          ? item.score / Math.max(terms.length, 1)
          : 0,
        documentName: document.name,
        pageNumber: null,
      })),
      metrics: {
        chunksRetrieved: contextChunks.length,
        latency: Date.now() - startedAt,
        confidence: null,
      },
    });
  } catch (error) {
    console.error("Sandbox question error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not answer the Sandbox question.",
    });
  }
}

module.exports = {
  uploadSandboxPDF,
  askSandboxQuestion,
};
