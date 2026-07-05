#!/usr/bin/env bash
reservoir_sample() {
  local k="$1"
  shift
  local stream=("$@")
  local n=${#stream[@]}
  if (( k <= 0 )); then return 0; fi
  if (( n <= k )); then
    printf "%s\n" "${stream[@]}"
    return 0
  fi
  
  local -a res=()
  for ((i=0; i<k; i++)); do res+=("${stream[i]}"); done

  for (( i = k; i < n; i++ )); do
    local j=$(( RANDOM % (i + 1) ))
    if (( j < k )); then
      res[$j]=${stream[i]}
    fi
  done
  printf "%s\n" "${res[@]}"
}
