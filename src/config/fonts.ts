import {
  // Noto_Sans_JP,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import local_font from "next/font/local";

export const SansSerifEn = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-serif-en",
});

// NOTE: vercel/next.js issue#45080
// visit https://github.com/vercel/next.js/issues/45080
// export const SansSerifJp = Noto_Sans_JP({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-sans-serif-jp",
// });

export const SansSerifJp = local_font({
  src: "../assets/noto_sans_jp.woff2",
  display: "swap",
  variable: "--font-sans-serif-jp",
});

export const Monospace = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-monospace",
});
