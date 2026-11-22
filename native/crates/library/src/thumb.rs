//! Thumbnails: a small heat or track picture of a match, drawn from the points
//! its metadata gave (the summary's grid cells, a recording's sampled
//! positions), over the level's own map picture where one is known; a level's
//! picture alone for a level. PNG, `W` x `H`.

use std::fs::File;
use std::io::BufReader;
use std::path::Path;

use anyhow::{bail, Result};

pub const W: usize = 320;
pub const H: usize = 200;

/// The heat ramp: (position, r, g, b), dark purple to white.
const RAMP: &[(f32, [f32; 3])] = &[
    (0.0, [40.0, 12.0, 80.0]),
    (0.3, [140.0, 30.0, 140.0]),
    (0.55, [230.0, 80.0, 70.0]),
    (0.8, [255.0, 180.0, 40.0]),
    (1.0, [255.0, 250.0, 210.0]),
];

fn ramp(t: f32) -> [f32; 3] {
    let t = t.clamp(0.0, 1.0);
    for w in RAMP.windows(2) {
        let (a, b) = (w[0], w[1]);
        if t <= b.0 {
            let k = (t - a.0) / (b.0 - a.0);
            return [a.1[0] + (b.1[0] - a.1[0]) * k, a.1[1] + (b.1[1] - a.1[1]) * k, a.1[2] + (b.1[2] - a.1[2]) * k];
        }
    }
    RAMP[RAMP.len() - 1].1
}

/// An RGB picture being drawn.
pub struct Canvas {
    pub px: Vec<[f32; 3]>,
}

impl Canvas {
    /// The empty background: a dark ground with a faint grid.
    pub fn blank() -> Self {
        let mut px = vec![[16.0, 19.0, 26.0]; W * H];
        for y in 0..H {
            for x in 0..W {
                if x % 40 == 0 || y % 40 == 0 {
                    px[y * W + x] = [24.0, 28.0, 37.0];
                }
            }
        }
        Canvas { px }
    }

    /// A picture fitted to cover the canvas, dimmed so heat reads over it.
    pub fn from_picture(path: &Path, dim: f32) -> Result<Self> {
        let (w, h, rgb) = decode_png(path)?;
        let mut c = Canvas::blank();
        // Contain (letterbox), so a square map stays square.
        let s = (W as f32 / w as f32).min(H as f32 / h as f32);
        let (dw, dh) = ((w as f32 * s) as usize, (h as f32 * s) as usize);
        let (ox, oy) = ((W - dw.min(W)) / 2, (H - dh.min(H)) / 2);
        for y in 0..dh.min(H) {
            for x in 0..dw.min(W) {
                // Box sample of the source area this pixel covers.
                let (sx0, sx1) = ((x as f32 / s) as usize, (((x + 1) as f32 / s) as usize).max((x as f32 / s) as usize + 1).min(w));
                let (sy0, sy1) = ((y as f32 / s) as usize, (((y + 1) as f32 / s) as usize).max((y as f32 / s) as usize + 1).min(h));
                let mut acc = [0.0f32; 3];
                let mut n = 0.0;
                let step = ((sx1 - sx0).max(sy1 - sy0) / 4).max(1);
                for sy in (sy0..sy1).step_by(step) {
                    for sx in (sx0..sx1).step_by(step) {
                        let p = &rgb[(sy * w + sx) * 3..(sy * w + sx) * 3 + 3];
                        acc[0] += p[0] as f32;
                        acc[1] += p[1] as f32;
                        acc[2] += p[2] as f32;
                        n += 1.0;
                    }
                }
                if n > 0.0 {
                    c.px[(y + oy) * W + x + ox] = [acc[0] / n * dim, acc[1] / n * dim, acc[2] / n * dim];
                }
            }
        }
        Ok(c)
    }

    pub fn png(&self) -> Vec<u8> {
        let mut out = Vec::new();
        {
            let mut enc = png::Encoder::new(&mut out, W as u32, H as u32);
            enc.set_color(png::ColorType::Rgb);
            enc.set_depth(png::BitDepth::Eight);
            enc.set_compression(png::Compression::Fast);
            let mut wr = enc.write_header().expect("PNG header");
            let raw: Vec<u8> = self.px.iter().flat_map(|p| p.map(|v| v.clamp(0.0, 255.0) as u8)).collect();
            wr.write_image_data(&raw).expect("PNG data");
        }
        out
    }
}

/// Decodes a PNG to 8-bit RGB.
pub fn decode_png(path: &Path) -> Result<(usize, usize, Vec<u8>)> {
    let mut dec = png::Decoder::new(BufReader::new(File::open(path)?));
    dec.set_transformations(png::Transformations::EXPAND | png::Transformations::STRIP_16);
    let mut r = dec.read_info()?;
    let mut buf = vec![0u8; r.output_buffer_size().unwrap_or(0)];
    let info = r.next_frame(&mut buf)?;
    let (w, h) = (info.width as usize, info.height as usize);
    if w == 0 || h == 0 || w * h > 64 << 20 {
        bail!("picture size {w}x{h}");
    }
    let ch = match info.color_type {
        png::ColorType::Rgb => 3,
        png::ColorType::Rgba => 4,
        png::ColorType::Grayscale => 1,
        png::ColorType::GrayscaleAlpha => 2,
        png::ColorType::Indexed => bail!("indexed PNG after expansion"),
    };
    let mut rgb = Vec::with_capacity(w * h * 3);
    for i in 0..w * h {
        let p = &buf[i * ch..i * ch + ch];
        match ch {
            1 | 2 => rgb.extend_from_slice(&[p[0], p[0], p[0]]),
            _ => rgb.extend_from_slice(&p[..3]),
        }
    }
    Ok((w, h, rgb))
}

