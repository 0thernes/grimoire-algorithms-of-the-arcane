cocktail_shaker_sort() {
  local -n arr=$1
  local start=0
  local end=$((${#arr[@]} - 1))
  local swapped=1
  local i tmp
  while (( swapped )); do
    swapped=0
    for ((i=start; i<end; i++)); do
      if (( arr[i] > arr[i+1] )); then
        tmp=${arr[i]}; arr[i]=${arr[i+1]}; arr[i+1]=$tmp
        swapped=1
      fi
    done
    (( swapped )) || break
    swapped=0
    ((end--))
    for ((i=end; i>start; i--)); do
      if (( arr[i-1] > arr[i] )); then
        tmp=${arr[i-1]}; arr[i-1]=${arr[i]}; arr[i]=$tmp
        swapped=1
      fi
    done
    ((start+=1))
  done
}
