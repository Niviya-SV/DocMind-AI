'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const useCases = [
  {
    icon: 'AcademicCapIcon',
    title: 'Students & Researchers',
    desc: 'Upload research papers, textbooks, and thesis documents. Ask complex questions, get cited answers. Build your personal academic knowledge base.',
    examples: ['Literature review automation', 'Citation finding', 'Cross-paper synthesis'],
    color: 'from-blue-500/20 to-cyan-600/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    icon: 'BuildingOffice2Icon',
    title: 'Legal Firms',
    desc: 'Analyze contracts, case law, and legal briefs privately. Never send confidential client documents to cloud services.',
    examples: ['Contract analysis', 'Case law research', 'Clause extraction'],
    color: 'from-yellow-500/20 to-amber-600/10',
    border: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
  },
  {
    icon: 'BuildingStorefrontIcon',
    title: 'Enterprises',
    desc: 'Internal knowledge management, policy Q&A, technical documentation search. Reduce support tickets by 60%.',
    examples: ['Policy compliance', 'Technical docs search', 'Onboarding automation'],
    color: 'from-primary/20 to-accent/10',
    border: 'border-primary/30',
    iconColor: 'text-accent',
  },
  {
    icon: 'HeartIcon',
    title: 'Medical & Healthcare',
    desc: 'HIPAA-compliant document analysis. Clinical guidelines, patient records, research papers — all local, all private.',
    examples: ['Clinical guideline lookup', 'Drug interaction research', 'Patient record Q&A'],
    color: 'from-red-500/20 to-rose-600/10',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
  },
];

export default function UseCasesSection() {
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
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="reveal section-label">Use Cases</div>
          <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
            Built for <span className="gradient-text-purple">Every Domain</span>
          </h2>
          <p className="reveal stagger-2 text-muted-foreground text-lg max-w-xl mx-auto">
            Whether you work with research papers or confidential legal contracts, RAGVault adapts to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((uc, index) => (
            <div
              key={uc.title}
              className={`reveal reveal-scale group p-8 rounded-3xl bg-gradient-to-br ${uc.color} border ${uc.border} hover:scale-[1.02] transition-all duration-500 overflow-hidden relative`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className={`p-3 rounded-2xl bg-card/50 ${uc.iconColor}`}>
                  <Icon name={uc.icon as Parameters<typeof Icon>[0]['name']} size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-foreground">{uc.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{uc.desc}</p>
              <div className="space-y-2">
                {uc.examples.map((ex) => (
                  <div key={ex} className="flex items-center gap-2">
                    <Icon name="CheckCircleIcon" size={16} className={uc.iconColor} />
                    <span className="text-xs font-semibold text-muted-foreground">{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}