//! Parity with `src/data/acmi.ts`: with `HEAT3D_ACMI_PARITY_IN` and
//! `HEAT3D_ACMI_PARITY_OUT` set, every file of the input folder goes through
//! `acmi_text` and `parse_acmi` and is written as the JSON the web app's
//! parser gives through the parity script's `dump-js.mjs` (numbers as their
//! bit patterns, text columns as labels and ids), so the two can be compared
//! file for file. Without the variables it does nothing: no recording lives
//! in the repository.
//!
//! `HEAT3D_ACMI_BENCH=<file>` (release build, `--ignored`) times one large file.

use heat3d_core::acmi::{acmi_text, parse_acmi};
use heat3d_core::table::Column;
use serde_json::{json, Value};

fn hx(v: f64) -> Value {
    if v.is_nan() {
        Value::from("NaN")
    } else {
        Value::from(format!("{:016x}", v.to_bits()))
    }
}

#[test]
fn acmi_parity_dump() {
    let var = |k: &str| std::env::var(k);
    let (Ok(input), Ok(output)) = (var("HEAT3D_ACMI_PARITY_IN"), var("HEAT3D_ACMI_PARITY_OUT")) else {
        return;
    };
    std::fs::create_dir_all(&output).unwrap();
    let mut files: Vec<String> =
        std::fs::read_dir(&input).unwrap().map(|e| e.unwrap().file_name().into_string().unwrap()).collect();
    files.sort();
    for f in files {
        let bytes = std::fs::read(format!("{input}/{f}")).unwrap();
        let out = match acmi_text(&bytes) {
            Err(_) => json!({ "error": true }),
            Ok(text) => {
                let t = parse_acmi(&text, &f);
                let data: Vec<Value> = t
                    .data
                    .iter()
                    .map(|c| match c {
                        Column::Num(v) => json!({ "num": v.iter().map(|&x| hx(x)).collect::<Vec<_>>() }),
                        Column::Text(d) => json!({ "labels": d.labels, "ids": d.ids }),
                    })
                    .collect();
                json!({
                    "text": text,
                    "columns": t.columns,
                    "numeric": t.data.iter().map(|c| c.is_numeric()).collect::<Vec<_>>(),
                    "rows": t.rows,
                    "title": t.title,
                    "referenceTime": t.reference_time.map(hx),
                    "reference": { "lon": hx(t.reference_lon), "lat": hx(t.reference_lat) },
                    "flatWorld": t.flat_world,
                    "globals": t.globals.iter().map(|(k, v)| json!([k, v])).collect::<Vec<_>>(),
                    "completeness": t.completeness.iter().map(|(k, c)| json!([k, {
                        "seen": c.seen, "decoded": c.decoded, "partial": c.partial, "raw": c.raw, "lost": c.lost
                    }])).collect::<Vec<_>>(),
                    "data": data,
                })
            }
        };
        std::fs::write(format!("{output}/{f}.json"), serde_json::to_string(&out).unwrap()).unwrap();
    }
}

#[test]
#[ignore]
fn acmi_bench() {
    let Ok(file) = std::env::var("HEAT3D_ACMI_BENCH") else { return };
    let bytes = std::fs::read(&file).unwrap();
    let t0 = std::time::Instant::now();
    let text = acmi_text(&bytes).unwrap();
    let t1 = std::time::Instant::now();
    let t = parse_acmi(&text, "bench");
    let t2 = std::time::Instant::now();
    let lines = text.bytes().filter(|&b| b == b'\n').count() + 1;
    let parse = (t2 - t1).as_secs_f64();
    eprintln!(
        "{} MB, {lines} lines, {} rows, {} columns: text {:.3} s, parse {:.3} s = \
         {:.2} M rows/s, {:.2} M lines/s, {:.0} MB/s",
        bytes.len() / 1_000_000,
        t.rows,
        t.columns.len(),
        (t1 - t0).as_secs_f64(),
        parse,
        t.rows as f64 / parse / 1e6,
        lines as f64 / parse / 1e6,
        text.len() as f64 / parse / 1e6
    );
}
