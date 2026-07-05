use std::collections::HashMap;

fn boyer_moore_search(text: &str, pattern: &str) -> Vec<usize> {
    if pattern.is_empty() {
        return vec![0];
    }
    if pattern.len() > text.len() {
        return vec![];
    }
    let t = text.as_bytes();
    let p = pattern.as_bytes();
    let m = p.len();
    let n = t.len();
    let mut last = HashMap::new();
    for (i, ch) in p.iter().enumerate() {
        last.insert(*ch, i as isize);
    }
    let mut shift = vec![0isize; m + 1];
    let mut bpos = vec![0isize; m + 1];
    let mut i = m as isize;
    let mut j = m as isize + 1;
    bpos[i as usize] = j;
    while i > 0 {
        while j <= m as isize && p[(i - 1) as usize] != p[(j - 1) as usize] {
            if shift[j as usize] == 0 {
                shift[j as usize] = j - i;
            }
            j = bpos[j as usize];
        }
        i -= 1;
        j -= 1;
        bpos[i as usize] = j;
    }
    j = bpos[0];
    for idx in 0..=m {
        if shift[idx] == 0 {
            shift[idx] = j;
        }
        if idx as isize == j {
            j = bpos[j as usize];
        }
    }
    let mut matches = Vec::new();
    let mut s = 0usize;
    while s <= n - m {
        let mut jj = m as isize - 1;
        while jj >= 0 && p[jj as usize] == t[s + jj as usize] {
            jj -= 1;
        }
        if jj < 0 {
            matches.push(s);
            s += shift[0] as usize;
        } else {
            let bad = jj - *last.get(&t[s + jj as usize]).unwrap_or(&-1);
            let good = shift[jj as usize + 1];
            s += 1.max(bad.max(good)) as usize;
        }
    }
    matches
}

fn expect(text: &str, pattern: &str, expected: Vec<usize>) {
    let actual = boyer_moore_search(text, pattern);
    assert_eq!(actual, expected, "{}/{}", text, pattern);
}

fn main() {
    expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", vec![17]);
    expect("bananana", "ana", vec![1, 3, 5]);
    expect("aaaaa", "aa", vec![0, 1, 2, 3]);
    expect("abcdef", "gh", vec![]);
    expect("needle", "needle", vec![0]);
    expect("anything", "", vec![0]);
    println!("rust boyermoore ok");
}
