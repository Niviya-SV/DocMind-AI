// 'use client';
// import React, { useState, useRef, useCallback } from 'react';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import Icon from '@/components/ui/AppIcon';

// // ─── Mock RAG responses ───────────────────────────────────────────────────────
// const mockResponses: Record<string, { answer: string; sources: { label: string; page: string; relevance: number }[]; chunks: number; latency: string; confidence: number }> = {
//   default: {
//     answer:
//       'Based on the uploaded document, I found several relevant sections that address your question. The content discusses key concepts related to your query, providing detailed explanations and supporting evidence from the source material. The RAG pipeline retrieved the most semantically similar chunks and synthesized this response using local inference.',
//     sources: [
//       { label: 'Section 1 — Introduction', page: 'p.2', relevance: 97 },
//       { label: 'Section 3 — Methodology', page: 'p.14', relevance: 89 },
//       { label: 'Section 5 — Results', page: 'p.28', relevance: 76 },
//     ],
//     chunks: 3,
//     latency: '0.9s',
//     confidence: 94,
//   },
//   summary: {
//     answer:
//       'The document presents a comprehensive study on AI-powered document retrieval systems. Key findings include: (1) Vector embeddings significantly outperform keyword search for semantic queries, (2) Chunking strategy impacts retrieval accuracy by up to 23%, and (3) Local LLM inference maintains data privacy while achieving 91% answer accuracy compared to cloud models.',
//     sources: [
//       { label: 'Abstract', page: 'p.1', relevance: 99 },
//       { label: 'Conclusion', page: 'p.42', relevance: 95 },
//       { label: 'Executive Summary', page: 'p.3', relevance: 88 },
//     ],
//     chunks: 4,
//     latency: '1.1s',
//     confidence: 97,
//   },
//   methodology: {
//     answer:
//       'Chapter 3 describes a multi-stage methodology: First, PDF documents are parsed using PyMuPDF and split into 512-token overlapping chunks. Each chunk is encoded using a sentence-transformer model (all-MiniLM-L6-v2) to produce 384-dimensional embeddings. These are stored in MongoDB Atlas with vector search indexes. At query time, cosine similarity retrieves the top-k=5 chunks as context for the LLM.',
//     sources: [
//       { label: 'Chapter 3 — Methodology', page: 'p.12', relevance: 99 },
//       { label: 'Appendix A — Model Config', page: 'p.48', relevance: 82 },
//       { label: 'Section 3.2 — Embedding', page: 'p.16', relevance: 78 },
//     ],
//     chunks: 5,
//     latency: '0.7s',
//     confidence: 96,
//   },
//   references: {
//     answer:
//       'Section 2 cites 14 references including: Lewis et al. (2020) "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", Karpukhin et al. (2020) "Dense Passage Retrieval", Johnson et al. (2019) "Billion-scale similarity search with GPUs" (FAISS), and Reimers & Gurevych (2019) "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks".',
//     sources: [
//       { label: 'Section 2 — Literature Review', page: 'p.7', relevance: 98 },
//       { label: 'Bibliography', page: 'p.50', relevance: 94 },
//       { label: 'Section 2.3 — Related Work', page: 'p.10', relevance: 85 },
//     ],
//     chunks: 3,
//     latency: '0.6s',
//     confidence: 99,
//   },
// };

// const suggestedQuestions = [
//   'What is Retrieval Augmented Generation?',
//   'Summarize the key findings of this document',
//   'What methodology was used in Chapter 3?',
//   'List all references cited in Section 2',
//   'What are the main conclusions?',
//   'How does vector search work here?',
// ];

// const pipelineStages = [
//   { label: 'Parsing PDF', icon: 'DocumentTextIcon', color: '#ef4444' },
//   { label: 'Chunking Text', icon: 'Squares2X2Icon', color: '#f97316' },
//   { label: 'Generating Embeddings', icon: 'CpuChipIcon', color: '#eab308' },
//   { label: 'Vector Search', icon: 'MagnifyingGlassIcon', color: '#22c55e' },
//   { label: 'Retrieving Context', icon: 'CircleStackIcon', color: '#06b6d4' },
//   { label: 'LLM Inference', icon: 'SparklesIcon', color: '#a855f7' },
//   { label: 'Generating Answer', icon: 'ChatBubbleLeftRightIcon', color: '#7c3aed' },
// ];

// type AnswerData = typeof mockResponses.default;

// function getMockResponse(question: string): AnswerData {
//   const q = question.toLowerCase();
//   if (q.includes('summar') || q.includes('finding') || q.includes('conclusion')) return mockResponses.summary;
//   if (q.includes('method') || q.includes('chapter 3') || q.includes('approach')) return mockResponses.methodology;
//   if (q.includes('reference') || q.includes('cite') || q.includes('section 2')) return mockResponses.references;
//   return mockResponses.default;
// }

// export default function SandboxPage() {
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [question, setQuestion] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [pipelineStage, setPipelineStage] = useState(-1);
//   const [answer, setAnswer] = useState<AnswerData | null>(null);
//   const [typedAnswer, setTypedAnswer] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [queryHistory, setQueryHistory] = useState<{ q: string; a: AnswerData }[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const answerRef = useRef<HTMLDivElement>(null);

