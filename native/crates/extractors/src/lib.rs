//! The Extractors manager of 3DHeat (docs/extractors.md).
//!
//! The extractors are separate programs, one per public repository, each
//! released on GitHub as an archive and a `SHA256SUMS`. This crate holds none
//! of their code: it finds their releases (only the repositories of the index
//! built in, `index::SHIPPED`), downloads and verifies an archive, unpacks it
//! into the user's own app data folder, and starts the program there as a
//! process of its own (`HEAT3D_MANAGED=1`, `HEAT3D_LEVELS`). Nothing about the
//! user's games or folders is kept: what is installed is read from the folders.
//!
//! `route` serves it to the viewer's Extractors panel, to the owner of the
//! machine only.

#![forbid(unsafe_code)]

pub mod index;
pub mod manager;
pub mod route;
pub mod unpack;
pub mod verify;
pub mod version;

pub use manager::{Config, Manager};
pub use route::{router, Auth};
