#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/reservoir.sh"

stream=(10 20 30 40 50 60 70 80 90 100)
k=5

IFS=$'\n' read -r -d '' -a s < <(reservoir_sample "$k" "${stream[@]}" && printf '\0') || true

if (( ${#s[@]} != k )); then
  printf "Expected size %s, saw %s\n" "$k" "${#s[@]}" >&2
  exit 1
fi

for x in "${s[@]}"; do
  found=0
  for y in "${stream[@]}"; do
    if [[ "$x" == "$y" ]]; then found=1; break; fi
  done
  if (( found == 0 )); then
    printf "Value %s not in stream\n" "$x" >&2
    exit 1
  fi
done
printf "bash reservoir ok\n"
