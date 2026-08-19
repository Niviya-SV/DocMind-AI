'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function ClosingSection() {
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
    <section ref={sectionRef} id="about" className="relative py-32 overflow-hidden">
      {/* Atmospheric blobs */}
      <div className="absolute inset-0 hero-bg pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] blob-primary pointer-events-none opacity-50"
        style={{ animation: 'blob-morph 12s ease-in-out infinite' }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-10">
        <div className="reveal section-label">The Future of Knowledge</div>

        <h2 className="reveal stagger-1 text-section-xl font-extrabold tracking-tight leading-tight text-foreground">
          Knowledge Is No Longer
          <br />
          Searched. It Is{' '}
          <span className="gradient-text-purple text-glow-primary">Understood.</span>
        </h2>

        <p className="reveal stagger-2 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          DOCMIND AI transforms static PDFs into living knowledge bases. Ask questions the way you think.
          Get answers the way you need. Completely private. Completely yours.
        </p>

        {/* Stats */}
        <div className="reveal stagger-3 grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
          {[
            { value: '35+', label: 'PDF Formats', color: 'text-accent' },
            { value: '12+', label: 'Local LLMs', color: 'text-secondary' },
            { value: '100%', label: 'Private', color: 'text-green-400' },
            { value: '< 1s', label: 'Query Time', color: 'text-yellow-400' },
          ]?.map((stat) => (
            <div
              key={stat?.label}
              className="p-6 rounded-3xl glass-card border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            >
              <p className={`text-4xl font-black tracking-tighter ${stat?.color}`}>{stat?.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">{stat?.label}</p>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <div className="reveal stagger-4 flex flex-wrap justify-center gap-3">
          {['Students', 'Researchers', 'Legal Firms', 'Enterprises', 'Medical', 'Education']?.map((useCase) => (
            <span
              key={useCase}
              className="px-4 py-2 rounded-full border border-border/50 bg-card/50 text-sm font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all duration-300"
            >
              {useCase}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="reveal stagger-5 flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="#demo"
            className="group flex items-center justify-center gap-2 px-10 py-5 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-accent transition-all duration-300 glow-primary"
          >
            Explore Demo
            <Icon name="ArrowRightIcon" size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/how-it-works"
            className="flex items-center justify-center gap-2 px-10 py-5 border border-border/60 text-foreground font-bold text-sm uppercase tracking-widest rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            Learn How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}