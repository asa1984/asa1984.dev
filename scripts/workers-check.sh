#!/usr/bin/env bash
# Builds the Worker through the production bundling path, enforces a gzip
# bundle-size budget, and smoke-tests the bundle in workerd (wrangler dev).
#
# Rationale (issue #31): the production-only 500s — worker over the 3 MiB
# gzip limit, workerd's eval() ban, and the POST-fetch data-cache collision —
# were all invisible to a plain `next build`. This script exercises the real
# bundle in the real runtime instead.
#
# Usage: scripts/workers-check.sh   (from anywhere; needs pnpm deps installed
# and generated files present — run `vp run codegen` first)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Cloudflare's limit is 3 MiB gzip per Worker. The budget leaves headroom so
# growth is caught in a PR, not at the limit.
FRONTEND_BUDGET=2800000

FRONTEND_PORT=8792

cleanup() {
  pkill -f "wrangler dev.*--port $FRONTEND_PORT" 2>/dev/null || true
}
trap cleanup EXIT

# Largest .js in a dry-run outdir is the entry bundle (name follows the
# wrangler `main` entry, e.g. main.js / worker.js).
bundle_of() {
  find "$1" -maxdepth 1 -name "*.js" -exec ls -S {} + | head -1
}

gzip_size() {
  gzip -c "$1" | wc -c | tr -d ' '
}

check_budget() { # label size budget
  if [ "$2" -gt "$3" ]; then
    echo "FAIL: $1 bundle ${2} bytes gzip exceeds budget ${3}"
    exit 1
  fi
  echo "OK: $1 bundle ${2} bytes gzip (budget ${3})"
}

wait_for() { # url expected_status timeout_sec
  local deadline=$((SECONDS + $3))
  while [ $SECONDS -lt $deadline ]; do
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" -m 3 "$1" 2>/dev/null || true)
    [ "$code" = "$2" ] && return 0
    sleep 2
  done
  echo "FAIL: $1 did not return $2 within $3 seconds (last: ${code:-none})"
  return 1
}

expect() { # url expected_status
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 15 "$1")
  if [ "$code" != "$2" ]; then
    echo "FAIL: GET $1 -> $code (expected $2)"
    exit 1
  fi
  echo "OK: GET $1 -> $code"
}

echo "=== frontend: production bundle (opennextjs-cloudflare) ==="
(cd "$ROOT/packages/frontend" && ALLOW_EMPTY_CONTENT=1 pnpm exec vp run build:worker >/dev/null)

# opennextjs-cloudflare bakes any .env file into the worker (next-env.mjs),
# where its values apply at runtime and can shadow real worker secrets.
# No .env is tracked, so the baked objects must stay empty.
NEXT_ENV="$ROOT/packages/frontend/.open-next/cloudflare/next-env.mjs"
if [ -f "$NEXT_ENV" ] && grep -qE '\{"' "$NEXT_ENV"; then
  echo "FAIL: $NEXT_ENV contains baked env values:"
  cat "$NEXT_ENV"
  exit 1
fi
echo "OK: no env values baked into the worker"
(cd "$ROOT/packages/frontend" && pnpm exec wrangler deploy --dry-run --outdir .size-check >/dev/null 2>&1)
check_budget frontend "$(gzip_size "$(bundle_of "$ROOT/packages/frontend/.size-check")")" "$FRONTEND_BUDGET"

echo "=== frontend: workerd smoke ==="
(cd "$ROOT/packages/frontend" && pnpm exec wrangler dev --port $FRONTEND_PORT \
  --var CONTENT_GITHUB_TOKEN:smoke --var CONTENT_WEBHOOK_SECRET:smoke \
  --var FRONTEND_URL:http://smoke.invalid \
  --var ALLOW_EMPTY_CONTENT:1 >/dev/null 2>&1 &)
wait_for "http://127.0.0.1:$FRONTEND_PORT/" 200 90
expect "http://127.0.0.1:$FRONTEND_PORT/blog" 200
expect "http://127.0.0.1:$FRONTEND_PORT/rss.xml" 200

echo "workers-check: all green"
