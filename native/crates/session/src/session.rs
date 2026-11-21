//! A session as pure logic: connections come and go, send messages, and the
//! session answers with what to send to whom and whom to cut off. No
//! sockets, no clock of its own (every call takes `now_ms`), so every rule is
//! tested without a network (see the tests below and `tests/`).
//!
//! The host is the authority. Every message is checked: the sender's state
//! (joined or not), role, mute, budget, and the message's shape and values.
//! The shared layers are documents changed by batches of operations, which
//! the session numbers (`seq`) and sends to everyone, the sender too: the
//! sender's copy is the confirmation, and every member applies the batches
//! in the same order, so all end with the same state.

use std::collections::{BTreeMap, HashMap, VecDeque};
use std::net::IpAddr;

use crate::auth::{self, Cost, Lockout};
use crate::doc::{self, Doc, OpError};
use crate::limits::Budgets;
use crate::proto::{
    self, client_msg, server_msg, Ack, AdminAction, AdminKind, Ban, BanList, Batch, ClientMsg,
    CloseReason, Dataset, Denied, DocState, FollowMode, FollowSet, FollowState, Hello, InviteList,
    InviteMade, InviteNew, LookEvent, LookHere, Member as MemberMsg, Notice, NoticeKind, Pong,
    Pose, Presence, PresenceFrame, PresenceOf, Role, Roster, Sequenced, ServerMsg, SessionInfo,
    SettingsSet, Snapshot, Waiter as WaiterMsg, Waiting, WaitingList, Welcome,
};
use crate::roles::{self, at_least};
use crate::text;

pub type ConnId = u64;
pub type MemberId = u32;

/// The protocol version this server speaks.
pub const PROTO: u32 = 1;
/// Messages refused for the message budget before the client is cut off.
const STRIKES_MAX: u32 = 50;
/// Batches kept for members coming back after a short drop.
const LOG_KEEP: usize = 10_000;
/// Batch ids remembered, so a batch sent again is applied once.
const SEEN_KEEP: usize = 20_000;

#[derive(Clone, Debug)]
pub struct Config {
    pub name: String,
    pub max_clients: usize,
    pub max_per_addr: usize,
    pub waiting_room: bool,
    pub tls: bool,
    pub exposed: bool,
    pub cost: Cost,
    /// How long a member who dropped keeps their place, milliseconds.
    pub grace_ms: i64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            name: "3DHeat session".into(),
            max_clients: 32,
            max_per_addr: 3,
            waiting_room: true,
            tls: false,
            exposed: false,
            cost: Cost::STRONG,
            grace_ms: 120_000,
        }
    }
}

/// Who a message goes to.
#[derive(Clone, Debug, PartialEq)]
pub enum Target {
    Conn(ConnId),
    /// Every joined member's connection.
    Joined,
    /// Admins and the host.
    Admins,
    Members(Vec<MemberId>),
}

#[derive(Clone, Debug, PartialEq)]
pub enum Out {
    Send(Target, ServerMsg),
    Close(ConnId, CloseReason),
    /// The host set a new password: hash it off the session's lock and hand the hash to `set_password_hash`.
    HashPassword(String),
}

#[derive(Clone, Debug)]
enum ConnState {
    New,
    Waiting(MemberId),
    Joined(MemberId),
}

#[derive(Clone, Debug)]
struct Conn {
    addr: String,
    loopback: bool,
    state: ConnState,
    budgets: Budgets,
}

#[derive(Clone, Debug)]
struct Member {
    id: MemberId,
    name: String,
    role: Role,
    client_key: String,
    resume: String,
    conn: Option<ConnId>,
    /// Some(0): for good; Some(t): until t.
    muted_until: Option<i64>,
    left_at: i64,
    presence: Option<Presence>,
    dirty: bool,
}

#[derive(Clone, Debug)]
struct WaiterState {
    name: String,
    client_key: String,
    since: i64,
}

#[derive(Clone, Debug)]
struct BanEntry {
    id: u64,
    name: String,
    client_key: String,
    addr: Option<String>,
    /// 0: for good.
    until: i64,
}

#[derive(Clone, Debug)]
struct Invite {
    id: u64,
    token: String,
    role: Role,
    uses: u32,
    expires: i64,
    label: String,
}

pub struct Session {
    pub cfg: Config,
    password: Option<String>,
    host_token: String,
    conns: HashMap<ConnId, Conn>,
    members: BTreeMap<MemberId, Member>,
    waiters: BTreeMap<MemberId, WaiterState>,
    next_member: MemberId,
    bans: Vec<BanEntry>,
    next_ban: u64,
    invites: Vec<Invite>,
    next_invite: u64,
    lockout: Lockout,
    docs: BTreeMap<String, Doc>,
    room: usize,
    seq: u64,
    log: VecDeque<Sequenced>,
    seen: HashMap<String, u64>,
    seen_order: VecDeque<String>,
    follow: FollowState,
    dataset: Option<Dataset>,
    next_look: u64,
    gone: Vec<MemberId>,
}

fn msg(body: server_msg::Body) -> ServerMsg {
    ServerMsg { body: Some(body) }
}

fn ack(conn: ConnId, rid: u32, code: proto::Err, retry_ms: u32) -> Out {
    Out::Send(
        Target::Conn(conn),
        msg(server_msg::Body::Ack(Ack {
            rid,
            code: code as i32,
            retry_ms,
        })),
    )
}

fn denied(conn: ConnId, code: proto::Err, retry_ms: u32) -> Vec<Out> {
    vec![
        Out::Send(
            Target::Conn(conn),
            msg(server_msg::Body::Denied(Denied {
                code: code as i32,
                retry_ms,
            })),
        ),
        Out::Close(conn, CloseReason::CloseUnspecified),
    ]
}

