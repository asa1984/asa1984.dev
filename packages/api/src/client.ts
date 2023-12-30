import { hc } from "hono/client";
import type { AppType } from "./server";

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
