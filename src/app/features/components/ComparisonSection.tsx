'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const rows = [
  { feature: 'Data Privacy', ragvault: true, chatgpt: false, claude: false, note: 'RAGVault: 100% local' },
  { feature: 'Works Offline', ragvault: true, chatgpt: false, claude: false, note: 'No internet needed' },
  { feature: 'Zero API Cost', ragvault: true, chatgpt: false, claude: false, note: 'Free after setup' },
  { feature: 'Source Citations', ragvault: true, chatgpt: false, claude: true, note: 'With page numbers' },
  { feature: 'Custom PDFs', ragvault: true, chatgpt: true, claude: true, note: 'Your own documents' },
  { feature: 'Multi-Document', ragvault: true, chatgpt: false, claude: false, note: 'Unlimited docs' },
  { feature: 'HIPAA Compliant', ragvault: true, chatgpt: false, claude: false, note: 'Local = compliant' },
  { feature: 'Open Source LLMs', ragvault: true, chatgpt: false, claude: false, note: 'Llama, Mistral, etc.' },
];

export default function ComparisonSection() {
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
    sectionRef?.current?.querySelectorAll('.reveal, .reveal-scale')?.forEach((el) => {
      el?.classList?.add('hidden-reveal');
      observer?.observe(el);
    });
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">Comparison</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            RAGVault vs <span className="gradient-text-purple">Cloud AI Tools</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            See why privacy-first matters for document intelligence.
          </p>
        </div>

        <div className="reveal-scale glass-card rounded-3xl overflow-hidden border border-border/40">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-0 bg-muted/30 border-b border-border/40">
            <div className="p-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Feature</div>
            <div className="p-5 text-center">
              <div className="text-sm font-black text-accent">RAGVault</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Local AI</div>
            </div>
            <div className="p-5 text-center">
              <div className="text-sm font-bold text-muted-foreground">ChatGPT</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Cloud</div>
            </div>
            <div className="p-5 text-center">
              <div className="text-sm font-bold text-muted-foreground">Claude</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Cloud</div>
            </div>
          </div>

          {/* Rows */}
          {rows?.map((row, index) => (
            <div
              key={row?.feature}
              className={`grid grid-cols-4 gap-0 border-b border-border/20 hover:bg-primary/5 transition-colors duration-200 ${
                index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
              }`}
            >
              <div className="p-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{row?.feature}</span>
              </div>
              <div className="p-4 flex items-center justify-center">
                {row?.ragvault ? (
                  <Icon name="CheckCircleIcon" size={20} className="text-green-400" variant="solid" />
                ) : (
                  <Icon name="XCircleIcon" size={20} className="text-red-400" variant="solid" />
                )}
              </div>
              <div className="p-4 flex items-center justify-center">
                {row?.chatgpt ? (
                  <Icon name="CheckCircleIcon" size={20} className="text-muted-foreground/60" variant="solid" />
                ) : (
                  <Icon name="XCircleIcon" size={20} className="text-muted-foreground/40" variant="solid" />
                )}
              </div>
              <div className="p-4 flex items-center justify-center">
                {row?.claude ? (
                  <Icon name="CheckCircleIcon" size={20} className="text-muted-foreground/60" variant="solid" />
                ) : (
                  <Icon name="XCircleIcon" size={20} className="text-muted-foreground/40" variant="solid" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}