import type { DummyRuleMap } from "vite-plus/lint";

/** Rules picked from the restriction category. */
export const restrictionRules = {
  "typescript/no-explicit-any": "error",
  "typescript/no-non-null-assertion": "error",
  "typescript/no-non-null-asserted-nullish-coalescing": "error",
  "typescript/non-nullable-type-assertion-style": "error",
  "typescript/no-dynamic-delete": "error",
  "typescript/no-empty-object-type": "error",
  "typescript/no-import-type-side-effects": "error",
  "typescript/no-invalid-void-type": "error",
  "typescript/no-namespace": "error",
  "typescript/no-require-imports": "error",
  "typescript/no-var-requires": "error",
  "typescript/prefer-literal-enum-member": "error",
  "typescript/use-unknown-in-catch-callback-variable": "error",

  "eslint/no-alert": "error",
  "eslint/no-empty": "error",
  "eslint/no-eq-null": "error",
  "eslint/no-implicit-globals": "error",
  "eslint/no-param-reassign": ["error", { props: true }],
  "eslint/no-proto": "error",
  "eslint/no-regex-spaces": "error",
  "eslint/no-sequences": "error",
  "eslint/no-var": "error",
  // Allow only `void promise`, which marks a Promise as intentionally not awaited.
  "eslint/no-void": ["error", { allowAsStatement: true }],

  // Native ESM requires file extensions in relative imports.
  "import/extensions": ["error", "always", { ignorePackages: true }],
  "import/no-amd": "error",
  "import/no-commonjs": "error",
  "import/no-cycle": "error",
  "import/no-default-export": "error",
  "import/no-dynamic-require": "error",
  "import/no-webpack-loader-syntax": "error",
  "import/unambiguous": "error",

  "node/no-new-require": "error",
  "node/no-path-concat": "error",

  "oxc/bad-bitwise-operator": "error",
  "oxc/no-const-enum": "error",

  "promise/spec-only": "error",

  "unicorn/no-abusive-eslint-disable": "error",
  "unicorn/no-anonymous-default-export": "error",
  "unicorn/no-array-for-each": "error",
  "unicorn/no-array-reduce": "error",
  "unicorn/no-document-cookie": "error",
  "unicorn/no-length-as-slice-end": "error",
  "unicorn/no-magic-array-flat-depth": "error",
  "unicorn/no-useless-error-capture-stack-trace": "error",
  "unicorn/prefer-modern-math-apis": "error",
  "unicorn/prefer-module": "error",
  "unicorn/prefer-node-protocol": "error",
  "unicorn/prefer-number-properties": "error",

  "jsdoc/empty-tags": "error",
} satisfies DummyRuleMap;
