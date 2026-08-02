import { builder } from "@asa1984.dev/graphql";
import { createYoga } from "graphql-yoga";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { imageCacheRoute, imageDeliverRoute } from "./route/image.route";
import type { Bindings } from "./types";

export const app = new Hono<{ Bindings: Bindings }>();

export const schema = builder.toSchema();

export const root = app
  .use("/graphql/*", (c, next) => {
    const auth = bearerAuth<{ Bindings: Bindings }>({
      token: c.env.BACKEND_API_TOKEN,
    });
    return auth(c, next);
  })
  .get("/graphql", (c) => {
    const yoga = createYoga({
      schema,
      context: c.env,
    });
    return yoga(c.req.raw, {});
  })
  .post("/graphql", (c) => {
    const yoga = createYoga({
      schema,
      context: c.env,
    });
    return yoga(c.req.raw, {});
  })
  .use("/api/*", (c, next) => {
    const auth = bearerAuth<{ Bindings: Bindings }>({
      token: c.env.BACKEND_API_TOKEN,
    });
    return auth(c, next);
  })
  .get("/api/hello", (c) => {
    return c.text("Hello, world!");
  })
  .route("/api", imageCacheRoute)
  .route("/image", imageDeliverRoute);

export type AppType = typeof root;
