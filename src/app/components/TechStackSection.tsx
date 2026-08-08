'use client';
import React, { useEffect, useRef } from 'react';

const techStack = [
  { name: 'MongoDB', role: 'Vector Store', color: '#00ED64', angle: 0 },
  { name: 'Express', role: 'API Layer', color: '#FFFFFF', angle: 51 },
  { name: 'React', role: 'Frontend', color: '#61DAFB', angle: 102 },
  { name: 'Node.js', role: 'Runtime', color: '#8CC84B', angle: 153 },
  { name: 'Ollama', role: 'Local LLM', color: '#A855F7', angle: 204 },
  { name: 'LangChain', role: 'RAG Framework', color: '#F7DC6F', angle: 255 },
  { name: 'Python', role: 'Embeddings', color: '#3776AB', angle: 306 },
];

const innerStack = [
  { name: 'Llama 3', angle: 0 },
  { name: 'Mistral', angle: 90 },
  { name: 'Phi-3', angle: 180 },
  { name: 'Gemma', angle: 270 },
];

export default function TechStackSection() {
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
    <section ref={sectionRef} id="tech" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">Technology Stack</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            Built With <span className="gradient-text-blue">Modern AI</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            MERN Stack meets cutting-edge RAG architecture. Every component chosen for performance and privacy.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Orbital diagram */}
          <div className="reveal-scale relative w-[380px] h-[380px] shrink-0 mx-auto">
            {/* Outer orbit ring */}
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-orbit-spin" />
            {/* Middle orbit ring */}
            <div className="absolute inset-[60px] rounded-full border border-accent/15 animate-orbit-reverse" />
            {/* Inner orbit ring */}
            <div className="absolute inset-[120px] rounded-full border border-secondary/15" style={{ animation: 'orbit-spin 15s linear infinite' }} />

            {/* Center RAG node */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-node-pulse z-10">
                <span className="text-white font-black text-sm">RAG</span>
              </div>
            </div>

            {/* Outer tech nodes */}
            {techStack?.map((tech, i) => {
              const rad = (tech?.angle * Math.PI) / 180;
              const r = 160;
              const x = 190 + r * Math.cos(rad) - 30;
              const y = 190 + r * Math.sin(rad) - 30;
              return (
                <div
                  key={tech?.name}
                  className="absolute w-[60px] h-[60px] rounded-2xl glass-card flex flex-col items-center justify-center gap-0.5 hover:scale-110 transition-transform duration-300 cursor-default group"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    boxShadow: `0 0 20px ${tech?.color}30`,
                    border: `1px solid ${tech?.color}40`,
                  }}
                >
                  <span className="text-[9px] font-black text-foreground leading-none">{tech?.name}</span>
                  <span className="text-[7px] text-muted-foreground leading-none">{tech?.role}</span>
                  {/* Connection line (SVG) */}
                </div>
              );
            })}

            {/* Inner LLM nodes */}
            {innerStack?.map((llm) => {
              const rad = (llm?.angle * Math.PI) / 180;
              const r = 90;
              const x = 190 + r * Math.cos(rad) - 22;
              const y = 190 + r * Math.sin(rad) - 22;
              return (
                <div
                  key={llm?.name}
                  className="absolute w-[44px] h-[44px] rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center"
                  style={{ left: `${x}px`, top: `${y}px` }}
                >
                  <span className="text-[8px] font-black text-accent leading-none text-center">{llm?.name}</span>
                </div>
              );
            })}
          </div>

          {/* Right side — tech list */}
          <div className="flex-1 space-y-4">
            {techStack?.map((tech, index) => (
              <div
                key={tech?.name}
                className="reveal flex items-center gap-4 p-4 rounded-2xl border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: `${tech?.color}20`, color: tech?.color, border: `1px solid ${tech?.color}40` }}
                >
                  {tech?.name?.slice(0, 2)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{tech?.name}</span>
                    <span className="text-xs text-muted-foreground">{tech?.role}</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 group-hover:opacity-100 opacity-60"
                      style={{
                        width: `${65 + index * 5}%`,
                        background: `linear-gradient(90deg, ${tech?.color}, ${tech?.color}80)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}