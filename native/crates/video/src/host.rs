//! The streams the host sends, each with a lease its member renews through the
//! session server. Members who follow the host's camera share one encoded
//! stream (one picture drawn, one encoder, sent to each of them); every other
//! member gets a view of its own. No fixed number: a new view of its own is
//! refused only when the viewport says even its fewest, smallest member views
//! make the host's frames late (`FrameSource::saturated`), or when no encoder
//! takes it (the hardware's sessions all used and the software encoders at
//! their share of the processor). `--video-streams N` caps the views of their
//! own by hand (0: video off). What draws the members' views (`FrameSource`)
//! is the app's native viewport; without one (`3dheat serve` headless, or the
//! viewport off) offers are refused.

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::{Arc, OnceLock};
use std::time::{Duration, Instant};

use parking_lot::{Mutex, RwLock};

use crate::view::ViewParams;

/// One picture drawn for a stream: NV12, `width` x `height`.
pub struct Frame {
    pub width: u32,
    pub height: u32,
    pub nv12: Vec<u8>,
    /// The camera it was drawn from (its seq and the page's clock when sent).
    pub seq: u32,
    pub sent_ms: f64,
    /// When drawing started, and the draw + conversion + read-back time.
    pub drawn: Instant,
    pub render_ms: f32,
}

pub type FrameSink = Arc<dyn Fn(Frame) + Send + Sync>;

/// What draws the members' views: the app's viewport.
pub trait FrameSource: Send + Sync {
    /// Starts drawing view `id` from `view` at up to `fps` frames a second; frames go to `sink`.
    fn open(&self, id: u64, view: ViewParams, fps: u32, sink: FrameSink) -> Result<(), String>;
    /// The member moved its camera (or resized).
    fn update(&self, id: u64, view: ViewParams);
    fn set_fps(&self, id: u64, fps: u32);
    fn close(&self, id: u64);
    /// Whether it could draw a view now (the app: its native viewport is running).
    fn ready(&self) -> bool {
        true
    }
    /// The host's own frames, for the GPU budget and the measurements: (p50, p99, max) ms
    /// of the present-to-present intervals over the last seconds, when it draws.
    fn host_frames(&self) -> Option<(f32, f32, f32)> {
        None
    }
    /// No room for another view of its own: the host's frames would be late even with the
    /// fewest and smallest member views it draws now.
    fn saturated(&self) -> bool {
        false
    }
}

/// Why a stream was not started: a short code the page puts in its own words (`off`, `full`,
/// `viewport`, `start`), and the host's.
#[derive(Debug, Clone)]
pub struct Refusal {
    pub code: &'static str,
    pub why: String,
}

impl Refusal {
    pub fn new(code: &'static str, why: impl Into<String>) -> Self {
        Self { code, why: why.into() }
    }
}

impl std::fmt::Display for Refusal {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.why)
    }
}

/// A member's place in a stream as the host keeps it.
pub struct StreamHandle {
    pub stop: Arc<AtomicBool>,
    pub renewed: Arc<Mutex<Instant>>,
    pub stats: Arc<Mutex<crate::stream::Stats>>,
    /// The stream (one encoder) it is part of; shared by the members who follow the host.
    pub group: u64,
    pub shared: bool,
    /// The stream's thread is over.
    pub over: Arc<AtomicBool>,
}

/// How long a stream lives without its member renewing it through the session server.
pub const LEASE: Duration = Duration::from_secs(15);

pub struct VideoHost {
    /// Views of their own at most, by hand (`--video-streams`); None: as many as fit.
    max_streams: Mutex<Option<usize>>,
    source: RwLock<Option<Arc<dyn FrameSource>>>,
    pub(crate) streams: Mutex<HashMap<u64, StreamHandle>>,
    /// The shared streams by what they show, to join (`stream.rs`).
    pub(crate) groups: Mutex<HashMap<crate::stream::GroupKey, crate::stream::GroupHandle>>,
    pub(crate) next_id: Mutex<u64>,
    /// Software encoders running (each costs the processor).
    pub(crate) software: AtomicUsize,
}

