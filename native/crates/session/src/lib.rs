//! The 3DHeat session server: hosts a multiplayer session for the viewer.
//! Run standalone (`3dheat serve`) or embedded in the desktop app; either
//! way the host's own viewer is a client of it, with the host's token.
//!
//! - `session`: the rules, as pure logic (roles, limits, waiting room,
//!   invites, bans, follow, look-here, the operation log);
//! - `server`: the network around it (WebSocket, static files, assets by hash, TLS);
//! - `proto`: the messages, generated from `native/proto/heat3d/session/v1/session.proto`.

#![forbid(unsafe_code)]

pub mod proto {
    #![allow(clippy::all)]
    include!(concat!(env!("OUT_DIR"), "/heat3d.session.v1.rs"));
}

pub mod auth;
pub mod doc;
pub mod lan;
pub mod limits;
pub mod roles;
pub mod server;
pub mod session;
pub mod text;
pub mod tls;
