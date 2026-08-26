const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://localhost:11434";

const EMBEDDING_MODEL =
    process.env.EMBEDDING_MODEL ||
    "nomic-embed-text";


// ==========================================
// GENERATE EMBEDDING
// ==========================================

const generateEmbedding = async (text) => {
    try {
        if (!text || !text.trim()) {
            throw new Error(
                "Text is required to generate embedding"
            );
        }

        console.log(
            "🧠 Generating embedding..."
        );

        const response = await fetch(
            `${OLLAMA_URL}/api/embeddings`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    model:
                        EMBEDDING_MODEL,

                    prompt:
                        text,
                }),
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text();

            throw new Error(
                `Ollama embedding error: ${response.status} ${errorText}`
            );
        }

        const data =
            await response.json();

        if (
            !data.embedding ||
            !Array.isArray(data.embedding)
        ) {
            throw new Error(
                "Ollama did not return a valid embedding"
            );
        }

        console.log(
            `✅ Embedding generated (${data.embedding.length} dimensions)`
        );

        return data.embedding;

    } catch (error) {
        console.error(
            "❌ Embedding generation error:",
            error
        );

        throw error;
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    generateEmbedding,
};