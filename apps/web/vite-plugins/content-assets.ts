import { cp, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

import type { Plugin } from "vite-plus";

/** The media types of the files articles may reference. */
const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

/** `<collection>/<slug>/<file>`, the only shape of path served from contents/. */
const assetPath = /^\/[\w-]+\/[\w-]+\/[\w.-]+$/u;

/**
 * Serves the files next to each article in contents/ at /content-assets/<collection>/<slug>/<file>.
 * The build copies them into the client output; the dev server reads them on request.
 */
export const contentAssets = ({ contentsDir }: { contentsDir: string }): Plugin[] => [
  {
    name: "asa1984:content-assets-serve",
    apply: "serve",
    configureServer: (server) => {
      server.middlewares.use("/content-assets", (request, response, next) => {
        const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
        const contentType = contentTypes[extname(path).toLowerCase()];
        if (!assetPath.test(path) || contentType === undefined) {
          next();
          return;
        }
        const serve = async () => {
          try {
            const file = await readFile(join(contentsDir, path));
            response.setHeader("Content-Type", contentType);
            response.end(file);
          } catch {
            next();
          }
        };
        void serve();
      });
    },
  },
  {
    name: "asa1984:content-assets-build",
    apply: "build",
    applyToEnvironment: (environment) => environment.name === "client",
    writeBundle: async (options) => {
      if (options.dir === undefined) {
        throw new Error("The client output directory is unknown");
      }
      await cp(contentsDir, join(options.dir, "content-assets"), {
        recursive: true,
        filter: (source) => !source.endsWith(".md"),
      });
    },
  },
];
