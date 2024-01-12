import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { revalidatePath } from "next/cache";
import { env } from "@/libs/env";

const app = new Hono().basePath("/api");

export const api_route = app
  .use(bearerAuth({ token: env.FRONTEND_API_TOKEN }))
  .post("/revalidate/blog", (c) => {
    revalidatePath("/blog");
    return c.json({ ok: true });
  })
  .post("/revalidate/blog/:slug", (c) => {
    const { slug } = c.req.param();
    revalidatePath(`/blog/${slug}`);
    return c.json({ ok: true });
  })
  .post("/revalidate/context", (c) => {
    revalidatePath("/context");
    return c.json({ ok: true });
  })
  .post("/revalidate/context/:slug", (c) => {
    const { slug } = c.req.param();
    revalidatePath(`/context/${slug}`);
    return c.json({ ok: true });
  });

export type ApiRouteType = typeof api_route;
