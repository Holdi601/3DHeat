//! Simulated members for load tests: each joins by an invite link, moves its
//! camera in a circle (presence ten times a second) and sets a mark every
//! two seconds, and reads everything the server sends.
//!
//!   cargo run --release --example loadgen -- ws://127.0.0.1:7979/ws <members> <invite token> <seconds>

use futures_util::{SinkExt, StreamExt};
use heat3d_session::proto::{
    client_msg, server_msg, Batch, ClientMsg, Hello, Op, OpKind, Pose, Presence, ServerMsg, Vec3,
};
use prost::Message as _;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio_tungstenite::tungstenite::Message;

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let url = args
        .first()
        .cloned()
        .unwrap_or_else(|| "ws://127.0.0.1:7979/ws".into());
    let n: usize = args.get(1).and_then(|s| s.parse().ok()).unwrap_or(9);
    let invite = args.get(2).cloned().unwrap_or_default();
    let secs: u64 = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(30);
    let received = Arc::new(AtomicU64::new(0));
    let bytes = Arc::new(AtomicU64::new(0));
    let joined = Arc::new(AtomicU64::new(0));
    let mut tasks = Vec::new();
    for i in 0..n {
        let (url, invite, received, bytes, joined) = (
            url.clone(),
            invite.clone(),
            received.clone(),
            bytes.clone(),
            joined.clone(),
        );
        tasks.push(tokio::spawn(async move {
            // Refused (a burst of upgrades from one address is cut at its budget): again a little later, as a
            // browser's viewer does.
            let mut tries = 0;
            let ws = loop {
                match tokio_tungstenite::connect_async(url.as_str()).await {
                    Ok((ws, _)) => break ws,
                    Err(_) if tries < 120 => {
                        tries += 1;
                        tokio::time::sleep(Duration::from_millis(500 + 37 * (i as u64 % 13))).await;
                    }
                    Err(_) => {
                        eprintln!("member {i}: no connection");
                        return;
                    }
                }
            };
            let (mut tx, mut rx) = ws.split();
            let hello = ClientMsg {
                rid: 0,
                body: Some(client_msg::Body::Hello(Hello { proto: 1, name: format!("load {i}"), invite, client_key: format!("loadgen{i:04}"), ..Default::default() })),
            };
            let _ = tx.send(Message::Binary(hello.encode_to_vec().into())).await;
            let reader = tokio::spawn(async move {
                while let Some(Ok(m)) = rx.next().await {
                    if let Message::Binary(b) = m {
                        received.fetch_add(1, Ordering::Relaxed);
                        bytes.fetch_add(b.len() as u64, Ordering::Relaxed);
                        if let Ok(ServerMsg { body: Some(server_msg::Body::Welcome(_)) }) = ServerMsg::decode(b.as_ref()) {
                            joined.fetch_add(1, Ordering::Relaxed);
                        }
                    }
                }
            });
            let start = Instant::now();
            let mut iv = tokio::time::interval(Duration::from_millis(100));
            let mut k = 0u64;
            while start.elapsed() < Duration::from_secs(secs) {
                iv.tick().await;
                k += 1;
                let a = k as f32 * 0.05 + i as f32;
                let pose = Pose {
                    position: Some(Vec3 { x: 300.0 * a.cos(), y: 120.0, z: 300.0 * a.sin() }),
                    forward: Some(Vec3 { x: -a.cos(), y: -0.3, z: -a.sin() }),
                    fov: 60.0,
                    aspect: 1.7,
                    ..Default::default()
                };
                let p = ClientMsg { rid: 0, body: Some(client_msg::Body::Presence(Presence { pose: Some(pose), tab: "heat".into(), mode: "heat-simple".into(), ..Default::default() })) };
                if tx.send(Message::Binary(p.encode_to_vec().into())).await.is_err() {
                    break;
                }
                if k % 20 == 0 {
                    let id = format!("lg{i}-{k}");
                    let json = format!(r#"{{"at":{{"x":{},"y":0,"z":{}}},"text":"load","color":[1,0.5,0],"author":"load","key":"loadgen{i:04}","created":0}}"#, a.cos() * 50.0, a.sin() * 50.0);
                    let b = ClientMsg {
                        rid: k as u32,
                        body: Some(client_msg::Body::Batch(Batch {
                            doc: "marks".into(),
                            id: format!("{id}-b"),
                            ops: vec![Op { kind: OpKind::Add as i32, coll: "pins".into(), id, json, ..Default::default() }],
                            at: 0.0,
                        })),
                    };
                    let _ = tx.send(Message::Binary(b.encode_to_vec().into())).await;
                }
            }
            let _ = tx.close().await;
            reader.abort();
        }));
    }
    for t in tasks {
        let _ = t.await;
    }
    println!(
        "{} of {n} members joined; {} messages, {} KiB received in {secs} s",
        joined.load(Ordering::Relaxed),
        received.load(Ordering::Relaxed),
        bytes.load(Ordering::Relaxed) / 1024
    );
}
