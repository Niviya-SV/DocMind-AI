'use client';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface VectorDot {
  id: number;
  x: number;
  y: number;
  label: string;
  isQuery?: boolean;
  isMatch?: boolean;
  similarity?: number;
}

const staticDots: VectorDot[] = [
  { id: 1, x: 20, y: 25, label: 'Chunk 1', similarity: 0.92, isMatch: true },
  { id: 2, x: 35, y: 40, label: 'Chunk 2', similarity: 0.87, isMatch: true },
  { id: 3, x: 15, y: 60, label: 'Chunk 3', similarity: 0.71 },
  { id: 4, x: 55, y: 20, label: 'Chunk 4', similarity: 0.34 },
  { id: 5, x: 70, y: 45, label: 'Chunk 5', similarity: 0.28 },
  { id: 6, x: 80, y: 25, label: 'Chunk 6', similarity: 0.19 },
  { id: 7, x: 45, y: 70, label: 'Chunk 7', similarity: 0.55 },
  { id: 8, x: 60, y: 65, label: 'Chunk 8', similarity: 0.41 },
  { id: 9, x: 85, y: 60, label: 'Chunk 9', similarity: 0.15 },
  { id: 10, x: 25, y: 80, label: 'Chunk 10', similarity: 0.63 },
  { id: 11, x: 75, y: 80, label: 'Chunk 11', similarity: 0.22 },
  { id: 12, x: 50, y: 50, label: 'Query', isQuery: true },
];

export default function VectorSearchViz() {
  const [searching, setSearching] = useState(false);
  const [done, setDone] = useState(false);
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
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      el.classList.add('hidden-reveal');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleSearch = () => {
    setSearching(true);
    setDone(false);
    setTimeout(() => {
      setSearching(false);
      setDone(true);
    }, 2000);
  };

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">Vector Search</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            Searching <span className="gradient-text-blue">Knowledge Space</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            Your question becomes a vector. MongoDB finds the nearest semantic neighbors in milliseconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Vector space visualization */}
          <div className="reveal-left relative">
            <div className="glass-card rounded-3xl p-6 border border-secondary/30">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Vector Space (2D projection)</p>
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-secondary/30 transition-all"
                >
                  <Icon name="MagnifyingGlassIcon" size={14} />
                  {searching ? 'Searching...' : 'Run Search'}
                </button>
              </div>

              {/* Dot canvas */}
              <div className="relative w-full h-[320px] bg-black/40 rounded-2xl overflow-hidden border border-border/20">
                {/* Grid lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid */}
                  {[20, 40, 60, 80].map((v) => (
                    <React.Fragment key={v}>
                      <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(124,58,237,0.1)" strokeWidth="0.3" />
                      <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(124,58,237,0.1)" strokeWidth="0.3" />
                    </React.Fragment>
                  ))}

                  {/* Connection lines from query to matches */}
                  {done &&
                    staticDots
                      .filter((d) => d.isMatch)
                      .map((d) => {
                        const query = staticDots.find((dot) => dot.isQuery);
                        if (!query) return null;
                        return (
                          <line
                            key={d.id}
                            x1={query.x}
                            y1={query.y}
                            x2={d.x}
                            y2={d.y}
                            stroke="rgba(168,85,247,0.7)"
                            strokeWidth="0.8"
                            strokeDasharray="2 1"
                          />
                        );
                      })}
                </svg>

                {/* Dots */}
                {staticDots.map((dot) => (
                  <div
                    key={dot.id}
                    className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  >
                    <div
                      className={`rounded-full transition-all duration-500 ${
                        dot.isQuery
                          ? 'w-4 h-4 bg-yellow-400 animate-pulse-glow'
                          : dot.isMatch && done
                          ? 'w-3 h-3 bg-accent'
                          : searching
                          ? 'w-2.5 h-2.5 bg-primary/70 animate-pulse' :'w-2.5 h-2.5 bg-primary/40'
                      }`}
                      style={{
                        boxShadow: dot.isQuery
                          ? '0 0 15px rgba(234,179,8,0.8)'
                          : dot.isMatch && done
                          ? '0 0 10px rgba(168,85,247,0.8)'
                          : 'none',
                      }}
                    />
                    <span
                      className={`text-[8px] font-bold whitespace-nowrap transition-colors duration-300 ${
                        dot.isQuery
                          ? 'text-yellow-400'
                          : dot.isMatch && done
                          ? 'text-accent' :'text-muted-foreground/50'
                      }`}
                    >
                      {dot.label}
                    </span>
                  </div>
                ))}

                {/* Searching animation ring */}
                {searching && (
                  <div
                    className="absolute rounded-full border-2 border-accent/50 animate-ping-slow pointer-events-none"
                    style={{
                      left: `${staticDots.find((d) => d.isQuery)!.x}%`,
                      top: `${staticDots.find((d) => d.isQuery)!.y}%`,
                      width: '80px',
                      height: '80px',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>

              <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-yellow-400" />
                  Query Vector
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-accent" />
                  Top Matches
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary/40" />
                  Other Chunks
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="reveal-right space-y-4">
            <div className="glass-card rounded-3xl p-6 border border-border/40">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
                Top Retrieved Chunks
              </p>
              <div className="space-y-3">
                {staticDots
                  .filter((d) => !d.isQuery && d.similarity !== undefined)
                  .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
                  .slice(0, 5)
                  .map((dot, i) => (
                    <div
                      key={dot.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                        done && dot.isMatch
                          ? 'border-accent/40 bg-accent/10' :'border-border/30 bg-transparent'
                      }`}
                    >
                      <div
                        className={`size-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          done && dot.isMatch ? 'bg-accent/20 text-accent' : 'bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{dot.label}</p>
                        <div className="mt-1 h-1 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${(dot.similarity ?? 0) * 100}%`,
                              background:
                                done && dot.isMatch
                                  ? 'linear-gradient(90deg, #A855F7, #7C3AED)'
                                  : 'rgba(124,58,237,0.3)',
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black shrink-0 ${
                          done && dot.isMatch ? 'text-accent' : 'text-muted-foreground'
                        }`}
                      >
                        {((dot.similarity ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Search Time', value: '42ms' },
                { label: 'Chunks Scanned', value: '1,247' },
                { label: 'Top Match', value: '92%' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl glass-card border border-border/30 text-center">
                  <p className="text-xl font-black text-accent">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}