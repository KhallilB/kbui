#!/usr/bin/env bash
set -euo pipefail

npm ci --prefix deployment/site
npm test --prefix deployment/site
bun run test:stories
bun run --cwd apps/storybook test:site
bun run --cwd apps/storybook test:a11y
bun run --cwd apps/storybook build:site
bun scripts/site-stage.ts

python3 -m http.server 4175 --bind 127.0.0.1 --directory deployment/site/public &
site_server_pid=$!
trap 'kill "$site_server_pid"' EXIT
curl --fail --retry 8 --retry-connrefused --retry-delay 1 http://127.0.0.1:4175/ > /dev/null
CATALOG_PREVIEW_URL=http://127.0.0.1:4175 bun run --cwd apps/storybook verify:release
CONTROL_EDGES_URL=http://127.0.0.1:4175/storybook bun run --cwd apps/storybook verify:controls

npm run build --prefix deployment/site
npm run check --prefix deployment/site
