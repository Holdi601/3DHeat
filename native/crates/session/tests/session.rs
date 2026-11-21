//! The session's rules without a network: joining, roles against every
//! action, moderation, limits, the operation log's order and catching up.

use heat3d_session::auth::{self, Cost};
use heat3d_session::proto::{
    self, client_msg, server_msg, AdminAction, AdminKind, Batch, ClientMsg, CloseReason,
    FollowMode, FollowSet, Hello, InviteNew, LookHere, Op, OpKind, Pose, Presence, Role, ServerMsg,
    SettingsSet, Vec3,
};
use heat3d_session::session::{Config, ConnId, MemberId, Out, Session, Target};
use std::net::IpAddr;

const PW: &str = "correct horse battery";

fn session(waiting_room: bool) -> Session {
    let cfg = Config {
        waiting_room,
        cost: Cost::TEST,
        max_per_addr: 64,
        max_clients: 64,
        ..Config::default()
    };
    let mut s = Session::new(cfg, "h".repeat(64));
    s.set_password_hash(Some(auth::hash_password(PW, Cost::TEST)));
    s
}

fn ip(n: u8) -> IpAddr {
    format!("192.168.1.{n}").parse().unwrap()
}

fn hello(name: &str) -> Hello {
    Hello {
        proto: 1,
        name: name.into(),
        password: PW.into(),
        client_key: format!("key-{name}"),
        ..Default::default()
    }
}

fn bodies(outs: &[Out], conn: ConnId, s: &Session) -> Vec<server_msg::Body> {
    outs.iter()
        .filter_map(|o| match o {
            Out::Send(t, m) if s.resolve(t).contains(&conn) => m.body.clone(),
            _ => None,
        })
        .collect()
}

fn ack_code(outs: &[Out], conn: ConnId, s: &Session) -> Option<proto::Err> {
    bodies(outs, conn, s).into_iter().find_map(|b| match b {
        server_msg::Body::Ack(a) => proto::Err::try_from(a.code).ok(),
        _ => None,
    })
}

fn closed(outs: &[Out], conn: ConnId) -> Option<CloseReason> {
    outs.iter().find_map(|o| match o {
        Out::Close(c, r) if *c == conn => Some(*r),
        _ => None,
    })
}

struct World {
    s: Session,
    now: i64,
    next: ConnId,
}

impl World {
    fn new(waiting_room: bool) -> Self {
        Self {
            s: session(waiting_room),
            now: 1_000_000,
            next: 1,
        }
    }

    fn conn(&mut self, addr: u8) -> ConnId {
        let c = self.next;
        self.next += 1;
        self.s.connect(c, ip(addr), self.now).unwrap();
        c
    }

    fn host(&mut self) -> (ConnId, MemberId) {
        let c = self.conn(1);
        let h = Hello {
            proto: 1,
            name: "Host".into(),
            host_token: "h".repeat(64),
            client_key: "key-host".into(),
            ..Default::default()
        };
        let outs = self.s.hello_checked(c, &h, self.now);
        assert!(bodies(&outs, c, &self.s)
            .iter()
            .any(|b| matches!(b, server_msg::Body::Welcome(w) if w.role == Role::Host as i32)));
        (c, self.s.member_of(c).unwrap())
    }

    /// A member with `role`, admitted by the host from the waiting room (or straight in).
    fn member(&mut self, host: ConnId, name: &str, role: Role, addr: u8) -> (ConnId, MemberId) {
        let c = self.conn(addr);
        let outs = self.s.hello_checked(c, &hello(name), self.now);
        let waiting = bodies(&outs, c, &self.s).into_iter().find_map(|b| match b {
            server_msg::Body::Waiting(w) => Some(w.you),
            _ => None,
        });
        if let Some(w) = waiting {
            let outs = self.send(host, admin(AdminKind::Admit, w, role));
            assert_eq!(ack_code(&outs, host, &self.s), Some(proto::Err::Ok));
        } else if role != Role::Viewer {
            let m = self.s.member_of(c).unwrap();
            self.send(host, admin(AdminKind::SetRole, m, role));
        }
        (c, self.s.member_of(c).expect("joined"))
    }

    fn send(&mut self, conn: ConnId, body: client_msg::Body) -> Vec<Out> {
        self.now += 1;
        self.s.message(
            conn,
            ClientMsg {
                rid: 7,
                body: Some(body),
            },
            100,
            self.now,
        )
    }
}

