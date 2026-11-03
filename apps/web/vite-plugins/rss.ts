import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { runnerImport } from "vite-plus";
import type { Plugin, ResolvedConfig } from "vite-plus";

type FeedModule = { buildFeed: (siteUrl: string) => string };

/** Builds the feed by loading src/features/feed.ts through Vite, so `import.meta.glob` works. */
const renderFeed = async (config: ResolvedConfig): Promise<string> => {
  const siteUrl: unknown = config.env["VITE_SITE_URL"];
  if (typeof siteUrl !== "string" || siteUrl === "") {
    throw new Error("VITE_SITE_URL is not set");
  }
  const { module } = await runnerImport<FeedModule>("/src/features/feed.ts", {
    root: config.root,
    configFile: false,
    logLevel: "warn",
  });
  return module.buildFeed(siteUrl);
};

/**
 * Serves /rss.xml. Void prerenders pages only as HTML, so the build writes the feed into the
 * client output and the dev server renders it on request.
 */
export const rss = (): Plugin[] => {
  let buildConfig: ResolvedConfig | undefined;
  return [
    {
      name: "asa1984:rss-serve",
      apply: "serve",
      configureServer: (server) => {
        server.middlewares.use("/rss.xml", (_request, response, next) => {
          const serve = async () => {
            try {
              const feed = await renderFeed(server.config);
              response.setHeader("Content-Type", "application/xml");
              response.end(feed);
            } catch (error) {
              next(error);
            }
          };
          void serve();
        });
      },
    },
    {
      name: "asa1984:rss-build",
      apply: "build",
      applyToEnvironment: (environment) => environment.name === "client",
      configResolved: (config) => {
        buildConfig = config;
      },
      writeBundle: async (options) => {
        if (buildConfig === undefined) {
          throw new Error("The config has not been resolved");
        }
        const feed = await renderFeed(buildConfig);
        await writeFile(
          join(options.dir ?? join(buildConfig.root, "dist/client"), "rss.xml"),
          feed,
        );
      },
    },
  ];
};
