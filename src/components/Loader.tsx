"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { assets } from "@/lib/assets";

const COLOR_WHITE = "255, 255, 255";
const COLOR_BLUE = "13, 45, 205";

const ASCII_POOL = ["@", "#", "$", "%", "&", "+", "=", "/", "\\", "X", "x", "0", "8", "S"] as const;

const MONO_FONT =
  'var(--font-jetbrains), ui-monospace, "JetBrains Mono", monospace';

interface Dot {
  angle: number;
  radius: number;
  baseRadius: number;
  size: number;
  speed: number;
  blue: boolean;
  opacity: number;
  char: string;
}

type LoaderProps = {
  onComplete: () => void;
};

function pickChar(): string {
  return ASCII_POOL[(Math.random() * ASCII_POOL.length) | 0]!;
}

/**
 * Cinematic preloader: ASCII drift, form a rotating ring, reveal logo,
 * then dissolve outward into the hero. Total duration 4s, 60fps via rAF.
 * Motion/timings unchanged from original dot version — ASCII is draw-only swap.
 */
export default function Loader({ onComplete }: LoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(onComplete, 600);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = 1;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 220;
    const ringRadius = Math.min(w, h) * 0.22;
    const dots: Dot[] = Array.from({ length: COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: ringRadius,
      baseRadius: ringRadius + (Math.random() - 0.5) * 18,
      size: 0.6 + Math.random() * 2.6,
      speed: 0.15 + Math.random() * 0.25,
      blue: Math.random() < 0.28,
      opacity: 0.3 + Math.random() * 0.7,
      char: pickChar(),
    }));

    const scatter = dots.map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
    }));

    const DURATION = 5000;
    const HOLD_AFTER_MS = 400;
    const start = performance.now();
    let raf = 0;
    let completed = false;

    const ease = (t: number) => t * t * (3 - 2 * t);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `500 11px ${MONO_FONT}`;

    const loop = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / DURATION, 1);
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "#010101";
      ctx.fillRect(0, 0, w, h);

      const forming = ease(Math.min(p / 0.35, 1));
      const identify = p > 0.35 ? ease(Math.min((p - 0.35) / 0.35, 1)) : 0;
      const dissolve = p > 0.75 ? ease((p - 0.75) / 0.25) : 0;

      const rot = elapsed * 0.0006;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]!;
        d.angle += d.speed * 0.012;

        const r = d.baseRadius * (1 + dissolve * 6);
        const tx = cx + Math.cos(d.angle + rot) * r;
        const ty = cy + Math.sin(d.angle + rot) * r;

        const sx = scatter[i]!.x;
        const sy = scatter[i]!.y;
        const x = sx + (tx - sx) * forming;
        const y = sy + (ty - sy) * forming;

        const pulse = 0.5 + 0.5 * Math.sin(d.angle * 3 - elapsed * 0.004);
        const alpha = d.opacity * (1 - dissolve) * (0.5 + 0.5 * pulse);

        ctx.fillStyle = `rgba(${d.blue ? COLOR_BLUE : COLOR_WHITE}, ${alpha})`;
        ctx.fillText(d.char, x, y);
      }

      if (labelRef.current) {
        labelRef.current.style.opacity = String(identify * (1 - dissolve));
        labelRef.current.style.transform = `scale(${0.94 + identify * 0.06})`;
      }

      if (shellRef.current) {
        shellRef.current.style.opacity = String(1 - dissolve * 0.35);
      }

      if (p < 1) {
        raf = requestAnimationFrame(loop);
      } else if (!completed) {
        completed = true;
        window.setTimeout(() => {
          document.body.style.overflow = "";
          onComplete();
        }, HOLD_AFTER_MS);
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <div ref={shellRef} className="loader-shell fixed inset-0 z-50 bg-[#010101]">
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />
      <div
        ref={labelRef}
        className="loader-logo-wrap pointer-events-none absolute inset-0 flex items-center justify-center opacity-0"
        aria-hidden
      >
        <Image
          src={assets.logoLight}
          alt="AlphaBlock AI"
          width={320}
          height={96}
          priority
          className="loader-logo h-auto w-[clamp(160px,28vw,280px)] object-contain"
        />
      </div>
    </div>
  );
}
