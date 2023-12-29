import { hc } from "hono/client";
import { root } from "./server";

type AppType = typeof root;

export const createClient = ({
  baseUrl,
  token,
}: {
  baseUrl: string;
  token: string;
}) =>
  hc<AppType>(baseUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
