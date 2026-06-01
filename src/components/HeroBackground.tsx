"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ARROW_PATTERN_URL } from "@/lib/hero-pattern";
import {
  smoothWaveRadii,
  waveBand,
  waveEnvelope,
  waveFieldAt,
  waveProgress,
  waveShadeAt,
  WAVE_COUNT,
  WAVE_PEAK_RADII,
} from "@/lib/hero-waves";

/** Canvas arrow grid — original field constants */
const ARROW = 12;
const CELL = 18;
const CURSOR_RADIUS = 200;
const REST = -Math.PI / 4;

type HeroBackgroundProps = {
  interactive?: boolean;
  onEnvironmentReady?: () => void;
};

type Ripple = { x: number; y: number; born: number };
type Dot = { x: number; y: number; baseX: number; baseY: number; phase: number; size: number };

const RIPPLE_COOLDOWN_MS = 600;
const AUTO_PULSE_MS = 4200;
const GLOW_MAX_OFFSET = 26;

/** Atmospheric wave — dark trail inside, bright leading edge outside */
function drawDirectionalWaveRing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  cy: number,
  radius: number,
  band: number,
  strength: number,
  rgb: [number, number, number],
) {
  if (strength <= 0.002) return;
  const trailInner = Math.max(0, radius - band * 0.5);
  const leadOuter = radius + band * 1.05;
  const g = ctx.createRadialGradient(cx, cy, trailInner, cx, cy, leadOuter);
  g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${strength * 0.03})`);
  g.addColorStop(0.38, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${strength * 0.07})`);
  g.addColorStop(0.62, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${strength * 0.22})`);
  g.addColorStop(0.82, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${strength * 0.38})`);
  g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Layer stack: dark base → blue wash → multi glow → canvas waves → SVG arrows
 * → canvas arrow boost → side dots → vignette
 */
