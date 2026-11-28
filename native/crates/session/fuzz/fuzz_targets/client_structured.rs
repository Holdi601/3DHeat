//! Every kind of client message, with arbitrary field values (structure-aware:
//! the fuzzer builds messages, not bytes), from members of every role, in any
//! order, with the clock moving: no panic, no hang, and what the session
//! keeps stays within its limits.

#![no_main]

use arbitrary::Arbitrary;
use heat3d_session::auth::Cost;
use heat3d_session::proto::{
    self, client_msg, AdminAction, Batch, ClientMsg, Dataset, FollowSet, Hello, InviteNew,
    LookHere, Op, Ping, Pose, Presence, SettingsSet, Vec3, ViewSync,
};
use heat3d_session::session::{Config, Session};
use libfuzzer_sys::fuzz_target;
use prost::Message;

#[derive(Arbitrary, Debug)]
enum Json {
    Null,
    Bool(bool),
    Num(f64),
    Str(String),
    Arr(Vec<Json>),
    Obj(Vec<(String, Json)>),
    Raw(String),
}

fn json(j: &Json, depth: usize, out: &mut String) {
    if depth > 16 || out.len() > 70_000 {
        out.push_str("null");
        return;
    }
    match j {
        Json::Null => out.push_str("null"),
        Json::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
        Json::Num(n) => out.push_str(&format!("{n}")),
        Json::Str(s) => out.push_str(&serde_json_string(s)),
        Json::Raw(s) => out.push_str(s),
        Json::Arr(xs) => {
            out.push('[');
            for (i, x) in xs.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                json(x, depth + 1, out);
            }
            out.push(']');
        }
        Json::Obj(kv) => {
            out.push('{');
            for (i, (k, v)) in kv.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                out.push_str(&serde_json_string(k));
                out.push(':');
                json(v, depth + 1, out);
            }
            out.push('}');
        }
    }
}

fn serde_json_string(s: &str) -> String {
    let mut o = String::from("\"");
    for c in s.chars() {
        match c {
            '"' => o.push_str("\\\""),
            '\\' => o.push_str("\\\\"),
            c if (c as u32) < 0x20 => o.push_str(&format!("\\u{:04x}", c as u32)),
            c => o.push(c),
        }
    }
    o.push('"');
    o
}

#[derive(Arbitrary, Debug)]
struct V3 {
    x: f32,
    y: f32,
    z: f32,
}

impl V3 {
    fn p(&self) -> Option<Vec3> {
        Some(Vec3 {
            x: self.x,
            y: self.y,
            z: self.z,
        })
    }
}

#[derive(Arbitrary, Debug)]
struct ArbPose {
    position: V3,
    forward: V3,
    fov: f32,
    aspect: f32,
    ortho: bool,
    ortho_height: f32,
}

impl ArbPose {
    fn p(&self) -> Option<Pose> {
        Some(Pose {
            position: self.position.p(),
            forward: self.forward.p(),
            fov: self.fov,
            aspect: self.aspect,
            ortho: self.ortho,
            ortho_height: self.ortho_height,
        })
    }
}

#[derive(Arbitrary, Debug)]
struct ArbOp {
    kind: i32,
    coll: String,
    id: String,
    json: Json,
    unset: Vec<String>,
    index: Option<u32>,
}

#[derive(Arbitrary, Debug)]
enum Body {
    Hello {
        name: String,
        password: String,
        invite: String,
        resume: String,
        host_token: bool,
        client_key: String,
        since: u64,
        key_pub: Vec<u8>,
        key_sig: Vec<u8>,
    },
    Presence {
        pose: ArbPose,
        cursor: V3,
        has_cursor: bool,
        tab: String,
        mode: String,
        lacks: String,
    },
    Batch {
        doc: String,
        id: String,
        ops: Vec<ArbOp>,
        at: f64,
    },
    Look {
        to: Vec<u32>,
        pose: ArbPose,
        point: V3,
        has_point: bool,
        note: String,
        follow: bool,
    },
    Follow {
        mode: i32,
        leader: u32,
    },
    Admin {
        kind: i32,
        target: u32,
        duration_ms: i64,
        role: i32,
        ref_id: u64,
    },
    Ping {
        t: f64,
    },
    Invite {
        role: i32,
        uses: u32,
        ttl_ms: i64,
        label: String,
    },
    Settings {
        waiting_room: Option<bool>,
        password: String,
        clear_password: bool,
        session_name: String,
    },
    Dataset {
        name: String,
        hash: String,
        size: u64,
        level_name: String,
        level_hash: String,
        published: bool,
    },
    View {
        to: Vec<u32>,
        kind: i32,
        json: Json,
    },
    Empty,
}

#[derive(Arbitrary, Debug)]
struct Step {
    conn: u8,
    rid: u32,
    body: Body,
    advance_ms: u16,
    disconnect: bool,
    reconnect_addr: u8,
}

