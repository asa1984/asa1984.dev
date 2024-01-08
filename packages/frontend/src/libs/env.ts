import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_TOKEN: z.string().default(""),
  })
  .passthrough();

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  API_URL: parsed.NODE_ENV === "development" ? "http://localhost:8787" : "https://api.asa1984.dev",
};
