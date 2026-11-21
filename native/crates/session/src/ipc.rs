//! The narrow channel between the session server's two processes: the
//! **core** (the user's own rights: the listening socket, files, the data
//! API, the audit log) and the **gateway** (no rights: TLS, HTTP, WebSocket
//! and the session's rules, everything a stranger's bytes reach first).
//!
//! One pipe each way carries frames: `[u32 length][u8 kind][u32 stream][payload]`.
//! A frame is at most `MAX_FRAME` bytes; anything else ends the channel.
//! Streams are byte pipes both ends open: the core opens one per TCP
//! connection it accepted (the gateway speaks TLS and HTTP over it), the
//! gateway opens one per request it hands the core (a file, a published
//! asset, an upload, the data API), and speaks HTTP/1.1 over it. Each stream
//! has a window per direction: at most `WINDOW` bytes sent and not yet
//! acknowledged, so a slow stream never holds up the others and neither side
//! buffers more than the window for it. Control messages (the gateway's
//! settings, the audit log) travel on stream 0 as JSON.

use bytes::{Buf, BufMut, Bytes, BytesMut};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicI64, AtomicU32, Ordering};
use std::sync::{Arc, Mutex};
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt, DuplexStream};
use tokio::sync::{mpsc, watch, Notify};

/// A frame, at most (header included).
pub const MAX_FRAME: usize = 1 << 20;
/// Bytes in flight per stream and direction, at most.
pub const WINDOW: i64 = 64 * 1024;
/// A DATA frame's payload, at most.
const CHUNK: usize = 16 * 1024;
/// Streams open at once, at most (TCP connections and requests together).
pub const MAX_STREAMS: usize = 16_384;

const OPEN: u8 = 1;
const DATA: u8 = 2;
const ACK: u8 = 3;
const FIN: u8 = 4;
const RST: u8 = 5;
const CONTROL: u8 = 10;

#[derive(Debug)]
struct Frame {
    kind: u8,
    stream: u32,
    payload: Bytes,
}

enum ToApp {
    Data(Bytes),
    Fin,
}

struct Slot {
    to_app: mpsc::UnboundedSender<ToApp>,
    /// What we may still send.
    credit: Arc<(AtomicI64, Notify)>,
    /// What the peer sent that we have not acknowledged yet.
    unacked: Arc<AtomicI64>,
    reset: Arc<watch::Sender<bool>>,
}

struct Inner {
    out: mpsc::Sender<Frame>,
    streams: Mutex<HashMap<u32, Slot>>,
    next: AtomicU32,
    accepted: mpsc::Sender<(Bytes, DuplexStream)>,
    control: mpsc::UnboundedSender<Bytes>,
    closed: Notify,
    dead: AtomicBool,
    /// Set when the channel ends: the writer stops then too (it holds the
    /// channel's own sender, so it would otherwise wait for ever).
    ended: watch::Sender<bool>,
}

/// One end of the channel.
#[derive(Clone)]
pub struct Mux {
    inner: Arc<Inner>,
}

/// What the other end opens and says, for the side that serves it.
pub struct Incoming {
    pub streams: mpsc::Receiver<(Bytes, DuplexStream)>,
    pub control: mpsc::UnboundedReceiver<Bytes>,
}

impl Mux {
    /// Runs the channel over a reader and a writer (the pipes). `odd`: this
    /// end numbers its streams odd (the core), else even (the gateway).
    pub fn new<R, W>(read: R, write: W, odd: bool) -> (Mux, Incoming)
    where
        R: AsyncRead + Unpin + Send + 'static,
        W: AsyncWrite + Unpin + Send + 'static,
    {
        let (out_tx, out_rx) = mpsc::channel::<Frame>(1024);
        let (acc_tx, acc_rx) = mpsc::channel(1024);
        let (ctl_tx, ctl_rx) = mpsc::unbounded_channel();
        let inner = Arc::new(Inner {
            out: out_tx,
            streams: Mutex::new(HashMap::new()),
            next: AtomicU32::new(if odd { 1 } else { 2 }),
            accepted: acc_tx,
            control: ctl_tx,
            closed: Notify::new(),
            dead: AtomicBool::new(false),
            ended: watch::channel(false).0,
        });
        tokio::spawn(writer(write, out_rx, inner.clone()));
        tokio::spawn(reader(read, inner.clone()));
        (
            Mux { inner },
            Incoming {
                streams: acc_rx,
                control: ctl_rx,
            },
        )
    }

