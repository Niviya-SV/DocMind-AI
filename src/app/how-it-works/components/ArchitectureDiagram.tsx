'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const archNodes = [
  {
    id: 'frontend',
    label: 'React Frontend',
    sub: 'Upload UI · Chat Interface',
    icon: 'ComputerDesktopIcon',
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'from-cyan-500/20 to-transparent',
    col: 1,
    row: 1,
  },
  {
    id: 'api',
    label: 'Express API',
    sub: 'REST Endpoints · Auth',
    icon: 'ServerIcon',
    color: 'text-orange-400',
    border: 'border-orange-500/40',
    bg: 'from-orange-500/20 to-transparent',
    col: 2,
    row: 1,
  },
  {
    id: 'python',
    label: 'Python Service',
    sub: 'PDF Parse · Chunking',
    icon: 'CpuChipIcon',
    color: 'text-yellow-400',
    border: 'border-yellow-500/40',
    bg: 'from-yellow-500/20 to-transparent',
    col: 3,
    row: 1,
  },
  {
    id: 'embeddings',
    label: 'Embeddings',
    sub: 'Sentence Transformers',
    icon: 'CircleStackIcon',
    color: 'text-accent',
    border: 'border-primary/40',
    bg: 'from-primary/20 to-transparent',
    col: 3,
    row: 2,
  },
  {
    id: 'mongodb',
    label: 'MongoDB Atlas',
    sub: 'Vector Store · Metadata',
    icon: 'CircleStackIcon',
    color: 'text-green-400',
    border: 'border-green-500/40',
    bg: 'from-green-500/20 to-transparent',
    col: 2,
    row: 2,
  },
  {
    id: 'ollama',
    label: 'Ollama LLM',
    sub: 'Llama 3 · Mistral · Phi-3',
    icon: 'SparklesIcon',
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'from-purple-500/20 to-transparent',
    col: 1,
    row: 2,
  },
];

const connections = [
  { from: 'frontend', to: 'api', label: 'HTTP' },
  { from: 'api', to: 'python', label: 'Process' },
  { from: 'python', to: 'embeddings', label: 'Encode' },
  { from: 'embeddings', to: 'mongodb', label: 'Store' },
  { from: 'mongodb', to: 'ollama', label: 'Context' },
  { from: 'ollama', to: 'frontend', label: 'Answer' },
];

export default function ArchitectureDiagram() {
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
    sectionRef.current?.querySelectorAll('.reveal, .reveal-scale').forEach((el) => {
      el.classList.add('hidden-reveal');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] blob-primary pointer-events-none opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">System Architecture</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            How It All <span className="gradient-text-purple">Fits Together</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            A full-stack MERN architecture with Python microservice for AI processing.
          </p>
        </div>

        {/* Architecture grid */}
        <div className="reveal-scale glass-card rounded-3xl p-8 border border-border/40 mb-12">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {archNodes
              .filter((n) => n.row === 1)
              .sort((a, b) => a.col - b.col)
              .map((node, index) => (
                <div
                  key={node.id}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${node.bg} border ${node.border} flex items-center gap-4 hover:scale-[1.02] transition-all duration-300`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className={`p-3 rounded-xl bg-card/50 ${node.color} shrink-0`}>
                    <Icon name={node.icon as Parameters<typeof Icon>[0]['name']} size={24} />
                  </div>
                  <div>
                    <p className={`font-bold ${node.color}`}>{node.label}</p>
                    <p className="text-xs text-muted-foreground">{node.sub}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Connector arrows */}
          <div className="flex justify-center gap-12 mb-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Icon name="ArrowDownIcon" size={16} className="text-muted-foreground/40" />
                <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                  {connections[i]?.label}
                </span>
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {archNodes
              .filter((n) => n.row === 2)
              .sort((a, b) => b.col - a.col)
              .map((node, index) => (
                <div
                  key={node.id}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${node.bg} border ${node.border} flex items-center gap-4 hover:scale-[1.02] transition-all duration-300`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className={`p-3 rounded-xl bg-card/50 ${node.color} shrink-0`}>
                    <Icon name={node.icon as Parameters<typeof Icon>[0]['name']} size={24} />
                  </div>
                  <div>
                    <p className={`font-bold ${node.color}`}>{node.label}</p>
                    <p className="text-xs text-muted-foreground">{node.sub}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Data flow legend */}
          <div className="mt-8 pt-6 border-t border-border/30 flex flex-wrap gap-6 justify-center">
            {connections.map((conn) => (
              <div key={`${conn.from}-${conn.to}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-6 h-px bg-primary/60" />
                <span className="font-semibold capitalize">{conn.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="reveal text-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-accent transition-all glow-primary"
          >
            Explore All Features
            <Icon name="ArrowRightIcon" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}