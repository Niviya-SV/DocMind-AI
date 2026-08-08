'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

// Bento audit:
// 6 cards: LocalPrivate, MultiPDF, AIPowered, SemanticSearch, SourceLinks, FastEfficient
// Row 1: [col-1: LocalPrivate cs-1] [col-2: MultiPDF cs-1] [col-3: AIPowered cs-1]
// Row 2: [col-1: SemanticSearch cs-1] [col-2: SourceLinks cs-1] [col-3: FastEfficient cs-1]
// Placed 6/6 ✓

const features = [
  {
    id: 'LocalPrivate',
    icon: 'LockClosedIcon',
    title: 'Local & Private',
    desc: 'All processing happens locally on your machine. No data leaves your network, ever.',
    tag: 'Zero Cloud',
    color: 'from-green-500/20 to-emerald-600/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-400',
    span: 'col-span-1',
  },
  {
    id: 'MultiPDF',
    icon: 'DocumentDuplicateIcon',
    title: 'Multiple PDFs',
    desc: 'Add and query multiple documents simultaneously. Build your entire knowledge base.',
    tag: 'Multi-Doc',
    color: 'from-blue-500/20 to-cyan-600/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    span: 'col-span-1',
  },
  {
    id: 'AIPowered',
    icon: 'SparklesIcon',
    title: 'AI-Powered',
    desc: 'Get accurate answers from local Ollama LLMs. Llama 3, Mistral, Phi-3, and more.',
    tag: 'Ollama',
    color: 'from-primary/20 to-accent/10',
    border: 'border-primary/30',
    iconColor: 'text-accent',
    span: 'col-span-1',
  },
  {
    id: 'SemanticSearch',
    icon: 'MagnifyingGlassCircleIcon',
    title: 'Semantic Search',
    desc: 'Find meaning, not just keywords. Vector similarity search retrieves the most relevant passages.',
    tag: 'Vector DB',
    color: 'from-purple-500/20 to-violet-600/10',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    span: 'col-span-1',
  },
  {
    id: 'SourceLinks',
    icon: 'LinkIcon',
    title: 'Source Links',
    desc: 'Every answer comes with cited sources. See exact pages and passages used.',
    tag: 'Transparent',
    color: 'from-yellow-500/20 to-amber-600/10',
    border: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    span: 'col-span-1',
  },
  {
    id: 'FastEfficient',
    icon: 'BoltIcon',
    title: 'Fast & Efficient',
    desc: 'Optimized for speed and accuracy. Sub-second vector search, instant context retrieval.',
    tag: 'Optimized',
    color: 'from-red-500/20 to-rose-600/10',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
    span: 'col-span-1',
  },
];

export default function FeaturesGridSection() {
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
    <section ref={sectionRef} id="features" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blob-primary pointer-events-none opacity-40"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">Features</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            Powerful <span className="gradient-text-purple">Features</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to build a private, intelligent document Q&A system.
          </p>
        </div>

        {/* Bento Grid */}
        {/* Row 1: [col-1: LocalPrivate] [col-2: MultiPDF] [col-3: AIPowered] */}
        {/* Row 2: [col-1: SemanticSearch] [col-2: SourceLinks] [col-3: FastEfficient] */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            /* Card: feature.id */
            <div
              key={feature.id}
              className={`reveal reveal-scale group relative p-8 rounded-3xl bg-gradient-to-br ${feature.color} border ${feature.border} hover:scale-[1.02] transition-all duration-500 cursor-default overflow-hidden`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Shimmer overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                }}
              />

              {/* Tag */}
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl bg-card/50 ${feature.iconColor}`}>
                  <Icon name={feature.icon as Parameters<typeof Icon>[0]['name']} size={24} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-card/50 ${feature.iconColor}`}>
                  {feature.tag}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-extrabold text-foreground mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>

              {/* Bottom decoration */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.border.replace('border-', 'from-').replace('/30', '/80')} to-transparent`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}