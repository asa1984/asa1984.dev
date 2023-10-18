import { Noto_Sans_JP, Inter, JetBrains_Mono } from "next/font/google";

export const SansSerifEn = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-serif-en",
});

export const SansSerifJp = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-serif-jp",
});

export const Monospace = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-monospace",
});
