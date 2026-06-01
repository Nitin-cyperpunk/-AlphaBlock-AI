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
  DESKTOP_ARROW,
  getHeroPerfConfig,
  type HeroPerfConfig,
} from "@/lib/hero-performance";
import {
  ambientWaveStrength,
  maxRippleRadius,
  rippleAge,
  rippleAlpha,
  rippleBoostAt,
  ripplePhase,
  rippleRadius,
} from "@/lib/intelligence-ripples";
import {
  isSideClusterX,
  sideClusterWeight,
  SIDE_CLUSTER_RADIUS,
} from "@/lib/hero-side-zones";

type HeroBackgroundProps = {
  interactive?: boolean;
  onEnvironmentReady?: () => void;
};

const TAU = Math.PI * 2;
const HOVER_RADIUS = 220;
const CURSOR_RIPPLE_COOLDOWN_MS = 520;
const CURSOR_RIPPLE_LIFETIME_MS = 1500;

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

function drawRipple(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
  stroke: boolean,
) {
  if (alpha < 0.006 || r < 4) return;

  const band = 95;
  const inner = Math.max(0, r - band);
  const outer = r + band * 1.05;

  const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  g.addColorStop(0, "rgba(13,45,205,0)");
  g.addColorStop(0.38, `rgba(120,160,255,${alpha * 0.19})`);
  g.addColorStop(0.62, `rgba(13,45,205,${alpha * 0.09})`);
  g.addColorStop(1, "rgba(13,45,205,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, TAU);
  ctx.arc(cx, cy, inner, 0, TAU, true);
  ctx.fill("evenodd");

  if (stroke) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.strokeStyle = `rgba(150,180,255,${alpha * 0.09})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Layer stack: black → blue wash → volumetric glow → fog → waves/particles →
 * SVG pattern → canvas arrows → side hover ripples → vignette
 */
export function HeroBackground({
  interactive = false,
  onEnvironmentReady,
}: HeroBackgroundProps) {
  const heroRootRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const blueWashRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
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
    const perf = getHeroPerfConfig();
    const base = baseRef.current;
    const blueWash = blueWashRef.current;
    const fog = fogRef.current;
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
      !fog ||
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

    if (heroRootRef.current) {
      heroRootRef.current.dataset.heroTier = perf.tier;
    }

    patternMain.style.backgroundSize = `${perf.patternMainSize}px ${perf.patternMainSize}px`;
    patternDepth.style.backgroundSize = `${perf.patternDepthSize}px ${perf.patternDepthSize}px`;

    if (!perf.drawCanvasArrows && arrowWrap) {
      arrowWrap.style.display = "none";
    }
    if (!perf.drawHoverCanvas && hoverWrap) {
      hoverWrap.style.display = "none";
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      glowShell.classList.add("hero-glow--pulsing");
      onReadyRef.current?.();
    };

    if (perf.tier === "reduced") {
      gsap.set(
        [base, blueWash, fog, glowStack, patternStack, patternDepth, patternMain, fieldWrap, vignette],
        { opacity: 1 },
      );
      gsap.set(patternDepth, { opacity: perf.patternDepthOpacity });
      gsap.set(patternMain, { opacity: perf.patternMainOpacity });
      glowShell.classList.add("hero-glow--pulsing");
      finish();
      return;
    }

    gsap.set(base, { opacity: 1 });
    gsap.set(blueWash, { opacity: 0 });
    gsap.set(fog, { opacity: 0 });
    gsap.set(glowStack, { opacity: 0, scale: 0.92 });
    gsap.set(fieldWrap, { opacity: 0 });
    gsap.set(patternStack, { opacity: 1 });
    gsap.set(patternDepth, { opacity: 0 });
    gsap.set(patternMain, { opacity: 0 });
    gsap.set(vignette, { opacity: 0 });

    if (perf.drawCanvasArrows && arrowWrap) {
      gsap.set(arrowWrap, { opacity: 0, display: "block" });
    }
    if (perf.drawHoverCanvas && hoverWrap) {
      gsap.set(hoverWrap, { opacity: 0, display: "block" });
    }

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
      .to(
        patternDepth,
        { opacity: perf.patternDepthOpacity, duration: 0.55, ease: "power2.out" },
        "-=0.42",
      )
      .to(
        patternMain,
        { opacity: perf.patternMainOpacity, duration: 0.55, ease: "power2.out" },
        "-=0.48",
      );

    if (perf.drawCanvasArrows && arrowWrap) {
      tl.to(arrowWrap, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.45");
    }
    if (perf.drawHoverCanvas && hoverWrap) {
      tl.to(hoverWrap, { opacity: 1, duration: 0.45, ease: "power2.out" }, "-=0.4");
    }

    tl.to(vignette, { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.32");

    return () => {
      window.clearTimeout(fallback);
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const canvas = fieldCanvasRef.current;
    const arrowCanvas = arrowCanvasRef.current;
    const hoverCanvas = hoverCanvasRef.current;
    const heroRoot = heroRootRef.current;
    if (!canvas || !arrowCanvas || !hoverCanvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const arrowCtx = arrowCanvas.getContext("2d", { alpha: true });
    const hoverCtx = hoverCanvas.getContext("2d", { alpha: true });
    if (!ctx || !arrowCtx || !hoverCtx) return;

    let perf: HeroPerfConfig = getHeroPerfConfig();
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
    let lastFrame = 0;

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    const cursor = { x: -9999, y: -9999, strength: 0 };
    const cursorRipples: { x: number; y: number; born: number }[] = [];
    let lastCursorRipple = 0;

    let pageVisible = document.visibilityState === "visible";
    let heroVisible = true;
    let raf = 0;
    const epoch = performance.now();

    const resizeOne = (c: HTMLCanvasElement, cctx: CanvasRenderingContext2D) => {
      c.width = Math.floor(w * perf.dpr);
      c.height = Math.floor(h * perf.dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      cctx.setTransform(perf.dpr, 0, 0, perf.dpr, 0, 0);
    };

    const applyPatternLayout = () => {
      const patternMain = patternMainRef.current;
      const patternDepth = patternDepthRef.current;
      if (patternMain) {
        patternMain.style.backgroundSize = `${perf.patternMainSize}px ${perf.patternMainSize}px`;
      }
      if (patternDepth) {
        patternDepth.style.backgroundSize = `${perf.patternDepthSize}px ${perf.patternDepthSize}px`;
      }
    };

    const buildArrowGrid = () => {
      if (!perf.drawCanvasArrows) return;
      const cell = perf.cellSize;
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 1;
      offsetX = (w - (cols - 1) * cell) / 2;
      offsetY = (h - (rows - 1) * cell) / 2;
      const n = cols * rows;
      phase = new Float32Array(n);
      glow = new Float32Array(n);
      const gr = Math.min(w, h) * 0.58;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          phase[i] = Math.random() * Math.PI * 2;
          const ax = offsetX + c * cell;
          const ay = offsetY + r * cell;
          const centerGlow = Math.max(0, 1 - (Math.hypot(ax - cx, ay - cy) / gr) ** 1.35);
          const sideW = sideClusterWeight(ax, w);
          glow[i] = centerGlow * (1 - sideW * 0.72) + sideW * 0.88;
        }
      }
    };

    const syncCanvasLayers = () => {
      const arrowWrap = arrowCanvas.parentElement;
      const hoverWrap = hoverCanvas.parentElement;
      if (arrowWrap) {
        if (perf.drawCanvasArrows) {
          arrowWrap.style.display = "block";
          if (arrowWrap.style.opacity === "0" || !arrowWrap.style.opacity) {
            arrowWrap.style.opacity = "1";
          }
        } else {
          arrowWrap.style.display = "none";
        }
      }
      if (hoverWrap) {
        if (perf.drawHoverCanvas) {
          hoverWrap.style.display = "block";
          if (hoverWrap.style.opacity === "0" || !hoverWrap.style.opacity) {
            hoverWrap.style.opacity = "1";
          }
        } else {
          hoverWrap.style.display = "none";
        }
      }
    };

    const resize = () => {
      perf = getHeroPerfConfig();
      if (heroRoot) heroRoot.dataset.heroTier = perf.tier;
      syncCanvasLayers();
      applyPatternLayout();

      w = window.innerWidth;
      h = window.innerHeight;
      cx = w * 0.5;
      cy = h * 0.48;
      maxR = maxRippleRadius(w, h);

      resizeOne(canvas, ctx);
      if (perf.drawCanvasArrows) resizeOne(arrowCanvas, arrowCtx);
      if (perf.drawHoverCanvas) resizeOne(hoverCanvas, hoverCtx);

      buildArrowGrid();
      particles = buildFieldParticles(w, h, perf.particleCap);

      glowPosRef.current.x = cx;
      glowPosRef.current.y = cy;
      glowPosRef.current.tx = cx;
      glowPosRef.current.ty = cy;
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
      mouse.tx = clientX;
      mouse.ty = clientY;
      mouse.active = true;

      if (!perf.enablePointerHover || !isSideClusterX(clientX, w)) return;

      if (interactiveRef.current && perf.drawHoverCanvas) {
        const now = performance.now();
        if (now - lastCursorRipple > CURSOR_RIPPLE_COOLDOWN_MS) {
          lastCursorRipple = now;
          cursorRipples.push({ x: clientX, y: clientY, born: now });
          if (cursorRipples.length > 3) cursorRipples.shift();
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      applyPointer(e.clientX, e.clientY);
    };

    const onLeave = () => {
      mouse.active = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) applyPointer(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) applyPointer(touch.clientX, touch.clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) mouse.active = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    const drawArrowGrid = (elapsed: number) => {
      if (!perf.drawCanvasArrows) return;

      const cell = perf.cellSize;
      const arrow = perf.arrowSize;
      const rest = perf.restAngle;

      arrowCtx.clearRect(0, 0, w, h);
      arrowCtx.lineCap = "round";
      arrowCtx.lineJoin = "round";

      const half = arrow / 2;
      const head = arrow * 0.42;
      const lineWidth = (arrow / DESKTOP_ARROW) * 1.15;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const x = offsetX + col * cell;
          const y = offsetY + row * cell;
          const g = glow[idx];
          const dist = Math.hypot(x - cx, y - cy);
          const waves = rippleBoostAt(dist, elapsed, w, h);
          const twinkle = perf.enableTwinkle
            ? 0.5 + 0.5 * Math.sin(t * 1.4 + phase[idx] * 3.1)
            : 0.82;
          let alpha = (0.035 + g * g * 0.48) * (0.68 + 0.28 * twinkle);
          alpha = Math.min(0.95, alpha + waves * 0.48);

          let angle = rest;
          let blue = 0.2 + g * 0.75 + waves * 0.28;
          const waveScale = 1 + waves * 0.1;

          if (
            interactiveRef.current &&
            mouse.active &&
            perf.enablePointerHover &&
            isSideClusterX(x, w)
          ) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const md = Math.hypot(dx, dy);
            const sideR = SIDE_CLUSTER_RADIUS;
            if (md < sideR) {
              const force = (1 - md / sideR) ** 2;
              angle = angle * (1 - force) + Math.atan2(dy, dx) * force;
              alpha = Math.min(0.98, alpha + force * 0.68);
              blue = Math.min(1, blue + force * 0.48);
            }
          }

          if (alpha < 0.025) continue;

          const cr = Math.round(255 - blue * (255 - 100));
          const cg = Math.round(255 - blue * (255 - 145));
          const cb = Math.round(255 - blue * (255 - 255));

          arrowCtx.save();
          arrowCtx.translate(x, y);
          arrowCtx.rotate(angle);
          arrowCtx.scale(waveScale, waveScale);
          arrowCtx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          arrowCtx.lineWidth = lineWidth;
          arrowCtx.beginPath();
          arrowCtx.moveTo(-half, 0);
          arrowCtx.lineTo(half, 0);
          arrowCtx.moveTo(half, 0);
          arrowCtx.lineTo(half - head, -head);
          arrowCtx.moveTo(half, 0);
          arrowCtx.lineTo(half - head, head);
          arrowCtx.stroke();
          arrowCtx.restore();
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);

      if (!pageVisible || !heroVisible) return;

      if (now - lastFrame < perf.frameIntervalMs) return;
      lastFrame = now;

      const dt = Math.min(0.032, (now - lastNow) / 1000);
      lastNow = now;

      if (perf.tier !== "reduced") t += dt;

      const elapsed = now - epoch;

      const gp = glowPosRef.current;
      gp.x += (cx - gp.x) * 0.06;
      gp.y += (cy - gp.y) * 0.06;

      const shell = glowShellRef.current;
      if (shell) {
        shell.style.left = `${gp.x}px`;
        shell.style.top = `${gp.y}px`;
      }

      const patternMain = patternMainRef.current;
      if (patternMain && perf.tier !== "reduced") {
        const ambient = ambientWaveStrength(elapsed);
        patternMain.style.opacity = String(perf.patternMainOpacity + ambient * 0.035);
      }

      ctx.clearRect(0, 0, w, h);

      if (perf.tier !== "reduced" && perf.rippleSlots > 0) {
        for (let i = 0; i < perf.rippleSlots; i++) {
          const age = rippleAge(elapsed, i);
          const ph = ripplePhase(age, i);
          const alpha = rippleAlpha(ph);
          const r = rippleRadius(ph, maxR, i);
          drawRipple(ctx, cx, cy, r, alpha, false);
        }

        if (perf.particleCap > 0) {
          mouse.x += (mouse.tx - mouse.x) * 0.12;
          mouse.y += (mouse.ty - mouse.y) * 0.12;

          const pointerOn =
            interactiveRef.current &&
            mouse.active &&
            perf.enablePointerHover &&
            isSideClusterX(mouse.x, w);

          stepFieldParticles(particles, t, false, mouse.x, mouse.y, pointerOn, w);

          for (const p of particles) {
            const breath = 0.85 + Math.sin(t * 0.6 + p.phase) * 0.15;
            const opacityDrift = 0.95 + Math.sin(t * 0.4 + p.driftPhase) * 0.05;
            let a = (0.06 + breath * 0.1) * (p.blue ? 1.1 : 1) * p.opacityBase * opacityDrift;
            if (pointerOn) {
              const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
              if (dist < SIDE_CLUSTER_RADIUS) {
                a = Math.min(
                  0.38,
                  a * (1 + (1 - dist / SIDE_CLUSTER_RADIUS) ** 1.5 * 0.45),
                );
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
        }
      }

      drawArrowGrid(elapsed);

      if (perf.drawHoverCanvas) {
        hoverCtx.clearRect(0, 0, w, h);

        if (interactiveRef.current && perf.enablePointerHover) {
          const sideActive = mouse.active && isSideClusterX(mouse.x, w);
          cursor.x += (mouse.tx - cursor.x) * 0.09;
          cursor.y += (mouse.ty - cursor.y) * 0.09;
          const targetStrength = sideActive ? 1 : 0;
          cursor.strength += (targetStrength - cursor.strength) * 0.07;

          if (cursor.strength > 0.02 && sideActive) {
            drawCursorField(hoverCtx, cursor.x, cursor.y, cursor.strength * 0.85);
          }

          const nowHover = performance.now();
          for (let i = cursorRipples.length - 1; i >= 0; i--) {
            const rip = cursorRipples[i];
            const age = nowHover - rip.born;
            if (age > CURSOR_RIPPLE_LIFETIME_MS) {
              cursorRipples.splice(i, 1);
              continue;
            }
            const p = age / CURSOR_RIPPLE_LIFETIME_MS;
            const fade = (1 - p) ** 1.35;
            const r = 24 + 120 * (1 - (1 - p) ** 2);
            drawRipple(hoverCtx, rip.x, rip.y, r, fade * 0.08, false);
          }
        }
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

  const patternMainMask =
    "radial-gradient(circle at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.11) 30%, rgba(0,0,0,0.07) 60%, rgba(0,0,0,0.04) 100%)";
  const patternDepthMask =
    "radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.12) 28%, rgba(0,0,0,0.05) 58%, rgba(0,0,0,0.03) 100%)";

  return (
    <div ref={heroRootRef} className="pointer-events-none absolute inset-0" aria-hidden>
      <div ref={baseRef} className="absolute inset-0 z-0 bg-[#010101]" />

      <div
        ref={blueWashRef}
        className="absolute inset-0 z-[1] opacity-0"
        style={{
          background:
            "radial-gradient(circle at 50% 48%, rgb(8 19 70) 0%, rgb(4 8 28) 42%, rgb(1 1 1) 100%)",
        }}
      />

      <div
        ref={glowShellRef}
        className="hero-glow absolute z-[2] -translate-x-1/2 -translate-y-1/2"
      >
        <div ref={glowStackRef} className="hero-glow-stack opacity-0">
          <div className="hero-glow-core" aria-hidden />
          <div className="hero-glow-mid" aria-hidden />
          <div className="hero-glow-outer" aria-hidden />
        </div>
      </div>

      <div ref={fogRef} className="hero-fog absolute inset-0 z-[3] opacity-0" aria-hidden>
        <div className="hero-fog-left" />
        <div className="hero-fog-right" />
      </div>

      <div className="absolute inset-0 z-[4] opacity-0">
        <canvas ref={fieldCanvasRef} className="hero-field-canvas absolute inset-0 h-full w-full" />
      </div>

      <div ref={patternStackRef} className="hero-pattern-stack absolute inset-0 z-[5]">
        <div
          ref={patternDepthRef}
          className="hero-pattern-layer absolute inset-[-5%] opacity-0"
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
          className="hero-pattern-layer absolute inset-0 opacity-0"
          style={{
            backgroundImage: ARROW_PATTERN_URL,
            backgroundRepeat: "repeat",
            backgroundSize: "28px 28px",
            maskImage: patternMainMask,
            WebkitMaskImage: patternMainMask,
          }}
        />
      </div>

      <div className="absolute inset-0 z-[6] opacity-0">
        <canvas ref={arrowCanvasRef} className="hero-arrow-canvas absolute inset-0 h-full w-full" />
      </div>

      <div className="absolute inset-0 z-[7] opacity-0">
        <canvas ref={hoverCanvasRef} className="hero-hover-canvas absolute inset-0 h-full w-full" />
      </div>

      <div ref={vignetteRef} className="hero-vignette absolute inset-0 z-[8] opacity-0" />
    </div>
  );
}
