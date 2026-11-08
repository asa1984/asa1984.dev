import type { KnipConfig } from "knip";

export default {
  workspaces: {
    ".": {
      entry: ["config/**/*.ts"],
    },
    "packages/css-modules-mapper": {
      // Fixtures are type checked only by tsc spawning the mapper in test/tsc.test.ts.
      project: ["src/**/*.ts", "test/**/*.ts", "*.ts", "!test/fixtures/**"],
    },
    "apps/web": {
      entry: [
        // Void loads pages, their server modules, and layouts by their file names.
        "src/pages/**/*.{island,server}.{ts,tsx}",
        "src/pages/**/layout.tsx",
        "src/env.ts",
        "void.config.ts",
        // vite-plugins/rss.ts loads it through runnerImport, which knip cannot follow.
        "src/features/feed.ts",
      ],
      project: ["src/**/*.{ts,tsx,scss,sass}", "vite-plugins/**/*.ts", "*.ts"],
      postcss: { config: ["postcss.config.ts"] },
      // @vitejs/plugin-react loads it for `compiler: true` (React Compiler) as an optional peer.
      ignoreDependencies: ["oxc-transform-react"],
    },
  },
} satisfies KnipConfig;
