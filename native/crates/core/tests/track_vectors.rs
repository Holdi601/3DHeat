//! The GPU tracks' keys against the shared vectors (`native/vectors/tracks`): the rows and what
//! the page's store (`src/render/gpuTracks/store.ts`) builds of them, written by
//! `src/render/gpuTracks/coreKeys.test.ts`. The core's port (`tracks.rs`) must give the same key
//! ranges, spans, chunk spans and keys bit for bit; the attitudes within one step of a byte
//! (sin and cos may differ in their last bit between V8 and fdlibm) and their gap bits exactly.

use std::path::PathBuf;

use heat3d_core::tracks::{build_keys, TrackInput, TrackOptions, TrackRequest, GAP_BIT, PERSON_U32};

fn dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../vectors/tracks")
}

fn words(b: &[u8]) -> Vec<u32> {
    b.chunks_exact(4).map(|c| u32::from_le_bytes([c[0], c[1], c[2], c[3]])).collect()
}

fn floats(b: &[u8]) -> Vec<f32> {
    words(b).into_iter().map(f32::from_bits).collect()
}

#[derive(serde::Deserialize)]
struct Case {
    name: String,
    #[serde(flatten)]
    req: TrackRequest,
}

#[test]
fn core_keys_are_the_page_keys() {
    let rows = std::fs::read(dir().join("rows.bin")).unwrap();
    let head = words(&rows[..8]);
    let (n, persons) = (head[0] as usize, head[1] as usize);
    let col = |k: usize| &rows[8 + k * n * 4..8 + (k + 1) * n * 4];
    let (px, py, pz, time, yaw, pitch, roll) = (floats(col(0)), floats(col(1)), floats(col(2)), floats(col(3)), floats(col(4)), floats(col(5)), floats(col(6)));
    let (person, ev) = (words(col(7)), words(col(8)));
    let shared = &rows[8 + 9 * n * 4..8 + 9 * n * 4 + persons];
    let cases: Vec<Case> = serde_json::from_str(&std::fs::read_to_string(dir().join("cases.json")).unwrap()).unwrap();
    assert_eq!(cases.len(), 2);
    for c in cases {
        let own: Vec<bool> = c.req.own.iter().map(|&b| b != 0).collect();
        let inp = TrackInput { px: &px, py: &py, pz: &pz, time: &time, person: &person, yaw: Some(&yaw), pitch: Some(&pitch), roll: Some(&roll), events: Some((&ev, &own)), shared: Some(shared), persons: c.req.persons as usize };
        let k = build_keys(&inp, &TrackOptions { units: c.req.units, max_keys: c.req.max_keys as usize }).expect("keys");
        let want = std::fs::read(dir().join(format!("{}.bin", c.name))).unwrap();
        let w = words(&want);
        let (keys, chunk_u32, wp) = (w[0] as usize, w[1] as usize, w[2] as usize);
        assert_eq!(wp, persons);
        assert_eq!(k.keys, keys, "{}: keys", c.name);
        assert_eq!(k.samples, w[4] as usize, "{}: samples", c.name);
        assert_eq!(k.tolerance as f32, f32::from_bits(w[3]), "{}: tolerance", c.name);
        let mut at = 6;
        let mut take = |len: usize| {
            let s = w[at..at + len].to_vec();
            at += len;
            s
        };
        let entries = take(persons * PERSON_U32);
        let keys_a = take(keys * 2);
        let keys_b = take(keys);
        let chunks = take(chunk_u32);
        assert_eq!(k.person_words(), entries, "{}: persons' entries", c.name);
        assert_eq!(k.chunks, chunks, "{}: chunk spans", c.name);
        assert_eq!(k.keys_a, keys_a, "{}: keys", c.name);
        let mut exact = 0;
        for (j, (&a, &b)) in k.keys_b.iter().zip(&keys_b).enumerate() {
            assert_eq!(a & GAP_BIT, b & GAP_BIT, "{}: gap bit of key {j}", c.name);
            let near = (0..4).all(|i| {
                let (x, y) = ((a >> (i * 8)) as u8 as i8 as i32, (b >> (i * 8)) as u8 as i8 as i32);
                let (x, y) = if i == 3 { (x & 0x7f, y & 0x7f) } else { (x, y) };
                (x - y).abs() <= 1
            });
            assert!(near, "{}: attitude of key {j}: {a:08x} vs {b:08x}", c.name);
            exact += (a == b) as usize;
        }
        let gaps = k.persons.iter().filter(|p| p.gaps).count();
        let tracks = k.persons.iter().filter(|p| p.count > 0).count();
        println!("{}: {} keys of {} samples, tolerance {}, {tracks} tracks, {gaps} with gaps, attitudes {exact}/{} exact", c.name, k.keys, k.samples, k.tolerance, k.keys);
        assert!(gaps > 0 && tracks > 10);
        assert!(exact * 100 >= keys * 99, "{}: {exact} of {keys} attitudes exact", c.name);
    }
}
