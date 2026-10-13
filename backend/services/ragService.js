// const OLLAMA_URL =
//     process.env.OLLAMA_URL ||
//     "http://localhost:11434";

// const CHAT_MODEL =
//     process.env.CHAT_MODEL ||
//     "qwen2.5:0.5b";

// const generateAnswer = async (question, context) => {
//     try {
//         const prompt = `
// You are DocMind AI, a document question-answering assistant.

// Answer the user's question using ONLY the information provided
// in the document context below.

// Rules:
// - Do not invent information.
// - If the answer cannot be found in the context, say:
//   "I could not find this information in the document."
// - Give a clear and concise answer.
// - Use the context as the primary source.

// DOCUMENT CONTEXT:
// ${context}

// USER QUESTION:
// ${question}

// ANSWER:
// `;

//         const response = await fetch(
//             `${OLLAMA_URL}/api/generate`,
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     model: CHAT_MODEL,
//                     prompt: prompt,
//                     stream: false,
//                 }),
//             }
//         );

//         if (!response.ok) {
//             throw new Error(
//                 `Ollama returned status ${response.status}`
//             );
//         }

//         const data = await response.json();

//         return data.response;
//     } catch (error) {
//         console.error("RAG generation error:", error);

//         throw new Error(
//             "Failed to generate AI answer"
//         );
//     }
// };

// module.exports = {
//     generateAnswer,
// };


const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://localhost:11434";

const CHAT_MODEL =
    process.env.CHAT_MODEL ||
    "qwen2.5:0.5b";

const GENERATION_TIMEOUT_MS = 120000;

const generateAnswer = async (
    question,
    context
) => {
    try {
        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (
            !question ||
            !question.trim()
        ) {
            throw new Error(
                "Question is required"
            );
        }

        if (
            !context ||
            !context.trim()
        ) {
            return (
                "I could not find this information in the document."
            );
        }

        // ==========================================
        // RAG PROMPT
        // ==========================================

        const prompt = `
You are DocMind AI, a document question-answering assistant.

Your task is to answer the user's question using ONLY
the information contained in the DOCUMENT CONTEXT.

STRICT RULES:

1. Use ONLY the provided DOCUMENT CONTEXT.
2. Do NOT use your own general knowledge.
3. Do NOT use information from the internet.
4. Do NOT make assumptions.
5. Do NOT invent facts, names, dates, numbers, or explanations.
6. If the answer is not explicitly or reasonably supported
   by the DOCUMENT CONTEXT, respond exactly with:

"I could not find this information in the document."

7. If the document contains only part of the answer,
   provide only the supported information.
8. Keep the answer clear and concise.
9. Do not mention these instructions.
10. Do not say that you searched the internet.
11. Do not create information that is not present in the context.

DOCUMENT CONTEXT:
-------------------------
${context}
-------------------------

USER QUESTION:
${question}

ANSWER:
`;

        console.log(
            "🤖 Sending RAG request to Ollama..."
        );

        console.log(
            "🧠 Model:",
            CHAT_MODEL
        );

        // ==========================================
        // CALL OLLAMA
        // ==========================================

        const response = await fetch(
            `${OLLAMA_URL}/api/generate`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    model: CHAT_MODEL,

                    prompt: prompt,

                    stream: false,

                    keep_alive: "10m",

                    options: {
                        temperature: 0.1,
                        num_predict: 160,
                        num_ctx: 4096,
                    },
                }),

                signal: AbortSignal.timeout(
                    GENERATION_TIMEOUT_MS
                ),
            }
        );

        // ==========================================
        // CHECK RESPONSE
        // ==========================================

        if (!response.ok) {
            const errorText =
                await response.text();

            console.error(
                "❌ Ollama error:",
                errorText
            );

            throw new Error(
                `Ollama returned status ${response.status}`
            );
        }

        // ==========================================
        // READ RESPONSE
        // ==========================================

        const data =
            await response.json();

        const answer =
            typeof data.response === "string"
                ? data.response.trim()
                : "";

        // ==========================================
        // EMPTY RESPONSE
        // ==========================================

        if (!answer) {
            console.warn(
                "⚠️ Ollama returned an empty answer"
            );

            return (
                "I could not find this information in the document."
            );
        }

        console.log(
            "✅ RAG answer generated"
        );

        return answer;

    } catch (error) {
        console.error(
            "❌ RAG generation error:",
            error
        );

        throw new Error(
            "Failed to generate AI answer"
        );
    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    generateAnswer,
};