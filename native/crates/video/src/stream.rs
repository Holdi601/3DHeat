//! A stream: a thread with its encoder (made on this thread: Media Foundation's
//! objects stay where they were made), the newest picture the viewport drew
//! for it, and the WebRTC sessions (str0m, ICE-lite: the host answers, the
//! browser checks the one host candidate) of the members it goes to, on one
//! UDP socket. A member's own view goes to that member only; the host's view
//! (members who follow the host) is encoded once and sent to all of them, so a
//! large team watching the host costs one picture and one encoder.
//!
//! The browser's offer names its codecs; the first one this machine encodes is
//! taken (hardware first; H.264 always, in software if need be). The link's
//! estimate (TWCC; the slowest member's on a shared stream) sets the bitrate
//! and, when it is low, the frame rate; a lost picture, and a member joining,
//! ask for a key frame (PLI/FIR). Each frame sent is announced on the
//! data channel with the camera it was drawn from, so the page can tell its
//! input-to-picture time.

use std::io::ErrorKind;
use std::net::{IpAddr, Ipv4Addr, SocketAddr, UdpSocket};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc;
use std::sync::Arc;
use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde::Serialize;
use str0m::bwe::{Bitrate, BweKind};
use str0m::change::{SdpAnswer, SdpOffer};
use str0m::channel::ChannelId;
use str0m::format::Codec as RtcCodec;
use str0m::media::{MediaTime, Mid, Pt};
use str0m::net::{Protocol, Receive};
use str0m::rtp::Extension;
use str0m::{Candidate, Event, IceConnectionState, Input, Output, Rtc, RtcConfig};

use crate::encode::{self, Codec, Encoder, EncoderInfo, Settings};
use crate::host::{Frame, Refusal, StreamHandle, VideoHost, LEASE};
use crate::view::{RoleLimit, ViewParams};

/// What a stream did, for the host's measurements and the member's panel.
#[derive(Default)]
pub struct Stats {
    pub started: Option<Instant>,
    pub encoder: String,
    pub hardware: bool,
    pub codec: Option<Codec>,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub kbps: u32,
    pub estimate_kbps: u32,
    pub frames: u64,
    pub keyframes: u64,
    pub bytes: u64,
    /// Pictures the viewport drew that a newer one replaced before the encoder took them.
    pub replaced: u64,
    pub encode_ms: Vec<f32>,
    pub render_ms: Vec<f32>,
    pub frame_bytes: Vec<u32>,
}

fn pct(v: &[f32], p: f32) -> f32 {
    if v.is_empty() {
        return 0.0;
    }
    let mut s = v.to_vec();
    s.sort_by(|a, b| a.total_cmp(b));
    s[((s.len() - 1) as f32 * p).round() as usize]
}

fn push<T>(v: &mut Vec<T>, x: T) {
    if v.len() >= 3000 {
        v.drain(..1000);
    }
    v.push(x);
}

impl Stats {
    pub fn json(&self) -> serde_json::Value {
        let secs = self.started.map(|s| s.elapsed().as_secs_f64()).unwrap_or(0.0).max(1e-3);
        let sizes: Vec<f32> = self.frame_bytes.iter().map(|b| *b as f32).collect();
        serde_json::json!({
            "encoder": self.encoder, "hardware": self.hardware, "codec": self.codec,
            "width": self.width, "height": self.height, "fps": self.fps, "kbps": self.kbps, "estimateKbps": self.estimate_kbps,
            "frames": self.frames, "keyframes": self.keyframes, "replaced": self.replaced,
            "sentKbps": (self.bytes as f64 * 8.0 / 1000.0 / secs).round(),
            "encodeMs": { "p50": pct(&self.encode_ms, 0.5), "p99": pct(&self.encode_ms, 0.99), "max": pct(&self.encode_ms, 1.0) },
            "renderMs": { "p50": pct(&self.render_ms, 0.5), "p99": pct(&self.render_ms, 0.99), "max": pct(&self.render_ms, 1.0) },
            "frameBytes": { "p50": pct(&sizes, 0.5), "p99": pct(&sizes, 0.99), "max": pct(&sizes, 1.0) },
        })
    }
}

/// What the member's page asked for.
pub struct Offer {
    pub sdp: SdpOffer,
    /// The codecs its browser decodes, its preference first.
    pub codecs: Vec<Codec>,
    pub view: ViewParams,
    /// It follows the host's camera: the shared stream of the host's view.
    pub follow: bool,
}

