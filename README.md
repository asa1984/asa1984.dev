# [asa1984.dev](https://asa1984.dev)

My personal website.

## Setup

```bash
gh repo clone asa1984/asa1984.dev
cd asa1984.dev
direnv allow # nix devshell + node_modules/.bin on PATH
corepack install
pnpm install
vp run dev
```

Scripts are managed by [Vite+](https://viteplus.dev/) tasks (`vite.config.ts`), not package.json scripts:

```bash
vp run dev        # codegen + Void dev server
vp run codegen    # panda codegen + void prepare
vp run build      # prerender every page into apps/web/dist/client
vp run start      # serve the build the way Cloudflare does
vp run test       # vitest (run codegen first)
vp run typecheck  # tsc (run codegen first)
vp lint           # oxlint (config: config/lint.ts, copied from asa1984/conceptory)
vp fmt            # oxfmt
```

Without direnv, prefix commands with `pnpm exec` (e.g. `pnpm exec vp run dev`).

## Content

Articles live in `apps/web/src/content/<blog|context>/<slug>.md` and their images in `apps/web/public/content-assets/<blog|context>/<slug>/`.
The site is built with [Void](https://void.cloud) and every page is prerendered, so publishing an article means deploying the site.