/// The process's video host: the app sets its source, the server mounts its router.
pub fn host() -> Arc<VideoHost> {
    static HOST: OnceLock<Arc<VideoHost>> = OnceLock::new();
    HOST.get_or_init(|| {
        let h = Arc::new(VideoHost::adaptive());
        let w = Arc::downgrade(&h);
        std::thread::Builder::new()
            .name("video leases".into())
            .spawn(move || loop {
                std::thread::sleep(Duration::from_secs(1));
                match w.upgrade() {
                    Some(h) => h.reap(LEASE),
                    None => return,
                }
            })
            .ok();
        h
    })
    .clone()
}

/// Software encoders at most: a quarter of the processor's threads (at least one).
pub fn software_cap() -> usize {
    (std::thread::available_parallelism().map(|n| n.get()).unwrap_or(4) / 4).max(1)
}

impl VideoHost {
    /// At most `max_streams` views of their own (0: video off).
    pub fn new(max_streams: usize) -> Self {
        let h = Self::adaptive();
        h.set_max_streams(max_streams);
        h
    }

    /// As many views as the GPU and the encoders take.
    pub fn adaptive() -> Self {
        Self {
            max_streams: Mutex::new(None),
            source: RwLock::new(None),
            streams: Mutex::new(HashMap::new()),
            groups: Mutex::new(HashMap::new()),
            next_id: Mutex::new(1),
            software: AtomicUsize::new(0),
        }
    }

    pub fn set_source(&self, s: Option<Arc<dyn FrameSource>>) {
        if s.is_none() {
            self.stop_all();
        }
        *self.source.write() = s;
    }

    pub fn source(&self) -> Option<Arc<dyn FrameSource>> {
        self.source.read().clone()
    }

    /// The cap set by hand, if any.
    pub fn max_streams(&self) -> Option<usize> {
        *self.max_streams.lock()
    }

    pub fn set_max_streams(&self, n: usize) {
        *self.max_streams.lock() = Some(n);
    }

    pub fn enabled(&self) -> bool {
        self.max_streams() != Some(0)
    }

    /// Ends members' places that are over or whose lease ran out.
    pub fn reap(&self, lease: Duration) {
        let mut m = self.streams.lock();
        let gone: Vec<u64> = m.iter().filter(|(_, s)| s.over.load(Ordering::Acquire) || s.renewed.lock().elapsed() > lease).map(|(k, _)| *k).collect();
        for k in gone {
            if let Some(s) = m.remove(&k) {
                s.stop.store(true, Ordering::SeqCst);
            }
        }
    }

    /// Views of their own running, besides `member`'s.
    pub fn own_views(&self, member: u64) -> usize {
        let m = self.streams.lock();
        let mut ids: Vec<u64> = m.iter().filter(|(k, s)| **k != member && !s.shared).map(|(_, s)| s.group).collect();
        ids.sort_unstable();
        ids.dedup();
        ids.len()
    }

    /// Whether `member` may start a view of its own now (its running one is replaced); joining
    /// a shared stream needs no more than video being on.
    pub fn admit(&self, member: u64, own_view: bool) -> Result<(), Refusal> {
        if !self.enabled() {
            return Err(Refusal::new("off", "the host has video streams off"));
        }
        if !own_view {
            return Ok(());
        }
        if let Some(max) = self.max_streams() {
            if self.own_views(member) >= max {
                return Err(Refusal::new("full", format!("the host sends {max} views already (its limit)")));
            }
        }
        if self.source().is_some_and(|s| s.saturated()) {
            return Err(Refusal::new("full", "the host's graphics card has no room for another view (its own frames come first)"));
        }
        Ok(())
    }

    pub(crate) fn insert(&self, member: u64, h: StreamHandle) {
        if let Some(old) = self.streams.lock().insert(member, h) {
            old.stop.store(true, Ordering::SeqCst);
        }
    }

