#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"
package_manager="$(node -p "require('./package.json').packageManager")"
[[ "$package_manager" =~ ^yarn@[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Expected an exact Yarn version" >&2; exit 1; }
config=(--min-release-age=30)
if [[ -f .npmrc ]]; then
  config+=(--userconfig "$repo_root/.npmrc")
fi
# Use an isolated prefix rather than replacing runner-provided binaries.
yarn_prefix="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/pinned-yarn"
npm install --global --prefix "$yarn_prefix" --ignore-scripts "${config[@]}" "$package_manager"
export PATH="$yarn_prefix/bin:$PATH"
if [[ -n "${GITHUB_PATH:-}" ]]; then
  echo "$yarn_prefix/bin" >> "$GITHUB_PATH"
fi
[[ "$(yarn --version)" == "${package_manager#yarn@}" ]]
