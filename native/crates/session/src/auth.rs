//! Passwords, tokens and lockout. The session password is kept only as an
//! argon2id hash (m = 64 MiB, t = 3, p = 1); at most two hashes run at once
//! so a login flood cannot take the host's CPU. Five failed logins from one
//! address (an IPv6 /64 counts as one) lock it out for 15 minutes, doubling
//! each time it happens again.

use argon2::password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::{Algorithm, Argon2, Params, Version};
use rand::RngCore;
use std::collections::HashMap;
use std::net::IpAddr;

/// A session password's least length.
pub const MIN_PASSWORD: usize = 12;
/// Failed logins before a lockout.
pub const MAX_FAILS: u32 = 5;
/// The first lockout, milliseconds.
pub const LOCKOUT_MS: i64 = 15 * 60 * 1000;
/// Failed logins a minute, across all addresses, past which every login is slowed.
pub const FLOOD_PER_MINUTE: u32 = 30;

/// The hash's cost: the production one, or a cheap one for tests.
#[derive(Clone, Copy, Debug)]
pub struct Cost {
    pub m_kib: u32,
    pub t: u32,
}

impl Cost {
    pub const STRONG: Cost = Cost {
        m_kib: 64 * 1024,
        t: 3,
    };
    pub const TEST: Cost = Cost { m_kib: 256, t: 1 };
}

fn argon(cost: Cost) -> Argon2<'static> {
    Argon2::new(
        Algorithm::Argon2id,
        Version::V0x13,
        Params::new(cost.m_kib, cost.t, 1, None).expect("argon2 params"),
    )
}

/// The PHC string of a password's hash.
pub fn hash_password(pw: &str, cost: Cost) -> String {
    let mut salt = [0u8; 16];
    rand::rng().fill_bytes(&mut salt);
    let salt = SaltString::encode_b64(&salt).expect("salt");
    argon(cost)
        .hash_password(pw.as_bytes(), &salt)
        .expect("argon2 hash")
        .to_string()
}

/// Whether `pw` is the password of a PHC hash (constant time in the comparison).
pub fn verify_password(pw: &str, phc: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(phc) else {
        return false;
    };
    // The parameters come from the hash itself.
    Argon2::default()
        .verify_password(pw.as_bytes(), &parsed)
        .is_ok()
}

/// A random 256-bit token, as hex.
pub fn token() -> String {
    let mut b = [0u8; 32];
    rand::rng().fill_bytes(&mut b);
    hex::encode(b)
}

/// Compares two tokens in constant time.
pub fn same_token(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.bytes()
        .zip(b.bytes())
        .fold(0u8, |acc, (x, y)| acc | (x ^ y))
        == 0
}

/// The address a lockout or a ban is kept by: IPv4 as it is, IPv6 by its /64.
pub fn addr_key(ip: IpAddr) -> String {
    match ip {
        IpAddr::V4(v4) => v4.to_string(),
        IpAddr::V6(v6) => {
            if let Some(v4) = v6.to_ipv4_mapped() {
                return v4.to_string();
            }
            let s = v6.segments();
            format!("{:x}:{:x}:{:x}:{:x}::/64", s[0], s[1], s[2], s[3])
        }
    }
}

#[derive(Clone, Debug, Default)]
struct Strikes {
    fails: u32,
    locked_until: i64,
    /// Lockouts so far: each one twice as long as the one before.
    lockouts: u32,
}

/// Failed logins by address, and across all of them.
#[derive(Debug, Default)]
pub struct Lockout {
    by_addr: HashMap<String, Strikes>,
    /// Failure times in the last minute.
    recent: Vec<i64>,
}

impl Lockout {
    /// Milliseconds the address is still locked out, or 0.
    pub fn locked(&self, addr: &str, now_ms: i64) -> i64 {
        self.by_addr
            .get(addr)
            .map(|s| (s.locked_until - now_ms).max(0))
            .unwrap_or(0)
    }

    /// Records a failed login; true when it started a lockout.
    pub fn fail(&mut self, addr: &str, now_ms: i64) -> bool {
        self.recent.retain(|&t| now_ms - t < 60_000);
        self.recent.push(now_ms);
        if self.by_addr.len() > 100_000 {
            // A flood of addresses: forget the ones not locked.
            self.by_addr.retain(|_, s| s.locked_until > now_ms);
        }
        let s = self.by_addr.entry(addr.to_string()).or_default();
        s.fails += 1;
        if s.fails >= MAX_FAILS {
            s.fails = 0;
            let factor = 1i64 << s.lockouts.min(10);
            s.locked_until = now_ms + LOCKOUT_MS * factor;
            s.lockouts += 1;
            return true;
        }
        false
    }

    /// A good login clears the count (not the lockouts' doubling).
    pub fn succeed(&mut self, addr: &str) {
        if let Some(s) = self.by_addr.get_mut(addr) {
            s.fails = 0;
        }
    }

    /// Whether failures across all addresses are a flood: every login is then slowed.
    pub fn flooded(&mut self, now_ms: i64) -> bool {
        self.recent.retain(|&t| now_ms - t < 60_000);
        self.recent.len() as u32 >= FLOOD_PER_MINUTE
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn password_hash_round_trip() {
        let h = hash_password("correct horse battery", Cost::TEST);
        assert!(h.starts_with("$argon2id$"));
        assert!(verify_password("correct horse battery", &h));
        assert!(!verify_password("correct horse batterz", &h));
        assert!(!verify_password("x", "not a hash"));
    }

    #[test]
    fn strong_cost_is_the_concepts() {
        let h = hash_password("a long password here", Cost::STRONG);
        assert!(h.contains("m=65536,t=3,p=1"), "{h}");
    }

    #[test]
    fn lockout_after_five_and_doubling() {
        let mut l = Lockout::default();
        for i in 0..4 {
            assert!(!l.fail("1.2.3.4", i));
        }
        assert!(l.fail("1.2.3.4", 4));
        assert_eq!(l.locked("1.2.3.4", 4), LOCKOUT_MS);
        assert_eq!(l.locked("5.6.7.8", 4), 0);
        let t = 4 + LOCKOUT_MS;
        assert_eq!(l.locked("1.2.3.4", t), 0);
        for i in 0..5 {
            l.fail("1.2.3.4", t + i);
        }
        assert_eq!(l.locked("1.2.3.4", t + 4), 2 * LOCKOUT_MS);
    }

    #[test]
    fn ipv6_by_slash_64() {
        let a: IpAddr = "2001:db8:1:2:aaaa::1".parse().unwrap();
        let b: IpAddr = "2001:db8:1:2:bbbb::9".parse().unwrap();
        assert_eq!(addr_key(a), addr_key(b));
        let m: IpAddr = "::ffff:10.0.0.1".parse().unwrap();
        assert_eq!(addr_key(m), "10.0.0.1");
    }

    #[test]
    fn tokens() {
        let a = token();
        assert_eq!(a.len(), 64);
        assert_ne!(a, token());
        assert!(same_token(&a, &a.clone()));
        assert!(!same_token(&a, &token()));
        assert!(!same_token(&a, "short"));
    }
}