fn admin(kind: AdminKind, target: MemberId, role: Role) -> client_msg::Body {
    client_msg::Body::Admin(AdminAction {
        kind: kind as i32,
        target,
        role: role as i32,
        ..Default::default()
    })
}

fn pose() -> Pose {
    Pose {
        position: Some(Vec3 {
            x: 1.0,
            y: 2.0,
            z: 3.0,
        }),
        forward: Some(Vec3 {
            x: 0.0,
            y: 0.0,
            z: -1.0,
        }),
        fov: 60.0,
        aspect: 1.5,
        ..Default::default()
    }
}

fn batch(doc: &str, id: &str, ops: Vec<Op>) -> client_msg::Body {
    client_msg::Body::Batch(Batch {
        doc: doc.into(),
        id: id.into(),
        ops,
        at: 1.0,
    })
}

fn add(coll: &str, id: &str, json: &str) -> Op {
    Op {
        kind: OpKind::Add as i32,
        coll: coll.into(),
        id: id.into(),
        json: json.into(),
        ..Default::default()
    }
}

fn set(coll: &str, id: &str, json: &str) -> Op {
    Op {
        kind: OpKind::Set as i32,
        coll: coll.into(),
        id: id.into(),
        json: json.into(),
        ..Default::default()
    }
}

fn del(coll: &str, id: &str) -> Op {
    Op {
        kind: OpKind::Del as i32,
        coll: coll.into(),
        id: id.into(),
        ..Default::default()
    }
}

fn seqs(outs: &[Out]) -> Vec<u64> {
    outs.iter()
        .filter_map(|o| match o {
            Out::Send(
                Target::Joined,
                ServerMsg {
                    body: Some(server_msg::Body::Op(s)),
                },
            ) => Some(s.seq),
            _ => None,
        })
        .collect()
}

#[test]
fn password_waiting_room_and_admit() {
    let mut w = World::new(true);
    let (host, _) = w.host();
    let c = w.conn(2);
    let mut bad = hello("Mallory");
    bad.password = "wrong password!".into();
    let outs = w.s.hello_checked(c, &bad, w.now);
    assert!(bodies(&outs, c, &w.s).iter().any(
        |b| matches!(b, server_msg::Body::Denied(d) if d.code == proto::Err::BadPassword as i32)
    ));
    assert!(closed(&outs, c).is_some());
    w.s.disconnect(c, w.now);
    // With the password: the waiting room, and the host sees the waiter.
    let c = w.conn(2);
    let outs = w.s.hello_checked(c, &hello("Alice"), w.now);
    assert!(bodies(&outs, c, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Waiting(_))));
    assert!(bodies(&outs, host, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::WaitingList(l) if l.waiting.len() == 1)));
    // A waiter can do nothing but ping.
    let outs = w.send(c, batch("marks", "b1", vec![add("pins", "p1", "{}")]));
    assert_eq!(ack_code(&outs, c, &w.s), Some(proto::Err::NotJoined));
    assert!(w.s.member_of(c).is_none());
}

#[test]
fn deny_closes_the_waiter() {
    let mut w = World::new(true);
    let (host, _) = w.host();
    let c = w.conn(2);
    let outs = w.s.hello_checked(c, &hello("Alice"), w.now);
    let id = bodies(&outs, c, &w.s)
        .into_iter()
        .find_map(|b| {
            if let server_msg::Body::Waiting(x) = b {
                Some(x.you)
            } else {
                None
            }
        })
        .unwrap();
    let outs = w.send(host, admin(AdminKind::Deny, id, Role::Unspecified));
    assert!(bodies(&outs, c, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Denied(d) if d.code == proto::Err::Denied as i32)));
    assert!(closed(&outs, c).is_some());
}

#[test]
fn lockout_after_five_failures() {
    let mut w = World::new(true);
    for _ in 0..5 {
        let c = w.conn(9);
        let mut h = hello("brute");
        h.password = "not the password".into();
        w.s.hello_checked(c, &h, w.now);
        w.s.disconnect(c, w.now);
    }
    // Even the right password is refused now, from that address.
    let c = w.conn(9);
    let outs = w.s.hello_checked(c, &hello("brute"), w.now);
    assert!(bodies(&outs, c, &w.s).iter().any(|b| matches!(b, server_msg::Body::Denied(d) if d.code == proto::Err::LockedOut as i32 && d.retry_ms > 0)));
    // Another address is not.
    let c = w.conn(10);
    let outs = w.s.hello_checked(c, &hello("fine"), w.now);
    assert!(bodies(&outs, c, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Waiting(_))));
}