#[derive(Serialize)]
pub struct Answer {
    pub answer: SdpAnswer,
    pub codec: Codec,
    pub encoder: String,
    pub hardware: bool,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub kbps: u32,
}

/// The address of this machine the member reaches best: loopback for this machine, else the
/// LAN address sharing the longest prefix with the member's.
pub fn local_ip_for(peer: IpAddr) -> Option<IpAddr> {
    if peer.is_loopback() {
        return Some(IpAddr::V4(Ipv4Addr::LOCALHOST));
    }
    let IpAddr::V4(p) = peer else { return None };
    let p = u32::from(p);
    if_addrs::get_if_addrs()
        .ok()?
        .into_iter()
        .filter_map(|i| match i.ip() {
            IpAddr::V4(a) if !a.is_loopback() && !a.is_link_local() && !a.is_unspecified() => Some(a),
            _ => None,
        })
        .max_by_key(|a| (u32::from(*a) ^ p).leading_zeros())
        .map(IpAddr::V4)
}

fn rtc_codec(c: Codec) -> RtcCodec {
    match c {
        Codec::H264 => RtcCodec::H264,
        Codec::H265 => RtcCodec::H265,
        Codec::Av1 => RtcCodec::Av1,
    }
}

/// The first codec of the member's list this machine encodes, with its encoder.
fn pick_encoder(codecs: &[Codec], v: &ViewParams, limit: &RoleLimit, kbps: u32) -> anyhow::Result<Box<dyn Encoder>> {
    let mut last = anyhow::anyhow!("the member's browser named no codec");
    for c in codecs {
        let s = Settings { codec: *c, width: v.width, height: v.height, fps: limit.fps, kbps };
        match encode::open(&s, false) {
            Ok(e) => return Ok(e),
            Err(e) => last = e,
        }
    }
    Err(last)
}

/// What a shared stream shows: the host's camera, for members on one address of this machine
/// with one codec and one role's limit.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub struct GroupKey {
    pub ip: IpAddr,
    pub codec: Codec,
    pub limit: RoleLimit,
}

/// A running stream (one picture drawn, one encoder) as the host finds it to add a member.
#[derive(Clone)]
pub struct GroupHandle {
    pub id: u64,
    add: mpsc::Sender<Peer>,
    wake: Arc<UdpSocket>,
    local: SocketAddr,
    info: EncoderInfo,
    closed: Arc<AtomicBool>,
    over: Arc<AtomicBool>,
    stats: Arc<Mutex<Stats>>,
    width: u32,
    height: u32,
    fps: u32,
    kbps: u32,
}

/// One member's WebRTC session on a stream.
pub struct Peer {
    member: u64,
    rtc: Rtc,
    stop: Arc<AtomicBool>,
    renewed: Arc<Mutex<Instant>>,
    mid: Option<Mid>,
    pt: Option<Pt>,
    chan: Option<ChannelId>,
    connected: bool,
    connect_by: Instant,
    estimate_kbps: Option<u32>,
    /// Camera messages it may send: a bucket of 120, 120 a second.
    cam_budget: f32,
    cam_at: Instant,
    dead: bool,
}

const VIEWPORT_OFF: &str = "the host's native viewport is not running (Settings > Native viewport)";

