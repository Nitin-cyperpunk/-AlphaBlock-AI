"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type LaptopProps = {
  lidRef: React.RefObject<HTMLDivElement | null>;
  screenRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  shadowRef: React.RefObject<HTMLDivElement | null>;
  videoSrc?: string;
};

function Laptop({
  lidRef,
  screenRef,
  videoRef,
  shadowRef,
  videoSrc = "/alphablock-demo.mp4",
}: LaptopProps) {
  return (
    <div className="relative w-[min(76vw,940px)] md:w-[min(70vw,900px)] lg:w-[min(64vw,980px)]">
      <div
        ref={shadowRef}
        aria-hidden
        className="absolute -bottom-[8%] left-1/2 h-[14%] w-[72%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-2xl"
      />

      <div className="relative [perspective:1600px]">
        <div className="relative [transform-style:preserve-3d]">
          {/* Keyboard deck */}
          <div className="relative z-0">
            <div className="rounded-b-[0.95rem] border border-white/10 border-t-white/[0.04] bg-[#18181a] p-[0.5rem] pb-[0.65rem] shadow-[0_24px_80px_rgba(0,0,0,0.55)] md:rounded-b-[1.15rem] md:p-[0.65rem] md:pb-[0.8rem]">
              <div className="relative aspect-[16/10.2] w-full overflow-hidden rounded-[0.45rem] bg-[#0c0c0e] ring-1 ring-white/[0.05] md:rounded-[0.6rem]">
                <div
                  aria-hidden
                  className="absolute inset-[6%] grid grid-cols-12 gap-[2px] opacity-[0.18] md:gap-[3px]"
                >
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="rounded-[2px] bg-white/80" />
                  ))}
                </div>
                <div className="absolute bottom-[8%] left-1/2 h-[22%] w-[34%] -translate-x-1/2 rounded-lg bg-[#1a1a1d] ring-1 ring-white/[0.06]" />
              </div>
            </div>
            <div className="mx-auto h-[0.22rem] w-[99%] rounded-b-md bg-[#0e0e10]" />
            <div className="mx-auto mt-[0.12rem] h-[0.14rem] w-[16%] rounded-full bg-[#080809]" />
          </div>

          {/* Hinged lid — starts closed (rotateX set via GSAP + inline fallback) */}
          <div
            ref={lidRef}
            className="absolute bottom-full left-0 right-0 z-10 origin-bottom [transform-style:preserve-3d]"
            style={{ transform: "rotateX(90deg)" }}
          >
            {/* Outer lid (visible when closed) */}
            <div className="rounded-t-[1.05rem] border border-white/12 border-b-white/[0.04] bg-[#1c1c1f] p-[0.5rem] shadow-[0_-8px_40px_rgba(0,0,0,0.35)] md:rounded-t-[1.3rem] md:p-[0.65rem]">
              <div className="pointer-events-none absolute left-1/2 top-[0.4rem] z-20 h-[0.32rem] w-[0.32rem] -translate-x-1/2 rounded-full bg-[#080809] ring-1 ring-white/10 md:top-[0.5rem]" />

              <div className="overflow-hidden rounded-[0.5rem] bg-black ring-1 ring-white/[0.07] md:rounded-[0.65rem]">
                <div
                  ref={screenRef}
                  className="relative aspect-[16/10] w-full bg-[#030303]"
                  style={{ opacity: 0 }}
                >
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    poster="/laptop-poster.svg"
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </video>

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex flex-col bg-[#050505] p-[6%]"
                  >
                    <span className="w-fit rounded-md bg-[#0D2DCD]/20 px-2 py-0.5 text-[clamp(0.45rem,1.2vw,0.65rem)] font-semibold tracking-[0.12em] text-[#0D2DCD]">
                      AlphaBlock
                    </span>
                    <span className="mt-[4%] text-[clamp(0.7rem,2vw,1.1rem)] font-semibold text-white/90">
                      Product demo
                    </span>
                    <div className="mt-auto h-[42%] rounded-xl border border-[#0D2DCD]/25 bg-[#0D2DCD]/10" />
                  </div>

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_42%)]"
                  />
                </div>
              </div>
            </div>

            {/* Closed-lid top surface hint (aluminum back) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[0.5rem] top-[0.5rem] h-[calc(100%-1rem)] rounded-t-[0.5rem] bg-[#222225] opacity-0 md:inset-x-[0.65rem] md:top-[0.65rem]"
              data-lid-back
            />
            <div className="mx-auto h-[0.18rem] w-[99%] rounded-t-sm bg-[#141416]" />
          </div>
        </div>
      </div>
    </div>
  );
}

type PhoneProps = {
  imageSrc?: string;
  imageAlt?: string;
};

function Phone({
  imageSrc = "/mobile-dashboard.svg",
  imageAlt = "AlphaBlock mobile dashboard",
}: PhoneProps) {
  return (
    <div className="relative w-[min(44vw,250px)] sm:w-[min(36vw,270px)] md:w-[min(30vw,290px)] lg:w-[min(24vw,310px)]">
      <div className="absolute left-[-0.12rem] top-[22%] h-[8%] w-[0.12rem] rounded-l bg-[#2a2a2d]" />
      <div className="absolute left-[-0.12rem] top-[34%] h-[12%] w-[0.12rem] rounded-l bg-[#2a2a2d]" />
      <div className="absolute right-[-0.12rem] top-[28%] h-[14%] w-[0.12rem] rounded-r bg-[#2a2a2d]" />

      <div className="rounded-[2rem] border border-white/14 bg-[#111113] p-[0.45rem] shadow-[0_28px_90px_rgba(0,0,0,0.6)] md:rounded-[2.4rem] md:p-[0.55rem]">
        <div className="pointer-events-none absolute left-1/2 top-[1.1rem] z-10 h-[1.1rem] w-[28%] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10 md:top-5" />
        <div className="overflow-hidden rounded-[1.55rem] bg-[#050505] ring-1 ring-white/6 md:rounded-[1.85rem]">
          <div className="relative aspect-[9/19.5] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover object-top"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#010101]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.32]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 78% 68% at 50% 48%, black 18%, transparent 72%)",
        }}
      />
      {[
        { top: "16%", left: "11%", size: 3, opacity: 0.5 },
        { top: "74%", left: "20%", size: 2, opacity: 0.38 },
        { top: "32%", left: "80%", size: 3, opacity: 0.32 },
        { top: "64%", left: "70%", size: 2, opacity: 0.46 },
      ].map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute rounded-full bg-[#0D2DCD]"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            boxShadow: "0 0 10px rgba(13, 45, 205, 0.4)",
          }}
        />
      ))}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,#010101_90%)]"
      />
    </div>
  );
}

export default function SetupSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const videoStartedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const laptop = laptopRef.current;
    const phone = phoneRef.current;
    const label = labelRef.current;
    const lid = lidRef.current;
    const screen = screenRef.current;
    const video = videoRef.current;
    const shadow = shadowRef.current;

    if (!section || !laptop || !phone || !label || !lid || !screen || !shadow)
      return;

    const tryPlayVideo = () => {
      if (!video || videoStartedRef.current) return;
      video.play().then(() => {
        videoStartedRef.current = true;
      }).catch(() => {});
    };

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isTablet: "(min-width: 768px) and (max-width: 1023px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isDesktop, isTablet, isMobile } = context.conditions as {
            isDesktop: boolean;
            isTablet: boolean;
            isMobile: boolean;
          };

          const perspective = isMobile ? 1000 : isTablet ? 1300 : 1600;
          const lidClosed = 90;
          const lidOpen = isMobile ? -6 : isTablet ? -8 : -10;

          const laptopScaleEnd = isMobile ? 0.78 : isTablet ? 0.68 : 0.6;
          const laptopLift = isMobile ? -36 : isTablet ? -52 : -72;
          const phoneScaleStart = isMobile ? 0.72 : isTablet ? 0.68 : 0.6;
          const phoneStartX = isMobile ? 0 : isTablet ? 180 : 260;
          const phoneStartY = isMobile ? 120 : isTablet ? 24 : 0;
          const phoneRotateStart = isMobile ? 0 : isTablet ? 12 : 20;

          const lidOpenDuration = 0.32;
          const handoffStart = 0.38;

          gsap.set(laptop, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: isMobile ? -80 : 0,
            scale: 1,
            opacity: 1,
            transformOrigin: "50% 50%",
            transformPerspective: perspective,
            force3D: true,
          });

          gsap.set(lid, {
            rotateX: lidClosed,
            transformOrigin: "50% 100%",
            transformPerspective: perspective,
            force3D: true,
          });

          gsap.set(screen, { opacity: 0 });
          gsap.set(shadow, { opacity: isMobile ? 0.3 : 0.45, scale: 0.8 });

          gsap.set(phone, {
            xPercent: -50,
            yPercent: -50,
            x: phoneStartX,
            y: phoneStartY,
            scale: phoneScaleStart,
            rotateY: phoneRotateStart,
            opacity: 1,
            transformOrigin: "50% 50%",
            transformPerspective: perspective,
            force3D: true,
          });

          gsap.set(label, { opacity: 1, y: 0 });

          const timeline = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=250%",
              pin: true,
              pinSpacing: true,
              scrub: 0.9,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (self.progress > 0.05) tryPlayVideo();
              },
            },
          });

          /* Phase 1 — lid closed → open */
          timeline.to(
            lid,
            { rotateX: lidOpen, duration: lidOpenDuration, ease: "power2.inOut" },
            0,
          );

          timeline.to(
            screen,
            { opacity: 1, duration: lidOpenDuration * 0.5, ease: "power2.inOut" },
            lidOpenDuration * 0.25,
          );

          timeline.to(
            shadow,
            { opacity: isMobile ? 0.5 : 0.7, scale: 1, duration: lidOpenDuration * 0.7 },
            lidOpenDuration * 0.15,
          );

          /* Phase 2 — hold open (showcase) */
          timeline.to({}, { duration: handoffStart - lidOpenDuration }, lidOpenDuration);

          /* Phase 3 — laptop → phone handoff */
          timeline.to(
            laptop,
            {
              scale: laptopScaleEnd,
              opacity: 0.04,
              y: isMobile ? laptopLift - 80 : laptopLift,
              duration: 1 - handoffStart,
            },
            handoffStart,
          );

          timeline.to(
            phone,
            {
              x: 0,
              y: 0,
              scale: 1,
              rotateY: 0,
              duration: 1 - handoffStart,
            },
            handoffStart,
          );

          timeline.to(
            label,
            {
              opacity: isDesktop ? 0.2 : 0.1,
              y: -12,
              duration: 1 - handoffStart,
            },
            handoffStart,
          );
        },
      );
    }, section);

    return () => {
      videoStartedRef.current = false;
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="product"
      aria-label="Product experience"
      className="relative scroll-mt-28 bg-[#010101] text-white"
    >
      <div id="features" className="pointer-events-none absolute top-24 h-0 w-0" aria-hidden />
      <div
        ref={stageRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
      >
        <BackgroundLayer />

        <div
          ref={labelRef}
          className="pointer-events-none absolute top-[clamp(2.5rem,8vh,5rem)] z-30 px-6 text-center"
        >
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.35em] text-white/40">
            Setup Experience
          </p>
          <h2 className="mt-3 text-balance text-[clamp(1.75rem,4vw,3rem)] font-semibold tracking-[-0.03em] text-white/95">
            AlphaBlock on every screen.
          </h2>
        </div>

        <div className="absolute inset-0 [perspective:1600px]">
          <div
            ref={laptopRef}
            className="absolute left-1/2 top-1/2 z-10 will-change-transform [transform-style:preserve-3d]"
          >
            <Laptop
              lidRef={lidRef}
              screenRef={screenRef}
              videoRef={videoRef}
              shadowRef={shadowRef}
            />
          </div>

          <div
            ref={phoneRef}
            className="absolute left-1/2 top-1/2 z-20 will-change-transform [transform-style:preserve-3d]"
          >
            <Phone />
          </div>
        </div>
      </div>
      <div id="pricing" className="pointer-events-none h-px w-full scroll-mt-28" aria-hidden />
    </section>
  );
}
