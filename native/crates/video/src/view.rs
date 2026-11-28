//! A member's camera as its page sends it on the stream's data channel, and
//! the role's limit on what the host draws for it.

/// What the gateway allows a role (`x-heat3d-video-limit`: `width,height,fps,kbps`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct RoleLimit {
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub kbps: u32,
}

impl RoleLimit {
    pub fn parse(s: &str) -> Option<Self> {
        let v: Vec<u32> = s.split(',').map(|p| p.trim().parse().ok()).collect::<Option<_>>()?;
        let [width, height, fps, kbps] = v[..] else { return None };
        let ok = (64..=7680).contains(&width) && (64..=4320).contains(&height) && (1..=120).contains(&fps) && (100..=100_000).contains(&kbps);
        ok.then_some(Self { width, height, fps, kbps })
    }
}

/// A member's camera: the view matrix (world to camera, column-major, as its
/// engine has it, mirror included), the projection's settings, the picture's size.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ViewParams {
    pub view: [f32; 16],
    pub fov: f32,
    pub ortho: bool,
    pub ortho_height: f32,
    pub width: u32,
    pub height: u32,
    /// The page's number for this camera and its clock when it sent it (ms), echoed with the frame drawn from it.
    pub seq: u32,
    pub sent_ms: f64,
    /// The host's own camera, not this one (a stream shared by the members who follow the host):
    /// never in a camera message, set by the host for such a stream.
    pub follow_host: bool,
}

/// Bytes of one camera message: magic, seq, sent (f64), view (16 f32), fov, ortho, ortho height, width, height.
pub const CAMERA_BYTES: usize = 100;
const MAGIC: &[u8; 4] = b"H3VC";

impl ViewParams {
    /// A camera message, checked: finite numbers within the world's range, a sane field of view,
    /// a size within the role's limit (scaled down keeping its shape; width a multiple of 8, height even).
    pub fn decode(b: &[u8], limit: &RoleLimit) -> Option<Self> {
        if b.len() != CAMERA_BYTES || &b[..4] != MAGIC {
            return None;
        }
        let u = |at: usize| u32::from_le_bytes(b[at..at + 4].try_into().unwrap());
        let f = |at: usize| f32::from_le_bytes(b[at..at + 4].try_into().unwrap());
        let seq = u(4);
        let sent_ms = f64::from_le_bytes(b[8..16].try_into().unwrap());
        let mut view = [0f32; 16];
        for (i, v) in view.iter_mut().enumerate() {
            *v = f(16 + i * 4);
        }
        let (fov, ortho, ortho_height, w, h) = (f(80), f(84), f(88), u(92), u(96));
        let finite = view.iter().all(|v| v.is_finite() && v.abs() < 1e9) && sent_ms.is_finite();
        if !finite || !(1.0..=170.0).contains(&fov) || !(ortho == 0.0 || ortho == 1.0) || !ortho_height.is_finite() || !(0.0..1e9).contains(&ortho_height) {
            return None;
        }
        if !(16..=16384).contains(&w) || !(16..=16384).contains(&h) {
            return None;
        }
        let (width, height) = fit(w, h, limit);
        Some(Self { view, fov, ortho: ortho == 1.0, ortho_height, width, height, seq, sent_ms, follow_host: false })
    }

    pub fn encode(&self) -> Vec<u8> {
        let mut b = Vec::with_capacity(CAMERA_BYTES);
        b.extend_from_slice(MAGIC);
        b.extend_from_slice(&self.seq.to_le_bytes());
        b.extend_from_slice(&self.sent_ms.to_le_bytes());
        for v in self.view {
            b.extend_from_slice(&v.to_le_bytes());
        }
        for v in [self.fov, if self.ortho { 1.0 } else { 0.0 }, self.ortho_height] {
            b.extend_from_slice(&v.to_le_bytes());
        }
        b.extend_from_slice(&self.width.to_le_bytes());
        b.extend_from_slice(&self.height.to_le_bytes());
        b
    }
}

/// A picture size within the limit, its shape kept: width a multiple of 8 (the colour
/// conversion packs four pixels a word, chroma halves it), height even, at least 64 x 64.
pub fn fit(w: u32, h: u32, limit: &RoleLimit) -> (u32, u32) {
    let s = (limit.width as f64 / w as f64).min(limit.height as f64 / h as f64).min(1.0);
    let w = ((w as f64 * s) as u32).max(64) / 8 * 8;
    let h = ((h as f64 * s) as u32).max(64) / 2 * 2;
    (w, h)
}

#[cfg(test)]
mod tests {
    use super::*;

    const LIMIT: RoleLimit = RoleLimit { width: 1280, height: 720, fps: 30, kbps: 4000 };

    fn cam() -> ViewParams {
        let mut view = [0f32; 16];
        view[0] = 1.0;
        view[5] = 1.0;
        view[10] = 1.0;
        view[15] = 1.0;
        ViewParams { view, fov: 50.0, ortho: false, ortho_height: 0.0, width: 1000, height: 600, seq: 7, sent_ms: 1234.5, follow_host: false }
    }

    #[test]
    fn round_trip_and_limits() {
        let c = cam();
        assert_eq!(ViewParams::decode(&c.encode(), &LIMIT), Some(c));
        let mut big = cam();
        big.width = 3840;
        big.height = 2160;
        let d = ViewParams::decode(&big.encode(), &LIMIT).unwrap();
        assert!(d.width <= 1280 && d.height <= 720 && d.width % 8 == 0 && d.height % 2 == 0, "{d:?}");
    }

    #[test]
    fn bad_cameras_are_refused() {
        let mut nan = cam();
        nan.view[3] = f32::NAN;
        assert!(ViewParams::decode(&nan.encode(), &LIMIT).is_none());
        let mut fov = cam();
        fov.fov = 400.0;
        assert!(ViewParams::decode(&fov.encode(), &LIMIT).is_none());
        let mut huge = cam();
        huge.width = 1 << 30;
        assert!(ViewParams::decode(&huge.encode(), &LIMIT).is_none());
        assert!(ViewParams::decode(&cam().encode()[..99], &LIMIT).is_none());
        let mut magic = cam().encode();
        magic[0] = b'X';
        assert!(ViewParams::decode(&magic, &LIMIT).is_none());
    }

    #[test]
    fn limit_header() {
        assert_eq!(RoleLimit::parse("1280,720,30,4000"), Some(LIMIT));
        assert_eq!(RoleLimit::parse("1280,720,30"), None);
        assert_eq!(RoleLimit::parse("99999,720,30,4000"), None);
        assert_eq!(RoleLimit::parse("a,b,c,d"), None);
    }
}
