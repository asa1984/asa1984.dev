/**
 * NOTE: sometimes, next/font fails to fetch fonts from Google Fonts.
 * Now, using @fontsource-variable instead of next/font.
 */

// import { Noto_Sans_JP, Inter, JetBrains_Mono } from "next/font/google";
// import local_font from "next/font/local";
//
// export const SansEN = Inter({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-sans-serif-en",
// });
//
// /**
//  * NOTE: Load Noto Sans JP from local file instead of Google Fonts
//  * @see https://github.com/vercel/next.js/issues/45080
//  */
// // export const SansJP = Noto_Sans_JP({
// //   subsets: ["latin"],
// //   display: "swap",
// //   variable: "--font-sans-serif-jp",
// // });
// export const SansJP = local_font({
//   src: "../assets/noto_sans_jp.woff2",
//   display: "swap",
//   variable: "--font-sans-serif-jp",
// });
//
// export const Monospace = JetBrains_Mono({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-monospace",
// });
