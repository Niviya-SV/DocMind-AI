'use client';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const steps = [
  {
    step: '01',
    icon: 'ArrowUpTrayIcon',
    title: 'Upload PDF',
    subtitle: 'Drop. Embed. Understand.',
    desc: 'User uploads one or more PDF documents through the React frontend. Files are sent to the Express.js API, which passes them to the Python processing pipeline.',
    detail: 'Supported formats: PDF, multi-page, scanned (OCR), native text. Max size: 100MB per file.',
    color: 'text-red-400',
    border: 'border-red-500/40',
    bg: 'from-red-500/20 to-red-600/10',
    glow: 'rgba(239,68,68,0.4)',
    code: `// Express route
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  const filePath = req.file.path;
  await processPDF(filePath);
  res.json({ success: true });
});`,
  },
  {
    step: '02',
    icon: 'Squares2X2Icon',
    title: 'Split into Chunks',
    subtitle: 'Intelligent text segmentation',
    desc: 'The PDF text is extracted using PyPDF2 and split into overlapping chunks using LangChain\'s RecursiveCharacterTextSplitter. Overlap ensures context is not lost at boundaries.',
    detail: 'Default chunk size: 1000 characters. Overlap: 200 characters. Configurable per document.',
    color: 'text-orange-400',
    border: 'border-orange-500/40',
    bg: 'from-orange-500/20 to-orange-600/10',
    glow: 'rgba(249,115,22,0.4)',
    code: `// Python chunking
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
  chunk_size=1000,
  chunk_overlap=200
)
chunks = splitter.split_text(raw_text)`,
  },
  {
    step: '03',
    icon: 'CpuChipIcon',
    title: 'Generate Embeddings',
    subtitle: 'Semantic vector encoding',
    desc: 'Each text chunk is converted into a high-dimensional vector using sentence-transformers (all-MiniLM-L6-v2). These vectors capture the semantic meaning of the text.',
    detail: 'Model: all-MiniLM-L6-v2. Vector dimensions: 384. Fully local, no API calls.',
    color: 'text-yellow-400',
    border: 'border-yellow-500/40',
    bg: 'from-yellow-500/20 to-yellow-600/10',
    glow: 'rgba(234,179,8,0.4)',
    code: `// Embedding generation
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(chunks)
# Returns list of 384-dim vectors`,
  },
  {
    step: '04',
    icon: 'CircleStackIcon',
    title: 'Store in MongoDB',
    subtitle: 'Vector database persistence',
    desc: 'Embeddings and their source chunks are stored in MongoDB Atlas with vector search indexes. Each document maintains its source metadata for citation.',
    detail: 'Storage: MongoDB Atlas. Index type: vectorSearch. Metric: cosine similarity.',
    color: 'text-green-400',
    border: 'border-green-500/40',
    bg: 'from-green-500/20 to-green-600/10',
    glow: 'rgba(34,197,94,0.4)',
    code: `// Store in MongoDB
await collection.insertMany(chunks.map((chunk, i) => ({
  text: chunk,
  embedding: embeddings[i],
  source: fileName,
  page: pageNumber
})));`,
  },
  {
    step: '05',
    icon: 'MagnifyingGlassIcon',
    title: 'Vector Similarity Search',
    subtitle: 'Semantic retrieval',
    desc: 'When a user asks a question, it is embedded using the same model. MongoDB performs cosine similarity search to find the top-k most relevant chunks.',
    detail: 'Top-k: 3-5 chunks. Similarity metric: cosine. Response time: < 100ms.',
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'from-cyan-500/20 to-cyan-600/10',
    glow: 'rgba(6,182,212,0.4)',
    code: `// Vector search query
const results = await collection.aggregate([{
  $vectorSearch: {
    queryVector: queryEmbedding,
    path: "embedding",
    numCandidates: 100,
    limit: 5,
    index: "vector_index"
  }
}]);`,
  },
  {
    step: '06',
    icon: 'SparklesIcon',
    title: 'LLM Generation (Ollama)',
    subtitle: 'Local language model inference',
    desc: 'Retrieved chunks are assembled into a prompt and sent to Ollama running locally. The LLM generates a grounded, context-aware answer based only on the retrieved passages.',
    detail: 'Supported: Llama 3, Mistral 7B, Phi-3, Gemma. Runs on CPU or GPU locally.',
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'from-purple-500/20 to-violet-600/10',
    glow: 'rgba(168,85,247,0.4)',
    code: `// Ollama inference
const response = await ollama.chat({
  model: 'llama3',
  messages: [{
    role: 'user',
    content: \`Context: \${context}\n\nQuestion: \${query}\`
  }]
});`,
  },
  {
    step: '07',
    icon: 'ChatBubbleLeftRightIcon',
    title: 'Cited Answer',
    subtitle: 'Transparent, grounded response',
    desc: 'The answer is returned to the user along with source citations — document name, page number, and the exact passage used. Full transparency, zero hallucination risk.',
    detail: 'Response includes: answer text, source documents, page numbers, similarity scores.',
    color: 'text-accent',
    border: 'border-accent/40',
    bg: 'from-accent/20 to-primary/10',
    glow: 'rgba(168,85,247,0.4)',
    code: `// Final response structure
{
  answer: "RAG combines retrieval...",
  sources: [
    { doc: "ML_Paper.pdf", page: 3, score: 0.94 },
    { doc: "LangChain_Docs.pdf", page: 1, score: 0.87 }
  ]
}`,
  },
];

