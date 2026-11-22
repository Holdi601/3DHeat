//! The renderer on a real adapter - or lavapipe, Mesa's software Vulkan, in CI: every pipeline made
//! (heat, binning, composite, level, lines, figures, cubes), one frame of heat drawn offscreen with
//! no validation error, and the heat read back. Skipped where no adapter is found, unless
//! `HEAT3D_GPU_SMOKE=1` asks for one (the Linux CI job, with lavapipe installed).

use std::sync::{Arc, Mutex};

use heat3d_viewport::generated::*;
use heat3d_viewport::loader::PageChunk;
use heat3d_viewport::packet::{Glyphs, Packet, PlanEntry, Top};
use heat3d_viewport::wgpu;
use heat3d_viewport::Renderer;

const SIDE: u32 = 64;

/// A 64 x 64 grid of rows on the ground of a unit box, one block.
fn chunk() -> PageChunk {
    let rows = (SIDE * SIDE) as usize;
    let mut positions = Vec::with_capacity(rows * 8);
    for i in 0..rows {
        let x = ((i % SIDE as usize) as f32 / (SIDE - 1) as f32 * 65535.0) as u32;
        let z = ((i / SIDE as usize) as f32 / (SIDE - 1) as f32 * 65535.0) as u32;
        positions.extend_from_slice(&(x | (32768 << 16)).to_le_bytes());
        positions.extend_from_slice(&z.to_le_bytes());
    }
    PageChunk {
        index: 0,
        start: 0,
        rows,
        aabb_min: [0.0; 3],
        aabb_size: [1.0; 3],
        time_min: 0.0,
        time_scale: 1.0,
        life_scale: 1.0,
        positions,
        times: None,
    }
}

/// Looking straight down the box: x across, z up the picture, an orthographic view.
fn packet() -> Packet {
    let mut f = vec![0f32; FRAME_WORDS];
    // Column-major: clip.x = 2x - 1, clip.y = 2z - 1, depth 0.5.
    let vp = [2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, -1.0, -1.0, 0.5, 1.0];
    f[F_VIEW_PROJ..F_VIEW_PROJ + 16].copy_from_slice(&vp);
    f[F_VIEW_PROJ_REL..F_VIEW_PROJ_REL + 16].copy_from_slice(&vp);
    f[F_PROJ5] = 2.0;
    f[F_NEAR] = 0.1;
    f[F_FAR] = 10.0;
    f[F_WIDTH] = SIDE as f32;
    f[F_HEIGHT] = SIDE as f32;
    f[F_HEAT_SCALE] = 1.0;
    f[F_BLEND_ALPHA] = 1.0;
    f[F_HEAT_GAIN] = 1.0;
    f[F_SAMPLE_WEIGHT] = 1.0;
    f[F_RADIUS] = 0.05;
    f[F_CENTRE] = 1.0;
    f[F_FALLOFF] = 1.0;
    f[F_SATURATION] = 1.0;
    f[F_MIN_PX] = 1.0;
    f[F_MAX_PX] = 32.0;
    f[F_SLICE_AXIS] = -1.0;
    f[F_SHOW_GRID] = 1.0;
    f[F_GRID_SPACING] = 0.1;
    f[F_GRID_EXTENT] = 1.0;
    Packet {
        seq: 1,
        frame: Some(f),
        plan: vec![PlanEntry { chunk: 0, min_row: 0, max_row: SIDE * SIDE, starts: vec![0] }],
        color_lut: Some(vec![255; (LUT_WIDTH * LUT_HEIGHT * 4) as usize]),
        // A cube, a figure, a glyph, a triangle, a trail, the objectives' marks and the lines over
        // the picture, so every scene pipeline draws too.
        cubes: vec![0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 0.0, 0.0],
        figures: vec![(7, 1)],
        instances: instance(),
        tris: tri(),
        trails: tri()[..14].to_vec(),
        overlay: tri()[..14].to_vec(),
        glyphs: Some(Glyphs { style: 0.0, mode: 0.0, ticks: 0.0, sides: vec![1.0; 64], instances: instance() }),
        top: Some(Top {
            lines: tri()[..14].to_vec(),
            static_version: 1,
            static_count: 2,
            static_data: Some(tri()[..14].to_vec()),
            tris_count: 3,
            tris_data: Some(tri()),
            ground_count: 3,
            ground_data: Some(tri()),
            under: false,
            under_lines: Vec::new(),
        }),
        ..Default::default()
    }
}

