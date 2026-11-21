//! Who a request is from when the server sits behind a reverse proxy or a
//! tunnel. The TCP peer is then the proxy, not the client: every limit,
//! lockout and ban by address would act on the proxy, for everyone at once.
//!
//! The client's address is taken from the proxy's headers **only** when the
//! connection comes from a proxy the host named (`--trusted-proxy`):
//! `X-Forwarded-For` (the right-most address that is not itself a trusted
//! proxy), else `X-Real-IP`. From `cloudflared` on this machine (loopback,
//! with `--trust-cloudflared` or while the server runs the tunnel itself)
//! only `CF-Connecting-IP` counts. From anyone else these headers are
//! ignored: a client cannot name its own address.
//!
//! A forwarded address that is this machine or no address at all is never
//! believed (it would earn the exemptions of the host's own browser): such a
//! request counts as from `UNKNOWN`, one address for all of them.

use axum::http::HeaderMap;
use serde::{Deserialize, Serialize};
use std::net::{IpAddr, Ipv4Addr};
use std::str::FromStr;

/// Where requests whose forwarded address cannot be believed are counted (TEST-NET-1).
pub const UNKNOWN: IpAddr = IpAddr::V4(Ipv4Addr::new(192, 0, 2, 0));

/// An address or a network (`10.20.30.40`, `10.0.0.0/8`, `fd00::/8`).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Net {
    addr: IpAddr,
    bits: u8,
}

impl FromStr for Net {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, String> {
        let s = s.trim();
        let (a, bits) = match s.split_once('/') {
            Some((a, b)) => (
                a,
                Some(
                    b.parse::<u8>()
                        .map_err(|_| format!("{s}: not a prefix length"))?,
                ),
            ),
            None => (s, None),
        };
        let addr = canonical(
            a.parse::<IpAddr>()
                .map_err(|_| format!("{s}: not an IP address"))?,
        );
        let max = if addr.is_ipv4() { 32 } else { 128 };
        let bits = bits.unwrap_or(max);
        if bits > max {
            return Err(format!("{s}: prefix longer than the address"));
        }
        Ok(Net { addr, bits })
    }
}

impl std::fmt::Display for Net {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let max = if self.addr.is_ipv4() { 32 } else { 128 };
        if self.bits == max {
            write!(f, "{}", self.addr)
        } else {
            write!(f, "{}/{}", self.addr, self.bits)
        }
    }
}

impl Serialize for Net {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&self.to_string())
    }
}

impl<'de> Deserialize<'de> for Net {
    fn deserialize<D: serde::Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        let s = String::deserialize(d)?;
        s.parse().map_err(serde::de::Error::custom)
    }
}

impl Net {
    pub fn contains(&self, ip: IpAddr) -> bool {
        match (self.addr, canonical(ip)) {
            (IpAddr::V4(n), IpAddr::V4(a)) => {
                let mask = if self.bits == 0 {
                    0
                } else {
                    u32::MAX << (32 - self.bits)
                };
                (u32::from(n) & mask) == (u32::from(a) & mask)
            }
            (IpAddr::V6(n), IpAddr::V6(a)) => {
                let mask = if self.bits == 0 {
                    0
                } else {
                    u128::MAX << (128 - self.bits)
                };
                (u128::from(n) & mask) == (u128::from(a) & mask)
            }
            _ => false,
        }
    }
}

/// An IPv4 address written as IPv6 (`::ffff:a.b.c.d`) as the IPv4 address it is.
pub fn canonical(ip: IpAddr) -> IpAddr {
    match ip {
        IpAddr::V6(v) => v.to_ipv4_mapped().map(IpAddr::V4).unwrap_or(ip),
        v4 => v4,
    }
}

/// Whom the server believes about the client's address.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct TrustedProxies {
    /// Reverse proxies whose `X-Forwarded-For` / `X-Real-IP` name the client.
    #[serde(default)]
    pub proxies: Vec<Net>,
    /// `cloudflared` on this machine: `CF-Connecting-IP` from a loopback peer names the client.
    #[serde(default)]
    pub cloudflared: bool,
}