/// Starts `member`'s video: the shared stream of the host's camera when it follows the host (one
/// encoder for all of them), else a view of its own; answers its offer, then sends until it
/// stops, its lease runs out or the link goes.
pub fn start(host: &Arc<VideoHost>, member: u64, limit: RoleLimit, peer: IpAddr, offer: Offer) -> Result<Answer, Refusal> {
    let source = host.source().ok_or_else(|| Refusal::new("viewport", VIEWPORT_OFF))?;
    let ip = local_ip_for(peer).ok_or_else(|| Refusal::new("start", "no local address reaches the member"))?;
    let key = offer.follow.then(|| GroupKey { ip, codec: if offer.codecs.contains(&Codec::H264) || offer.codecs.is_empty() { Codec::H264 } else { offer.codecs[0] }, limit });
    let existing = key.and_then(|k| host.groups.lock().get(&k).filter(|g| !g.closed.load(Ordering::Acquire)).cloned());
    host.admit(member, existing.is_none())?;
    let group = match existing {
        Some(g) => g,
        None => {
            let (codecs, view) = match key {
                // The host's picture at the role's size; the viewport keeps the host's shape within it.
                Some(k) => (vec![k.codec], ViewParams { width: limit.width / 8 * 8, height: limit.height / 2 * 2, follow_host: true, seq: 0, sent_ms: 0.0, ..offer.view }),
                None => (offer.codecs.clone(), offer.view),
            };
            spawn_group(host, source, key, ip, codecs, view, limit)?
        }
    };
    let start_kbps = group.kbps;
    let mut cfg = RtcConfig::new().set_ice_lite(true).clear_codecs().set_extension(12, Extension::PlayoutDelay);
    // Playout delay 0 (the browser's low-latency path: each frame shown as it is decoded, no
    // smoothing buffer) where the browser offers the extension; Chrome and Edge do.
    cfg = match group.info.codec {
        Codec::H264 => cfg.enable_h264(true),
        Codec::H265 => cfg.enable_h265(true),
        Codec::Av1 => cfg.enable_av1(true),
    };
    let mut rtc = cfg.enable_bwe(Some(Bitrate::kbps(start_kbps as u64))).build(Instant::now());
    let c = Candidate::host(group.local, "udp").map_err(|e| Refusal::new("start", format!("candidate: {e}")))?;
    rtc.add_local_candidate(c);
    let answer = rtc.sdp_api().accept_offer(offer.sdp).map_err(|e| Refusal::new("bad", format!("the offer: {e}")))?;
    let stop = Arc::new(AtomicBool::new(false));
    let renewed = Arc::new(Mutex::new(Instant::now()));
    let now = Instant::now();
    let p = Peer { member, rtc, stop: stop.clone(), renewed: renewed.clone(), mid: None, pt: None, chan: None, connected: false, connect_by: now + Duration::from_secs(20), estimate_kbps: None, cam_budget: 120.0, cam_at: now, dead: false };
    {
        // Under the groups' lock: a stream closing for want of members takes no new one.
        let _g = host.groups.lock();
        if group.closed.load(Ordering::Acquire) || group.add.send(p).is_err() {
            return Err(Refusal::new("start", "the stream ended as it started; try again"));
        }
    }
    let _ = group.wake.send_to(&[0], group.local);
    host.insert(member, StreamHandle { stop, renewed, stats: group.stats.clone(), group: group.id, shared: key.is_some(), over: group.over.clone() });
    let info = group.info.clone();
    Ok(Answer { answer, codec: info.codec, encoder: info.name, hardware: info.hardware, width: group.width, height: group.height, fps: group.fps, kbps: group.kbps })
}

