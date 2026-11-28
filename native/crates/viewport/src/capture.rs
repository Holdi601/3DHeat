//! Pictures read back (`captureFrame`: video renders, notes' snapshots, the parity probe): the
//! composite drawn again into an offscreen texture of the render size, copied into a mapped
//! buffer from a small ring.
//!
//! The frame thread never waits on a read-back and never touches its bytes: the copy is queued in
//! the frame's encoder, `map_async` is asked after the submit, and once mapped the buffer itself
//! goes to whoever asked (`Captured`), who reads the rows on their own thread and hands the slot
//! back by dropping it (unmapped there). A video render keeps a frame or two in flight; with every
//! slot still held, the next capture simply waits for one (the frame path goes on drawing).

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

use crate::renderer::tex2d;

/// Slots in the ring: one being drawn, one being read, one spare.
pub const RING: usize = 3;
/// How long a capture waits for the page's packet it names before it takes what is drawn (a
/// packet the page dropped, or a page that started its numbering over).
pub const CAPTURE_WAIT: Duration = Duration::from_millis(1000);

/// A frame read back: `width` x `height` pixels, top row first. Holds its slot's buffer mapped until
/// dropped; read it with `write_rgba` (on any thread).
pub struct Captured {
    pub width: u32,
    pub height: u32,
    buffer: wgpu::Buffer,
    stride: u32,
    bgra: bool,
    free: Arc<AtomicBool>,
}

impl Captured {
    /// The rows as tight RGBA8, appended to `out`.
    pub fn write_rgba(&self, out: &mut Vec<u8>) {
        let at = out.len();
        out.resize(at + self.width as usize * self.height as usize * 4, 0);
        self.write_rgba_into(&mut out[at..]);
    }

    /// The rows as tight RGBA8 into `out` (`width * height * 4` bytes; shared memory the page sees).
    pub fn write_rgba_into(&self, out: &mut [u8]) {
        let data = self.buffer.slice(..).get_mapped_range().expect("capture mapped");
        let row = self.width as usize * 4;
        for (y, dst) in out.chunks_exact_mut(row).take(self.height as usize).enumerate() {
            let src = &data[y * self.stride as usize..y * self.stride as usize + row];
            if self.bgra {
                for (d, s) in dst.chunks_exact_mut(4).zip(src.chunks_exact(4)) {
                    d.copy_from_slice(&[s[2], s[1], s[0], s[3]]);
                }
            } else {
                dst.copy_from_slice(src);
            }
        }
    }

    /// The rows as tight RGBA8.
    pub fn rgba(&self) -> Vec<u8> {
        let mut v = Vec::new();
        self.write_rgba(&mut v);
        v
    }
}

impl Drop for Captured {
    fn drop(&mut self) {
        self.buffer.unmap();
        self.free.store(true, Ordering::Release);
    }
}

struct Slot {
    tex: wgpu::Texture,
    view: wgpu::TextureView,
    buffer: wgpu::Buffer,
    size: (u32, u32),
    format: wgpu::TextureFormat,
    stride: u32,
    free: Arc<AtomicBool>,
}

/// One capture's target and buffer, taken from the ring for this frame.
pub(crate) struct Taken {
    pub view: wgpu::TextureView,
    pub tex: wgpu::Texture,
    pub buffer: wgpu::Buffer,
    pub stride: u32,
    pub free: Arc<AtomicBool>,
}

/// A capture asked for: once the page's packet `after` is drawn (0: the next frame).
pub(crate) struct Ask {
    pub after: u32,
    pub asked: Instant,
    pub reply: Box<dyn FnOnce(Option<Captured>) + Send>,
}

#[derive(Default)]
pub(crate) struct CaptureRing {
    slots: Vec<Slot>,
    pub asks: Vec<Ask>,
}

impl CaptureRing {
    /// A free slot of this size and format, made when the ring has room; none while every slot is
    /// still held (the capture waits a frame). Slots of another size are dropped once free.
    pub fn take(&mut self, device: &wgpu::Device, size: (u32, u32), format: wgpu::TextureFormat) -> Option<Taken> {
        self.slots.retain(|s| (s.size == size && s.format == format) || !s.free.load(Ordering::Acquire));
        let i = match self.slots.iter().position(|s| s.size == size && s.format == format && s.free.load(Ordering::Acquire)) {
            Some(i) => i,
            None if self.slots.len() < RING => {
                let (tex, view) = tex2d(device, "capture", size.0, size.1, format, wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC);
                let stride = (size.0 * 4).div_ceil(256) * 256;
                let buffer = device.create_buffer(&wgpu::BufferDescriptor {
                    label: Some("capture read"),
                    size: stride as u64 * size.1 as u64,
                    usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
                    mapped_at_creation: false,
                });
                self.slots.push(Slot { tex, view, buffer, size, format, stride, free: Arc::new(AtomicBool::new(true)) });
                self.slots.len() - 1
            }
            None => return None,
        };
        let s = &self.slots[i];
        s.free.store(false, Ordering::Release);
        Some(Taken { view: s.view.clone(), tex: s.tex.clone(), buffer: s.buffer.clone(), stride: s.stride, free: s.free.clone() })
    }

    /// The asks whose packet is drawn (`seq` the last drawn) or that waited too long.
    pub fn due(&mut self, seq: u32) -> Vec<Ask> {
        let (due, wait): (Vec<_>, Vec<_>) = std::mem::take(&mut self.asks).into_iter().partition(|a| seq >= a.after || a.asked.elapsed() > CAPTURE_WAIT);
        self.asks = wait;
        due
    }

    /// An ask that could be served now (its packet drawn, waiting for a free slot) or is past its
    /// wait: drawn again even with no packet coming.
    pub fn overdue(&self, seq: u32) -> bool {
        self.asks.iter().any(|a| seq >= a.after || a.asked.elapsed() > CAPTURE_WAIT)
    }
}

/// The mapped slot, handed over (`Renderer::poll`).
pub(crate) fn handed(width: u32, height: u32, buffer: wgpu::Buffer, stride: u32, bgra: bool, free: Arc<AtomicBool>) -> Captured {
    Captured { width, height, buffer, stride, bgra, free }
}

/// A slot whose map failed: free again.
pub(crate) fn release(free: &AtomicBool) {
    free.store(true, Ordering::Release);
}
