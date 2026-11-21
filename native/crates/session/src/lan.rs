//! Who may reach the server: by default only this machine and the local
//! network (private, link-local and carrier-grade NAT ranges, the last for
//! Tailscale). Reaching it from the internet is the expert mode, off unless
//! the host turns it on.

use std::net::IpAddr;

/// Whether an address is this machine or on a local network.
pub fn is_local(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v) => {
            let o = v.octets();
            v.is_loopback()
                || v.is_private()
                || v.is_link_local()
                || (o[0] == 100 && (o[1] & 0xC0) == 64)
        }
        IpAddr::V6(v) => {
            if let Some(v4) = v.to_ipv4_mapped() {
                return is_local(IpAddr::V4(v4));
            }
            let s0 = v.segments()[0];
            v.is_loopback() || (s0 & 0xFE00) == 0xFC00 || (s0 & 0xFFC0) == 0xFE80
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn local_ranges() {
        for a in [
            "127.0.0.1",
            "10.1.2.3",
            "172.16.0.1",
            "172.31.255.1",
            "192.168.10.14",
            "169.254.1.1",
            "100.64.0.1",
            "100.127.1.1",
            "::1",
            "fd00::1",
            "fe80::1",
            "::ffff:192.168.1.1",
        ] {
            assert!(is_local(a.parse().unwrap()), "{a}");
        }
        for a in [
            "8.8.8.8",
            "172.32.0.1",
            "100.128.0.1",
            "1.1.1.1",
            "2001:4860::8888",
            "::ffff:8.8.8.8",
        ] {
            assert!(!is_local(a.parse().unwrap()), "{a}");
        }
    }
}