/// Whether a pose is one a camera can have.
fn pose_ok(p: &Pose) -> bool {
    let v = |v: &Option<proto::Vec3>| {
        v.as_ref()
            .is_some_and(|v| text::coord(v.x) && text::coord(v.y) && text::coord(v.z))
    };
    v(&p.position)
        && v(&p.forward)
        && p.fov.is_finite()
        && p.fov > 0.0
        && p.fov < 180.0
        && p.aspect.is_finite()
        && p.aspect > 0.0
        && p.aspect <= 20.0
        && p.ortho_height.is_finite()
        && p.ortho_height >= 0.0
        && (p.ortho_height as f64) <= text::WORLD_LIMIT
}

fn short_id(s: &str) -> bool {
    s.is_empty() || text::ident(s, 24)
}

fn hexish(s: &str, max: usize) -> bool {
    s.len() <= max && s.bytes().all(|b| b.is_ascii_hexdigit())
}

impl Session {
    pub fn new(cfg: Config, host_token: String) -> Self {
        Self {
            cfg,
            password: None,
            host_token,
            conns: HashMap::new(),
            members: BTreeMap::new(),
            waiters: BTreeMap::new(),
            next_member: 1,
            bans: Vec::new(),
            next_ban: 1,
            invites: Vec::new(),
            next_invite: 1,
            lockout: Lockout::default(),
            docs: BTreeMap::new(),
            room: doc::MAX_ENTITIES,
            seq: 0,
            log: VecDeque::new(),
            seen: HashMap::new(),
            seen_order: VecDeque::new(),
            follow: FollowState::default(),
            dataset: None,
            next_look: 1,
            gone: Vec::new(),
        }
    }

    pub fn host_token(&self) -> &str {
        &self.host_token
    }

    pub fn is_host_token(&self, t: &str) -> bool {
        auth::same_token(t, &self.host_token)
    }

    pub fn set_password_hash(&mut self, phc: Option<String>) -> Vec<Out> {
        self.password = phc;
        vec![self.info_to(Target::Joined)]
    }

    /// The password's hash, when a hello needs it checked (none, an invite,
    /// a resume or the host's token do not).
    pub fn password_to_check(&self, h: &Hello) -> Option<String> {
        if !h.host_token.is_empty() || !h.resume.is_empty() || !h.invite.is_empty() {
            return None;
        }
        self.password.clone()
    }

    /// Milliseconds the address of `conn` is locked out for, or 0.
    pub fn locked(&self, conn: ConnId, now_ms: i64) -> i64 {
        self.conns
            .get(&conn)
            .map(|c| self.lockout.locked(&c.addr, now_ms))
            .unwrap_or(0)
    }

    /// Whether logins are flooded: the server then waits a moment before each check.
    pub fn flooded(&mut self, now_ms: i64) -> bool {
        self.lockout.flooded(now_ms)
    }

    pub fn joined_count(&self) -> usize {
        self.members.values().filter(|m| m.conn.is_some()).count()
    }

    /// The connection of a joined member, for tests and the server.
    pub fn conn_of(&self, m: MemberId) -> Option<ConnId> {
        self.members.get(&m).and_then(|m| m.conn)
    }

    pub fn member_of(&self, conn: ConnId) -> Option<MemberId> {
        match self.conns.get(&conn)?.state {
            ConnState::Joined(m) => Some(m),
            _ => None,
        }
    }

    pub fn role_of_conn(&self, conn: ConnId) -> Option<Role> {
        self.member_of(conn)
            .and_then(|m| self.members.get(&m))
            .map(|m| m.role)
    }

    /// Whether a token may fetch published assets: a joined member's, or the host's.
    pub fn asset_token_ok(&self, t: &str) -> bool {
        !t.is_empty()
            && (self.is_host_token(t)
                || self
                    .members
                    .values()
                    .any(|m| m.conn.is_some() && auth::same_token(&m.resume, t)))
    }

    // ------------------------------------------------------------ connecting

    /// A new connection from `ip`: refused when the session or the address is full.
    pub fn connect(&mut self, conn: ConnId, ip: IpAddr, now_ms: i64) -> Result<(), proto::Err> {
        if self.conns.len() >= self.cfg.max_clients {
            return Err(proto::Err::Full);
        }
        let addr = auth::addr_key(ip);
        let loopback = match ip {
            IpAddr::V4(v) => v.is_loopback(),
            IpAddr::V6(v) => v.is_loopback() || v.to_ipv4_mapped().is_some_and(|x| x.is_loopback()),
        };
        if self.conns.values().filter(|c| c.addr == addr).count() >= self.cfg.max_per_addr {
            return Err(proto::Err::Full);
        }
        self.conns.insert(
            conn,
            Conn {
                addr,
                loopback,
                state: ConnState::New,
                budgets: Budgets::new(now_ms),
            },
        );
        Ok(())
    }

    fn banned(&self, name: &str, key: &str, addr: &str, loopback: bool, now_ms: i64) -> bool {
        let lname = name.to_lowercase();
        self.bans.iter().any(|b| {
            (b.until == 0 || b.until > now_ms)
                && ((!key.is_empty() && b.client_key == key)
                    || (!loopback && b.addr.as_deref() == Some(addr))
                    || (!lname.is_empty() && b.name.to_lowercase() == lname))
        })
    }

