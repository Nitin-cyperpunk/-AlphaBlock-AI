"use client";

import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { HeroGlassCTA } from "@/components/HeroGlassCTA";
import { assets } from "@/lib/assets";
import { APP_URL, EXTERNAL_LINK_PROPS } from "@/lib/urls";
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLDivElement>(null);
  const menuTweenRef = useRef<gsap.core.Timeline | null>(null);
  const hasEnteredRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showDesktopCta, setShowDesktopCta] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setShowDesktopCta(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
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

    if (logo) gsap.set(logo, { opacity: 0, y: -8 });
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .fromTo(
        shell,
        { opacity: 0, y: -22 },
        { opacity: 1, y: 0, duration: 0.55 },
      )
      .to(logo, { opacity: 1, y: 0, duration: 0.5 }, "-=0.42");
  }, [visible, reducedMotion]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !visible) return;

    if (reducedMotion) return;

    const progress = { t: 0 };

    const applyPanel = () => {
      const t = progress.t;
      const baseHeight = window.innerWidth < 1024 ? 48 : 64;
      gsap.set(panel, {
        height: baseHeight - t * 8,
        backgroundColor: `rgba(255, 255, 255, ${0.05 + t * 0.04})`,
        borderColor: `rgba(255, 255, 255, ${0.14 + t * 0.06})`,
      });
    };

    const quickCompact = gsap.quickTo(progress, "t", {
      duration: 0.3,
      ease: "power3.out",
      onUpdate: applyPanel,
    });

    const update = (scrollY: number) => {
      const t = Math.min(Math.max((scrollY - SCROLL_COMPACT_AT) / 48, 0), 1);
      quickCompact(t);
    };

    if (lenis) {
      const onScroll = ({ scroll }: { scroll: number }) => update(scroll);
      lenis.on("scroll", onScroll);
      update(lenis.scroll);
      return () => {
        lenis.off("scroll", onScroll);
        quickCompact.tween?.kill();
      };
    }

    const onScroll = () => update(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    update(window.scrollY);
    return () => {
      window.removeEventListener("scroll", onScroll);
      quickCompact.tween?.kill();
    };
  }, [lenis, visible, reducedMotion]);

  if (!visible) return null;

  return (
    <>
      <header
        ref={shellRef}
        className="nav-shell pointer-events-none fixed left-1/2 top-4 z-50 w-[calc(100%-24px)] -translate-x-1/2 opacity-0 sm:top-5 sm:w-[min(1280px,calc(100%-40px))]"
        aria-label="Site navigation"
      >
        <div
          ref={panelRef}
          className="nav-panel pointer-events-auto grid h-12 grid-cols-[1fr_auto] items-center gap-2 rounded-[999px] border px-3 sm:h-16 sm:px-5 lg:grid-cols-[1fr_auto_1fr]"
        >
          <a
            ref={logoRef}
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToAnchor("#hero");
            }}
            className="nav-brand flex w-auto min-w-0 items-center gap-0 opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent lg:gap-2.5"
            aria-label="AlphaBlock AI home"
          >
            <Image
              src={assets.icon}
              alt=""
              width={40}
              height={40}
              className="nav-brand__mark h-8 w-8 shrink-0 rounded-[8px] object-contain sm:h-9 sm:w-9 sm:rounded-[10px] lg:h-10 lg:w-10"
              priority
            />
            <span className="nav-brand__name hidden min-w-0 truncate leading-none lg:inline">
              <span className="font-semibold tracking-[-0.02em] text-white">AlphaBlock</span>
              <span className="font-display italic text-white/85"> AI</span>
            </span>
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
            {showDesktopCta && (
              <HeroGlassCTA
                href={APP_URL}
                variant="primary"
                compact
                {...EXTERNAL_LINK_PROPS}
              >
                Launch App
              </HeroGlassCTA>
            )}

            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/4 text-white/80 transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:hidden"
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
              <HeroGlassCTA
                href={APP_URL}
                variant="primary"
                compact
                className="mt-4"
                data-mobile-link
                {...EXTERNAL_LINK_PROPS}
                onClick={() => closeMenu()}
              >
                Launch App
              </HeroGlassCTA>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
