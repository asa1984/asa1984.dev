import path from "node:path";

/** @type {import('next').NextConfig} */
const next_config = {
  // Next 15 externalizes shiki by default, which makes OpenNext inline the
  // whole package (every grammar and theme) into the Cloudflare worker and
  // exceed its size limit. Opt shiki back into webpack bundling so only the
  // fine-grained imports in src/features/markdown/highlighter.ts remain.
  transpilePackages: ["shiki"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8787",
      },
      {
        protocol: "https",
        hostname: "api.asa1984.dev",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.graphql$/,
      loader: "@nitrogql/graphql-loader",
      options: {
        configFile: "./graphql.config.yaml",
      },
    });

    // The bare "shiki" entry is only imported as rehype-pretty-code's unused
    // default highlighter; stub it out to keep the full bundle out of the
    // worker. Subpaths (shiki/core, shiki/dist/langs/*) are not affected.
    config.resolve.alias = {
      ...config.resolve.alias,
      shiki$: path.resolve(
        import.meta.dirname,
        "src/features/markdown/shiki-stub.ts",
      ),
    };

    return config;
  },
};

export default next_config;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