/// How a request reached the server.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Via {
    /// Straight from the client (or a proxy that named no one).
    Direct,
    /// Through a trusted reverse proxy.
    Proxy,
    /// Through `cloudflared` on this machine.
    Cloudflared,
}

/// The client a request is from, as far as the server believes.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Client {
    pub ip: IpAddr,
    pub via: Via,
}

fn loopback(ip: IpAddr) -> bool {
    canonical(ip).is_loopback()
}

/// A forwarded address, if it can be believed.
fn believable(s: &str) -> Option<IpAddr> {
    let s = s.trim();
    // `[v6]` and `v4:port` forms some proxies write.
    let s = s
        .strip_prefix('[')
        .and_then(|r| r.split(']').next())
        .unwrap_or(s);
    let ip = match s.parse::<IpAddr>() {
        Ok(ip) => ip,
        Err(_) => s
            .rsplit_once(':')
            .filter(|(a, _)| !a.contains(':'))
            .and_then(|(a, _)| a.parse().ok())?,
    };
    let ip = canonical(ip);
    Some(
        if ip.is_loopback() || ip.is_unspecified() || ip.is_multicast() {
            UNKNOWN
        } else {
            ip
        },
    )
}

/// One header's single value; None when absent, Some(None) when there are several (not believed).
fn single<'a>(h: &'a HeaderMap, name: &str) -> Option<Option<&'a str>> {
    let mut all = h.get_all(name).iter();
    let first = all.next()?;
    if all.next().is_some() {
        return Some(None);
    }
    Some(first.to_str().ok())
}

impl TrustedProxies {
    /// Whether anything at all is trusted to name clients.
    pub fn any(&self) -> bool {
        self.cloudflared || !self.proxies.is_empty()
    }

    /// Whether `peer` is a proxy or tunnel whose connections carry many clients:
    /// its connections count against the server's total, not against one address.
    pub fn trusts(&self, peer: IpAddr) -> bool {
        (self.cloudflared && loopback(peer)) || self.proxies.iter().any(|n| n.contains(peer))
    }

