import { fileURLToPath } from "node:url";

import { defineConfig } from "vite-plus";

import { test } from "../../config/test.ts";

export default defineConfig({
  // tsconfig.json has jsx:"preserve" for Next; tell Vite (oxc) to transform
  // JSX itself so .tsx modules can be imported in tests.
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  test: {
    ...test,
    include: ["src/**/*.test.{ts,tsx}"],
    // direnv exports the dev .env (ALLOW_EMPTY_CONTENT=1 etc.) into local
    // shells; neutralize it so tests see the same env as CI.
    env: {
      ALLOW_EMPTY_CONTENT: "",
    },
  },
});
