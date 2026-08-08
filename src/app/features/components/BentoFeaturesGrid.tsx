'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

// Bento audit:
// 8 cards: RAGEngine, LocalLLM, VectorSearch, PDFParse, ChunkEmbed, PrivacyFirst, MultiDoc, ContextAware
// Row 1: [col-1+2: RAGEngine cs-2] [col-3: LocalLLM cs-1]
// Row 2: [col-1: VectorSearch cs-1] [col-2: PDFParse cs-1] [col-3: ChunkEmbed cs-1]
// Row 3: [col-1+2: PrivacyFirst cs-2] [col-3: MultiDoc cs-1]
// Row 4: [col-1: ContextAware cs-1] → col-span-full
// Placed 8/8 ✓

const bentoItems = [
  {
    id: 'RAGEngine',
    title: 'Full RAG Engine',
    desc: 'Complete Retrieval Augmented Generation pipeline — from raw PDF to structured answer with sources. Built on LangChain with MongoDB Atlas Vector Search.',
    icon: 'CpuChipIcon',
    tag: 'Core',
    colSpan: 'lg:col-span-2',
    bgGrad: 'from-primary/25 via-accent/15 to-secondary/10',
    border: 'border-primary/40',
    iconColor: 'text-accent',
    size: 'large',
  },
  {
    id: 'LocalLLM',
    title: 'Local LLM Support',
    desc: 'Run Llama 3, Mistral, Phi-3, Gemma via Ollama. Zero API costs.',
    icon: 'SparklesIcon',
    tag: 'Ollama',
    colSpan: 'lg:col-span-1',
    bgGrad: 'from-purple-500/20 to-violet-600/10',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    size: 'normal',
  },
  {
    id: 'VectorSearch',
    title: 'Vector Search',
    desc: 'MongoDB Atlas cosine similarity search finds the most relevant context in milliseconds.',
    icon: 'MagnifyingGlassCircleIcon',
    tag: 'MongoDB',
    colSpan: 'lg:col-span-1',
    bgGrad: 'from-green-500/20 to-emerald-600/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-400',
    size: 'normal',
  },
  {
    id: 'PDFParse',
    title: 'PDF Parsing',
    desc: 'Accurate text extraction from any PDF — scanned, native, or complex layouts.',
    icon: 'DocumentTextIcon',
    tag: 'PyPDF2',
    colSpan: 'lg:col-span-1',
    bgGrad: 'from-red-500/20 to-rose-600/10',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
    size: 'normal',
  },
  {
    id: 'ChunkEmbed',
    title: 'Chunk & Embed',
    desc: 'Intelligent text splitting with sentence-transformer embeddings for semantic accuracy.',
    icon: 'Squares2X2Icon',
    tag: 'Embeddings',
    colSpan: 'lg:col-span-1',
    bgGrad: 'from-yellow-500/20 to-amber-600/10',
    border: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    size: 'normal',
  },
  {
    id: 'PrivacyFirst',
    title: 'Privacy First — Zero Cloud AI',
    desc: 'Every byte stays on your machine. No OpenAI, no Anthropic, no Google. Your documents never leave your network. Perfect for legal, medical, and confidential data.',
    icon: 'ShieldCheckIcon',
    tag: 'Zero Cloud',
    colSpan: 'lg:col-span-2',
    bgGrad: 'from-green-600/25 via-emerald-500/15 to-teal-600/10',
    border: 'border-green-500/40',
    iconColor: 'text-green-400',
    size: 'large',
  },
  {
    id: 'MultiDoc',
    title: 'Multi-Document',
    desc: 'Build knowledge bases from dozens of PDFs. Cross-document retrieval.',
    icon: 'DocumentDuplicateIcon',
    tag: 'Multi-Doc',
    colSpan: 'lg:col-span-1',
    bgGrad: 'from-blue-500/20 to-cyan-600/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    size: 'normal',
  },
  {
    id: 'ContextAware',
    title: 'Context-Aware Answers with Source Citations',
    desc: 'Every answer includes the exact source passages, page numbers, and document names. Full transparency in every response — no hallucinations, no guessing.',
    icon: 'ChatBubbleLeftEllipsisIcon',
    tag: 'Cited Answers',
    colSpan: 'lg:col-span-3',
    bgGrad: 'from-secondary/25 via-primary/15 to-accent/10',
    border: 'border-secondary/40',
    iconColor: 'text-secondary',
    size: 'large',
  },
];

export default function BentoFeaturesGrid() {
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
      { threshold: 0.08 }
    );
    sectionRef.current?.querySelectorAll('.reveal, .reveal-scale').forEach((el) => {
      el.classList.add('hidden-reveal');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">Deep Dive</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            Full <span className="gradient-text-purple">Capability Suite</span>
          </h2>
        </div>

        {/* Bento Grid — 3 col on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1: RAGEngine cs-2, LocalLLM cs-1 */}
          {/* Row 2: VectorSearch cs-1, PDFParse cs-1, ChunkEmbed cs-1 */}
          {/* Row 3: PrivacyFirst cs-2, MultiDoc cs-1 */}
          {/* Row 4: ContextAware cs-3 (full) */}
          {bentoItems.map((item, index) => (
            /* Card: item.id */
            <div
              key={item.id}
              className={`reveal reveal-scale group relative p-8 rounded-3xl bg-gradient-to-br ${item.bgGrad} border ${item.border} transition-all duration-500 hover:scale-[1.01] overflow-hidden ${item.colSpan}`}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              {/* Shimmer */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.5s linear infinite',
                }}
              />

              <div className="flex items-start justify-between gap-4 mb-6">
                <div className={`p-3 rounded-2xl bg-card/50 ${item.iconColor} shrink-0`}>
                  <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={item.size === 'large' ? 32 : 24} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-card/50 shrink-0 ${item.iconColor}`}>
                  {item.tag}
                </span>
              </div>

              <h3 className={`font-extrabold text-foreground mb-3 ${item.size === 'large' ? 'text-2xl' : 'text-xl'}`}>
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}