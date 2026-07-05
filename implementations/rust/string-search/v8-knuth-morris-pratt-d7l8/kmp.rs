fn kmp_search(text: &str, pattern: &str) -> Vec<usize> {
    if pattern.is_empty() {
        return Vec::new();
    }
    let t = text.as_bytes();
    let p = pattern.as_bytes();
    let mut lps = vec![0usize; p.len()];
    let mut len = 0usize;
    let mut i = 1usize;
    while i < p.len() {
        if p[i] == p[len] {
            len += 1;
            lps[i] = len;
            i += 1;
        } else if len != 0 {
            len = lps[len - 1];
        } else {
            lps[i] = 0;
            i += 1;
        }
    }
    let mut matches = Vec::new();
    let mut ti = 0usize;
    let mut pj = 0usize;
    while ti < t.len() {
        if t[ti] == p[pj] {
            ti += 1;
            pj += 1;
            if pj == p.len() {
                matches.push(ti - pj);
                pj = lps[pj - 1];
            }
        } else if pj != 0 {
            pj = lps[pj - 1];
        } else {
            ti += 1;
        }
    }
    matches
}

fn main() {
    assert_eq!(kmp_search("ababcabcabababd", "ababd"), vec![10]);
    assert_eq!(kmp_search("aaaaa", "aa"), vec![0, 1, 2, 3]);
    assert_eq!(kmp_search("abcdef", "gh"), Vec::<usize>::new());
    assert_eq!(kmp_search("abc", "abc"), vec![0]);
    println!("rust kmp ok");
}
