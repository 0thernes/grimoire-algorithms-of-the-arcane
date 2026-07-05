open System

let hash (key: uint64) (numBuckets: int) =
    let mutable b = -1L
    let mutable j = 0L
    let mutable k = key
    let mutable guard = 0
    while j < int64 numBuckets && guard < 100 do
        guard <- guard + 1
        b <- j
        k <- k * 2862933555777941757UL + 1UL
        let denominator = float ((k >>> 33) + 1UL)
        j <- int64 (Math.Floor (float (b + 1L) * (2147483648.0 / denominator)))
    int b

[<EntryPoint>]
let main _ =
    let cases = [
        (0UL, 10, 0)
        (1UL, 10, 6)
        (10UL, 10, 7)
        (256UL, 10, 3)
        (99999UL, 10, 7)
    ]
    for key, buckets, expected in cases do
        let actual = hash key buckets
        if actual <> expected then
            failwithf "Key %d: expected %d, saw %d" key expected actual
    printfn "fsharp jumphash ok"
    0
