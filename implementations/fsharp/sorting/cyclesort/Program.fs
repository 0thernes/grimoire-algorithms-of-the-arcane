open System

let sort (arr: int[]) =
    let mutable writes = 0
    for cycleStart in 0 .. arr.Length - 2 do
        let mutable item = arr.[cycleStart]
        let mutable pos = cycleStart
        for i in cycleStart + 1 .. arr.Length - 1 do
            if arr.[i] < item then pos <- pos + 1
        if pos <> cycleStart then
            while item = arr.[pos] do pos <- pos + 1
            let mutable tmp = arr.[pos]
            arr.[pos] <- item
            item <- tmp
            writes <- writes + 1
            while pos <> cycleStart do
                pos <- cycleStart
                for i in cycleStart + 1 .. arr.Length - 1 do
                    if arr.[i] < item then pos <- pos + 1
                while item = arr.[pos] do pos <- pos + 1
                let mutable tmp2 = arr.[pos]
                arr.[pos] <- item
                item <- tmp2
                writes <- writes + 1
    writes

[<EntryPoint>]
let main _ =
    let arr = [| 12; 11; 15; 10; 9; 8; 2; 3; 7; 14; 13; 1; 6; 5; 4 |]
    let expected = [| 1; 2; 3; 4; 5; 6; 7; 8; 9; 10; 11; 12; 13; 14; 15 |]
    let writes = sort arr
    if arr <> expected then failwith "Sorting failed"
    if writes <> 15 then failwithf "Expected 15 writes, saw %d" writes
    printfn "fsharp cyclesort ok"
    0
