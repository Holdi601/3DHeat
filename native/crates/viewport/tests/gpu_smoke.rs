//! The renderer on a real adapter - or lavapipe, Mesa's software Vulkan, in CI: every pipeline made
//! (heat, binning, composite, level with its structures and water, the structure depth and
//! the peeled layers, lines, figures, cubes, zones, spawn marks, volume contours,
//! engagement ranges with a view taken from the level, line heat, wedges with the direction
//! field over them, the rate map), one frame of heat drawn offscreen with
//! no validation error, and the heat read back. Skipped where no adapter is found, unless
//! `HEAT3D_GPU_SMOKE=1` asks for one (the Linux CI job, with lavapipe installed).

use std::sync::{Arc, Mutex};

use heat3d_viewport::generated::*;
use heat3d_viewport::heatmodes::{RowData, ROW_DIRS, ROW_LINES};
use heat3d_viewport::loader::PageChunk;
use heat3d_viewport::packet::{Contours, Glyphs, Overlays, Packet, PlanEntry, Ranges, Spawns, Top, Zones};
use heat3d_viewport::LevelMesh;
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
    let vp: [f32; 16] = [2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, -1.0, -1.0, 0.5, 1.0];
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
    // The level, its structures (faces, edges) and water, occluding the heat behind the wall.
    f[F_LEVEL_ON] = 1.0;
    f[F_LEVEL_OPACITY] = 1.0;
    f[F_LEVEL_BRIGHTNESS] = 1.0;
    f[F_STRUCT_FACE_OPACITY] = 0.3;
    f[F_STRUCT_WIRE_OPACITY] = 0.6;
    f[F_STRUCT_TINT..F_STRUCT_TINT + 3].copy_from_slice(&[0.8, 0.9, 1.0]);
    f[F_STRUCT_FACES] = 1.0;
    f[F_STRUCT_WIRE] = 1.0;
    f[F_WATER_OPACITY] = 0.8;
    f[F_WATER_SHOW] = 1.0;
    f[F_OCCLUSION] = 0.8;
    f[F_OCCLUSION_FLOOR] = 0.1;
    f[F_OCCLUDED_EXTRA] = 0.5;
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
        overlays: Some(overlays()),
        ranges: Some(ranges(&vp)),
        ..Default::default()
    }
}

/// Two shells (a sphere, then a cone), the ground shaded, one face of a view taken from the level.
fn ranges(vp: &[f32; 16]) -> Ranges {
    let mut shell_uniform = vec![0f32; SHELL_UNIFORM_BYTES as usize / 4];
    shell_uniform[..16].copy_from_slice(vp);
    shell_uniform[19] = 0.5;
    shell_uniform[20] = 1.0;
    let mut ground = vec![0f32; GROUND_UNIFORM_BYTES as usize / 4];
    ground[..16].copy_from_slice(vp);
    let mut instance = vec![0f32; SHELL_FLOATS as usize];
    instance[..4].copy_from_slice(&[0.5, 0.5, 0.5, 0.3]);
    Ranges {
        count: 2,
        cone_start: 1,
        sphere: 3,
        cone: 3,
        mesh: Some(vec![0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0]),
        shell_uniform,
        instances: [instance.clone(), instance].concat(),
        ground: Some(ground),
        captures: vec![(0, vec![0.5, 0.6, 0.5, 2.0, 1.0, 0.0, 0.0, 0.001, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0])],
    }
}

