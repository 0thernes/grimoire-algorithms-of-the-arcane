#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/cocktail_sort.sh"
values=(5 1 4 2 8 0 -3)
cocktail_shaker_sort values
[[ "${values[*]}" == "-3 0 1 2 4 5 8" ]] || { echo "primary failed: ${values[*]}" >&2; exit 1; }
dup=(3 3 2 1)
cocktail_shaker_sort dup
[[ "${dup[*]}" == "1 2 3 3" ]] || { echo "duplicate failed: ${dup[*]}" >&2; exit 1; }
echo 'bash cocktail ok'