#[test]
fn invite_skips_the_waiting_room_with_its_role() {
    let mut w = World::new(true);
    let (host, _) = w.host();
    let outs = w.send(
        host,
        client_msg::Body::Invite(InviteNew {
            role: Role::Elevated as i32,
            uses: 1,
            ttl_ms: 60_000,
            label: "Bob".into(),
        }),
    );
    let token = bodies(&outs, host, &w.s)
        .into_iter()
        .find_map(|b| {
            if let server_msg::Body::Invite(i) = b {
                Some(i.token)
            } else {
                None
            }
        })
        .unwrap();
    assert_eq!(token.len(), 64);
    let c = w.conn(3);
    let h = Hello {
        proto: 1,
        name: "Bob".into(),
        invite: token.clone(),
        ..Default::default()
    };
    let outs = w.s.hello_checked(c, &h, w.now);
    assert!(bodies(&outs, c, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Welcome(x) if x.role == Role::Elevated as i32)));
    // Used up.
    let c2 = w.conn(4);
    let outs = w.s.hello_checked(
        c2,
        &Hello {
            proto: 1,
            invite: token,
            ..Default::default()
        },
        w.now,
    );
    assert!(bodies(&outs, c2, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Denied(_))));
    // An expired one does not work.
    let outs = w.send(
        host,
        client_msg::Body::Invite(InviteNew {
            role: Role::Draw as i32,
            uses: 5,
            ttl_ms: 10,
            label: String::new(),
        }),
    );
    let token = bodies(&outs, host, &w.s)
        .into_iter()
        .find_map(|b| {
            if let server_msg::Body::Invite(i) = b {
                Some(i.token)
            } else {
                None
            }
        })
        .unwrap();
    w.now += 1000;
    let c3 = w.conn(5);
    let outs = w.s.hello_checked(
        c3,
        &Hello {
            proto: 1,
            invite: token,
            ..Default::default()
        },
        w.now,
    );
    assert!(bodies(&outs, c3, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Denied(_))));
}

