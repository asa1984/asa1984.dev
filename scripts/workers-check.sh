#!/usr/bin/env bash
# Builds both Workers through the production bundling path, enforces gzip
# bundle-size budgets, and smoke-tests each bundle in workerd (wrangler dev).
#
# Rationale (issue #31): the three production-only 500s — worker over the
# 3 MiB gzip limit, workerd's eval() ban breaking the MDX runtime, and the
# POST-fetch data-cache collision — were all invisible to a plain `next build`.
# This script exercises the real bundle in the real runtime instead.
#
# Usage: scripts/workers-check.sh   (from anywhere; needs pnpm deps installed
# and generated files present — run `pnpm run gen` first)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Cloudflare's limit is 3 MiB gzip per Worker. Budgets leave headroom so
# growth is caught in a PR, not at the limit.
FRONTEND_BUDGET=2800000
BACKEND_BUDGET=1000000

BACKEND_PORT=8791
FRONTEND_PORT=8792

cleanup() {
  pkill -f "wrangler dev.*--port $BACKEND_PORT" 2>/dev/null || true
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

echo "=== backend: bundle size ==="
(cd "$ROOT/packages/backend" && pnpm exec wrangler deploy --dry-run --outdir .size-check >/dev/null 2>&1)
check_budget backend "$(gzip_size "$(bundle_of "$ROOT/packages/backend/.size-check")")" "$BACKEND_BUDGET"

echo "=== frontend: production bundle (opennextjs-cloudflare) ==="
(cd "$ROOT/packages/frontend" && ALLOW_EMPTY_CONTENT=1 pnpm run build:prod >/dev/null)
(cd "$ROOT/packages/frontend" && pnpm exec wrangler deploy --dry-run --outdir .size-check >/dev/null 2>&1)
check_budget frontend "$(gzip_size "$(bundle_of "$ROOT/packages/frontend/.size-check")")" "$FRONTEND_BUDGET"

echo "=== backend: workerd smoke ==="
(cd "$ROOT/packages/backend" && pnpm exec wrangler dev --port $BACKEND_PORT \
  --var BACKEND_API_TOKEN:smoke --var FRONTEND_API_TOKEN:smoke \
  --var FRONTEND_URL:http://smoke.invalid >/dev/null 2>&1 &)
# Unauthenticated /graphql returning 401 proves the worker booted and routed.
wait_for "http://127.0.0.1:$BACKEND_PORT/graphql" 401 60

echo "=== frontend: workerd smoke ==="
(cd "$ROOT/packages/frontend" && pnpm exec wrangler dev --port $FRONTEND_PORT \
  --var CONTENT_GITHUB_TOKEN:smoke \
  --var FRONTEND_URL:http://smoke.invalid --var FRONTEND_API_TOKEN:smoke \
  --var ALLOW_EMPTY_CONTENT:1 >/dev/null 2>&1 &)
wait_for "http://127.0.0.1:$FRONTEND_PORT/" 200 90
expect "http://127.0.0.1:$FRONTEND_PORT/blog" 200
expect "http://127.0.0.1:$FRONTEND_PORT/rss.xml" 200

echo "workers-check: all green"