    /// Opens a stream; `meta` is what the other side is told about it.
    pub async fn open(&self, meta: &[u8]) -> std::io::Result<DuplexStream> {
        if self.inner.dead.load(Ordering::Relaxed) {
            return Err(std::io::Error::new(
                std::io::ErrorKind::BrokenPipe,
                "channel closed",
            ));
        }
        let id = self.inner.next.fetch_add(2, Ordering::Relaxed);
        let app =
            attach(&self.inner, id).ok_or_else(|| std::io::Error::other("too many streams"))?;
        send(&self.inner, OPEN, id, Bytes::copy_from_slice(meta)).await;
        Ok(app)
    }

    /// A control message (JSON) to the other side.
    pub async fn control(&self, msg: &[u8]) {
        send(&self.inner, CONTROL, 0, Bytes::copy_from_slice(msg)).await;
    }

    /// Waits until the channel has ended (the other process exited or broke the protocol).
    pub async fn closed(&self) {
        loop {
            let n = self.inner.closed.notified();
            if self.inner.dead.load(Ordering::Relaxed) {
                return;
            }
            n.await;
        }
    }

    pub fn is_closed(&self) -> bool {
        self.inner.dead.load(Ordering::Relaxed)
    }

    pub fn open_streams(&self) -> usize {
        self.inner.streams.lock().unwrap().len()
    }
}

async fn send(inner: &Inner, kind: u8, stream: u32, payload: Bytes) {
    let _ = inner
        .out
        .send(Frame {
            kind,
            stream,
            payload,
        })
        .await;
}

fn try_send(inner: &Inner, kind: u8, stream: u32, payload: Bytes) {
    let _ = inner.out.try_send(Frame {
        kind,
        stream,
        payload,
    });
}

fn kill(inner: &Inner) {
    inner.dead.store(true, Ordering::Relaxed);
    let slots: Vec<Slot> = inner
        .streams
        .lock()
        .unwrap()
        .drain()
        .map(|(_, s)| s)
        .collect();
    for s in slots {
        s.reset.send_replace(true);
        s.credit.1.notify_waiters();
    }
    inner.closed.notify_waiters();
    inner.ended.send_replace(true);
}

/// A new stream's slot and its two pumps; the application's end of it.
fn attach(inner: &Arc<Inner>, id: u32) -> Option<DuplexStream> {
    let (app, mine) = tokio::io::duplex(32 * 1024);
    let (to_app_tx, to_app_rx) = mpsc::unbounded_channel();
    let credit = Arc::new((AtomicI64::new(WINDOW), Notify::new()));
    let unacked = Arc::new(AtomicI64::new(0));
    let reset = Arc::new(watch::channel(false).0);
    {
        let mut streams = inner.streams.lock().unwrap();
        if streams.len() >= MAX_STREAMS || streams.contains_key(&id) {
            return None;
        }
        streams.insert(
            id,
            Slot {
                to_app: to_app_tx,
                credit: credit.clone(),
                unacked: unacked.clone(),
                reset: reset.clone(),
            },
        );
    }
    let (rd, wr) = tokio::io::split(mine);
    let done = Arc::new(AtomicU32::new(0));
    tokio::spawn(pump_out(
        inner.clone(),
        id,
        rd,
        credit,
        reset.clone(),
        done.clone(),
    ));
    tokio::spawn(pump_in(
        inner.clone(),
        id,
        wr,
        to_app_rx,
        unacked,
        reset,
        done,
    ));
    Some(app)
}

