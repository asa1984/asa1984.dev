import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const next_config: NextConfig = {
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: true,
  },
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
  turbopack: {
    rules: {
      "*.graphql*": {
        loaders: [
          {
            loader: "@nitrogql/graphql-loader",
            options: {
              configFile: "./graphql.config.yaml",
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default next_config;

initOpenNextCloudflareForDev();
