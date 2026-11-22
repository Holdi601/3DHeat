//! 3DHeat's native viewport (Stage 5): the engine's WGSL drawn with wgpu, Vulkan
//! first and DX12 as the fallback on Windows, under the app's transparent page.
//!
//! The page keeps the engine (camera, sampling plan, accumulation, exposure) and
//! sends each frame as one packet (`src/render/native/framePacket.ts`); this
//! crate draws it with the same shaders the page's WebGPU renderer runs
//! (`wgsl/`, exported by `src/render/native/shaderExport.ts`), taking the rows
//! straight from the core's built dataset. See docs/native-app.md.

pub mod figures;
pub mod generated;
pub mod heatmodes;
pub mod occlusion;
pub mod loader;
pub mod overlays;
pub mod ranges;
pub mod packet;
pub mod renderer;
pub mod tracks;
pub mod viewport;

pub use renderer::{Captured, LevelMesh, Renderer};
pub use viewport::{Msg, Viewport};
/// The wgpu this viewport is built with, for the app's surface.
pub use wgpu;
