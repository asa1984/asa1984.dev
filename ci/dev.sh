pnpm install --frozen-lockfile --no-optional --ignore-scripts
pnpm build
wrangler pages deploy ./out --project-name=trashbox --branch dev
