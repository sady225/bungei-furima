#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

fail() {
  printf 'Safety check failed: %s\n' "$1" >&2
  exit 1
}

if rg -n --glob '*.html' --glob '*.js' \
  'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(' .; then
  fail 'unsafe DOM or script execution sink found'
fi

if rg -n '<script[^>]+https://www\.instagram\.com|<iframe' index.html ai-editor/index.html; then
  fail 'external embed is present in the initial HTML'
fi

if rg -n 'fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon' ai-editor; then
  fail 'Phase 1-2 office must not use network or browser storage APIs'
fi

for page in index.html ai-editor/index.html; do
  if ! rg -q 'Content-Security-Policy' "$page"; then
    fail "CSP is missing from $page"
  fi
done

node --check ai-editor/app.js
awk '/^[[:space:]]*<script>$/{flag=1;next}/^[[:space:]]*<\/script>/{if(flag){flag=0; exit}}flag' index.html > /tmp/bungei-furima-inline.js
node --check /tmp/bungei-furima-inline.js
rm -f /tmp/bungei-furima-inline.js

bash scripts/build-public-site.sh
printf 'Site safety checks passed.\n'
