import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { InstallSteps } from "@/components/sections/InstallSteps";
import { BrandClarification } from "@/components/sections/BrandClarification";
import { FAQ } from "@/components/sections/FAQ";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <InstallSteps />
        <BrandClarification />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
