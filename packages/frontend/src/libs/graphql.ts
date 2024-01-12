import { Client, fetchExchange } from "urql";
import { env } from "@/libs/env";

export const client = new Client({
  url: `${env.BACKEND_URL}/graphql`,
  exchanges: [fetchExchange],
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${env.BACKEND_API_TOKEN}`,
    },
  },
});
