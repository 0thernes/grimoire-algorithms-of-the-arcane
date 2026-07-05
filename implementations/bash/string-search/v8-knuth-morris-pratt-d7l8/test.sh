#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/kmp.sh"

expect() {
  local text="$1"
  local pattern="$2"
  local expected="$3"
  local actual
  actual="$(kmp_search "$text" "$pattern" | paste -sd, -)"
  if [[ "$actual" != "$expected" ]]; then
    printf '%s: expected %s, saw %s\n' "$pattern" "$expected" "$actual" >&2
    exit 1
  fi
}

expect 'ababcabcabababd' 'ababd' '10'
expect 'aaaaa' 'aa' '0,1,2,3'
expect 'abcdef' 'gh' ''
expect 'abc' 'abc' '0'
printf 'bash kmp ok\n'