/// A stream's thread: its encoder (made there: Media Foundation's objects stay where they were
/// made), the picture the viewport draws for it, and its members' sessions on one UDP socket.
fn spawn_group(host: &Arc<VideoHost>, src: Arc<dyn crate::FrameSource>, key: Option<GroupKey>, ip: IpAddr, codecs: Vec<Codec>, view: ViewParams, limit: RoleLimit) -> Result<GroupHandle, Refusal> {
    let udp = |e: std::io::Error| Refusal::new("start", format!("udp: {e}"));
    let socket = UdpSocket::bind(SocketAddr::new(ip, 0)).map_err(udp)?;
    let local = socket.local_addr().map_err(udp)?;
    let wake = Arc::new(UdpSocket::bind(SocketAddr::new(ip, 0)).map_err(udp)?);
    let waker_addr = wake.local_addr().map_err(udp)?;
    let id = {
        let mut n = host.next_id.lock();
        *n += 1;
        *n
    };
    let (add_tx, add_rx) = mpsc::channel::<Peer>();
    let (ready_tx, ready_rx) = mpsc::channel::<Result<EncoderInfo, Refusal>>();
    let closed = Arc::new(AtomicBool::new(false));
    let over = Arc::new(AtomicBool::new(false));
    let stats = Arc::new(Mutex::new(Stats::default()));
    let pending: Arc<Mutex<Option<Frame>>> = Arc::new(Mutex::new(None));
    let start_kbps = limit.kbps.min(4000);
    let weak = Arc::downgrade(host);
    let (cl, ov, ss, pd, wk) = (closed.clone(), over.clone(), stats.clone(), pending.clone(), wake.clone());
    std::thread::Builder::new()
        .name(format!("video {id}"))
        .spawn(move || {
            let encoder = match pick_encoder(&codecs, &view, &limit, start_kbps) {
                Ok(e) => e,
                Err(e) => {
                    let _ = ready_tx.send(Err(Refusal::new("full", format!("no encoder took another stream: {e:#}"))));
                    ov.store(true, Ordering::Release);
                    return;
                }
            };
            // A software encoder costs the processor: a share of it at most (the hardware's own
            // limit shows as the hardware encoder refusing to open).
            let software = !encoder.info().hardware;
            if software {
                let n = weak.upgrade().map(|h| h.software.fetch_add(1, Ordering::AcqRel)).unwrap_or(0);
                if n >= crate::host::software_cap() {
                    if let Some(h) = weak.upgrade() {
                        h.software.fetch_sub(1, Ordering::AcqRel);
                    }
                    let _ = ready_tx.send(Err(Refusal::new("full", "the host's video encoders are all in use")));
                    ov.store(true, Ordering::Release);
                    return;
                }
            }
            let (pd2, ss2) = (pd.clone(), ss.clone());
            let sink: crate::FrameSink = Arc::new(move |f: Frame| {
                if pd2.lock().replace(f).is_some() {
                    ss2.lock().replaced += 1;
                }
                let _ = wk.send_to(&[0], local);
            });
            if let Err(e) = src.open(id, view, limit.fps, sink) {
                let _ = ready_tx.send(Err(Refusal::new("viewport", e)));
                if software {
                    if let Some(h) = weak.upgrade() {
                        h.software.fetch_sub(1, Ordering::AcqRel);
                    }
                }
                ov.store(true, Ordering::Release);
                return;
            }
            let codec = encoder.info().codec;
            {
                let mut s = ss.lock();
                s.started = Some(Instant::now());
                s.encoder = encoder.info().name.clone();
                s.hardware = encoder.info().hardware;
                s.codec = Some(codec);
                s.width = view.width;
                s.height = view.height;
                s.fps = limit.fps;
                s.kbps = start_kbps;
            }
            let _ = ready_tx.send(Ok(encoder.info().clone()));
            let mut g = Group {
                host: weak.clone(),
                key,
                id,
                socket,
                waker_addr,
                add: add_rx,
                peers: Vec::new(),
                ever: false,
                encoder,
                codec,
                limit,
                view,
                src: src.clone(),
                stats: ss,
                pending: pd,
                closed: cl,
                force_key: true,
                kbps: start_kbps,
                fps: limit.fps,
                begun: Instant::now(),
            };
            if let Err(e) = g.go() {
                eprintln!("video {id}: {e:#}");
                g.close();
            }
            src.close(id);
            if software {
                if let Some(h) = weak.upgrade() {
                    h.software.fetch_sub(1, Ordering::AcqRel);
                }
            }
            ov.store(true, Ordering::Release);
        })
        .map_err(|e| Refusal::new("start", e.to_string()))?;
    let info = ready_rx.recv_timeout(Duration::from_secs(10)).map_err(|_| Refusal::new("start", "the stream did not start"))??;
    let handle = GroupHandle { id, add: add_tx, wake, local, info, closed, over, stats, width: view.width, height: view.height, fps: limit.fps, kbps: start_kbps };
    if let Some(k) = key {
        host.groups.lock().insert(k, handle.clone());
    }
    Ok(handle)
}

struct Group {
    host: std::sync::Weak<VideoHost>,
    key: Option<GroupKey>,
    id: u64,
    socket: UdpSocket,
    waker_addr: SocketAddr,
    add: mpsc::Receiver<Peer>,
    peers: Vec<Peer>,
    /// A member was on it once: when the last goes, so does the stream.
    ever: bool,
    encoder: Box<dyn Encoder>,
    codec: Codec,
    limit: RoleLimit,
    view: ViewParams,
    src: Arc<dyn crate::FrameSource>,
    stats: Arc<Mutex<Stats>>,
    pending: Arc<Mutex<Option<Frame>>>,
    closed: Arc<AtomicBool>,
    force_key: bool,
    kbps: u32,
    fps: u32,
    begun: Instant,
}

impl Group {
    /// Takes no more members and leaves the shared streams' list.
    fn close(&mut self) {
        let host = self.host.upgrade();
        let mut groups = host.as_ref().map(|h| h.groups.lock());
        self.closed.store(true, Ordering::Release);
        if let (Some(g), Some(k)) = (groups.as_mut(), self.key) {
            if g.get(&k).is_some_and(|x| x.id == self.id) {
                g.remove(&k);
            }
        }
    }

