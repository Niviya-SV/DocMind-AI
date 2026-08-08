// 'use client';
// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import AppLogo from './ui/AppLogo';
// import Icon from './ui/AppIcon';

// const navLinks = [
//   { label: 'Home', href: '/' },
//   { label: 'Features', href: '/features' },
//   { label: 'How It Works', href: '/how-it-works' },
//   { label: 'Sandbox', href: '/sandbox' },
//   { label: 'Demo', href: '#demo' },
//   { label: 'About', href: '#about' },
// ];

// export default function Header() {
//   const [scrolled, setScrolled] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 30);
//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     if (menuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => { document.body.style.overflow = ''; };
//   }, [menuOpen]);

//   return (
//     <>
//       <header
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
//           scrolled
//             ? 'bg-background/85 backdrop-blur-xl border-b border-border/50 py-3' :'bg-transparent py-5'
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2.5 group">
//             <AppLogo size={36} className="transition-transform duration-300 group-hover:scale-110" />
//             <span className="font-extrabold text-lg tracking-tight text-foreground">
//               RAG<span className="gradient-text-purple">Vault</span>
//             </span>
//           </Link>

//           {/* Desktop Nav */}
//           <nav className="hidden lg:flex items-center gap-1 px-5 py-2 rounded-full border border-border/60 bg-card/50 backdrop-blur-md">
//             {navLinks?.map((link) => (
//               <Link
//                 key={link?.label}
//                 href={link?.href}
//                 className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full transition-all duration-200"
//               >
//                 {link?.label}
//               </Link>
//             ))}
//           </nav>

//           {/* CTA */}
//           <div className="hidden lg:flex items-center gap-4">
//             <div className="flex items-center gap-1.5">
//               <span className="size-1.5 bg-green-400 rounded-full animate-pulse"></span>
//               <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Local &amp; Private</span>
//             </div>
//             <Link
//               href="/sandbox"
//               className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-full hover:bg-accent transition-all duration-300 glow-primary"
//             >
//               Try Sandbox
//             </Link>
//           </div>

//           {/* Mobile hamburger */}
//           <button
//             className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
//             onClick={() => setMenuOpen(!menuOpen)}
//             aria-label="Toggle menu"
//           >
//             <Icon name={menuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
//           </button>
//         </div>
//       </header>
//       {/* Mobile Menu Overlay */}
//       {menuOpen && (
//         <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center gap-8">
//           {navLinks?.map((link) => (
//             <Link
//               key={link?.label}
//               href={link?.href}
//               onClick={() => setMenuOpen(false)}
//               className="text-2xl font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:text-glow-primary transition-all duration-200"
//             >
//               {link?.label}
//             </Link>
//           ))}
//           <Link
//             href="/sandbox"
//             onClick={() => setMenuOpen(false)}
//             className="mt-4 px-10 py-4 bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest rounded-full glow-primary"
//           >
//             Try Sandbox
//           </Link>
//         </div>
//       )}
//     </>
//   );
// }

'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLogo from "./ui/AppLogo";
import Icon from "./ui/AppIcon";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Sandbox", href: "/sandbox" },
  { label: "Demo", href: "#demo" },
  { label: "About", href: "#about" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border/50 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <AppLogo />
            <span className="text-xl font-bold text-foreground">
              RAGVault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 px-5 py-2 rounded-full border border-border/60 bg-card/50 backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>

              <span className="text-xs font-bold uppercase tracking-widest text-green-400">
                Local &amp; Private
              </span>
            </div>

            <Link
              href="/sandbox"
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-accent transition-all duration-300"
            >
              Try Sandbox
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Icon
              name={menuOpen ? "XMarkIcon" : "Bars3Icon"}
              size={24}
            />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden flex flex-col items-center justify-center gap-8">

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/sandbox"
            onClick={() => setMenuOpen(false)}
            className="mt-4 px-10 py-4 rounded-full bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest"
          >
            Try Sandbox
          </Link>
        </div>
      )}
    </>
  );
}