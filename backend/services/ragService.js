const generateAnswer = async (question, context) => {
    try {
        const prompt = `
You are DocMind AI, a document question-answering assistant.

Answer the user's question using ONLY the information provided
in the document context below.

Rules:
- Do not invent information.
- If the answer cannot be found in the context, say:
  "I could not find this information in the document."
- Give a clear and concise answer.
- Use the context as the primary source.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}

ANSWER:
`;

        const response = await fetch(
            "http://localhost:11434/api/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama3.2",
                    prompt: prompt,
                    stream: false,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(
                `Ollama returned status ${response.status}`
            );
        }

        const data = await response.json();

        return data.response;
    } catch (error) {
        console.error("RAG generation error:", error);

        throw new Error(
            "Failed to generate AI answer"
        );
    }
};

module.exports = {
    generateAnswer,
};