#!/usr/bin/env bash
# Update the default branch and create a new branch from it.
#
# Usage: bash fresh-branch.sh <branch-name>
#
# Success: JSON on stdout, exit 0.
# Failure: {"ok":false,"message":"<git's own output>"} on stderr, exit 1.

set -uo pipefail

fail() {
  local m=${1//\\/\\\\}
  m=${m//\"/\\\"}
  m=${m//$'\n'/\\n}
  printf '{"ok":false,"message":"%s"}\n' "$m" >&2
  exit 1
}

# Run a command; on failure, report the command and its output.
run() {
  local out
  out=$("$@" 2>&1) || fail "$*: $(grep -v '^hint:' <<<"$out")"
  printf '%s' "$out"
}

name=${1:-}
[[ -n $name ]] || fail "usage: fresh-branch.sh <branch-name>"

run git rev-parse --is-inside-work-tree >/dev/null

if git remote get-url origin >/dev/null 2>&1; then
  run git fetch origin --prune >/dev/null
  run git remote set-head origin --auto >/dev/null
  base=$(run git symbolic-ref --short refs/remotes/origin/HEAD) || exit 1
  base=${base#origin/}
  run git switch "$base" >/dev/null
  run git merge --ff-only "origin/$base" >/dev/null
else
  base=$(git config --get init.defaultBranch || true)
  for b in "$base" main master trunk develop; do
    if [[ -n $b ]] && git show-ref --verify --quiet "refs/heads/$b"; then
      base=$b
      break
    fi
    base=""
  done
  [[ -n $base ]] || fail "no origin remote and no local main, master, trunk, or develop branch"
  run git switch "$base" >/dev/null
fi

run git switch -c "$name" >/dev/null

subject=$(git log -1 --format=%s)
subject=${subject//\\/\\\\}
subject=${subject//\"/\\\"}
printf '{"ok":true,"default":"%s","branch":"%s","commit":"%s","subject":"%s"}\n' \
  "$base" "$name" "$(git rev-parse --short HEAD)" "$subject"
