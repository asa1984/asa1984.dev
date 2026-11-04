import { fileURLToPath } from "node:url";

import { voidReact } from "@void/react/plugin";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

import { contentAssets } from "./vite-plugins/content-assets.ts";
import { rss } from "./vite-plugins/rss.ts";

// Tasks are intentionally unchained (no dependsOn on codegen): CI runs `vp run codegen` once as an
// explicit step before the parallel check steps, and the deploy workflows run build and deploy as
// separate steps. Tasks that read VITE_SITE_URL or Cloudflare credentials are cache: false, which
// gives them the full environment instead of the cached tasks' allowlist.
export default defineConfig(({ mode }) => ({
  // Tests import modules directly. Void's plugin would start the workerd runner and validate the
  // site's env, which unit tests need neither of.
  plugins:
    mode === "test"
      ? []
      : [
          contentAssets({ contentsDir: fileURLToPath(new URL("../../contents", import.meta.url)) }),
          rss(),
          voidPlugin(),
          voidReact({ react: { compiler: true } }),
        ],
  // The Vitest baseline of asa1984/conceptory: modules are evaluated once per worker instead of per
  // test file, so spies and stubbed globals and env are restored after each test.
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    isolate: false,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
  run: {
    tasks: {
      "codegen:css": { command: "panda codegen" },
      "codegen:types": { command: "void prepare" },
      codegen: "vp run codegen:css && vp run codegen:types",
      typecheck: {
        command: "tsc",
        cache: {
          output: [{ auto: true }, "!**/*.tsbuildinfo"],
        },
      },
      test: { command: "vp test run" },
      dev: {
        command: "vp dev",
        cache: false,
      },
      // Prerenders every page into dist/client. Link cards fetch their targets' OGP metadata, so
      // the build needs network access.
      build: {
        command: "vp build",
        cache: false,
      },
      // Serves the build output the way Cloudflare does.
      start: {
        command: "wrangler dev --config deploy/wrangler.jsonc --port 3000",
        cache: false,
      },
      "deploy:dev": {
        command: "wrangler deploy --config deploy/wrangler.jsonc --env dev",
        cache: false,
      },
      "deploy:production": {
        command: "wrangler deploy --config deploy/wrangler.jsonc --env production",
        cache: false,
      },
    },
  },
}));
