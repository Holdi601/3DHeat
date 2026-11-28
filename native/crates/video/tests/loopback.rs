//! A whole stream on this machine: a str0m peer stands in for the browser,
//! offers to receive video with a `cam` channel, gets the answer, connects
//! over loopback UDP and receives encoded pictures that a stand-in viewport
//! draws; it sends a camera, and the frames announced on the channel carry it.
//! Skipped where no encoder is (Linux for now; Windows without Media Foundation).

use std::net::{IpAddr, Ipv4Addr, UdpSocket};
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

use heat3d_video::encode::{self, Codec};
use heat3d_video::stream::{self, Offer};
use heat3d_video::{Frame, FrameSink, FrameSource, RoleLimit, VideoHost, ViewParams};
use parking_lot::Mutex;
use str0m::media::{Direction, MediaKind};
use str0m::net::{Protocol, Receive};
use str0m::{Candidate, Event, Input, Output, RtcConfig};

/// Draws test pictures at the asked rate, at the size of the last camera.
struct Fake {
    views: Arc<Mutex<Vec<(u64, ViewParams, FrameSink, Arc<AtomicBool>)>>>,
    updates: Arc<AtomicU32>,
}

impl FrameSource for Fake {
    fn open(&self, id: u64, view: ViewParams, fps: u32, sink: FrameSink) -> Result<(), String> {
        let stop = Arc::new(AtomicBool::new(false));
        self.views.lock().push((id, view, sink.clone(), stop.clone()));
        let views = self.views.clone();
        std::thread::spawn(move || {
            let mut n = 0;
            while !stop.load(Ordering::SeqCst) {
                let v = views.lock().iter().find(|x| x.0 == id).map(|x| x.1).unwrap();
                let t0 = Instant::now();
                sink(Frame { width: v.width, height: v.height, nv12: encode::test_picture(v.width, v.height, n), seq: v.seq, sent_ms: v.sent_ms, drawn: t0, render_ms: 1.0 });
                n += 1;
                std::thread::sleep(Duration::from_millis(1000 / fps.max(1) as u64));
            }
        });
        Ok(())
    }
    fn update(&self, id: u64, view: ViewParams) {
        self.updates.fetch_add(1, Ordering::SeqCst);
        if let Some(x) = self.views.lock().iter_mut().find(|x| x.0 == id) {
            x.1 = view;
        }
    }
    fn set_fps(&self, _: u64, _: u32) {}
    fn close(&self, id: u64) {
        for x in self.views.lock().iter().filter(|x| x.0 == id) {
            x.3.store(true, Ordering::SeqCst);
        }
    }
}

fn camera(seq: u32) -> ViewParams {
    let mut view = [0f32; 16];
    view[0] = 1.0;
    view[5] = 1.0;
    view[10] = 1.0;
    view[15] = 1.0;
    ViewParams { view, fov: 50.0, ortho: false, ortho_height: 0.0, width: 640, height: 360, seq, sent_ms: 1000.0 + seq as f64, follow_host: false }
}

#[test]
fn a_member_receives_its_view() {
    if encode::codecs().is_empty() {
        eprintln!("skipped: no encoder here");
        return;
    }
    let host = Arc::new(VideoHost::new(4));
    let fake = Arc::new(Fake { views: Default::default(), updates: Default::default() });
    host.set_source(Some(fake.clone()));

    let mut client = RtcConfig::new().build(Instant::now());
    let sock = UdpSocket::bind("127.0.0.1:0").unwrap();
    client.add_local_candidate(Candidate::host(sock.local_addr().unwrap(), "udp").unwrap());
    let mut api = client.sdp_api();
    let _mid = api.add_media(MediaKind::Video, Direction::RecvOnly, None, None, None);
    let cid = api.add_channel("cam".into());
    let (offer, pending) = api.apply().unwrap();
    let limit = RoleLimit { width: 1280, height: 720, fps: 30, kbps: 3000 };
    let answer = stream::start(&host, 7, limit, IpAddr::V4(Ipv4Addr::LOCALHOST), Offer { sdp: offer, codecs: vec![Codec::H264], view: camera(0), follow: false }).unwrap();
    eprintln!("{} (hardware {}), {:?} {}x{}", answer.encoder, answer.hardware, answer.codec, answer.width, answer.height);
    client.sdp_api().accept_answer(pending, answer.answer).unwrap();
    // A second member past a cap of one is refused before anything starts.
    host.set_max_streams(1);
    assert!(host.admit(8, true).is_err());
    host.set_max_streams(4);

    let mut frames = 0;
    let mut bytes = 0usize;
    let mut announced: Vec<String> = Vec::new();
    let mut sent_camera = false;
    let until = Instant::now() + Duration::from_secs(10);
    let mut buf = vec![0u8; 2000];
    while Instant::now() < until && !(frames >= 20 && announced.iter().any(|a| a.contains("\"s\":5,"))) {
        host.renew(7);
        let timeout = loop {
            match client.poll_output().unwrap() {
                Output::Timeout(t) => break t,
                Output::Transmit(t) => {
                    sock.send_to(&t.contents, t.destination).unwrap();
                }
                Output::Event(Event::MediaData(d)) => {
                    frames += 1;
                    bytes += d.data.len();
                }
                Output::Event(Event::ChannelOpen(id, _)) if id == cid && !sent_camera => {
                    sent_camera = true;
                }
                Output::Event(Event::ChannelData(d)) => announced.push(String::from_utf8_lossy(&d.data).into_owned()),
                Output::Event(_) => {}
            }
        };
        if sent_camera && !announced.iter().any(|a| a.contains("\"s\":5,")) {
            if let Some(mut ch) = client.channel(cid) {
                let _ = ch.write(true, &camera(5).encode());
            }
        }
        let wait = timeout.saturating_duration_since(Instant::now()).clamp(Duration::from_millis(1), Duration::from_millis(20));
        sock.set_read_timeout(Some(wait)).unwrap();
        match sock.recv_from(&mut buf) {
            Ok((n, from)) => {
                let input = Input::Receive(Instant::now(), Receive { proto: Protocol::Udp, source: from, destination: sock.local_addr().unwrap(), contents: buf[..n].try_into().unwrap() });
                client.handle_input(input).unwrap();
            }
            Err(_) => client.handle_input(Input::Timeout(Instant::now())).unwrap(),
        }
    }
    let stats = host.stats_json();
    eprintln!("{frames} frames, {bytes} bytes; {}", stats);
    assert!(frames >= 20, "pictures arrived: {frames}");
    assert!(fake.updates.load(Ordering::SeqCst) >= 1, "the camera reached the viewport");
    assert!(announced.iter().any(|a| a.contains("\"s\":5,") && a.contains("\"c\":1005")), "frames name the camera they were drawn from: {:?}", announced.last());
    host.stop(7);
    std::thread::sleep(Duration::from_millis(300));
    assert_eq!(host.running(), 0);
}

