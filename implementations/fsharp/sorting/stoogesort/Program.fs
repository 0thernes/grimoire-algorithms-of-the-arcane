open System

let rec stoogeSort (arr: int[]) (l: int) (h: int) =
    if l < h then
        if arr.[l] > arr.[h] then
            let tmp = arr.[l]
            arr.[l] <- arr.[h]
            arr.[h] <- tmp
        if h - l + 1 > 2 then
            let t = (h - l + 1) / 3
            stoogeSort arr l (h - t)
            stoogeSort arr (l + t) h
            stoogeSort arr l (h - t)

[<EntryPoint>]
let main _ =
    let arr = [| 12; 11; 15; 10; 9; 8; 2; 3; 7; 14; 13; 1; 6; 5; 4 |]
    let expected = [| 1; 2; 3; 4; 5; 6; 7; 8; 9; 10; 11; 12; 13; 14; 15 |]
    stoogeSort arr 0 (arr.Length - 1)
    if arr <> expected then failwith "Sorting failed"
    printfn "fsharp stoogesort ok"
    0
