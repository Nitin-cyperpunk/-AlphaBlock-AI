"use client";

import { forwardRef } from "react";

export type TelegramMessageRef = HTMLDivElement;

type TelegramChatProps = {
  feedRef?: React.Ref<HTMLDivElement>;
  messageRefs: React.MutableRefObject<(TelegramMessageRef | null)[]>;
  typingRef?: React.Ref<HTMLDivElement>;
  userMessageRef?: React.Ref<HTMLDivElement>;
  aiResponseRef?: React.Ref<HTMLDivElement>;
};

export const TelegramChat = forwardRef<HTMLDivElement, TelegramChatProps>(
  function TelegramChat(
    { feedRef, messageRefs, typingRef, userMessageRef, aiResponseRef },
    ref,
  ) {
    return (
      <div ref={ref} className="telegram-chat">
        <header className="telegram-chat__header">
          <button type="button" className="telegram-chat__back" aria-hidden>
            ‹
          </button>
          <div className="telegram-chat__avatar" aria-hidden>
            AB
          </div>
          <div className="telegram-chat__meta">
            <span className="telegram-chat__name">AlphaBlock AI</span>
            <span className="telegram-chat__status">bot</span>
          </div>
        </header>

        <div ref={feedRef} className="telegram-chat__feed">
          <p className="telegram-chat__date">Today</p>

          <div
            ref={(el) => {
              messageRefs.current[0] = el;
            }}
            className="telegram-chat__bubble telegram-chat__bubble--bot"
          >
            <p className="telegram-chat__label">KOL Alert</p>
            <p className="telegram-chat__text">@TraderXYZ entered PEPE</p>
            <p className="telegram-chat__meta-line">92% · 0x7a…4f2c</p>
          </div>

          <div
            ref={(el) => {
              messageRefs.current[1] = el;
            }}
            className="telegram-chat__bubble telegram-chat__bubble--bot"
          >
            <p className="telegram-chat__label">Whale Alert</p>
            <p className="telegram-chat__text">+$850K PEPE · High conviction</p>
            <p className="telegram-chat__meta-line">Wallet age 3.2y</p>
          </div>

          <div
            ref={(el) => {
              messageRefs.current[2] = el;
            }}
            className="telegram-chat__bubble telegram-chat__bubble--bot"
          >
            <p className="telegram-chat__label">Cluster Alert</p>
            <p className="telegram-chat__text">7 linked wallets · accumulation</p>
            <p className="telegram-chat__meta-line">Confidence 88%</p>
          </div>

          <div
            ref={(el) => {
              messageRefs.current[3] = el;
            }}
            className="telegram-chat__bubble telegram-chat__bubble--bot telegram-chat__bubble--surge"
          >
            <p className="telegram-chat__label">Surge Alert</p>
            <p className="telegram-chat__text">Volume ↑ · Social ↑ · Liquidity ↑</p>
            <p className="telegram-chat__text telegram-chat__text--accent">Narrative forming</p>
          </div>

          <div
            ref={userMessageRef}
            className="telegram-chat__bubble telegram-chat__bubble--user"
          >
            <p className="telegram-chat__text">Why is PEPE moving?</p>
          </div>

          <div ref={typingRef} className="telegram-chat__typing" aria-hidden>
            <span />
            <span />
            <span />
          </div>

          <div
            ref={aiResponseRef}
            className="telegram-chat__bubble telegram-chat__bubble--bot telegram-chat__bubble--ai"
          >
            <p className="telegram-chat__text">3 whales · 2.4M PEPE · mentions +380%</p>
            <p className="telegram-chat__text telegram-chat__text--accent">
              Historically preceded large moves.
            </p>
          </div>

          <div className="telegram-chat__feed-spacer" aria-hidden />
        </div>
      </div>
    );
  },
);