/// A str0m peer standing in for a member's browser: its offer, then pumped until it has `want` pictures.
struct Member {
    rtc: str0m::Rtc,
    sock: UdpSocket,
    frames: usize,
}

impl Member {
    fn join(host: &Arc<VideoHost>, id: u64, follow: bool) -> Member {
        let mut rtc = RtcConfig::new().build(Instant::now());
        let sock = UdpSocket::bind("127.0.0.1:0").unwrap();
        rtc.add_local_candidate(Candidate::host(sock.local_addr().unwrap(), "udp").unwrap());
        let mut api = rtc.sdp_api();
        api.add_media(MediaKind::Video, Direction::RecvOnly, None, None, None);
        api.add_channel("cam".into());
        let (offer, pending) = api.apply().unwrap();
        let limit = RoleLimit { width: 640, height: 360, fps: 30, kbps: 2000 };
        let answer = stream::start(host, id, limit, IpAddr::V4(Ipv4Addr::LOCALHOST), Offer { sdp: offer, codecs: vec![Codec::H264], view: camera(0), follow }).unwrap();
        rtc.sdp_api().accept_answer(pending, answer.answer).unwrap();
        Member { rtc, sock, frames: 0 }
    }

    fn pump(&mut self) {
        let mut buf = vec![0u8; 2000];
        let timeout = loop {
            match self.rtc.poll_output().unwrap() {
                Output::Timeout(t) => break t,
                Output::Transmit(t) => {
                    self.sock.send_to(&t.contents, t.destination).unwrap();
                }
                Output::Event(Event::MediaData(_)) => self.frames += 1,
                Output::Event(_) => {}
            }
        };
        let wait = timeout.saturating_duration_since(Instant::now()).clamp(Duration::from_millis(1), Duration::from_millis(5));
        self.sock.set_read_timeout(Some(wait)).unwrap();
        match self.sock.recv_from(&mut buf) {
            Ok((n, from)) => {
                let input = Input::Receive(Instant::now(), Receive { proto: Protocol::Udp, source: from, destination: self.sock.local_addr().unwrap(), contents: buf[..n].try_into().unwrap() });
                self.rtc.handle_input(input).unwrap();
            }
            Err(_) => self.rtc.handle_input(Input::Timeout(Instant::now())).unwrap(),
        }
    }
}

#[test]
fn followers_of_the_host_share_one_stream() {
    if encode::codecs().is_empty() {
        eprintln!("skipped: no encoder here");
        return;
    }
    let host = Arc::new(VideoHost::adaptive());
    let fake = Arc::new(Fake { views: Default::default(), updates: Default::default() });
    host.set_source(Some(fake.clone()));
    // Six members follow the host, one has a view of its own.
    let mut members: Vec<Member> = (1..=6).map(|id| Member::join(&host, id, true)).collect();
    members.push(Member::join(&host, 7, false));
    assert_eq!(host.encoded(), 2, "one shared stream and one own view: {}", host.stats_json());
    assert_eq!(fake.views.lock().len(), 2, "two pictures drawn, not seven");
    assert!(fake.views.lock().iter().any(|v| v.1.follow_host), "the shared one is the host's camera");
    let until = Instant::now() + Duration::from_secs(10);
    while Instant::now() < until && members.iter().any(|m| m.frames < 10) {
        for (i, m) in members.iter_mut().enumerate() {
            host.renew(i as u64 + 1);
            m.pump();
        }
    }
    let got: Vec<usize> = members.iter().map(|m| m.frames).collect();
    assert!(got.iter().all(|f| *f >= 10), "every member gets pictures: {got:?}");
    // The last follower leaving ends the shared stream; the own view goes on.
    for id in 1..=6 {
        host.stop(id);
    }
    std::thread::sleep(Duration::from_millis(400));
    assert_eq!(host.encoded(), 1);
    host.stop(7);
}