//   const handleFile = (file: File) => {
//     if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.txt') || file.name.endsWith('.doc')) {
//       setUploadedFile(file);
//       setAnswer(null);
//       setTypedAnswer('');
//       setQueryHistory([]);
//     }
//   };

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     if (file) handleFile(file);
//   }, []);

//   const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
//   const handleDragLeave = () => setIsDragging(false);

//   const runPipeline = async (q: string) => {
//     if (!q.trim() || !uploadedFile || isProcessing) return;
//     setIsProcessing(true);
//     setAnswer(null);
//     setTypedAnswer('');
//     setPipelineStage(0);

//     // Simulate pipeline stages
//     for (let i = 0; i < pipelineStages.length; i++) {
//       await new Promise((r) => setTimeout(r, 380));
//       setPipelineStage(i);
//     }

//     await new Promise((r) => setTimeout(r, 400));
//     setPipelineStage(-1);

//     const result = getMockResponse(q);
//     setAnswer(result);
//     setQueryHistory((prev) => [{ q, a: result }, ...prev.slice(0, 4)]);
//     setIsProcessing(false);

//     // Typewriter
//     setIsTyping(true);
//     let i = 0;
//     const timer = setInterval(() => {
//       if (i < result.answer.length) {
//         setTypedAnswer(result.answer.slice(0, i + 1));
//         i++;
//       } else {
//         setIsTyping(false);
//         clearInterval(timer);
//       }
//     }, 14);

//     setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     runPipeline(question);
//     setQuestion('');
//   };

//   const handleSuggestion = (q: string) => {
//     setQuestion(q);
//     runPipeline(q);
//   };

//   return (
//     <main className="relative min-h-screen bg-background overflow-x-hidden">
//       <Header />

//       {/* Hero */}
//       <section className="relative pt-32 pb-16 overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
//         <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
//         <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 mb-6">
//             <span className="size-2 bg-green-400 rounded-full animate-pulse" />
//             <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live Sandbox — Simulated Demo</span>
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
//             RAG Query <span className="gradient-text-purple">Sandbox</span>
//           </h1>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             Upload a PDF and ask questions. Watch the full RAG pipeline execute in real-time — chunking, embedding, vector search, and AI inference.
//           </p>
//         </div>
//       </section>

//       <section className="relative pb-24 px-6">
//         <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-8 items-start">

//           {/* ── Left Panel ── */}
//           <div className="space-y-6">

//             {/* Upload */}
//             <div
//               onDrop={handleDrop}
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onClick={() => !uploadedFile && fileInputRef.current?.click()}
//               className={`relative glass-card rounded-3xl p-8 border-2 border-dashed transition-all duration-300 cursor-pointer group ${
//                 isDragging
//                   ? 'border-primary bg-primary/10 scale-[1.02]'
//                   : uploadedFile
//                   ? 'border-green-500/50 bg-green-500/5 cursor-default' :'border-primary/30 hover:border-primary/60 hover:bg-primary/5'
//               }`}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".pdf,.txt,.doc"
//                 className="hidden"
//                 onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
//               />
//               {uploadedFile ? (
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 rounded-2xl bg-green-500/20 border border-green-500/40">
//                     <Icon name="DocumentCheckIcon" size={28} className="text-green-400" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="font-bold text-foreground truncate">{uploadedFile.name}</p>
//                     <p className="text-xs text-muted-foreground mt-0.5">
//                       {(uploadedFile.size / 1024).toFixed(1)} KB · Ready for queries
//                     </p>
//                   </div>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setAnswer(null); setTypedAnswer(''); setQueryHistory([]); }}
//                     className="p-2 rounded-xl hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
//                   >
//                     <Icon name="XMarkIcon" size={18} />
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center gap-4 text-center">
//                   <div className="p-5 rounded-2xl bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
//                     <Icon name="ArrowUpTrayIcon" size={32} className="text-accent" />
//                   </div>
//                   <div>
//                     <p className="font-bold text-foreground text-lg">Drop your document here</p>
//                     <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
//                   </div>
//                   <div className="flex gap-2">
//                     {['PDF', 'TXT', 'DOC'].map((ext) => (
//                       <span key={ext} className="px-3 py-1 rounded-lg bg-muted/50 text-xs font-bold text-muted-foreground border border-border/40">{ext}</span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Query input */}
//             <div className="glass-card rounded-3xl p-6">
//               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Ask a Question</p>
//               <form onSubmit={handleSubmit} className="space-y-3">
//                 <div className="relative">
//                   <textarea
//                     value={question}
//                     onChange={(e) => setQuestion(e.target.value)}
//                     placeholder={uploadedFile ? 'Ask anything about your document…' : 'Upload a document first'}
//                     disabled={!uploadedFile || isProcessing}
//                     rows={3}
//                     className="w-full bg-muted/30 border border-border/40 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all resize-none disabled:opacity-40"
//                     onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={!uploadedFile || !question.trim() || isProcessing}
//                   className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest hover:bg-accent transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed glow-primary flex items-center justify-center gap-2"
//                 >
//                   {isProcessing ? (
//                     <>
//                       <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Processing…
//                     </>
//                   ) : (
//                     <>
//                       <Icon name="PaperAirplaneIcon" size={16} />
//                       Run RAG Query
//                     </>
//                   )}
//                 </button>
//               </form>
//             </div>