#[test]
fn every_role_against_every_action() {
    let mut w = World::new(true);
    let (host, host_id) = w.host();
    let roles = [Role::Viewer, Role::Draw, Role::Elevated, Role::Admin];
    let mut by_role = Vec::new();
    for (i, r) in roles.iter().enumerate() {
        by_role.push((*r, w.member(host, &format!("m{i}"), *r, 20 + i as u8)));
    }
    let (_, victim) = w.member(host, "victim", Role::Viewer, 40);
    // The host makes a figure on the board and a pin.
    let outs = w.send(
        host,
        batch(
            "tactics",
            "h1",
            vec![
                add("figures", "fig", r#"{"kind":"rifle"}"#),
                add("drawings", "hostdraw", "{}"),
            ],
        ),
    );
    assert_eq!(ack_code(&outs, host, &w.s), Some(proto::Err::Ok));
    for (role, (c, _)) in by_role.clone() {
        let n = role as i32;
        let code = |outs: &[Out], s: &Session| ack_code(outs, c, s);
        // Own drawing on the board: draw and up.
        let outs = w.send(
            c,
            batch(
                "tactics",
                &format!("d{n}"),
                vec![add("drawings", &format!("dr{n}"), "{}")],
            ),
        );
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            role != Role::Viewer,
            "{role:?} draws"
        );
        // Erasing it again.
        let outs = w.send(
            c,
            batch(
                "tactics",
                &format!("e{n}"),
                vec![del("drawings", &format!("dr{n}"))],
            ),
        );
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            role != Role::Viewer,
            "{role:?} erases own"
        );
        // Someone else's drawing: elevated and up.
        let outs = w.send(
            c,
            batch(
                "tactics",
                &format!("x{n}"),
                vec![set("drawings", "hostdraw", r#"{"width":2}"#)],
            ),
        );
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            rank(role) >= rank(Role::Elevated),
            "{role:?} changes another's"
        );
        // Moving a figure, changing the plan's fields: elevated and up.
        let outs = w.send(
            c,
            batch(
                "tactics",
                &format!("f{n}"),
                vec![set("figures", "fig", r#"{"label":"x"}"#)],
            ),
        );
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            rank(role) >= rank(Role::Elevated),
            "{role:?} moves a figure"
        );
        let meta = Op {
            kind: OpKind::Meta as i32,
            json: r#"{"title":"T"}"#.into(),
            ..Default::default()
        };
        let outs = w.send(c, batch("tactics", &format!("m{n}"), vec![meta]));
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            rank(role) >= rank(Role::Elevated),
            "{role:?} sets the title"
        );
        // Follow for everyone, settings, a dataset.
        let outs = w.send(
            c,
            client_msg::Body::Follow(FollowSet {
                mode: FollowMode::Follow as i32,
                leader: host_id,
            }),
        );
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            role == Role::Admin,
            "{role:?} sets follow"
        );
        let outs = w.send(
            c,
            client_msg::Body::Settings(SettingsSet {
                waiting_room: Some(false),
                ..Default::default()
            }),
        );
        assert_eq!(
            code(&outs, &w.s),
            Some(proto::Err::Forbidden),
            "{role:?} settings"
        );
        let outs = w.send(
            c,
            client_msg::Body::Dataset(proto::Dataset {
                name: "d".into(),
                hash: "ab".into(),
                ..Default::default()
            }),
        );
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            rank(role) >= rank(Role::Elevated),
            "{role:?} sets the data"
        );
        // Moderation of a viewer: admin only.
        let outs = w.send(
            c,
            client_msg::Body::Admin(AdminAction {
                kind: AdminKind::Mute as i32,
                target: victim,
                duration_ms: 1000,
                ..Default::default()
            }),
        );
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            role == Role::Admin,
            "{role:?} mutes"
        );
        w.send(
            host,
            client_msg::Body::Admin(AdminAction {
                kind: AdminKind::Unmute as i32,
                target: victim,
                ..Default::default()
            }),
        );
        // Invites: admin only, and not above elevated.
        let outs = w.send(
            c,
            client_msg::Body::Invite(InviteNew {
                role: Role::Draw as i32,
                ..Default::default()
            }),
        );
        assert_eq!(
            code(&outs, &w.s) == Some(proto::Err::Ok),
            role == Role::Admin,
            "{role:?} invites"
        );
        // Look here: everyone.
        let outs = w.send(
            c,
            client_msg::Body::Look(LookHere {
                pose: Some(pose()),
                ..Default::default()
            }),
        );
        assert_eq!(
            code(&outs, &w.s),
            Some(proto::Err::Ok),
            "{role:?} look here"
        );
        // Nobody below the host acts on the host.
        let outs = w.send(c, admin(AdminKind::Kick, host_id, Role::Unspecified));
        assert_eq!(
            code(&outs, &w.s),
            Some(proto::Err::Forbidden),
            "{role:?} kicks the host"
        );
        // Nobody gives themselves a role.
        let me = w.s.member_of(c).unwrap();
        let outs = w.send(c, admin(AdminKind::SetRole, me, Role::Admin));
        assert_eq!(
            code(&outs, &w.s),
            Some(proto::Err::Forbidden),
            "{role:?} promotes self"
        );
    }
    // An admin cannot make an admin, nor act on another admin.
    let (admin_conn, admin_id) = by_role[3].1;
    let (_, other_admin) = w.member(host, "admin2", Role::Admin, 50);
    let (_, viewer) = by_role[0].1;
    let outs = w.send(admin_conn, admin(AdminKind::SetRole, viewer, Role::Admin));
    assert_eq!(
        ack_code(&outs, admin_conn, &w.s),
        Some(proto::Err::Forbidden)
    );
    let outs = w.send(
        admin_conn,
        admin(AdminKind::Kick, other_admin, Role::Unspecified),
    );
    assert_eq!(
        ack_code(&outs, admin_conn, &w.s),
        Some(proto::Err::Forbidden)
    );
    // The host can.
    let outs = w.send(host, admin(AdminKind::SetRole, admin_id, Role::Elevated));
    assert_eq!(ack_code(&outs, host, &w.s), Some(proto::Err::Ok));
}

fn rank(r: Role) -> u8 {
    heat3d_session::roles::rank(r)
}

