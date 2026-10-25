import { defineConfig } from "vite-plus";

import { fmt } from "./config/fmt.ts";
import { lint, testLint } from "./config/lint.ts";

// Generated / build artifacts that lint and fmt must never touch.
const generated = [
  "**/worker-configuration.d.ts",
  "**/styled-system",
  "**/.next",
  "**/.open-next",
  "**/.wrangler",
  "**/.size-check",
  "**/dist",
];

export default defineConfig({
  fmt: {
    ...fmt,
    ignorePatterns: generated,
  },

  lint: {
    ...lint,
    ignorePatterns: generated,
    rules: {
      ...lint.rules,
      // Panda CSS finds css() calls by the exact `styled-system/css` specifier, so keep it as is.
      "import/extensions": [
        "error",
        "always",
        {
          ignorePackages: true,
          pathGroupOverrides: [{ pattern: "@/styled-system/**", action: "ignore" }],
        },
      ],
    },
    overrides: [
      ...lint.overrides,
      {
        files: ["**/*.{test,spec}.{ts,mts,cts,tsx}"],
        ...testLint,
        rules: {
          ...testLint.rules,
          // Adoption debt: three test files still mock modules with vi.mock.
          "vitest/no-restricted-vi-methods": "off",
        },
      },
      {
        // Next.js requires these files to export their component as default.
        files: [
          "packages/frontend/src/app/**/{page,layout,template,loading,error,global-error,not-found,default}.tsx",
        ],
        rules: {
          "import/no-default-export": "off",
        },
      },
      {
        // tsgolint resolves this feature's hast/panda imports to error types
        // (tsc is fine), so its type-aware findings here are artifacts.
        files: ["packages/frontend/src/features/markdown/**"],
        rules: {
          "typescript/no-unsafe-argument": "off",
          "typescript/no-unsafe-assignment": "off",
          "typescript/no-unsafe-call": "off",
          "typescript/no-unsafe-member-access": "off",
          "typescript/no-unsafe-return": "off",
          "typescript/restrict-template-expressions": "off",
          "typescript/strict-boolean-expressions": "off",
        },
      },
    ],
  },

  // Root orchestration mirrors the pre-vite-plus root scripts: checks assume
  // `vp run codegen` ran first (CI runs it as an explicit step so the
  // parallel check steps don't race on regenerating the same files), and
  // deploys are driven step by step from the workflows.
  run: {
    tasks: {
      codegen: "vp run -r codegen",
      typecheck: "vp run -r typecheck",
      test: "vp run -r test",
      build: "vp run -r build",
      dev: { command: ["vp run -r codegen", "vp run -r dev"], cache: false },
      start: { command: "vp run -r start", cache: false },
      "check:actions": { command: ["actionlint", "zizmor --offline .github"], cache: false },
    },
  },
});