//             {/* Suggested questions */}
//             {uploadedFile && (
//               <div className="glass-card rounded-3xl p-6">
//                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Suggested Questions</p>
//                 <div className="space-y-2">
//                   {suggestedQuestions.map((q, i) => (
//                     <button
//                       key={i}
//                       onClick={() => !isProcessing && handleSuggestion(q)}
//                       disabled={isProcessing}
//                       className="w-full text-left px-4 py-2.5 rounded-xl text-sm border border-border/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground transition-all duration-200 disabled:opacity-40"
//                     >
//                       {q}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ── Right Panel ── */}
//           <div className="space-y-6">

//             {/* Pipeline visualizer */}
//             {isProcessing && (
//               <div className="glass-card rounded-3xl p-6 border border-primary/30">
//                 <p className="text-xs font-bold text-accent uppercase tracking-widest mb-5">RAG Pipeline Running</p>
//                 <div className="space-y-3">
//                   {pipelineStages.map((stage, i) => {
//                     const done = i < pipelineStage;
//                     const active = i === pipelineStage;
//                     return (
//                       <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-400 ${active ? 'bg-primary/15 border border-primary/40' : done ? 'opacity-60' : 'opacity-30'}`}>
//                         <div
//                           className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
//                           style={{ background: `${stage.color}20`, border: `1px solid ${stage.color}40`, boxShadow: active ? `0 0 12px ${stage.color}60` : 'none' }}
//                         >
//                           {done ? (
//                             <Icon name="CheckIcon" size={14} className="text-green-400" />
//                           ) : (
//                             <Icon name={stage.icon as Parameters<typeof Icon>[0]['name']} size={14} style={{ color: stage.color }} />
//                           )}
//                         </div>
//                         <span className={`text-sm font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{stage.label}</span>
//                         {active && (
//                           <div className="ml-auto flex gap-1">
//                             {[0, 1, 2].map((d) => (
//                               <div key={d} className="size-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />
//                             ))}
//                           </div>
//                         )}
//                         {done && <Icon name="CheckCircleIcon" size={16} className="ml-auto text-green-400" />}
//                       </div>
//                     );
//                   })}
//                 </div>
//                 {/* Progress bar */}
//                 <div className="mt-5 h-1.5 rounded-full bg-muted/50 overflow-hidden">
//                   <div
//                     className="h-full rounded-full transition-all duration-500"
//                     style={{
//                       width: `${((pipelineStage + 1) / pipelineStages.length) * 100}%`,
//                       background: 'linear-gradient(90deg, #7C3AED, #A855F7, #2563EB)',
//                       boxShadow: '0 0 8px rgba(168,85,247,0.6)',
//                     }}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Answer */}
//             {answer && !isProcessing && (
//               <div ref={answerRef} className="space-y-4">
//                 {/* Stats */}
//                 <div className="grid grid-cols-3 gap-3">
//                   {[
//                     { label: 'Chunks Retrieved', value: String(answer.chunks) },
//                     { label: 'Latency', value: answer.latency },
//                     { label: 'Confidence', value: `${answer.confidence}%` },
//                   ].map((stat) => (
//                     <div key={stat.label} className="glass-card rounded-2xl p-4 text-center border border-border/40">
//                       <p className="text-xl font-black text-accent">{stat.value}</p>
//                       <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Answer text */}
//                 <div className="glass-card rounded-3xl p-6 border border-primary/30">
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-xs font-bold text-accent uppercase tracking-widest">AI Answer</p>
//                     {isTyping && (
//                       <div className="flex gap-1">
//                         {[0, 1, 2].map((d) => (
//                           <div key={d} className="size-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                   <p className="text-sm text-foreground/90 leading-relaxed font-mono">
//                     {typedAnswer}
//                     {isTyping && <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />}
//                   </p>
//                 </div>

//                 {/* Sources */}
//                 <div className="glass-card rounded-3xl p-6">
//                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Retrieved Sources</p>
//                   <div className="space-y-2">
//                     {answer.sources.map((src, i) => (
//                       <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors">
//                         <span className="text-xs font-black text-secondary shrink-0">{i + 1}</span>
//                         <span className="text-xs text-muted-foreground flex-1 truncate">{src.label}</span>
//                         <span className="text-xs text-muted-foreground/60 shrink-0">{src.page}</span>
//                         <div className="flex items-center gap-1 shrink-0">
//                           <div className="w-12 h-1 rounded-full bg-muted/50 overflow-hidden">
//                             <div className="h-full rounded-full bg-accent" style={{ width: `${src.relevance}%` }} />
//                           </div>
//                           <span className="text-[10px] text-accent font-bold">{src.relevance}%</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Empty state */}
//             {!answer && !isProcessing && (
//               <div className="glass-card rounded-3xl p-12 text-center border border-dashed border-border/40">
//                 <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 inline-flex mb-5">
//                   <Icon name="MagnifyingGlassIcon" size={36} className="text-primary/60" />
//                 </div>
//                 <p className="font-bold text-foreground mb-2">No query yet</p>
//                 <p className="text-sm text-muted-foreground">
//                   {uploadedFile ? 'Ask a question to see the RAG pipeline in action' : 'Upload a document to get started'}
//                 </p>
//               </div>
//             )}