export function HeroBackground({
  interactive = false,
  onEnvironmentReady,
}: HeroBackgroundProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const blueWashRef = useRef<HTMLDivElement>(null);
  const glowShellRef = useRef<HTMLDivElement>(null);
  const glowStackRef = useRef<HTMLDivElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const arrowCanvasRef = useRef<HTMLCanvasElement>(null);
  const arrowWrapRef = useRef<HTMLDivElement>(null);
  const dotsCanvasRef = useRef<HTMLCanvasElement>(null);
  const patternStackRef = useRef<HTMLDivElement>(null);
  const patternBaseRef = useRef<HTMLDivElement>(null);
  const patternMainRef = useRef<HTMLDivElement>(null);
  const patternDepthRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  const interactiveRef = useRef(interactive);
  const onReadyRef = useRef(onEnvironmentReady);
  const epochRef = useRef(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastRippleAtRef = useRef(0);
  const lastAutoPulseRef = useRef(0);
  const glowPosRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    onReadyRef.current = onEnvironmentReady;
  }, [onEnvironmentReady]);

  /* Cinematic entrance: 300ms → glow → waves → pattern */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = baseRef.current;
    const blueWash = blueWashRef.current;
    const glowStack = glowStackRef.current;
    const glowShell = glowShellRef.current;
    const patternStack = patternStackRef.current;
    const patternBase = patternBaseRef.current;
    const patternMain = patternMainRef.current;
    const patternDepth = patternDepthRef.current;
    const waveCanvas = waveCanvasRef.current;
    const arrowWrap = arrowWrapRef.current;
    const dotsCanvas = dotsCanvasRef.current;
    const vignette = vignetteRef.current;

    if (
      !base ||
      !blueWash ||
      !glowStack ||
      !glowShell ||
      !patternStack ||
      !patternBase ||
      !patternMain ||
      !patternDepth ||
      !waveCanvas ||
      !arrowWrap ||
      !dotsCanvas ||
      !vignette
    ) {
      return;
    }

    const waveWrap = waveCanvas.parentElement;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      arrowWrap.style.clipPath = "inset(0)";
      glowShell.classList.add("hero-glow--pulsing");
      onReadyRef.current?.();
    };

    if (reduce) {
      gsap.set([base, blueWash, glowStack, patternStack, patternBase, patternDepth, patternMain, waveWrap, arrowWrap, dotsCanvas, vignette], {
        opacity: 1,
      });
      arrowWrap.style.clipPath = "inset(0)";
      gsap.set(patternBase, { opacity: 0.14 });
      gsap.set(patternDepth, { opacity: 0.05 });
      gsap.set(patternMain, { opacity: 0.22 });
      glowShell.classList.add("hero-glow--pulsing");
      finish();
      return;
    }

    gsap.set(base, { opacity: 1 });
    gsap.set(blueWash, { opacity: 0 });
    gsap.set(glowStack, { opacity: 0, scale: 0.92 });
    gsap.set(waveWrap, { opacity: 0 });
    gsap.set(arrowWrap, { opacity: 0, clipPath: "circle(0% at 50% 50%)" });
    gsap.set(patternStack, { opacity: 1 });
    gsap.set(patternBase, { opacity: 0 });
    gsap.set(patternDepth, { opacity: 0 });
    gsap.set(patternMain, { opacity: 0 });
    gsap.set(dotsCanvas, { opacity: 0 });
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
      .to(patternBase, { opacity: 0.14, duration: 0.7, ease: "power2.out" }, "-=0.2")
      .to(patternDepth, { opacity: 0.05, duration: 0.75, ease: "power2.out" }, "-=0.65")
      .to(patternMain, { opacity: 0.22, duration: 0.75, ease: "power2.out" }, "-=0.7")
      .to(glowStack, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, "-=0.55")
      .to(waveWrap, { opacity: 1, duration: 1, ease: "power2.out" }, "-=0.7")
      .to(arrowWrap, { opacity: 1, duration: 0.85, ease: "power2.out" }, "-=0.85")
      .fromTo(
        arrowWrap,
        { clipPath: "circle(0% at 50% 50%)" },
        { clipPath: "circle(115% at 50% 52%)", duration: 0.9, ease: "power2.inOut" },
        "-=0.85",
      )
      .to(dotsCanvas, { opacity: 1, duration: 0.7, ease: "power2.out" }, "-=0.5")
      .to(vignette, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.35");

    return () => {
      window.clearTimeout(fallback);
      tl.kill();
    };
  }, []);

  /* Canvas: waves, arrow grid, dots, glow follow, ripples */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    epochRef.current = performance.now();
    lastAutoPulseRef.current = performance.now();

    const waveCanvas = waveCanvasRef.current;
    const arrowCanvas = arrowCanvasRef.current;
    const dotsCanvas = dotsCanvasRef.current;
    if (!waveCanvas || !arrowCanvas || !dotsCanvas) return;

    const waveCtx = waveCanvas.getContext("2d");
    const arrowCtx = arrowCanvas.getContext("2d");
    const dotsCtx = dotsCanvas.getContext("2d");
    if (!waveCtx || !arrowCtx || !dotsCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let cols = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    let phase: Float32Array = new Float32Array(0);
    let glow: Float32Array = new Float32Array(0);
    let dots: Dot[] = [];

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

    const resizeCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const buildDots = () => {
      dots = [];
      const clusters = [
        { anchorX: w * 0.07, spreadX: w * 0.06, yMin: h * 0.22, yMax: h * 0.78 },
        { anchorX: w * 0.93, spreadX: w * 0.06, yMin: h * 0.22, yMax: h * 0.78 },
      ];
      for (const cluster of clusters) {
        const count = Math.floor(38 + (w / 1400) * 18);
        for (let i = 0; i < count; i++) {
          const bx = cluster.anchorX + (Math.random() - 0.5) * cluster.spreadX;
          const by = cluster.yMin + Math.random() * (cluster.yMax - cluster.yMin);
          dots.push({
            x: bx,
            y: by,
            baseX: bx,
            baseY: by,
            phase: Math.random() * Math.PI * 2,
            size: 0.8 + Math.random() * 1.6,
          });
        }
      }
    };

    const buildArrowGrid = () => {
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
          const x = offsetX + c * CELL;
          const y = offsetY + r * CELL;
          const d = Math.hypot(x - cx, y - cy) / gr;
          glow[i] = Math.max(0, 1 - d ** 1.35);
        }
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w * 0.5;
      cy = h * 0.52;
      centerRef.current = { x: cx, y: cy };
      glowPosRef.current.x = cx;
      glowPosRef.current.y = cy;
      glowPosRef.current.tx = cx;
      glowPosRef.current.ty = cy;
      resizeCanvas(waveCanvas, waveCtx);
      resizeCanvas(arrowCanvas, arrowCtx);
      resizeCanvas(dotsCanvas, dotsCtx);
      buildArrowGrid();
      buildDots();
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const gp = glowPosRef.current;
      const glowOffX = Math.max(-GLOW_MAX_OFFSET, Math.min(GLOW_MAX_OFFSET, (e.clientX - cx) * 0.032));
      const glowOffY = Math.max(-GLOW_MAX_OFFSET, Math.min(GLOW_MAX_OFFSET, (e.clientY - cy) * 0.032));
      gp.tx = cx + glowOffX;
      gp.ty = cy + glowOffY;

      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      mouse.active = true;

      if (!interactiveRef.current || reduce) return;

      const now = performance.now();
      if (now - lastRippleAtRef.current < RIPPLE_COOLDOWN_MS) return;
      lastRippleAtRef.current = now;
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, born: now });
      if (ripplesRef.current.length > 3) ripplesRef.current.shift();
    };

    const onLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    let raf = 0;
    let t = 0;
    const displayRadii = Array.from({ length: WAVE_COUNT }, () => 0);

    const renderWaves = (
      ctx: CanvasRenderingContext2D,
      elapsed: number,
      now: number,
      radii: readonly number[],
    ) => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < WAVE_COUNT; i++) {
        const progress = waveProgress(elapsed, i);
        const peak = WAVE_PEAK_RADII[i];
        const radius = radii[i];
        const env = waveEnvelope(progress);
        const band = waveBand(peak);
        drawDirectionalWaveRing(ctx, w, h, cx, cy, radius, band, env * 0.48, [90, 130, 255]);
      }

      if (!reduce && now - lastAutoPulseRef.current > AUTO_PULSE_MS) {
        lastAutoPulseRef.current = now;
        ripplesRef.current.push({ x: cx, y: cy, born: now });
        if (ripplesRef.current.length > 3) ripplesRef.current.shift();
      }

      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        const age = now - rip.born;
        if (age > 2800) {
          ripplesRef.current.splice(i, 1);
          continue;
        }
        const linear = age / 2800;
        const p = 1 - (1 - linear) ** 2;
        const r = 40 + 320 * p;
        const fade = (1 - linear) ** 1.4;
        drawDirectionalWaveRing(ctx, w, h, rip.x, rip.y, r, 85, fade * 0.36, [140, 175, 255]);
      }
    };

    const loop = (now: number) => {
      if (!reduce) t += 0.008;
      const elapsed = now - epochRef.current;
      const radii = smoothWaveRadii(displayRadii, elapsed, reduce ? 1 : 0.055);

      const gp = glowPosRef.current;
      gp.x += (gp.tx - gp.x) * 0.045;
      gp.y += (gp.ty - gp.y) * 0.045;

      const shell = glowShellRef.current;
      if (shell) {
        shell.style.left = `${gp.x}px`;
        shell.style.top = `${gp.y}px`;
      }

      renderWaves(waveCtx, elapsed, now, radii);

      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;

      arrowCtx.clearRect(0, 0, w, h);
      arrowCtx.lineCap = "round";
      arrowCtx.lineJoin = "round";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const x = offsetX + c * CELL;
          const y = offsetY + r * CELL;
          const g = glow[i];

          const dist = Math.hypot(x - cx, y - cy);
          const waves = waveFieldAt(x, y, cx, cy, elapsed, ripplesRef.current, now, radii);
          const shade = waveShadeAt(dist, elapsed, radii);
          const twinkle = 0.5 + 0.5 * Math.sin(t * 1.4 + phase[i] * 3.1);
          const twinkleAmt = 0.36 * (1 - waves * 0.7);
          let alpha = (0.028 + g * g * 0.44) * shade * (0.64 + twinkleAmt * twinkle);
          alpha = Math.min(0.96, alpha + waves * 0.48);

          let angle = REST;
          let blue = 0.18 + g * 0.7 + waves * 0.38;

          if (!reduce && interactiveRef.current && mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < CURSOR_RADIUS) {
              const force = (1 - dist / CURSOR_RADIUS) ** 2;
              const target = Math.atan2(dy, dx);
              angle = angle * (1 - force) + target * force;
              alpha = Math.min(0.98, alpha + force * 0.75);
              blue = Math.min(1, blue + force * 0.55);
            }
          }

          const cr = Math.round(255 - blue * (255 - 100));
          const cg = Math.round(255 - blue * (255 - 145));
          const cb = Math.round(255 - blue * (255 - 255));

          arrowCtx.save();
          arrowCtx.translate(x, y);
          arrowCtx.rotate(angle);
          arrowCtx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          arrowCtx.lineWidth = 1.15;
          const a = ARROW / 2;
          const head = ARROW * 0.42;
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

      dotsCtx.clearRect(0, 0, w, h);
      for (const dot of dots) {
        const drift = reduce ? 0 : 1;
        const dx = Math.sin(t * 0.35 + dot.phase) * 4 * drift;
        const dy = Math.cos(t * 0.28 + dot.phase * 1.3) * 3 * drift;
        dot.x = dot.baseX + dx;
        dot.y = dot.baseY + dy;
        const tw = 0.45 + 0.55 * Math.sin(t * 1.1 + dot.phase * 2);
        const alpha = 0.08 + tw * 0.14;
        const scale = 0.85 + tw * 0.25;
        const blur = dot.size > 1.8 ? 1.2 : 0;
        dotsCtx.beginPath();
        dotsCtx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
        if (blur > 0) dotsCtx.filter = `blur(${blur}px)`;
        dotsCtx.arc(dot.x, dot.y, dot.size * scale, 0, Math.PI * 2);
        dotsCtx.fill();
        dotsCtx.filter = "none";
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

  /** Soft vignette — arrows stay visible at edges, brighter toward center */
  const patternMainMask =
    "radial-gradient(circle at 50% 52%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.72) 45%, rgba(255,255,255,0.48) 100%)";
  const patternDepthMask =
    "radial-gradient(circle at 50% 52%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.38) 100%)";

  return (
    <>
      {/* 1 — dark base */}
      <div
        ref={baseRef}
        className="pointer-events-none absolute inset-0 z-0 bg-[#010101]"
        aria-hidden
      />

      {/* 2 — blue gradient wash */}
      <div
        ref={blueWashRef}
        className="pointer-events-none absolute inset-0 z-[1] opacity-0"
        style={{
          background:
            "radial-gradient(circle at 50% 52%, rgb(8 19 70) 0%, rgb(4 8 28) 42%, rgb(1 1 1) 100%)",
        }}
        aria-hidden
      />

      {/* 3 — massive multi-layer center glow */}
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

      {/* 4 — canvas atmospheric wave fields */}
      <div className="pointer-events-none absolute inset-0 z-[3] opacity-0" aria-hidden>
        <canvas ref={waveCanvasRef} className="hero-wave-canvas absolute inset-0 h-full w-full" />
      </div>

      {/* 5 — original SVG arrow pattern (full viewport, always tiled) */}
      <div
        ref={patternStackRef}
        className="hero-pattern-stack pointer-events-none absolute inset-0 z-[4]"
        aria-hidden
      >
        {/* Full-field base — no mask, guarantees arrows across entire bg */}
        <div
          ref={patternBaseRef}
          className="hero-pattern-layer pointer-events-none absolute inset-[-2%] opacity-0"
          style={{
            backgroundImage: ARROW_PATTERN_URL,
            backgroundRepeat: "repeat",
            backgroundSize: "28px 28px",
            backgroundPosition: "center",
          }}
        />
        <div
          ref={patternDepthRef}
          className="hero-pattern-layer pointer-events-none absolute inset-[-5%] opacity-0"
          style={{
            backgroundImage: ARROW_PATTERN_URL,
            backgroundRepeat: "repeat",
            backgroundSize: "30px 30px",
            backgroundPosition: "center",
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
            backgroundPosition: "center",
            maskImage: patternMainMask,
            WebkitMaskImage: patternMainMask,
          }}
        />
      </div>

      {/* 5b — canvas arrow grid (wave-modulated opacity + cursor interaction) */}
      <div ref={arrowWrapRef} className="pointer-events-none absolute inset-0 z-[5] opacity-0" aria-hidden>
        <canvas ref={arrowCanvasRef} className="hero-arrow-canvas absolute inset-0 h-full w-full" />
      </div>

      {/* 6 — side dot clusters */}
      <canvas
        ref={dotsCanvasRef}
        className="pointer-events-none absolute inset-0 z-[6] opacity-0"
        aria-hidden
      />

      {/* Vignette depth */}
      <div ref={vignetteRef} className="hero-vignette pointer-events-none absolute inset-0 z-[7] opacity-0" aria-hidden />
    </>
  );
}
