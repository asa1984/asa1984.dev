import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
/** @type {import('next').NextConfig} */
const next_config = {
  // Next externalizes shiki by default, which makes OpenNext inline the
  // whole package (every grammar and theme) into the Cloudflare worker and
  // exceed its size limit. Opt shiki back into bundling so only the
  // fine-grained imports in src/features/markdown/highlighter.ts remain.
  transpilePackages: ["shiki"],
  images: {
    // Article images are tiny webp files served by the /content-assets route;
    // sharp is unavailable in workerd, so skip the optimization pipeline.
    unoptimized: true,
  },
  turbopack: {
    // The bare "shiki" entry is only imported as rehype-pretty-code's unused
    // default highlighter; stub it out to keep the full bundle out of the
    // worker. Subpaths (shiki/core, shiki/dist/langs/*) are not affected.
    resolveAlias: {
      shiki: "./src/features/markdown/shiki-stub.ts",
    },
  },
};

export default next_config;

void initOpenNextCloudflareForDev();
