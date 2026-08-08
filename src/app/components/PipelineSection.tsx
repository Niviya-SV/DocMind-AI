'use client';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const pipelineSteps = [
  {
    id: 1,
    icon: 'DocumentTextIcon',
    label: 'PDF Document',
    color: 'from-red-500/30 to-red-600/20',
    border: 'border-red-500/40',
    glow: 'rgba(239,68,68,0.5)',
    desc: 'Upload any PDF',
  },
  {
    id: 2,
    icon: 'Squares2X2Icon',
    label: 'Chunks',
    color: 'from-orange-500/30 to-orange-600/20',
    border: 'border-orange-500/40',
    glow: 'rgba(249,115,22,0.5)',
    desc: 'Text splitting',
  },
  {
    id: 3,
    icon: 'CpuChipIcon',
    label: 'Embeddings',
    color: 'from-yellow-500/30 to-yellow-600/20',
    border: 'border-yellow-500/40',
    glow: 'rgba(234,179,8,0.5)',
    desc: 'Vector encoding',
  },
  {
    id: 4,
    icon: 'CircleStackIcon',
    label: 'Vector Database',
    color: 'from-green-500/30 to-green-600/20',
    border: 'border-green-500/40',
    glow: 'rgba(34,197,94,0.5)',
    desc: 'MongoDB Atlas',
  },
  {
    id: 5,
    icon: 'MagnifyingGlassIcon',
    label: 'Retriever',
    color: 'from-cyan-500/30 to-cyan-600/20',
    border: 'border-cyan-500/40',
    glow: 'rgba(6,182,212,0.5)',
    desc: 'Similarity search',
  },
  {
    id: 6,
    icon: 'SparklesIcon',
    label: 'LLM (Ollama)',
    color: 'from-primary/30 to-accent/20',
    border: 'border-primary/40',
    glow: 'rgba(124,58,237,0.5)',
    desc: 'Local inference',
  },
  {
    id: 7,
    icon: 'ChatBubbleLeftRightIcon',
    label: 'Answer',
    color: 'from-accent/30 to-secondary/20',
    border: 'border-accent/40',
    glow: 'rgba(168,85,247,0.5)',
    desc: 'Generated response',
  },
];

export default function PipelineSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [completing, setCompleting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const advance = () => {
      setActiveStep((prev) => {
        const next = prev + 1;
        if (next >= pipelineSteps.length) {
          // Show "complete" briefly then reset
          setCompleting(true);
          timeout = setTimeout(() => {
            setCompleting(false);
            setActiveStep(0);
          }, 1200);
          return prev; // stay at last step during completion flash
        }
        return next;
      });
    };

    const interval = setInterval(advance, 1200);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

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

  const displayStep = completing ? pipelineSteps.length - 1 : activeStep;
  const progressPct = completing ? 100 : Math.round(((activeStep + 1) / pipelineSteps.length) * 100);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">RAG Pipeline</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight text-foreground">
            How <span className="gradient-text-purple">RAG Works</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            A smarter way to connect documents with answers — 7 steps from PDF to precise response.
          </p>
        </div>

        {/* Pipeline Flow - Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-2 mb-16">
          {pipelineSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Node */}
              <div
                className="reveal flex flex-col items-center gap-3 cursor-pointer group"
                style={{ transitionDelay: `${index * 80}ms` }}
                onClick={() => setActiveStep(index)}
              >
                <div
                  className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center transition-all duration-500 ${
                    displayStep === index ? 'scale-125' : 'scale-100'
                  }`}
                  style={{
                    boxShadow: displayStep === index ? `0 0 40px ${step.glow}, 0 0 80px ${step.glow}40` : 'none',
                  }}
                >
                  <Icon name={step.icon as Parameters<typeof Icon>[0]['name']} size={28} className="text-foreground" />
                  {displayStep === index && (
                    <div
                      className="absolute inset-0 rounded-2xl border-2 border-foreground/30"
                      style={{ animation: 'ping-slow 1.5s ease-in-out infinite' }}
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground/80 whitespace-nowrap">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>

              {/* Connector arrow */}
              {index < pipelineSteps.length - 1 && (
                <div className="flex-1 flex items-center gap-0 -mt-6">
                  <div
                    className="h-[2px] flex-1 transition-all duration-500"
                    style={{
                      background:
                        displayStep > index
                          ? `linear-gradient(90deg, ${step.glow}, ${pipelineSteps[index + 1].glow})`
                          : 'rgba(124,58,237,0.2)',
                      boxShadow: displayStep > index ? `0 0 8px ${step.glow}` : 'none',
                    }}
                  />
                  <Icon
                    name="ChevronRightIcon"
                    size={14}
                    className={`-mt-0 transition-colors duration-300 ${
                      displayStep > index ? 'text-accent' : 'text-muted-foreground/30'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Pipeline Flow - Mobile (vertical) */}
        <div className="flex lg:hidden flex-col gap-4 mb-16">
          {pipelineSteps.map((step, index) => (
            <div
              key={step.id}
              className={`reveal flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                displayStep === index ? 'bg-primary/10 border border-primary/30' : 'border border-border/30'
              }`}
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center shrink-0`}
                style={{ boxShadow: displayStep === index ? `0 0 20px ${step.glow}` : 'none' }}
              >
                <Icon name={step.icon as Parameters<typeof Icon>[0]['name']} size={22} className="text-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
              <div className="ml-auto text-xs font-black text-muted-foreground/40">0{step.id}</div>
            </div>
          ))}
        </div>

        {/* Active step detail card */}
        <div className="reveal-scale glass-card rounded-3xl p-8 max-w-2xl mx-auto text-center">
          {completing ? (
            <>
              <div className="section-label mb-3 text-green-400">Pipeline Complete</div>
              <h3 className="text-2xl font-extrabold text-foreground mb-2">
                ✓ All Steps Done
              </h3>
              <p className="text-muted-foreground mb-6">Answer generated successfully</p>
            </>
          ) : (
            <>
              <div className="section-label mb-3">Currently Processing</div>
              <h3 className="text-2xl font-extrabold text-foreground mb-2">
                Step {activeStep + 1}: {pipelineSteps[activeStep].label}
              </h3>
              <p className="text-muted-foreground mb-6">{pipelineSteps[activeStep].desc}</p>
            </>
          )}
          {/* Animated data stream bar */}
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: completing
                  ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                  : 'linear-gradient(90deg, #7C3AED, #A855F7, #2563EB)',
                boxShadow: completing ? '0 0 10px rgba(34,197,94,0.6)' : '0 0 10px rgba(168,85,247,0.6)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">Start</span>
            <span className={`text-xs font-bold ${completing ? 'text-green-400' : 'text-accent'}`}>
              {progressPct}% {completing ? 'Complete ✓' : ''}
            </span>
            <span className="text-xs text-muted-foreground">Answer</span>
          </div>
        </div>
      </div>
    </section>
  );
}