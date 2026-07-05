#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/jump_hash.sh"

expect() {
  local key="$1"
  local buckets="$2"
  local expected="$3"
  local actual
  actual=$(jump_consistent_hash "$key" "$buckets")
  if [[ "$actual" != "$expected" ]]; then
    printf "Key %s: expected %s, saw %s\n" "$key" "$expected" "$actual" >&2
    exit 1
  fi
}

expect 0 10 0
expect 1 10 6
expect 10 10 7
expect 256 10 3
expect 99999 10 7
printf "bash jumphash ok\n"
