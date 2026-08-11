import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { z } from "zod";

import { imageKey } from "../image-key";
import type { Bindings } from "../types";

const CACHE_NAME = "image";
const MAX_AGE = 60 * 60 * 24 * 30;

const route = new Hono<{ Bindings: Bindings }>();

const imageCache = cache({
  cacheName: CACHE_NAME,
  cacheControl: `max-age=${MAX_AGE}`,
});

export const imageDeliverRoute = route.get(
  "/delivery/:key",
  imageCache,
  async (c) => {
    const key = c.req.param("key");
    const reqEtag = c.req.header("if-none-match");

    const object = await c.env.BUCKET.get(key);
    if (!object) return c.notFound();
    if (reqEtag === object.etag) return c.body(null, 304);

    const image = await object.arrayBuffer();

    return c.body(image, 200, {
      etag: object.etag,
    });
  },
);

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
    const key = await imageKey(content, slug, file);
    if (!key) return c.body(null, 500);
    const buffer = await c.req.arrayBuffer();
    await c.env.BUCKET.put(key, buffer);
    return c.body(key, 200);
  })
  .get("/image/list", async (c) => {
    const objects: { key: string; etag: string }[] = [];
    let cursor: string | undefined;
    do {
      const listed = await c.env.BUCKET.list({ cursor });
      for (const object of listed.objects) {
        objects.push({ key: object.key, etag: object.etag });
      }
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);
    return c.json({ objects });
  })
  .delete("/image/object/:key", async (c) => {
    const key = c.req.param("key");
    await c.env.BUCKET.delete(key);
    // Purge the delivery cache so the deleted image stops being served.
    const deliveryCache = await caches.open(CACHE_NAME);
    await deliveryCache.delete(
      new URL(`/image/delivery/${key}`, c.req.url).toString(),
    );
    return c.body(null, 204);
  });
