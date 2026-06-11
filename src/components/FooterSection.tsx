"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Copy, Check } from "lucide-react";
import { assets } from "@/lib/assets";
import {
  FOOTER_ASCII_RESIDUE,
  FOOTER_CHANNEL_LINKS,
  FOOTER_CONTRACT,
  FOOTER_NETWORK_EDGES,
  FOOTER_NETWORK_MOBILE_INDICES,
  FOOTER_NETWORK_NODES,
  FOOTER_PRODUCT_LINKS,
  FOOTER_SOCIAL,
  FOOTER_TOKEN_LINKS,
  truncateContract,
  truncateContractMobile,
} from "@/lib/footer-content";
import { EXTERNAL_LINK_PROPS } from "@/lib/urls";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_SCRUB = 1.1;

const MOTION_PRESETS = {
  desktop: { y: 200, scale: 0.96, blur: 10, opacity: 0.9 },
  tablet: { y: 120, scale: 0.98, blur: 6, opacity: 0.92 },
  mobile: { y: 60, scale: 0.99, blur: 0, opacity: 0.95 },
} as const;

function FooterSocialIcon({ icon }: { icon: (typeof FOOTER_SOCIAL)[number]["icon"] }) {
  const cls = "footer-social__icon";
  switch (icon) {
    case "x":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "telegram":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case "discord":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.2252 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
  }
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div data-reveal className="footer-column">
      <p className="footer-column__title">{title}</p>
      <ul className="footer-column__list">
        {links.map((link) => {
          const external = link.href.startsWith("http");
          return (
            <li key={link.label}>
              <a
                href={link.href}
                className="footer-column__link"
                {...(external ? EXTERNAL_LINK_PROPS : {})}
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FooterNetwork({
  mobile,
  networkRef,
}: {
  mobile: boolean;
  networkRef?: RefObject<SVGGElement | null>;
}) {
  const mobileIndexSet = useMemo(() => new Set<number>(FOOTER_NETWORK_MOBILE_INDICES), []);

  const edges = useMemo(() => {
    if (!mobile) return FOOTER_NETWORK_EDGES;
    return FOOTER_NETWORK_EDGES.filter(([a, b]) => mobileIndexSet.has(a) && mobileIndexSet.has(b));
  }, [mobile, mobileIndexSet]);

  const nodes = useMemo(() => {
    if (!mobile) return FOOTER_NETWORK_NODES.map((n, i) => ({ ...n, i }));
    return FOOTER_NETWORK_MOBILE_INDICES.map((i) => ({ ...FOOTER_NETWORK_NODES[i]!, i }));
  }, [mobile]);

  return (
    <svg
      className={`footer-network pointer-events-none absolute inset-0 h-full w-full ${
        mobile ? "footer-network--sparse" : "footer-network--dense"
      }`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g ref={networkRef} className="footer-network__group">
        {edges.map(([a, b], idx) => {
          const na = FOOTER_NETWORK_NODES[a]!;
          const nb = FOOTER_NETWORK_NODES[b]!;
          return (
            <line
              key={`e-${idx}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className="footer-network__edge"
            />
          );
        })}
        {nodes.map((n) => (
          <circle key={`n-${n.i}`} cx={n.x} cy={n.y} r="0.35" className="footer-network__node" />
        ))}
      </g>
    </svg>
  );
}

export default function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardMotionRef = useRef<HTMLDivElement>(null);
  const cardBlurRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<SVGGElement>(null);
  const [copied, setCopied] = useState(false);

  const copyContract = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(FOOTER_CONTRACT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const cardMotion = cardMotionRef.current;
    const cardBlur = cardBlurRef.current;
    const divider = dividerRef.current;
    const bloom = bloomRef.current;
    const cols = colsRef.current;
    if (!section || !cardMotion || !cardBlur || !divider || !bloom || !cols) return;

    const blocks = Array.from(cols.querySelectorAll<HTMLElement>("[data-reveal]"));
    const contractBlock = section.querySelector<HTMLElement>("[data-reveal-contract]");
    const copyrightBlock = section.querySelector<HTMLElement>("[data-reveal-copyright]");

    const setResting = () => {
      gsap.set(cardMotion, { y: 0, scale: 1, clearProps: "transform" });
      gsap.set(cardBlur, { "--footer-blur": 0, opacity: 1 });
      gsap.set(divider, { scaleX: 1 });
      gsap.set(bloom, { opacity: 1, scale: 1 });
      gsap.set(blocks, { opacity: 1, y: 0 });
      if (contractBlock) gsap.set(contractBlock, { opacity: 1, y: 0 });
      if (copyrightBlock) gsap.set(copyrightBlock, { opacity: 1, y: 0 });
    };

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        isDesktop: "(min-width: 1024px)",
        isTablet: "(min-width: 768px) and (max-width: 1023px)",
        isMobile: "(max-width: 767px)",
      },
      (context) => {
        const { reduce, isDesktop, isTablet } = context.conditions as {
          reduce: boolean;
          isDesktop: boolean;
          isTablet: boolean;
        };

        if (reduce) {
          setResting();
          return;
        }

        const preset = isDesktop
          ? MOTION_PRESETS.desktop
          : isTablet
          ? MOTION_PRESETS.tablet
          : MOTION_PRESETS.mobile;

        gsap.set(divider, { scaleX: 0, transformOrigin: "center center" });
        gsap.set(bloom, { opacity: 0, scale: 0.6 });
        gsap.set(blocks, { opacity: 0, y: isDesktop ? 10 : 6 });
        if (contractBlock) gsap.set(contractBlock, { opacity: 0, y: 6 });
        if (copyrightBlock) gsap.set(copyrightBlock, { opacity: 0, y: 4 });
        gsap.set(cardMotion, {
          y: preset.y,
          scale: preset.scale,
          transformOrigin: "50% 82%",
          force3D: true,
        });
        gsap.set(cardBlur, { "--footer-blur": preset.blur, opacity: preset.opacity });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: isDesktop ? "top bottom" : "top bottom+=5%",
            end: isDesktop ? "top 30%" : "top 35%",
            scrub: isDesktop ? FOOTER_SCRUB : 0.85,
            invalidateOnRefresh: true,
          },
          defaults: { ease: "none" },
        });

        tl.fromTo(
          cardMotion,
          { y: preset.y, scale: preset.scale },
          { y: 0, scale: 1, duration: 1, ease: "power2.inOut" },
          0,
        );

        tl.fromTo(
          cardBlur,
          { "--footer-blur": preset.blur, opacity: preset.opacity },
          { "--footer-blur": 0, opacity: 1, duration: 0.78, ease: "power2.out" },
          0,
        );

        tl.fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.38, ease: "power2.out" }, 0.14);

        tl.fromTo(
          bloom,
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: 0.42, ease: "power2.out" },
          0.1,
        );

        tl.fromTo(
          blocks,
          { opacity: 0, y: isDesktop ? 10 : 6 },
          { opacity: 1, y: 0, duration: 0.32, stagger: 0.05, ease: "power2.out" },
          0.22,
        );

        if (contractBlock) {
          tl.fromTo(
            contractBlock,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
            0.5,
          );
        }

        if (copyrightBlock) {
          tl.fromTo(
            copyrightBlock,
            { opacity: 0, y: 4 },
            { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" },
            0.58,
          );
        }
      },
    );

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="footer"
      aria-label="Site footer"
      className="footer-section footer-card-shell relative w-full overflow-x-hidden text-[#111827]"
    >
      <div className="footer-card-surface pointer-events-none absolute inset-0" aria-hidden>
        <pre className="footer-ascii footer-ascii--desktop">{FOOTER_ASCII_RESIDUE.repeat(8)}</pre>
        <pre className="footer-ascii footer-ascii--mobile">{FOOTER_ASCII_RESIDUE.repeat(2)}</pre>
        <div className="footer-dot-grid absolute inset-0" />
        <FooterNetwork mobile={false} networkRef={networkRef} />
        <FooterNetwork mobile />
        <div className="footer-rise-glow absolute inset-0" />
        <div className="footer-section__seam absolute inset-x-0 top-0" />
      </div>

      <div ref={cardMotionRef} className="footer-card-motion footer-container relative z-10">
        <div ref={cardBlurRef} className="footer-card-blur w-full min-w-0">
          <div className="footer-divider-wrap relative">
            <div ref={dividerRef} className="footer-divider h-px w-full" />
            <div
              ref={bloomRef}
              className="footer-divider-bloom pointer-events-none absolute"
              aria-hidden
            />
          </div>

          <div ref={colsRef} className="footer-grid">
            <div data-reveal className="footer-brand">
              <a
                href="#hero"
                className="footer-brand__logo inline-block"
                aria-label="AlphaBlock home"
              >
                <Image
                  src={assets.logoDark}
                  alt=""
                  width={160}
                  height={50}
                  className="footer-brand__logo-img h-auto w-auto max-w-full object-contain"
                  priority={false}
                />
              </a>
              <p className="footer-brand__tagline">
                The personalised intelligence layer for on-chain traders.
              </p>
              <div className="footer-social" role="list">
                {FOOTER_SOCIAL.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="footer-social__link"
                    aria-label={item.label}
                    role="listitem"
                    {...EXTERNAL_LINK_PROPS}
                  >
                    <FooterSocialIcon icon={item.icon} />
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-columns">
              <FooterLinkColumn title="PRODUCT" links={FOOTER_PRODUCT_LINKS} />
              <FooterLinkColumn title="CHANNELS" links={FOOTER_CHANNEL_LINKS} />
              <FooterLinkColumn title="TOKEN" links={FOOTER_TOKEN_LINKS} />
            </div>

            <div data-reveal-contract className="footer-contract-block">
              <span className="footer-contract__label">$ALPHA CONTRACT</span>
              <button
                type="button"
                onClick={copyContract}
                className="footer-contract__btn group"
                title={FOOTER_CONTRACT}
              >
                <span className="footer-contract__text footer-contract__text--desktop">
                  {truncateContract(FOOTER_CONTRACT)}
                </span>
                <span className="footer-contract__text footer-contract__text--mobile">
                  {truncateContractMobile(FOOTER_CONTRACT)}
                </span>
                {copied ? (
                  <Check className="footer-contract__icon shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Copy
                    className="footer-contract__icon shrink-0 opacity-45 group-hover:opacity-85"
                    aria-hidden
                  />
                )}
                <span className="sr-only">Copy contract address</span>
              </button>
            </div>

            <p data-reveal-copyright className="footer-copyright">
              © 2026 AlphaBlock. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
