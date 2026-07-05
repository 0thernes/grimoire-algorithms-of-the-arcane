#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/stoogesort.sh"

arr=(12 11 15 10 9 8 2 3 7 14 13 1 6 5 4)
expected=(1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)
stooge_sort arr 0 14

for (( i = 0; i < ${#arr[@]}; i++ )); do
  if (( arr[i] != expected[i] )); then
    printf "Sorting failed\n" >&2
    exit 1
  fi
done
printf "bash stoogesort ok\n"
