import { defineConfig } from "@pandacss/dev";

import { global_css } from "@/styles/global";

export default defineConfig({
  // v2 no longer injects presets implicitly; these are the v1 defaults.
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],

  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        fonts: {
          sans: {
            // value: `var(--font-sans-serif-en), var(--font-sans-serif-jp), sans-serif`,
            value: "Inter Variable, Noto Sans JP Variable, sans-serif",
          },
          monospace: {
            // value: `var(--font-monospace), monospace`,
            value: "JetBrains Mono Variable, monospace",
          },
          emoji: {
            value: "Noto Emoji Variable, sans-serif",
          },
        },
        colors: {
          black: {
            value: "#222",
          },
          white: {
            value: "#f2f2f2",
          },
          // preset-panda v2 switched its palette to oklch values that render
          // slightly differently; pin the shades we use to their v1 colors.
          blue: {
            100: { value: "#dbeafe" },
            500: { value: "#3b82f6" },
          },
          gray: {
            200: { value: "#e5e7eb" },
            300: { value: "#d1d5db" },
            500: { value: "#6b7280" },
            600: { value: "#4b5563" },
          },
          red: {
            500: { value: "#ef4444" },
          },
        },
      },

      keyframes: {
        scroll: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "./src/styled-system",

  // Global styles
  globalCss: global_css,
});