    /// The first message of a connection. `password_ok` is the result of
    /// checking `password_to_check` (None when none was asked).
    pub fn hello(
        &mut self,
        conn: ConnId,
        h: &Hello,
        password_ok: Option<bool>,
        now_ms: i64,
    ) -> Vec<Out> {
        let Some(c) = self.conns.get(&conn) else {
            return vec![];
        };
        if !matches!(c.state, ConnState::New) || h.proto != PROTO {
            return denied(conn, proto::Err::Protocol, 0);
        }
        let (addr, loopback) = (c.addr.clone(), c.loopback);
        let locked = self.lockout.locked(&addr, now_ms);
        if locked > 0 {
            return denied(
                conn,
                proto::Err::LockedOut,
                locked.min(u32::MAX as i64) as u32,
            );
        }
        if h.client_key.len() > 64 || !(h.client_key.is_empty() || text::ident(&h.client_key, 64)) {
            return denied(conn, proto::Err::BadMessage, 0);
        }
        let fallback = format!("Guest {}", self.next_member);
        let name = text::name(&h.name, &fallback);

        // The host, by the token only it has.
        if !h.host_token.is_empty() {
            if !self.is_host_token(&h.host_token) {
                self.lockout.fail(&addr, now_ms);
                return denied(conn, proto::Err::BadPassword, 0);
            }
            let existing = self
                .members
                .values()
                .find(|m| m.role == Role::Host)
                .map(|m| m.id);
            let id = match existing {
                Some(id) => id,
                None => self.add_member(name.clone(), Role::Host, h.client_key.clone()),
            };
            if let Some(m) = self.members.get_mut(&id) {
                m.name = name;
            }
            return self.attach(conn, id, h.since_seq, true, now_ms);
        }
        // Coming back.
        if !h.resume.is_empty() {
            let found = self
                .members
                .values()
                .find(|m| m.role != Role::Host && auth::same_token(&m.resume, &h.resume))
                .map(|m| (m.id, m.name.clone(), m.client_key.clone()));
            return match found {
                Some((id, n, k)) if !self.banned(&n, &k, &addr, loopback, now_ms) => {
                    self.attach(conn, id, h.since_seq, true, now_ms)
                }
                Some(_) => denied(conn, proto::Err::Banned, 0),
                // Gone (kicked, or away too long): a fresh hello.
                None => denied(conn, proto::Err::NotFound, 0),
            };
        }
        if self.banned(&name, &h.client_key, &addr, loopback, now_ms) {
            return denied(conn, proto::Err::Banned, 0);
        }
        // An invite: its role, past the waiting room.
        if !h.invite.is_empty() {
            let Some(i) = self.invites.iter().position(|i| {
                i.expires > now_ms && i.uses > 0 && auth::same_token(&i.token, &h.invite)
            }) else {
                self.lockout.fail(&addr, now_ms);
                return denied(conn, proto::Err::BadPassword, 0);
            };
            self.invites[i].uses -= 1;
            let role = self.invites[i].role;
            if self.invites[i].uses == 0 {
                self.invites.remove(i);
            }
            self.lockout.succeed(&addr);
            let id = self.add_member(name, role, h.client_key.clone());
            let mut out = self.attach(conn, id, 0, false, now_ms);
            out.push(self.invites_msg());
            return out;
        }
        // The password, when one is set.
        if self.password.is_some() {
            if password_ok != Some(true) {
                let locked_now = self.lockout.fail(&addr, now_ms);
                let code = if locked_now {
                    proto::Err::LockedOut
                } else {
                    proto::Err::BadPassword
                };
                let retry = if locked_now {
                    self.lockout.locked(&addr, now_ms) as u32
                } else {
                    0
                };
                let mut out = denied(conn, code, retry);
                if self.lockout.flooded(now_ms) {
                    out.push(Out::Send(
                        Target::Admins,
                        msg(server_msg::Body::Notice(Notice {
                            kind: NoticeKind::LoginFlood as i32,
                        })),
                    ));
                }
                return out;
            }
            self.lockout.succeed(&addr);
        }
        // Without a password nobody joins unasked: the waiting room always.
        if self.cfg.waiting_room || self.password.is_none() {
            let id = self.next_member;
            self.next_member += 1;
            self.waiters.insert(
                id,
                WaiterState {
                    name,
                    client_key: h.client_key.clone(),
                    since: now_ms,
                },
            );
            if let Some(c) = self.conns.get_mut(&conn) {
                c.state = ConnState::Waiting(id);
            }
            return vec![
                Out::Send(
                    Target::Conn(conn),
                    msg(server_msg::Body::Waiting(Waiting { you: id })),
                ),
                self.waiting_msg(),
            ];
        }
        let id = self.add_member(name, Role::Viewer, h.client_key.clone());
        self.attach(conn, id, 0, false, now_ms)
    }

    /// Checks the password itself (tests, and the fuzzer): `hello` with the verification inline.
    pub fn hello_checked(&mut self, conn: ConnId, h: &Hello, now_ms: i64) -> Vec<Out> {
        let ok = self
            .password_to_check(h)
            .map(|phc| auth::verify_password(&h.password, &phc));
        self.hello(conn, h, ok, now_ms)
    }

    fn add_member(&mut self, name: String, role: Role, client_key: String) -> MemberId {
        let id = self.next_member;
        self.next_member += 1;
        let client_key = if client_key.is_empty() {
            auth::token()[..32].to_string()
        } else {
            client_key
        };
        self.members.insert(
            id,
            Member {
                id,
                name,
                role,
                client_key,
                resume: auth::token(),
                conn: None,
                muted_until: None,
                left_at: 0,
                presence: None,
                dirty: false,
            },
        );
        id
    }

    /// Ties a connection to a member and catches it up: the operations
    /// missed when it was here a moment ago, else the whole state.
    fn attach(
        &mut self,
        conn: ConnId,
        id: MemberId,
        since: u64,
        resuming: bool,
        now_ms: i64,
    ) -> Vec<Out> {
        let mut out = Vec::new();
        let old = self.members.get(&id).and_then(|m| m.conn);
        if let Some(old) = old.filter(|&o| o != conn) {
            out.push(Out::Close(old, CloseReason::Replaced));
            if let Some(c) = self.conns.get_mut(&old) {
                c.state = ConnState::New;
            }
        }
        if let Some(c) = self.conns.get_mut(&conn) {
            c.state = ConnState::Joined(id);
        }
        let Some(m) = self.members.get_mut(&id) else {
            return out;
        };
        m.conn = Some(conn);
        m.left_at = 0;
        let (role, resume) = (m.role, m.resume.clone());
        let base = self.log.front().map(|s| s.seq - 1).unwrap_or(self.seq);
        let tail = resuming && since > 0 && since <= self.seq && since >= base;
        let to = Target::Conn(conn);
        out.push(Out::Send(
            to.clone(),
            msg(server_msg::Body::Welcome(Welcome {
                you: id,
                role: role as i32,
                resume,
                seq: self.seq,
                catch_up: tail,
            })),
        ));
        if tail {
            for s in self.log.iter().filter(|s| s.seq > since) {
                out.push(Out::Send(to.clone(), msg(server_msg::Body::Op(s.clone()))));
            }
        } else {
            out.push(Out::Send(to.clone(), self.snapshot_msg()));
        }
        out.push(self.info_to(to.clone()));
        out.push(Out::Send(
            to.clone(),
            msg(server_msg::Body::Follow(self.follow)),
        ));
        // Everyone's presence once; changes follow in the frames.
        let items: Vec<PresenceOf> = self
            .members
            .values()
            .filter(|m| m.conn.is_some() && m.id != id)
            .filter_map(|m| {
                m.presence.clone().map(|p| PresenceOf {
                    member: m.id,
                    presence: Some(p),
                })
            })
            .collect();
        if !items.is_empty() {
            out.push(Out::Send(
                to.clone(),
                msg(server_msg::Body::Presence(PresenceFrame {
                    items,
                    gone: vec![],
                })),
            ));
        }
        if at_least(role, Role::Admin) {
            out.push(Out::Send(to.clone(), self.waiting_body()));
            out.push(Out::Send(to.clone(), self.bans_body(now_ms)));
            out.push(Out::Send(to, self.invites_body(now_ms)));
        }
        out.push(self.roster_msg());
        out
    }

