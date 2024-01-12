import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    BACKEND_URL: z.string(),
    BACKEND_API_TOKEN: z.string(),
    FRONTEND_API_TOKEN: z.string(),
  })
  .passthrough();

export const env = envSchema.parse(process.env);
