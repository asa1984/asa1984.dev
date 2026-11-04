import { defineConfig } from "void/config";

export default defineConfig({
  sourceDir: "src",
  // Every page is prerendered, so dist/client is the whole site and deploys as static assets
  // (deploy/wrangler.jsonc). 404.html is the prerendered src/pages/404.island.tsx.
  output: "static",
  head: {
    htmlAttrs: { lang: "ja" },
    meta: [
      // The HTML spec spells it "utf-8".
      // oxlint-disable-next-line unicorn/text-encoding-identifier-case
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    link: [{ rel: "icon", href: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
  },
  // Pages are prerendered inside workerd with these settings.
  worker: {
    compatibility_date: "2026-10-01",
    compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"],
  },
});
