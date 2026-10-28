#!/usr/bin/env bash
set -euo pipefail

npm ci --prefix deployment/site
npm test --prefix deployment/site
bun run test:stories
bun run --cwd apps/storybook verify:overrides
bun run --cwd apps/storybook test:site
bun run --cwd apps/storybook test:a11y
bun run --cwd apps/storybook build:site
bun scripts/site-stage.ts

site_port=${SITE_VALIDATION_PORT:-4175}
qa_port=$((site_port + 1))
qa_output=$(mktemp -d)
cleanup() {
  for pid in "${site_server_pid:-}" "${qa_server_pid:-}"; do
    if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; fi
  done
  rm -rf "$qa_output"
}
trap cleanup EXIT

bun run --cwd apps/storybook build:internal --output-dir "$qa_output/storybook"
python3 -m http.server "$site_port" --bind 127.0.0.1 --directory deployment/site/public &
site_server_pid=$!
python3 -m http.server "$qa_port" --bind 127.0.0.1 --directory "$qa_output" &
qa_server_pid=$!
curl --fail --retry 8 --retry-connrefused --retry-delay 1 "http://127.0.0.1:$site_port/" > /dev/null
curl --fail --retry 8 --retry-connrefused --retry-delay 1 "http://127.0.0.1:$qa_port/storybook/index.json" > /dev/null
STORYBOOK_URL=http://127.0.0.1:$site_port/storybook bun run --cwd apps/storybook verify:storybook
STORYBOOK_URL=http://127.0.0.1:$site_port/storybook bun run --cwd apps/storybook verify:component-docs
CATALOG_PREVIEW_URL=http://127.0.0.1:$site_port bun run --cwd apps/storybook verify:release
CONTROL_EDGES_URL=http://127.0.0.1:$qa_port/storybook bun run --cwd apps/storybook verify:controls

npm run build --prefix deployment/site
npm run check --prefix deployment/site
