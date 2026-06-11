"use client";

import Image from "next/image";
import { forwardRef } from "react";
import { assets } from "@/lib/assets";

type LaptopProps = {
  lidRef?: React.Ref<HTMLDivElement>;
  screenRef?: React.Ref<HTMLDivElement>;
  screenARef?: React.Ref<HTMLDivElement>;
  screenBRef?: React.Ref<HTMLDivElement>;
  screenGlowRef?: React.Ref<HTMLDivElement>;
  shadowRef?: React.Ref<HTMLDivElement>;
};

/** CSS laptop with hinged lid for 3D fold animation. */
export const Laptop = forwardRef<HTMLDivElement, LaptopProps>(function Laptop(
  { lidRef, screenRef, screenARef, screenBRef, screenGlowRef, shadowRef },
  ref,
) {
  return (
    <div
      ref={ref}
      className="device-layer relative"
      style={{
        width: "min(52vw, 560px)",
        perspective: 2200,
        perspectiveOrigin: "50% 100%",
      }}
    >
      <div
        ref={shadowRef}
        aria-hidden
        className="device-layer__shadow absolute -bottom-4 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-[50%] bg-slate-900/15"
      />

      <div
        ref={lidRef}
        className="relative origin-bottom will-change-transform"
        style={{ transform: "rotateX(90deg)", transformStyle: "preserve-3d" }}
      >
        <div
          className="relative rounded-[18px] border border-slate-900/10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.18)]"
          style={{
            background: "linear-gradient(180deg, #0a0a0a 0%, #141414 100%)",
            padding: "14px 14px 18px 14px",
            aspectRatio: "16 / 10",
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-black">
            <div
              ref={screenRef}
              data-screen="laptop"
              className="absolute inset-0 overflow-hidden"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% 0%, rgba(13,45,205,0.2) 0%, rgba(13,45,205,0.06) 35%, rgba(0,0,0,0) 70%), linear-gradient(180deg, #050510 0%, #02030a 100%)",
                opacity: 0,
              }}
            >
              <div ref={screenARef} className="absolute inset-0">
                <Image
                  src={assets.laptopScreen1}
                  alt=""
                  fill
                  className="object-cover object-left-top"
                  sizes="(max-width: 768px) 52vw, 560px"
                  draggable={false}
                />
              </div>
              <div ref={screenBRef} className="absolute inset-0 opacity-0">
                <Image
                  src={assets.laptopScreen2}
                  alt=""
                  fill
                  className="object-cover object-left-top"
                  sizes="(max-width: 768px) 52vw, 560px"
                  draggable={false}
                />
              </div>

              <div
                ref={screenGlowRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(13,45,205,0.32) 0%, transparent 72%)",
                }}
              />
            </div>

            <div className="absolute left-1/2 top-1 h-1 w-12 -translate-x-1/2 rounded-full bg-white/5" />
          </div>
        </div>
      </div>

      <div
        className="relative mx-auto"
        style={{
          width: "104%",
          marginLeft: "-2%",
          height: 14,
          background: "linear-gradient(180deg, #2a2a2a 0%, #0a0a0a 60%, #050505 100%)",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          boxShadow:
            "0 30px 60px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="absolute left-1/2 top-0 h-[3px] w-24 -translate-x-1/2 rounded-b-md"
          style={{ background: "rgba(0,0,0,0.6)" }}
        />
      </div>
    </div>
  );
});
