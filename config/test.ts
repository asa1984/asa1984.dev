/**
 * The Vitest baseline, copied from asa1984/conceptory packages/vite-plus-config.
 *
 * Modules aren't re-evaluated per test file; shared modules are evaluated once per worker. Since
 * state persists across files, lint and ast-grep forbid patterns that leave state behind, such as
 * module mocks and direct writes to globals.
 */

import type { TestUserConfig } from "vite-plus/test/config";

export const test = {
  isolate: false,
  // After each test, restore spies and the values changed by vi.stubGlobal and vi.stubEnv.
  restoreMocks: true,
  unstubGlobals: true,
  unstubEnvs: true,
} satisfies TestUserConfig;