    fn go(&mut self) -> anyhow::Result<()> {
        let mut buf = vec![0u8; 2000];
        loop {
            while let Ok(p) = self.add.try_recv() {
                self.peers.push(p);
                self.ever = true;
                // A member joining a running stream starts from a key frame.
                self.force_key = true;
            }
            let now = Instant::now();
            for p in self.peers.iter_mut() {
                let gone = p.dead || p.stop.load(Ordering::SeqCst) || p.renewed.lock().elapsed() > LEASE || (!p.connected && now > p.connect_by);
                if gone {
                    p.dead = true;
                    p.rtc.disconnect();
                }
            }
            let before = self.peers.len();
            self.peers.retain(|p| !p.dead);
            if self.peers.len() != before {
                self.adapt();
            }
            if self.peers.is_empty() && (self.ever || now > self.begun + Duration::from_secs(10)) {
                let host = self.host.upgrade();
                let _groups = host.as_ref().map(|h| h.groups.lock());
                if let Ok(p) = self.add.try_recv() {
                    self.peers.push(p);
                    continue;
                }
                drop(_groups);
                self.close();
                return Ok(());
            }
            let f = self.pending.lock().take();
            if let Some(f) = f {
                self.send(f)?;
            }
            let mut next = now + Duration::from_millis(100);
            for i in 0..self.peers.len() {
                loop {
                    match self.peers[i].rtc.poll_output() {
                        Ok(Output::Timeout(t)) => {
                            next = next.min(t);
                            break;
                        }
                        Ok(Output::Transmit(t)) => {
                            let _ = self.socket.send_to(&t.contents, t.destination);
                        }
                        Ok(Output::Event(e)) => self.event(i, e),
                        Err(e) => {
                            eprintln!("video {}: member {}: {e}", self.id, self.peers[i].member);
                            self.peers[i].dead = true;
                            break;
                        }
                    }
                }
            }
            let now = Instant::now();
            let wait = next.saturating_duration_since(now);
            if wait.is_zero() {
                self.timeouts(now);
                continue;
            }
            self.socket.set_read_timeout(Some(wait))?;
            match self.socket.recv_from(&mut buf) {
                Ok((n, from)) => {
                    if from == self.waker_addr {
                        continue;
                    }
                    let Ok(contents) = buf[..n].try_into() else { continue };
                    let input = Input::Receive(Instant::now(), Receive { proto: Protocol::Udp, source: from, destination: self.socket.local_addr()?, contents });
                    if let Some(p) = self.peers.iter_mut().find(|p| p.rtc.accepts(&input)) {
                        if p.rtc.handle_input(input).is_err() {
                            p.dead = true;
                        }
                    }
                }
                Err(e) if matches!(e.kind(), ErrorKind::WouldBlock | ErrorKind::TimedOut) => self.timeouts(Instant::now()),
                // A port a member closed (Windows tells with an ICMP reset): the link may still recover.
                Err(e) if e.kind() == ErrorKind::ConnectionReset => {}
                Err(e) => return Err(e.into()),
            }
        }
    }

    fn timeouts(&mut self, now: Instant) {
        for p in self.peers.iter_mut() {
            if p.rtc.handle_input(Input::Timeout(now)).is_err() {
                p.dead = true;
            }
        }
    }

    /// Handles member `i`'s event.
    fn event(&mut self, i: usize, e: Event) {
        match e {
            Event::IceConnectionStateChange(IceConnectionState::Disconnected) => self.peers[i].dead = true,
            Event::Connected => {
                self.peers[i].connected = true;
                self.force_key = true;
            }
            Event::MediaAdded(m) => {
                let p = &mut self.peers[i];
                p.mid = Some(m.mid);
                let want = rtc_codec(self.codec);
                if let Some(w) = p.rtc.writer(m.mid) {
                    let params: Vec<_> = w.payload_params().filter(|x| x.spec().codec == want).map(|x| (x.pt(), x.spec().format)).collect();
                    // H.264: packetization mode 1, baseline (42..) first, as encoded.
                    p.pt = params
                        .iter()
                        .find(|(_, f)| want != RtcCodec::H264 || (f.packetization_mode == Some(1) && f.profile_level_id.is_some_and(|x| x >> 16 == 0x42)))
                        .or_else(|| params.iter().find(|(_, f)| f.packetization_mode != Some(0)))
                        .or(params.first())
                        .map(|(pt, _)| *pt);
                }
            }
            Event::ChannelOpen(id, label) if label == "cam" => self.peers[i].chan = Some(id),
            Event::ChannelData(d) if Some(d.id) == self.peers[i].chan && d.binary => {
                // The host's picture (a shared stream) follows the host, not a member's camera.
                if self.key.is_some() {
                    return;
                }
                let now = Instant::now();
                let p = &mut self.peers[i];
                p.cam_budget = (p.cam_budget + now.duration_since(p.cam_at).as_secs_f32() * 120.0).min(120.0);
                p.cam_at = now;
                if p.cam_budget >= 1.0 {
                    p.cam_budget -= 1.0;
                    if let Some(v) = ViewParams::decode(&d.data, &self.limit) {
                        self.view = v;
                        self.src.update(self.id, v);
                    }
                }
            }
            Event::KeyframeRequest(_) => self.force_key = true,
            Event::EgressBitrateEstimate(BweKind::Twcc { estimate, .. }) | Event::EgressBitrateEstimate(BweKind::Remb { estimate, .. }) => {
                self.peers[i].estimate_kbps = Some((estimate.as_u64() / 1000) as u32);
                self.adapt();
            }
            _ => {}
        }
    }

