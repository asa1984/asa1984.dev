import type { CSSModulesConfig } from "lightningcss";

/**
 * The CSS Modules options shared by the build and the content mapper, so the types describe
 * exactly what the bundler emits.
 *
 * Grid line names, grid areas, and container names are the layout vocabulary of the whole site:
 * the page grid names its lines, and nested subgrids place themselves by those names. Scoping
 * them per module would break that, so only class names, ids, and keyframes stay local.
 * Custom properties (`dashedIdents`) also stay global, because they are the design tokens.
 */
export const cssModules = {
  grid: false,
  container: false,
  dashedIdents: false,
} as const satisfies CSSModulesConfig;
