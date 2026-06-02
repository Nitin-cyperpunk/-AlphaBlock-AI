"use client";

import { useEffect, useRef } from "react";

type HeroCursorProps = {
  active?: boolean;
};

/**
 * Subtle magnetic cursor — blue core dot + lagging ring. Hero section only.
 */
function HeroCursor({ active = false }: HeroCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!root || !dot || !ring) return;

    const pos = { x: -100, y: -100 };
    const smooth = { x: -100, y: -100 };
    const ringSmooth = { x: -100, y: -100 };
    let visible = false;
    let raf = 0;

    const show = () => {
      if (visible) return;
      visible = true;
      root.style.opacity = "1";
    };

    const hide = () => {
      visible = false;
      root.style.opacity = "0";
    };

    const onMove = (e: MouseEvent) => {
      const section = document.querySelector(".hero-section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) {
        hide();
        return;
      }
      show();
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      smooth.x += (pos.x - smooth.x) * 0.28;
      smooth.y += (pos.y - smooth.y) * 0.28;
      ringSmooth.x += (pos.x - ringSmooth.x) * 0.12;
      ringSmooth.y += (pos.y - ringSmooth.y) * 0.12;

      dot.style.transform = `translate(${smooth.x}px, ${smooth.y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringSmooth.x}px, ${ringSmooth.y}px) translate(-50%, -50%)`;
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      className="hero-cursor pointer-events-none fixed inset-0 z-[60] opacity-0"
      aria-hidden
    >
      <div ref={ringRef} className="hero-cursor-ring" />
      <div ref={dotRef} className="hero-cursor-dot" />
    </div>
  );
}

export { HeroCursor };
export default HeroCursor;
