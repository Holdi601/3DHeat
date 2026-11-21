//! Any bytes as a client message, into a session with a host and members of
//! every role: no panic, no hang, whatever arrives.

#![no_main]

use heat3d_session::auth::Cost;
use heat3d_session::proto::{AdminAction, AdminKind, ClientMsg, Hello, Role};
use heat3d_session::session::{Config, Session};
use libfuzzer_sys::fuzz_target;
use prost::Message;

fuzz_target!(|data: &[u8]| {
    let cfg = Config {
        cost: Cost::TEST,
        waiting_room: false,
        max_per_addr: 16,
        ..Config::default()
    };
    let mut s = Session::new(cfg, "h".repeat(64));
    let ip = "192.168.0.2".parse().unwrap();
    s.connect(1, ip, 0).unwrap();
    s.hello(
        1,
        &Hello {
            proto: 1,
            name: "host".into(),
            host_token: "h".repeat(64),
            ..Default::default()
        },
        None,
        0,
    );
    // A member of each role, joined straight in (no password set, so the waiting room; admitted).
    for (i, role) in [Role::Viewer, Role::Draw, Role::Elevated, Role::Admin]
        .into_iter()
        .enumerate()
    {
        let c = 2 + i as u64;
        s.connect(c, ip, 0).unwrap();
        s.hello(
            c,
            &Hello {
                proto: 1,
                name: format!("m{i}"),
                client_key: format!("k{i}"),
                ..Default::default()
            },
            None,
            0,
        );
        let waiter = 2 + i as u32;
        let admit = ClientMsg {
            rid: 1,
            body: Some(heat3d_session::proto::client_msg::Body::Admin(
                AdminAction {
                    kind: AdminKind::Admit as i32,
                    target: waiter,
                    role: role as i32,
                    ..Default::default()
                },
            )),
        };
        s.message(1, admit, 10, 0);
    }
    // The bytes, split into messages by a length byte, each to a connection the first byte picks.
    let mut rest = data;
    let mut now = 1;
    while rest.len() >= 2 {
        let conn = 1 + (rest[0] % 6) as u64;
        let len = (rest[1] as usize).min(rest.len() - 2);
        let body = &rest[2..2 + len];
        rest = &rest[2 + len..];
        now += 7;
        match ClientMsg::decode(body) {
            Ok(m) => {
                if let Some(heat3d_session::proto::client_msg::Body::Hello(h)) = &m.body {
                    let h = h.clone();
                    s.hello_checked(conn, &h, now);
                } else {
                    s.message(conn, m, body.len(), now);
                }
            }
            Err(_) => {}
        }
        if now % 5 == 0 {
            s.tick(now);
        }
    }
    let _ = s.docs_json();
});