fn finished(inner: &Inner, id: u32, done: &AtomicU32) {
    if done.fetch_add(1, Ordering::AcqRel) == 1 {
        inner.streams.lock().unwrap().remove(&id);
    }
}

/// The application wrote: out as DATA, as far as the window allows.
async fn pump_out(
    inner: Arc<Inner>,
    id: u32,
    mut rd: tokio::io::ReadHalf<DuplexStream>,
    credit: Arc<(AtomicI64, Notify)>,
    reset: Arc<watch::Sender<bool>>,
    done: Arc<AtomicU32>,
) {
    let mut gone = reset.subscribe();
    let mut buf = vec![0u8; CHUNK];
    loop {
        // Room in the window first.
        loop {
            let n = credit.1.notified();
            if *gone.borrow() {
                finished(&inner, id, &done);
                return;
            }
            if credit.0.load(Ordering::Acquire) > 0 {
                break;
            }
            tokio::select! {
                _ = n => {}
                _ = gone.changed() => {}
            }
        }
        let room = credit.0.load(Ordering::Acquire).min(CHUNK as i64) as usize;
        let r = tokio::select! {
            r = rd.read(&mut buf[..room]) => r,
            _ = gone.wait_for(|v| *v) => { finished(&inner, id, &done); return; }
        };
        match r {
            Ok(0) => {
                send(&inner, FIN, id, Bytes::new()).await;
                break;
            }
            Ok(n) => {
                credit.0.fetch_sub(n as i64, Ordering::AcqRel);
                send(&inner, DATA, id, Bytes::copy_from_slice(&buf[..n])).await;
            }
            Err(_) => {
                send(&inner, RST, id, Bytes::new()).await;
                reset.send_replace(true);
                break;
            }
        }
    }
    finished(&inner, id, &done);
}

/// The peer sent: into the application's end, acknowledged as it is taken.
async fn pump_in(
    inner: Arc<Inner>,
    id: u32,
    mut wr: tokio::io::WriteHalf<DuplexStream>,
    mut rx: mpsc::UnboundedReceiver<ToApp>,
    unacked: Arc<AtomicI64>,
    reset: Arc<watch::Sender<bool>>,
    done: Arc<AtomicU32>,
) {
    let mut gone = reset.subscribe();
    loop {
        let m = tokio::select! {
            m = rx.recv() => m,
            _ = gone.wait_for(|v| *v) => None,
        };
        match m {
            Some(ToApp::Data(b)) => {
                let n = b.len();
                let w = tokio::select! {
                    w = wr.write_all(&b) => w,
                    _ = gone.wait_for(|v| *v) => Err(std::io::ErrorKind::ConnectionReset.into()),
                };
                if w.is_err() {
                    send(&inner, RST, id, Bytes::new()).await;
                    reset.send_replace(true);
                    break;
                }
                unacked.fetch_sub(n as i64, Ordering::AcqRel);
                send(
                    &inner,
                    ACK,
                    id,
                    Bytes::copy_from_slice(&(n as u32).to_le_bytes()),
                )
                .await;
            }
            Some(ToApp::Fin) => {
                let _ = wr.shutdown().await;
                break;
            }
            None => break,
        }
    }
    finished(&inner, id, &done);
}

async fn writer<W: AsyncWrite + Unpin>(w: W, mut rx: mpsc::Receiver<Frame>, inner: Arc<Inner>) {
    let mut w = tokio::io::BufWriter::with_capacity(256 * 1024, w);
    let mut head = BytesMut::with_capacity(9);
    let mut ended = inner.ended.subscribe();
    loop {
        let f = tokio::select! {
            f = rx.recv() => f,
            _ = ended.wait_for(|e| *e) => None,
        };
        let Some(f) = f else { break };
        head.clear();
        head.put_u32_le((5 + f.payload.len()) as u32);
        head.put_u8(f.kind);
        head.put_u32_le(f.stream);
        if w.write_all(&head).await.is_err() || w.write_all(&f.payload).await.is_err() {
            break;
        }
        if rx.is_empty() && w.flush().await.is_err() {
            break;
        }
    }
    kill(&inner);
}

