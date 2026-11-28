//! 3DHeat's video fallback (Stage 8): for a session member whose device cannot
//! draw the data (a weak GPU, a phone, a dataset too big for it), the host
//! draws that member's own view offscreen in the native viewport, encodes it
//! on the GPU's encoder and sends it over WebRTC. The member's page plays it
//! under its own panels and sends its camera back.
//!
//! - `encode`: the encoders (Windows: Media Foundation - NVENC, AMF or QSV in
//!   hardware, Microsoft's H.264 in software);
//! - `view`: a member's camera as it arrives, checked and clamped to the role's limit;
//! - `stream`: a stream: its encoder and the WebRTC sessions (str0m, ICE-lite,
//!   LAN host candidates only, no TURN unless configured) of the members it
//!   goes to - one member's own view, or the host's view shared by everyone
//!   following the host; the link's bitrate;
//! - `host`: the streams (no fixed number: the GPU's budget and the encoders
//!   decide), the members' leases and what draws them;
//! - `router`: the signalling, mounted in the session server for members only:
//!   the gateway checks the member's token and names member, role and limit.
//!
//! Media flows only after the session let the member in: the offer and answer
//! (ICE credentials, DTLS fingerprints) go through the gateway with the member's
//! token, and a stream whose lease the member stops renewing (kicked, banned,
//! gone) ends within seconds.

#![deny(unsafe_code)]

pub mod encode;
pub mod host;
pub mod router;
pub mod stream;
pub mod view;

pub use host::{host, Frame, FrameSink, FrameSource, Refusal, VideoHost};
pub use view::{RoleLimit, ViewParams};