export default function DetailedPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('hidden-reveal');
          }
        });
      },
      { threshold: 0.05 }
    );
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      el.classList.add('hidden-reveal');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const current = steps[activeStep];

  return (
    <section ref={sectionRef} id="pipeline" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">RAG Pipeline</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            7 Steps from <span className="gradient-text-purple">PDF to Answer</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            Click each step to explore the code and implementation details.
          </p>
        </div>

        {/* Step selector — horizontal pills */}
        <div className="reveal flex flex-wrap justify-center gap-2 mb-12">
          {steps.map((s, i) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeStep === i
                  ? 'bg-primary text-primary-foreground glow-primary scale-105'
                  : 'border border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <span>{s.step}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Active step detail */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Info */}
          <div
            className="reveal-left p-8 rounded-3xl bg-gradient-to-br border transition-all duration-500"
            style={{
              backgroundImage: `linear-gradient(135deg, ${current.bg.replace('from-', '').replace(' to-', ', ')})`,
              borderColor: current.border.replace('border-', '').replace('/40', ''),
              boxShadow: `0 0 40px ${current.glow}30`,
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-4 rounded-2xl bg-card/50 ${current.color}`}
                style={{ boxShadow: `0 0 20px ${current.glow}` }}
              >
                <Icon name={current.icon as Parameters<typeof Icon>[0]['name']} size={32} />
              </div>
              <div>
                <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">
                  Step {current.step}
                </div>
                <h3 className={`text-2xl font-extrabold ${current.color}`}>{current.title}</h3>
                <p className="text-sm text-muted-foreground">{current.subtitle}</p>
              </div>
            </div>

            <p className="text-base text-foreground/90 leading-relaxed mb-4">{current.desc}</p>

            <div className="p-4 rounded-2xl bg-card/50 border border-border/30">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Technical Details</p>
              <p className="text-sm text-muted-foreground">{current.detail}</p>
            </div>

            {/* Step navigation */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/40 text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronLeftIcon" size={14} />
                Previous
              </button>
              <button
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                disabled={activeStep === steps.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/40 text-xs font-bold text-accent hover:bg-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next Step
                <Icon name="ChevronRightIcon" size={14} />
              </button>
            </div>
          </div>

          {/* Right: Code block */}
          <div className="reveal-right glass-card rounded-3xl overflow-hidden border border-border/40">
            {/* Code header */}
            <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-red-500 rounded-full" />
                <div className="size-3 bg-yellow-500 rounded-full" />
                <div className="size-3 bg-green-500 rounded-full" />
                <span className="ml-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Code — Step {current.step}
                </span>
              </div>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-xs font-bold text-accent hover:text-foreground transition-colors"
              >
                {showCode ? 'Hide' : 'Show'} Code
              </button>
            </div>

            <div className="p-6">
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Pipeline Progress</span>
                  <span className="text-accent font-bold">
                    {activeStep + 1} / {steps.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${((activeStep + 1) / steps.length) * 100}%`,
                      background: 'linear-gradient(90deg, #7C3AED, #A855F7, #2563EB)',
                      boxShadow: '0 0 10px rgba(168,85,247,0.6)',
                    }}
                  />
                </div>
              </div>

              {/* All steps mini list */}
              <div className="space-y-2 mb-6">
                {steps.map((s, i) => (
                  <div
                    key={s.step}
                    onClick={() => setActiveStep(i)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      i === activeStep
                        ? 'bg-primary/20 border border-primary/40'
                        : i < activeStep
                        ? 'bg-green-500/10 border border-green-500/20' :'border border-transparent hover:border-border/40'
                    }`}
                  >
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        i < activeStep
                          ? 'bg-green-500/30 text-green-400'
                          : i === activeStep
                          ? 'bg-primary/30 text-accent' :'bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {i < activeStep ? '✓' : s.step}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        i === activeStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Code snippet */}
              {showCode && (
                <div className="bg-black/60 rounded-2xl p-4 overflow-x-auto border border-border/30">
                  <pre className="text-xs font-mono text-green-400 leading-relaxed whitespace-pre-wrap">
                    {current.code}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}