async fn reader<R: AsyncRead + Unpin>(r: R, inner: Arc<Inner>) {
    let mut r = tokio::io::BufReader::with_capacity(256 * 1024, r);
    let mut buf = BytesMut::new();
    loop {
        let Ok(len) = r.read_u32_le().await else {
            break;
        };
        let len = len as usize;
        if !(5..=MAX_FRAME).contains(&len) {
            break;
        }
        buf.resize(len, 0);
        if r.read_exact(&mut buf[..]).await.is_err() {
            break;
        }
        let mut b = buf.split().freeze();
        let kind = b.get_u8();
        let stream = b.get_u32_le();
        if !frame(&inner, kind, stream, b) {
            break;
        }
    }
    kill(&inner);
}

/// One frame from the peer; false ends the channel (the peer broke the protocol).
fn frame(inner: &Arc<Inner>, kind: u8, id: u32, payload: Bytes) -> bool {
    match kind {
        CONTROL => {
            let _ = inner.control.send(payload);
            true
        }
        OPEN => {
            // The peer numbers its streams the other parity.
            let ours = inner.next.load(Ordering::Relaxed) % 2;
            if id == 0 || id % 2 == ours {
                return false;
            }
            match attach(inner, id) {
                Some(app) => {
                    if inner.accepted.try_send((payload, app)).is_err() {
                        try_send(inner, RST, id, Bytes::new());
                    }
                }
                None => try_send(inner, RST, id, Bytes::new()),
            }
            true
        }
        DATA => {
            let streams = inner.streams.lock().unwrap();
            let Some(s) = streams.get(&id) else {
                return true;
            };
            // More than the window unacknowledged: the peer ignores flow control.
            if s.unacked.fetch_add(payload.len() as i64, Ordering::AcqRel) + payload.len() as i64
                > WINDOW
            {
                s.reset.send_replace(true);
                drop(streams);
                try_send(inner, RST, id, Bytes::new());
                return true;
            }
            let _ = s.to_app.send(ToApp::Data(payload));
            true
        }
        ACK => {
            if payload.len() != 4 {
                return false;
            }
            let n = u32::from_le_bytes([payload[0], payload[1], payload[2], payload[3]]) as i64;
            if let Some(s) = inner.streams.lock().unwrap().get(&id) {
                let c = s.credit.0.fetch_add(n, Ordering::AcqRel) + n;
                if c > WINDOW {
                    // Acknowledged more than was sent.
                    s.credit.0.store(WINDOW, Ordering::Release);
                }
                s.credit.1.notify_waiters();
            }
            true
        }
        FIN => {
            if let Some(s) = inner.streams.lock().unwrap().get(&id) {
                let _ = s.to_app.send(ToApp::Fin);
            }
            true
        }
        RST => {
            if let Some(s) = inner.streams.lock().unwrap().remove(&id) {
                s.reset.send_replace(true);
                s.credit.1.notify_waiters();
            }
            true
        }
        _ => false,
    }
}

