kmp_search() {
  local text="$1"
  local pattern="$2"
  local m=${#pattern}
  if (( m == 0 )); then return 0; fi
  local -a lps matches
  local len=0 i=1
  while (( i < m )); do
    if [[ "${pattern:i:1}" == "${pattern:len:1}" ]]; then
      ((len+=1))
      lps[i]=$len
      ((i+=1))
    elif (( len != 0 )); then
      len=${lps[len-1]:-0}
    else
      lps[i]=0
      ((i+=1))
    fi
  done
  local n=${#text}
  local ti=0 pj=0
  while (( ti < n )); do
    if [[ "${text:ti:1}" == "${pattern:pj:1}" ]]; then
      ((ti+=1))
      ((pj+=1))
      if (( pj == m )); then
        matches+=("$((ti - pj))")
        pj=${lps[pj-1]:-0}
      fi
    elif (( pj != 0 )); then
      pj=${lps[pj-1]:-0}
    else
      ((ti+=1))
    fi
  done
  printf '%s\n' "${matches[@]}"
}
