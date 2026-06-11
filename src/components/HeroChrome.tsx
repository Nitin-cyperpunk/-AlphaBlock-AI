"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroGlassCTA } from "@/components/HeroGlassCTA";
import { assets } from "@/lib/assets";
import { APP_URL, EXTERNAL_LINK_PROPS } from "@/lib/urls";

gsap.registerPlugin(ScrollTrigger);

type HeroChromeProps = {
  visible?: boolean;
};

/** Fixed logo + Launch App — wordmark on hero, Light_Favicon on light sections */
export function HeroChrome({ visible = false }: HeroChromeProps) {
  const [onLightSurface, setOnLightSurface] = useState(false);

  useEffect(() => {
    const product = document.getElementById("product");
    if (!product) return;

    const trigger = ScrollTrigger.create({
      trigger: product,
      start: "top 72px",
      onEnter: () => setOnLightSurface(true),
      onLeaveBack: () => setOnLightSurface(false),
    });

    return () => trigger.kill();
  }, []);

  return (
    <header
      className={`hero-chrome${visible ? " hero-chrome--visible" : ""}${onLightSurface ? " hero-chrome--on-light" : ""}`}
      aria-label="Site header"
    >
      <a href="#hero" className="hero-chrome-logo shrink-0" aria-label="AlphaBlock AI home">
        <Image
          src={onLightSurface ? assets.faviconLight : assets.logoLight}
          alt=""
          width={onLightSurface ? 40 : 160}
          height={onLightSurface ? 40 : 48}
          priority
          className={
            onLightSurface
              ? "hero-chrome-logo__img h-9 w-9 rounded-[10px] object-contain sm:h-10 sm:w-10"
              : "hero-chrome-logo__img h-auto w-[clamp(84px,19vw,124px)] object-contain object-left"
          }
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
