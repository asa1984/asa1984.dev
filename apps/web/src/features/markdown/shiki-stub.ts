// next.config.mjs aliases the bare "shiki" specifier to this stub.
// The only runtime consumer is rehype-pretty-code's default getHighlighter,
// which compile_mdx.ts always overrides with the fine-grained highlighter in
// ./highlighter.ts. Bundling the real entry would drag every grammar and
// theme into the worker and exceed Cloudflare's size limit.
export const getSingletonHighlighter = (): never => {
  throw new Error(
    "The full shiki bundle is stubbed out; use features/markdown/highlighter instead.",
  );
};