#[test]
fn mute_stops_drawing_and_pings_until_it_ends() {
    let mut w = World::new(true);
    let (host, _) = w.host();
    let (c, m) = w.member(host, "a", Role::Draw, 2);
    w.send(
        host,
        client_msg::Body::Admin(AdminAction {
            kind: AdminKind::Mute as i32,
            target: m,
            duration_ms: 5_000,
            ..Default::default()
        }),
    );
    let outs = w.send(c, batch("marks", "b1", vec![add("pins", "p", "{}")]));
    assert_eq!(ack_code(&outs, c, &w.s), Some(proto::Err::Muted));
    let outs = w.send(
        c,
        client_msg::Body::Look(LookHere {
            pose: Some(pose()),
            ..Default::default()
        }),
    );
    assert_eq!(ack_code(&outs, c, &w.s), Some(proto::Err::Muted));
    // Presence still goes.
    w.send(
        c,
        client_msg::Body::Presence(Presence {
            pose: Some(pose()),
            ..Default::default()
        }),
    );
    w.now += 6_000;
    let (_, outs) = w.s.tick(w.now);
    assert!(!outs.is_empty(), "the roster says the mute ended");
    let outs = w.send(c, batch("marks", "b2", vec![add("pins", "p", "{}")]));
    assert_eq!(ack_code(&outs, c, &w.s), Some(proto::Err::Ok));
}

#[test]
fn kick_and_ban_with_expiry_and_unban() {
    let mut w = World::new(true);
    let (host, _) = w.host();
    let (c, m) = w.member(host, "Eve", Role::Viewer, 2);
    let outs = w.send(host, admin(AdminKind::Kick, m, Role::Unspecified));
    assert_eq!(closed(&outs, c), Some(CloseReason::Kicked));
    w.s.disconnect(c, w.now);
    // Kicked: back through the waiting room.
    let (c, m) = w.member(host, "Eve", Role::Viewer, 2);
    let outs = w.send(
        host,
        client_msg::Body::Admin(AdminAction {
            kind: AdminKind::Ban as i32,
            target: m,
            duration_ms: 60_000,
            ..Default::default()
        }),
    );
    assert_eq!(closed(&outs, c), Some(CloseReason::BannedNow));
    let ban_id = bodies(&outs, host, &w.s)
        .into_iter()
        .find_map(|b| {
            if let server_msg::Body::Bans(l) = b {
                l.bans.first().map(|b| b.id)
            } else {
                None
            }
        })
        .unwrap();
    w.s.disconnect(c, w.now);
    // By key, by address, by name.
    for (addr, name, key) in [
        (3u8, "Someone", "key-Eve"),
        (2, "Other", "k2"),
        (4, "eve", "k3"),
    ] {
        let c = w.conn(addr);
        let outs = w.s.hello_checked(
            c,
            &Hello {
                proto: 1,
                name: name.into(),
                password: PW.into(),
                client_key: key.into(),
                ..Default::default()
            },
            w.now,
        );
        assert!(
            bodies(&outs, c, &w.s).iter().any(
                |b| matches!(b, server_msg::Body::Denied(d) if d.code == proto::Err::Banned as i32)
            ),
            "{name}"
        );
        w.s.disconnect(c, w.now);
    }
    // Unbanned, Eve may knock again.
    let outs = w.send(
        host,
        client_msg::Body::Admin(AdminAction {
            kind: AdminKind::Unban as i32,
            ref_id: ban_id,
            ..Default::default()
        }),
    );
    assert_eq!(ack_code(&outs, host, &w.s), Some(proto::Err::Ok));
    let c = w.conn(2);
    let outs = w.s.hello_checked(c, &hello("Eve"), w.now);
    assert!(bodies(&outs, c, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Waiting(_))));
    w.s.disconnect(c, w.now);
    // A ban for a minute runs out.
    let (c, m) = w.member(host, "Mal", Role::Viewer, 6);
    w.send(
        host,
        client_msg::Body::Admin(AdminAction {
            kind: AdminKind::Ban as i32,
            target: m,
            duration_ms: 60_000,
            ..Default::default()
        }),
    );
    w.s.disconnect(c, w.now);
    w.now += 61_000;
    w.s.tick(w.now);
    let c = w.conn(6);
    let outs = w.s.hello_checked(c, &hello("Mal"), w.now);
    assert!(bodies(&outs, c, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Waiting(_))));
}

