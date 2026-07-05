#!/usr/bin/env bash
boyer_moore_search() {
  local text="$1"
  local pattern="$2"
  local n=${#text}
  local m=${#pattern}
  if (( m == 0 )); then printf "0\n"; return 0; fi
  if (( m > n )); then return 0; fi

  declare -A last=()
  local i j s bad good delta key
  for (( i = 0; i < m; i++ )); do
    key="${pattern:i:1}"
    last["$key"]=$i
  done

  local -a shift bpos matches
  for (( i = 0; i <= m; i++ )); do shift[$i]=0; bpos[$i]=0; done
  i=$m
  j=$((m + 1))
  bpos[$i]=$j
  while (( i > 0 )); do
    while (( j <= m )) && [[ "${pattern:i-1:1}" != "${pattern:j-1:1}" ]]; do
      if (( shift[j] == 0 )); then shift[$j]=$((j - i)); fi
      j=${bpos[$j]}
    done
    ((i--))
    ((j--))
    bpos[$i]=$j
  done

  j=${bpos[0]}
  for (( i = 0; i <= m; i++ )); do
    if (( shift[i] == 0 )); then shift[$i]=$j; fi
    if (( i == j )); then j=${bpos[$j]}; fi
  done

  s=0
  while (( s <= n - m )); do
    j=$((m - 1))
    while (( j >= 0 )) && [[ "${pattern:j:1}" == "${text:s+j:1}" ]]; do
      ((j--))
    done
    if (( j < 0 )); then
      matches+=("$s")
      s=$((s + shift[0]))
    else
      key="${text:s+j:1}"
      bad=$((j - ${last[$key]:--1}))
      good=${shift[$((j + 1))]}
      delta=$bad
      if (( good > delta )); then delta=$good; fi
      if (( delta < 1 )); then delta=1; fi
      s=$((s + delta))
    fi
  done

  printf "%s\n" "${matches[@]}"
}