    /// A connection closed.
    pub fn disconnect(&mut self, conn: ConnId, now_ms: i64) -> Vec<Out> {
        let Some(c) = self.conns.remove(&conn) else {
            return vec![];
        };
        match c.state {
            ConnState::Joined(id) => {
                if let Some(m) = self.members.get_mut(&id) {
                    if m.conn == Some(conn) {
                        m.conn = None;
                        m.left_at = now_ms;
                        m.presence = None;
                        self.gone.push(id);
                    }
                }
                vec![self.roster_msg()]
            }
            ConnState::Waiting(id) => {
                self.waiters.remove(&id);
                vec![self.waiting_msg()]
            }
            ConnState::New => vec![],
        }
    }

    // ------------------------------------------------------------ messages

    /// A message from a connection, `len` bytes on the wire.
    pub fn message(&mut self, conn: ConnId, m: ClientMsg, len: usize, now_ms: i64) -> Vec<Out> {
        let rid = m.rid;
        let Some(c) = self.conns.get_mut(&conn) else {
            return vec![];
        };
        let over = c
            .budgets
            .messages
            .take(1.0, now_ms)
            .err()
            .or_else(|| c.budgets.bytes.take(len as f64, now_ms).err());
        if let Some(wait) = over {
            c.budgets.strikes += 1;
            if c.budgets.strikes > STRIKES_MAX {
                return vec![Out::Close(conn, CloseReason::Abuse)];
            }
            return vec![ack(conn, rid, proto::Err::RateLimited, wait)];
        }
        c.budgets.strikes = 0;
        let state = c.state.clone();
        let Some(body) = m.body else {
            return vec![ack(conn, rid, proto::Err::BadMessage, 0)];
        };
        if let client_msg::Body::Ping(p) = &body {
            return vec![Out::Send(
                Target::Conn(conn),
                msg(server_msg::Body::Pong(Pong {
                    t: if p.t.is_finite() { p.t } else { 0.0 },
                })),
            )];
        }
        let ConnState::Joined(me) = state else {
            let code = if matches!(body, client_msg::Body::Hello(_)) {
                proto::Err::Protocol
            } else {
                proto::Err::NotJoined
            };
            return vec![ack(conn, rid, code, 0)];
        };
        match body {
            client_msg::Body::Hello(_) => vec![ack(conn, rid, proto::Err::Protocol, 0)],
            client_msg::Body::Ping(_) => unreachable!(),
            client_msg::Body::Presence(p) => self.presence(conn, me, p, now_ms),
            client_msg::Body::Batch(b) => self.batch(conn, rid, me, b, now_ms),
            client_msg::Body::Look(l) => self.look(conn, rid, me, l, now_ms),
            client_msg::Body::Follow(f) => self.follow_set(conn, rid, me, f),
            client_msg::Body::Admin(a) => self.admin(conn, rid, me, a, now_ms),
            client_msg::Body::Invite(i) => self.invite(conn, rid, me, i, now_ms),
            client_msg::Body::Settings(s) => self.settings(conn, rid, me, s),
            client_msg::Body::Dataset(d) => self.dataset_set(conn, rid, me, d),
        }
    }

    fn muted(&self, me: MemberId, now_ms: i64) -> bool {
        self.members
            .get(&me)
            .and_then(|m| m.muted_until)
            .is_some_and(|t| t == 0 || t > now_ms)
    }

    fn role(&self, me: MemberId) -> Role {
        self.members
            .get(&me)
            .map(|m| m.role)
            .unwrap_or(Role::Unspecified)
    }

    fn presence(&mut self, conn: ConnId, me: MemberId, p: Presence, now_ms: i64) -> Vec<Out> {
        let Some(c) = self.conns.get_mut(&conn) else {
            return vec![];
        };
        // Over its budget, presence is dropped without a word: the next one says the same.
        if c.budgets.presence.take(1.0, now_ms).is_err() {
            return vec![];
        }
        let cursor_ok = !p.has_cursor
            || p.cursor
                .as_ref()
                .is_some_and(|v| text::coord(v.x) && text::coord(v.y) && text::coord(v.z));
        if !p.pose.as_ref().is_some_and(pose_ok)
            || !cursor_ok
            || !short_id(&p.tab)
            || !short_id(&p.mode)
        {
            return vec![ack(conn, 0, proto::Err::Invalid, 0)];
        }
        if let Some(m) = self.members.get_mut(&me) {
            m.presence = Some(p);
            m.dirty = true;
        }
        vec![]
    }