//             {/* Query history */}
//             {queryHistory.length > 1 && (
//               <div className="glass-card rounded-3xl p-6">
//                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Query History</p>
//                 <div className="space-y-2">
//                   {queryHistory.slice(1).map((item, i) => (
//                     <button
//                       key={i}
//                       onClick={() => { setAnswer(item.a); setTypedAnswer(item.a.answer); setIsTyping(false); }}
//                       className="w-full text-left px-4 py-2.5 rounded-xl text-xs border border-border/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground transition-all duration-200 truncate"
//                     >
//                       {item.q}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </main>
//   );
// }




'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';


// ======================================================
// BACKEND URL
// ======================================================

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:5000/api';


// ======================================================
// TYPES
// ======================================================

type SourceData = {
  label: string;
  page: string;
  relevance: number;
};

type AnswerData = {
  answer: string;
  sources: SourceData[];
  chunks: number;
  latency: string;
  confidence: number;
};


// ======================================================
// SUGGESTED QUESTIONS
// ======================================================

const suggestedQuestions = [
  'What is Retrieval Augmented Generation?',
  'Summarize the key findings of this document',
  'What methodology was used in Chapter 3?',
  'List all references cited in Section 2',
  'What are the main conclusions?',
  'How does vector search work here?',
];


// ======================================================
// RAG PIPELINE
// ======================================================

const pipelineStages = [
  {
    label: 'Parsing PDF',
    icon: 'DocumentTextIcon',
    color: '#ef4444',
  },
  {
    label: 'Chunking Text',
    icon: 'Squares2X2Icon',
    color: '#f97316',
  },
  {
    label: 'Generating Embeddings',
    icon: 'CpuChipIcon',
    color: '#eab308',
  },
  {
    label: 'Vector Search',
    icon: 'MagnifyingGlassIcon',
    color: '#22c55e',
  },
  {
    label: 'Retrieving Context',
    icon: 'CircleStackIcon',
    color: '#06b6d4',
  },
  {
    label: 'LLM Inference',
    icon: 'SparklesIcon',
    color: '#a855f7',
  },
  {
    label: 'Generating Answer',
    icon: 'ChatBubbleLeftRightIcon',
    color: '#7c3aed',
  },
];


// ======================================================
// COMPONENT
// ======================================================

