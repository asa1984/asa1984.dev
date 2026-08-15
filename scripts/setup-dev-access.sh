#!/usr/bin/env bash
# One-time setup of Cloudflare Access (Zero Trust) in front of dev.asa1984.dev.
#
# Creates two Access applications:
#   1. dev.asa1984.dev/api/revalidate — decision "bypass": the endpoint has
#      its own bearer-token auth and must stay reachable from the content
#      repository's CI. Access matches the most specific path first, so this
#      carve-out wins over the app below.
#   2. dev.asa1984.dev — allow only ALLOWED_EMAIL (One-Time PIN login).
#
# Requirements:
#   - CLOUDFLARE_ACCOUNT_ID
#   - CLOUDFLARE_API_TOKEN with "Access: Apps and Policies - Edit"
#     (the deploy token does NOT have this; create a scoped one and run this
#     once, e.g. via `op run`)
#   - ALLOWED_EMAIL (e.g. your login email)
#
# Usage: ALLOWED_EMAIL=you@example.com scripts/setup-dev-access.sh
set -euo pipefail

: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID}"
: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN (Access edit scope)}"
: "${ALLOWED_EMAIL:?set ALLOWED_EMAIL}"

api="https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/access/apps"

cf() {
  curl --fail-with-body -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" "$@"
}

echo "==> Creating bypass app for dev.asa1984.dev/api/revalidate"
bypass_app=$(cf -X POST "$api" --data '{
  "name": "asa1984-web-dev revalidate (bypass)",
  "domain": "dev.asa1984.dev/api/revalidate",
  "type": "self_hosted"
}' | jq -r '.result.id')
cf -X POST "$api/$bypass_app/policies" --data '{
  "name": "bypass (endpoint has its own bearer auth)",
  "decision": "bypass",
  "include": [{ "everyone": {} }]
}' >/dev/null
echo "    app id: $bypass_app"

echo "==> Creating protected app for dev.asa1984.dev"
main_app=$(cf -X POST "$api" --data '{
  "name": "asa1984-web-dev",
  "domain": "dev.asa1984.dev",
  "type": "self_hosted",
  "session_duration": "730h"
}' | jq -r '.result.id')
cf -X POST "$api/$main_app/policies" --data "{
  \"name\": \"owner only\",
  \"decision\": \"allow\",
  \"include\": [{ \"email\": { \"email\": \"$ALLOWED_EMAIL\" } }]
}" >/dev/null
echo "    app id: $main_app"

echo "done: dev.asa1984.dev is now behind Access (One-Time PIN for $ALLOWED_EMAIL)"
