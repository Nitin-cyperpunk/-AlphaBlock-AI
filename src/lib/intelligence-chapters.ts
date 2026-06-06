export type GlassPanelContent = {
  title: string;
  description: string;
  benefits: string[];
};

export type IntelligenceChapter = {
  id: string;
  navLabel: string;
  panel: GlassPanelContent;
};

export const INTELLIGENCE_CHAPTERS: IntelligenceChapter[] = [
  {
    id: "kol",
    navLabel: "KOL",
    panel: {
      title: "KOL Alerts",
      description: "Track influential traders before the crowd reacts.",
      benefits: [
        "Follow high-signal wallets",
        "Historical accuracy",
        "Early positioning",
      ],
    },
  },
  {
    id: "whale",
    navLabel: "Whale",
    panel: {
      title: "Whale Alerts",
      description:
        "Identify institutional-grade wallet movements before they become obvious.",
      benefits: [
        "Large accumulation detection",
        "Conviction scoring",
        "Wallet age analysis",
      ],
    },
  },
  {
    id: "cluster",
    navLabel: "Cluster",
    panel: {
      title: "Cluster Alerts",
      description: "Detect coordinated wallet clusters acting as one entity.",
      benefits: [
        "Linked wallet mapping",
        "Pattern confidence",
        "Accumulation signals",
      ],
    },
  },
  {
    id: "surge",
    navLabel: "Surge",
    panel: {
      title: "Surge Alerts",
      description:
        "AlphaBlock combines social and on-chain signals into a single intelligence layer.",
      benefits: [
        "Volume momentum",
        "Social velocity",
        "Liquidity shifts",
      ],
    },
  },
  {
    id: "ask",
    navLabel: "Ask Anything",
    panel: {
      title: "Ask Anything",
      description:
        "Natural language intelligence — ask why a token is moving and get actionable context.",
      benefits: [
        "Whale + social synthesis",
        "Historical pattern matching",
        "Real-time reasoning",
      ],
    },
  },
];
