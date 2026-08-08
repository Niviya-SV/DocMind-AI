'use client';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const sampleQuestions = [
  'What is Retrieval Augmented Generation?',
  'Summarize the key findings of this paper',
  'What methodology was used in Chapter 3?',
  'List all references cited in Section 2',
];

const sampleAnswer = `Retrieval Augmented Generation (RAG) is a technique that combines information retrieval and text generation. It first retrieves the most relevant documents or passages from a knowledge base and then uses a language model to generate accurate answers based on that context.`;

const sources = [
  { label: 'RAG Paper (Lewis et al., 2020)', page: 'p.3' },
  { label: 'langchain/docs/rag.md', page: 'p.1' },
  { label: 'Machine Learning.pdf', page: 'p.43' },
];

export default function DemoPreviewSection() {
  const [activeQ, setActiveQ] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Auto-cycle questions
    const interval = setInterval(() => {
      setActiveQ((prev) => (prev + 1) % sampleQuestions?.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Typewriter effect
    setTypedAnswer('');
    setIsTyping(true);
    let i = 0;
    const timer = setInterval(() => {
      if (i < sampleAnswer?.length) {
        setTypedAnswer(sampleAnswer?.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 18);
    return () => clearInterval(timer);
  }, [activeQ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('hidden-reveal');
          }
        });
      },
      { threshold: 0.1 }
    );
    sectionRef?.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')?.forEach((el) => {
      el?.classList?.add('hidden-reveal');
      observer?.observe(el);
    });
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="demo" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] blob-secondary pointer-events-none opacity-50" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">Demo Preview</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            See It <span className="gradient-text-purple">In Action</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            Ask your documents anything. Get answers with sources, instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Question panel */}
          <div className="reveal-left space-y-4">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-2 bg-red-500 rounded-full" />
                <div className="size-2 bg-yellow-500 rounded-full" />
                <div className="size-2 bg-green-500 rounded-full" />
                <span className="ml-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Query Terminal</span>
              </div>

              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Sample Questions</p>
              <div className="space-y-2">
                {sampleQuestions?.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveQ(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                      activeQ === i
                        ? 'bg-primary/20 border border-primary/50 text-foreground font-semibold'
                        : 'border border-border/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload area */}
            <div className="glass-card rounded-3xl p-6 border border-dashed border-primary/30 hover:border-primary/60 transition-colors">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Icon name="ArrowUpTrayIcon" size={28} className="text-accent" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Drop your PDF here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-muted/50">PDF</span>
                  <span className="px-2 py-0.5 rounded bg-muted/50">DOC</span>
                  <span className="px-2 py-0.5 rounded bg-muted/50">TXT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Answer panel */}
          <div className="reveal-right glass-card rounded-3xl p-6 space-y-4">
            {/* Active query */}
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Query</p>
              <p className="text-sm text-foreground font-medium">{sampleQuestions?.[activeQ]}</p>
            </div>

            {/* Answer */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-accent uppercase tracking-widest">Answer</p>
                {isTyping && (
                  <div className="flex gap-1">
                    <div className="size-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="size-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="size-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-mono">
                {typedAnswer}
                {isTyping && <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />}
              </p>
            </div>

            {/* Sources */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sources</p>
              {sources?.map((src, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-bold text-secondary">{i + 1}.</span>
                  <span className="text-xs text-muted-foreground flex-1 truncate">{src?.label}</span>
                  <span className="text-xs text-muted-foreground/60 shrink-0">{src?.page}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Chunks Retrieved', value: '3' },
                { label: 'Latency', value: '0.8s' },
                { label: 'Confidence', value: '94%' },
              ]?.map((stat) => (
                <div key={stat?.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border/30">
                  <p className="text-lg font-black text-accent">{stat?.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat?.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}