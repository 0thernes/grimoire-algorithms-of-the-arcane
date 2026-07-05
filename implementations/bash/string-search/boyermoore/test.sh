#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/boyer_moore.sh"

expect() {
  local text="$1"
  local pattern="$2"
  local expected="$3"
  local actual
  actual="$(boyer_moore_search "$text" "$pattern" | paste -sd "," -)"
  if [[ "$actual" != "$expected" ]]; then
    printf "%s/%s: expected %s saw %s\n" "$text" "$pattern" "$expected" "$actual" >&2
    exit 1
  fi
}

expect "HERE IS A SIMPLE EXAMPLE" "EXAMPLE" "17"
expect "bananana" "ana" "1,3,5"
expect "aaaaa" "aa" "0,1,2,3"
expect "abcdef" "gh" ""
expect "needle" "needle" "0"
expect "anything" "" "0"
printf "bash boyermoore ok\n"
