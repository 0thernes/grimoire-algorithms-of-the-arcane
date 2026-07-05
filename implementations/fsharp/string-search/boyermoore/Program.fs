open System
open System.Collections.Generic

let search (text: string) (pattern: string) =
    if pattern.Length = 0 then
        [0]
    elif pattern.Length > text.Length then
        []
    else
        let m = pattern.Length
        let n = text.Length
        let last = Dictionary<char, int>()
        for i in 0 .. m - 1 do
            last.[pattern.[i]] <- i

        let shift = Array.zeroCreate<int> (m + 1)
        let bpos = Array.zeroCreate<int> (m + 1)
        let mutable i = m
        let mutable j = m + 1
        bpos.[i] <- j
        while i > 0 do
            while j <= m && pattern.[i - 1] <> pattern.[j - 1] do
                if shift.[j] = 0 then shift.[j] <- j - i
                j <- bpos.[j]
            i <- i - 1
            j <- j - 1
            bpos.[i] <- j

        j <- bpos.[0]
        for idx in 0 .. m do
            if shift.[idx] = 0 then shift.[idx] <- j
            if idx = j then j <- bpos.[j]

        let matches = ResizeArray<int>()
        let mutable s = 0
        while s <= n - m do
            j <- m - 1
            while j >= 0 && pattern.[j] = text.[s + j] do
                j <- j - 1
            if j < 0 then
                matches.Add(s)
                s <- s + shift.[0]
            else
                let mutable found = -1
                let ok = last.TryGetValue(text.[s + j], &found)
                let lastIndex = if ok then found else -1
                let bad = j - lastIndex
                s <- s + max 1 (max bad shift.[j + 1])

        List.ofSeq matches

let expect text pattern expected =
    let actual = search text pattern
    if actual <> expected then
        failwithf "%s/%s: %A <> %A" text pattern actual expected

[<EntryPoint>]
let main _ =
    expect "HERE IS A SIMPLE EXAMPLE" "EXAMPLE" [17]
    expect "bananana" "ana" [1; 3; 5]
    expect "aaaaa" "aa" [0; 1; 2; 3]
    expect "abcdef" "gh" []
    expect "needle" "needle" [0]
    expect "anything" "" [0]
    printfn "fsharp boyermoore ok"
    0
