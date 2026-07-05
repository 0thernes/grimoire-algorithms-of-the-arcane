use rand::Rng;

fn reservoir_sample<T: Clone>(stream: &[T], k: usize) -> Vec<T> {
    if k == 0 {
        return vec![];
    }
    if stream.len() <= k {
        return stream.to_vec();
    }
    let mut reservoir = stream[0..k].to_vec();
    let mut rng = rand::thread_rng();
    for i in k..stream.len() {
        let j = rng.gen_range(0..=i);
        if j < k {
            reservoir[j] = stream[i].clone();
        }
    }
    reservoir
}

fn main() {
    let stream = vec![10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    let k = 5;
    let s = reservoir_sample(&stream, k);
    assert_eq!(s.len(), k);
    for x in &s {
        assert!(stream.contains(x));
    }
    println!("rust reservoir ok");
}
