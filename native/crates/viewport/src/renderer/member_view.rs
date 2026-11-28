//! A session member's view, drawn by the host for the video fallback (Stage 8):
//! the host page's last packet as seen from the member's camera, at the
//! member's size, into targets of its own. The renderer's per-view state
//! (scene, depth, heat targets, the binning grid, the accumulation, the last
//! packet, the counters, the read-backs the page waits on) is swapped out for
//! the member's while it draws and put back after, so the host's view and its
//! accumulation stay exactly as they were.

use super::*;

/// A member's camera as the video stream hands it over.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct MemberCamera {
    /// World to camera, column-major, as the member's engine has it (its mirror included).
    pub view: [f32; 16],
    /// Vertical field of view, degrees.
    pub fov: f32,
    pub ortho: bool,
    pub ortho_height: f32,
    pub width: u32,
    pub height: u32,
    /// The host's own camera (a stream shared by members who follow the host): `view` and the
    /// projection are the host's, the picture keeps the host's shape within `width` x `height`.
    pub follow_host: bool,
}

/// What a member's view keeps between its frames.
pub struct ViewState {
    width: u32,
    height: u32,
    heat_w: u32,
    heat_h: u32,
    heat_format: wgpu::TextureFormat,
    scene: Option<(wgpu::Texture, wgpu::TextureView)>,
    depth: Option<(wgpu::Texture, wgpu::TextureView)>,
    struct_depth: Option<(wgpu::Texture, wgpu::TextureView)>,
    heat_sets: Vec<((u32, u32, wgpu::TextureFormat), HeatSet)>,
    grid: Option<BinGrid>,
    bins: Option<wgpu::Buffer>,
    last_frame: Option<Packet>,
    binned: bool,
    /// The occlusion's peeled layers and the direction field: sized to the view, and the
    /// field is smoothed from frame to frame, so a member's never mixes into the host's.
    occ_layers: Vec<(wgpu::Texture, wgpu::TextureView)>,
    occ_size: (u32, u32),
    dir_field: Option<crate::heatmodes::Field>,
}

impl Default for ViewState {
    fn default() -> Self {
        Self {
            width: 0,
            height: 0,
            heat_w: 0,
            heat_h: 0,
            heat_format: wgpu::TextureFormat::R16Float,
            scene: None,
            depth: None,
            struct_depth: None,
            heat_sets: Vec::new(),
            grid: None,
            bins: None,
            last_frame: None,
            binned: false,
            occ_layers: Vec::new(),
            occ_size: (0, 0),
            dir_field: None,
        }
    }
}

/// `a * b`, column-major 4x4.
fn mul(a: &[f64; 16], b: &[f64; 16]) -> [f64; 16] {
    let mut o = [0f64; 16];
    for c in 0..4 {
        for r in 0..4 {
            o[c * 4 + r] = (0..4).map(|k| a[k * 4 + r] * b[c * 4 + k]).sum();
        }
    }
    o
}

/// The projection three.js makes for the member's camera (`FlyCamera.update`), WebGL depth,
/// with the host's near and far: perspective, or parallel with the scene behind the camera too.
fn projection(cam: &MemberCamera, near: f64, far: f64) -> [f64; 16] {
    let aspect = cam.width as f64 / cam.height.max(1) as f64;
    let mut m = [0f64; 16];
    if cam.ortho {
        let half_h = (cam.ortho_height as f64 * 0.5).max(1e-3);
        let half_w = half_h * aspect;
        // `orthoBack` is the scene's far distance in a parallel view.
        let n = near - far;
        m[0] = 1.0 / half_w;
        m[5] = 1.0 / half_h;
        m[10] = -2.0 / (far - n);
        m[14] = -(far + n) / (far - n);
        m[15] = 1.0;
    } else {
        let top = near * (cam.fov as f64 * 0.5).to_radians().tan();
        let right = top * aspect;
        m[0] = near / right;
        m[5] = near / top;
        m[10] = -(far + near) / (far - near);
        m[11] = -1.0;
        m[14] = -2.0 * far * near / (far - near);
    }
    m
}

/// WebGL depth to reverse-Z (`REVERSE_Z_REMAP`): z' = (w - z) / 2.
const REMAP: [f64; 16] = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, -0.5, 0.0, 0.0, 0.0, 0.5, 1.0];

