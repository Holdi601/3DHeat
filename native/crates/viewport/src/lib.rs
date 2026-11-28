//! 3DHeat's native viewport (Stage 5): the engine's WGSL drawn with wgpu, Vulkan
//! first and DX12 as the fallback on Windows, under the app's transparent page.
//!
//! The page keeps the engine (camera, sampling plan, accumulation, exposure) and
//! sends each frame as one packet (`src/render/native/framePacket.ts`); this
//! crate draws it with the same shaders the page's WebGPU renderer runs
//! (`wgsl/`, exported by `src/render/native/shaderExport.ts`), taking the rows
//! straight from the core's built dataset. See docs/native-app.md.

pub mod capture;
pub mod figures;
pub mod generated;
pub mod heatmodes;
pub mod heattiles;
pub mod occlusion;
pub mod loader;
pub mod overlays;
pub mod ranges;
pub mod packet;
pub mod renderer;
pub mod terrain;
pub mod tracks;
pub mod viewport;

pub use renderer::{Captured, LevelMesh, Renderer};

/// A line about something that went wrong, on stderr and, with `HEAT3D_VIEWPORT_LOG` set to a file,
/// appended there too: the released app has no console, so its stderr goes nowhere.
pub fn note(line: &str) {
    eprintln!("{line}");
    if let Some(path) = std::env::var_os("HEAT3D_VIEWPORT_LOG") {
        use std::io::Write;
        if let Ok(mut f) = std::fs::OpenOptions::new().create(true).append(true).open(path) {
            let _ = writeln!(f, "{line}");
        }
    }
}
pub use viewport::{Msg, Viewport};
/// The wgpu this viewport is built with, for the app's surface.
pub use wgpu;