/// A zone's triangle (on the ground too), a spawn mark with its line, a volume's contours.
fn overlays() -> Overlays {
    let mut verts = Vec::new();
    for (x, z) in [(0.2f32, 0.2f32), (0.8, 0.2), (0.5, 0.8)] {
        // xyz, middle, part (fill), angle, zone 0, radius.
        verts.extend_from_slice(&[x, 0.5, z, 0.5, 0.5, 0.5, 3.0, 0.25, 0.0, 0.3]);
    }
    let mut state = vec![0f32; (MAX_ZONES * ZONE_STATE_FLOATS) as usize];
    state[..8].copy_from_slice(&[1.0, 0.2, 0.2, 1.0, 0.2, 0.2, 1.0, 0.5]);
    let mut block = vec![0f32; VOLUME_BLOCK_FLOATS as usize];
    block[..4].copy_from_slice(&[1.0, 1.0, 0.0, 1.5]);
    let identity = vec![1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
    Overlays {
        zones: Some(Zones { ground: true, xray: 0.5, min_px: 28.0, count: 3, state, verts: Some(verts) }),
        spawns: Some(Spawns { count: 1, lines: true, dpr: 1.0, data: Some(vec![0.5, 0.5, 0.5, 0.3, 1.0, 0.5, 0.2, 1.0, 0.3, 0.5, 0.3, 1.0]) }),
        contours: Some(Contours { block, colors: vec![1.0; (MAX_GPU_VOLUMES * 4) as usize], inv: identity }),
    }
}

/// The same frame with the objectives under the units (`objectivesUnder`).
fn packet_under() -> Packet {
    let mut p = packet();
    p.seq = 2;
    p.top.as_mut().unwrap().under = true;
    p.top.as_mut().unwrap().under_lines = tri()[..14].to_vec();
    p
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
    // A flat level the views are taken from: four corners (position, normal), two triangles.
    let mut vertices = Vec::new();
    for (x, z) in [(0.0f32, 0.0f32), (1.0, 0.0), (1.0, 1.0), (0.0, 1.0)] {
        vertices.extend_from_slice(&[x, 0.4, z, 0.0, 1.0, 0.0]);
    }
    // A wall standing across the middle (structures: faces, edges) and a pool (water), so the
    // structures' shells, their seal, the structure depth and the peeled layers draw too.
    for (x, y, z) in [(0.0f32, 0.4f32, 0.5f32), (1.0, 0.4, 0.5), (1.0, 0.9, 0.5), (0.0, 0.9, 0.5)] {
        vertices.extend_from_slice(&[x, y, z, 0.0, 0.0, 1.0]);
    }
    r.set_level(Some(&LevelMesh {
        vertices,
        colours: None,
        indices: vec![0, 1, 2, 0, 2, 3],
        structure: vec![4, 5, 6, 4, 6, 7],
        edges: vec![4, 5, 5, 6, 6, 7, 7, 4],
        water: vec![0, 1, 2],
    }));
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
    r.draw(&[packet(), packet_under()], &view, (SIDE, SIDE), false);
    r.draw(&[packet()], &view, (SIDE, SIDE), false);
    heat_modes(&mut r, &view);
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

/// The heat modes (`heatmodes.rs`): the chunk's bearings and segment starts, then line heat with
/// playback, the wedges with the direction field's arrows and streams, and the rate map.
fn heat_modes(r: &mut Renderer, view: &wgpu::TextureView) {
    let rows = (SIDE * SIDE) as usize;
    let line_box = [0.0, 0.0, 0.0, 1.0, 1.0, 1.0];
    r.modes.put(&r.device, &r.queue, RowData::whole(ROW_DIRS, 0, line_box, (0..rows).map(|i| (i % 255) as u8).collect()));
    // Each row's segment from the row before it on its line of the grid (flag 1), routes starting
    // at the first column (flag 2).
    let mut starts = Vec::with_capacity(rows * 12);
    for i in 0..rows {
        let col = i % SIDE as usize;
        let prev = if col == 0 { i } else { i - 1 };
        let x = ((prev % SIDE as usize) as f32 / (SIDE - 1) as f32 * 65535.0) as u32;
        let z = ((prev / SIDE as usize) as f32 / (SIDE - 1) as f32 * 65535.0) as u32;
        let flags = if col == 0 { 3u32 } else { 1 };
        starts.extend_from_slice(&(x | (32768 << 16)).to_le_bytes());
        starts.extend_from_slice(&(z | (flags << 16)).to_le_bytes());
        starts.extend_from_slice(&1f32.to_le_bytes());
    }
    // In two slices, as the page sends a chunk.
    let half = starts.len() / 2 / 4 * 4;
    let mut second = RowData::whole(ROW_LINES, 0, line_box, starts[half..].to_vec());
    second.total = starts.len() as u32;
    second.offset = half as u32;
    let mut first = RowData::whole(ROW_LINES, 0, line_box, starts[..half].to_vec());
    first.total = starts.len() as u32;
    r.modes.put(&r.device, &r.queue, first);
    assert!(r.modes.lines.is_empty(), "a chunk half in is not drawn with");
    r.modes.put(&r.device, &r.queue, second);
    assert_eq!(r.modes.lines.len(), 1);
    let mut lines = packet();
    lines.seq = 3;
    let f = lines.frame.as_mut().unwrap();
    f[F_MODE] = 3.0;
    f[F_LINE_HEAT] = 1.0;
    f[F_LINE_TRAIL_NOW] = 0.5;
    f[F_LINE_TRAIL_TAIL] = 2.0;
    let mut wedges = packet();
    wedges.seq = 4;
    let f = wedges.frame.as_mut().unwrap();
    f[F_DIRECTION_ON] = 1.0;
    f[F_DIR_HALF] = 0.6;
    f[F_DIR_SOFT] = 0.1;
    f[F_DIR_NORM] = 2.0;
    f[F_DIR_CENTROID] = 0.3;
    f[F_DIR_FIELD] = 3.0;
    f[F_DIR_CELL] = 8.0;
    f[F_DIR_TIME] = 1.5;
    // And the structure depth, for the cut behind the terrain.
    f[F_HIDE_BEHIND_GROUND] = 1.0;
    let mut rate = packet();
    rate.seq = 5;
    let f = rate.frame.as_mut().unwrap();
    f[F_MODE] = 1.0;
    f[F_USE_TEAM_SIGN] = 1.0;
    f[F_RATE_ON] = 1.0;
    f[F_RATE_OVERALL] = 0.5;
    f[F_RATE_MIN] = 1.0;
    f[F_RATE_SPAN] = 0.2;
    for p in [lines, wedges, rate] {
        r.draw(&[p], view, (SIDE, SIDE), false);
    }
}