fn build(b: &Body) -> Option<client_msg::Body> {
    Some(match b {
        Body::Hello {
            name,
            password,
            invite,
            resume,
            host_token,
            client_key,
            since,
            key_pub,
            key_sig,
        } => client_msg::Body::Hello(Hello {
            proto: 1,
            name: name.clone(),
            password: password.clone(),
            invite: invite.clone(),
            resume: resume.clone(),
            host_token: if *host_token {
                "h".repeat(64)
            } else {
                String::new()
            },
            client_key: client_key.clone(),
            since_seq: *since,
            key_pub: key_pub.clone(),
            key_sig: key_sig.clone(),
        }),
        Body::Presence {
            pose,
            cursor,
            has_cursor,
            tab,
            mode,
            lacks,
        } => client_msg::Body::Presence(Presence {
            pose: pose.p(),
            cursor: cursor.p(),
            has_cursor: *has_cursor,
            tab: tab.clone(),
            mode: mode.clone(),
            lacks: lacks.clone(),
        }),
        Body::Batch { doc, id, ops, at } => client_msg::Body::Batch(Batch {
            doc: doc.clone(),
            id: id.clone(),
            ops: ops
                .iter()
                .map(|o| {
                    let mut j = String::new();
                    json(&o.json, 0, &mut j);
                    Op {
                        kind: o.kind,
                        coll: o.coll.clone(),
                        id: o.id.clone(),
                        json: j,
                        unset: o.unset.clone(),
                        index: o.index,
                    }
                })
                .collect(),
            at: *at,
        }),
        Body::Look {
            to,
            pose,
            point,
            has_point,
            note,
            follow,
        } => client_msg::Body::Look(LookHere {
            to: to.clone(),
            pose: pose.p(),
            point: point.p(),
            has_point: *has_point,
            note: note.clone(),
            follow: *follow,
        }),
        Body::Follow { mode, leader } => client_msg::Body::Follow(FollowSet {
            mode: *mode,
            leader: *leader,
        }),
        Body::Admin {
            kind,
            target,
            duration_ms,
            role,
            ref_id,
        } => client_msg::Body::Admin(AdminAction {
            kind: *kind,
            target: *target,
            duration_ms: *duration_ms,
            role: *role,
            ref_id: *ref_id,
        }),
        Body::Ping { t } => client_msg::Body::Ping(Ping { t: *t }),
        Body::Invite {
            role,
            uses,
            ttl_ms,
            label,
        } => client_msg::Body::Invite(InviteNew {
            role: *role,
            uses: *uses,
            ttl_ms: *ttl_ms,
            label: label.clone(),
        }),
        Body::Settings {
            waiting_room,
            password,
            clear_password,
            session_name,
        } => client_msg::Body::Settings(SettingsSet {
            waiting_room: *waiting_room,
            password: password.clone(),
            clear_password: *clear_password,
            session_name: session_name.clone(),
        }),
        Body::Dataset {
            name,
            hash,
            size,
            level_name,
            level_hash,
            published,
        } => client_msg::Body::Dataset(Dataset {
            name: name.clone(),
            hash: hash.clone(),
            size: *size,
            level_name: level_name.clone(),
            level_hash: level_hash.clone(),
            published: *published,
        }),
        Body::View { to, kind, json: j } => {
            let mut text = String::new();
            json(j, 0, &mut text);
            client_msg::Body::View(ViewSync {
                to: to.clone(),
                kind: *kind,
                json: text,
            })
        }
        Body::Empty => return None,
    })
}

fuzz_target!(|steps: Vec<Step>| {
    let cfg = Config {
        cost: Cost::TEST,
        waiting_room: false,
        max_per_addr: 16,
        max_state_bytes: 1 << 20,
        ..Config::default()
    };
    let mut s = Session::new(cfg, "h".repeat(64));
    let ip = |n: u8| format!("192.168.7.{n}").parse().unwrap();
    // The host, and members of every role admitted from the waiting room.
    s.connect(1, ip(1), 0).unwrap();
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
    for (i, role) in [
        proto::Role::Viewer,
        proto::Role::Draw,
        proto::Role::Elevated,
        proto::Role::Admin,
    ]
    .into_iter()
    .enumerate()
    {
        let c = 2 + i as u64;
        s.connect(c, ip(2 + i as u8), 0).unwrap();
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
        let admit = ClientMsg {
            rid: 1,
            body: Some(client_msg::Body::Admin(AdminAction {
                kind: proto::AdminKind::Admit as i32,
                target: 2 + i as u32,
                role: role as i32,
                ..Default::default()
            })),
        };
        s.message(1, admit, 10, 0);
    }
    let mut now = 1i64;
    let mut next_conn = 10u64;
    for st in steps.iter().take(400) {
        now += st.advance_ms as i64;
        let conn = 1 + (st.conn % 8) as u64;
        if st.disconnect {
            s.disconnect(conn, now);
            if s.connect(next_conn, ip(st.reconnect_addr), now).is_ok() {
                next_conn += 1;
            }
            continue;
        }
        let Some(body) = build(&st.body) else {
            s.tick(now);
            continue;
        };
        let m = ClientMsg {
            rid: st.rid,
            body: Some(body),
        };
        let len = m.encoded_len();
        if let Some(client_msg::Body::Hello(h)) = &m.body {
            let h = h.clone();
            s.hello_checked(conn, &h, now);
        } else {
            s.message(conn, m, len, now);
        }
        if now % 7 == 0 {
            s.tick(now);
        }
    }
    // What is kept is what can be saved and loaded back.
    let saved = s.docs_json();
    let mut again = Session::new(Config::default(), "h".repeat(64));
    again
        .load_docs(&saved)
        .expect("the session's own documents load back");
});
