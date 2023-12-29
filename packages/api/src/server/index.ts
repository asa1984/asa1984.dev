import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import type { Bindings } from "../types";

import { blogRoute } from "./blog.route";
import { taskRoute } from "./task.route";
import { contextRoute } from "./context.route";
import { imageDeliverRoute, imageCacheRoute } from "./image.route";

export const app = new Hono<{ Bindings: Bindings }>();

export const root = app
  // .use("*", logger())
  .use("/api/*", (c, next) => {
    const auth = bearerAuth({ token: c.env.API_TOKEN });
    return auth(c, next);
  })
  .get("/api/hello", (c) => {
    return c.text("Hello, world!");
  })
  .route("/api", blogRoute)
  .route("/api", taskRoute)
  .route("/api", contextRoute)
  .route("/api", imageCacheRoute)
  .route("/image", imageDeliverRoute);
