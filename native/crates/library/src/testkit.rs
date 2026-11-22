//! Synthetic files for tests (the library's own and the UI smoke test's):
//! containers, recordings and demos made up from nothing, never real data.

use std::io::Write;

/// A ZIP of `members`, stored (`deflate` false) or deflated.
pub fn zip(members: &[(&str, &[u8])], deflate: bool) -> Vec<u8> {
    let mut out = Vec::new();
    let mut cd = Vec::new();
    for (name, data) in members {
        let off = out.len() as u32;
        let crc = crc32(data);
        let body = if deflate {
            let mut e = flate2::write::DeflateEncoder::new(Vec::new(), flate2::Compression::fast());
            e.write_all(data).unwrap();
            e.finish().unwrap()
        } else {
            data.to_vec()
        };
        let method: u16 = if deflate { 8 } else { 0 };
        let head = |sig: &[u8], out: &mut Vec<u8>, central: bool| {
            out.extend_from_slice(sig);
            if central {
                out.extend_from_slice(&20u16.to_le_bytes());
            }
            out.extend_from_slice(&20u16.to_le_bytes());
            out.extend_from_slice(&0u16.to_le_bytes());
            out.extend_from_slice(&method.to_le_bytes());
            out.extend_from_slice(&[0, 0, 0, 0]);
            out.extend_from_slice(&crc.to_le_bytes());
            out.extend_from_slice(&(body.len() as u32).to_le_bytes());
            out.extend_from_slice(&(data.len() as u32).to_le_bytes());
            out.extend_from_slice(&(name.len() as u16).to_le_bytes());
            out.extend_from_slice(&0u16.to_le_bytes());
        };
        head(&[0x50, 0x4b, 3, 4], &mut out, false);
        out.extend_from_slice(name.as_bytes());
        out.extend_from_slice(&body);
        head(&[0x50, 0x4b, 1, 2], &mut cd, true);
        // Comment length, disk, internal and external attributes.
        cd.extend_from_slice(&[0; 10]);
        cd.extend_from_slice(&off.to_le_bytes());
        cd.extend_from_slice(name.as_bytes());
    }
    let cd_off = out.len() as u32;
    out.extend_from_slice(&cd);
    out.extend_from_slice(&[0x50, 0x4b, 5, 6, 0, 0, 0, 0]);
    out.extend_from_slice(&(members.len() as u16).to_le_bytes());
    out.extend_from_slice(&(members.len() as u16).to_le_bytes());
    out.extend_from_slice(&(cd.len() as u32).to_le_bytes());
    out.extend_from_slice(&cd_off.to_le_bytes());
    out.extend_from_slice(&0u16.to_le_bytes());
    out
}

fn crc32(d: &[u8]) -> u32 {
    let mut c = !0u32;
    for &b in d {
        c ^= b as u32;
        for _ in 0..8 {
            c = if c & 1 != 0 { (c >> 1) ^ 0xEDB8_8320 } else { c >> 1 };
        }
    }
    !c
}

/// A `.3dheat` container: a manifest and a summary with two players and a small grid.
pub fn container(game: &str, map: &str, stem: &str, converter: &str, version: &str) -> Vec<u8> {
    let summary = r#"{"format":"3dheat-summary","version":2,"duration":600,"players":2,"teams":[{"name":"A"},{"name":"B"}],"winner":"A","playerStats":[{"name":"Ann"},{"name":"Ben"}],"grid":{"cell":100,"ix":[0,1,2,3,4,5],"iz":[0,-1,-1,-2,-3,-3],"p":[5,9,3,1,7,2]}}"#;
    let manifest = format!(
        r#"{{"format":"3dheat","format_version":"1.0","game":"{game}","source":"test","converter":{{"name":"{converter}","version":"{version}"}},"match":"{stem}","map":"{map}","mode":"test mode","started":"2026-01-02T03:04:05Z","roles":{{"summary":"{stem}.summary.json"}},"members":[{{"name":"{stem}.summary.json","role":"summary"}}]}}"#
    );
    zip(&[("manifest.json", manifest.as_bytes()), (&format!("{stem}.summary.json"), summary.as_bytes())], false)
}

