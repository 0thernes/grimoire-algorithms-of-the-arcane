let sort (values: int array) =
    let a = Array.copy values
    let mutable start = 0
    let mutable finish = a.Length - 1
    let mutable swapped = true
    while swapped do
        swapped <- false
        for i in start .. finish - 1 do
            if a[i] > a[i + 1] then
                let t = a[i]
                a[i] <- a[i + 1]
                a[i + 1] <- t
                swapped <- true
        if swapped then
            swapped <- false
            finish <- finish - 1
            for i in finish .. -1 .. start + 1 do
                if a[i - 1] > a[i] then
                    let t = a[i - 1]
                    a[i - 1] <- a[i]
                    a[i] <- t
                    swapped <- true
            start <- start + 1
    a

[<EntryPoint>]
let main _ =
    if sort [|5; 1; 4; 2; 8; 0; -3|] <> [|-3; 0; 1; 2; 4; 5; 8|] then failwith "primary case failed"
    if sort [|3; 3; 2; 1|] <> [|1; 2; 3; 3|] then failwith "duplicate case failed"
    printfn "fsharp cocktail ok"
    0
