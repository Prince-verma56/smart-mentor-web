import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { AIMentorShowcase } from "@/components/landing/AIMentorShowcase";
import { RoadmapShowcase } from "@/components/landing/RoadmapShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      
      <main className="flex-1">
        <Hero />
        <Stats />
        <FeatureGrid />
        <HowItWorks />
        <DashboardPreview />
        <AIMentorShowcase />
        <RoadmapShowcase />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}

