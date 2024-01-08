import { Hono } from "hono";
import { cache } from "hono/cache";
// import { sha256 } from "hono/utils/crypto";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Bindings } from "../types";
// import { detectType } from "../utils";
// import { optimizeImage } from "wasm-image-optimization";

const CACHE_NAME = "api-image";
const MAX_AGE = 60 * 60 * 24 * 30;

const route = new Hono<{ Bindings: Bindings }>();

route.get(
  "/delivery/*",
  cache({
    cacheName: CACHE_NAME,
    cacheControl: `max-age=${MAX_AGE}`,
  })
);

const imageCache = cache({
  cacheName: CACHE_NAME,
  cacheControl: `max-age=${MAX_AGE}`,
});

export const imageDeliverRoute = route
  .get("/delivery/:key", async (c) => {
    const key = c.req.param("key");
    const reqEtag = c.req.header("if-none-match");

    const object = await c.env.BUCKET.get(key);
    if (!object) return c.notFound();

    const data = await object.arrayBuffer();
    const contentType = object.httpMetadata?.contentType ?? "";

    if (reqEtag === object.etag) return c.body(null, 304);

    return c.body(data, 200, {
      "Content-Type": contentType,
      etag: object.etag,
    });
  })
  .get("/delivery/:content/:slug/:file", imageCache, async (c) => {
    const content = c.req.param("content");
    const slug = c.req.param("slug");
    const file = c.req.param("file");
    const reqEtag = c.req.header("if-none-match");

    const key = `${content}/${slug}/${file}`;
    const object = await c.env.BUCKET.get(key);
    if (!object) return c.notFound();

    const image = await object.arrayBuffer();
    if (reqEtag === object.etag) return c.body(null, 304);

    // const optimized = await optimizeImage({
    //   image,
    //   quality: 80,
    // });
    const optimized = image;
    if (!optimized) return c.body(null, 500);

    return c.body(optimized, 200, {
      "Content-Type": "image/webp",
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
      })
    ),
    async (c) => {
      const { key } = c.req.valid("json");
      const imageCache = await caches.open(CACHE_NAME);
      const result = await imageCache.delete(key);
      return result
        ? c.body(`The cache for ${key} was deleted`, 200)
        : c.body("Cache not found", 404);
    }
  )
  // .post(
  //   "/image/upload",
  //   zValidator(
  //     "json",
  //     z.object({
  //       key: z.string(),
  //       body: z.string(),
  //     })
  //   ),
  //   async (c) => {
  //     const { key, body: base64 } = c.req.valid("json");
  //     const type = detectType(base64);
  //     if (!type) return c.body("Invalid image", 400);
  //     const body = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  //     const hashedKey = (await sha256(key)) + "." + type.suffix;
  //     await c.env.BUCKET.put(hashedKey, body, {
  //       httpMetadata: { contentType: type.mimeType },
  //     });
  //     return c.body(hashedKey, 200);
  //   }
  // )
  .post("/image/upload/:content/:slug/:file", async (c) => {
    const content = c.req.param("content");
    const slug = c.req.param("slug");
    const file = c.req.param("file");
    const key = `${content}/${slug}/${file}`;
    const buffer = await c.req.arrayBuffer();
    await c.env.BUCKET.put(key, buffer);
    return c.body(key, 200);
  });
