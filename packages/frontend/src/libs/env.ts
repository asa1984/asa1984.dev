import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.union([z.literal("development"), z.literal("production"), z.literal("test")]),
    BACKEND_API_TOKEN: z.string(),
    FRONTEND_API_TOKEN: z.string(),
    BACKEND_URL: z.string().url(),
  },
  experimental__runtimeEnv: process.env,
});
