//! Token buckets: every kind of action a client can take has its own, so a
//! flood of one (pings, operations, "look here") never starves the others,
//! and a client over its budget is told when to try again.

/// A bucket of `capacity` tokens refilled at `per_sec`; an action takes one
/// (or `cost`) token, or is refused.
#[derive(Clone, Debug)]
pub struct Bucket {
    capacity: f64,
    per_sec: f64,
    tokens: f64,
    last_ms: i64,
}

impl Bucket {
    pub fn new(capacity: f64, per_sec: f64, now_ms: i64) -> Self {
        Self {
            capacity,
            per_sec,
            tokens: capacity,
            last_ms: now_ms,
        }
    }

    /// `n` per minute, all of them at once at most.
    pub fn per_minute(n: f64, now_ms: i64) -> Self {
        Self::new(n, n / 60.0, now_ms)
    }

    fn refill(&mut self, now_ms: i64) {
        let dt = (now_ms - self.last_ms).max(0) as f64 / 1000.0;
        self.tokens = (self.tokens + dt * self.per_sec).min(self.capacity);
        self.last_ms = now_ms.max(self.last_ms);
    }

    /// Takes `cost` tokens: `Ok`, or `Err(ms)` until there would be enough.
    pub fn take(&mut self, cost: f64, now_ms: i64) -> Result<(), u32> {
        self.refill(now_ms);
        if self.tokens >= cost {
            self.tokens -= cost;
            return Ok(());
        }
        if self.per_sec <= 0.0 {
            return Err(u32::MAX);
        }
        let wait = ((cost - self.tokens) / self.per_sec * 1000.0).ceil();
        Err(wait.min(u32::MAX as f64) as u32)
    }
}

/// The per-connection budgets (see docs/multiplayer.md, "Limits").
#[derive(Clone, Debug)]
pub struct Budgets {
    /// Every message.
    pub messages: Bucket,
    /// Bytes received.
    pub bytes: Bucket,
    /// Batches of operations on the shared layers.
    pub batches: Bucket,
    /// Presence updates; over it they are dropped without a word.
    pub presence: Bucket,
    /// "Look here" and "follow me" requests: three a minute.
    pub look: Bucket,
    /// Moderation and settings.
    pub admin: Bucket,
    /// View sync messages (settings, playback, its clock); over it they are refused.
    pub view: Bucket,
    /// "Switch to my view" requests: three a minute, as "look here".
    pub view_ask: Bucket,
    /// Invite links made.
    pub invites: Bucket,
    /// Messages refused for the message budget in a row: past a point the client is cut off.
    pub strikes: u32,
}

/// How many "look here" requests a member may send a minute.
pub const LOOK_PER_MINUTE: f64 = 3.0;

impl Budgets {
    pub fn new(now_ms: i64) -> Self {
        Self {
            messages: Bucket::new(120.0, 60.0, now_ms),
            bytes: Bucket::new(1024.0 * 1024.0, 256.0 * 1024.0, now_ms),
            batches: Bucket::new(40.0, 20.0, now_ms),
            presence: Bucket::new(40.0, 30.0, now_ms),
            look: Bucket::per_minute(LOOK_PER_MINUTE, now_ms),
            admin: Bucket::new(20.0, 2.0, now_ms),
            view: Bucket::new(30.0, 10.0, now_ms),
            view_ask: Bucket::per_minute(LOOK_PER_MINUTE, now_ms),
            invites: Bucket::new(10.0, 0.2, now_ms),
            strikes: 0,
        }
    }
}

/// Connections and requests by address: how many connections each has
/// open, its request and upgrade budgets; and the connections in all.
pub struct PerIp {
    limits: crate::gateway::NetLimits,
    by_addr: std::sync::Mutex<std::collections::HashMap<String, AddrState>>,
    total: std::sync::Arc<std::sync::atomic::AtomicUsize>,
}

struct AddrState {
    conns: std::sync::Arc<std::sync::atomic::AtomicUsize>,
    requests: Bucket,
    upgrades: Bucket,
    last: i64,
}

/// A connection's place: given back when it ends.
pub struct Slot {
    conns: std::sync::Arc<std::sync::atomic::AtomicUsize>,
    total: std::sync::Arc<std::sync::atomic::AtomicUsize>,
}

impl Drop for Slot {
    fn drop(&mut self) {
        use std::sync::atomic::Ordering;
        self.conns.fetch_sub(1, Ordering::AcqRel);
        self.total.fetch_sub(1, Ordering::AcqRel);
    }
}

