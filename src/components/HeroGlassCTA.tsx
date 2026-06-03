"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { forwardRef, useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

type HeroGlassCTAProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  compact?: boolean;
  /** Side-by-side hero row — compact pill sizing */
  pair?: boolean;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<"a">, "href" | "children" | "className">;

export const HeroGlassCTA = forwardRef<HTMLAnchorElement, HeroGlassCTAProps>(
  function HeroGlassCTA(
    { href, children, variant = "primary", compact = false, pair = false, className = "", ...rest },
    ref,
  ) {
    const innerRef = useRef<HTMLAnchorElement>(null);
    const arrowRef = useRef<SVGSVGElement>(null);
    const spotX = useRef(50);
    const spotY = useRef(50);
    const targetX = useRef(50);
    const targetY = useRef(50);
    const rafRef = useRef(0);

    const setRef = (node: HTMLAnchorElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const tick = () => {
        spotX.current += (targetX.current - spotX.current) * 0.14;
        spotY.current += (targetY.current - spotY.current) * 0.14;
        el.style.setProperty("--spot-x", `${spotX.current}%`);
        el.style.setProperty("--spot-y", `${spotY.current}%`);
        rafRef.current = requestAnimationFrame(tick);
      };

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return;
        targetX.current = ((e.clientX - rect.left) / rect.width) * 100;
        targetY.current = ((e.clientY - rect.top) / rect.height) * 100;
      };

      const onEnter = () => {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };

      const onLeave = () => {
        targetX.current = 50;
        targetY.current = 50;
      };

      const onHoverIn = () => {
        onEnter();
        const isPrimary = variant === "primary";
        gsap.to(el, {
          scale: isPrimary ? 1.03 : 1.02,
          backgroundColor: isPrimary
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(255, 255, 255, 0.05)",
          borderColor: isPrimary
            ? "rgba(255, 255, 255, 0.22)"
            : "rgba(255, 255, 255, 0.18)",
          boxShadow: isPrimary
            ? "0 0 28px rgba(13, 45, 205, 0.22), 0 8px 32px rgba(0, 0, 0, 0.2)"
            : "0 0 20px rgba(13, 45, 205, 0.12), 0 6px 24px rgba(0, 0, 0, 0.18)",
          duration: 0.4,
          ease: "power2.out",
        });
        if (arrowRef.current) {
          gsap.to(arrowRef.current, { x: 4, duration: 0.4, ease: "power2.out" });
        }
      };

      const onHoverOut = () => {
        cancelAnimationFrame(rafRef.current);
        onLeave();
        const isPrimary = variant === "primary";
        const isPair = el.classList.contains("hero-glass-cta--pair");
        gsap.to(el, {
          scale: 1,
          backgroundColor: isPair
            ? "rgba(255, 255, 255, 0.04)"
            : isPrimary
              ? "rgba(255, 255, 255, 0.04)"
              : "rgba(255, 255, 255, 0)",
          borderColor: "rgba(255, 255, 255, 0.12)",
          boxShadow: isPrimary
            ? "0 4px 24px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.06)"
            : "0 4px 20px rgba(0, 0, 0, 0.18)",
          duration: 0.4,
          ease: "power2.out",
        });
        if (arrowRef.current) {
          gsap.to(arrowRef.current, { x: 0, duration: 0.4, ease: "power2.out" });
        }
      };

      el.addEventListener("mouseenter", onHoverIn);
      el.addEventListener("mouseleave", onHoverOut);
      el.addEventListener("mousemove", onMove);

      return () => {
        cancelAnimationFrame(rafRef.current);
        el.removeEventListener("mouseenter", onHoverIn);
        el.removeEventListener("mouseleave", onHoverOut);
        el.removeEventListener("mousemove", onMove);
      };
    }, [variant]);

    const Icon = variant === "primary" ? ArrowUpRight : ArrowRight;

    return (
      <a
        ref={setRef}
        href={href}
        className={`hero-glass-cta hero-glass-cta--${variant}${compact ? " hero-glass-cta--compact" : ""}${pair ? " hero-glass-cta--pair" : ""} ${className}`.trim()}
        {...rest}
      >
        <span className="hero-glass-cta__highlight" aria-hidden />
        <span className="hero-glass-cta__spotlight" aria-hidden />
        <span className="hero-glass-cta__shine" aria-hidden />
        <span className="hero-glass-cta__label">{children}</span>
        <Icon ref={arrowRef} className="hero-glass-cta__icon" strokeWidth={2} aria-hidden />
      </a>
    );
  },
);
