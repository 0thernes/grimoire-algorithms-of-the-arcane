#!/usr/bin/env bash

stooge_sort() {
  local arr_name=$1
  local -n _st_ref=$arr_name
  local l=$2
  local h=$3
  
  if (( l >= h )); then
    return
  fi
  
  local val_l=${_st_ref[l]}
  local val_h=${_st_ref[h]}
  if (( val_l > val_h )); then
    _st_ref[l]=$val_h
    _st_ref[h]=$val_l
  fi
  
  local len=$(( h - l + 1 ))
  if (( len > 2 )); then
    local t=$(( len / 3 ))
    stooge_sort "$arr_name" $l $(( h - t ))
    stooge_sort "$arr_name" $(( l + t )) $h
    stooge_sort "$arr_name" $l $(( h - t ))
  fi
}
