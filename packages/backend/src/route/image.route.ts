import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { sha256 } from "hono/utils/crypto";
import { optimizeImage } from "wasm-image-optimization";
import { z } from "zod";

import type { Bindings } from "../types";

const CACHE_NAME = "image";
const MAX_AGE = 60 * 60 * 24 * 30;

const route = new Hono<{ Bindings: Bindings }>();

const imageCache = cache({
  cacheName: CACHE_NAME,
  cacheControl: `max-age=${MAX_AGE}`,
});

export const imageDeliverRoute = route.get("/delivery/:key", imageCache, async (c) => {
  const key = c.req.param("key");
  const reqEtag = c.req.header("if-none-match");

  const object = await c.env.BUCKET.get(key);
  if (!object) return c.notFound();
  if (reqEtag === object.etag) return c.body(null, 304);

  const image = await object.arrayBuffer();

  // MEMO: wasm-image-optimization sometimes exceeds the memory limit.
  // const optimized = await optimizeImage({
  //   image,
  //   quality: 80,
  // });
  // if (!optimized) return c.body(null, 500);

  return c.body(image, 200, {
    // "Content-Type": "image/webp",
    etag: object.etag,
  });
});

export const imageCacheRoute = route
  .delete(
    "/image/cache",
    zValidator(
      "json",
      z.object({
        key: z.string(),
      }),
    ),
    async (c) => {
      const { key } = c.req.valid("json");
      const imageCache = await caches.open(CACHE_NAME);
      const result = await imageCache.delete(key);
      return result
        ? c.body(`The cache for ${key} was deleted`, 200)
        : c.body("Cache not found", 404);
    },
  )
  .post("/image/upload/:content/:slug/:file", async (c) => {
    const content = c.req.param("content");
    const slug = c.req.param("slug");
    const file = c.req.param("file");
    const key = await sha256(`${content}/${slug}/${file}`);
    if (!key) return c.body(null, 500);
    const buffer = await c.req.arrayBuffer();
    await c.env.BUCKET.put(key, buffer);
    return c.body(key, 200);
  });
