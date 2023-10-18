import { defineConfig, defineGlobalStyles } from "@pandacss/dev";

const globalCss = defineGlobalStyles({
  "html, body": {
    color: "black",
    backgroundColor: "white",
    fontFamily: "sans",
    lineHeight: "1.5",
  },
});

export default defineConfig({
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
            value: `var(--font-sans-serif-en), var(--font-sans-serif-jp), sans-serif`,
          },
          monospace: {
            value: `var(--font-monospace), monospace`,
          },
        },
        colors: {
          black: {
            value: "#222",
          },
          white: {
            value: "#f2f2f2",
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
  globalCss,
});
