// import React from 'react';
// import type { Metadata, Viewport } from 'next';
// import { Plus_Jakarta_Sans } from 'next/font/google';
// import '../styles/tailwind.css';

// const plusJakartaSans = Plus_Jakarta_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700', '800'],
//   variable: '--font-sans',
//   display: 'swap',
// });

// export const viewport: Viewport = {
//   width: 'device-width',
//   initialScale: 1,
// };

// export const metadata: Metadata = {
//   metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
//   title: 'RAGVault — Local AI PDF Question-Answering System',
//   description: 'RAGVault lets you upload PDFs and ask natural language questions answered by a local LLM using RAG — fully private, zero cloud AI, MERN Stack.',
//   icons: {
//     icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
//   },
//   openGraph: {
//     title: 'RAGVault — Local AI PDF Q&A',
//     description: 'Your documents answer your questions. Fully local, fully private.',
//     images: [{ url: '/assets/images/app_logo.png', width: 1200, height: 630 }],
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className={plusJakartaSans.variable}>
//       <body className={plusJakartaSans.className}>
//         {children}

//         <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fragvault9143back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.20" />
//         <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/tailwind.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RAGVault",
  description: "RAGVault Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.variable}>
        {children}
      </body>
    </html>
  );
}