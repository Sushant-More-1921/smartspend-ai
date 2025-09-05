import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";
import HowItWorks from "@/components/HowItWorks";
import AnimatedStats from "@/components/AnimatedStats";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white ">
      <HeroSection />
      <section className="relative py-10 text-white text-center 
      bg-gradient-to-b from-black via-[#0f0a1f] to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25)_0%,transparent_70%)]"></div>
        {/* Hero Section */}

        {/* Features Section */}
        <FeaturesSection />

        {/* Stats Section */}
        <AnimatedStats />

        {/* How It Works Section */}
        <HowItWorks />

      </section>
      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default LandingPage;
