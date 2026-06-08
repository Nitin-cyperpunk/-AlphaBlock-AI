"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/context/LenisContext";
import { INTELLIGENCE_CHAPTERS } from "@/lib/intelligence-chapters";
import { INTEL_NAV_TARGETS, intelT } from "@/lib/product-scroll-phases";

gsap.registerPlugin(ScrollTrigger);

type IntelligenceSideNavProps = {
  navRef: React.RefObject<HTMLElement | null>;
  itemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
};

export function IntelligenceSideNav({ navRef, itemRefs }: IntelligenceSideNavProps) {
  const lenis = useLenis();

  const scrollToChapter = (chapterId: string) => {
    const local = INTEL_NAV_TARGETS[chapterId];
    if (local === undefined) return;

    const st = ScrollTrigger.getById("product-experience");
    if (!st) return;

    const target = st.start + (st.end - st.start) * intelT(local);

    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
      return;
    }

    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <nav ref={navRef} className="intel-side-nav" aria-label="Intelligence features">
      <ul className="intel-side-nav__list">
        {INTELLIGENCE_CHAPTERS.map((chapter, index) => (
          <li key={chapter.id}>
            <button
              type="button"
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="intel-side-nav__item"
              onClick={() => scrollToChapter(chapter.id)}
            >
              <span className="intel-side-nav__indicator" aria-hidden />
              {chapter.navLabel}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