/// The picture of a match: `points` (x, y up, weight) as heat, over `underlay`
/// (a picture of the world rect x0, y0, x1, y1; an empty rect: the picture
/// alone, no heat placed on it).
pub fn render(points: &[[f32; 3]], underlay: Option<(&Path, [f32; 4])>) -> Option<Vec<u8>> {
    let pic = underlay.and_then(|(p, r)| Canvas::from_picture(p, if points.is_empty() { 0.9 } else { 0.45 }).ok().map(|c| (c, r)));
    if points.is_empty() {
        return pic.map(|(c, _)| c.png());
    }
    let (mut canvas, rect) = match pic {
        Some((c, r)) if r[2] > r[0] && r[3] > r[1] => (c, Some(r)),
        _ => (Canvas::blank(), None),
    };
    // The world area shown: the picture's rect, else where the weight is (1st to 99th percentile), padded.
    let (x0, y0, x1, y1) = match rect {
        Some(r) => (r[0], r[1], r[2], r[3]),
        None => {
            let pct = |axis: usize| {
                let mut v: Vec<f32> = points.iter().map(|p| p[axis]).filter(|v| v.is_finite()).collect();
                v.sort_by(f32::total_cmp);
                let at = |q: f32| v[((v.len() - 1) as f32 * q) as usize];
                (at(0.01), at(0.99))
            };
            let ((ax, bx), (ay, by)) = (pct(0), pct(1));
            let (cx, cy) = ((ax + bx) / 2.0, (ay + by) / 2.0);
            // Square-ish world units, fitted to the canvas's aspect.
            let mut hw = ((bx - ax) / 2.0).max(1e-6) * 1.12;
            let mut hh = ((by - ay) / 2.0).max(1e-6) * 1.12;
            let aspect = W as f32 / H as f32;
            if hw / hh > aspect {
                hh = hw / aspect;
            } else {
                hw = hh * aspect;
            }
            (cx - hw, cy - hh, cx + hw, cy + hh)
        }
    };
    // With a picture of a square world rect, the drawing area is the letterboxed square.
    let (ox, oy, dw, dh) = if rect.is_some() {
        let s = (W as f32 / (x1 - x0)).min(H as f32 / (y1 - y0));
        let (dw, dh) = ((x1 - x0) * s, (y1 - y0) * s);
        ((W as f32 - dw) / 2.0, (H as f32 - dh) / 2.0, dw, dh)
    } else {
        (0.0, 0.0, W as f32, H as f32)
    };
    let mut d = vec![0.0f32; W * H];
    for p in points {
        let fx = ox + (p[0] - x0) / (x1 - x0) * dw;
        let fy = oy + (y1 - p[1]) / (y1 - y0) * dh;
        if fx < 0.0 || fy < 0.0 || fx >= W as f32 || fy >= H as f32 || !p[2].is_finite() {
            continue;
        }
        d[fy as usize * W + fx as usize] += p[2].max(0.0);
    }
    // A cell or a sample is a spot, not a pixel.
    let r = if points.len() > 4000 { 1 } else { 2 };
    blur(&mut d, r);
    blur(&mut d, r);
    let mut nz: Vec<f32> = d.iter().copied().filter(|v| *v > 0.0).collect();
    if nz.is_empty() {
        return Some(canvas.png());
    }
    nz.sort_by(f32::total_cmp);
    let top = nz[((nz.len() - 1) as f32 * 0.995) as usize].max(1e-12);
    // A gentle power curve: the busiest places bright, the quiet ones faint (a log scale lit everything).
    let floor = top * 0.004;
    for (i, v) in d.iter().enumerate() {
        if *v <= floor {
            continue;
        }
        let t = (*v / top).clamp(0.0, 1.0).powf(0.45);
        let c = ramp(t);
        let a = (0.12 + 0.88 * t).min(1.0);
        let px = &mut canvas.px[i];
        for k in 0..3 {
            px[k] = px[k] * (1.0 - a) + c[k] * a;
        }
    }
    Some(canvas.png())
}

/// A box blur of radius `r`, horizontal then vertical.
fn blur(d: &mut [f32], r: usize) {
    let mut tmp = vec![0.0f32; d.len()];
    for y in 0..H {
        for x in 0..W {
            let (a, b) = (x.saturating_sub(r), (x + r).min(W - 1));
            tmp[y * W + x] = (a..=b).map(|i| d[y * W + i]).sum::<f32>() / (2 * r + 1) as f32;
        }
    }
    for y in 0..H {
        for x in 0..W {
            let (a, b) = (y.saturating_sub(r), (y + r).min(H - 1));
            d[y * W + x] = (a..=b).map(|j| tmp[j * W + x]).sum::<f32>() / (2 * r + 1) as f32;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn draws_heat_as_png() {
        let pts: Vec<[f32; 3]> = (0..200).map(|i| [(i % 20) as f32 * 10.0, (i / 20) as f32 * 10.0, 1.0 + (i % 7) as f32]).collect();
        let png = render(&pts, None).unwrap();
        assert_eq!(&png[1..4], b"PNG");
        let dec = png::Decoder::new(std::io::Cursor::new(&png));
        let r = dec.read_info().unwrap();
        assert_eq!((r.info().width, r.info().height), (W as u32, H as u32));
    }

    #[test]
    fn nothing_to_draw() {
        assert!(render(&[], None).is_none());
    }
}
