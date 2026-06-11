"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Laptop } from "@/components/Laptop";
import { Phone } from "@/components/Phone";
import {
  buildSetupAtmosphere,
  renderSetupAtmosphere,
  stepSetupAtmosphere,
} from "@/lib/setup-atmosphere";
import {
  SETUP_STORY_CHAPTERS,
  STORY_ENTER_DUR,
  STORY_EXIT_DUR,
} from "@/lib/setup-story";
import { TelegramChat } from "@/components/TelegramChat";
import { LiquidGlassPanel } from "@/components/LiquidGlassPanel";
import { IntelligenceSideNav } from "@/components/IntelligenceSideNav";
import {
  DEVICE_PHASE,
} from "@/lib/setup-device-phases";
import {
  INTEL_PHASE,
  PRODUCT_SCROLL_END,
  PRODUCT_SCRUB,
  intelT,
  setupT,
} from "@/lib/product-scroll-phases";

gsap.registerPlugin(ScrollTrigger);

type SetupAtmosphereProps = {
  noiseRef: React.RefObject<HTMLDivElement | null>;
  glowRef: React.RefObject<HTMLDivElement | null>;
  beamsRef: React.RefObject<HTMLDivElement | null>;
  asciiRef: React.RefObject<HTMLCanvasElement | null>;
  depthRef: React.RefObject<HTMLCanvasElement | null>;
  dimRef: React.RefObject<HTMLDivElement | null>;
  spotlightRef: React.RefObject<HTMLDivElement | null>;
};

function SetupAtmosphere({
  noiseRef,
  glowRef,
  beamsRef,
  asciiRef,
  depthRef,
  dimRef,
  spotlightRef,
}: SetupAtmosphereProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#F8F9FB]">
      <div className="setup-atmo-base absolute inset-0" aria-hidden />
      <div className="setup-atmo-grid absolute inset-0" aria-hidden />
      <div ref={noiseRef} className="setup-atmo-noise absolute inset-0" aria-hidden />
      <div ref={glowRef} className="setup-atmo-glow absolute" aria-hidden />
      <div ref={beamsRef} className="setup-atmo-beams absolute inset-0" aria-hidden />
      <canvas ref={asciiRef} className="setup-atmo-ascii absolute inset-0 h-full w-full" aria-hidden />
      <canvas ref={depthRef} className="setup-atmo-depth absolute inset-0 h-full w-full" aria-hidden />
      <div aria-hidden className="setup-atmo-vignette absolute inset-0" />
      <div ref={dimRef} aria-hidden className="setup-atmo-dim absolute inset-0 opacity-0" />
      <div ref={spotlightRef} className="setup-atmo-spotlight absolute inset-0 opacity-0" aria-hidden />
    </div>
  );
}

