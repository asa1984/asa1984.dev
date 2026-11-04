import type { OxlintOverride } from "vite-plus/lint";

/** React Compiler memoizes automatically, so the manual memoization APIs aren't used. */
const manualMemoization = {
  name: "react",
  importNames: ["useMemo", "useCallback", "memo"],
  message: "React Compiler がメモ化するので、useMemo、useCallback、memo は使わない。",
};

/** Settings for React applications compiled with React Compiler. */
export const reactLint = {
  plugins: ["react", "jsx-a11y"],
  rules: {
    // Rules that detect code React Compiler can't compile.
    "react/invariant": "error",
    "react/rule-suppression": "error",
    "react/syntax": "error",
    "react/todo": "error",
    "react/unsupported-syntax": "error",

    "react/button-has-type": "error",
    "react/function-component-definition": [
      "error",
      { namedComponents: "arrow-function", unnamedComponents: "arrow-function" },
    ],
    "react/hook-use-state": "error",
    "react/jsx-boolean-value": "error",
    "react/jsx-curly-brace-presence": "error",
    "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
    "react/jsx-fragments": "error",
    "react/jsx-pascal-case": "error",
    "react/no-clone-element": "error",
    "react/no-danger": "error",
    "react/no-react-children": "error",
    "react/no-unknown-property": "error",
    "react/only-export-components": "error",
    "react/prefer-function-component": "error",
    "react/self-closing-comp": "error",

    "jsx-a11y/anchor-ambiguous-text": "error",

    "eslint/no-restricted-imports": ["error", { paths: [manualMemoization] }],

    // It asks to wrap Context values in useMemo, but React Compiler handles memoization.
    "react/jsx-no-constructed-context-values": "off",
    // The new JSX transform doesn't require importing React.
    "react/react-in-jsx-scope": "off",
  },
} satisfies Omit<OxlintOverride, "files">;
