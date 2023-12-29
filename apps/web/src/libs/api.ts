import { createClient } from "@asa1984.dev/api";
import { env } from "./env";

export const client = createClient({
  baseUrl: env.API_URL,
  token: env.API_TOKEN,
});
