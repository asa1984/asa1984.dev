import { builder, type GraphQLContext } from "@asa1984.dev/graphql";
import { createYoga } from "graphql-yoga";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { FrontendRevalidater } from "./revalidater";
import { imageCacheRoute, imageDeliverRoute } from "./route/image.route";
import type { Bindings } from "./types";

export const app = new Hono<{ Bindings: Bindings }>();

export const schema = builder.toSchema();

const yoga = createYoga<{ env: Bindings }, GraphQLContext>({
  schema,
  context: ({ env }) => ({
    DB: env.DB,
    revalidater: new FrontendRevalidater(
      env.FRONTEND_URL,
      env.FRONTEND_API_TOKEN,
    ),
  }),
});

export const root = app
  .use("/graphql/*", (c, next) => {
    const auth = bearerAuth<{ Bindings: Bindings }>({
      token: c.env.BACKEND_API_TOKEN,
    });
    return auth(c, next);
  })
  .get("/graphql", (c) => {
    return yoga(c.req.raw, { env: c.env });
  })
  .post("/graphql", (c) => {
    return yoga(c.req.raw, { env: c.env });
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
