import { z } from "zod";

const envSchema = z
  .object({
    BUILD_TARGET_ENV: z.enum(["development", "production", "preview"]).default("development"),
    API_URL: z.string().default("http://localhost:8787"),
    API_TOKEN: z.string().default(""),
  })
  .passthrough();

export const env = envSchema.parse(process.env);
