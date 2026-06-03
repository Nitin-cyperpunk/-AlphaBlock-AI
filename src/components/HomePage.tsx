"use client";

import { useCallback, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "@/components/HeroSection";
import Loader from "@/components/Loader";
import SetupSection from "@/components/SetupSection";

export default function HomePage() {
  const [showHero, setShowHero] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => setShowHero(true));
  }, []);

  const handleChromeReady = useCallback(() => {
    setChromeVisible(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setInteractive(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      {!showHero && <Loader onComplete={handlePreloaderComplete} />}

      {showHero && (
        <main className="relative bg-[#010101]">
          <HeroSection
            interactive={interactive}
            chromeVisible={chromeVisible}
            onChromeReady={handleChromeReady}
            onTransitionComplete={handleTransitionComplete}
          />
          <SetupSection />
        </main>
      )}
    </>
  );
}
