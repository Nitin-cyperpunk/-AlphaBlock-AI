"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

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

    const smooth = { x: -100, y: -100 };
    const ringSmooth = { x: -100, y: -100 };
    let visible = false;

    const applyTransforms = () => {
      dot.style.transform = `translate3d(${smooth.x}px, ${smooth.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringSmooth.x}px, ${ringSmooth.y}px, 0) translate(-50%, -50%)`;
    };

    const dotX = gsap.quickTo(smooth, "x", { duration: 0.32, ease: "power3.out", onUpdate: applyTransforms });
    const dotY = gsap.quickTo(smooth, "y", { duration: 0.32, ease: "power3.out", onUpdate: applyTransforms });
    const ringX = gsap.quickTo(ringSmooth, "x", { duration: 0.55, ease: "power3.out", onUpdate: applyTransforms });
    const ringY = gsap.quickTo(ringSmooth, "y", { duration: 0.55, ease: "power3.out", onUpdate: applyTransforms });

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
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      dotX.tween?.kill();
      dotY.tween?.kill();
      ringX.tween?.kill();
      ringY.tween?.kill();
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
