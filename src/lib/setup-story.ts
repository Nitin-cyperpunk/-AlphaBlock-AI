export { STORY_ENTER_DUR, STORY_EXIT_DUR } from "@/lib/setup-device-phases";

import { DEVICE_PHASE } from "@/lib/setup-device-phases";

export type StoryChapter = {
  id: string;
  start: number;
  end: number;
  headline: string;
  paragraph: string;
};

export const SETUP_STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "intro",
    start: 0,
    end: DEVICE_PHASE.introEnd,
    headline: "Built for the next generation of traders",
    paragraph: "Institutional-grade intelligence for modern on-chain markets.",
  },
  {
    id: "smart-money",
    start: DEVICE_PHASE.introEnd,
    end: DEVICE_PHASE.showcaseEnd - 0.02,
    headline: "Track smart money in real time",
    paragraph:
      "Follow wallets, liquidity movements, and emerging opportunities before they become obvious.",
  },
  {
    id: "execution",
    start: DEVICE_PHASE.showcaseEnd - 0.02,
    end: DEVICE_PHASE.lidCloseEnd,
    headline: "Execution without friction",
    paragraph: "Turn insights into actions through one connected intelligence layer.",
  },
  {
    id: "cross-screen",
    start: DEVICE_PHASE.lidCloseEnd,
    end: DEVICE_PHASE.laptopExitEnd,
    headline: "Built across every screen",
    paragraph: "Desktop depth. Mobile speed.",
  },
  {
    id: "one-interface",
    start: DEVICE_PHASE.mobileEntryEnd,
    end: DEVICE_PHASE.centerHoldEnd,
    headline: "One interface. Every market.",
    paragraph: "Monitor, analyze, and execute wherever you are.",
  },
  {
    id: "landscape",
    start: DEVICE_PHASE.centerHoldEnd,
    end: DEVICE_PHASE.rotateEnd,
    headline: "Your intelligence layer for on-chain trading",
    paragraph: "Understand the market before the market moves.",
  },
];
