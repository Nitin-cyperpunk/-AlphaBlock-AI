"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroChrome } from "@/components/HeroChrome";
import { HeroGlassCTA } from "@/components/HeroGlassCTA";
import { APP_URL, EXTERNAL_LINK_PROPS } from "@/lib/urls";
import HeroCursor from "./HeroCursor";

gsap.registerPlugin(useGSAP);

type HeroSectionProps = {
  interactive?: boolean;
  chromeVisible?: boolean;
  contentReveal?: boolean;
  bootComplete?: boolean;
  heroEnvRef?: React.RefObject<number>;
  heroShellRef?: React.RefObject<HTMLDivElement | null>;
  onTransitionComplete?: () => void;
};

export default function HeroSection({
  interactive = false,
  chromeVisible = false,
  contentReveal = false,
  bootComplete = false,
  heroEnvRef,
  heroShellRef,
  onTransitionComplete,
}: HeroSectionProps) {
  const contentColumnRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaPrimaryRef = useRef<HTMLAnchorElement>(null);
  const ctaSecondaryRef = useRef<HTMLAnchorElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<HTMLDivElement>(null);
  const contentRevealedRef = useRef(false);
  const revealContentRef = useRef<() => void>(() => {});
  const shellInitRef = useRef(false);

  useLayoutEffect(() => {
    if (bootComplete || shellInitRef.current) return;
    const shell = heroShellRef?.current;
    if (!shell) return;
    shellInitRef.current = true;
    gsap.set(shell, { opacity: 0, y: 40, force3D: true });
  }, [bootComplete, heroShellRef]);

  const headlineLines = () =>
    [line1Ref.current, line2Ref.current].filter(Boolean) as HTMLSpanElement[];

  useGSAP(
    (_, contextSafe) => {
      const column = contentColumnRef.current;
      const eyebrow = eyebrowRef.current;
      const lines = headlineLines();
      const sub = subRef.current;
      const ctaPrimary = ctaPrimaryRef.current;
      const ctaSecondary = ctaSecondaryRef.current;
      const scrollHint = scrollHintRef.current;

      if (!column || !eyebrow || lines.length !== 2 || !sub || !ctaPrimary || !ctaSecondary) {
        return;
      }

      gsap.set(column, { opacity: 0 });
      gsap.set(eyebrow, { opacity: 0, y: 10 });
      gsap.set(lines, { yPercent: 108, opacity: 1 });
      gsap.set(sub, { opacity: 0, y: 10 });
      gsap.set([ctaPrimary, ctaSecondary], { opacity: 0, y: 16 });
      if (scrollHint) gsap.set(scrollHint, { opacity: 0, y: 6 });

      if (!contextSafe) return;

      revealContentRef.current = contextSafe(() => {
        if (contentRevealedRef.current) return;
        contentRevealedRef.current = true;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const [line1, line2] = [line1Ref.current, line2Ref.current];

        if (!column || !eyebrow || !line1 || !line2 || !sub || !ctaPrimary || !ctaSecondary) {
          onTransitionComplete?.();
          return;
        }

        contentLayerRef.current?.classList.add("hero-content-layer--visible");
        lines.forEach((line) => line.classList.add("hero-headline-inner--animating"));

        if (reduce) {
          gsap.set(
            [column, eyebrow, line1, line2, sub, ctaPrimary, ctaSecondary, scrollHint],
            {
              opacity: 1,
              y: 0,
              yPercent: 0,
              scale: 1,
              clearProps: "transform",
            },
          );
          gsap.set(eyebrow, { opacity: 0.7 });
          gsap.set(sub, { opacity: 0.75 });
          lines.forEach((line) => line.classList.remove("hero-headline-inner--animating"));
          onTransitionComplete?.();
          return;
        }

        gsap.set(column, { opacity: 1 });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set([eyebrow, line1, line2, sub, ctaPrimary, ctaSecondary, scrollHint], {
              clearProps: "transform",
            });
            lines.forEach((line) => line.classList.remove("hero-headline-inner--animating"));
            onTransitionComplete?.();
          },
          defaults: { ease: "power2.out", force3D: true },
        });

        tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 0.7, y: 0, duration: 0.55 })
          .fromTo(
            lines,
            { yPercent: 102 },
            { yPercent: 0, duration: 0.62, stagger: 0.07, ease: "power2.out" },
            "-=0.32",
          )
          .fromTo(sub, { opacity: 0, y: 10 }, { opacity: 0.75, y: 0, duration: 0.45 }, "-=0.34")
          .fromTo(
            [ctaPrimary, ctaSecondary],
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.42, stagger: 0.07 },
            "-=0.28",
          );

        if (scrollHint) {
          tl.fromTo(
            scrollHint,
            { opacity: 0, y: 6 },
            { opacity: 0.5, y: 0, duration: 0.32 },
            "-=0.18",
          );
        }
      });
    },
    {
      scope: contentLayerRef,
      dependencies: [onTransitionComplete],
    },
  );

  useEffect(() => {
    if (!contentReveal) return;
    revealContentRef.current();
  }, [contentReveal]);

  return (
    <section
      id="how-it-works"
      className={`hero-section relative h-screen scroll-mt-28 overflow-hidden bg-[#010101]${
        interactive ? " hero-section--interactive" : ""
      }`}
    >
      <div id="hero" className="pointer-events-none absolute top-0 h-0 w-0" aria-hidden />

      <div
        ref={heroShellRef}
        className={`absolute inset-0 overflow-hidden${bootComplete ? " hero-shell--revealed" : ""}`}
      >
        <HeroBackground interactive={interactive} heroEnvRef={heroEnvRef} bootComplete={bootComplete} />
        <HeroCursor active={interactive} />
        <HeroChrome visible={chromeVisible} />
        <div className="hero-section__seam" aria-hidden />

        <div
          ref={contentLayerRef}
          className="hero-content-layer relative z-10 h-full pointer-events-none"
        >
          <div
            ref={contentColumnRef}
            className="relative mx-auto flex h-full max-w-[1100px] flex-col items-center justify-center px-4 pt-[4.5rem] pb-14 text-center sm:px-6 sm:pt-20 sm:pb-24"
          >
            <p ref={eyebrowRef} className="brand-eyebrow max-w-[92vw] sm:max-w-none">
              BUILT FOR THE NEXT GENERATION OF TRADERS
            </p>

            <div className="hero-headline-wrap relative mt-3 sm:mt-4">
              <div className="hero-headline-bloom pointer-events-none" aria-hidden />
              <h1 className="brand-headline relative sm:leading-[1.08]">
                <span className="hero-headline-line block overflow-hidden">
                  <span ref={line1Ref} className="hero-headline-inner block">
                    The <span className="font-display italic">personalised</span> intelligence
                  </span>
                </span>
                <span className="hero-headline-line block overflow-hidden">
                  <span ref={line2Ref} className="hero-headline-inner block">
                    layer for <span className="font-display italic">onchain</span> trading.
                  </span>
                </span>
              </h1>
            </div>

            <p ref={subRef} className="brand-body mt-4 max-w-[17rem] sm:mt-8 sm:max-w-lg">
              Understand the market before the market moves.
            </p>

            <div
              id="launch"
              className="hero-cta-row pointer-events-auto mt-6 w-full max-w-[min(100%,22rem)] scroll-mt-32 sm:mt-10 sm:max-w-none"
            >
              <HeroGlassCTA
                ref={ctaPrimaryRef}
                href={APP_URL}
                variant="primary"
                pair
                {...EXTERNAL_LINK_PROPS}
              >
                Launch Dashboard
              </HeroGlassCTA>
              <HeroGlassCTA
                ref={ctaSecondaryRef}
                href={APP_URL}
                variant="secondary"
                pair
                {...EXTERNAL_LINK_PROPS}
              >
                Launch Telegram
              </HeroGlassCTA>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
