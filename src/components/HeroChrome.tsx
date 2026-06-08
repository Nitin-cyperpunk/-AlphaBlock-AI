"use client";

import Image from "next/image";
import { HeroGlassCTA } from "@/components/HeroGlassCTA";
import { assets } from "@/lib/assets";
import { APP_URL, EXTERNAL_LINK_PROPS } from "@/lib/urls";

type HeroChromeProps = {
  visible?: boolean;
};

/** Logo top-left, Launch App top-right — no shared navbar bar */
export function HeroChrome({ visible = false }: HeroChromeProps) {
  return (
    <header
      className={`hero-chrome${visible ? " hero-chrome--visible" : ""}`}
      aria-label="Site header"
    >
      <a href="#hero" className="hero-chrome-logo shrink-0" aria-label="AlphaBlock AI home">
        <Image
          src={assets.logoLight}
          alt=""
          width={160}
          height={48}
          priority
          className="hero-chrome-logo__img h-auto w-[clamp(84px,19vw,124px)] object-contain object-left"
        />
      </a>

      <HeroGlassCTA
        href={APP_URL}
        variant="primary"
        compact
        className="hero-chrome-cta shrink-0"
        {...EXTERNAL_LINK_PROPS}
      >
        Launch App
      </HeroGlassCTA>
    </header>
  );
}
