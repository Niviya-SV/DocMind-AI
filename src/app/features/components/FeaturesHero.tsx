'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function FeaturesHero() {
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
    document.querySelectorAll('.reveal, .reveal-scale')?.forEach((el) => {
      el?.classList?.add('hidden-reveal');
      observer?.observe(el);
    });
    return () => observer?.disconnect();
  }, []);

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden hero-bg pt-28 pb-16">
      <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blob-primary pointer-events-none opacity-40" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="reveal section-label">All Features</div>
        <h1 className="reveal stagger-1 text-hero-xl font-extrabold tracking-tight leading-tight">
          Everything You Need for
          <br />
          <span className="gradient-text-purple">Private Document Intelligence</span>
        </h1>
        <p className="reveal stagger-2 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          RAGVault is packed with capabilities that make document Q&A powerful, private, and production-ready.
        </p>
        <div className="reveal stagger-3 flex flex-wrap justify-center gap-4">
          <Link
            href="#demo"
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-accent transition-all glow-primary"
          >
            Try Demo
            <Icon name="ArrowRightIcon" size={18} />
          </Link>
          <Link
            href="/how-it-works"
            className="flex items-center gap-2 px-8 py-4 border border-border/60 text-foreground font-bold text-sm uppercase tracking-widest rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}