impl Renderer {
    /// The host page's last packet seen from `cam`, or None before the page sent one. What is
    /// drawn in screen space for the host (glyph labels, rulers, the layers over the picture,
    /// zones, ranges) is left out: the member's page draws its own panels and labels.
    pub fn member_packet(&self, cam: &MemberCamera) -> Option<Packet> {
        let mut p = self.last_frame.clone()?;
        p.color_lut = None;
        p.curve_lut = None;
        p.signs = None;
        p.filters = None;
        p.volumes = None;
        p.glyphs = None;
        p.top = None;
        p.overlays = None;
        p.ranges = None;
        p.overlay.clear();
        let f = p.frame.as_mut()?;
        let (near, far) = (f[F_NEAR] as f64, f[F_FAR] as f64);
        if !(near.is_finite() && far.is_finite() && far > near && near > 0.0) {
            return None;
        }
        if cam.follow_host {
            f[F_WIDTH] = cam.width as f32;
            f[F_HEIGHT] = cam.height as f32;
            f[F_VIEW_X] = 0.0;
            f[F_VIEW_Y] = 0.0;
            f[F_COMPOSITE_ONLY] = 0.0;
            return Some(p);
        }
        let v: [f64; 16] = cam.view.map(|x| x as f64);
        let proj = projection(cam, near, far);
        let vp = mul(&REMAP, &mul(&proj, &v));
        // The camera's position: the view's inverse translation (-R^T t); its axis: the view's third row, negated.
        let pos = [0, 1, 2].map(|i| -(v[i * 4] * v[12] + v[i * 4 + 1] * v[13] + v[i * 4 + 2] * v[14]));
        let fwd = [-v[2], -v[6], -v[10]];
        for i in 0..16 {
            f[F_VIEW_PROJ + i] = vp[i] as f32;
        }
        for i in 0..3 {
            f[F_CAMERA_POS + i] = pos[i] as f32;
            f[F_CAMERA_FORWARD + i] = fwd[i] as f32;
        }
        f[F_PROJ5] = proj[5] as f32;
        f[F_PERSPECTIVE] = if cam.ortho { 0.0 } else { 1.0 };
        f[F_WIDTH] = cam.width as f32;
        f[F_HEIGHT] = cam.height as f32;
        f[F_VIEW_X] = 0.0;
        f[F_VIEW_Y] = 0.0;
        f[F_COMPOSITE_ONLY] = 0.0;
        // The figures' view relative to the host's origin (their instances are relative to it).
        let o = [f[F_ORIGIN] as f64, f[F_ORIGIN + 1] as f64, f[F_ORIGIN + 2] as f64];
        for i in 0..16 {
            f[F_VIEW_PROJ_REL + i] = vp[i] as f32;
        }
        for r in 0..4 {
            f[F_VIEW_PROJ_REL + 12 + r] = (vp[r] * o[0] + vp[4 + r] * o[1] + vp[8 + r] * o[2] + vp[12 + r]) as f32;
        }
        Some(p)
    }

    fn swap_view(&mut self, s: &mut ViewState) {
        std::mem::swap(&mut self.width, &mut s.width);
        std::mem::swap(&mut self.height, &mut s.height);
        std::mem::swap(&mut self.heat_w, &mut s.heat_w);
        std::mem::swap(&mut self.heat_h, &mut s.heat_h);
        std::mem::swap(&mut self.heat_format, &mut s.heat_format);
        std::mem::swap(&mut self.scene, &mut s.scene);
        std::mem::swap(&mut self.depth, &mut s.depth);
        std::mem::swap(&mut self.struct_depth, &mut s.struct_depth);
        std::mem::swap(&mut self.heat_sets, &mut s.heat_sets);
        std::mem::swap(&mut self.last_frame, &mut s.last_frame);
        std::mem::swap(&mut self.binned, &mut s.binned);
        std::mem::swap(&mut self.occ.layers, &mut s.occ_layers);
        std::mem::swap(&mut self.occ.layers_size, &mut s.occ_size);
        std::mem::swap(&mut self.modes.field, &mut s.dir_field);
        if let Some(b) = self.bin.as_mut() {
            std::mem::swap(&mut b.grid, &mut s.grid);
            std::mem::swap(&mut b.bins, &mut s.bins);
        }
    }

    /// Draws `p` (from `member_packet`) into `out` with the member's own targets; the host's
    /// state, counters and waiting read-backs are untouched.
    pub fn draw_member(&mut self, state: &mut ViewState, p: &Packet, out: &wgpu::TextureView, size: (u32, u32)) {
        self.swap_view(state);
        // The host's pictures asked for (`capture.rs`) wait for the host's own frame.
        let capture = std::mem::take(&mut self.captures.asks);
        let heat = std::mem::take(&mut self.pending_heat);
        let probe = self.pending_probe.take();
        let stats = std::mem::take(&mut self.stats);
        self.draw(std::slice::from_ref(p), out, size, false);
        self.stats = stats;
        self.captures.asks = capture;
        self.pending_heat = heat;
        self.pending_probe = probe;
        self.swap_view(state);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn projection_matches_three() {
        // three.js PerspectiveCamera(50, 16/9, 1, 1000).projectionMatrix
        let cam = MemberCamera { view: [0.0; 16], fov: 50.0, ortho: false, ortho_height: 0.0, width: 1600, height: 900, follow_host: false };
        let m = projection(&cam, 1.0, 1000.0);
        let f = 1.0 / (25f64.to_radians().tan());
        assert!((m[5] - f).abs() < 1e-9 && (m[0] - f / (16.0 / 9.0)).abs() < 1e-9);
        assert!((m[10] + 1001.0 / 999.0).abs() < 1e-9 && (m[14] + 2000.0 / 999.0).abs() < 1e-9 && m[11] == -1.0);
        // Reverse-Z: the near plane at depth 1, the far plane at 0.
        let vp = mul(&REMAP, &m);
        let depth = |z: f64| (vp[10] * z + vp[14]) / (vp[11] * z + vp[15]);
        assert!((depth(-1.0) - 1.0).abs() < 1e-9 && depth(-1000.0).abs() < 1e-9);
    }
}
