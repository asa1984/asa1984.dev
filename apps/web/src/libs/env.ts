import { z } from "zod";

const shape = {
  CONTENT_GITHUB_TOKEN: z.string().min(1),
  CONTENT_WEBHOOK_SECRET: z.string().min(1),
  FRONTEND_URL: z.url(),
};

type Key = keyof typeof shape;

const is_key = (key: string | symbol): key is Key =>
  typeof key === "string" && Object.hasOwn(shape, key);

export type Env = Readonly<Record<Key, string>>;

// The CI smoke build (ALLOW_EMPTY_CONTENT=1) runs without a GitHub token and
// without secrets; hand it inert-but-wellformed values so module init and
// `new URL(...)` still work. Everything else gets validated on first access.
const smoke: Env = {
  CONTENT_GITHUB_TOKEN: "smoke-build",
  CONTENT_WEBHOOK_SECRET: "smoke-build",
  FRONTEND_URL: "http://smoke-build.invalid",
};

// Lazy per-key validation: on Cloudflare, process.env is populated from the
// worker env at request time, so an eager module-scope parse would run too
// early (and would also break `next build`, which imports modules while
// collecting page data).
export const env: Env = new Proxy(smoke, {
  get: (_target, key) => {
    if (!is_key(key)) {
      return;
    }
    if (process.env["ALLOW_EMPTY_CONTENT"] === "1") {
      return smoke[key];
    }
    const result = shape[key].safeParse(process.env[key]);
    if (!result.success) {
      throw new Error(
        `Invalid environment variable ${key}: ${result.error.issues[0]?.message ?? "unknown"}`,
      );
    }
    return result.data;
  },
});
