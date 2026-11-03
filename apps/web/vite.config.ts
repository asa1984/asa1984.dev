import { voidReact } from "@void/react/plugin";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

import { rss } from "./vite-plugins/rss.ts";

// Tasks are intentionally unchained (no dependsOn on codegen): CI runs `vp run codegen` once as an
// explicit step before the parallel check steps, and the deploy workflows run build and deploy as
// separate steps. Tasks that read VITE_SITE_URL or Cloudflare credentials are cache: false, which
// gives them the full environment instead of the cached tasks' allowlist.
export default defineConfig({
  plugins: [rss(), voidPlugin(), voidReact({ react: { compiler: true } })],
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
});
