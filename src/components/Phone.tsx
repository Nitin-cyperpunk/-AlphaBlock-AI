"use client";

import Image from "next/image";
import { forwardRef } from "react";
import { assets } from "@/lib/assets";

type PhoneProps = {
  screenRef?: React.Ref<HTMLDivElement>;
  portraitRef?: React.Ref<HTMLDivElement>;
  portraitAltRef?: React.Ref<HTMLDivElement>;
  landscapeRef?: React.Ref<HTMLDivElement>;
  landscapeRotatorRef?: React.Ref<HTMLDivElement>;
  telegramRef?: React.Ref<HTMLDivElement>;
  telegram?: React.ReactNode;
};

export const Phone = forwardRef<HTMLDivElement, PhoneProps>(function Phone(
  { screenRef, portraitRef, portraitAltRef, landscapeRef, landscapeRotatorRef, telegramRef, telegram },
  ref,
) {
  return (
    <div
      ref={ref}
      className="device-layer relative"
      style={{
        width: "min(16vw, 150px)",
        aspectRatio: "9 / 19",
        willChange: "transform",
      }}
    >
      <div
        className="relative h-full w-full rounded-[36px] border border-white/10 p-[6px] device-layer__frame"
        style={{
          background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
        }}
      >
        <div
          ref={screenRef}
          data-screen="phone"
          className="relative h-full w-full overflow-hidden rounded-[30px] bg-black"
          style={{
            background:
              "radial-gradient(140% 60% at 50% 0%, rgba(13,45,205,0.2) 0%, rgba(13,45,205,0.06) 40%, rgba(0,0,0,0) 75%), linear-gradient(180deg, #050510 0%, #02030a 100%)",
          }}
        >
          <div ref={portraitRef} className="absolute inset-0">
            <Image
              src={assets.mobileScreen1}
              alt=""
              fill
              className="object-cover object-top"
              sizes="150px"
              draggable={false}
            />
          </div>
          <div ref={portraitAltRef} className="absolute inset-0 opacity-0">
            <Image
              src={assets.mobileScreen2}
              alt=""
              fill
              className="object-cover object-top"
              sizes="150px"
              draggable={false}
            />
          </div>
          <div ref={landscapeRef} className="absolute inset-0 opacity-0">
            <div ref={landscapeRotatorRef} className="device-phone-landscape__rotator">
              <Image
                src={assets.mobileLandscape1}
                alt=""
                fill
                className="object-cover object-center"
                sizes="280px"
                draggable={false}
              />
            </div>
          </div>

          {telegram ? (
            <div ref={telegramRef} className="telegram-chat-layer absolute inset-0 z-[2] opacity-0">
              {telegram}
            </div>
          ) : null}

          <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
});
