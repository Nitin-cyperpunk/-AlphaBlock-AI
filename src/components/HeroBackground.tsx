"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type HeroBackgroundProps = {
  /** Enable arrow cursor interaction after content reveal. */
  interactive?: boolean;
  /** Fires when glow has settled (~5.8s absolute). */
  onEnvironmentReady?: () => void;
};

/**
 * Canvas arrow field with a centered circular blue glow — matches the banner.
 * Cinematic entrance (pattern spread → glow activation) is handled via GSAP;
 * mouse interaction is gated until `interactive` is true.
 */
export function HeroBackground({ interactive = false, onEnvironmentReady }: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const glowShellRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef(interactive);
  const onReadyRef = useRef(onEnvironmentReady);

  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    onReadyRef.current = onEnvironmentReady;
  }, [onEnvironmentReady]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = baseRef.current;
    const glowShell = glowShellRef.current;
    const glow = glowRef.current;
    const canvasWrap = canvasWrapRef.current;
    const vignette = vignetteRef.current;
    if (!base || !glowShell || !glow || !canvasWrap || !vignette) return;

    if (reduce) {
      gsap.set([base, glow, canvasWrap, vignette], { opacity: 1, clearProps: "clipPath,scale" });
      glowShell.classList.add("hero-glow--pulsing");
      onReadyRef.current?.();
      return;
    }

    gsap.set(base, { opacity: 0 });
    gsap.set(glow, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
    gsap.set(canvasWrap, { opacity: 0, clipPath: "circle(0% at 50% 50%)" });
    gsap.set(vignette, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        canvasWrap.style.clipPath = "inset(0)";
        glowShell.classList.add("hero-glow--pulsing");
        onReadyRef.current?.();
      },
    });

    // 4s–5s — environment formation
    tl.to(base, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0)
      .to(canvasWrap, { opacity: 1, duration: 1, ease: "power2.out" }, 0)
      .fromTo(
        canvasWrap,
        { clipPath: "circle(0% at 50% 50%)" },
        { clipPath: "circle(90% at 22% 50%)", duration: 0.38, ease: "power2.inOut" },
        0.05,
      )
      .to(
        canvasWrap,
        { clipPath: "circle(120% at 78% 50%)", duration: 0.38, ease: "power2.inOut" },
        0.43,
      )
      .to(canvasWrap, { clipPath: "inset(0)", duration: 0.24, ease: "power2.out" }, 0.81)
      .to(vignette, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.5);

    // 5s–5.8s — background activation (glow pool)
    tl.to(glow, { opacity: 1, scale: 1, duration: 0.85, ease: "power2.out" }, 1);

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ARROW = 12;
    const CELL = 18;
    const RADIUS = 200;
    const REST = -Math.PI / 4;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let phase: Float32Array = new Float32Array(0);
    let glow: Float32Array = new Float32Array(0);

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      offsetX = (w - (cols - 1) * CELL) / 2;
      offsetY = (h - (rows - 1) * CELL) / 2;

      const n = cols * rows;
      phase = new Float32Array(n);
      glow = new Float32Array(n);

      const gx = w * 0.5;
      const gy = h * 0.52;
      const gr = Math.min(w, h) * 0.58;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          phase[i] = Math.random() * Math.PI * 2;
          const x = offsetX + c * CELL;
          const y = offsetY + r * CELL;
          const d = Math.hypot(x - gx, y - gy) / gr;
          glow[i] = Math.max(0, 1 - d ** 1.35);
        }
      }
    };

    build();
    window.addEventListener("resize", build);

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    const onMove = (e: MouseEvent) => {
      if (!interactiveRef.current) return;
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    let raf = 0;
    let t = 0;

    const loop = () => {
      if (!reduce) t += 0.012;

      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;

      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const x = offsetX + c * CELL;
          const y = offsetY + r * CELL;
          const g = glow[i];

          const twinkle = 0.5 + 0.5 * Math.sin(t * 1.6 + phase[i] * 3.1);
          let alpha = (0.035 + g * g * 0.52) * (0.72 + 0.28 * twinkle);

          let angle = REST;
          let blue = 0.2 + g * 0.8;

          if (!reduce && interactiveRef.current && mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < RADIUS) {
              const force = (1 - dist / RADIUS) ** 2;
              const target = Math.atan2(dy, dx);
              angle = angle * (1 - force) + target * force;
              alpha = Math.min(0.98, alpha + force * 0.85);
              blue = Math.min(1, blue + force * 0.6);
            }
          }

          const cr = Math.round(255 - blue * (255 - 100));
          const cg = Math.round(255 - blue * (255 - 145));
          const cb = Math.round(255 - blue * (255 - 255));

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.lineWidth = 1.15;
          const a = ARROW / 2;
          const head = ARROW * 0.42;
          ctx.beginPath();
          ctx.moveTo(-a, 0);
          ctx.lineTo(a, 0);
          ctx.moveTo(a, 0);
          ctx.lineTo(a - head, -head);
          ctx.moveTo(a, 0);
          ctx.lineTo(a - head, head);
          ctx.stroke();
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={baseRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0"
        style={{
          background:
            "radial-gradient(circle at 50% 52%, rgb(8 19 70) 0%, rgb(4 8 28) 38%, rgb(1 1 1) 100%)",
        }}
        aria-hidden
      />
      <div
        ref={glowShellRef}
        className="hero-glow pointer-events-none absolute left-1/2 top-[52%] z-0 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div
          ref={glowRef}
          className="hero-glow-orb h-[min(88vw,960px)] w-[min(88vw,960px)] rounded-full opacity-0"
        />
      </div>
      <div
        ref={canvasWrapRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-0"
        aria-hidden
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
      <div
        ref={vignetteRef}
        className="hero-vignette pointer-events-none absolute inset-0 z-0 opacity-0"
        aria-hidden
      />
    </>
  );
}
