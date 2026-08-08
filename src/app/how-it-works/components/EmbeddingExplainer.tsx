'use client';
import React, { useEffect, useRef } from 'react';

const vectorExample = [0.23, -0.71, 0.44, 0.09, -0.38, 0.61, 0.17, -0.52, 0.83, -0.29, 0.45, 0.11];

const embeddingSteps = [
  {
    label: 'Raw Text',
    content: '"What is Retrieval Augmented Generation?"',
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'from-yellow-500/10 to-transparent',
  },
  {
    label: 'Tokenized',
    content: '["What", "is", "Retrieval", "Augmented", "Generation", "?"]',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'from-orange-500/10 to-transparent',
  },
  {
    label: 'Sentence Transformer',
    content: 'all-MiniLM-L6-v2 → 384 dimensions',
    color: 'text-accent',
    border: 'border-primary/30',
    bg: 'from-primary/10 to-transparent',
  },
  {
    label: 'Vector Output',
    content: '[0.23, -0.71, 0.44, 0.09, -0.38, 0.61 ... × 384]',
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'from-green-500/10 to-transparent',
  },
];

export default function EmbeddingExplainer() {
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
      { threshold: 0.1 }
    );
    sectionRef?.current?.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right')?.forEach((el) => {
      el?.classList?.add('hidden-reveal');
      observer?.observe(el);
    });
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] blob-accent pointer-events-none opacity-30" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">Embeddings Explained</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            Text Becomes <span className="gradient-text-purple">Numbers</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            Sentence transformers convert meaning into mathematics. Similar meanings → similar vectors.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Transformation flow */}
          <div className="reveal-left space-y-4">
            {embeddingSteps?.map((step, index) => (
              <div
                key={step?.label}
                className={`p-5 rounded-2xl bg-gradient-to-r ${step?.bg} border ${step?.border} transition-all duration-300 hover:scale-[1.01]`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <p className={`text-xs font-black uppercase tracking-widest mb-2 ${step?.color}`}>{step?.label}</p>
                <p className="text-sm font-mono text-foreground/80">{step?.content}</p>
              </div>
            ))}

            {/* Arrow */}
            <div className="flex items-center justify-center py-2">
              <div className="h-8 w-0.5 bg-gradient-to-b from-accent to-secondary" />
            </div>

            <div className="p-5 rounded-2xl glass-card border border-accent/40 glow-accent">
              <p className="text-xs font-black text-accent uppercase tracking-widest mb-3">Stored in MongoDB</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each vector is stored alongside the original text chunk and source metadata.
                At query time, the question is also embedded, and cosine similarity finds the closest vectors.
              </p>
            </div>
          </div>

          {/* Right: Visual vector representation */}
          <div className="reveal-right glass-card rounded-3xl p-6 border border-border/40">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">
              Vector Visualization (first 12 of 384 dims)
            </p>

            {/* Bar chart of vector values */}
            <div className="space-y-2 mb-8">
              {vectorExample?.map((val, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground/60 w-6 shrink-0">d{i}</span>
                  <div className="flex-1 h-4 bg-muted/20 rounded-full overflow-hidden relative">
                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50" />
                    {/* Bar */}
                    <div
                      className="absolute top-1 bottom-1 rounded-full transition-all duration-1000"
                      style={{
                        left: val >= 0 ? '50%' : `${50 + val * 45}%`,
                        width: `${Math.abs(val) * 45}%`,
                        background:
                          val >= 0
                            ? 'linear-gradient(90deg, #7C3AED, #A855F7)'
                            : 'linear-gradient(90deg, #2563EB, #60A5FA)',
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-mono w-10 text-right shrink-0 ${
                      val >= 0 ? 'text-accent' : 'text-secondary'
                    }`}
                  >
                    {val?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cosine similarity explanation */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
              <p className="text-xs font-black text-accent uppercase tracking-widest mb-2">Cosine Similarity</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Two vectors pointing in the same direction = similar meaning.
                <br />
                cos(θ) = 1.0 → identical · cos(θ) = 0.0 → unrelated · cos(θ) = -1.0 → opposite
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <p className="text-sm font-black text-green-400">0.94</p>
                  <p className="text-[9px] text-muted-foreground">Very similar</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <p className="text-sm font-black text-yellow-400">0.55</p>
                  <p className="text-[9px] text-muted-foreground">Somewhat related</p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <p className="text-sm font-black text-red-400">0.12</p>
                  <p className="text-[9px] text-muted-foreground">Not relevant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}