    fn batch(&mut self, conn: ConnId, rid: u32, me: MemberId, b: Batch, now_ms: i64) -> Vec<Out> {
        if self.muted(me, now_ms) {
            return vec![ack(conn, rid, proto::Err::Muted, 0)];
        }
        if let Some(c) = self.conns.get_mut(&conn) {
            if let Err(wait) = c.budgets.batches.take(1.0, now_ms) {
                return vec![ack(conn, rid, proto::Err::RateLimited, wait)];
            }
        }
        if !text::ident(&b.doc, 32)
            || !text::ident(&b.id, 96)
            || b.ops.is_empty()
            || b.ops.len() > doc::MAX_OPS
            || !b.at.is_finite()
        {
            return vec![ack(conn, rid, proto::Err::BadMessage, 0)];
        }
        // Sent again after a reconnect: it is in already.
        if self.seen.contains_key(&b.id) {
            return vec![ack(conn, rid, proto::Err::Ok, 0)];
        }
        let mut checked = Vec::with_capacity(b.ops.len());
        for o in &b.ops {
            match doc::check_op(o) {
                Ok(c) => checked.push(c),
                Err(_) => return vec![ack(conn, rid, proto::Err::Invalid, 0)],
            }
        }
        let (role, key, author_name) = match self.members.get(&me) {
            Some(m) => (m.role, m.client_key.clone(), m.name.clone()),
            None => return vec![],
        };
        if !self.docs.contains_key(&b.doc)
            && (self.docs.len() >= doc::MAX_DOCS || !at_least(role, Role::Draw))
        {
            return vec![ack(
                conn,
                rid,
                if at_least(role, Role::Draw) {
                    proto::Err::TooLarge
                } else {
                    proto::Err::Forbidden
                },
                0,
            )];
        }
        // What the role may do goes in; what it may not is left out (and said). A
        // batch is a tenth of a second of one member's edits, so one forbidden
        // change must not take the allowed ones with it.
        let existing = self.docs.get(&b.doc);
        let allowed: Vec<bool> = checked
            .iter()
            .map(|o| roles::may_op(role, &key, &b.doc, existing, o))
            .collect();
        let dropped = allowed.iter().filter(|a| !**a).count();
        if dropped == allowed.len() {
            return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
        }
        let mut b = b;
        if dropped > 0 {
            let mut keep = allowed.iter();
            b.ops.retain(|_| *keep.next().unwrap_or(&false));
            let mut keep = allowed.iter();
            checked.retain(|_| *keep.next().unwrap_or(&false));
        }
        let d = self.docs.entry(b.doc.clone()).or_default();
        let owner = if role == Role::Host {
            None
        } else {
            Some(key.as_str())
        };
        if let Err(e) = d.apply(&checked, owner, &mut self.room) {
            return vec![ack(
                conn,
                rid,
                if e == OpError::Full {
                    proto::Err::TooLarge
                } else {
                    proto::Err::Invalid
                },
                0,
            )];
        }
        self.seq += 1;
        let s = Sequenced {
            seq: self.seq,
            author: me,
            author_name,
            batch: Some(b),
        };
        let id = s.batch.as_ref().map(|b| b.id.clone()).unwrap_or_default();
        self.seen.insert(id.clone(), self.seq);
        self.seen_order.push_back(id);
        while self.seen_order.len() > SEEN_KEEP {
            if let Some(old) = self.seen_order.pop_front() {
                self.seen.remove(&old);
            }
        }
        self.log.push_back(s.clone());
        while self.log.len() > LOG_KEEP {
            self.log.pop_front();
        }
        let mut out = vec![Out::Send(Target::Joined, msg(server_msg::Body::Op(s)))];
        if dropped > 0 {
            out.push(ack(conn, rid, proto::Err::Forbidden, 0));
        } else if rid != 0 {
            out.push(ack(conn, rid, proto::Err::Ok, 0));
        }
        out
    }

    fn look(&mut self, conn: ConnId, rid: u32, me: MemberId, l: LookHere, now_ms: i64) -> Vec<Out> {
        if self.muted(me, now_ms) {
            return vec![ack(conn, rid, proto::Err::Muted, 0)];
        }
        let point_ok = !l.has_point
            || l.point
                .as_ref()
                .is_some_and(|v| text::coord(v.x) && text::coord(v.y) && text::coord(v.z));
        if !l.pose.as_ref().is_some_and(pose_ok)
            || !point_ok
            || l.to.len() > 64
            || l.note.chars().count() > text::NOTE_CHARS * 2
        {
            return vec![ack(conn, rid, proto::Err::Invalid, 0)];
        }
        if self.role(me) != Role::Host {
            if let Some(c) = self.conns.get_mut(&conn) {
                if let Err(wait) = c.budgets.look.take(1.0, now_ms) {
                    return vec![ack(conn, rid, proto::Err::RateLimited, wait)];
                }
            }
        }
        let to: Vec<MemberId> = if l.to.is_empty() {
            self.members
                .values()
                .filter(|m| m.conn.is_some() && m.id != me)
                .map(|m| m.id)
                .collect()
        } else {
            l.to.iter()
                .copied()
                .filter(|t| *t != me && self.members.get(t).is_some_and(|m| m.conn.is_some()))
                .collect()
        };
        let id = self.next_look;
        self.next_look += 1;
        let from_name = self
            .members
            .get(&me)
            .map(|m| m.name.clone())
            .unwrap_or_default();
        let look = LookHere {
            note: text::clean(&l.note, text::NOTE_CHARS, false),
            ..l
        };
        vec![
            Out::Send(
                Target::Members(to),
                msg(server_msg::Body::Look(LookEvent {
                    id,
                    from: me,
                    from_name,
                    look: Some(look),
                })),
            ),
            ack(conn, rid, proto::Err::Ok, 0),
        ]
    }

    fn follow_set(&mut self, conn: ConnId, rid: u32, me: MemberId, f: FollowSet) -> Vec<Out> {
        if !at_least(self.role(me), Role::Admin) {
            return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
        }
        let Ok(mode) = FollowMode::try_from(f.mode) else {
            return vec![ack(conn, rid, proto::Err::BadMessage, 0)];
        };
        let leader = if f.leader == 0 {
            self.members
                .values()
                .find(|m| m.role == Role::Host)
                .map(|m| m.id)
                .unwrap_or(me)
        } else {
            f.leader
        };
        if mode != FollowMode::FollowOff && !self.members.contains_key(&leader) {
            return vec![ack(conn, rid, proto::Err::NotFound, 0)];
        }
        // An admin cannot make everyone follow someone who outranks them... or the host make the host follow.
        self.follow = FollowState {
            mode: mode as i32,
            leader: if mode == FollowMode::FollowOff {
                0
            } else {
                leader
            },
        };
        vec![
            Out::Send(Target::Joined, msg(server_msg::Body::Follow(self.follow))),
            ack(conn, rid, proto::Err::Ok, 0),
        ]
    }

