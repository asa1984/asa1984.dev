import type { OxlintOverride } from "vite-plus/lint";

/** Settings for tests. Assumes the Vitest baseline, which doesn't isolate test files. */
export const testLint = {
  plugins: ["vitest"],
  rules: {
    // Module mocks persist across test files, which is incompatible with not isolating them.
    // Make code testable without mocks, e.g. by taking dependencies as arguments.
    "vitest/no-restricted-vi-methods": [
      "error",
      Object.fromEntries(
        ["mock", "doMock", "unmock", "doUnmock", "resetModules"].map((method) => [
          method,
          "モジュールのモックはほかのテストのファイルにも残る。依存を引数で受け取る形にする。",
        ]),
      ),
    ],
    "vitest/consistent-test-it": ["error", { fn: "test" }],
    "vitest/consistent-vitest-vi": "error",
    "vitest/no-alias-methods": "error",
    "vitest/no-duplicate-hooks": "error",
    "vitest/no-identical-title": "error",
    "vitest/no-import-node-test": "error",
    "vitest/no-test-prefixes": "error",
    "vitest/no-test-return-statement": "error",
    "vitest/prefer-comparison-matcher": "error",
    "vitest/prefer-equality-matcher": "error",
    "vitest/prefer-hooks-in-order": "error",
    "vitest/prefer-hooks-on-top": "error",
    "vitest/prefer-importing-vitest-globals": "error",
    "vitest/prefer-strict-equal": "error",
    "vitest/prefer-to-be": "error",
    "vitest/prefer-to-contain": "error",
    "vitest/prefer-to-have-length": "error",
    "vitest/prefer-todo": "error",
  },
} satisfies Omit<OxlintOverride, "files">;