    /// The client of a request that came from `peer` with `headers`.
    pub fn client(&self, peer: IpAddr, headers: &HeaderMap) -> Client {
        let peer = canonical(peer);
        let direct = Client {
            ip: peer,
            via: Via::Direct,
        };
        if self.cloudflared && peer.is_loopback() {
            // Only cloudflared's own header; X-Forwarded-For and X-Real-IP are whatever the client sent.
            return match single(headers, "cf-connecting-ip") {
                None => direct,
                Some(v) => Client {
                    ip: v.and_then(believable).unwrap_or(UNKNOWN),
                    via: Via::Cloudflared,
                },
            };
        }
        if !self.proxies.iter().any(|n| n.contains(peer)) {
            return direct;
        }
        // X-Forwarded-For, all its lines in order: from the right, past the trusted proxies.
        let xff: Vec<&str> = headers
            .get_all("x-forwarded-for")
            .iter()
            .filter_map(|v| v.to_str().ok())
            .collect();
        if !xff.is_empty() {
            let joined = xff.join(",");
            for part in joined.split(',').rev() {
                let Some(ip) = believable(part) else {
                    // Garbage: nothing to its left can be believed either.
                    return Client {
                        ip: UNKNOWN,
                        via: Via::Proxy,
                    };
                };
                if ip != UNKNOWN && self.proxies.iter().any(|n| n.contains(ip)) {
                    continue;
                }
                return Client {
                    ip,
                    via: Via::Proxy,
                };
            }
            return Client {
                ip: UNKNOWN,
                via: Via::Proxy,
            };
        }
        match single(headers, "x-real-ip") {
            Some(v) => Client {
                ip: v.and_then(believable).unwrap_or(UNKNOWN),
                via: Via::Proxy,
            },
            // The proxy named no one: the request is the proxy's own.
            None => direct,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    fn h(pairs: &[(&'static str, &str)]) -> HeaderMap {
        let mut m = HeaderMap::new();
        for (k, v) in pairs {
            m.append(*k, HeaderValue::from_str(v).unwrap());
        }
        m
    }

    fn ip(s: &str) -> IpAddr {
        s.parse().unwrap()
    }

    fn lan_proxy() -> TrustedProxies {
        TrustedProxies {
            proxies: vec!["10.20.30.40".parse().unwrap()],
            cloudflared: false,
        }
    }

    #[test]
    fn nets_parse_and_contain() {
        let n: Net = "10.0.0.0/8".parse().unwrap();
        assert!(n.contains(ip("10.200.1.1")));
        assert!(!n.contains(ip("11.0.0.1")));
        assert!(n.contains(ip("::ffff:10.1.2.3")));
        let one: Net = "10.20.30.40".parse().unwrap();
        assert!(one.contains(ip("10.20.30.40")) && !one.contains(ip("10.20.30.41")));
        let v6: Net = "fd00::/8".parse().unwrap();
        assert!(v6.contains(ip("fd12::1")) && !v6.contains(ip("fe80::1")));
        assert!("0.0.0.0/0".parse::<Net>().unwrap().contains(ip("8.8.8.8")));
        for bad in ["", "10.0.0.0/33", "nope", "1.2.3.4/x", "::/129"] {
            assert!(bad.parse::<Net>().is_err(), "{bad}");
        }
        assert_eq!(serde_json::to_string(&one).unwrap(), "\"10.20.30.40\"");
        assert_eq!(serde_json::from_str::<Net>("\"10.0.0.0/8\"").unwrap(), n);
    }

    #[test]
    fn spoofed_headers_from_an_untrusted_peer_are_ignored() {
        let spoof = h(&[
            ("x-forwarded-for", "1.2.3.4"),
            ("x-real-ip", "5.6.7.8"),
            ("cf-connecting-ip", "9.9.9.9"),
        ]);
        let none = TrustedProxies::default();
        for t in [none, lan_proxy()] {
            // A stranger on the internet, a machine on the LAN that is not the proxy.
            for peer in ["203.0.113.7", "10.20.30.99"] {
                assert_eq!(
                    t.client(ip(peer), &spoof),
                    Client {
                        ip: ip(peer),
                        via: Via::Direct
                    }
                );
                assert!(!t.trusts(ip(peer)));
            }
        }
        // Loopback without the tunnel switched on: the headers say nothing.
        assert_eq!(
            lan_proxy().client(ip("127.0.0.1"), &spoof),
            Client {
                ip: ip("127.0.0.1"),
                via: Via::Direct
            }
        );
    }

    #[test]
    fn a_trusted_proxy_names_the_client() {
        let t = lan_proxy();
        let p = ip("10.20.30.40");
        assert!(t.trusts(p));
        assert_eq!(
            t.client(p, &h(&[("x-real-ip", "203.0.113.9")])),
            Client {
                ip: ip("203.0.113.9"),
                via: Via::Proxy
            }
        );
        assert_eq!(
            t.client(p, &h(&[("x-forwarded-for", "203.0.113.9")])),
            Client {
                ip: ip("203.0.113.9"),
                via: Via::Proxy
            }
        );
        // An appending proxy: what the client wrote is on the left; the right-most untrusted entry is the client.
        assert_eq!(
            t.client(p, &h(&[("x-forwarded-for", "6.6.6.6, 203.0.113.9")]))
                .ip,
            ip("203.0.113.9")
        );
        assert_eq!(
            t.client(
                p,
                &h(&[
                    ("x-forwarded-for", "6.6.6.6"),
                    ("x-forwarded-for", "203.0.113.9")
                ])
            )
            .ip,
            ip("203.0.113.9")
        );
        // A chain of trusted proxies is walked past.
        let two = TrustedProxies {
            proxies: vec![
                "10.20.30.40".parse().unwrap(),
                "10.0.0.0/8".parse().unwrap(),
            ],
            cloudflared: false,
        };
        assert_eq!(
            two.client(p, &h(&[("x-forwarded-for", "203.0.113.9, 10.1.1.1")]))
                .ip,
            ip("203.0.113.9")
        );
        // X-Forwarded-For wins over X-Real-IP (a proxy that only appends passes the client's X-Real-IP through).
        assert_eq!(
            t.client(
                p,
                &h(&[("x-real-ip", "6.6.6.6"), ("x-forwarded-for", "203.0.113.9")])
            )
            .ip,
            ip("203.0.113.9")
        );
        // Port and bracket forms.
        assert_eq!(
            t.client(p, &h(&[("x-forwarded-for", "203.0.113.9:4711")]))
                .ip,
            ip("203.0.113.9")
        );
        assert_eq!(
            t.client(p, &h(&[("x-forwarded-for", "[2001:db8::1]:4711")]))
                .ip,
            ip("2001:db8::1")
        );
        assert_eq!(
            t.client(
                ip("::ffff:10.20.30.40"),
                &h(&[("x-real-ip", "203.0.113.9")])
            )
            .ip,
            ip("203.0.113.9")
        );
        // The proxy's own request (no header): the proxy.
        assert_eq!(
            t.client(p, &HeaderMap::new()),
            Client {
                ip: p,
                via: Via::Direct
            }
        );
    }

    #[test]
    fn forwarded_addresses_that_cannot_be_believed() {
        let t = lan_proxy();
        let p = ip("10.20.30.40");
        for bad in [
            "127.0.0.1",
            "::1",
            "0.0.0.0",
            "garbage",
            "",
            "1.2.3.4.5",
            "224.0.0.1",
        ] {
            assert_eq!(t.client(p, &h(&[("x-real-ip", bad)])).ip, UNKNOWN, "{bad}");
            assert_eq!(
                t.client(p, &h(&[("x-forwarded-for", bad)])).ip,
                UNKNOWN,
                "{bad}"
            );
        }
        // Garbage to the right: nothing left of it is believed.
        assert_eq!(
            t.client(p, &h(&[("x-forwarded-for", "203.0.113.9, junk")]))
                .ip,
            UNKNOWN
        );
        // Two X-Real-IP lines: neither.
        assert_eq!(
            t.client(
                p,
                &h(&[("x-real-ip", "203.0.113.9"), ("x-real-ip", "6.6.6.6")])
            )
            .ip,
            UNKNOWN
        );
        // Only trusted proxies in the list: no client named.
        assert_eq!(
            t.client(p, &h(&[("x-forwarded-for", "10.20.30.40")])).ip,
            UNKNOWN
        );
    }

    #[test]
    fn cloudflared_on_loopback_names_the_client_with_its_header_only() {
        let t = TrustedProxies {
            proxies: vec![],
            cloudflared: true,
        };
        let lo = ip("127.0.0.1");
        assert!(t.trusts(lo) && t.trusts(ip("::1")) && !t.trusts(ip("10.20.30.40")));
        assert_eq!(
            t.client(lo, &h(&[("cf-connecting-ip", "203.0.113.9")])),
            Client {
                ip: ip("203.0.113.9"),
                via: Via::Cloudflared
            }
        );
        // X-Forwarded-For and X-Real-IP from loopback are not cloudflared's word.
        let other = h(&[("x-forwarded-for", "6.6.6.6"), ("x-real-ip", "6.6.6.6")]);
        assert_eq!(
            t.client(lo, &other),
            Client {
                ip: lo,
                via: Via::Direct
            }
        );
        assert_eq!(
            t.client(
                lo,
                &h(&[
                    ("cf-connecting-ip", "203.0.113.9"),
                    ("x-forwarded-for", "6.6.6.6")
                ])
            )
            .ip,
            ip("203.0.113.9")
        );
        // The host's own browser: loopback, no header.
        assert_eq!(
            t.client(lo, &HeaderMap::new()),
            Client {
                ip: lo,
                via: Via::Direct
            }
        );
        // Loopback named by the header, or two of them: not believed.
        assert_eq!(
            t.client(lo, &h(&[("cf-connecting-ip", "127.0.0.1")])).ip,
            UNKNOWN
        );
        assert_eq!(
            t.client(
                lo,
                &h(&[
                    ("cf-connecting-ip", "1.1.1.1"),
                    ("cf-connecting-ip", "2.2.2.2")
                ])
            )
            .ip,
            UNKNOWN
        );
        // From the LAN the header is a stranger's word.
        assert_eq!(
            t.client(
                ip("10.20.30.99"),
                &h(&[("cf-connecting-ip", "203.0.113.9")])
            )
            .ip,
            ip("10.20.30.99")
        );
    }
}
