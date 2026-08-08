import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturesHero from '@/app/features/components/FeaturesHero';
import BentoFeaturesGrid from '@/app/features/components/BentoFeaturesGrid';
import PrivacySection from '@/app/features/components/PrivacySection';
import UseCasesSection from '@/app/features/components/UseCasesSection';
import ComparisonSection from '@/app/features/components/ComparisonSection';

export default function FeaturesPage() {
  return (
    <main className="relative overflow-x-hidden bg-background">
      <Header />
      <FeaturesHero />
      <BentoFeaturesGrid />
      <PrivacySection />
      <UseCasesSection />
      <ComparisonSection />
      <Footer />
    </main>
  );
}