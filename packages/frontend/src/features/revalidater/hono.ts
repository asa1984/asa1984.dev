import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { revalidateTag } from "next/cache";
import { CONTENT_CACHE_TAG } from "@/features/content/github";
import { env } from "@/libs/env";

const app = new Hono().basePath("/api");

// Called by the content repository's CI on push. Every content fetch is
// tagged CONTENT_CACHE_TAG, so revalidating the one tag refreshes all
// articles, lists, RSS, and images on their next request — no redeploy.
export const api_route = app
  .use(bearerAuth({ token: env.FRONTEND_API_TOKEN }))
  .post("/revalidate", (c) => {
    revalidateTag(CONTENT_CACHE_TAG, "max");
    return c.json({ ok: true });
  });

export type ApiRouteType = typeof api_route;
