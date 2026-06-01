"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { HeroBackground } from "@/components/HeroBackground";

type HeroSectionProps = {
  interactive?: boolean;
  onRevealStart?: () => void;
  onTransitionComplete?: () => void;
};

export default function HeroSection({
  interactive = false,
  onRevealStart,
  onTransitionComplete,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaPrimaryRef = useRef<HTMLAnchorElement>(null);
  const ctaSecondaryRef = useRef<HTMLAnchorElement>(null);
  const contentLayerRef = useRef<HTMLDivElement>(null);
  const contentRevealedRef = useRef(false);

  useLayoutEffect(() => {
    const eyebrow = eyebrowRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const line3 = line3Ref.current;
    const sub = subRef.current;
    const ctaPrimary = ctaPrimaryRef.current;
    const ctaSecondary = ctaSecondaryRef.current;
    if (!eyebrow || !line1 || !line2 || !line3 || !sub || !ctaPrimary || !ctaSecondary) {
      return;
    }

    gsap.set(eyebrow, { opacity: 0, y: 18 });
    gsap.set([line1, line2, line3], { opacity: 0, y: 40, filter: "blur(12px)" });
    gsap.set(sub, { opacity: 0, y: 16 });
    gsap.set([ctaPrimary, ctaSecondary], { opacity: 0, scale: 0.94 });
  }, []);

  const revealContent = useCallback(() => {
    if (contentRevealedRef.current) return;
    contentRevealedRef.current = true;
    onRevealStart?.();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const eyebrow = eyebrowRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const line3 = line3Ref.current;
    const sub = subRef.current;
    const ctaPrimary = ctaPrimaryRef.current;
    const ctaSecondary = ctaSecondaryRef.current;

    if (!eyebrow || !line1 || !line2 || !line3 || !sub || !ctaPrimary || !ctaSecondary) {
      onTransitionComplete?.();
      return;
    }

    if (reduce) {
      contentLayerRef.current?.classList.add("hero-content-layer--visible");
      gsap.set([eyebrow, line1, line2, line3, sub, ctaPrimary, ctaSecondary], {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      });
      onTransitionComplete?.();
      return;
    }

    contentLayerRef.current?.classList.add("hero-content-layer--visible");

    gsap.set(eyebrow, { opacity: 0, y: 18 });
    gsap.set([line1, line2, line3], { opacity: 0, y: 40, filter: "blur(12px)" });
    gsap.set(sub, { opacity: 0, y: 16 });
    gsap.set([ctaPrimary, ctaSecondary], { opacity: 0, scale: 0.94 });

    const tl = gsap.timeline({
      onComplete: () => onTransitionComplete?.(),
    });

    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" })
      .to(
        line1,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        "+=0.04",
      )
      .to(
        line2,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        "+=0.08",
      )
      .to(
        line3,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        "+=0.08",
      )
      .to(sub, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.35")
      .to(ctaPrimary, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }, "-=0.2")
      .to(ctaSecondary, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }, ">-0.1");
  }, [onRevealStart, onTransitionComplete]);

  useEffect(() => {
    contentRevealedRef.current = false;
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative min-h-screen scroll-mt-28 overflow-hidden bg-background border-b border-border"
    >
      <div id="hero" className="pointer-events-none absolute top-0 h-0 w-0" aria-hidden />
      <HeroBackground
        interactive={interactive}
        onEnvironmentReady={revealContent}
      />

      <div ref={contentLayerRef} className="hero-content-layer relative z-10">
        <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 pt-24 text-center sm:pt-28">
          <p
            ref={eyebrowRef}
            className="font-mono text-[0.9rem] uppercase tracking-[0.35em] text-muted-foreground"
          >
            Built for the next generation of traders
          </p>

          <h1 className="mt-7 text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="hero-headline-line block overflow-hidden">
              <span ref={line1Ref} className="hero-headline-inner block">
                The{" "}
                <span className="font-serif italic font-normal">personalised</span>{" "}
                intelligence and
              </span>
            </span>
            <span className="hero-headline-line block overflow-hidden">
              <span ref={line2Ref} className="hero-headline-inner block">
                <span className="font-serif italic font-normal">execution</span> layer
                for
              </span>
            </span>
            <span className="hero-headline-line block overflow-hidden">
              <span ref={line3Ref} className="hero-headline-inner block">
                <span className="font-serif italic font-normal">onchain</span> trading.
              </span>
            </span>
          </h1>

          <p
            ref={subRef}
            className="mt-7 max-w-md text-base text-muted-foreground"
          >
            Understand the market before the market moves.
          </p>

          <div id="launch" className="mt-10 flex scroll-mt-32 flex-col items-center gap-4 sm:flex-row">
            <a
              ref={ctaPrimaryRef}
              href="#launch"
              className="group flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Launch Dashboard
              <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
            <a
              ref={ctaSecondaryRef}
              href="#telegram"
              className="group flex items-center gap-2 rounded-md border border-border bg-transparent px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-darkgray"
            >
              Launch Telegram
              <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
