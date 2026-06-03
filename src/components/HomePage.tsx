"use client";

import { useCallback, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "@/components/HeroSection";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import SetupSection from "@/components/SetupSection";

export default function HomePage() {
  const [showHero, setShowHero] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => setShowHero(true));
  }, []);

  const handleBackgroundReady = useCallback(() => {
    setNavVisible(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setInteractive(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      {!showHero && <Loader onComplete={handlePreloaderComplete} />}

      {showHero && (
        <>
          <Navbar visible={navVisible} />
          <main className="relative bg-[#010101]">
            <HeroSection
              interactive={interactive}
              onBackgroundReady={handleBackgroundReady}
              onTransitionComplete={handleTransitionComplete}
            />
            <SetupSection />
          </main>
        </>
      )}
    </>
  );
}