/// A Tacview ACMI recording: a header near (lat, lon), `frames` time frames of three aircraft.
pub fn acmi(lat: f64, lon: f64, frames: usize) -> String {
    let mut s = format!(
        "FileType=text/acmi/tacview\nFileVersion=2.2\n0,ReferenceTime=2026-01-01T12:00:00Z\n0,ReferenceLongitude={lon}\n0,ReferenceLatitude={lat}\n0,DataSource=DCS 2.9.0\n0,Title=Test mission\n0,Author=Tester\n"
    );
    for f in 0..frames {
        s.push_str(&format!("#{}\n", f as f64 * 0.5));
        for (id, pilot) in [(101, "Viper 1"), (102, "Viper 2"), (103, "Bandit")] {
            let k = f as f64 * 0.001 + id as f64 * 0.0001;
            if f == 0 {
                let side = if id == 103 { "Enemies" } else { "Allies" };
                s.push_str(&format!("{id},T={k}|{}|5000,Type=Air+FixedWing,Name=F-16C,Pilot={pilot},Coalition={side}\n", k / 2.0));
            } else {
                s.push_str(&format!("{id},T={k}|{}|5000\n", k / 2.0));
            }
        }
    }
    s
}

fn varint(mut v: u64, out: &mut Vec<u8>) {
    loop {
        let b = (v & 0x7f) as u8;
        v >>= 7;
        if v == 0 {
            out.push(b);
            return;
        }
        out.push(b | 0x80);
    }
}

fn pb_str(field: u64, s: &str, out: &mut Vec<u8>) {
    varint(field << 3 | 2, out);
    varint(s.len() as u64, out);
    out.extend_from_slice(s.as_bytes());
}

/// A Source 2 demo: the file header (server, map, game folder, build) and the file info (the length).
pub fn dem(map: &str, game_dir: &str, seconds: f32) -> Vec<u8> {
    let mut header = Vec::new();
    pb_str(1, "PBDEMS2", &mut header);
    pb_str(3, "Test server", &mut header);
    pb_str(5, map, &mut header);
    pb_str(6, game_dir, &mut header);
    varint(13 << 3, &mut header);
    varint(1234, &mut header);
    let mut cmd = Vec::new();
    varint(1, &mut cmd);
    varint(0, &mut cmd);
    varint(header.len() as u64, &mut cmd);
    cmd.extend_from_slice(&header);
    let mut info = Vec::new();
    varint(1 << 3 | 5, &mut info);
    info.extend_from_slice(&seconds.to_le_bytes());
    let mut out = b"PBDEMS2\0".to_vec();
    let info_at = 16 + cmd.len() + 64;
    out.extend_from_slice(&(info_at as u32).to_le_bytes());
    out.extend_from_slice(&0u32.to_le_bytes());
    out.extend_from_slice(&cmd);
    out.extend_from_slice(&[0u8; 64]);
    varint(2, &mut out);
    varint(0, &mut out);
    varint(info.len() as u64, &mut out);
    out.extend_from_slice(&info);
    out
}

/// A small PNG: a gradient.
pub fn png(w: u32, h: u32) -> Vec<u8> {
    let mut out = Vec::new();
    {
        let mut e = png::Encoder::new(&mut out, w, h);
        e.set_color(png::ColorType::Rgb);
        e.set_depth(png::BitDepth::Eight);
        let mut wr = e.write_header().unwrap();
        let data: Vec<u8> = (0..w * h).flat_map(|i| [(i % w * 255 / w) as u8, (i / w * 255 / h) as u8, 90]).collect();
        wr.write_image_data(&data).unwrap();
    }
    out
}