    /// The slowest member's link sets the bitrate (85 % of its estimate, within the role's limit)
    /// and, when low, the frame rate: one encoder serves them all.
    fn adapt(&mut self) {
        let Some(estimate_kbps) = self.peers.iter().filter_map(|p| p.estimate_kbps).min() else { return };
        let target = (estimate_kbps as f32 * 0.85) as u32;
        let target = target.clamp(300, self.limit.kbps);
        if (target as f32 - self.kbps as f32).abs() > self.kbps as f32 * 0.1 {
            self.kbps = target;
            self.encoder.set_kbps(target);
        }
        let fps = if target < 800 { 15 } else if target < 2000 { 30 } else { 60 }.min(self.limit.fps);
        if fps != self.fps {
            self.fps = fps;
            self.src.set_fps(self.id, fps);
        }
        let mut s = self.stats.lock();
        s.kbps = self.kbps;
        s.fps = self.fps;
        s.estimate_kbps = estimate_kbps;
    }

    fn send(&mut self, f: Frame) -> anyhow::Result<()> {
        if !self.peers.iter().any(|p| p.connected && p.mid.is_some() && p.pt.is_some()) {
            return Ok(());
        }
        let info = self.encoder.info().clone();
        let size = {
            let st = self.stats.lock();
            (st.width, st.height)
        };
        if (f.width, f.height) != size {
            // A new size (the member resized, or the host lowered the pictures): a new encoder
            // of the same kind, a key frame first.
            let s = Settings { codec: self.codec, width: f.width, height: f.height, fps: self.limit.fps, kbps: self.kbps };
            self.encoder = encode::open(&s, !info.hardware)?;
            self.force_key = true;
            let mut st = self.stats.lock();
            st.width = f.width;
            st.height = f.height;
        }
        let since = f.drawn.saturating_duration_since(self.begun);
        let t0 = Instant::now();
        let key = std::mem::take(&mut self.force_key);
        let out = self.encoder.encode(&f.nv12, (since.as_nanos() / 100) as i64, key)?;
        let encode_ms = t0.elapsed().as_secs_f32() * 1e3;
        let rtp = MediaTime::from_90khz(since.as_micros() as u64 * 9 / 100);
        let mut bytes = 0usize;
        let mut keys = 0;
        let zero = MediaTime::from_90khz(0);
        for e in &out {
            bytes += e.data.len();
            keys += e.key as u64;
        }
        // The frame announced: the page matches it by its RTP time and measures camera-to-picture.
        let msg = format!(
            "{{\"t\":{},\"s\":{},\"c\":{},\"r\":{:.2},\"e\":{:.2},\"b\":{},\"k\":{},\"f\":{}}}",
            since.as_micros() as u64 * 9 / 100 % (1u64 << 32),
            f.seq,
            f.sent_ms,
            f.render_ms,
            encode_ms,
            bytes,
            self.kbps,
            self.fps
        );
        for p in self.peers.iter_mut() {
            let (Some(mid), Some(pt)) = (p.mid, p.pt) else { continue };
            if !p.connected {
                continue;
            }
            for e in &out {
                if let Some(w) = p.rtc.writer(mid) {
                    if w.playout_delay(zero, zero).write(pt, f.drawn, rtp, e.data.clone()).is_err() {
                        p.dead = true;
                    }
                }
            }
            if let Some(mut c) = p.chan.and_then(|c| p.rtc.channel(c)) {
                let _ = c.write(false, msg.as_bytes());
            }
        }
        let mut s = self.stats.lock();
        s.frames += 1;
        s.keyframes += keys;
        s.bytes += bytes as u64;
        push(&mut s.encode_ms, encode_ms);
        push(&mut s.render_ms, f.render_ms);
        push(&mut s.frame_bytes, bytes as u32);
        Ok(())
    }
}
