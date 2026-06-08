"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/context/LenisContext";

gsap.registerPlugin(ScrollTrigger);
import { assets } from "@/lib/assets";
import {
  buildAsciiField,
  getHeroCanvasDpr,
  renderAsciiCanvases,
  stepAsciiField,
  type AsciiFieldState,
} from "@/lib/ascii-intelligence-field";
import { getHeroPerfConfig, type HeroPerfConfig } from "@/lib/hero-performance";

type HeroBackgroundProps = {
  interactive?: boolean;
  heroEnvRef?: React.RefObject<number>;
  bootComplete?: boolean;
};

const BLUR_SCALE = 0.5;

export function HeroBackground({
  interactive = false,
  heroEnvRef,
  bootComplete = false,
}: HeroBackgroundProps) {
  const heroRootRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const glowShellRef = useRef<HTMLDivElement>(null);
  const glowStackRef = useRef<HTMLDivElement>(null);
  const asciiSharpRef = useRef<HTMLCanvasElement>(null);
  const asciiBlurRef = useRef<HTMLCanvasElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  const interactiveRef = useRef(interactive);
  const environmentReadyRef = useRef(true);
  const scrollProgressRef = useRef(0);
  const scrollSmoothRef = useRef({ progress: 0 });
  const lenis = useLenis();

  useEffect(() => {
    interactiveRef.current = interactive;
    environmentReadyRef.current = bootComplete || interactive;
  }, [interactive, bootComplete]);

  useEffect(() => {
    const smooth = scrollSmoothRef.current;
    const scrollTo = gsap.quickTo(smooth, "progress", {
      duration: 0.45,
      ease: "power2.out",
      onUpdate: () => {
        scrollProgressRef.current = smooth.progress;
      },
    });

    const updateScroll = (scrollY: number) => {
      const h = window.innerHeight || 1;
      scrollTo(Math.min(1, Math.max(0, scrollY / h)));
    };

    if (lenis) {
      const onScroll = ({ scroll }: { scroll: number }) => updateScroll(scroll);
      lenis.on("scroll", onScroll);
      updateScroll(lenis.scroll);
      return () => {
        lenis.off("scroll", onScroll);
        scrollTo.tween?.kill();
      };
    }

    const onScroll = () => updateScroll(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll(window.scrollY);
    return () => {
      window.removeEventListener("scroll", onScroll);
      scrollTo.tween?.kill();
    };
  }, [lenis]);

  useEffect(() => {
    const perf = getHeroPerfConfig();
    const base = baseRef.current;
    const bgImage = bgImageRef.current;
    const fog = fogRef.current;
    const glowStack = glowStackRef.current;
    const glowShell = glowShellRef.current;
    const asciiWrap = asciiSharpRef.current?.parentElement;
    const vignette = vignetteRef.current;

    if (!base || !bgImage || !fog || !glowStack || !glowShell || !asciiWrap || !vignette) {
      return;
    }

    if (heroRootRef.current) {
      heroRootRef.current.dataset.heroTier = perf.tier;
    }

    glowShell.classList.add("hero-glow--pulsing");
    const layerOpacity = bootComplete || (heroEnvRef?.current ?? 0) > 0.01 ? 1 : 0;
    gsap.set([base, bgImage, fog, glowStack, asciiWrap, vignette], {
      opacity: layerOpacity,
    });
    gsap.set(glowStack, { scale: 1 });

    const section = heroRootRef.current?.closest("section");
    if (section) {
      const handoff = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(bgImage, { opacity: 1 - p * 0.52 });
          gsap.set(fog, { opacity: 1 - p * 0.4 });
          gsap.set(glowShell, { opacity: 1 - p * 0.3 });
          if (asciiWrap) gsap.set(asciiWrap, { opacity: 1 - p * 0.58 });
          gsap.set(vignette, { opacity: 0.85 + p * 0.15 });
        },
      });

      return () => handoff.kill();
    }
  }, [bootComplete, heroEnvRef]);

  useEffect(() => {
    const base = baseRef.current;
    const bgImage = bgImageRef.current;
    const fog = fogRef.current;
    const glowStack = glowStackRef.current;
    const asciiWrap = asciiSharpRef.current?.parentElement;
    const vignette = vignetteRef.current;

    if (!base || !bgImage || !fog || !glowStack || !asciiWrap || !vignette) return;
    if (bootComplete) {
      gsap.set([base, bgImage, fog, glowStack, asciiWrap, vignette], { opacity: 1 });
      return;
    }

    let raf = 0;
    const layers = [base, bgImage, fog, glowStack, asciiWrap, vignette];

    const tick = () => {
      const env = heroEnvRef?.current ?? 0;
      gsap.set(layers, { opacity: env });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [heroEnvRef, bootComplete]);

  useEffect(() => {
    const sharpCanvas = asciiSharpRef.current;
    const blurCanvas = asciiBlurRef.current;
    const heroRoot = heroRootRef.current;
    if (!sharpCanvas || !blurCanvas) return;

    const sharpCtx = sharpCanvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    const blurCtx = blurCanvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!sharpCtx || !blurCtx) return;

    let perf: HeroPerfConfig = getHeroPerfConfig();
    let w = 0;
    let h = 0;
    let field: AsciiFieldState = { particles: [] };
    let lastFrame = 0;
    let lastTime = performance.now();
    let frameIndex = 0;

    const mouse = { x: -9999, y: -9999, active: false };

    let pageVisible = document.visibilityState === "visible";
    let heroVisible = true;
    let raf = 0;

    const resizeCanvases = () => {
      const dpr = getHeroCanvasDpr();

      sharpCanvas.width = Math.floor(w * dpr);
      sharpCanvas.height = Math.floor(h * dpr);
      sharpCanvas.style.width = `${w}px`;
      sharpCanvas.style.height = `${h}px`;
      sharpCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const blurDpr = dpr * BLUR_SCALE;
      blurCanvas.width = Math.floor(w * blurDpr);
      blurCanvas.height = Math.floor(h * blurDpr);
      blurCanvas.style.width = `${w}px`;
      blurCanvas.style.height = `${h}px`;
      blurCtx.setTransform(blurDpr, 0, 0, blurDpr, 0, 0);
    };

    const resize = () => {
      perf = getHeroPerfConfig();
      if (heroRoot) heroRoot.dataset.heroTier = perf.tier;

      w = window.innerWidth;
      h = window.innerHeight;
      resizeCanvases();
      field = buildAsciiField(w, h, perf.particleCount);
    };

    resize();
    window.addEventListener("resize", resize);

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    let observer: IntersectionObserver | null = null;
    if (heroRoot) {
      observer = new IntersectionObserver(
        ([entry]) => {
          heroVisible = entry?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      observer.observe(heroRoot);
    }

    const applyPointer = (clientX: number, clientY: number) => {
      mouse.x = clientX;
      mouse.y = clientY;
      mouse.active = true;
    };

    const onMove = (e: MouseEvent) => applyPointer(e.clientX, e.clientY);
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) applyPointer(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) applyPointer(t.clientX, t.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) onLeave();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!pageVisible || !heroVisible) return;

      if (perf.frameIntervalMs > 0 && now - lastFrame < perf.frameIntervalMs) return;
      lastFrame = now;

      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      frameIndex++;

      const reduced = perf.tier === "reduced";

      if (!reduced && field.particles.length > 0) {
        stepAsciiField(
          field,
          w,
          h,
          dt,
          mouse,
          interactiveRef.current && environmentReadyRef.current && perf.enablePointerHover,
          reduced,
        );

        sharpCtx.clearRect(0, 0, w, h);

        const drawBlur = frameIndex % 2 === 0;
        if (drawBlur) {
          blurCtx.clearRect(0, 0, w, h);
        }

        renderAsciiCanvases(
          sharpCtx,
          blurCtx,
          field,
          w,
          h,
          {
            scrollProgress: scrollProgressRef.current,
            now,
          },
          drawBlur,
        );
      } else {
        sharpCtx.clearRect(0, 0, w, h);
        if (frameIndex % 2 === 0) blurCtx.clearRect(0, 0, w, h);
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={heroRootRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div ref={baseRef} className="absolute inset-0 z-0 bg-[#010101]" />

      <div ref={bgImageRef} className="hero-bg-image absolute inset-0 z-[1] overflow-hidden">
        <Image
          src={assets.heroBg}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-bg-image__img object-cover object-center"
          quality={90}
        />
        <div className="hero-bg-scrim absolute inset-0" aria-hidden />
      </div>

      <div
        ref={glowShellRef}
        className="hero-glow pointer-events-none absolute inset-0 z-[2]"
      >
        <div ref={glowStackRef} className="hero-glow-stack absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
          <div className="hero-glow-outer" aria-hidden />
          <div className="hero-glow-mid" aria-hidden />
          <div className="hero-glow-core" aria-hidden />
        </div>
      </div>

      <div ref={vignetteRef} className="hero-vignette absolute inset-0 z-[3]" />

      <div ref={fogRef} className="hero-fog absolute inset-0 z-[4]" aria-hidden>
        <div className="hero-fog-plate hero-fog-left" />
        <div className="hero-fog-plate hero-fog-right" />
        <div className="hero-fog-plate hero-fog-bottom" />
      </div>

      <div className="hero-ascii-stack absolute inset-0 z-[5]">
        <canvas
          ref={asciiBlurRef}
          className="hero-ascii-blur absolute inset-0 h-full w-full"
          aria-hidden
        />
        <canvas
          ref={asciiSharpRef}
          className="hero-ascii-sharp absolute inset-0 h-full w-full"
          aria-hidden
        />
      </div>
    </div>
  );
}
