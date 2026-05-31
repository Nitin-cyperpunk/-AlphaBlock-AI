"use client";

import { useEffect, useRef } from "react";

/**
 * ASCII arrow field — a grid of monospace arrow glyphs that quietly drift in
 * slow waves and re-orient toward the cursor as it moves. Glyphs brighten and
 * shift to brand-blue near the pointer, creating a soft, alive texture that
 * matches the banner aesthetic. Calm by default, expressive on interaction.
 */
export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GLYPH = "↗";
    const CELL = 22;
    const FONT_PX = 36;
    const RADIUS = 220;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let phase: Float32Array = new Float32Array(0);
    let baseAlpha: Float32Array = new Float32Array(0);

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
      baseAlpha = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        phase[i] = Math.random() * Math.PI * 2;
        baseAlpha[i] = 0.06 + Math.random() * 0.14;
      }
    };

    build();
    window.addEventListener("resize", build);

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    const onMove = (e: MouseEvent) => {
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
      if (!reduce) t += 0.014;

      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;

      ctx.clearRect(0, 0, w, h);
      ctx.font = `${FONT_PX}px var(--font-jetbrains), "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const x = offsetX + c * CELL;
          const y = offsetY + r * CELL;

          const wave =
            0.5 + 0.5 * Math.sin(t + phase[i] + c * 0.18 + r * 0.12);
          const depth = 0.25 + 0.75 * (y / h);
          let alpha = baseAlpha[i] * (0.55 + 0.45 * wave) * (0.4 + depth);

          let angle = -Math.PI / 4 + Math.sin(t * 0.5 + phase[i]) * 0.25;
          let blue = depth;

          if (!reduce && mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < RADIUS) {
              const force = (1 - dist / RADIUS) ** 2;
              const target = Math.atan2(dy, dx);
              angle = angle * (1 - force) + target * force;
              alpha = Math.min(0.95, alpha + force * 0.8);
              blue = Math.min(1, blue + force * 0.9);
            }
          }

          const cr = Math.round(255 - blue * (255 - 13));
          const cg = Math.round(255 - blue * (255 - 45));
          const cb = Math.round(255 - blue * (255 - 205));

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle + Math.PI / 4);
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.fillText(GLYPH, 0, 0);
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
      <div className="hero-glow pointer-events-none absolute inset-0 z-0" aria-hidden />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
      />
    </>
  );
}
