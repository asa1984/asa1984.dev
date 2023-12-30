import { Hono } from "hono";
import { html } from "hono/html";
import { bearerAuth } from "hono/bearer-auth";
import type { Bindings } from "./types";

import { builder } from "./graphql";
import "./graphql";
import { createYoga } from "graphql-yoga";

import { blogRoute } from "./route/blog.route";
import { taskRoute } from "./route/task.route";
import { contextRoute } from "./route/context.route";
import { imageDeliverRoute, imageCacheRoute } from "./route/image.route";

export const app = new Hono<{ Bindings: Bindings }>();

export const schema = builder.toSchema();

export const root = app
  .get("/graphql", (c) => {
    const yoga = createYoga({
      schema,
      context: {
        DB: c.env.DB,
      },
    });
    return yoga(c.req.raw, {});
  })
  .post("/graphql", (c) => {
    const yoga = createYoga({
      schema,
      context: {
        DB: c.env.DB,
      },
    });
    return yoga(c.req.raw, {});
  })
  .get("/graph", (c) => {
    return c.html(
      html`
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Simple GraphiQL Example</title>
            <link
              href="https://unpkg.com/graphiql/graphiql.min.css"
              rel="stylesheet"
            />
          </head>

          <body style="margin: 0;">
            <script
              crossorigin
              src="https://unpkg.com/react/umd/react.production.min.js"
            ></script>
            <script
              crossorigin
              src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
            ></script>
            <script
              crossorigin
              src="https://unpkg.com/graphiql/graphiql.min.js"
            ></script>

            <div id="graphiql" style="height: 100vh;"></div>
            <script>
              const fetcher = GraphiQL.createFetcher({
                url: "/graphql",
              });

              ReactDOM.render(
                React.createElement(GraphiQL, { fetcher: fetcher }),
                document.getElementById("graphiql")
              );
            </script>
          </body>
        </html>
      `
    );
  })
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

export type AppType = typeof root;
