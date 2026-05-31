"use client";

import { useCallback, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "@/components/HeroSection";
import Loader from "@/components/Loader";
import SetupSection from "@/components/SetupSection";

export default function HomePage() {
  const [ready, setReady] = useState(false);

  const handleBootComplete = useCallback(() => {
    window.scrollTo(0, 0);
    setReady(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      {!ready && <Loader onComplete={handleBootComplete} />}

      {ready && (
        <main className="relative bg-[#010101]">
          <HeroSection />
          <SetupSection />
        </main>
      )}
    </>
  );
}
