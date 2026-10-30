#!/usr/bin/env bash
set -euo pipefail

stage=${1:-all}
if [[ $# -gt 1 ]] || [[ ! "$stage" =~ ^(all|stories|themes|responsive|built)$ ]]; then
  echo "Usage: validate-site.sh [all|stories|themes|responsive|built]" >&2
  exit 2
fi

run_check() {
  local label=$1
  shift
  if [[ "${GITHUB_ACTIONS:-}" == true ]]; then
    echo "::group::$label"
  else
    printf '\n==> %s\n' "$label"
  fi
  "$@"
  if [[ "${GITHUB_ACTIONS:-}" == true ]]; then echo "::endgroup::"; fi
}

validate_stories() {
  run_check "Test: stories" bun run test:stories
  run_check "Test: overlay compatibility" bun run test:overlays
}

validate_themes() {
  run_check "Test: themes" bun run --cwd apps/storybook test:themes --maxWorkers=2
}

validate_responsive() {
  run_check "Test: layouts" bun run --cwd apps/storybook test:site
  run_check "Test: accessibility" bun run --cwd apps/storybook test:a11y
}

validate_built() (
  site_port=${SITE_VALIDATION_PORT:-4175}
  qa_port=$((site_port + 1))
  python3 - "$site_port" "$qa_port" <<'PY'
import socket
import sys

for port in map(int, sys.argv[1:]):
    with socket.socket() as listener:
        try:
            listener.bind(("127.0.0.1", port))
        except OSError as error:
            raise SystemExit(f"Validation port {port} is unavailable: {error}")
PY
  run_check "Install deployment tools" npm ci --prefix deployment/site
  run_check "Deployment contracts" npm test --prefix deployment/site
  run_check "Theme override contracts" bun run --cwd apps/storybook verify:overrides
  run_check "Build public site and Storybook" bun run --cwd apps/storybook build:site
  run_check "Stage production site" bun scripts/site-stage.ts

  qa_output=$(mktemp -d)
  cleanup() {
    for pid in "${site_server_pid:-}" "${qa_server_pid:-}"; do
      if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; fi
    done
    rm -rf "$qa_output"
  }
  trap cleanup EXIT

  run_check "Build internal control fixtures" bun run --cwd apps/storybook build:internal --output-dir "$qa_output/storybook"
  python3 -m http.server "$site_port" --bind 127.0.0.1 --directory deployment/site/public &
  site_server_pid=$!
  python3 -m http.server "$qa_port" --bind 127.0.0.1 --directory "$qa_output" &
  qa_server_pid=$!
  curl --fail --retry 8 --retry-connrefused --retry-delay 1 "http://127.0.0.1:$site_port/" > /dev/null
  curl --fail --retry 8 --retry-connrefused --retry-delay 1 "http://127.0.0.1:$qa_port/storybook/index.json" > /dev/null
  run_check "Storybook navigation and themes" env STORYBOOK_URL=http://127.0.0.1:$site_port/storybook bun run --cwd apps/storybook verify:storybook
  run_check "Recipe documentation and navigation" env RECIPE_SITE_URL=http://127.0.0.1:$site_port bun run --cwd apps/storybook verify:recipes
  run_check "Component documentation" env STORYBOOK_URL=http://127.0.0.1:$site_port/storybook bun run --cwd apps/storybook verify:component-docs
  run_check "Chromium and WebKit site journeys" env CATALOG_PREVIEW_URL=http://127.0.0.1:$site_port bun run --cwd apps/storybook verify:release
  run_check "Form controls and reflow" env CONTROL_EDGES_URL=http://127.0.0.1:$qa_port/storybook bun run --cwd apps/storybook verify:controls

  run_check "Build deployment package" npm run build --prefix deployment/site
  run_check "Deployment dry-run" npm run check --prefix deployment/site
)

case "$stage" in
  all)
    validate_stories
    validate_themes
    validate_responsive
    validate_built
    ;;
  stories) validate_stories ;;
  themes) validate_themes ;;
  responsive) validate_responsive ;;
  built) validate_built ;;
esac
