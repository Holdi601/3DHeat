//! The encoders. Windows: Media Foundation's, the GPU maker's hardware encoder
//! first (NVENC, AMF, QSV: each registers one), Microsoft's software H.264 when
//! none takes the stream. Elsewhere none yet (VA-API and a software H.264 are open).

use serde::{Deserialize, Serialize};

#[cfg(windows)]
mod mf;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Codec {
    H264,
    H265,
    Av1,
}

impl Codec {
    pub fn parse(s: &str) -> Option<Self> {
        match s.to_ascii_lowercase().as_str() {
            "h264" | "avc" => Some(Self::H264),
            "h265" | "hevc" => Some(Self::H265),
            "av1" => Some(Self::Av1),
            _ => None,
        }
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct EncoderInfo {
    pub name: String,
    pub hardware: bool,
    pub codec: Codec,
}

/// What to encode: NV12 pictures of this size at about this rate.
#[derive(Clone, Copy, Debug)]
pub struct Settings {
    pub codec: Codec,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub kbps: u32,
}

/// One access unit: Annex B for H.264/H.265, OBUs for AV1.
pub struct Encoded {
    pub data: Vec<u8>,
    pub key: bool,
}

/// An encoder for one stream; made, used and dropped on the stream's own thread.
pub trait Encoder {
    fn info(&self) -> &EncoderInfo;
    /// One NV12 picture (Y, then interleaved UV), its time in 100 ns; what came out (may be
    /// nothing yet: an encoder that holds a picture gives it with the next one).
    fn encode(&mut self, nv12: &[u8], time_100ns: i64, key: bool) -> anyhow::Result<Vec<Encoded>>;
    fn set_kbps(&mut self, kbps: u32);
}

/// An encoder for `s`: hardware first unless `software_only`.
pub fn open(s: &Settings, software_only: bool) -> anyhow::Result<Box<dyn Encoder>> {
    #[cfg(windows)]
    {
        if !software_only {
            match mf::MfEncoder::open(s, true) {
                Ok(e) => return Ok(Box::new(e)),
                Err(e) if s.codec != Codec::H264 => return Err(e),
                Err(_) => {}
            }
        }
        if s.codec == Codec::H264 {
            return mf::MfEncoder::open(s, false).map(|e| Box::new(e) as Box<dyn Encoder>);
        }
        anyhow::bail!("no software encoder for {:?}", s.codec)
    }
    #[cfg(not(windows))]
    {
        let _ = (s, software_only);
        anyhow::bail!("no video encoder on this platform yet (VA-API and a software H.264 are open)")
    }
}

/// The codecs this machine encodes in hardware (and H.264, which always has the software one on Windows).
pub fn codecs() -> Vec<(Codec, bool)> {
    #[cfg(windows)]
    {
        let mut v = Vec::new();
        for c in [Codec::Av1, Codec::H265, Codec::H264] {
            if mf::has_hardware(c) {
                v.push((c, true));
            } else if c == Codec::H264 && mf::has_software(c) {
                v.push((c, false));
            }
        }
        v
    }
    #[cfg(not(windows))]
    {
        Vec::new()
    }
}

/// A test picture: a gradient and a bar that moves with `n` (NV12, w x h).
pub fn test_picture(w: u32, h: u32, n: u32) -> Vec<u8> {
    let (w, h) = (w as usize, h as usize);
    let mut b = vec![128u8; w * h * 3 / 2];
    let bar = (n as usize * 8) % w;
    for y in 0..h {
        for x in 0..w {
            b[y * w + x] = if x >= bar && x < bar + 32 { 235 } else { (16 + (x + y) * 200 / (w + h)) as u8 };
        }
    }
    b
}

#[cfg(all(test, windows))]
mod tests {
    use super::*;

    /// NAL unit types in an Annex B stream.
    fn nal_types(b: &[u8]) -> Vec<u8> {
        let mut v = Vec::new();
        let mut i = 0;
        while i + 3 < b.len() {
            if b[i] == 0 && b[i + 1] == 0 && b[i + 2] == 1 {
                v.push(b[i + 3] & 0x1f);
                i += 3;
            } else {
                i += 1;
            }
        }
        v
    }

    /// Encodes a few pictures with each encoder there is; skipped where Media Foundation has none
    /// (Windows Server without the Media Foundation feature: the CI runner).
    #[test]
    fn encodes_h264_with_parameter_sets_in_band() {
        for software in [false, true] {
            let s = Settings { codec: Codec::H264, width: 640, height: 360, fps: 30, kbps: 2000 };
            let mut e = match open(&s, software) {
                Ok(e) => e,
                Err(err) => {
                    eprintln!("skipped (software {software}): {err:#}");
                    continue;
                }
            };
            let mut out = Vec::new();
            for n in 0..10u32 {
                out.extend(e.encode(&test_picture(640, 360, n), n as i64 * 333_333, n == 0).unwrap());
            }
            assert!(!out.is_empty(), "{}: nothing came out", e.info().name);
            let first = nal_types(&out[0].data);
            assert!(out[0].key && first.contains(&7) && first.contains(&8) && first.contains(&5), "{}: {first:?}", e.info().name);
            eprintln!("{} (hardware {}): {} units, first {first:?}", e.info().name, e.info().hardware, out.len());
        }
    }
}
