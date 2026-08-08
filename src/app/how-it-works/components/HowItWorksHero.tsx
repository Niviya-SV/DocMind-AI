'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function HowItWorksHero() {
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
    document.querySelectorAll('.reveal, .reveal-scale')?.forEach((el) => {
      el?.classList?.add('hidden-reveal');
      observer?.observe(el);
    });
    return () => observer?.disconnect();
  }, []);

  return (
    <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden hero-bg pt-28 pb-20">
      <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[500px] blob-secondary pointer-events-none opacity-40"
        style={{ animation: 'blob-morph 10s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] blob-primary pointer-events-none opacity-30"
        style={{ animation: 'blob-morph 12s ease-in-out infinite 2s' }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="reveal section-label">Step by Step</div>
        <h1 className="reveal stagger-1 text-hero-xl font-extrabold tracking-tight leading-tight">
          How <span className="gradient-text-purple">RAG</span> Transforms
          <br />
          Your Documents
        </h1>
        <p className="reveal stagger-2 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          From a raw PDF to a precise, cited answer — here is every step in the Retrieval Augmented Generation pipeline.
        </p>

        {/* Mini pipeline preview */}
        <div className="reveal stagger-3 flex flex-wrap items-center justify-center gap-2 mt-4">
          {['PDF', '→', 'Chunks', '→', 'Embed', '→', 'Store', '→', 'Retrieve', '→', 'LLM', '→', 'Answer']?.map(
            (item, i) => (
              <span
                key={i}
                className={
                  item === '→' ?'text-muted-foreground/40 text-lg' :'px-3 py-1.5 rounded-lg glass-card text-xs font-black uppercase tracking-widest text-accent border border-primary/30'
                }
              >
                {item}
              </span>
            )
          )}
        </div>

        <div className="reveal stagger-4 flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="#pipeline"
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-accent transition-all glow-primary"
          >
            Explore Pipeline
            <Icon name="ArrowDownIcon" size={18} />
          </Link>
          <Link
            href="/features"
            className="flex items-center gap-2 px-8 py-4 border border-border/60 text-foreground font-bold text-sm uppercase tracking-widest rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            View Features
          </Link>
        </div>
      </div>
    </section>
  );
}