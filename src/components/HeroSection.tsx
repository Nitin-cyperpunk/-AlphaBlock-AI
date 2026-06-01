"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { HeroBackground } from "@/components/HeroBackground";

const NAV = ["Product", "Features", "How it works", "Pricing"];

type HeroSectionProps = {
  interactive?: boolean;
  onTransitionComplete?: () => void;
};

export default function HeroSection({
  interactive = false,
  onTransitionComplete,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaPrimaryRef = useRef<HTMLAnchorElement>(null);
  const ctaSecondaryRef = useRef<HTMLAnchorElement>(null);
  const contentRevealedRef = useRef(false);

  const revealContent = () => {
    if (contentRevealedRef.current) return;
    contentRevealedRef.current = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = headerRef.current;
    const eyebrow = eyebrowRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const line3 = line3Ref.current;
    const sub = subRef.current;
    const ctaPrimary = ctaPrimaryRef.current;
    const ctaSecondary = ctaSecondaryRef.current;

    if (!header || !eyebrow || !line1 || !line2 || !line3 || !sub || !ctaPrimary || !ctaSecondary) {
      onTransitionComplete?.();
      return;
    }

    if (reduce) {
      gsap.set([header, eyebrow, line1, line2, line3, sub, ctaPrimary, ctaSecondary], {
        opacity: 1,
        y: 0,
        scale: 1,
      });
      onTransitionComplete?.();
      return;
    }

    const lines = [line1, line2, line3];

    gsap.set(header, { opacity: 0, y: -22 });
    gsap.set(eyebrow, { opacity: 0, y: 18 });
    gsap.set(lines, { opacity: 1, y: "110%" });
    gsap.set(sub, { opacity: 0, y: 16 });
    gsap.set([ctaPrimary, ctaSecondary], { opacity: 0, scale: 0.94 });

    const tl = gsap.timeline({ onComplete: () => onTransitionComplete?.() });

    tl.to(header, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" })
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.25")
      .to(lines, { y: "0%", duration: 0.72, ease: "power3.out", stagger: 0.14 }, "-=0.15")
      .to(sub, { opacity: 1, y: 0, duration: 0.48, ease: "power3.out" }, "-=0.2")
      .to(
        ctaPrimary,
        { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" },
        "-=0.15",
      )
      .to(
        ctaSecondary,
        { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" },
        "-=0.28",
      );
  };

  useEffect(() => {
    return () => {
      contentRevealedRef.current = false;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen overflow-hidden bg-background border-b border-border"
    >
      <HeroBackground
        interactive={interactive}
        onEnvironmentReady={revealContent}
      />

      <header
        ref={headerRef}
        className="hero-content relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 opacity-0"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium tracking-[0.22em] text-foreground">
            ALPHABLOCK <span className="text-brand">AI</span>
          </span>
        </div>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <a
              key={item}
              href="#"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </nav>

        <a
          href="#launch"
          className="group flex items-center gap-2 rounded-md border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-darkgray"
        >
          Launch Dashboard
          <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      </header>

      <div className="hero-content relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p
          ref={eyebrowRef}
          className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-muted-foreground opacity-0"
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
          className="mt-7 max-w-md text-base text-muted-foreground opacity-0"
        >
          Understand the market before the market moves.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            ref={ctaPrimaryRef}
            href="#launch"
            className="group flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-primary-foreground opacity-0 transition-transform hover:-translate-y-0.5"
          >
            Launch Dashboard
            <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
          <a
            ref={ctaSecondaryRef}
            href="#telegram"
            className="group flex items-center gap-2 rounded-md border border-border bg-transparent px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-foreground opacity-0 transition-colors hover:bg-darkgray"
          >
            Launch Telegram
            <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
