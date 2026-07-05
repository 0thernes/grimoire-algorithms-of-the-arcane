let search (text: string) (pattern: string) =
    if pattern.Length = 0 then
        [||]
    else
        let lps = Array.zeroCreate<int> pattern.Length
        let mutable len = 0
        let mutable i = 1
        while i < pattern.Length do
            if pattern[i] = pattern[len] then
                len <- len + 1
                lps[i] <- len
                i <- i + 1
            elif len <> 0 then
                len <- lps[len - 1]
            else
                lps[i] <- 0
                i <- i + 1
        let matches = ResizeArray<int>()
        let mutable ti = 0
        let mutable pj = 0
        while ti < text.Length do
            if text[ti] = pattern[pj] then
                ti <- ti + 1
                pj <- pj + 1
                if pj = pattern.Length then
                    matches.Add(ti - pj)
                    pj <- lps[pj - 1]
            elif pj <> 0 then
                pj <- lps[pj - 1]
            else
                ti <- ti + 1
        matches.ToArray()

let expect text pattern expected =
    let actual = search text pattern
    if actual <> expected then failwithf "%s failed" pattern

[<EntryPoint>]
let main _ =
    expect "ababcabcabababd" "ababd" [|10|]
    expect "aaaaa" "aa" [|0; 1; 2; 3|]
    expect "abcdef" "gh" [||]
    expect "abc" "abc" [|0|]
    printfn "fsharp kmp ok"
    0
