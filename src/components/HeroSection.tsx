"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroGlassCTA } from "@/components/HeroGlassCTA";
import HeroCursor from "./HeroCursor";

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
  const contentColumnRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaPrimaryRef = useRef<HTMLAnchorElement>(null);
  const ctaSecondaryRef = useRef<HTMLAnchorElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<HTMLDivElement>(null);
  const contentRevealedRef = useRef(false);

  const headlineLines = () =>
    [line1Ref.current, line2Ref.current, line3Ref.current].filter(Boolean) as HTMLSpanElement[];

  useLayoutEffect(() => {
    const column = contentColumnRef.current;
    const eyebrow = eyebrowRef.current;
    const lines = headlineLines();
    const sub = subRef.current;
    const ctaPrimary = ctaPrimaryRef.current;
    const ctaSecondary = ctaSecondaryRef.current;
    const scrollHint = scrollHintRef.current;

    if (!column || !eyebrow || lines.length !== 3 || !sub || !ctaPrimary || !ctaSecondary) {
      return;
    }

    gsap.set(column, { opacity: 0 });
    gsap.set(eyebrow, { opacity: 0, y: 10 });
    gsap.set(lines, { yPercent: 108, opacity: 1 });
    gsap.set(sub, { opacity: 0, y: 10 });
    gsap.set([ctaPrimary, ctaSecondary], { opacity: 0, y: 20 });
    if (scrollHint) gsap.set(scrollHint, { opacity: 0, y: 6 });
  }, []);

  const revealContent = useCallback(() => {
    if (contentRevealedRef.current) return;
    contentRevealedRef.current = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const column = contentColumnRef.current;
    const eyebrow = eyebrowRef.current;
    const [line1, line2, line3] = [
      line1Ref.current,
      line2Ref.current,
      line3Ref.current,
    ];
    const sub = subRef.current;
    const ctaPrimary = ctaPrimaryRef.current;
    const ctaSecondary = ctaSecondaryRef.current;
    const scrollHint = scrollHintRef.current;

    if (!column || !eyebrow || !line1 || !line2 || !line3 || !sub || !ctaPrimary || !ctaSecondary) {
      onRevealStart?.();
      onTransitionComplete?.();
      return;
    }

    contentLayerRef.current?.classList.add("hero-content-layer--visible");

    if (reduce) {
      onRevealStart?.();
      gsap.set([column, eyebrow, line1, line2, line3, sub, ctaPrimary, ctaSecondary, scrollHint], {
        opacity: 1,
        y: 0,
        yPercent: 0,
        scale: 1,
        clearProps: "transform",
      });
      gsap.set(eyebrow, { opacity: 0.7 });
      gsap.set(sub, { opacity: 0.75 });
      onTransitionComplete?.();
      return;
    }

    gsap.set(column, { opacity: 0 });
    gsap.set(eyebrow, { opacity: 0, y: 10 });
    gsap.set([line1, line2, line3], { yPercent: 108, opacity: 1 });
    gsap.set(sub, { opacity: 0, y: 10 });
    gsap.set([ctaPrimary, ctaSecondary], { opacity: 0, y: 20 });
    if (scrollHint) gsap.set(scrollHint, { opacity: 0, y: 6 });

    const BEAT = 0.4;

    const tl = gsap.timeline({
      onComplete: () => onTransitionComplete?.(),
      defaults: { ease: "power3.out", force3D: true },
    });

    tl.to(column, { opacity: 1, duration: 0.5, ease: "power2.out" })
      .call(() => onRevealStart?.(), undefined, 0)
      .to(eyebrow, { opacity: 0.7, y: 0, duration: 0.75 }, "-=0.15")
      .to(line1, { yPercent: 0, duration: 0.8 }, `+=${BEAT}`)
      .to(line2, { yPercent: 0, duration: 0.8 }, `+=${BEAT}`)
      .to(line3, { yPercent: 0, duration: 0.8 }, `+=${BEAT}`)
      .to(sub, { opacity: 0.75, y: 0, duration: 0.75 }, `+=${BEAT}`)
      .to(
        [ctaPrimary, ctaSecondary],
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power4.out" },
        `+=${BEAT}`,
      );

    if (scrollHint) {
      tl.to(scrollHint, { opacity: 0.5, y: 0, duration: 0.6, ease: "power3.out" }, `+=${BEAT}`);
    }
  }, [onRevealStart, onTransitionComplete]);

  useEffect(() => {
    contentRevealedRef.current = false;
  }, []);

  return (
    <section
      id="how-it-works"
      className={`hero-section relative h-screen scroll-mt-28 overflow-hidden border-b border-[#141414] bg-[#010101]${
        interactive ? " hero-section--interactive" : ""
      }`}
    >
      <div id="hero" className="pointer-events-none absolute top-0 h-0 w-0" aria-hidden />

      <HeroBackground interactive={interactive} onEnvironmentReady={revealContent} />
      <HeroCursor active={interactive} />

      <div ref={contentLayerRef} className="hero-content-layer relative z-10 h-full">
        <div
          ref={contentColumnRef}
          className="relative mx-auto flex h-full max-w-[1100px] flex-col items-center justify-center px-6 pt-20 pb-24 text-center"
        >
          <p
            ref={eyebrowRef}
            className="font-mono text-[0.7rem] uppercase tracking-[0.45em] text-white sm:text-xs"
          >
            BUILT FOR THE NEXT GENERATION OF TRADERS
          </p>

          <h1 className="mt-8 text-[clamp(2rem,5.2vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.02em] text-white">
            <span className="hero-headline-line block overflow-hidden">
              <span ref={line1Ref} className="hero-headline-inner block will-change-transform">
                The <span className="font-display italic">personalised</span> intelligence
              </span>
            </span>
            <span className="hero-headline-line block overflow-hidden">
              <span ref={line2Ref} className="hero-headline-inner block will-change-transform">
                layer for
              </span>
            </span>
            <span className="hero-headline-line block overflow-hidden">
              <span ref={line3Ref} className="hero-headline-inner block will-change-transform">
                <span className="font-display italic">onchain</span> trading.
              </span>
            </span>
          </h1>

          <p ref={subRef} className="mt-8 max-w-lg text-base text-white/75 sm:text-lg">
            Understand the market before the market moves.
          </p>

          <div
            id="launch"
            className="mt-10 flex w-full max-w-md scroll-mt-32 flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4"
          >
            <HeroGlassCTA ref={ctaPrimaryRef} href="#launch" variant="primary">
              Launch Dashboard
            </HeroGlassCTA>
            <HeroGlassCTA ref={ctaSecondaryRef} href="#telegram" variant="secondary">
              Launch Telegram
            </HeroGlassCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
