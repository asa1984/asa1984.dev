import type { AppType } from "@asa1984.dev/backend";
import { hc } from "hono/client";
import { env } from "./env";

export const client = hc<AppType>(env.API_URL, {
  headers: {
    Authorization: `Bearer ${env.API_TOKEN}`,
  },
});
