import type { Metadata } from "next";
import { Anton, Geist, JetBrains_Mono, Playfair_Display } from "next/font/google";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { assets } from "@/lib/assets";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "AlphaBlock AI — Intelligence Layer for On-Chain Traders",
  description:
    "Understand the market before the market moves. Institutional-grade intelligence for onchain trading.",
  icons: {
    icon: assets.faviconDark,
    apple: assets.icon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${playfair.variable} ${jetbrainsMono.variable} ${anton.variable} font-sans antialiased`}
      >
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