export default function SandboxPage() {

  const router = useRouter();
  const pathname = usePathname();
  const authenticated = pathname === '/workspace';

  useEffect(() => {
    if (!authenticated && localStorage.getItem('token')) {
      router.replace('/workspace');
    }

    if (authenticated && !localStorage.getItem('token')) {
      router.replace('/login');
    }
  }, [authenticated, router]);

  // ----------------------------------------------------
  // FILE STATE
  // ----------------------------------------------------

  const [uploadedFile, setUploadedFile] =
    useState<File | null>(null);

  const [uploadedFiles, setUploadedFiles] =
    useState<File[]>([]);

  const [documentId, setDocumentId] =
    useState<string | null>(null);

  const [documentIds, setDocumentIds] =
    useState<string[]>([]);

  const [isUploading, setIsUploading] =
    useState(false);


  // ----------------------------------------------------
  // QUERY STATE
  // ----------------------------------------------------

  const [question, setQuestion] =
    useState('');

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [pipelineStage, setPipelineStage] =
    useState(-1);


  // ----------------------------------------------------
  // ANSWER STATE
  // ----------------------------------------------------

  const [answer, setAnswer] =
    useState<AnswerData | null>(null);

  const [typedAnswer, setTypedAnswer] =
    useState('');

  const [isTyping, setIsTyping] =
    useState(false);


  // ----------------------------------------------------
  // HISTORY
  // ----------------------------------------------------

  const [queryHistory, setQueryHistory] =
    useState<
      {
        q: string;
        a: AnswerData;
      }[]
    >([]);


  // ----------------------------------------------------
  // REFS
  // ----------------------------------------------------

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const answerRef =
    useRef<HTMLDivElement>(null);


  // ====================================================
  // GET AUTH TOKEN
  // ====================================================

  const getToken = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    return (
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken')
    );
  };

  const getGuestId = () => {
    if (typeof window === 'undefined') return null;

    let guestId = localStorage.getItem('docmind_guest_id');
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('docmind_guest_id', guestId);
    }
    return guestId;
  };


  // ====================================================
  // UPLOAD ONE PDF OR WORD DOCUMENT
  // ====================================================

  const handleFile = async (file: File | File[]) => {

    const selectedFiles = Array.isArray(file) ? file : [file];
    const token = getToken();
    const files = authenticated ? selectedFiles.slice(0, 10) : selectedFiles.slice(0, 1);

    if (files.length === 0 || files.some((selectedFile) => !/\.(pdf|docx)$/i.test(selectedFile.name))) {
      alert('Please upload PDF or DOCX files.');

      return;
    }


    // Reset previous state
    setUploadedFile(files[0]);
    setUploadedFiles(files);
    setDocumentId(null);
    setDocumentIds([]);
    setAnswer(null);
    setTypedAnswer('');
    setQueryHistory([]);
    setIsUploading(true);


    try {

      console.log(
        '📤 Uploading:',
        files.map((selectedFile) => selectedFile.name).join(', ')
      );


      // Create multipart form
      const formData = new FormData();

      files.forEach((selectedFile) => formData.append('documents', selectedFile));


      const token = getToken();
      const guestId = getGuestId();


      // Send PDF to backend
      const response = await fetch(
        `${API_URL}/documents/upload`,
        {
          method: 'POST',

          headers: token
            ? {
                Authorization:
                  `Bearer ${token}`,
                ...(guestId ? { 'X-Guest-Id': guestId } : {}),
              }
            : guestId
            ? { 'X-Guest-Id': guestId }
            : undefined,

          body: formData,
        }
      );


      const responseText = await response.text();
      let data: {
        success?: boolean;
        message?: string;
        documents?: Array<{ id?: string; _id?: string }>;
        document?: { id?: string; _id?: string };
      } = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          response.ok
            ? 'The backend returned an invalid response.'
            : `Upload failed (${response.status}). Restart the backend and try again.`
        );
      }


      console.log(
        '📥 Upload response:',
        data
      );


      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Document upload failed'
        );
      }


      // Your backend currently supports
      // both "documents" and "document"
      const uploadedDocuments =
        data.documents ||
        (data.document ? [data.document] : []);


      if (uploadedDocuments.length === 0) {
        throw new Error(
          'Backend did not return document information.'
        );
      }


      const ids = uploadedDocuments
        .filter((document) => !('status' in document) || document.status === 'processed')
        .map((document) => document.id || document._id)
        .filter((id): id is string => Boolean(id))
        .map(String);


      if (ids.length === 0) {
        throw new Error(
          'Document ID was not returned by backend.'
        );
      }


      // Save document ID
      setDocumentId(
        ids[0]
      );
      setDocumentIds(ids);


      console.log(
        '✅ PDF uploaded successfully'
      );

      console.log(
        '📄 Document ID:',
        ids
      );


    } catch (error) {

      console.error(
        '❌ PDF upload error:',
        error
      );


      setUploadedFile(null);
      setUploadedFiles([]);
      setDocumentId(null);
      setDocumentIds([]);


      alert(
        error instanceof Error
          ? error.message
          : 'Failed to upload PDF.'
      );

    } finally {

      setIsUploading(false);

    }
  };


  // ====================================================
  // DRAG & DROP
  // ====================================================

  const handleDrop = useCallback(
    (e: React.DragEvent) => {

      e.preventDefault();

      setIsDragging(false);

      const files =
        Array.from(e.dataTransfer.files);

      if (files.length > 0) {
        handleFile(files);
      }

    },
    []
  );


  const handleDragOver = (
    e: React.DragEvent
  ) => {

    e.preventDefault();

    setIsDragging(true);

  };


  const handleDragLeave = () => {

    setIsDragging(false);

  };


  // ====================================================
  // DRAG STATE
  // ====================================================

  const [isDragging, setIsDragging] =
    useState(false);


  // ====================================================
  // RUN REAL RAG QUERY
  // ====================================================

  const runPipeline = async (
    q: string
  ) => {

    if (
      !q.trim() ||
      !uploadedFile ||
      !documentId ||
      isProcessing ||
      isUploading
    ) {
      return;
    }


    setIsProcessing(true);

    setAnswer(null);

    setTypedAnswer('');

    setPipelineStage(0);


    try {

      // ------------------------------------------------
      // Visual pipeline
      // ------------------------------------------------

      for (
        let i = 0;
        i < pipelineStages.length;
        i++
      ) {

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              250
            )
        );

        setPipelineStage(i);

      }


      // ------------------------------------------------
      // Authentication
      // ------------------------------------------------

      const token =
        getToken();


      // ------------------------------------------------
      // Call backend
      // ------------------------------------------------

      console.log(
        '🔎 Asking:',
        q
      );

      console.log(
        '📄 Document:',
        documentId
      );


      const guestId = getGuestId();
      const response =
        await fetch(
          `${API_URL}/chat/ask`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
              ...(guestId ? { 'X-Guest-Id': guestId } : {}),
            },

            body: JSON.stringify({
              question: q,
              documentId:
                documentId,
              documentIds,
            }),
          }
        );


      const data =
        await response.json();


      console.log(
        '🤖 RAG response:',
        data
      );


      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Failed to generate AI answer.'
        );
      }


      // ------------------------------------------------
      // Convert backend response
      // to existing UI format
      // ------------------------------------------------

      const backendSources =
        Array.isArray(
          data.sources
        )
          ? data.sources
          : [];


      const sources: SourceData[] =
        backendSources.map(
          (
            source: {
              chunkIndex?: number;
              similarity?: number;
              documentName?: string;
              pageNumber?: number;
            },
            index: number
          ) => {

            const similarity =
              Number(
                source.similarity || 0
              );


            return {

              label:
                source.documentName ||
                `Document Chunk ${
                  source.chunkIndex ??
                  index + 1
                }`,

              page:
                source.pageNumber
                  ? `p.${source.pageNumber}`
                  : `Source ${index + 1}`,

              relevance:
                Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      similarity * 100
                    )
                  )
                ),
            };

          }
        );


      // ------------------------------------------------
      // Metrics
      // ------------------------------------------------

      const chunksRetrieved =
        Number(
          data.metrics
            ?.chunksRetrieved ??
            backendSources.length
        );


      const latency =
        data.metrics
          ?.latency ||
        'N/A';


      const confidenceString =
        data.metrics
          ?.confidence ||
        '0';


      const confidence =
        Number(
          String(
            confidenceString
          ).replace(
            '%',
            ''
          )
        ) || 0;


      // ------------------------------------------------
      // Final UI result
      // ------------------------------------------------

      const result: AnswerData = {

        answer:
          data.answer ||
          'No answer was generated.',

        sources,

        chunks:
          chunksRetrieved,

        latency,

        confidence,
      };


      // ------------------------------------------------
      // Update UI
      // ------------------------------------------------

      setPipelineStage(-1);

      setAnswer(result);


      setQueryHistory(
        (prev) => [
          {
            q,
            a: result,
          },
          ...prev.slice(0, 4),
        ]
      );


      // ------------------------------------------------
      // Typewriter effect
      // ------------------------------------------------

      setIsTyping(true);

      setTypedAnswer('');


      let i = 0;


      const timer =
        setInterval(() => {

          if (
            i <
            result.answer.length
          ) {

            setTypedAnswer(
              result.answer.slice(
                0,
                i + 1
              )
            );

            i++;

          } else {

            setIsTyping(false);

            clearInterval(timer);

          }

        }, 14);


      // ------------------------------------------------
      // Scroll answer into view
      // ------------------------------------------------

      setTimeout(() => {

        answerRef.current?.scrollIntoView(
          {
            behavior: 'smooth',
            block: 'start',
          }
        );

      }, 100);


    } catch (error) {

      console.error(
        '❌ RAG query error:',
        error
      );


      setPipelineStage(-1);


      alert(
        error instanceof Error
          ? error.message
          : 'Failed to process question.'
      );

    } finally {

      setIsProcessing(false);

    }
  };


  // ====================================================
  // SUBMIT QUESTION
  // ====================================================

  const handleSubmit = (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    runPipeline(question);

    setQuestion('');

  };


  // ====================================================
  // SUGGESTION
  // ====================================================

  const handleSuggestion = (
    q: string
  ) => {

    if (
      isProcessing ||
      isUploading
    ) {
      return;
    }

    setQuestion(q);

    runPipeline(q);

  };


  // ====================================================
  // CLEAR FILE
  // ====================================================

  const clearFile = () => {

    setUploadedFile(null);

    setUploadedFiles([]);

    setDocumentId(null);

    setDocumentIds([]);

    setAnswer(null);

    setTypedAnswer('');

    setQueryHistory([]);

  };


  // ====================================================
  // UI
  // ====================================================

  return (

    <main className="relative min-h-screen bg-background overflow-x-hidden">

      <Header />


      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative pt-32 pb-16 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />

        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />


        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 mb-6">

            <span className="size-2 bg-green-400 rounded-full animate-pulse" />

            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">

              {authenticated ? 'Private Workspace — Real RAG' : 'Live Sandbox — Real RAG'}

            </span>

          </div>


          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">

            {authenticated ? 'Document Workspace ' : 'RAG Query '}{' '}

            <span className="gradient-text-purple">

              {authenticated ? 'Workspace' : 'Sandbox'}

            </span>

          </h1>


          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">

            {authenticated
              ? 'Upload multiple PDF or DOCX documents and ask questions across your private workspace.'
              : 'Upload one PDF or DOCX document and ask questions without creating an account.'}

          </p>

        </div>

      </section>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="relative pb-24 px-6">

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-8 items-start">


          {/* =================================================
              LEFT PANEL
          ================================================= */}

          <div className="space-y-6">


            {/* =================================================
                UPLOAD
            ================================================= */}

            <div
              onDrop={
                handleDrop
              }

              onDragOver={
                handleDragOver
              }

              onDragLeave={
                handleDragLeave
              }

              onClick={() =>
                !uploadedFile &&
                !isUploading &&
                fileInputRef.current?.click()
              }

              className={`relative glass-card rounded-3xl p-8 border-2 border-dashed transition-all duration-300 cursor-pointer group ${
                isDragging
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : uploadedFile
                  ? 'border-green-500/50 bg-green-500/5 cursor-default'
                  : 'border-primary/30 hover:border-primary/60 hover:bg-primary/5'
              }`}
            >

              <input
                ref={
                  fileInputRef
                }

                type="file"

                accept=".pdf,.docx"
                multiple={authenticated}

                className="hidden"

                onChange={(e) => {

                  if (e.target.files?.length) {
                    handleFile(Array.from(e.target.files || []));
                  }

                  e.target.value = '';

                }}
              />


              {uploadedFile ? (

                <div className="flex items-center gap-4">

                  <div className="p-3 rounded-2xl bg-green-500/20 border border-green-500/40">

                    <Icon
                      name="DocumentCheckIcon"
                      size={28}
                      className="text-green-400"
                    />

                  </div>


                  <div className="flex-1 min-w-0">

                    <p className="font-bold text-foreground truncate">

                      {uploadedFiles.length > 1
                        ? `${uploadedFile.name} + ${uploadedFiles.length - 1} more`
                        : uploadedFile.name}

                    </p>


                    <p className="text-xs text-muted-foreground mt-0.5">

                      {(
                        uploadedFile.size /
                        1024
                      ).toFixed(1)} KB

                      {' · '}

                      {isUploading
                        ? 'Uploading and processing…'
                        : documentIds.length > 0
                        ? `${documentIds.length} document${documentIds.length === 1 ? '' : 's'} ready for queries`
                        : 'Preparing document…'}

                    </p>

                  </div>


                  {!isUploading && (

                    <button
                      type="button"

                      onClick={(
                        e
                      ) => {

                        e.stopPropagation();

                        clearFile();

                      }}

                      className="p-2 rounded-xl hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                    >

                      <Icon
                        name="XMarkIcon"
                        size={18}
                      />

                    </button>

                  )}

                </div>

              ) : (

                <div className="flex flex-col items-center gap-4 text-center">

                  <div className="p-5 rounded-2xl bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">

                    <Icon
                      name="ArrowUpTrayIcon"
                      size={32}
                      className="text-accent"
                    />

                  </div>


                  <div>

                    <p className="font-bold text-foreground text-lg">

                      {authenticated ? 'Drop your documents here' : 'Drop your PDF here'}

                    </p>

                    <p className="text-sm text-muted-foreground mt-1">

                      or click to browse files

                    </p>

                  </div>


                  <div className="flex gap-2">

                    <span className="px-3 py-1 rounded-lg bg-muted/50 text-xs font-bold text-muted-foreground border border-border/40">

                      PDF

                    </span>

                    {authenticated && (
                      <span className="px-3 py-1 rounded-lg bg-muted/50 text-xs font-bold text-muted-foreground border border-border/40">
                        DOCX
                      </span>
                    )}

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                QUERY INPUT
            ================================================= */}

            <div className="glass-card rounded-3xl p-6">

              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">

                Ask a Question

              </p>


              <form
                onSubmit={
                  handleSubmit
                }

                className="space-y-3"
              >

                <div className="relative">

                  <textarea
                    value={
                      question
                    }

                    onChange={(e) =>
                      setQuestion(
                        e.target.value
                      )
                    }

                    placeholder={
                      uploadedFile
                        ? 'Ask anything about your document…'
                        : 'Upload a document first'
                    }

                    disabled={
                      !documentId ||
                      isProcessing ||
                      isUploading
                    }

                    rows={3}

                    className="w-full bg-white border border-border/40 rounded-2xl px-4 py-3 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all resize-none disabled:opacity-40"

                    onKeyDown={(e) => {

                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey
                      ) {

                        e.preventDefault();

                        handleSubmit(e);

                      }

                    }}
                  />

                </div>


                <button
                  type="submit"

                  disabled={
                    !documentId ||
                    !question.trim() ||
                    isProcessing ||
                    isUploading
                  }

                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest hover:bg-accent transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed glow-primary flex items-center justify-center gap-2"
                >

                  {isProcessing ? (

                    <>

                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      Processing…

                    </>

                  ) : (

                    <>

                      <Icon
                        name="PaperAirplaneIcon"
                        size={16}
                      />

                      Run RAG Query

                    </>

                  )}

                </button>

              </form>

            </div>


            {/* =================================================
                SUGGESTED QUESTIONS
            ================================================= */}

            {uploadedFile && (

              <div className="glass-card rounded-3xl p-6">

                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">

                  Suggested Questions

                </p>


                <div className="space-y-2">

                  {suggestedQuestions.map(
                    (
                      q,
                      i
                    ) => (

                      <button
                        key={i}

                        onClick={() =>
                          !isProcessing &&
                          !isUploading &&
                          handleSuggestion(q)
                        }

                        disabled={
                          isProcessing ||
                          isUploading ||
                          !documentId
                        }

                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm border border-border/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground transition-all duration-200 disabled:opacity-40"
                      >

                        {q}

                      </button>

                    )
                  )}

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              RIGHT PANEL
          ================================================= */}

          <div className="space-y-6">


            {/* =================================================
                PIPELINE VISUALIZER
            ================================================= */}

            {isProcessing && (

              <div className="glass-card rounded-3xl p-6 border border-primary/30">

                <p className="text-xs font-bold text-accent uppercase tracking-widest mb-5">

                  RAG Pipeline Running

                </p>


                <div className="space-y-3">

                  {pipelineStages.map(
                    (
                      stage,
                      i
                    ) => {

                      const done =
                        i <
                        pipelineStage;

                      const active =
                        i ===
                        pipelineStage;


                      return (

                        <div
                          key={i}

                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-400 ${
                            active
                              ? 'bg-primary/15 border border-primary/40'
                              : done
                              ? 'opacity-60'
                              : 'opacity-30'
                          }`}
                        >

                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"

                            style={{
                              background:
                                `${stage.color}20`,

                              border:
                                `1px solid ${stage.color}40`,

                              boxShadow:
                                active
                                  ? `0 0 12px ${stage.color}60`
                                  : 'none',
                            }}
                          >

                            {done ? (

                              <Icon
                                name="CheckIcon"
                                size={14}
                                className="text-green-400"
                              />

                            ) : (

                              <Icon
                                name={
                                  stage.icon as Parameters<
                                    typeof Icon
                                  >[0]['name']
                                }

                                size={14}

                                style={{
                                  color:
                                    stage.color,
                                }}
                              />

                            )}

                          </div>


                          <span
                            className={`text-sm font-semibold ${
                              active
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >

                            {stage.label}

                          </span>


                          {active && (

                            <div className="ml-auto flex gap-1">

                              {[0, 1, 2].map(
                                (d) => (

                                  <div
                                    key={d}

                                    className="size-1.5 bg-accent rounded-full animate-bounce"

                                    style={{
                                      animationDelay:
                                        `${d * 150}ms`,
                                    }}
                                  />

                                )
                              )}

                            </div>

                          )}


                          {done && (

                            <Icon
                              name="CheckCircleIcon"
                              size={16}
                              className="ml-auto text-green-400"
                            />

                          )}

                        </div>

                      );

                    }
                  )}

                </div>


                <div className="mt-5 h-1.5 rounded-full bg-muted/50 overflow-hidden">

                  <div
                    className="h-full rounded-full transition-all duration-500"

                    style={{
                      width:
                        `${((pipelineStage + 1) / pipelineStages.length) * 100}%`,

                      background:
                        'linear-gradient(90deg, #7C3AED, #A855F7, #2563EB)',

                      boxShadow:
                        '0 0 8px rgba(168,85,247,0.6)',
                    }}
                  />

                </div>

              </div>

            )}


            {/* =================================================
                ANSWER
            ================================================= */}

            {answer &&
              !isProcessing && (

                <div
                  ref={answerRef}
                  className="space-y-4"
                >


                  {/* -----------------------------------------
                      STATS
                  ----------------------------------------- */}

                  <div className="grid grid-cols-3 gap-3">

                    {[
                      {
                        label:
                          'Chunks Retrieved',

                        value:
                          String(
                            answer.chunks
                          ),
                      },

                      {
                        label:
                          'Latency',

                        value:
                          answer.latency,
                      },

                      {
                        label:
                          'Confidence',

                        value:
                          `${answer.confidence}%`,
                      },
                    ].map(
                      (
                        stat
                      ) => (

                        <div
                          key={
                            stat.label
                          }

                          className="glass-card rounded-2xl p-4 text-center border border-border/40"
                        >

                          <p className="text-xl font-black text-accent">

                            {stat.value}

                          </p>

                          <p className="text-[10px] text-muted-foreground mt-1">

                            {stat.label}

                          </p>

                        </div>

                      )
                    )}

                  </div>


                  {/* -----------------------------------------
                      AI ANSWER
                  ----------------------------------------- */}

                  <div className="glass-card rounded-3xl p-6 border border-primary/30">

                    <div className="flex items-center justify-between mb-4">

                      <p className="text-xs font-bold text-accent uppercase tracking-widest">

                        AI Answer

                      </p>


                      {isTyping && (

                        <div className="flex gap-1">

                          {[0, 1, 2].map(
                            (d) => (

                              <div
                                key={d}

                                className="size-1.5 bg-accent rounded-full animate-bounce"

                                style={{
                                  animationDelay:
                                    `${d * 150}ms`,
                                }}
                              />

                            )
                          )}

                        </div>

                      )}

                    </div>


                    <p className="text-sm text-foreground/90 leading-relaxed font-mono">

                      {typedAnswer}

                      {isTyping && (

                        <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />

                      )}

                    </p>

                  </div>


                  {/* -----------------------------------------
                      SOURCES
                  ----------------------------------------- */}

                  <div className="glass-card rounded-3xl p-6">

                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">

                      Retrieved Sources

                    </p>


                    <div className="space-y-2">

                      {answer.sources.length === 0 ? (

                        <p className="text-sm text-muted-foreground">

                          No sources returned.

                        </p>

                      ) : (

                        answer.sources.map(
                          (
                            src,
                            i
                          ) => (

                            <div
                              key={i}

                              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors"
                            >

                              <span className="text-xs font-black text-secondary shrink-0">

                                {i + 1}

                              </span>


                              <span className="text-xs text-muted-foreground flex-1 truncate">

                                {src.label}

                              </span>


                              <span className="text-xs text-muted-foreground/60 shrink-0">

                                {src.page}

                              </span>


                              <div className="flex items-center gap-1 shrink-0">

                                <div className="w-12 h-1 rounded-full bg-muted/50 overflow-hidden">

                                  <div
                                    className="h-full rounded-full bg-accent"

                                    style={{
                                      width:
                                        `${src.relevance}%`,
                                    }}
                                  />

                                </div>


                                <span className="text-[10px] text-accent font-bold">

                                  {src.relevance}%

                                </span>

                              </div>

                            </div>

                          )
                        )

                      )}

                    </div>

                  </div>

                </div>

              )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!answer &&
              !isProcessing && (

                <div className="glass-card rounded-3xl p-12 text-center border border-dashed border-border/40">

                  <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 inline-flex mb-5">

                    <Icon
                      name="MagnifyingGlassIcon"
                      size={36}
                      className="text-primary/60"
                    />

                  </div>


                  <p className="font-bold text-foreground mb-2">

                    No query yet

                  </p>


                  <p className="text-sm text-muted-foreground">

                    {documentId
                      ? 'Ask a question to see the RAG pipeline in action'
                      : 'Upload a document to get started'}

                  </p>

                </div>

              )}


            {/* =================================================
                QUERY HISTORY
            ================================================= */}

            {queryHistory.length > 1 && (

              <div className="glass-card rounded-3xl p-6">

                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">

                  Query History

                </p>


                <div className="space-y-2">

                  {queryHistory
                    .slice(1)
                    .map(
                      (
                        item,
                        i
                      ) => (

                        <button
                          key={i}

                          onClick={() => {

                            setAnswer(
                              item.a
                            );

                            setTypedAnswer(
                              item.a.answer
                            );

                            setIsTyping(
                              false
                            );

                          }}

                          className="w-full text-left px-4 py-2.5 rounded-xl text-xs border border-border/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground transition-all duration-200 truncate"
                        >

                          {item.q}

                        </button>

                      )
                    )}

                </div>

              </div>

            )}

          </div>

        </div>

      </section>


      <Footer />

    </main>
  );
}