#[test]
fn look_here_three_a_minute() {
    let mut w = World::new(true);
    let (host, host_id) = w.host();
    let (a, _) = w.member(host, "a", Role::Viewer, 2);
    for _ in 0..3 {
        let outs = w.send(
            a,
            client_msg::Body::Look(LookHere {
                pose: Some(pose()),
                to: vec![host_id],
                note: "here".into(),
                ..Default::default()
            }),
        );
        assert_eq!(ack_code(&outs, a, &w.s), Some(proto::Err::Ok));
        assert!(bodies(&outs, host, &w.s).iter().any(
            |b| matches!(b, server_msg::Body::Look(e) if e.look.as_ref().unwrap().note == "here")
        ));
    }
    let outs = w.send(
        a,
        client_msg::Body::Look(LookHere {
            pose: Some(pose()),
            ..Default::default()
        }),
    );
    assert_eq!(ack_code(&outs, a, &w.s), Some(proto::Err::RateLimited));
    w.now += 20_500;
    let outs = w.send(
        a,
        client_msg::Body::Look(LookHere {
            pose: Some(pose()),
            ..Default::default()
        }),
    );
    assert_eq!(ack_code(&outs, a, &w.s), Some(proto::Err::Ok));
    // A pose that is not one is refused.
    w.now += 60_000;
    let mut p = pose();
    p.fov = f32::NAN;
    let outs = w.send(
        a,
        client_msg::Body::Look(LookHere {
            pose: Some(p),
            ..Default::default()
        }),
    );
    assert_eq!(ack_code(&outs, a, &w.s), Some(proto::Err::Invalid));
}