    fn admin(
        &mut self,
        conn: ConnId,
        rid: u32,
        me: MemberId,
        a: AdminAction,
        now_ms: i64,
    ) -> Vec<Out> {
        let role = self.role(me);
        if !at_least(role, Role::Admin) {
            return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
        }
        if let Some(c) = self.conns.get_mut(&conn) {
            if let Err(wait) = c.budgets.admin.take(1.0, now_ms) {
                return vec![ack(conn, rid, proto::Err::RateLimited, wait)];
            }
        }
        let Ok(kind) = AdminKind::try_from(a.kind) else {
            return vec![ack(conn, rid, proto::Err::BadMessage, 0)];
        };
        let ok = |mut v: Vec<Out>| {
            v.push(ack(conn, rid, proto::Err::Ok, 0));
            v
        };
        let until = |d: i64| {
            if d <= 0 {
                0
            } else {
                now_ms.saturating_add(d.min(365 * 24 * 3600 * 1000))
            }
        };
        match kind {
            AdminKind::AdminUnspecified => vec![ack(conn, rid, proto::Err::BadMessage, 0)],
            AdminKind::Admit | AdminKind::Deny => {
                let Some(w) = self.waiters.get(&a.target).cloned() else {
                    return vec![ack(conn, rid, proto::Err::NotFound, 0)];
                };
                let Some(wconn) = self
                    .conns
                    .iter()
                    .find(|(_, c)| matches!(c.state, ConnState::Waiting(id) if id == a.target))
                    .map(|(k, _)| *k)
                else {
                    return vec![ack(conn, rid, proto::Err::NotFound, 0)];
                };
                if kind == AdminKind::Deny {
                    self.waiters.remove(&a.target);
                    let mut out = denied(wconn, proto::Err::Denied, 0);
                    out.push(self.waiting_msg());
                    return ok(out);
                }
                let give = Role::try_from(a.role)
                    .ok()
                    .filter(|r| *r != Role::Unspecified)
                    .unwrap_or(Role::Viewer);
                if !roles::may_grant(role, give) {
                    return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
                }
                self.waiters.remove(&a.target);
                // The waiter keeps the id it waited under.
                let id = a.target;
                self.members.insert(
                    id,
                    Member {
                        id,
                        name: w.name,
                        role: give,
                        client_key: if w.client_key.is_empty() {
                            auth::token()[..32].to_string()
                        } else {
                            w.client_key
                        },
                        resume: auth::token(),
                        conn: None,
                        muted_until: None,
                        left_at: 0,
                        presence: None,
                        dirty: false,
                    },
                );
                let mut out = self.attach(wconn, id, 0, false, now_ms);
                out.push(self.waiting_msg());
                ok(out)
            }
            AdminKind::Unban => {
                let before = self.bans.len();
                self.bans.retain(|b| b.id != a.ref_id);
                if self.bans.len() == before {
                    return vec![ack(conn, rid, proto::Err::NotFound, 0)];
                }
                ok(vec![self.bans_msg(now_ms)])
            }
            AdminKind::RevokeInvite => {
                let before = self.invites.len();
                self.invites.retain(|i| i.id != a.ref_id);
                if self.invites.len() == before {
                    return vec![ack(conn, rid, proto::Err::NotFound, 0)];
                }
                ok(vec![self.invites_msg()])
            }
            AdminKind::Mute
            | AdminKind::Unmute
            | AdminKind::Kick
            | AdminKind::Ban
            | AdminKind::SetRole => {
                let Some(t) = self.members.get(&a.target).cloned() else {
                    return vec![ack(conn, rid, proto::Err::NotFound, 0)];
                };
                if !roles::may_moderate(role, t.role) {
                    return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
                }
                let you_changed = Out::Send(
                    Target::Members(vec![t.id]),
                    msg(server_msg::Body::Notice(Notice {
                        kind: NoticeKind::YouChanged as i32,
                    })),
                );
                match kind {
                    AdminKind::Mute | AdminKind::Unmute => {
                        if let Some(m) = self.members.get_mut(&t.id) {
                            m.muted_until = if kind == AdminKind::Mute {
                                Some(until(a.duration_ms))
                            } else {
                                None
                            };
                        }
                        ok(vec![self.roster_msg(), you_changed])
                    }
                    AdminKind::SetRole => {
                        let Ok(give) = Role::try_from(a.role) else {
                            return vec![ack(conn, rid, proto::Err::BadMessage, 0)];
                        };
                        if !roles::may_grant(role, give) {
                            return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
                        }
                        if let Some(m) = self.members.get_mut(&t.id) {
                            m.role = give;
                        }
                        let mut out = vec![self.roster_msg(), you_changed];
                        // A new admin needs the lists.
                        if let (true, Some(c)) = (at_least(give, Role::Admin), t.conn) {
                            out.push(Out::Send(Target::Conn(c), self.waiting_body()));
                            out.push(Out::Send(Target::Conn(c), self.bans_body(now_ms)));
                            out.push(Out::Send(Target::Conn(c), self.invites_body(now_ms)));
                        }
                        ok(out)
                    }
                    _ => {
                        let mut out = Vec::new();
                        let reason = if kind == AdminKind::Ban {
                            CloseReason::BannedNow
                        } else {
                            CloseReason::Kicked
                        };
                        if let Some(c) = t.conn {
                            out.push(Out::Send(
                                Target::Conn(c),
                                msg(server_msg::Body::Closed(proto::Closed {
                                    reason: reason as i32,
                                })),
                            ));
                            out.push(Out::Close(c, reason));
                            if let Some(cs) = self.conns.get_mut(&c) {
                                cs.state = ConnState::New;
                            }
                        }
                        if kind == AdminKind::Ban {
                            let addr = t
                                .conn
                                .and_then(|c| self.conns.get(&c))
                                .filter(|c| !c.loopback)
                                .map(|c| c.addr.clone());
                            let id = self.next_ban;
                            self.next_ban += 1;
                            self.bans.push(BanEntry {
                                id,
                                name: t.name.clone(),
                                client_key: t.client_key.clone(),
                                addr,
                                until: until(a.duration_ms),
                            });
                            out.push(self.bans_msg(now_ms));
                        }
                        self.members.remove(&t.id);
                        self.gone.push(t.id);
                        if self.follow.leader == t.id {
                            self.follow = FollowState::default();
                            out.push(Out::Send(
                                Target::Joined,
                                msg(server_msg::Body::Follow(self.follow)),
                            ));
                        }
                        out.push(self.roster_msg());
                        ok(out)
                    }
                }
            }
        }
    }

