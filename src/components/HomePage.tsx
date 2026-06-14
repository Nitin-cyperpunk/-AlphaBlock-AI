"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Loader from "@/components/Loader";
import HeroSection from "@/components/HeroSection";
import SetupSection from "@/components/SetupSection";
import FooterSection from "@/components/FooterSection";
import { useLenis } from "@/context/LenisContext";

const HERO_TRANSITION_S = 1.8;

export default function HomePage() {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const [bootComplete, setBootComplete] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [contentReveal, setContentReveal] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const heroEnvRef = useRef(0);
  const heroShellRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const heroRevealedRef = useRef(false);
  const transitionTweenRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    lenisRef.current?.stop();
    document.body.style.overflow = "hidden";
  }, [lenis]);

  const handleLoaderReady = useCallback(() => {
    if (heroRevealedRef.current || transitionTweenRef.current) return;

    const loaderEl = loaderRef.current;
    const heroShell = heroShellRef.current;
    const terminalEl = loaderEl?.querySelector<HTMLElement>(".loader-terminal");

    setChromeVisible(true);
    setContentReveal(true);

    const env = { v: heroEnvRef.current };

    const finish = () => {
      heroRevealedRef.current = true;
      heroEnvRef.current = 1;
      if (heroShell) {
        gsap.set(heroShell, { opacity: 1, y: 0, clearProps: "transform" });
      }
      window.scrollTo(0, 0);
      document.body.style.overflow = "";
      lenisRef.current?.start();
      requestAnimationFrame(() => ScrollTrigger.refresh());
      setLoaderVisible(false);
      setBootComplete(true);
      transitionTweenRef.current = null;
    };

    if (!loaderEl || !heroShell) {
      finish();
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    transitionTweenRef.current = tl;
    const ease = "power2.inOut";

    if (terminalEl) {
      gsap.set(terminalEl, {
        filter: "blur(0px)",
        scale: 1,
        transformOrigin: "0% 0%",
        force3D: true,
      });
      tl.to(
        terminalEl,
        {
          opacity: 0,
          filter: "blur(8px)",
          scale: 1.02,
          duration: HERO_TRANSITION_S,
          ease,
        },
        0,
      );
    }

    tl.to(loaderEl, { opacity: 0, duration: HERO_TRANSITION_S, ease }, 0);

    tl.to(
      heroShell,
      { opacity: 1, y: 0, duration: HERO_TRANSITION_S, ease },
      0,
    );

    tl.to(
      env,
      {
        v: 1,
        duration: HERO_TRANSITION_S,
        ease,
        onUpdate: () => {
          heroEnvRef.current = env.v;
        },
      },
      0,
    );
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setInteractive(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      <main className="relative max-w-full overflow-x-clip bg-white">
        <HeroSection
          interactive={interactive}
          chromeVisible={chromeVisible}
          contentReveal={contentReveal}
          heroEnvRef={heroEnvRef}
          heroShellRef={heroShellRef}
          bootComplete={bootComplete}
          onTransitionComplete={handleTransitionComplete}
        />
        <SetupSection />
        <FooterSection />
      </main>

      {loaderVisible && <Loader ref={loaderRef} onReady={handleLoaderReady} />}
    </>
  );
}