    pub fn stop(&self, member: u64) {
        if let Some(s) = self.streams.lock().remove(&member) {
            s.stop.store(true, Ordering::SeqCst);
        }
    }

    pub fn stop_all(&self) {
        for (_, s) in self.streams.lock().drain() {
            s.stop.store(true, Ordering::SeqCst);
        }
    }

    pub fn renew(&self, member: u64) -> bool {
        match self.streams.lock().get(&member) {
            Some(s) => {
                *s.renewed.lock() = Instant::now();
                true
            }
            None => false,
        }
    }

    /// Members receiving video.
    pub fn running(&self) -> usize {
        self.streams.lock().len()
    }

    /// Encoded streams (pictures drawn and encoded): one per own view, one per shared view.
    pub fn encoded(&self) -> usize {
        let m = self.streams.lock();
        let mut ids: Vec<u64> = m.values().map(|s| s.group).collect();
        ids.sort_unstable();
        ids.dedup();
        ids.len()
    }

    pub fn stats_json(&self) -> serde_json::Value {
        let m = self.streams.lock();
        let streams: Vec<_> = m.iter().map(|(k, s)| serde_json::json!({ "member": k, "stream": s.group, "shared": s.shared, "stats": s.stats.lock().json() })).collect();
        drop(m);
        let host = self.source().and_then(|s| s.host_frames()).map(|(a, b, c)| serde_json::json!({ "p50": a, "p99": b, "max": c }));
        serde_json::json!({ "max": self.max_streams(), "encoded": self.encoded(), "streams": streams, "hostFrames": host, "saturated": self.source().is_some_and(|s| s.saturated()) })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn running(group: u64, shared: bool) -> StreamHandle {
        StreamHandle { stop: Default::default(), renewed: Arc::new(Mutex::new(Instant::now())), stats: Default::default(), group, shared, over: Default::default() }
    }

    #[test]
    fn a_cap_by_hand_counts_own_views_and_one_per_member() {
        let h = VideoHost::new(4);
        for m in 1..=4u64 {
            assert!(h.admit(m, true).is_ok());
            h.insert(m, running(m, false));
        }
        assert_eq!(h.admit(5, true).unwrap_err().code, "full", "a fifth view of its own");
        assert!(h.admit(5, false).is_ok(), "joining the shared stream costs no view");
        assert!(h.admit(3, true).is_ok(), "a member replacing its own view");
        for m in 10..20u64 {
            h.insert(m, running(100, true));
        }
        assert_eq!(h.own_views(0), 4);
        assert_eq!(h.encoded(), 5, "ten members on one shared stream: one encoder");
        h.stop(2);
        assert!(h.admit(5, true).is_ok());
        h.set_max_streams(0);
        assert_eq!(h.admit(1, false).unwrap_err().code, "off", "streams off");
        // A lease not renewed ends the member's place.
        h.set_max_streams(4);
        *h.streams.lock().get(&1).unwrap().renewed.lock() = Instant::now() - Duration::from_secs(60);
        h.reap(LEASE);
        assert!(!h.streams.lock().contains_key(&1));
        assert!(!h.renew(1) && h.renew(3));
    }

    struct Full;
    impl FrameSource for Full {
        fn open(&self, _: u64, _: ViewParams, _: u32, _: FrameSink) -> Result<(), String> {
            Ok(())
        }
        fn update(&self, _: u64, _: ViewParams) {}
        fn set_fps(&self, _: u64, _: u32) {}
        fn close(&self, _: u64) {}
        fn saturated(&self) -> bool {
            true
        }
    }

    #[test]
    fn no_fixed_cap_but_the_gpu_budget() {
        let h = VideoHost::adaptive();
        for m in 1..=40u64 {
            assert!(h.admit(m, true).is_ok(), "no fixed number");
            h.insert(m, running(m, false));
        }
        h.set_source(Some(Arc::new(Full)));
        assert_eq!(h.admit(41, true).unwrap_err().code, "full", "the viewport has no room");
        assert!(h.admit(41, false).is_ok(), "the shared stream still takes members");
    }
}
