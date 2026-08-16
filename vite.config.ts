import { defineConfig as defineOxfmtConfig } from "@asa1984/configs/oxfmt";
import {
  browser,
  defineConfig as defineOxlintConfig,
  imports,
  javascript,
  node,
  typescript,
  unicorn,
  vitest,
} from "@asa1984/configs/oxlint";
import { defineConfig } from "vite-plus";

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
  fmt: defineOxfmtConfig({
    ignorePatterns: generated,
  }),

  lint: defineOxlintConfig({
    extends: [javascript(), typescript(), imports(), unicorn(), vitest(), node(), browser()],
    ignorePatterns: generated,
    // Adoption debt: rules from @asa1984/configs that the pre-vite-plus
    // codebase does not satisfy yet. Re-enable per rule as code catches up.
    rules: {
      // 30 hits; declarations→expressions changes hoisting, defer
      "func-style": "off",
      // 15 hits of export-ordering churn, defer
      "import/exports-last": "off",
      // repo convention is snake_case modules + PascalCase components
      "unicorn/filename-case": "off",
      // React APIs (component returns, JSON payloads) use null idiomatically
      "unicorn/no-null": "off",
    },
    overrides: [
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
  }),

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
    },
  },
});