#[test]
fn ops_are_ordered_deduplicated_and_caught_up() {
    let mut w = World::new(false);
    let (host, _) = w.host();
    let (a, _) = w.member(host, "a", Role::Elevated, 2);
    let (b, _) = w.member(host, "b", Role::Elevated, 3);
    let o1 = w.send(
        a,
        batch("marks", "a1", vec![add("pins", "p", r#"{"x":1}"#)]),
    );
    let o2 = w.send(
        b,
        batch("marks", "b1", vec![set("pins", "p", r#"{"x":2}"#)]),
    );
    let o3 = w.send(
        a,
        batch("marks", "a2", vec![set("pins", "p", r#"{"x":3}"#)]),
    );
    assert_eq!([seqs(&o1), seqs(&o2), seqs(&o3)].concat(), vec![1, 2, 3]);
    // The same batch again (a resend after a drop) is applied once.
    let again = w.send(
        a,
        batch("marks", "a2", vec![set("pins", "p", r#"{"x":3}"#)]),
    );
    assert!(seqs(&again).is_empty());
    assert_eq!(ack_code(&again, a, &w.s), Some(proto::Err::Ok));
    // A late joiner gets the state: x is 3.
    let (c, _) = {
        let c = w.conn(4);
        let outs = w.s.hello_checked(c, &hello("late"), w.now);
        let snap = bodies(&outs, c, &w.s)
            .into_iter()
            .find_map(|b| {
                if let server_msg::Body::Snapshot(s) = b {
                    Some(s)
                } else {
                    None
                }
            })
            .unwrap();
        assert_eq!(snap.seq, 3);
        let doc: serde_json::Value = serde_json::from_str(&snap.docs[0].json).unwrap();
        assert_eq!(doc["colls"]["pins"][0]["x"], 3);
        (c, ())
    };
    // b drops and comes back with its token: only what it missed.
    let resume = {
        let c2 = w.conn(5);
        let outs = w.s.hello_checked(c2, &hello("r"), w.now);
        bodies(&outs, c2, &w.s)
            .into_iter()
            .find_map(|b| {
                if let server_msg::Body::Welcome(x) = b {
                    Some(x.resume)
                } else {
                    None
                }
            })
            .unwrap()
    };
    let rc = w.s.member_of(w.next - 1).unwrap();
    w.s.disconnect(w.next - 1, w.now);
    w.send(a, batch("marks", "a3", vec![add("pins", "q", "{}")]));
    let c3 = w.conn(5);
    let outs = w.s.hello_checked(
        c3,
        &Hello {
            proto: 1,
            resume,
            since_seq: 3,
            ..Default::default()
        },
        w.now,
    );
    assert_eq!(w.s.member_of(c3), Some(rc), "the same member");
    let got = bodies(&outs, c3, &w.s);
    assert!(got
        .iter()
        .any(|b| matches!(b, server_msg::Body::Welcome(x) if x.catch_up)));
    let tail: Vec<u64> = got
        .iter()
        .filter_map(|b| {
            if let server_msg::Body::Op(s) = b {
                Some(s.seq)
            } else {
                None
            }
        })
        .collect();
    assert_eq!(tail, vec![4]);
    assert!(!got
        .iter()
        .any(|b| matches!(b, server_msg::Body::Snapshot(_))));
    let _ = c;
}

#[test]
fn a_batch_keeps_what_the_role_may_and_drops_the_rest() {
    let mut w = World::new(false);
    let (host, _) = w.host();
    w.send(
        host,
        batch("marks", "h1", vec![add("pins", "theirs", "{}")]),
    );
    let (d, _) = w.member(host, "d", Role::Draw, 2);
    // Its own new note and someone else's erased, in one batch: the note goes in, the erase does not.
    let outs = w.send(
        d,
        batch(
            "marks",
            "d1",
            vec![add("pins", "mine", "{}"), del("pins", "theirs")],
        ),
    );
    assert_eq!(ack_code(&outs, d, &w.s), Some(proto::Err::Forbidden));
    let sent = outs.iter().find_map(|o| match o {
        Out::Send(
            Target::Joined,
            ServerMsg {
                body: Some(server_msg::Body::Op(s)),
            },
        ) => s.batch.clone(),
        _ => None,
    });
    let sent = sent.expect("the allowed part is sequenced");
    assert_eq!(sent.ops.len(), 1);
    assert_eq!(sent.ops[0].id, "mine");
    let doc: serde_json::Value = serde_json::from_str(&w.s.docs_json()).unwrap();
    let ids: Vec<_> = doc["docs"]["marks"]["colls"]["pins"]
        .as_array()
        .unwrap()
        .iter()
        .map(|p| p["id"].as_str().unwrap().to_string())
        .collect();
    assert_eq!(ids, ["theirs", "mine"]);
}

#[test]
fn bad_messages_are_refused() {
    let mut w = World::new(false);
    let (host, _) = w.host();
    let (a, _) = w.member(host, "a", Role::Elevated, 2);
    for b in [
        batch("bad doc", "x1", vec![add("c", "1", "{}")]),
        batch("d", "", vec![add("c", "1", "{}")]),
        batch("d", "x2", vec![]),
        batch("d", "x3", vec![add("c", "1", "[1]")]),
        batch("d", "x4", vec![add("c", "1", r#"{"__proto__":{}}"#)]),
        batch("d", "x5", vec![add("c", "1", r#"{"x":1e300}"#)]),
        batch(
            "d",
            "x6",
            vec![Op {
                kind: 42,
                ..Default::default()
            }],
        ),
        batch(
            "d",
            "x7",
            (0..600).map(|i| add("c", &format!("{i}"), "{}")).collect(),
        ),
    ] {
        let outs = w.send(a, b);
        let code = ack_code(&outs, a, &w.s).unwrap();
        assert_ne!(code, proto::Err::Ok);
        assert!(seqs(&outs).is_empty());
    }
    // A presence with an infinite coordinate is not kept.
    let mut p = pose();
    p.position = Some(Vec3 {
        x: f32::INFINITY,
        y: 0.0,
        z: 0.0,
    });
    let outs = w.send(
        a,
        client_msg::Body::Presence(Presence {
            pose: Some(p),
            ..Default::default()
        }),
    );
    assert_eq!(ack_code(&outs, a, &w.s), Some(proto::Err::Invalid));
    // A second hello on a joined connection.
    let outs = w.send(a, client_msg::Body::Hello(hello("again")));
    assert_eq!(ack_code(&outs, a, &w.s), Some(proto::Err::Protocol));
    // A message without a body.
    let outs = w.s.message(a, ClientMsg { rid: 1, body: None }, 2, w.now);
    assert_eq!(ack_code(&outs, a, &w.s), Some(proto::Err::BadMessage));
}

#[test]
fn message_flood_is_limited_then_cut_off() {
    let mut w = World::new(false);
    let (host, _) = w.host();
    let (a, _) = w.member(host, "a", Role::Viewer, 2);
    let mut limited = 0;
    let mut cut = false;
    for _ in 0..400 {
        let outs = w.s.message(
            a,
            ClientMsg {
                rid: 1,
                body: Some(client_msg::Body::Ping(proto::Ping { t: 1.0 })),
            },
            10,
            w.now,
        );
        if ack_code(&outs, a, &w.s) == Some(proto::Err::RateLimited) {
            limited += 1;
        }
        if closed(&outs, a) == Some(CloseReason::Abuse) {
            cut = true;
            break;
        }
    }
    assert!(limited > 0 && cut);
}

#[test]
fn presence_frames_ten_a_second_and_gone() {
    let mut w = World::new(false);
    let (host, _) = w.host();
    let (a, am) = w.member(host, "a", Role::Viewer, 2);
    w.send(
        a,
        client_msg::Body::Presence(Presence {
            pose: Some(pose()),
            tab: "heat".into(),
            ..Default::default()
        }),
    );
    let (frame, _) = w.s.tick(w.now);
    let Some(ServerMsg {
        body: Some(server_msg::Body::Presence(f)),
    }) = frame
    else {
        panic!("a frame")
    };
    assert_eq!(f.items.len(), 1);
    assert_eq!(f.items[0].member, am);
    // Nothing moved: no frame.
    assert!(w.s.tick(w.now).0.is_none());
    w.s.disconnect(a, w.now);
    let (frame, _) = w.s.tick(w.now);
    let Some(ServerMsg {
        body: Some(server_msg::Body::Presence(f)),
    }) = frame
    else {
        panic!("a frame")
    };
    assert_eq!(f.gone, vec![am]);
}

#[test]
fn follow_and_enforce_reach_everyone() {
    let mut w = World::new(false);
    let (host, host_id) = w.host();
    let (a, _) = w.member(host, "a", Role::Viewer, 2);
    let outs = w.send(
        host,
        client_msg::Body::Follow(FollowSet {
            mode: FollowMode::Enforce as i32,
            leader: 0,
        }),
    );
    assert!(bodies(&outs, a, &w.s).iter().any(|b| matches!(b, server_msg::Body::Follow(f) if f.mode == FollowMode::Enforce as i32 && f.leader == host_id)));
    // A late joiner learns it too.
    let c = w.conn(3);
    let outs = w.s.hello_checked(c, &hello("late"), w.now);
    assert!(bodies(&outs, c, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Follow(f) if f.mode == FollowMode::Enforce as i32)));
}

#[test]
fn the_host_replaces_the_state_and_everyone_gets_it() {
    let mut w = World::new(false);
    let (host, _) = w.host();
    let (a, _) = w.member(host, "a", Role::Elevated, 2);
    w.send(a, batch("marks", "a1", vec![add("pins", "p", "{}")]));
    let saved = w.s.docs_json();
    w.send(a, batch("marks", "a2", vec![del("pins", "p")]));
    let outs = w.s.load_docs(&saved).unwrap();
    assert!(bodies(&outs, a, &w.s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Snapshot(s) if s.docs[0].json.contains("\"p\""))));
    assert!(w.s.load_docs(r#"{"docs":{"bad name":{}}}"#).is_err());
}

#[test]
fn connections_per_address_and_session_are_bounded() {
    let cfg = Config {
        max_per_addr: 2,
        max_clients: 3,
        cost: Cost::TEST,
        ..Config::default()
    };
    let mut s = Session::new(cfg, "h".repeat(64));
    assert!(s.connect(1, ip(1), 0).is_ok());
    assert!(s.connect(2, ip(1), 0).is_ok());
    assert_eq!(s.connect(3, ip(1), 0), Err(proto::Err::Full));
    assert!(s.connect(4, ip(2), 0).is_ok());
    assert_eq!(s.connect(5, ip(3), 0), Err(proto::Err::Full));
}

#[test]
fn no_password_means_the_waiting_room_even_when_off() {
    let cfg = Config {
        waiting_room: false,
        cost: Cost::TEST,
        ..Config::default()
    };
    let mut s = Session::new(cfg, "h".repeat(64));
    s.connect(1, ip(2), 0).unwrap();
    let outs = s.hello_checked(
        1,
        &Hello {
            proto: 1,
            name: "x".into(),
            ..Default::default()
        },
        0,
    );
    assert!(bodies(&outs, 1, &s)
        .iter()
        .any(|b| matches!(b, server_msg::Body::Waiting(_))));
}

#[test]
fn settings_password_is_hashed_off_the_lock() {
    let mut w = World::new(false);
    let (host, _) = w.host();
    let outs = w.send(
        host,
        client_msg::Body::Settings(SettingsSet {
            password: "short".into(),
            ..Default::default()
        }),
    );
    assert_eq!(ack_code(&outs, host, &w.s), Some(proto::Err::Invalid));
    let outs = w.send(
        host,
        client_msg::Body::Settings(SettingsSet {
            password: "a much longer password".into(),
            ..Default::default()
        }),
    );
    assert!(outs
        .iter()
        .any(|o| matches!(o, Out::HashPassword(p) if p == "a much longer password")));
}
