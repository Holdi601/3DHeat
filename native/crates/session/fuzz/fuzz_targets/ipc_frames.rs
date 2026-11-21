//! Any bytes as what the other process sends on the channel between the
//! core and the gateway (a compromised gateway, say): the channel ends or
//! carries on, but never panics, never hangs and never buffers more than
//! its windows allow.

#![no_main]

use heat3d_session::ipc::{parse_frames, Mux};
use libfuzzer_sys::fuzz_target;
use std::sync::OnceLock;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

fn rt() -> &'static tokio::runtime::Runtime {
    static RT: OnceLock<tokio::runtime::Runtime> = OnceLock::new();
    RT.get_or_init(|| {
        tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap()
    })
}

fuzz_target!(|data: &[u8]| {
    let _ = parse_frames(data);
    let data = data.to_vec();
    rt().block_on(async move {
        let (mut peer, ours) = tokio::io::duplex(1 << 16);
        let (r, w) = tokio::io::split(ours);
        let (mux, mut incoming) = Mux::new(r, w, true);
        let feed = tokio::spawn(async move {
            let _ = peer.write_all(&data).await;
            let mut sink = vec![0u8; 1 << 16];
            // Read what our side answers for a moment, then hang up.
            let _ = tokio::time::timeout(Duration::from_millis(20), async {
                while let Ok(n) = peer.read(&mut sink).await {
                    if n == 0 {
                        break;
                    }
                }
            })
            .await;
        });
        // Accept what the peer opens and read from it like a server would.
        let reader = tokio::spawn(async move {
            while let Some((_meta, mut s)) = incoming.streams.recv().await {
                tokio::spawn(async move {
                    let mut b = [0u8; 4096];
                    let _ = tokio::time::timeout(Duration::from_millis(10), s.read(&mut b)).await;
                    let _ = s
                        .write_all(b"HTTP/1.1 404 Not Found\r\ncontent-length: 0\r\n\r\n")
                        .await;
                });
            }
        });
        let _ = tokio::time::timeout(Duration::from_millis(50), feed).await;
        assert!(mux.open_streams() <= heat3d_session::ipc::MAX_STREAMS);
        reader.abort();
    });
});