    fn invite(
        &mut self,
        conn: ConnId,
        rid: u32,
        me: MemberId,
        i: InviteNew,
        now_ms: i64,
    ) -> Vec<Out> {
        let role = self.role(me);
        let Ok(give) = Role::try_from(i.role) else {
            return vec![ack(conn, rid, proto::Err::BadMessage, 0)];
        };
        if !at_least(role, Role::Admin) || !roles::may_grant(role, give) {
            return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
        }
        if let Some(c) = self.conns.get_mut(&conn) {
            if let Err(wait) = c.budgets.invites.take(1.0, now_ms) {
                return vec![ack(conn, rid, proto::Err::RateLimited, wait)];
            }
        }
        if self.invites.len() >= 200 {
            return vec![ack(conn, rid, proto::Err::TooLarge, 0)];
        }
        let ttl = if i.ttl_ms <= 0 {
            24 * 3600 * 1000
        } else {
            i.ttl_ms.min(7 * 24 * 3600 * 1000)
        };
        let inv = Invite {
            id: self.next_invite,
            token: auth::token(),
            role: give,
            uses: i.uses.clamp(1, 100),
            expires: now_ms + ttl,
            label: text::clean(&i.label, text::NOTE_CHARS, false),
        };
        self.next_invite += 1;
        let made = InviteMade {
            id: inv.id,
            token: inv.token.clone(),
            role: give as i32,
            expires: inv.expires,
            uses: inv.uses,
            label: inv.label.clone(),
        };
        self.invites.push(inv);
        vec![
            Out::Send(Target::Conn(conn), msg(server_msg::Body::Invite(made))),
            self.invites_msg(),
            ack(conn, rid, proto::Err::Ok, 0),
        ]
    }

    fn settings(&mut self, conn: ConnId, rid: u32, me: MemberId, s: SettingsSet) -> Vec<Out> {
        if self.role(me) != Role::Host {
            return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
        }
        let mut out = Vec::new();
        if !s.password.is_empty() {
            if s.password.chars().count() < auth::MIN_PASSWORD || s.password.len() > 1024 {
                return vec![ack(conn, rid, proto::Err::Invalid, 0)];
            }
            out.push(Out::HashPassword(s.password));
        } else if s.clear_password {
            self.password = None;
        }
        if let Some(w) = s.waiting_room {
            self.cfg.waiting_room = w;
        }
        if !s.session_name.is_empty() {
            self.cfg.name = text::name(&s.session_name, "3DHeat session");
        }
        out.push(self.info_to(Target::Joined));
        out.push(ack(conn, rid, proto::Err::Ok, 0));
        out
    }

    fn dataset_set(&mut self, conn: ConnId, rid: u32, me: MemberId, d: Dataset) -> Vec<Out> {
        if !at_least(self.role(me), Role::Elevated) {
            return vec![ack(conn, rid, proto::Err::Forbidden, 0)];
        }
        if !hexish(&d.hash, 128)
            || !hexish(&d.level_hash, 128)
            || d.name.chars().count() > 260
            || d.level_name.chars().count() > 260
        {
            return vec![ack(conn, rid, proto::Err::Invalid, 0)];
        }
        // Only the host says a file is published (it publishes it).
        let published = d.published && self.role(me) == Role::Host;
        self.dataset = Some(Dataset {
            name: text::clean(&d.name, 260, false),
            level_name: text::clean(&d.level_name, 260, false),
            published,
            ..d
        });
        vec![
            self.info_to(Target::Joined),
            ack(conn, rid, proto::Err::Ok, 0),
        ]
    }

    // ------------------------------------------------------------ the clock

    /// Ten times a second: the presence frame for everyone (None when nothing
    /// moved), and what ran out (mutes, members away too long, invites).
    pub fn tick(&mut self, now_ms: i64) -> (Option<ServerMsg>, Vec<Out>) {
        let mut out = Vec::new();
        let mut roster = false;
        let grace = self.cfg.grace_ms;
        let stale: Vec<MemberId> = self
            .members
            .values()
            .filter(|m| {
                m.conn.is_none()
                    && m.role != Role::Host
                    && m.left_at > 0
                    && now_ms - m.left_at > grace
            })
            .map(|m| m.id)
            .collect();
        for id in stale {
            self.members.remove(&id);
            roster = true;
        }
        for m in self.members.values_mut() {
            if m.muted_until.is_some_and(|t| t != 0 && t <= now_ms) {
                m.muted_until = None;
                roster = true;
            }
        }
        let n = self.invites.len();
        self.invites.retain(|i| i.expires > now_ms);
        if self.invites.len() != n {
            out.push(self.invites_msg());
        }
        let n = self.bans.len();
        self.bans.retain(|b| b.until == 0 || b.until > now_ms);
        if self.bans.len() != n {
            out.push(self.bans_msg(now_ms));
        }
        if roster {
            out.push(self.roster_msg());
        }
        // When anyone moved, everyone's pose: a client that skipped a frame
        // is whole again with the next one.
        let moved = self.members.values().any(|m| m.dirty);
        let gone = std::mem::take(&mut self.gone);
        if !moved && gone.is_empty() {
            return (None, out);
        }
        let mut items = Vec::new();
        for m in self.members.values_mut() {
            m.dirty = false;
            if let (Some(p), Some(_)) = (&m.presence, m.conn) {
                items.push(PresenceOf {
                    member: m.id,
                    presence: Some(p.clone()),
                });
            }
        }
        let frame = Some(msg(server_msg::Body::Presence(PresenceFrame {
            items,
            gone,
        })));
        (frame, out)
    }