export default function SetupSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const devicesStageRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const chapterInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const laptopRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const laptopScreenARef = useRef<HTMLDivElement>(null);
  const laptopScreenBRef = useRef<HTMLDivElement>(null);
  const screenGlowRef = useRef<HTMLDivElement>(null);
  const phonePortraitRef = useRef<HTMLDivElement>(null);
  const phonePortraitAltRef = useRef<HTMLDivElement>(null);
  const phoneLandscapeRef = useRef<HTMLDivElement>(null);
  const phoneLandscapeRotatorRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const beamsRef = useRef<HTMLDivElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
  const depthCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgDimRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const footerHandoffRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const telegramRef = useRef<HTMLDivElement>(null);
  const telegramFeedRef = useRef<HTMLDivElement>(null);
  const telegramMessageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const typingRef = useRef<HTMLDivElement>(null);
  const userMessageRef = useRef<HTMLDivElement>(null);
  const aiResponseRef = useRef<HTMLDivElement>(null);
  const intelUiRef = useRef<HTMLDivElement>(null);
  const sideNavRef = useRef<HTMLElement>(null);
  const sideNavItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const glassPanelRef = useRef<HTMLDivElement>(null);
  const glassPanelSlideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cameraStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const devicesStage = devicesStageRef.current;
    const story = storyRef.current;
    const chapters = chapterInnerRefs.current.filter(Boolean) as HTMLDivElement[];
    const laptop = laptopRef.current;
    const phone = phoneRef.current;
    const lid = lidRef.current;
    const screen = screenRef.current;
    const laptopScreenA = laptopScreenARef.current;
    const laptopScreenB = laptopScreenBRef.current;
    const screenGlow = screenGlowRef.current;
    const phonePortrait = phonePortraitRef.current;
    const phonePortraitAlt = phonePortraitAltRef.current;
    const phoneLandscape = phoneLandscapeRef.current;
    const phoneLandscapeRotator = phoneLandscapeRotatorRef.current;
    const shadow = shadowRef.current;
    const noise = noiseRef.current;
    const glow = glowRef.current;
    const beams = beamsRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    const depthCanvas = depthCanvasRef.current;
    const bgDim = bgDimRef.current;
    const spotlight = spotlightRef.current;
    const telegramLayer = telegramRef.current;
    const telegramFeed = telegramFeedRef.current;
    const typing = typingRef.current;
    const userMessage = userMessageRef.current;
    const aiResponse = aiResponseRef.current;
    const intelUi = intelUiRef.current;
    const sideNav = sideNavRef.current;
    const glassPanel = glassPanelRef.current;
    const cameraStage = cameraStageRef.current;
    const telegramMessages = telegramMessageRefs.current.filter(Boolean) as HTMLDivElement[];
    const glassSlides = glassPanelSlideRefs.current.filter(Boolean) as HTMLDivElement[];
    const navItems = sideNavItemRefs.current.filter(Boolean) as HTMLButtonElement[];

    if (
      !section ||
      !devicesStage ||
      !story ||
      chapters.length !== SETUP_STORY_CHAPTERS.length ||
      !laptop ||
      !phone ||
      !lid ||
      !screen ||
      !laptopScreenA ||
      !laptopScreenB ||
      !screenGlow ||
      !phonePortrait ||
      !phonePortraitAlt ||
      !phoneLandscape ||
      !phoneLandscapeRotator ||
      !shadow ||
      !noise ||
      !glow ||
      !beams ||
      !asciiCanvas ||
      !depthCanvas ||
      !bgDim ||
      !spotlight ||
      !telegramLayer ||
      !telegramFeed ||
      !typing ||
      !userMessage ||
      !aiResponse ||
      !intelUi ||
      !sideNav ||
      !glassPanel ||
      !cameraStage ||
      telegramMessages.length < 4 ||
      glassSlides.length < 5 ||
      navItems.length < 5
    ) {
      return;
    }

    const asciiCtx = asciiCanvas.getContext("2d", { alpha: true });
    const depthCtx = depthCanvas.getContext("2d", { alpha: true });
    if (!asciiCtx || !depthCtx) return;

    let atmo = buildSetupAtmosphere(window.innerWidth, window.innerHeight);
    let atmoRaf = 0;
    let lastAtmo = performance.now();

    const resizeAtmo = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (const c of [asciiCanvas, depthCanvas]) {
        c.width = Math.floor(w * dpr);
        c.height = Math.floor(h * dpr);
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
      }
      asciiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      depthCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      atmo = buildSetupAtmosphere(w, h);
    };

    resizeAtmo();
    window.addEventListener("resize", resizeAtmo);

    const atmoLoop = (now: number) => {
      atmoRaf = requestAnimationFrame(atmoLoop);
      const dt = Math.min((now - lastAtmo) / 16.67, 2);
      lastAtmo = now;
      const w = window.innerWidth;
      const h = window.innerHeight;
      stepSetupAtmosphere(atmo, w, h, dt, scrollProgressRef.current);
      renderSetupAtmosphere(asciiCtx, depthCtx, atmo, w, h);
    };
    atmoRaf = requestAnimationFrame(atmoLoop);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isTablet: "(min-width: 768px) and (max-width: 1023px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isDesktop, isMobile } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
          };

          const perspective = isMobile ? 1000 : isDesktop ? 1600 : 1300;
          const deviceOffsetX = isDesktop ? 110 : isMobile ? 0 : 60;

          const phoneStartX = isMobile ? 0 : isDesktop ? 320 : 220;
          const phoneStartY = isMobile ? 100 : isDesktop ? 20 : 32;
          const phoneRotateStart = isMobile ? 0 : isDesktop ? 18 : 12;
          const phoneScaleBeside = isMobile ? 1.1 : isDesktop ? 1.15 : 1.05;

          const dur = {
            intro: setupT(DEVICE_PHASE.introEnd),
            showcase: setupT(DEVICE_PHASE.showcaseEnd - DEVICE_PHASE.introEnd),
            lidClose: setupT(DEVICE_PHASE.lidCloseEnd - DEVICE_PHASE.showcaseEnd),
            laptopExit: setupT(DEVICE_PHASE.laptopExitEnd - DEVICE_PHASE.lidCloseEnd),
            mobileEntry: setupT(DEVICE_PHASE.mobileEntryEnd - DEVICE_PHASE.laptopExitEnd),
            centerHold: setupT(DEVICE_PHASE.centerHoldEnd - DEVICE_PHASE.mobileEntryEnd),
            rotate: setupT(DEVICE_PHASE.rotateEnd - DEVICE_PHASE.centerHoldEnd),
          };

          const storyEnter = STORY_ENTER_DUR * setupT(1);
          const storyExit = STORY_EXIT_DUR * setupT(1);
          const msgDur = 0.028;

          const phoneCenterScale = isMobile ? 1.25 : isDesktop ? 1.45 : 1.35;
          const phoneRotateScale = phoneCenterScale * 1.1;
          const phoneIntelScale = isMobile
            ? phoneCenterScale * 1.08
            : isDesktop
              ? phoneCenterScale * 1.16
              : phoneCenterScale * 1.12;
          const phoneIntelX = isDesktop ? -28 : isMobile ? 0 : -16;

          gsap.set(devicesStage, { x: deviceOffsetX, force3D: true });
          gsap.set(laptop, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            scale: 0.88,
            opacity: 0,
            rotateX: 0,
            z: 0,
            transformOrigin: "50% 50%",
            transformPerspective: perspective,
            force3D: true,
          });

          const lidClosed = 90;
          const lidOpen = isMobile ? -6 : isDesktop ? -10 : -8;

          gsap.set(lid, {
            rotateX: lidClosed,
            transformOrigin: "50% 100%",
            transformPerspective: perspective,
            force3D: true,
          });
          gsap.set(screen, { opacity: 0 });
          gsap.set(laptopScreenA, { opacity: 1 });
          gsap.set(laptopScreenB, { opacity: 0 });
          gsap.set(screenGlow, { opacity: 0 });
          gsap.set(shadow, { opacity: 0, scale: 0.75 });
          gsap.set(phonePortrait, { opacity: 1 });
          gsap.set(phonePortraitAlt, { opacity: 0 });
          gsap.set(phoneLandscape, { opacity: 0 });
          gsap.set(phoneLandscapeRotator, {
            xPercent: -50,
            yPercent: -50,
            rotateZ: 90,
            transformOrigin: "50% 50%",
            force3D: true,
          });

          gsap.set(phone, {
            xPercent: -50,
            yPercent: -50,
            x: phoneStartX,
            y: phoneStartY,
            scale: phoneScaleBeside,
            rotateY: phoneRotateStart,
            rotateX: 0,
            rotateZ: 0,
            opacity: 0,
            transformOrigin: "50% 50%",
            transformPerspective: perspective,
            force3D: true,
          });

          gsap.set([noise, glow, beams, asciiCanvas, depthCanvas], { force3D: true });
          gsap.set(bgDim, { opacity: 0 });
          gsap.set(spotlight, { opacity: 0 });

          gsap.set(intelUi, { autoAlpha: 0, pointerEvents: "none" });
          gsap.set(sideNav, { x: -72, force3D: true });
          gsap.set(glassPanel, { x: 120, y: 24, opacity: 1, visibility: "visible", force3D: true });
          gsap.set(telegramLayer, { opacity: 0 });
          gsap.set(cameraStage, { scale: 1, transformOrigin: "50% 50%", force3D: true });

          telegramMessages.forEach((el) => gsap.set(el, { autoAlpha: 0, y: 14, force3D: true }));
          gsap.set(typing, { autoAlpha: 0 });
          gsap.set(userMessage, { autoAlpha: 0, y: 14, force3D: true });
          gsap.set(aiResponse, { autoAlpha: 0, y: 14, force3D: true });
          gsap.set(telegramFeed, { scrollTop: 0 });

          glassSlides.forEach((slide, index) => {
            gsap.set(slide, { autoAlpha: index === 0 ? 0 : 0, visibility: "hidden" });
          });
          navItems.forEach((item) => item.classList.remove("intel-side-nav__item--active"));

          chapters.forEach((el, index) => {
            if (index === 0) {
              gsap.set(el, { autoAlpha: 1, x: 0, force3D: true });
              return;
            }
            gsap.set(el, { autoAlpha: 0, x: -80, force3D: true });
          });

          let laptopFloat: gsap.core.Tween | null = null;
          let phoneFloat: gsap.core.Tween | null = null;
          const showcaseFloatStart = setupT(DEVICE_PHASE.introEnd) + dur.showcase * 0.15;
          const lidCloseStart = setupT(DEVICE_PHASE.showcaseEnd);
          const intelFloatStart = intelT(INTEL_PHASE.handoffEnd);

          const timeline = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              id: "product-experience",
              trigger: section,
              start: "top top",
              end: PRODUCT_SCROLL_END,
              pin: true,
              pinSpacing: true,
              scrub: PRODUCT_SCRUB,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                scrollProgressRef.current = self.progress;
                const p = self.progress;

                if (p >= showcaseFloatStart && p < lidCloseStart) {
                  if (!laptopFloat) {
                    laptopFloat = gsap.to(laptop, {
                      y: -8,
                      duration: 3,
                      ease: "sine.inOut",
                      yoyo: true,
                      repeat: -1,
                    });
                  }
                } else if (laptopFloat) {
                  laptopFloat.kill();
                  laptopFloat = null;
                  if (p >= lidCloseStart) {
                    gsap.set(laptop, { y: 0 });
                  }
                }

                if (p >= intelFloatStart) {
                  if (!phoneFloat) {
                    phoneFloat = gsap.fromTo(
                      phone,
                      { y: -5 },
                      {
                        y: 5,
                        duration: 4,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: -1,
                      },
                    );
                  }
                } else if (phoneFloat) {
                  phoneFloat.kill();
                  phoneFloat = null;
                  gsap.set(phone, { y: 0 });
                }

                const activeNav =
                  p >= intelT(INTEL_PHASE.surgeEnd)
                    ? 4
                    : p >= intelT(INTEL_PHASE.clusterEnd)
                      ? 3
                      : p >= intelT(INTEL_PHASE.whaleEnd)
                        ? 2
                        : p >= intelT(INTEL_PHASE.kolEnd)
                          ? 1
                          : p >= intelT(INTEL_PHASE.handoffEnd)
                            ? 0
                            : -1;

                navItems.forEach((item, index) => {
                  item.classList.toggle("intel-side-nav__item--active", index === activeNav);
                });
              },
              onLeave: () => requestAnimationFrame(() => ScrollTrigger.refresh()),
              onEnterBack: () => requestAnimationFrame(() => ScrollTrigger.refresh()),
            },
          });

          timeline.to(glow, { yPercent: 10, duration: 1, ease: "none" }, 0);
          timeline.to(beams, { yPercent: 12, duration: 1, ease: "none" }, 0);
          timeline.to(asciiCanvas, { yPercent: 20, duration: 1, ease: "none" }, 0);
          timeline.to(depthCanvas, { yPercent: 30, duration: 1, ease: "none" }, 0);

          SETUP_STORY_CHAPTERS.forEach((chapter, index) => {
            const el = chapters[index];
            if (!el) return;

            if (index > 0) {
              timeline.fromTo(
                el,
                { autoAlpha: 0, x: -80 },
                {
                  autoAlpha: 1,
                  x: 0,
                  duration: storyEnter,
                  ease: "power3.out",
                },
                setupT(chapter.start),
              );
            }

            if (index < SETUP_STORY_CHAPTERS.length - 1) {
              timeline.to(
                el,
                {
                  autoAlpha: 0,
                  x: -40,
                  duration: storyExit,
                  ease: "power2.in",
                },
                setupT(chapter.end) - storyExit,
              );
            }
          });

          /* Phase 1 — intro */
          timeline.to(laptop, { opacity: 1, scale: 1, duration: dur.intro, ease: "power2.out" }, 0);
          timeline.to(
            phone,
            { opacity: 1, duration: dur.intro, ease: "power2.out" },
            0,
          );
          timeline.to(shadow, { opacity: isMobile ? 0.3 : 0.45, scale: 0.9, duration: dur.intro }, 0);

          /* Phase 2 — showcase (lid opens, screens crossfade, laptop float) */
          const showcaseStart = setupT(DEVICE_PHASE.introEnd);

          timeline.to(
            lid,
            { rotateX: lidOpen, duration: dur.showcase * 0.5, ease: "power2.inOut" },
            showcaseStart,
          );
          timeline.to(
            screen,
            { opacity: 1, duration: dur.showcase * 0.35, ease: "power2.inOut" },
            showcaseStart + dur.showcase * 0.1,
          );
          timeline.to(
            screenGlow,
            { opacity: 0.85, duration: dur.showcase * 0.35, ease: "power1.inOut" },
            showcaseStart + dur.showcase * 0.12,
          );
          timeline.to(
            shadow,
            { opacity: isMobile ? 0.45 : 0.65, scale: 1, duration: dur.showcase * 0.45 },
            showcaseStart + dur.showcase * 0.08,
          );
          timeline.to(
            laptopScreenB,
            { opacity: 1, duration: dur.showcase * 0.35, ease: "power1.inOut" },
            showcaseStart + dur.showcase * 0.45,
          );
          timeline.to(
            phonePortraitAlt,
            { opacity: 1, duration: dur.showcase * 0.3, ease: "power1.inOut" },
            showcaseStart + dur.showcase * 0.5,
          );

          /* Phase 3 — lid close only (base stays put) */

          timeline.to(
            lid,
            { rotateX: lidClosed, duration: dur.lidClose, ease: "power2.inOut" },
            lidCloseStart,
          );
          timeline.to(
            screen,
            { opacity: 0, duration: dur.lidClose * 0.6, ease: "power1.inOut" },
            lidCloseStart + dur.lidClose * 0.35,
          );
          timeline.to(
            screenGlow,
            { opacity: 0, duration: dur.lidClose * 0.5, ease: "power1.inOut" },
            lidCloseStart + dur.lidClose * 0.4,
          );

          /* Fade phone beside before mobile entry */
          timeline.to(
            phone,
            { opacity: 0, duration: dur.laptopExit * 0.35, ease: "power1.inOut" },
            setupT(DEVICE_PHASE.lidCloseEnd),
          );

          /* Phase 4 — laptop depth exit (after lid closed) */
          const exitStart = setupT(DEVICE_PHASE.lidCloseEnd);

          timeline.to(
            laptop,
            {
              scale: 0.85,
              y: -40,
              opacity: 0,
              z: -200,
              duration: dur.laptopExit,
              ease: "power2.inOut",
            },
            exitStart,
          );
          timeline.to(
            shadow,
            { opacity: 0, duration: dur.laptopExit * 0.7, ease: "power1.inOut" },
            exitStart,
          );

          /* Phase 5 — mobile entry (after laptop is gone) */
          const mobileStart = setupT(DEVICE_PHASE.laptopExitEnd);

          timeline.set(
            phone,
            {
              x: isMobile ? 0 : isDesktop ? 300 : 220,
              y: 0,
              scale: phoneCenterScale * 0.67,
              rotateY: isMobile ? 0 : 15,
              rotateX: 0,
              rotateZ: 0,
              opacity: 0,
            },
            mobileStart,
          );

          timeline.to(
            phone,
            {
              opacity: 1,
              x: 0,
              scale: phoneCenterScale,
              rotateY: 0,
              duration: dur.mobileEntry,
              ease: "power2.out",
            },
            mobileStart,
          );
          timeline.to(devicesStage, { x: 0, duration: dur.mobileEntry, ease: "power2.out" }, mobileStart);

          /* Phase 6 — center hold */
          timeline.to({}, { duration: dur.centerHold }, setupT(DEVICE_PHASE.mobileEntryEnd));

          /* Phase 7 — in-place rotation (portrait → landscape) */
          const rotateStart = setupT(DEVICE_PHASE.centerHoldEnd);

          timeline.to(
            phonePortrait,
            { opacity: 0, duration: dur.rotate * 0.45, ease: "power1.inOut" },
            rotateStart + dur.rotate * 0.35,
          );
          timeline.to(
            phonePortraitAlt,
            { opacity: 0, duration: dur.rotate * 0.45, ease: "power1.inOut" },
            rotateStart + dur.rotate * 0.35,
          );
          timeline.to(
            phoneLandscape,
            { opacity: 1, duration: dur.rotate * 0.5, ease: "power1.inOut" },
            rotateStart + dur.rotate * 0.32,
          );
          timeline.to(
            phoneLandscapeRotator,
            { rotateZ: -90, duration: dur.rotate, ease: "power2.inOut" },
            rotateStart,
          );
          timeline.to(
            phone,
            {
              rotateZ: 90,
              scale: phoneRotateScale,
              duration: dur.rotate,
              ease: "power2.inOut",
            },
            rotateStart,
          );
          timeline.to(
            bgDim,
            { opacity: 0.14, duration: dur.rotate * 0.55, ease: "power2.out" },
            rotateStart + dur.rotate * 0.45,
          );
          timeline.to(
            spotlight,
            { opacity: 0.65, duration: dur.rotate * 0.55, ease: "power2.out" },
            rotateStart + dur.rotate * 0.45,
          );

          const revealMessage = (el: HTMLElement, at: number, delay = 0) => {
            timeline.fromTo(
              el,
              { autoAlpha: 0, y: 14 },
              {
                autoAlpha: 1,
                y: 0,
                duration: msgDur,
                ease: "power3.out",
                onUpdate: () => {
                  telegramFeed.scrollTop = telegramFeed.scrollHeight;
                },
                onComplete: () => {
                  telegramFeed.scrollTop = telegramFeed.scrollHeight;
                },
              },
              at + delay,
            );
          };

          const showGlassPanel = (index: number, at: number) => {
            glassSlides.forEach((slide, i) => {
              timeline.set(
                slide,
                {
                  autoAlpha: i === index ? 1 : 0,
                  visibility: i === index ? "visible" : "hidden",
                },
                at,
              );
            });
          };

          /* Section 3 — Intelligence handoff (continuous from landscape) */
          const handoffStart = intelT(0);
          const handoffDur = intelT(INTEL_PHASE.handoffEnd) - handoffStart;

          chapters.forEach((el) => {
            timeline.to(
              el,
              { autoAlpha: 0, x: -24, duration: handoffDur * 0.35, ease: "power2.in" },
              handoffStart,
            );
          });

          timeline.to(
            intelUi,
            { autoAlpha: 1, duration: handoffDur * 0.45, ease: "power2.out" },
            handoffStart + handoffDur * 0.06,
          );
          timeline.set(intelUi, { pointerEvents: "auto" }, handoffStart + handoffDur * 0.4);

          timeline.to(
            sideNav,
            { x: 0, duration: handoffDur * 0.55, ease: "power3.out" },
            handoffStart + handoffDur * 0.1,
          );
          timeline.to(
            glassPanel,
            { x: 0, y: 0, duration: handoffDur * 0.55, ease: "power3.out" },
            handoffStart + handoffDur * 0.1,
          );

          showGlassPanel(0, handoffStart + handoffDur * 0.1);

          timeline.to(
            phone,
            {
              rotateZ: 0,
              scale: phoneIntelScale,
              x: phoneIntelX,
              duration: handoffDur,
              ease: "power2.inOut",
            },
            handoffStart,
          );
          timeline.to(
            phoneLandscapeRotator,
            { rotateZ: 0, duration: handoffDur, ease: "power2.inOut" },
            handoffStart,
          );
          timeline.to(
            phoneLandscape,
            { opacity: 0, duration: handoffDur * 0.45, ease: "power1.inOut" },
            handoffStart + handoffDur * 0.3,
          );
          timeline.to(
            telegramLayer,
            { opacity: 1, duration: handoffDur * 0.5, ease: "power2.inOut" },
            handoffStart + handoffDur * 0.22,
          );
          timeline.to(
            cameraStage,
            { scale: 1, duration: handoffDur, ease: "power2.out" },
            handoffStart,
          );
          const vignette = section.querySelector<HTMLElement>(".setup-atmo-vignette");
          timeline.to(
            [glow, spotlight, beams, asciiCanvas, depthCanvas, bgDim, noise, vignette],
            { opacity: 0, duration: handoffDur * 0.5, ease: "power2.out" },
            handoffStart,
          );

          /* Feature 1 — KOL Alert */
          const kolStart = intelT(INTEL_PHASE.handoffEnd);
          revealMessage(telegramMessages[0]!, kolStart);

          /* Feature 2 — Whale Alert */
          const whaleStart = intelT(INTEL_PHASE.kolEnd);
          revealMessage(telegramMessages[1]!, whaleStart, msgDur * 0.35);
          showGlassPanel(1, whaleStart + msgDur * 0.2);

          /* Feature 3 — Cluster Alert */
          const clusterStart = intelT(INTEL_PHASE.whaleEnd);
          revealMessage(telegramMessages[2]!, clusterStart, msgDur * 0.35);
          showGlassPanel(2, clusterStart + msgDur * 0.2);

          /* Feature 4 — Surge Alert */
          const surgeStart = intelT(INTEL_PHASE.clusterEnd);
          revealMessage(telegramMessages[3]!, surgeStart, msgDur * 0.35);
          showGlassPanel(3, surgeStart + msgDur * 0.2);
          /* Feature 5 — Ask Anything */
          const askStart = intelT(INTEL_PHASE.surgeEnd);
          revealMessage(userMessage, askStart);
          timeline.to(
            typing,
            {
              autoAlpha: 1,
              duration: msgDur * 0.5,
              ease: "power2.out",
              onStart: () => {
                telegramFeed.scrollTop = telegramFeed.scrollHeight;
              },
            },
            askStart + msgDur * 0.9,
          );
          timeline.to(
            typing,
            { autoAlpha: 0, duration: msgDur * 0.35, ease: "power2.in" },
            askStart + msgDur * 1.8,
          );
          revealMessage(aiResponse, askStart + msgDur * 1.65);
          showGlassPanel(4, askStart + msgDur * 0.5);
          const footerRevealStart = intelT(0.62);
          const footerHandoff = footerHandoffRef.current;
          if (footerHandoff) {
            gsap.set(footerHandoff, { opacity: 0 });
            timeline.to(footerHandoff, { opacity: 1, duration: intelT(1) - footerRevealStart, ease: "power2.out" }, footerRevealStart);
          }

          context.add(() => {
            laptopFloat?.kill();
            phoneFloat?.kill();
          });
        },
      );
    }, section);

    return () => {
      cancelAnimationFrame(atmoRaf);
      window.removeEventListener("resize", resizeAtmo);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="product"
      aria-label="Product experience"
      className="setup-section relative scroll-mt-28 bg-[#F8F9FB] text-[#111827]"
    >
      <div id="features" className="pointer-events-none absolute top-24 h-0 w-0" aria-hidden />
      <div id="intelligence" className="pointer-events-none absolute top-24 h-0 w-0" aria-hidden />
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <SetupAtmosphere
          noiseRef={noiseRef}
          glowRef={glowRef}
          beamsRef={beamsRef}
          asciiRef={asciiCanvasRef}
          depthRef={depthCanvasRef}
          dimRef={bgDimRef}
          spotlightRef={spotlightRef}
        />

        <div ref={footerHandoffRef} className="setup-footer-handoff pointer-events-none absolute inset-x-0 bottom-0 z-[14] opacity-0" aria-hidden />

        <div ref={storyRef} className="setup-story pointer-events-none z-30">
          {SETUP_STORY_CHAPTERS.map((chapter, index) => (
            <div key={chapter.id} className="setup-story__chapter" aria-hidden>
              <div
                ref={(el) => {
                  chapterInnerRefs.current[index] = el;
                }}
                className="setup-story__inner"
              >
                <p className="setup-story__eyebrow brand-eyebrow">
                  <span className="setup-story__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="setup-story__divider" aria-hidden>
                    /
                  </span>
                  <span>{String(SETUP_STORY_CHAPTERS.length).padStart(2, "0")}</span>
                </p>
                <h2 className="setup-story__headline brand-headline">{chapter.headline}</h2>
                <p className="setup-story__body brand-body">{chapter.paragraph}</p>
              </div>
            </div>
          ))}
        </div>

        <div ref={cameraStageRef} className="absolute inset-0 [transform-style:preserve-3d]">
          <div ref={devicesStageRef} className="absolute inset-0 [perspective:1600px]">
            <div className="absolute left-1/2 top-1/2 z-10 [transform-style:preserve-3d]">
              <Laptop
                ref={laptopRef}
                lidRef={lidRef}
                screenRef={screenRef}
                screenARef={laptopScreenARef}
                screenBRef={laptopScreenBRef}
                screenGlowRef={screenGlowRef}
                shadowRef={shadowRef}
              />
            </div>

            <div className="absolute left-1/2 top-1/2 z-20 [transform-style:preserve-3d]">
              <Phone
                ref={phoneRef}
                portraitRef={phonePortraitRef}
                portraitAltRef={phonePortraitAltRef}
                landscapeRef={phoneLandscapeRef}
                landscapeRotatorRef={phoneLandscapeRotatorRef}
                telegramRef={telegramRef}
                telegram={
                  <TelegramChat
                    feedRef={telegramFeedRef}
                    messageRefs={telegramMessageRefs}
                    typingRef={typingRef}
                    userMessageRef={userMessageRef}
                    aiResponseRef={aiResponseRef}
                  />
                }
              />
            </div>
          </div>

          <div ref={intelUiRef} className="intel-ui">
            <IntelligenceSideNav navRef={sideNavRef} itemRefs={sideNavItemRefs} />
            <LiquidGlassPanel wrapRef={glassPanelRef} panelRefs={glassPanelSlideRefs} />
          </div>
        </div>
      </div>
      <div id="pricing" className="pointer-events-none h-px w-full scroll-mt-28" aria-hidden />
    </section>
  );
}
