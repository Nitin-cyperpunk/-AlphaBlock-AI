"use client";

import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
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

const SCROLL_COMPACT_AT = 80;

type NavbarProps = {
  visible?: boolean;
};

function NavLink({
  href,
  label,
  onNavigate,
  reducedMotion,
}: {
  href: string;
  label: string;
  onNavigate: (href: string) => void;
  reducedMotion: boolean;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  const onEnter = () => {
    if (reducedMotion || !linkRef.current) return;
    gsap.to(linkRef.current, { y: -2, duration: 0.3, ease: "power2.out" });
    if (underlineRef.current) {
      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.3, ease: "power2.out" },
      );
    }
  };

  const onLeave = () => {
    if (reducedMotion || !linkRef.current) return;
    gsap.to(linkRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
    if (underlineRef.current) {
      gsap.to(underlineRef.current, { scaleX: 0, duration: 0.25, ease: "power2.in" });
    }
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
      className="nav-link relative inline-block text-[13px] font-medium uppercase tracking-[0.08em] text-white/75 focus-visible:outline-none focus-visible:text-white"
    >
      {label}
      <span
        ref={underlineRef}
        aria-hidden
        className="absolute -bottom-1.5 left-0 h-px w-full scale-x-0 bg-white"
        style={{ transformOrigin: "left center" }}
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
  const arrowRef = useRef<SVGSVGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLDivElement>(null);
  const menuTweenRef = useRef<gsap.core.Timeline | null>(null);
  const hasEnteredRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

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
    if (!overlay || !links?.length || reducedMotion) {
      setMenuOpen(false);
      return;
    }

    menuTweenRef.current?.kill();
    menuTweenRef.current = gsap.timeline({ onComplete: () => setMenuOpen(false) });
    menuTweenRef.current
      .to(links, { y: 20, opacity: 0, duration: 0.28, stagger: 0.05, ease: "power2.in" })
      .to(overlay, { opacity: 0, duration: 0.3, ease: "power2.in" }, "-=0.1");
  }, [menuOpen, reducedMotion]);

  const openMenu = () => setMenuOpen(true);

  useEffect(() => {
    if (!menuOpen) return;

    const overlay = overlayRef.current;
    const links = mobileLinksRef.current?.querySelectorAll("[data-mobile-link]");
    if (!overlay || !links?.length) return;

    menuTweenRef.current?.kill();

    if (reducedMotion) {
      gsap.set(overlay, { opacity: 1 });
      gsap.set(links, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(overlay, { opacity: 0, pointerEvents: "auto" });
    gsap.set(links, { y: 20, opacity: 0 });

    menuTweenRef.current = gsap.timeline();
    menuTweenRef.current
      .to(overlay, { opacity: 1, duration: 0.35, ease: "power2.out" })
      .to(links, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: "power3.out" }, "-=0.12");

    return () => {
      menuTweenRef.current?.kill();
    };
  }, [menuOpen, reducedMotion]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!visible || hasEnteredRef.current) return;
    hasEnteredRef.current = true;

    const shell = shellRef.current;
    const logo = logoRef.current;
    if (!shell) return;

    if (reducedMotion) {
      gsap.set(shell, { opacity: 1, y: 0 });
      if (logo) gsap.set(logo, { opacity: 1, y: 0 });
      return;
    }

    if (logo) gsap.set(logo, { opacity: 0, y: -10 });
    gsap
      .timeline()
      .fromTo(
        shell,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" },
      )
      .to(logo, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.55");
  }, [visible, reducedMotion]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !visible) return;

    if (reducedMotion) return;

    let raf = 0;

    const update = (scrollY: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const t = Math.min(Math.max((scrollY - SCROLL_COMPACT_AT) / 48, 0), 1);
        gsap.to(panel, {
          height: 64 - t * 8,
          backgroundColor: `rgba(20, 20, 20, ${0.35 + t * 0.25})`,
          borderColor: `rgba(255, 255, 255, ${0.08 + t * 0.04})`,
          backdropFilter: `blur(${24 + t * 6}px)`,
          WebkitBackdropFilter: `blur(${24 + t * 6}px)`,
          duration: 0.4,
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
  }, [lenis, visible, reducedMotion]);

  useEffect(() => {
    const cta = ctaRef.current;
    const arrow = arrowRef.current;
    if (!cta || reducedMotion) return;

    const onEnter = () => {
      gsap.to(cta, {
        scale: 1.03,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderColor: "rgba(255, 255, 255, 0.25)",
        boxShadow: "0 0 24px rgba(13, 45, 205, 0.15)",
        duration: 0.3,
        ease: "power2.out",
      });
      if (arrow) gsap.to(arrow, { x: 4, duration: 0.3, ease: "power2.out" });
    };

    const onLeave = () => {
      gsap.to(cta, {
        scale: 1,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        borderColor: "rgba(255, 255, 255, 0.12)",
        boxShadow: "0 0 0 rgba(13, 45, 205, 0)",
        duration: 0.3,
        ease: "power2.out",
      });
      if (arrow) gsap.to(arrow, { x: 0, duration: 0.3, ease: "power2.out" });
    };

    cta.addEventListener("mouseenter", onEnter);
    cta.addEventListener("mouseleave", onLeave);
    return () => {
      cta.removeEventListener("mouseenter", onEnter);
      cta.removeEventListener("mouseleave", onLeave);
    };
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <>
      <header
        ref={shellRef}
        className="nav-shell pointer-events-none fixed left-1/2 top-5 z-50 w-[min(1280px,calc(100%-48px))] -translate-x-1/2 opacity-0"
        aria-label="Site navigation"
      >
        <div
          ref={panelRef}
          className="nav-panel pointer-events-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[999px] border border-white/[0.08] bg-[rgba(20,20,20,0.35)] px-5 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)]"
        >
          <a
            ref={logoRef}
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToAnchor("#hero");
            }}
            className="flex items-center opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="AlphaBlock AI home"
          >
            <Image
              src={assets.logoLight}
              alt="AlphaBlock AI"
              width={140}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </a>

          <nav
            className="hidden items-center justify-center gap-10 lg:flex"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                reducedMotion={reducedMotion}
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
              className="nav-cta hidden h-11 items-center gap-2 rounded-[999px] border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:inline-flex"
            >
              Launch App
              <ArrowUpRight ref={arrowRef} className="h-4 w-4" strokeWidth={2} aria-hidden />
            </a>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white/80 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[60] bg-[#010101] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            type="button"
            className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X className="h-5 w-5" />
          </button>

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
                  className="text-[13px] font-medium uppercase tracking-[0.08em] text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
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
                className="nav-cta mt-4 inline-flex h-11 items-center gap-2 rounded-[999px] border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white"
              >
                Launch App
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
