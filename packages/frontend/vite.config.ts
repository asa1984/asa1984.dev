import { defineConfig } from "vite-plus";

// Env note: cached tasks run in a clean environment (only an allowlist of
// vars is passed through). Every task that reads content/Cloudflare env vars
// (dev, start, build:worker, deploy:*, secret:*) is cache: false, which opts
// out of that filtering and receives the full environment.

// `build` stays a package.json script (not a task): opennextjs-cloudflare
// build shells out to `pnpm build`, so the script must keep existing.

// Tasks are intentionally unchained (no dependsOn on codegen): CI runs
// `vp run codegen` once as an explicit step before the parallel check
// steps, and the deploy workflows drive build:worker / deploy / secret
// as separate steps.
export default defineConfig({
  run: {
    tasks: {
      "codegen:css": { command: "panda codegen" },
      "codegen:types": { command: "wrangler types" },
      codegen: "vp run codegen:css && vp run codegen:types",
      typecheck: {
        command: "tsc",
        output: [{ auto: true }, "!**/*.tsbuildinfo"],
      },
      test: { command: "vitest run" },
      dev: {
        command: "rimraf ./next && next dev",
        cache: false,
      },
      start: {
        command:
          "opennextjs-cloudflare build && opennextjs-cloudflare populateCache local && wrangler dev --port 3000 --var ALLOW_EMPTY_CONTENT:${ALLOW_EMPTY_CONTENT:-1} --var CONTENT_GITHUB_TOKEN:${CONTENT_GITHUB_TOKEN:-local-dummy} --var CONTENT_WEBHOOK_SECRET:${CONTENT_WEBHOOK_SECRET:-local-dev}",
        cache: false,
      },
      "build:worker": {
        command: "opennextjs-cloudflare build",
        cache: false,
      },
      "deploy:dev": {
        command: "CLOUDFLARE_ENV=dev opennextjs-cloudflare deploy -- --env dev",
        cache: false,
      },
      "deploy:production": {
        command: "CLOUDFLARE_ENV=production opennextjs-cloudflare deploy -- --env production",
        cache: false,
      },
      "secret:dev": {
        command:
          "node -e 'process.stdout.write(JSON.stringify({ CONTENT_GITHUB_TOKEN: process.env.CONTENT_GITHUB_TOKEN, CONTENT_WEBHOOK_SECRET: process.env.CONTENT_WEBHOOK_SECRET }))' | wrangler secret bulk --env dev",
        cache: false,
      },
      "secret:production": {
        command:
          "node -e 'process.stdout.write(JSON.stringify({ CONTENT_GITHUB_TOKEN: process.env.CONTENT_GITHUB_TOKEN, CONTENT_WEBHOOK_SECRET: process.env.CONTENT_WEBHOOK_SECRET }))' | wrangler secret bulk --env production",
        cache: false,
      },
    },
  },
});
