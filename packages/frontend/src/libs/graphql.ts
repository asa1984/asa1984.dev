import { Client, fetchExchange, cacheExchange } from "urql";
import { env } from "@/libs/env";

export const client = new Client({
  url: `${env.API_URL}/graphql`,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${env.API_TOKEN}`,
    },
  },
});
