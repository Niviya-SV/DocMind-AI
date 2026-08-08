import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HowItWorksHero from '@/app/how-it-works/components/HowItWorksHero';
import DetailedPipeline from '@/app/how-it-works/components/DetailedPipeline';
import VectorSearchViz from '@/app/how-it-works/components/VectorSearchViz';
import EmbeddingExplainer from '@/app/how-it-works/components/EmbeddingExplainer';
import ArchitectureDiagram from '@/app/how-it-works/components/ArchitectureDiagram';

export default function HowItWorksPage() {
  return (
    <main className="relative overflow-x-hidden bg-background">
      <Header />
      <HowItWorksHero />
      <DetailedPipeline />
      <VectorSearchViz />
      <EmbeddingExplainer />
      <ArchitectureDiagram />
      <Footer />
    </main>
  );
}