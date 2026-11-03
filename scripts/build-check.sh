#!/usr/bin/env bash
# Builds the site the way the deploy workflows do and smoke-tests the output
# served as Workers static assets (apps/web/deploy/wrangler.jsonc).
#
# Usage: scripts/build-check.sh   (from anywhere; needs pnpm deps installed
# and generated files present — run `vp run codegen` first)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=8792

cleanup() {
  pkill -f "wrangler dev.*--port $PORT" 2>/dev/null || true
}
trap cleanup EXIT

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

expect() { # path expected_status
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 15 "http://127.0.0.1:$PORT$1")
  if [ "$code" != "$2" ]; then
    echo "FAIL: GET $1 -> $code (expected $2)"
    exit 1
  fi
  echo "OK: GET $1 -> $code"
}

echo "=== build"
(cd "$ROOT/apps/web" && VITE_SITE_URL=https://asa1984.dev pnpm exec vp run build >/dev/null)

echo "=== smoke"
(cd "$ROOT/apps/web" && pnpm exec wrangler dev --config deploy/wrangler.jsonc --port $PORT >/dev/null 2>&1 &)
wait_for "http://127.0.0.1:$PORT/" 200 90
expect / 200
expect /blog 200
expect /blog/first 200
expect /context 200
expect /profile 200
expect /rss.xml 200
expect /content-assets/blog/first/first.webp 200
expect /blog/unknown 404

echo "build-check: all green"
