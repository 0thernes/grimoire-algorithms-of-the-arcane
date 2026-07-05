open System
open System.Collections.Generic

let sample (stream: 'T list) (k: int) = 
    if k <= 0 then []
    elif stream.Length <= k then stream
    else
        let reservoir = Array.ofList stream.[0 .. k-1]
        let rand = Random()
        for i in k .. stream.Length - 1 do
            let j = rand.Next(i + 1)
            if j < k then
                reservoir.[j] <- stream.[i]
        List.ofArray reservoir

[<EntryPoint>]
let main _ = 
    let stream = [10; 20; 30; 40; 50; 60; 70; 80; 90; 100]
    let k = 5
    let s = sample stream k
    if s.Length <> k then failwith "Expected size mismatch"
    for x in s do
        if not (List.contains x stream) then failwith "Value not in stream"
    let unique = HashSet<int>(s)
    if unique.Count <> k then failwith "Expected unique"
    printfn "fsharp reservoir ok"
    0