/// Three vertices, seven floats each (xyz, rgba).
fn tri() -> Vec<f32> {
    vec![0.1, 0.5, 0.1, 1.0, 1.0, 1.0, 1.0, 0.9, 0.5, 0.1, 1.0, 1.0, 1.0, 1.0, 0.5, 0.5, 0.9, 1.0, 1.0, 1.0, 1.0]
}

/// One figure instance in the middle of the box (`INSTANCE_STRIDE` floats).
fn instance() -> Vec<f32> {
    vec![0.5, 0.5, 0.5, 0.1, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -100.0]
}

/// A one-triangle figure mesh (`MESH_STRIDE` floats a vertex), sent as the page sends it.
fn mesh_slice() -> Vec<u8> {
    let mut v = Vec::new();
    for p in [[0.0f32, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0]] {
        v.extend_from_slice(&p);
        v.extend_from_slice(&[0.8, 0.8, 0.8, 1.0, 0.0, 1.0, 0.0, 0.5, 1.0]);
        v.extend_from_slice(&[0.0; 12]);
    }
    let bytes: &[u8] = bytemuck::cast_slice(&v);
    let mut out = Vec::new();
    for w in [7u32, 3, bytes.len() as u32, 0] {
        out.extend_from_slice(&w.to_le_bytes());
    }
    out.extend_from_slice(bytes);
    out
}

#[test]
fn draws_heat_offscreen() {
    let required = std::env::var("HEAT3D_GPU_SMOKE").is_ok_and(|v| v == "1");
    let adapter = match heat3d_viewport::viewport::adapter(None) {
        Ok((_, a, _)) => a,
        Err(e) => {
            assert!(!required, "HEAT3D_GPU_SMOKE=1 but no adapter: {e:#}");
            eprintln!("skipped: no GPU adapter ({e:#})");
            return;
        }
    };
    let info = adapter.get_info();
    eprintln!("adapter: {} ({:?}, {:?})", info.name, info.backend, info.device_type);
    // A software adapter only when asked for (lavapipe in the Linux job; a Windows runner's WARP is not this test's).
    if !required && matches!(info.device_type, wgpu::DeviceType::Cpu | wgpu::DeviceType::VirtualGpu | wgpu::DeviceType::Other) {
        eprintln!("skipped: a software adapter, and HEAT3D_GPU_SMOKE is not set");
        return;
    }
    let mut r = Renderer::new(&adapter, wgpu::TextureFormat::Rgba8Unorm).expect("renderer");
    let scope = r.device.push_error_scope(wgpu::ErrorFilter::Validation);
    r.clear_dataset(false);
    let c = chunk().upload(&r.device);
    r.add_chunk(c);
    r.figures.mesh_slice(&r.device, &r.queue, &mesh_slice()).expect("mesh");
    r.figures.set_atlas(&r.device, &r.queue, &vec![255u8; (ATLAS_WIDTH * ATLAS_HEIGHT * 4) as usize]).expect("atlas");
    let out = r.device.create_texture(&wgpu::TextureDescriptor {
        label: Some("out"),
        size: wgpu::Extent3d { width: SIDE, height: SIDE, depth_or_array_layers: 1 },
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format: wgpu::TextureFormat::Rgba8Unorm,
        usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC,
        view_formats: &[],
    });
    let view = out.create_view(&Default::default());
    let heat: Arc<Mutex<Option<Option<Vec<f32>>>>> = Arc::default();
    let h = heat.clone();
    r.request_heat(0, Box::new(move |v| *h.lock().unwrap() = Some(v)));
    let picture: Arc<Mutex<Option<bool>>> = Arc::default();
    let pc = picture.clone();
    r.request_capture(Box::new(move |c| *pc.lock().unwrap() = Some(c.is_some_and(|c| c.rgba.len() == (SIDE * SIDE * 4) as usize))));
    r.draw(&[packet()], &view, (SIDE, SIDE), false);
    let error = pollster::block_on(scope.pop());
    assert!(error.is_none(), "validation error: {error:?}");
    for _ in 0..500 {
        let _ = r.device.poll(wgpu::PollType::wait_indefinitely());
        r.poll();
        if heat.lock().unwrap().is_some() && picture.lock().unwrap().is_some() {
            break;
        }
    }
    assert_eq!(*picture.lock().unwrap(), Some(true), "the picture read back");
    let field = heat.lock().unwrap().take().flatten().expect("the heat read back");
    let lit = field.iter().filter(|v| **v > 0.0).count();
    let total: f32 = field.iter().sum();
    eprintln!("heat: {} values, {lit} lit, total {total}", field.len());
    assert!(lit > 100 && total.is_finite() && total > 0.0, "no heat drawn: {lit} lit, total {total}");
}
