import React from "react";
import HeroSection from "@/components/hero";
import FeaturesSection from "@/components/FeaturesSection";
import ProductPreview from "@/components/ProductPreview";
import HowItWorks from "@/components/HowItWorks";
import WhySmartSpend from "@/components/WhySmartSpend";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SmartSpend AI — Understand Your Money. Plan Your Future.",
  description:
    "SmartSpend AI helps you understand your spending habits, plan realistic savings goals, estimate how much you could potentially invest, and explore financial insights in one simple platform.",
  icons: {
    icon: "/logo-sm-white.png",
  },
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Section B: Hero Section */}
      <HeroSection />

      {/* Section C: Core Benefits */}
      <FeaturesSection />

      {/* Section D: Product Preview */}
      <ProductPreview />

      {/* Section E: How It Works */}
      <HowItWorks />

      {/* Section F: Why SmartSpend AI? */}
      <WhySmartSpend />

      {/* Section G: Final Call to Action */}
      <FinalCTA />

      {/* Section H: Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
