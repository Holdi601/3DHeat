//! The 3DHeat native core: reads telemetry with every core of the machine and
//! hands the viewer what it would have built itself.
//!
//! - `parquet`, `csv`, `acmi`, `container`: the readers, each giving exactly what
//!   the web app's own reader of that format gives (`src/data/`), only faster;
//! - `filter`: the load plan's row filter, applied while reading;
//! - `sort` and `chunks`: rows by time across all cores, cut and quantised into
//!   the engine's GPU chunk layout;
//! - `build` and `dataset`: the viewer's whole dataset built here, held for the
//!   viewer to take by column and the engine by packed chunk;
//! - `tiles`: heat as a tile pyramid built out of core, cached on disk by filter hash;
//! - `tracks`: the GPU tracks' keys over every row (the page's `gpuTracks/store.ts`, ported);
//! - `service`: the protocol (`heat3d-proto`) over any transport.

pub mod acmi;
pub mod build;
pub mod bulk;
pub mod chunks;
pub mod container;
pub mod csv;
pub mod dataset;
pub mod filter;
pub mod jsnum;
pub mod memory;
pub mod parquet;
pub mod service;
pub mod source;
pub mod sort;
pub mod table;
pub mod tiles;
pub mod tracks;
