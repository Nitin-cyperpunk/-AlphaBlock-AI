"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { assets } from "@/lib/assets";
import { useLenis } from "@/context/LenisContext";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
] as const;

type NavbarProps = {
  /** Fade in after hero background completes */
  visible?: boolean;
};

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: (href: string) => void;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  const onEnter = () => {
    if (!underlineRef.current) return;
    gsap.fromTo(
      underlineRef.current,
      { scaleX: 0, opacity: 0.6 },
      { scaleX: 1, opacity: 1, duration: 0.3, ease: "power2.out" },
    );
  };

  const onLeave = () => {
    if (!underlineRef.current) return;
    gsap.to(underlineRef.current, {
      scaleX: 0,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
    });
  };

  return (
    <a
      ref={linkRef}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(href);
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className="group relative font-mono text-xs uppercase tracking-[0.18em] text-white/70 transition-[transform,color] duration-300 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:text-white"
    >
      {label}
      <span
        ref={underlineRef}
        aria-hidden
        className="absolute -bottom-1.5 left-1/2 h-px w-full origin-center -translate-x-1/2 scale-x-0 bg-white/90 opacity-0"
      />
    </a>
  );
}

export default function Navbar({ visible = false }: NavbarProps) {
  const lenis = useLenis();
  const shellRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLDivElement>(null);
  const menuTweenRef = useRef<gsap.core.Timeline | null>(null);
  const hasEnteredRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToAnchor = useCallback(
    (href: string) => {
      const id = href.replace("#", "");
      const target = document.getElementById(id);
      if (!target) return;

      if (lenis) {
        lenis.scrollTo(target, { offset: -96, duration: 1.15 });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [lenis],
  );

  const closeMenu = useCallback(() => {
    if (!menuOpen) return;
    const overlay = overlayRef.current;
    const links = mobileLinksRef.current?.querySelectorAll("[data-mobile-link]");
    if (!overlay || !links) {
      setMenuOpen(false);
      return;
    }

    menuTweenRef.current?.kill();
    menuTweenRef.current = gsap.timeline({
      onComplete: () => setMenuOpen(false),
    });

    menuTweenRef.current
      .to(links, {
        y: 30,
        opacity: 0,
        duration: 0.28,
        stagger: 0.05,
        ease: "power2.in",
      })
      .to(overlay, { opacity: 0, duration: 0.3, ease: "power2.in" }, "-=0.12");
  }, [menuOpen]);

  const openMenu = () => {
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const overlay = overlayRef.current;
    const links = mobileLinksRef.current?.querySelectorAll("[data-mobile-link]");
    if (!overlay || !links?.length) return;

    menuTweenRef.current?.kill();
    gsap.set(overlay, { opacity: 0, pointerEvents: "auto" });
    gsap.set(links, { y: 30, opacity: 0 });

    menuTweenRef.current = gsap.timeline();
    menuTweenRef.current
      .to(overlay, { opacity: 1, duration: 0.35, ease: "power2.out" })
      .to(
        links,
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: "power3.out" },
        "-=0.1",
      );

    return () => {
      menuTweenRef.current?.kill();
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMenu]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!visible || hasEnteredRef.current) return;
    hasEnteredRef.current = true;

    const shell = shellRef.current;
    if (!shell) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(shell, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      shell,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
    );
  }, [visible]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !visible) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;

    const update = (scrollY: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const progress = Math.min(Math.max(scrollY / 140, 0), 1);
        gsap.to(panel, {
          scale: 1 - progress * 0.02,
          backgroundColor: `rgba(20, 20, 20, ${0.55 + progress * 0.2})`,
          backdropFilter: `blur(${20 + progress * 6}px)`,
          WebkitBackdropFilter: `blur(${20 + progress * 6}px)`,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    if (lenis) {
      const onScroll = ({ scroll }: { scroll: number }) => update(scroll);
      lenis.on("scroll", onScroll);
      update(lenis.scroll);
      return () => {
        lenis.off("scroll", onScroll);
        cancelAnimationFrame(raf);
      };
    }

    const onScroll = () => update(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    update(window.scrollY);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [lenis, visible]);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const onEnter = () => gsap.to(logo, { scale: 1.03, duration: 0.4, ease: "power2.out" });
    const onLeave = () => gsap.to(logo, { scale: 1, duration: 0.4, ease: "power2.out" });

    logo.addEventListener("mouseenter", onEnter);
    logo.addEventListener("mouseleave", onLeave);
    return () => {
      logo.removeEventListener("mouseenter", onEnter);
      logo.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const onEnter = () =>
      gsap.to(cta, {
        y: -2,
        boxShadow: "0 8px 28px rgba(13, 45, 205, 0.35)",
        duration: 0.3,
        ease: "power2.out",
      });
    const onLeave = () =>
      gsap.to(cta, {
        y: 0,
        boxShadow: "0 2px 12px rgba(13, 45, 205, 0.15)",
        duration: 0.3,
        ease: "power2.out",
      });

    cta.addEventListener("mouseenter", onEnter);
    cta.addEventListener("mouseleave", onLeave);
    return () => {
      cta.removeEventListener("mouseenter", onEnter);
      cta.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <header
        ref={shellRef}
        className="pointer-events-none fixed left-1/2 top-5 z-50 w-[90%] max-w-[1400px] -translate-x-1/2 opacity-0"
        aria-label="Site navigation"
      >
        <div
          ref={panelRef}
          className="pointer-events-auto flex h-14 items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-[rgba(20,20,20,0.55)] px-4 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-[20px] sm:h-[60px] sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]"
          style={{ transformOrigin: "center top" }}
        >
          <Link
            ref={logoRef}
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToAnchor("#hero");
            }}
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="AlphaBlock AI home"
          >
            <Image
              src={assets.logoLight}
              alt="AlphaBlock AI"
              width={132}
              height={28}
              className="h-6 w-auto sm:h-7"
              priority
            />
          </Link>

          <nav
            className="hidden items-center justify-center gap-8 lg:flex"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                onNavigate={(href) => {
                  closeMenu();
                  scrollToAnchor(href);
                }}
              />
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3">
            <a
              ref={ctaRef}
              href="#launch"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                scrollToAnchor("#launch");
              }}
              className="group hidden h-12 items-center gap-2 rounded-2xl bg-[#0D2DCD] px-6 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white shadow-[0_2px_12px_rgba(13,45,205,0.15)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D2DCD]/60 sm:inline-flex"
            >
              Launch Dashboard
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </a>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-white/80 transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
            >
              <Image src={assets.icon} alt="" width={20} height={20} className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-60 bg-[rgba(1,1,1,0.95)] backdrop-blur-xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex h-full flex-col items-center justify-center px-8">
            <div ref={mobileLinksRef} className="flex w-full max-w-sm flex-col items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  data-mobile-link
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    closeMenu();
                    scrollToAnchor(link.href);
                  }}
                  className="font-mono text-2xl uppercase tracking-[0.22em] text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                data-mobile-link
                href="#launch"
                onClick={(e) => {
                  e.preventDefault();
                  closeMenu();
                  scrollToAnchor("#launch");
                }}
                className="mt-4 flex h-12 items-center gap-2 rounded-2xl bg-[#0D2DCD] px-8 font-mono text-xs uppercase tracking-[0.16em] text-white"
              >
                Launch Dashboard ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