/// Parses frames from bytes the way the reader does, for the fuzzer: never a
/// panic, whatever the bytes.
pub fn parse_frames(mut data: &[u8]) -> Vec<(u8, u32, usize)> {
    let mut out = Vec::new();
    while data.len() >= 4 {
        let len = u32::from_le_bytes([data[0], data[1], data[2], data[3]]) as usize;
        if !(5..=MAX_FRAME).contains(&len) || data.len() < 4 + len {
            break;
        }
        let f = &data[4..4 + len];
        out.push((f[0], u32::from_le_bytes([f[1], f[2], f[3], f[4]]), len - 5));
        data = &data[4 + len..];
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pair() -> ((Mux, Incoming), (Mux, Incoming)) {
        let (a_r, b_w) = tokio::io::duplex(1 << 16);
        let (b_r, a_w) = tokio::io::duplex(1 << 16);
        (Mux::new(a_r, a_w, true), Mux::new(b_r, b_w, false))
    }

    #[tokio::test]
    async fn streams_both_ways_with_flow_control() {
        let ((a, _ai), (_b, mut bi)) = pair();
        let mut s = a.open(b"hello").await.unwrap();
        let (meta, mut t) = bi.streams.recv().await.unwrap();
        assert_eq!(&meta[..], b"hello");
        // More than a window each way, the other side reading slowly.
        let big: Vec<u8> = (0..(WINDOW as usize * 5 + 123))
            .map(|i| (i % 251) as u8)
            .collect();
        let big2 = big.clone();
        let w = tokio::spawn(async move {
            s.write_all(&big2).await.unwrap();
            s.shutdown().await.unwrap();
            let mut back = Vec::new();
            s.read_to_end(&mut back).await.unwrap();
            back
        });
        let mut got = Vec::new();
        let mut chunk = [0u8; 1000];
        loop {
            tokio::time::sleep(std::time::Duration::from_micros(50)).await;
            let n = t.read(&mut chunk).await.unwrap();
            if n == 0 {
                break;
            }
            got.extend_from_slice(&chunk[..n]);
        }
        assert_eq!(got, big);
        t.write_all(b"done").await.unwrap();
        t.shutdown().await.unwrap();
        assert_eq!(w.await.unwrap(), b"done");
    }

    #[tokio::test]
    async fn control_and_many_streams() {
        let ((a, _ai), (b, mut bi)) = pair();
        b.control(b"{\"x\":1}").await;
        let mut ai = _ai;
        assert_eq!(&ai.control.recv().await.unwrap()[..], b"{\"x\":1}");
        let mut tasks = Vec::new();
        for i in 0..200u32 {
            let a = a.clone();
            tasks.push(tokio::spawn(async move {
                let mut s = a.open(&i.to_le_bytes()).await.unwrap();
                s.write_all(&i.to_le_bytes()).await.unwrap();
                let mut r = [0u8; 4];
                s.read_exact(&mut r).await.unwrap();
                assert_eq!(u32::from_le_bytes(r), i * 2);
            }));
        }
        tokio::spawn(async move {
            while let Some((_, mut t)) = bi.streams.recv().await {
                tokio::spawn(async move {
                    let mut r = [0u8; 4];
                    t.read_exact(&mut r).await.unwrap();
                    t.write_all(&(u32::from_le_bytes(r) * 2).to_le_bytes())
                        .await
                        .unwrap();
                });
            }
        });
        for t in tasks {
            t.await.unwrap();
        }
    }

    #[tokio::test]
    async fn everything_ends_with_the_channel() {
        let (a_r, b_w) = tokio::io::duplex(1 << 16);
        let (b_r, a_w) = tokio::io::duplex(1 << 16);
        let (a, _ai) = Mux::new(a_r, a_w, true);
        let weak = std::sync::Arc::downgrade(&a.inner);
        let s = a.open(b"x").await.unwrap();
        // The other side goes away.
        drop((b_r, b_w));
        tokio::time::timeout(std::time::Duration::from_secs(2), a.closed()).await.unwrap();
        drop((s, a));
        // Its tasks end and let go of it.
        for _ in 0..100 {
            if weak.upgrade().is_none() {
                return;
            }
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;
        }
        panic!("the channel's tasks still hold it");
    }

    #[test]
    fn frames_parse_without_panic() {
        assert!(parse_frames(&[]).is_empty());
        assert!(parse_frames(&[255, 255, 255, 255, 1]).is_empty());
        let f = [6u8, 0, 0, 0, DATA, 3, 0, 0, 0, 42];
        assert_eq!(parse_frames(&f), vec![(DATA, 3, 1)]);
    }
}
