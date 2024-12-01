// import { createEnv } from "@t3-oss/env-nextjs";
// import { z } from "zod";

// export const env = createEnv({
//   server: {
//     BACKEND_URL: z.string().url(),
//     BACKEND_API_TOKEN: z.string(),
//     FRONTEND_URL: z.string().url(),
//     FRONTEND_API_TOKEN: z.string(),
//   },
//   experimental__runtimeEnv: process.env,
// });

export type Env = Readonly<{
  BACKEND_URL: string;
  BACKEND_API_TOKEN: string;
  FRONTEND_URL: string;
  FRONTEND_API_TOKEN: string;
}>;

export const env = process.env as unknown as Env;
