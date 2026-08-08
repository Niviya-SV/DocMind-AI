// import Header from "../components/Header";
// import Footer from "../components/Footer";

// import HeroSection from "./components/HeroSection";
// import PipelineSection from "./components/PipelineSection";
// import FeaturesGridSection from "./components/FeaturesGridSection";
// import DemoPreviewSection from "./components/DemoPreviewSection";
// import ClosingSection from "./components/ClosingSection";

// export default function HomePage() {
//   return (
//     <main className="relative overflow-x-hidden bg-background">
//       <Header />
//       <HeroSection />
//       <PipelineSection />
//       <FeaturesGridSection />
//       <DemoPreviewSection />
//       <ClosingSection />
//       <Footer />
//     </main>
//   );
// }

import Header from "../components/Header";
import Footer from "../components/Footer";

import HeroSection from "./components/HeroSection";
import PipelineSection from "./components/PipelineSection";
import FeaturesGridSection from "./components/FeaturesGridSection";
import DemoPreviewSection from "./components/DemoPreviewSection";
import ClosingSection from "./components/ClosingSection";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <PipelineSection />
      <FeaturesGridSection />
      <DemoPreviewSection />
      <ClosingSection />
      <Footer />
    </>
  );
}