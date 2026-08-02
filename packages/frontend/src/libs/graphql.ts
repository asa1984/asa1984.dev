import { Client, fetchExchange } from "urql";
import { env } from "@/libs/env";

export const client = new Client({
  url: `${env.BACKEND_URL}/graphql`,
  exchanges: [fetchExchange],
  // Next's data cache keys fetches by URL, so GraphQL POSTs would all collide
  // on /graphql and return whichever response was cached first. GET requests
  // carry the query in the URL, which keeps the cache keys distinct.
  preferGetMethod: "force",
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${env.BACKEND_API_TOKEN}`,
    },
  },
});
