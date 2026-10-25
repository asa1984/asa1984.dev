/**
 * The oxlint baseline, copied from asa1984/conceptory packages/vite-plus-config.
 *
 * Categories that can be enforced as rules (correctness, suspicious, pedantic, perf, nursery) are
 * enabled as a whole. Rules from style, which is about coding preferences, and from restriction,
 * which bans specific features, are picked individually. Within the wholly enabled categories,
 * only the rules that don't fit this policy are disabled.
 */

import type { OxlintConfig } from "vite-plus/lint";

import { restrictionRules } from "./lint/restriction.ts";
import { styleRules } from "./lint/style.ts";

export { testLint } from "./lint/vitest.ts";

/** Categories enabled as a whole. */
export const enabledCategories = [
  "correctness",
  "suspicious",
  "pedantic",
  "perf",
  "nursery",
] as const;

/** Enabled plugins. testLint adds vitest. */
export const basePlugins = [
  "eslint",
  "typescript",
  "unicorn",
  "oxc",
  "import",
  "promise",
  "node",
  "jsdoc",
] as const;

/** Rules excluded from the wholly enabled categories. */
const categoryExceptions = {
  // Nearly every function taking DOM or third-party types violates it, making it impractical.
  "typescript/prefer-readonly-parameter-types": "off",
  // It ignores types and falsely reports runtime globals such as document and fetch as undefined.
  // The TypeScript type checker detects undefined names.
  "eslint/no-undef": "off",
  // Types already describe parameters and return values, so don't repeat them in JSDoc.
  "jsdoc/require-param": "off",
  "jsdoc/require-returns": "off",
  // It doesn't understand exhaustive switches, so functions that return in every case violate it.
  // noImplicitReturns and switch-exhaustiveness-check detect missing returns.
  "typescript/consistent-return": "off",
  // It judges by method name alone, so it also flags non-DOM APIs such as Cytoscape.js's
  // getElementById, and its autofix breaks them.
  "unicorn/prefer-query-selector": "off",
  // Line counts measure formatting and markup rather than complexity, and splitting code to meet
  // them scatters it. Limits on nesting keep complexity in check instead.
  "eslint/max-lines-per-function": "off",
} as const;

export const lint = {
  plugins: [...basePlugins],
  categories: Object.fromEntries(enabledCategories.map((category) => [category, "error"])),
  options: {
    typeAware: true,
    typeCheck: true,
    reportUnusedDisableDirectives: "error",
  },
  rules: {
    ...categoryExceptions,
    ...styleRules,
    ...restrictionRules,
    // CSS takes effect just by being imported.
    "import/no-unassigned-import": ["error", { allow: ["**/*.css", "**/style/*"] }],
  },
  overrides: [
    {
      // Tool config files require a default export.
      files: ["**/*.config.{ts,mts,js,mjs}"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
} satisfies OxlintConfig;
