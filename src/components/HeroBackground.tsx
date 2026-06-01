"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ARROW_PATTERN_URL } from "@/lib/hero-pattern";
import {
  buildFieldParticles,
  stepFieldParticles,
  type FieldParticle,
} from "@/lib/field-particles";
import {
  maxRippleRadius,
  rippleAge,
  rippleAlpha,
  rippleBoostAt,
  ripplePhase,
  rippleRadius,
  RIPPLE_SLOTS,
} from "@/lib/intelligence-ripples";

/** Canvas arrow grid — original field constants */
const ARROW = 12;
const CELL = 18;
const CURSOR_RADIUS = 200;
const REST = -Math.PI / 4;

type HeroBackgroundProps = {
  interactive?: boolean;
  onEnvironmentReady?: () => void;
};

const TAU = Math.PI * 2;
const GLOW_MAX_OFFSET = 26;
const HOVER_RADIUS = 220;
const CURSOR_RIPPLE_COOLDOWN_MS = 550;

/** Soft cursor field — brightens SVG arrows above via screen blend */
function drawCursorField(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  strength: number,
) {
  if (strength < 0.01) return;
  const inner = HOVER_RADIUS * 0.15;
  const outer = HOVER_RADIUS * 1.05;
  const g = ctx.createRadialGradient(x, y, inner, x, y, outer);
  g.addColorStop(0, `rgba(180,210,255,${strength * 0.22})`);
  g.addColorStop(0.45, `rgba(120,160,255,${strength * 0.14})`);
  g.addColorStop(0.75, `rgba(13,45,205,${strength * 0.06})`);
  g.addColorStop(1, "rgba(13,45,205,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, outer, 0, TAU);
  ctx.fill();
}

/** Annulus ripple — soft band + 1px definition (no full-screen fills) */
function drawRipple(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
) {
  if (alpha < 0.008 || r < 4) return;

  const band = 80;
  const inner = Math.max(0, r - band);
  const outer = r + band;

  const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  g.addColorStop(0, "rgba(13,45,205,0)");
  g.addColorStop(0.5, `rgba(120,160,255,${alpha * 0.14})`);
  g.addColorStop(1, "rgba(13,45,205,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TAU);
  ctx.arc(cx, cy, inner, 0, TAU, true);
  ctx.fill("evenodd");

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.strokeStyle = `rgba(150,180,255,${alpha * 0.09})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Layer stack: black → glow → ripples/particles → SVG pattern → canvas arrows → hover → vignette
 */
export function HeroBackground({
  interactive = false,
  onEnvironmentReady,
}: HeroBackgroundProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const blueWashRef = useRef<HTMLDivElement>(null);
  const glowShellRef = useRef<HTMLDivElement>(null);
  const glowStackRef = useRef<HTMLDivElement>(null);
  const fieldCanvasRef = useRef<HTMLCanvasElement>(null);
  const arrowCanvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  const patternStackRef = useRef<HTMLDivElement>(null);
  const patternMainRef = useRef<HTMLDivElement>(null);
  const patternDepthRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  const interactiveRef = useRef(interactive);
  const onReadyRef = useRef(onEnvironmentReady);
  const glowPosRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    onReadyRef.current = onEnvironmentReady;
  }, [onEnvironmentReady]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = baseRef.current;
    const blueWash = blueWashRef.current;
    const glowStack = glowStackRef.current;
    const glowShell = glowShellRef.current;
    const patternStack = patternStackRef.current;
    const patternMain = patternMainRef.current;
    const patternDepth = patternDepthRef.current;
    const fieldCanvas = fieldCanvasRef.current;
    const arrowCanvas = arrowCanvasRef.current;
    const hoverCanvas = hoverCanvasRef.current;
    const vignette = vignetteRef.current;

    if (
      !base ||
      !blueWash ||
      !glowStack ||
      !glowShell ||
      !patternStack ||
      !patternMain ||
      !patternDepth ||
      !fieldCanvas ||
      !arrowCanvas ||
      !hoverCanvas ||
      !vignette
    ) {
      return;
    }

    const fieldWrap = fieldCanvas.parentElement;
    const arrowWrap = arrowCanvas.parentElement;
    const hoverWrap = hoverCanvas.parentElement;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      glowShell.classList.add("hero-glow--pulsing");
      onReadyRef.current?.();
    };

    if (reduce) {
      gsap.set(
        [base, blueWash, glowStack, patternStack, patternDepth, patternMain, fieldWrap, arrowWrap, hoverWrap, vignette],
        { opacity: 1 },
      );
      gsap.set(patternDepth, { opacity: 0.04 });
      gsap.set(patternMain, { opacity: 0.18 });
      glowShell.classList.add("hero-glow--pulsing");
      finish();
      return;
    }

    gsap.set(base, { opacity: 1 });
    gsap.set(blueWash, { opacity: 0 });
    gsap.set(glowStack, { opacity: 0, scale: 0.92 });
    gsap.set(fieldWrap, { opacity: 0 });
    gsap.set(patternStack, { opacity: 1 });
    gsap.set(patternDepth, { opacity: 0 });
    gsap.set(patternMain, { opacity: 0 });
    gsap.set(arrowWrap, { opacity: 0 });
    gsap.set(hoverWrap, { opacity: 0 });
    gsap.set(vignette, { opacity: 0 });

    const fallback = window.setTimeout(finish, 3200);

    const tl = gsap.timeline({
      delay: 0.3,
      onComplete: () => {
        window.clearTimeout(fallback);
        finish();
      },
    });

    tl.to(blueWash, { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to(glowStack, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, "-=0.15")
      .to(fieldWrap, { opacity: 1, duration: 0.9, ease: "power2.out" }, "-=0.5")
      .to(patternDepth, { opacity: 0.04, duration: 0.75, ease: "power2.out" }, "-=0.55")
      .to(patternMain, { opacity: 0.18, duration: 0.75, ease: "power2.out" }, "-=0.7")
      .to(arrowWrap, { opacity: 1, duration: 0.75, ease: "power2.out" }, "-=0.65")
      .to(hoverWrap, { opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.5")
      .to(vignette, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.35");

    return () => {
      window.clearTimeout(fallback);
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = fieldCanvasRef.current;
    const arrowCanvas = arrowCanvasRef.current;
    const hoverCanvas = hoverCanvasRef.current;
    if (!canvas || !arrowCanvas || !hoverCanvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const arrowCtx = arrowCanvas.getContext("2d", { alpha: true });
    const hoverCtx = hoverCanvas.getContext("2d", { alpha: true });
    if (!ctx || !arrowCtx || !hoverCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let maxR = 0;
    let cols = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    let phase: Float32Array = new Float32Array(0);
    let glow: Float32Array = new Float32Array(0);
    let particles: FieldParticle[] = [];
    let t = 0;
    let lastNow = performance.now();

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    const cursor = { x: -9999, y: -9999, strength: 0 };
    const cursorRipples: { x: number; y: number; born: number }[] = [];
    let lastCursorRipple = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w * 0.5;
      cy = h * 0.48;
      maxR = maxRippleRadius(w, h);
      const resizeOne = (c: HTMLCanvasElement, cctx: CanvasRenderingContext2D) => {
        c.width = Math.floor(w * dpr);
        c.height = Math.floor(h * dpr);
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resizeOne(canvas, ctx);
      resizeOne(arrowCanvas, arrowCtx);
      resizeOne(hoverCanvas, hoverCtx);

      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      offsetX = (w - (cols - 1) * CELL) / 2;
      offsetY = (h - (rows - 1) * CELL) / 2;
      const n = cols * rows;
      phase = new Float32Array(n);
      glow = new Float32Array(n);
      const gr = Math.min(w, h) * 0.58;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          phase[i] = Math.random() * Math.PI * 2;
          const ax = offsetX + c * CELL;
          const ay = offsetY + r * CELL;
          glow[i] = Math.max(0, 1 - (Math.hypot(ax - cx, ay - cy) / gr) ** 1.35);
        }
      }

      const count = Math.min(200, Math.max(120, Math.floor((w * h) / 11_000)));
      particles = buildFieldParticles(w, h, count);

      glowPosRef.current.x = cx;
      glowPosRef.current.y = cy;
      glowPosRef.current.tx = cx;
      glowPosRef.current.ty = cy;
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const gp = glowPosRef.current;
      const ox = Math.max(-GLOW_MAX_OFFSET, Math.min(GLOW_MAX_OFFSET, (e.clientX - cx) * 0.032));
      const oy = Math.max(-GLOW_MAX_OFFSET, Math.min(GLOW_MAX_OFFSET, (e.clientY - cy) * 0.032));
      gp.tx = cx + ox;
      gp.ty = cy + oy;
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      mouse.active = true;

      if (interactiveRef.current && !reduce) {
        const now = performance.now();
        if (now - lastCursorRipple > CURSOR_RIPPLE_COOLDOWN_MS) {
          lastCursorRipple = now;
          cursorRipples.push({ x: e.clientX, y: e.clientY, born: now });
          if (cursorRipples.length > 4) cursorRipples.shift();
        }
      }
    };

    const onLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    let raf = 0;
    const epoch = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.032, (now - lastNow) / 1000);
      lastNow = now;
      if (!reduce) t += dt;

      const elapsed = now - epoch;

      const gp = glowPosRef.current;
      gp.x += (gp.tx - gp.x) * 0.045;
      gp.y += (gp.ty - gp.y) * 0.045;

      const shell = glowShellRef.current;
      if (shell) {
        shell.style.left = `${gp.x}px`;
        shell.style.top = `${gp.y}px`;
      }

      ctx.clearRect(0, 0, w, h);

      if (!reduce) {
        for (let i = 0; i < RIPPLE_SLOTS; i++) {
          const age = rippleAge(elapsed, i);
          const phase = ripplePhase(age);
          const alpha = rippleAlpha(phase);
          const r = rippleRadius(phase, maxR);
          drawRipple(ctx, cx, cy, r, alpha);
        }

        mouse.x += (mouse.tx - mouse.x) * 0.14;
        mouse.y += (mouse.ty - mouse.y) * 0.14;

        stepFieldParticles(
          particles,
          t,
          false,
          mouse.x,
          mouse.y,
          interactiveRef.current && mouse.active,
        );

        for (const p of particles) {
          const breath = 0.85 + Math.sin(t * 0.6 + p.phase) * 0.15;
          let a = (0.06 + breath * 0.1) * (p.blue ? 1.1 : 1);
          if (interactiveRef.current && mouse.active) {
            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dist < 200) {
              a = Math.min(0.38, a * (1 + (1 - dist / 200) ** 1.5 * 0.4));
            }
          }
          a = Math.min(0.32, a);
          ctx.beginPath();
          ctx.fillStyle = p.blue
            ? `rgba(90,140,255,${a})`
            : `rgba(255,255,255,${a})`;
          ctx.arc(p.x, p.y, p.size, 0, TAU);
          ctx.fill();
        }

        arrowCtx.clearRect(0, 0, w, h);
        arrowCtx.lineCap = "round";
        arrowCtx.lineJoin = "round";

        const a = ARROW / 2;
        const head = ARROW * 0.42;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const idx = row * cols + col;
            const x = offsetX + col * CELL;
            const y = offsetY + row * CELL;
            const g = glow[idx];
            const dist = Math.hypot(x - cx, y - cy);
            const waves = rippleBoostAt(dist, elapsed, maxR);
            const twinkle = 0.5 + 0.5 * Math.sin(t * 1.4 + phase[idx] * 3.1);
            let alpha = (0.035 + g * g * 0.48) * (0.68 + 0.28 * twinkle);
            alpha = Math.min(0.95, alpha + waves * 0.42);

            let angle = REST;
            let blue = 0.2 + g * 0.75 + waves * 0.25;

            if (interactiveRef.current && mouse.active) {
              const dx = x - mouse.x;
              const dy = y - mouse.y;
              const md = Math.hypot(dx, dy);
              if (md < CURSOR_RADIUS) {
                const force = (1 - md / CURSOR_RADIUS) ** 2;
                angle = angle * (1 - force) + Math.atan2(dy, dx) * force;
                alpha = Math.min(0.98, alpha + force * 0.72);
                blue = Math.min(1, blue + force * 0.52);
              }
            }

            if (alpha < 0.025) continue;

            const cr = Math.round(255 - blue * (255 - 100));
            const cg = Math.round(255 - blue * (255 - 145));
            const cb = Math.round(255 - blue * (255 - 255));

            arrowCtx.save();
            arrowCtx.translate(x, y);
            arrowCtx.rotate(angle);
            arrowCtx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
            arrowCtx.lineWidth = 1.15;
            arrowCtx.beginPath();
            arrowCtx.moveTo(-a, 0);
            arrowCtx.lineTo(a, 0);
            arrowCtx.moveTo(a, 0);
            arrowCtx.lineTo(a - head, -head);
            arrowCtx.moveTo(a, 0);
            arrowCtx.lineTo(a - head, head);
            arrowCtx.stroke();
            arrowCtx.restore();
          }
        }
      }

      hoverCtx.clearRect(0, 0, w, h);

      if (!reduce && interactiveRef.current) {
        cursor.x += (mouse.tx - cursor.x) * 0.1;
        cursor.y += (mouse.ty - cursor.y) * 0.1;
        const targetStrength = mouse.active ? 1 : 0;
        cursor.strength += (targetStrength - cursor.strength) * 0.08;

        if (cursor.strength > 0.02) {
          drawCursorField(hoverCtx, cursor.x, cursor.y, cursor.strength);
        }

        const nowHover = performance.now();
        for (let i = cursorRipples.length - 1; i >= 0; i--) {
          const rip = cursorRipples[i];
          const age = nowHover - rip.born;
          if (age > 2400) {
            cursorRipples.splice(i, 1);
            continue;
          }
          const p = age / 2400;
          const fade = (1 - p) ** 1.3;
          const r = 30 + 140 * (1 - (1 - p) ** 2);
          drawRipple(hoverCtx, rip.x, rip.y, r, fade * 0.55);
        }

      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  /** Original SVG pattern vignette masks */
  const patternMainMask =
    "radial-gradient(circle at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.11) 30%, rgba(0,0,0,0.07) 60%, rgba(0,0,0,0.04) 100%)";
  const patternDepthMask =
    "radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.12) 28%, rgba(0,0,0,0.05) 58%, rgba(0,0,0,0.03) 100%)";

  return (
    <>
      <div ref={baseRef} className="pointer-events-none absolute inset-0 z-0 bg-[#010101]" aria-hidden />

      <div
        ref={blueWashRef}
        className="pointer-events-none absolute inset-0 z-[1] opacity-0"
        style={{
          background:
            "radial-gradient(circle at 50% 48%, rgb(8 19 70) 0%, rgb(4 8 28) 42%, rgb(1 1 1) 100%)",
        }}
        aria-hidden
      />

      <div
        ref={glowShellRef}
        className="hero-glow pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div ref={glowStackRef} className="hero-glow-stack opacity-0">
          <div className="hero-glow-bloom" aria-hidden />
          <div className="hero-glow-core" aria-hidden />
          <div className="hero-glow-mid" aria-hidden />
          <div className="hero-glow-outer" aria-hidden />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[3] opacity-0" aria-hidden>
        <canvas ref={fieldCanvasRef} className="hero-field-canvas absolute inset-0 h-full w-full" />
      </div>

      <div ref={patternStackRef} className="hero-pattern-stack pointer-events-none absolute inset-0 z-[4]" aria-hidden>
        <div
          ref={patternDepthRef}
          className="hero-pattern-layer pointer-events-none absolute inset-[-5%] opacity-0"
          style={{
            backgroundImage: ARROW_PATTERN_URL,
            backgroundRepeat: "repeat",
            backgroundSize: "30px 30px",
            transform: "scale(1.1)",
            filter: "blur(1px)",
            maskImage: patternDepthMask,
            WebkitMaskImage: patternDepthMask,
          }}
        />
        <div
          ref={patternMainRef}
          className="hero-pattern-layer pointer-events-none absolute inset-0 opacity-0"
          style={{
            backgroundImage: ARROW_PATTERN_URL,
            backgroundRepeat: "repeat",
            backgroundSize: "28px 28px",
            maskImage: patternMainMask,
            WebkitMaskImage: patternMainMask,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[5] opacity-0" aria-hidden>
        <canvas ref={arrowCanvasRef} className="hero-arrow-canvas absolute inset-0 h-full w-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[6] opacity-0" aria-hidden>
        <canvas ref={hoverCanvasRef} className="hero-hover-canvas absolute inset-0 h-full w-full" />
      </div>

      <div ref={vignetteRef} className="hero-vignette pointer-events-none absolute inset-0 z-[7] opacity-0" aria-hidden />
    </>
  );
}
