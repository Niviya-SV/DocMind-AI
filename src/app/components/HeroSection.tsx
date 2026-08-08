'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: (i * 37 + 11) % 100,
      y: (i * 53 + 7) % 100,
      size: (i % 4) + 1,
      delay: (i * 0.3) % 4,
      duration: 3 + (i % 4),
      color: i % 3 === 0 ? 'bg-accent/60' : i % 3 === 1 ? 'bg-secondary/60' : 'bg-primary/60',
    }))
  );

  const cubeRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotateX(${15 + mouseRef.current.y * 10}deg) rotateY(${mouseRef.current.x * 20}deg)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Scroll reveal
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
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      el.classList.add('hidden-reveal');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const floatingDocs = [
    { top: '10%', left: '75%', rotate: '15deg', delay: '0s', size: 'w-12 h-14' },
    { top: '20%', left: '82%', rotate: '-10deg', delay: '0.5s', size: 'w-10 h-12' },
    { top: '35%', left: '70%', rotate: '25deg', delay: '1s', size: 'w-8 h-10' },
    { top: '15%', left: '60%', rotate: '-20deg', delay: '1.5s', size: 'w-9 h-11' },
    { top: '45%', left: '78%', rotate: '5deg', delay: '2s', size: 'w-11 h-13' },
    { top: '8%', left: '88%', rotate: '-15deg', delay: '0.8s', size: 'w-8 h-10' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg pt-24 pb-16">
      {/* Grid lines */}
      <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />

      {/* Atmospheric blobs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] blob-primary pointer-events-none"
        style={{ animation: 'blob-morph 10s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] blob-secondary pointer-events-none"
        style={{ animation: 'blob-morph 12s ease-in-out infinite 2s' }}
      />
      <div
        className="absolute top-[40%] left-[40%] w-[300px] h-[300px] blob-accent pointer-events-none"
        style={{ animation: 'blob-morph 8s ease-in-out infinite 1s' }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle ${p.color}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size * 3}px`,
            height: `${p.size * 3}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            animation: `particle-drift ${p.duration}s ease-in-out infinite ${p.delay}s`,
          }}
        />
      ))}

      {/* Scan line overlay */}
      <div
        className="absolute left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(168,85,247,0.04), transparent)',
          animation: 'scan-line 8s linear infinite',
        }}
      />

      <div className="relative z-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — Text */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
            <span className="size-2 bg-accent rounded-full animate-pulse-glow" />
            <span className="text-xs font-black uppercase tracking-widest text-accent">
              Fully Local · Zero Cloud AI
            </span>
            <span className="size-2 bg-accent rounded-full animate-pulse-glow" />
          </div>

          {/* Headline */}
          <div className="reveal stagger-1 space-y-2">
            <h1 className="text-hero-xl font-extrabold tracking-tight leading-[1.05] text-foreground">
              A Local PDF
              <br />
              Question-Answering
              <br />
              <span className="gradient-text-purple">System Using RAG</span>
            </h1>
          </div>

          {/* Sub */}
          <p className="reveal stagger-2 text-lg text-muted-foreground max-w-md leading-relaxed">
            Upload. Ask. Understand.
            <br />
            <span className="text-foreground/80 font-medium">Your documents. Your answers. All local. All private.</span>
          </p>

          {/* Stats row */}
          <div className="reveal stagger-3 flex flex-wrap gap-8">
            {[
              { label: 'Chains Supported', value: '35+', color: 'text-accent' },
              { label: 'Local LLMs', value: '12+', color: 'text-secondary' },
              { label: 'Privacy', value: '100%', color: 'text-green-400' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="reveal stagger-4 flex flex-wrap gap-4">
            <Link
              href="#demo"
              className="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-accent transition-all duration-300 glow-primary"
            >
              Enter the Knowledge Vault
              <Icon name="ArrowRightIcon" size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center gap-2 px-8 py-4 border border-border/60 text-foreground font-bold text-sm uppercase tracking-widest rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Right — 3D Holographic Cube */}
        <div className="relative flex items-center justify-center min-h-[500px]">
          {/* Outer glow ring */}
          <div className="absolute w-[420px] h-[420px] rounded-full border border-primary/20 animate-orbit-spin" />
          <div className="absolute w-[340px] h-[340px] rounded-full border border-accent/15 animate-orbit-reverse" />

          {/* Ping rings */}
          <div className="absolute w-[200px] h-[200px] rounded-full border border-primary/30 animate-ping-slow" />
          <div
            className="absolute w-[200px] h-[200px] rounded-full border border-accent/20 animate-ping-slow"
            style={{ animationDelay: '1s' }}
          />

          {/* 3D Cube */}
          <div
            className="relative"
            style={{ perspective: '800px', perspectiveOrigin: '50% 50%' }}
          >
            <div
              ref={cubeRef}
              className="relative w-[200px] h-[200px]"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(15deg) rotateY(0deg)',
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Cube faces */}
              {/* Front */}
              <div
                className="cube-face w-[200px] h-[200px] flex items-center justify-center"
                style={{ transform: 'translateZ(100px)' }}
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-black gradient-text-purple">RAG</div>
                    <div className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">Vault</div>
                  </div>
                </div>
              </div>
              {/* Back */}
              <div
                className="cube-face w-[200px] h-[200px]"
                style={{ transform: 'translateZ(-100px) rotateY(180deg)' }}
              >
                <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/10" />
              </div>
              {/* Left */}
              <div
                className="cube-face w-[200px] h-[200px]"
                style={{ transform: 'rotateY(-90deg) translateZ(100px)' }}
              >
                <div className="w-full h-full bg-gradient-to-b from-primary/10 to-accent/20" />
              </div>
              {/* Right */}
              <div
                className="cube-face w-[200px] h-[200px]"
                style={{ transform: 'rotateY(90deg) translateZ(100px)' }}
              >
                <div className="w-full h-full bg-gradient-to-b from-secondary/10 to-primary/20" />
              </div>
              {/* Top */}
              <div
                className="cube-face w-[200px] h-[200px]"
                style={{ transform: 'rotateX(90deg) translateZ(100px)' }}
              >
                <div className="w-full h-full bg-gradient-to-br from-accent/30 to-primary/10" />
              </div>
              {/* Bottom */}
              <div
                className="cube-face w-[200px] h-[200px]"
                style={{ transform: 'rotateX(-90deg) translateZ(100px)' }}
              >
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/20" />
              </div>
            </div>
          </div>

          {/* Floating document fragments */}
          {floatingDocs.map((doc, i) => (
            <div
              key={i}
              className={`absolute ${doc.size} glass-card rounded-lg flex flex-col gap-1 p-2 pointer-events-none`}
              style={{
                top: doc.top,
                left: doc.left,
                transform: `rotate(${doc.rotate})`,
                animation: `float-slow ${4 + i * 0.5}s ease-in-out infinite ${doc.delay}`,
                boxShadow: '0 0 20px rgba(124,58,237,0.3)',
              }}
            >
              <div className="w-full h-1 bg-primary/40 rounded" />
              <div className="w-3/4 h-1 bg-muted-foreground/30 rounded" />
              <div className="w-full h-1 bg-muted-foreground/20 rounded" />
              <div className="w-2/3 h-1 bg-muted-foreground/20 rounded" />
              <div className="mt-auto flex items-center gap-1">
                <div className="size-3 bg-accent/50 rounded-sm" />
                <span className="text-[6px] text-muted-foreground font-bold">PDF</span>
              </div>
            </div>
          ))}

          {/* Corner markers on cube area */}
          <div className="absolute top-8 left-8 size-6 border-t-2 border-l-2 border-primary/50 rounded-tl-md" />
          <div className="absolute top-8 right-8 size-6 border-t-2 border-r-2 border-primary/50 rounded-tr-md" />
          <div className="absolute bottom-8 left-8 size-6 border-b-2 border-l-2 border-primary/50 rounded-bl-md" />
          <div className="absolute bottom-8 right-8 size-6 border-b-2 border-r-2 border-primary/50 rounded-br-md" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float-fast">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Scroll</span>
        <Icon name="ChevronDownIcon" size={20} className="text-muted-foreground/60" />
      </div>
    </section>
  );
}