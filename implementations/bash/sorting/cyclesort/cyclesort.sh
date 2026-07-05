#!/usr/bin/env bash
cycle_sort() {
  local -n _arr_ref="$1"
  local n=${#_arr_ref[@]}
  local writes=0
  local cycle_start i pos item tmp tmp2
  
  for (( cycle_start = 0; cycle_start < n - 1; cycle_start++ )); do
    item=${_arr_ref[cycle_start]}
    pos=$cycle_start
    for (( i = cycle_start + 1; i < n; i++ )); do
      local val=${_arr_ref[i]}
      if (( val < item )); then
        pos=$((pos + 1))
      fi
    done
    if (( pos == cycle_start )); then
      continue
    fi
    while true; do
      local val=${_arr_ref[pos]}
      if (( item == val )); then
        pos=$((pos + 1))
      else
        break
      fi
    done
    
    tmp=${_arr_ref[pos]}
    _arr_ref[$pos]=$item
    item=$tmp
    writes=$((writes + 1))

    while (( pos != cycle_start )); do
      pos=$cycle_start
      for (( i = cycle_start + 1; i < n; i++ )); do
        local val=${_arr_ref[i]}
        if (( val < item )); then
          pos=$((pos + 1))
        fi
      done
      while true; do
        local val=${_arr_ref[pos]}
        if (( item == val )); then
          pos=$((pos + 1))
        else
          break
        fi
      done
      
      tmp2=${_arr_ref[pos]}
      _arr_ref[$pos]=$item
      item=$tmp2
      writes=$((writes + 1))
    done
  done
  CYCLE_SORT_WRITES=$writes
  echo "$writes"
}
