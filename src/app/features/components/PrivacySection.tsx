'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const privacyPoints = [
  {
    icon: 'ServerIcon',
    title: 'Runs 100% On Your Machine',
    desc: 'Node.js server, MongoDB, and Ollama all run locally. No external dependencies.',
  },
  {
    icon: 'WifiIcon',
    title: 'No Internet Required',
    desc: 'Once installed, RAGVault works completely offline. Air-gapped environments supported.',
  },
  {
    icon: 'LockClosedIcon',
    title: 'Your Data, Your Control',
    desc: 'Files are stored in your local MongoDB instance. Delete anytime with zero residue.',
  },
  {
    icon: 'ShieldCheckIcon',
    title: 'GDPR & HIPAA Friendly',
    desc: 'Since no data leaves your system, compliance with data protection regulations is straightforward.',
  },
];

export default function PrivacySection() {
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
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
      el.classList.add('hidden-reveal');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-green-950/10 to-background pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="reveal section-label text-green-400">Privacy Architecture</div>
            <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight">
              Zero Cloud.
              <br />
              <span className="gradient-text-purple">Zero Compromise.</span>
            </h2>
            <p className="reveal stagger-2 text-lg text-muted-foreground leading-relaxed">
              Traditional AI tools send your documents to third-party servers. RAGVault keeps everything local.
              Your confidential contracts, research papers, and private documents never leave your machine.
            </p>

            {/* Comparison */}
            <div className="reveal stagger-3 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/5">
                <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-3">Cloud AI Tools</p>
                <div className="space-y-2">
                  {['Data sent to servers', 'API costs per query', 'Internet required', 'Privacy risks'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Icon name="XMarkIcon" size={14} className="text-red-400 shrink-0" />
                      <span className="text-xs text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-green-500/30 bg-green-500/5">
                <p className="text-xs font-black text-green-400 uppercase tracking-widest mb-3">RAGVault</p>
                <div className="space-y-2">
                  {['100% local processing', 'Zero API costs', 'Works offline', 'Complete privacy'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Icon name="CheckIcon" size={14} className="text-green-400 shrink-0" />
                      <span className="text-xs text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — privacy points */}
          <div className="space-y-4">
            {privacyPoints.map((point, index) => (
              <div
                key={point.title}
                className="reveal flex gap-4 p-6 rounded-2xl glass-card border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-xl bg-green-500/10 text-green-400 shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Icon name={point.icon as Parameters<typeof Icon>[0]['name']} size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{point.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}