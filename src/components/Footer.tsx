import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <AppLogo size={28} />
            <span className="font-extrabold text-base tracking-tight text-foreground">
              RAG<span className="gradient-text-purple">Vault</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/features" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#demo" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </Link>
            <Link href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
          </nav>

          {/* Social + Copyright */}
          <div className="flex items-center gap-4">
            <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="CodeBracketIcon" size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="GlobeAltIcon" size={20} />
            </a>
            <span className="text-xs text-muted-foreground ml-2">© 2026 RAGVault</span>
          </div>
        </div>
      </div>
    </footer>
  );
}