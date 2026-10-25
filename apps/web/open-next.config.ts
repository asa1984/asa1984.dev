import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  // The default queue is a dummy whose send() throws, which turned every
  // stale ISR hit into an error log. Content routes are force-dynamic and
  // never touch it, but /profile is ISR (its OGP fetch revalidates daily),
  // and any accidentally-static route should degrade to working ISR, not
  // errors. Uses the WORKER_SELF_REFERENCE binding from wrangler.jsonc.
  queue: memoryQueue,
});