impl PerIp {
    pub fn new(limits: crate::gateway::NetLimits) -> Self {
        Self {
            limits,
            by_addr: Default::default(),
            total: Default::default(),
        }
    }

    fn with<T>(&self, ip: std::net::IpAddr, now_ms: i64, f: impl FnOnce(&mut AddrState) -> T) -> T {
        let key = crate::auth::addr_key(ip);
        let mut m = self.by_addr.lock().unwrap();
        let l = &self.limits;
        let s = m.entry(key).or_insert_with(|| AddrState {
            conns: Default::default(),
            requests: Bucket::new(l.requests_burst, l.requests_per_sec, now_ms),
            upgrades: Bucket::new(l.upgrades_burst, l.upgrades_per_sec, now_ms),
            last: now_ms,
        });
        s.last = now_ms;
        f(s)
    }

    /// A new connection from `ip`, or None when it or everyone has too many.
    pub fn connect(&self, ip: std::net::IpAddr) -> Option<Slot> {
        use std::sync::atomic::Ordering;
        if self.total.fetch_add(1, Ordering::AcqRel) >= self.limits.conns {
            self.total.fetch_sub(1, Ordering::AcqRel);
            return None;
        }
        let conns = self.with(ip, crate::gateway::now_ms(), |s| s.conns.clone());
        if conns.fetch_add(1, Ordering::AcqRel) >= self.limits.conns_per_addr {
            conns.fetch_sub(1, Ordering::AcqRel);
            self.total.fetch_sub(1, Ordering::AcqRel);
            return None;
        }
        Some(Slot {
            conns,
            total: self.total.clone(),
        })
    }

    /// A new connection from a trusted proxy (many clients behind one
    /// address): it counts against the total only.
    pub fn connect_shared(&self) -> Option<Slot> {
        use std::sync::atomic::Ordering;
        if self.total.fetch_add(1, Ordering::AcqRel) >= self.limits.conns {
            self.total.fetch_sub(1, Ordering::AcqRel);
            return None;
        }
        Some(Slot {
            conns: Default::default(),
            total: self.total.clone(),
        })
    }

    /// Whether `ip` may make another HTTP request now.
    pub fn request(&self, ip: std::net::IpAddr, now_ms: i64) -> bool {
        self.with(ip, now_ms, |s| s.requests.take(1.0, now_ms).is_ok())
    }

    /// Whether `ip` may open another WebSocket now.
    pub fn upgrade(&self, ip: std::net::IpAddr, now_ms: i64) -> bool {
        self.with(ip, now_ms, |s| s.upgrades.take(1.0, now_ms).is_ok())
    }

    /// Forgets addresses with nothing open that were quiet for ten minutes.
    pub fn forget_idle(&self, now_ms: i64) {
        use std::sync::atomic::Ordering;
        self.by_addr
            .lock()
            .unwrap()
            .retain(|_, s| s.conns.load(Ordering::Acquire) > 0 || now_ms - s.last < 600_000);
    }

    pub fn open(&self) -> usize {
        self.total.load(std::sync::atomic::Ordering::Acquire)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bucket_refuses_past_capacity_and_refills() {
        let mut b = Bucket::new(3.0, 1.0, 0);
        assert!(b.take(1.0, 0).is_ok());
        assert!(b.take(1.0, 0).is_ok());
        assert!(b.take(1.0, 0).is_ok());
        let wait = b.take(1.0, 0).unwrap_err();
        assert_eq!(wait, 1000);
        assert!(b.take(1.0, 999).is_err());
        assert!(b.take(1.0, 1000).is_ok());
    }

    #[test]
    fn look_here_is_three_a_minute() {
        let mut b = Budgets::new(0).look;
        for _ in 0..3 {
            assert!(b.take(1.0, 1).is_ok());
        }
        let wait = b.take(1.0, 1).unwrap_err();
        assert!((19_000..=20_001).contains(&wait), "{wait}");
        assert!(b.take(1.0, 20_001).is_ok());
        assert!(b.take(1.0, 20_002).is_err());
    }

    #[test]
    fn clock_going_back_does_not_mint_tokens() {
        let mut b = Bucket::new(1.0, 1.0, 10_000);
        assert!(b.take(1.0, 10_000).is_ok());
        assert!(b.take(1.0, 0).is_err());
        assert!(b.take(1.0, 10_500).is_err());
    }
}