    // ------------------------------------------------------------ the state

    /// Every shared document as JSON, for saving the session.
    pub fn docs_json(&self) -> String {
        let docs: serde_json::Map<String, serde_json::Value> = self
            .docs
            .iter()
            .map(|(k, d)| {
                (
                    k.clone(),
                    serde_json::from_str(&d.to_json()).unwrap_or_default(),
                )
            })
            .collect();
        serde_json::json!({ "seq": self.seq, "docs": docs }).to_string()
    }

    /// Replaces every shared document (a session file the host opened):
    /// `{"docs": {"name": {"meta":..., "colls":...}}}`. Everyone gets the new state.
    pub fn load_docs(&mut self, json: &str) -> Result<Vec<Out>, OpError> {
        let root = text::object(json).map_err(OpError::Value)?;
        let mut docs = BTreeMap::new();
        let mut count = 0;
        if let Some(serde_json::Value::Object(ds)) = root.get("docs") {
            if ds.len() > doc::MAX_DOCS {
                return Err(OpError::Full);
            }
            for (name, d) in ds {
                if !text::ident(name, 32) {
                    return Err(OpError::Shape);
                }
                let d = Doc::from_json(&d.to_string())?;
                count += d.count();
                docs.insert(name.clone(), d);
            }
        }
        if count > doc::MAX_ENTITIES {
            return Err(OpError::Full);
        }
        self.docs = docs;
        self.room = doc::MAX_ENTITIES - count;
        self.seq += 1;
        // Nobody catches up across a replacement: the log starts again.
        self.log.clear();
        Ok(vec![
            Out::Send(Target::Joined, self.snapshot_msg()),
            Out::Send(
                Target::Joined,
                msg(server_msg::Body::Notice(Notice {
                    kind: NoticeKind::StateReplaced as i32,
                })),
            ),
        ])
    }

    /// The data the session looks at, set by the server itself (a file published at the start).
    pub fn set_dataset(&mut self, d: Dataset) {
        self.dataset = Some(d);
    }

    pub fn seq(&self) -> u64 {
        self.seq
    }

    fn snapshot_msg(&self) -> ServerMsg {
        let docs = self
            .docs
            .iter()
            .map(|(k, d)| DocState {
                doc: k.clone(),
                json: d.to_json(),
            })
            .collect();
        msg(server_msg::Body::Snapshot(Snapshot {
            seq: self.seq,
            docs,
        }))
    }

    fn roster_msg(&self) -> Out {
        let members = self
            .members
            .values()
            .map(|m| MemberMsg {
                id: m.id,
                name: m.name.clone(),
                role: m.role as i32,
                muted: m.muted_until.is_some(),
                muted_until: m.muted_until.unwrap_or(0),
                connected: m.conn.is_some(),
            })
            .collect();
        Out::Send(
            Target::Joined,
            msg(server_msg::Body::Roster(Roster { members })),
        )
    }

    fn info_to(&self, to: Target) -> Out {
        Out::Send(
            to,
            msg(server_msg::Body::Info(SessionInfo {
                name: self.cfg.name.clone(),
                waiting_room: self.cfg.waiting_room || self.password.is_none(),
                password_set: self.password.is_some(),
                dataset: self.dataset.clone(),
                tls: self.cfg.tls,
                exposed: self.cfg.exposed,
                max_clients: self.cfg.max_clients as u32,
            })),
        )
    }

    fn waiting_body(&self) -> ServerMsg {
        let waiting = self
            .waiters
            .iter()
            .map(|(id, w)| WaiterMsg {
                id: *id,
                name: w.name.clone(),
                since: w.since,
            })
            .collect();
        msg(server_msg::Body::WaitingList(WaitingList { waiting }))
    }

    fn waiting_msg(&self) -> Out {
        Out::Send(Target::Admins, self.waiting_body())
    }

    fn bans_body(&self, now_ms: i64) -> ServerMsg {
        let bans = self
            .bans
            .iter()
            .filter(|b| b.until == 0 || b.until > now_ms)
            .map(|b| Ban {
                id: b.id,
                name: b.name.clone(),
                until: b.until,
            })
            .collect();
        msg(server_msg::Body::Bans(BanList { bans }))
    }

    fn bans_msg(&self, now_ms: i64) -> Out {
        Out::Send(Target::Admins, self.bans_body(now_ms))
    }

    fn invites_body(&self, now_ms: i64) -> ServerMsg {
        // The list shows who an invite is for, never its token again.
        let invites = self
            .invites
            .iter()
            .filter(|i| i.expires > now_ms)
            .map(|i| InviteMade {
                id: i.id,
                token: String::new(),
                role: i.role as i32,
                expires: i.expires,
                uses: i.uses,
                label: i.label.clone(),
            })
            .collect();
        msg(server_msg::Body::Invites(InviteList { invites }))
    }

    fn invites_msg(&self) -> Out {
        Out::Send(Target::Admins, self.invites_body(i64::MIN))
    }

    /// The connections a target means now.
    pub fn resolve(&self, t: &Target) -> Vec<ConnId> {
        match t {
            Target::Conn(c) => vec![*c],
            Target::Joined => self.members.values().filter_map(|m| m.conn).collect(),
            Target::Admins => self
                .members
                .values()
                .filter(|m| at_least(m.role, Role::Admin))
                .filter_map(|m| m.conn)
                .collect(),
            Target::Members(ids) => ids
                .iter()
                .filter_map(|id| self.members.get(id).and_then(|m| m.conn))
                .collect(),
        }
    }
}
