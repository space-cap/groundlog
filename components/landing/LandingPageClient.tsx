"use client";

import { useState } from "react";
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { ProblemSection } from "./ProblemSection";
import { FeaturesSection } from "./FeaturesSection";
import { ReportShowcaseSection } from "./ReportShowcaseSection";
import { PricingSection } from "./PricingSection";
import { FaqSection } from "./FaqSection";
import { LandingFooter } from "./LandingFooter";
import { FreeTrialModal } from "./FreeTrialModal";

export function LandingPageClient() {
  const [isTrialOpen, setIsTrialOpen] = useState(false);

  const handleOpenTrial = () => {
    setIsTrialOpen(true);
  };

  const handleCloseTrial = () => {
    setIsTrialOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-blue-600 selection:text-white">
      <LandingHeader onOpenTrial={handleOpenTrial} />
      <main>
        <HeroSection onOpenTrial={handleOpenTrial} />
        <ProblemSection />
        <FeaturesSection />
        <ReportShowcaseSection onOpenTrial={handleOpenTrial} />
        <PricingSection onOpenTrial={handleOpenTrial} />
        <FaqSection />
      </main>
      <LandingFooter onOpenTrial={handleOpenTrial} />
      <FreeTrialModal isOpen={isTrialOpen} onClose={handleCloseTrial} />
    </div>
  );
}
