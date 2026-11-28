//! The renderer on a real adapter - or lavapipe, Mesa's software Vulkan, in CI: every pipeline made
//! (heat, binning, composite, level with its structures and water, the structure depth and
//! the peeled layers, lines, figures, cubes, zones, spawn marks, volume contours,
//! engagement ranges with a view taken from the level, line heat, wedges with the direction
//! field over them, the rate map, the GPU tracks' place and finish passes and their
//! indirect draws), one frame of heat drawn offscreen with
//! no validation error, and the heat read back. Skipped where no adapter is found, unless
//! `HEAT3D_GPU_SMOKE=1` asks for one (the Linux CI job, with lavapipe installed).

use std::sync::{Arc, Mutex};

use heat3d_viewport::generated::*;
use heat3d_viewport::heatmodes::{RowData, ROW_DIRS, ROW_LINES};
use heat3d_viewport::loader::PageChunk;
use heat3d_viewport::packet::{Contours, Glyphs, Overlays, Packet, PlanEntry, Ranges, Spawns, Top, TracksFrame, Zones};
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

/// A GPU tracks store of one track drawn with the mesh above (`nativeTracks.ts` messages): the
/// begin message, then each array in one slice. The track has no keys, so nothing is placed; the
/// passes (place, marks, finish), bindings and indirect draws (meshes, trails, glyphs) are what is checked.
fn tracks_messages() -> Vec<Vec<u8>> {
    let le = |w: &[u32]| w.iter().flat_map(|x| x.to_le_bytes()).collect::<Vec<u8>>();
    // Tracks, keys, keys (2), attitudes, one death's mark and its colour.
    let want = [64u32, 16, 16, 16, 16, 4];
    let mut begin = vec![0u32, 5, 1, 1, 4];
    begin.extend_from_slice(&want);
    begin.push(7);
    begin.extend_from_slice(&[0, 1, 1, 1]);
    begin.extend_from_slice(&[3, 0, 0, 0, 6, 0, 0, 0]);
    let mut out = vec![le(&begin)];
    for (i, n) in want.iter().enumerate() {
        let mut m = le(&[1, 5, i as u32, 0]);
        m.extend(std::iter::repeat_n(0u8, *n as usize));
        out.push(m);
    }
    out
}

/// A store of one track drawn from the core's keys (`BEGIN_CORE`, `Tracks::core_keys`): a unit's
/// keys built by the core, the page's table (first key, count, chunk spans after the table, span)
/// and its mark arrays the only arrays sent.
fn core_tracks(r: &mut Renderer) {
    use heat3d_core::tracks::{build_keys, TrackInput, TrackOptions};
    let n = 200;
    let px: Vec<f32> = (0..n).map(|k| 0.5 + 0.3 * (k as f32 * 0.05).sin()).collect();
    let pz: Vec<f32> = (0..n).map(|k| 0.5 - 0.3 * (k as f32 * 0.05).cos()).collect();
    let py = vec![0.5f32; n];
    let time: Vec<f32> = (0..n).map(|k| k as f32 * 0.5).collect();
    let yaw: Vec<f32> = (0..n).map(|k| k as f32 * 0.05).collect();
    let person = vec![0u32; n];
    let inp = TrackInput { px: &px, py: &py, pz: &pz, time: &time, person: &person, yaw: Some(&yaw), pitch: None, roll: None, events: None, shared: None, persons: 1 };
    let k = build_keys(&inp, &TrackOptions { units: 1.0, max_keys: 1 << 20 }).expect("core keys");
    let e = k.persons[0];
    assert_eq!(e.count as usize, n);
    r.tracks.core_keys(6, std::sync::Arc::new(k));
    let le = |w: &[u32]| w.iter().flat_map(|x| x.to_le_bytes()).collect::<Vec<u8>>();
    let mut table = vec![0u32; 16];
    table[0] = e.first;
    table[1] = e.count;
    table[2] = 0xff0000ff;
    table[4] = 2.0f32.to_bits();
    table[5] = 2;
    table[7] = 16 + e.chunk;
    for j in 0..6 {
        table[8 + j] = e.span[j].to_bits();
    }
    let want = [64u32, 0, 0, 0, 16, 4];
    let mut begin = vec![3u32, 6, 1, 1, 4];
    begin.extend_from_slice(&want);
    begin.push(7);
    begin.extend_from_slice(&[0, 1, 1, 1]);
    begin.extend_from_slice(&[3, 0, 0, 0, 6, 0, 0, 0]);
    r.tracks.message(&r.device, &r.queue, &le(&begin)).expect("core begin");
    let mut m = le(&[1, 6, 0, 0]);
    m.extend(le(&table));
    r.tracks.message(&r.device, &r.queue, &m).expect("table");
    for (i, len) in [(4u32, 16usize), (5, 4)] {
        let mut m = le(&[1, 6, i, 0]);
        m.extend(std::iter::repeat_n(0u8, len));
        r.tracks.message(&r.device, &r.queue, &m).expect("marks");
    }
    assert_eq!(r.tracks.ready_id(), 6, "the core-keyed store whole");
}

fn tracks_frame() -> TracksFrame {
    let mut uniform = vec![0u32; TRACKS_UNIFORM_BYTES as usize / 4];
    let f = |v: f32| v.to_bits();
    for k in [0, 5, 10, 15] {
        uniform[k] = f(1.0);
    }
    uniform[24] = f(1.0);
    uniform[25] = f(1.0);
    uniform[26] = f(120.0);
    uniform[27] = f(2.0);
    uniform[28] = 1;
    uniform[29] = 1;
    uniform[37] = 1;
    // Trails, the marks' pass (one mark), room for both.
    uniform[30] = TRACKS_TRAIL_ROOM;
    uniform[31] = 8;
    uniform[32] = f(5.0);
    uniform[34] = f(5.0);
    uniform[35] = f(9.0);
    uniform[36] = 1;
    TracksFrame { id: 5, uniform, vis: Some(vec![1, 0, 0, 0]), glyphs: Some(Glyphs { style: 0.0, mode: 2.0, ticks: 0.0, sides: vec![1.0; 64], instances: Vec::new() }) }
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
    for m in tracks_messages() {
        r.tracks.message(&r.device, &r.queue, &m).expect("tracks message");
    }
    assert_eq!(r.tracks.ready_id(), 5, "the tracks store whole");
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
        // Textured (the atlas below, its cut-out texels), the wall's corners through a repeating tile.
        uvs: Some(vec![0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 2.0, 0.0, 2.0, 2.0, 0.0, 2.0]),
        uv_tiles: Some(vec![0, 0, 0, 0, 1, 1, 1, 1]),
        tile_rects: Some(vec![0.0, 0.0, 0.5, 0.5]),
        bounds: [0.0; 6],
    }));
    // The level's atlas (`LEVEL_IMAGE`): 4 x 4 and its two smaller levels, half of it cut out.
    let mut atlas = Vec::new();
    for w in [LEVEL_IMAGE, 0, 4, 4, 3] {
        atlas.extend_from_slice(&w.to_le_bytes());
    }
    for (i, n) in [16usize, 4, 1].into_iter().enumerate() {
        for k in 0..n {
            atlas.extend_from_slice(&[200, 120, 60, if (k + i) % 2 == 0 { 255 } else { 0 }]);
        }
    }
    r.level_message(&atlas).expect("atlas");
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
    r.request_capture(Box::new(move |c| *pc.lock().unwrap() = Some(c.is_some_and(|c| c.rgba().len() == (SIDE * SIDE * 4) as usize))));
    r.draw(&[packet(), packet_under()], &view, (SIDE, SIDE), false);
    r.draw(&[packet()], &view, (SIDE, SIDE), false);
    heat_modes(&mut r, &view);
    let mut with_tracks = packet();
    with_tracks.tracks = Some(tracks_frame());
    r.draw(&[with_tracks.clone(), with_tracks], &view, (SIDE, SIDE), false);
    // The same drawn from the core's keys.
    core_tracks(&mut r);
    let mut with_core = packet();
    with_core.tracks = Some(TracksFrame { id: 6, ..tracks_frame() });
    r.draw(&[with_core], &view, (SIDE, SIDE), false);
    // The atlas on the ground and the structures (textured, opaque: drawn solid), the ground's own
    // edges (built as the viewport does off its thread), then the ground as lines.
    let mut textured = packet();
    {
        let f = textured.frame.as_mut().unwrap();
        f[F_LEVEL_TEXTURE] = 1.0;
        f[F_STRUCT_TEXTURED] = 1.0;
        f[F_STRUCT_FACE_OPACITY] = 1.0;
        f[F_GROUND_WIRE_OPACITY] = 0.5;
        f[F_GROUND_WIRE_FADE..F_GROUND_WIRE_FADE + 2].copy_from_slice(&[10.0, 20.0]);
    }
    r.draw(&[textured.clone()], &view, (SIDE, SIDE), false);
    let wanted = r.take_wire_wanted();
    assert_eq!(wanted.len(), 1, "the ground's edges asked for once");
    for (id, token, idx) in wanted {
        r.set_ground_wire(id, token, &heat3d_viewport::occlusion::edge_list(&idx));
    }
    textured.frame.as_mut().unwrap()[F_LEVEL_WIREFRAME] = 1.0;
    r.draw(&[textured.clone()], &view, (SIDE, SIDE), false);
    assert!(r.take_wire_wanted().is_empty(), "the ground's edges asked for once only");
    // A world tile (`LEVEL_MESH` with an id), its image (`LEVEL_IMAGE`), drawn with the level's
    // look (every tile switch on), then dropped.
    let mut tile = Vec::new();
    let words = |v: &mut Vec<u8>, w: &[u32]| w.iter().for_each(|x| v.extend_from_slice(&x.to_le_bytes()));
    let floats = |v: &mut Vec<u8>, w: &[f32]| w.iter().for_each(|x| v.extend_from_slice(&x.to_le_bytes()));
    words(&mut tile, &[LEVEL_MESH, 7, 24, 3, 1, 3, 2, 0, 1, 0, 0, 0]);
    floats(&mut tile, &[0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    for (x, z) in [(0.0f32, 0.0f32), (1.0, 0.0), (1.0, 1.0), (0.0, 1.0)] {
        floats(&mut tile, &[x, 0.3, z, 0.0, 1.0, 0.0]);
    }
    floats(&mut tile, &[0.5; 12]);
    floats(&mut tile, &[0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
    words(&mut tile, &[0, 1, 2, 0, 2, 3, 0, 1]);
    r.level_message(&tile).expect("tile mesh");
    let mut img = Vec::new();
    words(&mut img, &[LEVEL_IMAGE, 7, 2, 2, 2]);
    img.extend_from_slice(&[180u8; 20]);
    r.level_message(&img).expect("tile image");
    {
        let f = textured.frame.as_mut().unwrap();
        f[F_LEVEL_WIREFRAME] = 0.0;
        for k in [F_TILES_COLOURS, F_TILES_TEXTURE, F_TILES_WATER, F_TILES_FACES, F_TILES_WIRE] {
            f[k] = 1.0;
        }
    }
    // Made a few milliseconds a frame: the mesh and its image within a few frames.
    for _ in 0..10 {
        r.draw(&[textured.clone()], &view, (SIDE, SIDE), false);
        if !r.world_pending() {
            break;
        }
    }
    assert!(!r.world_pending(), "the tile made");
    for (id, token, idx) in r.take_wire_wanted() {
        r.set_ground_wire(id, token, &heat3d_viewport::occlusion::edge_list(&idx));
    }
    r.draw(&[textured.clone()], &view, (SIDE, SIDE), false);
    r.level_message(&[LEVEL_DROP.to_le_bytes(), 7u32.to_le_bytes()].concat()).expect("tile dropped");
    // A tiled terrain (`LEVEL_TERRAIN`: 4 x 4 tiles, 2 layers, a one-quad node grid, a one-triangle
    // "cube"), a tile's heights and classes, a cell of one box; drawn by a frame's nodes and cells
    // with occlusion on (the boxes in the seal, the structure depth and the peeled layers).
    let mut ter = Vec::new();
    words(&mut ter, &[LEVEL_TERRAIN, 4, 2, 12, 6, 18, 3]);
    floats(&mut ter, &[0.5; 64]);
    floats(&mut ter, &[0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]);
    words(&mut ter, &[0, 1, 2, 0, 2, 3]);
    floats(&mut ter, &[0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0]);
    words(&mut ter, &[0, 1, 2]);
    r.level_message(&ter).expect("terrain");
    let mut up = Vec::new();
    words(&mut up, &[LEVEL_TERRAIN_TILE, 1]);
    up.extend_from_slice(&[7u8; 32]);
    up.extend_from_slice(&[2u8; 16]);
    r.level_message(&up).expect("terrain tile");
    let mut cell = Vec::new();
    words(&mut cell, &[LEVEL_BOXES, 3, 1]);
    floats(&mut cell, &[0.2, 0.0, 0.0, 0.4, 0.0, 0.2, 0.0, 0.4, 0.0, 0.0, 0.2, 0.4]);
    r.level_message(&cell).expect("boxes");
    let mut on_terrain = textured.clone();
    on_terrain.terrain = Some(heat3d_viewport::terrain::TerrainFrame {
        nodes: vec![0.0, 0.0, 0.25, 0.1, 1.0, 0.0, 0.0, 0.0, 0.3, 0.001, 100.0, 200.0],
        count: 1,
        colours: true,
        cells: vec![3, 99],
    });
    {
        let f = on_terrain.frame.as_mut().unwrap();
        f[F_HIDE_BEHIND_GROUND] = 1.0;
        f[F_STRUCT_FACE_OPACITY] = 0.3;
    }
    r.draw(&[on_terrain.clone()], &view, (SIDE, SIDE), false);
    on_terrain.frame.as_mut().unwrap()[F_STRUCT_FACE_OPACITY] = 1.0;
    r.draw(&[on_terrain], &view, (SIDE, SIDE), false);
    r.level_message(&[LEVEL_TERRAIN, 0, 0, 0, 0, 0, 0].iter().flat_map(|w| w.to_le_bytes()).collect::<Vec<u8>>()).expect("no terrain");
    // An image level (`LEVEL_NONE`, then `LEVEL_MAP`): the map quad, 2 x 2.
    r.level_message(&LEVEL_NONE.to_le_bytes()).expect("no level");
    let mut map = Vec::new();
    for w in [LEVEL_MAP, 2, 2] {
        map.extend_from_slice(&w.to_le_bytes());
    }
    map.extend_from_slice(&[90u8; 16]);
    r.level_message(&map).expect("map");
    let mut on_map = packet();
    {
        let f = on_map.frame.as_mut().unwrap();
        f[F_LEVEL_ON] = 0.0;
        f[F_MAP_ON] = 1.0;
        f[F_MAP_RECT..F_MAP_RECT + 4].copy_from_slice(&[0.0, 0.0, 1.0, 1.0]);
        f[F_MAP_Y] = 0.4;
        f[F_MAP_OPACITY] = 1.0;
        f[F_MAP_DESATURATE] = 0.5;
        f[F_MAP_BRIGHTNESS] = 1.0;
    }
    r.draw(&[on_map], &view, (SIDE, SIDE), false);
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

/// Heat from tiles (`heattiles.rs`): a one-tile pyramid in a tile store, read by key, decoded off the
/// render thread, drawn with no rows loaded - bilinear, then as the rows' sprites with a hole and
/// team colours - and the heat read back.
#[test]
fn draws_heat_tiles_offscreen() {
    use heat3d_core::tiles::{encode_tile, tile_id, Meta, TileStore, TILE};
    use heat3d_viewport::heattiles::TilesFrame;
    let required = std::env::var("HEAT3D_GPU_SMOKE").is_ok_and(|v| v == "1");
    let adapter = match heat3d_viewport::viewport::adapter(None) {
        Ok((_, a, _)) => a,
        Err(e) => {
            assert!(!required, "HEAT3D_GPU_SMOKE=1 but no adapter: {e:#}");
            return;
        }
    };
    if !required && matches!(adapter.get_info().device_type, wgpu::DeviceType::Cpu | wgpu::DeviceType::VirtualGpu | wgpu::DeviceType::Other) {
        return;
    }
    // A pyramid of one level-0 tile, two channels: every cell 1 in the first, 2 in the second.
    let root = std::env::temp_dir().join(format!("heat3d-viewport-tiles-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    let key = "smoke";
    let mut cells = vec![1u32; TILE * TILE * 2];
    cells[TILE * TILE..].fill(2);
    let bytes = encode_tile(0, 0, 0, 2, &cells, false);
    std::fs::create_dir_all(root.join(key)).unwrap();
    std::fs::write(root.join(key).join("tiles.bin"), &bytes).unwrap();
    let meta = Meta { key: key.into(), size: 1.0, channels: 2, index: vec![[(0u32, [0u64, bytes.len() as u64])].into_iter().collect()], bytes: bytes.len() as u64, ..Default::default() };
    std::fs::write(root.join(key).join("meta.json"), serde_json::to_vec(&meta).unwrap()).unwrap();
    let store = Arc::new(TileStore::open(root.clone(), 1 << 30).unwrap());

    let mut r = Renderer::new(&adapter, wgpu::TextureFormat::Rgba8Unorm).expect("renderer");
    let scope = r.device.push_error_scope(wgpu::ErrorFilter::Validation);
    r.clear_dataset(false);
    r.tiles.set_store(store);
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
    // The unit square, its texture whole; a count a unit of density (bilinear, no kernel).
    let mut inst = [0f32; TILE_INST_FLOATS as usize];
    inst[..8].copy_from_slice(&[0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0]);
    inst[8] = 1.0;
    inst[10] = 1.0 / TILE as f32;
    inst[12..].copy_from_slice(&[1e9, 1e9, -1e9, -1e9]);
    let mut uniform = [0f32; 16];
    uniform[1] = 1.0;
    let tiles = TilesFrame { key: key.into(), uniform, curve: None, components: 1, wkey: 0, weights: Vec::new(), tiles: vec![(tile_id(0, 0, 0), inst)] };
    let mut p = packet();
    p.plan.clear();
    p.ranges = None;
    p.heat_tiles = Some(tiles.clone());
    // Until the tile is read, decoded and uploaded.
    for seq in 0..200 {
        p.seq = seq + 1;
        r.draw(&[p.clone()], &view, (SIDE, SIDE), false);
        if !r.tiles.pending {
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(5));
    }
    assert!(!r.tiles.pending, "the tile never arrived");
    // As the rows' sprites, a hole over the left half weighing nothing, the ramp's curve; then team colours.
    let mut k = tiles.clone();
    k.uniform[2..13].copy_from_slice(&[1.0, 0.0, 0.01, 1.0, 32.0, 32.0, 1.0, 0.0, 1.0, 0.0, 1.0]);
    k.uniform[14] = 1.0;
    k.uniform[15] = 0.0;
    k.curve = Some((0..CURVE_LUT_SIZE).map(|i| 1.0 - i as f32 / (CURVE_LUT_SIZE - 1) as f32).collect());
    k.tiles[0].1[11] = 0.01;
    k.tiles[0].1[12..].copy_from_slice(&[0.0, 0.0, 128.0, 256.0]);
    let mut team = k.clone();
    team.components = 4;
    team.wkey = 9;
    team.weights = vec![1.0, 0.5, 0.0, 0.7, 1.0, -0.5, 0.0, 0.7];
    for t in [k, team] {
        p.heat_tiles = Some(t);
        for _ in 0..200 {
            p.seq += 1;
            r.draw(&[p.clone()], &view, (SIDE, SIDE), false);
            if !r.tiles.pending {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(5));
        }
        assert!(!r.tiles.pending, "the tile never arrived");
    }
    // The plain heat again, read back: every cell 3 rows a unit of density over the square.
    p.heat_tiles = Some(tiles);
    let heat: Arc<Mutex<Option<Option<Vec<f32>>>>> = Arc::default();
    let h = heat.clone();
    r.request_heat(0, Box::new(move |v| *h.lock().unwrap() = Some(v)));
    p.seq += 1;
    r.draw(&[p], &view, (SIDE, SIDE), false);
    let error = pollster::block_on(scope.pop());
    assert!(error.is_none(), "validation error: {error:?}");
    for _ in 0..500 {
        let _ = r.device.poll(wgpu::PollType::wait_indefinitely());
        r.poll();
        if heat.lock().unwrap().is_some() {
            break;
        }
    }
    let field = heat.lock().unwrap().take().flatten().expect("the heat read back");
    let lit = field.iter().filter(|v| **v > 0.0).count();
    eprintln!("tile heat: {} values, {lit} lit, max {}", field.len(), field.iter().cloned().fold(0f32, f32::max));
    assert!(lit > field.len() / 2, "the tile drew {lit} of {}", field.len());
    let _ = std::fs::remove_dir_all(&root);
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

/// Pictures read back through the capture ring (`capture.rs`, a video render's frames): a capture
/// asked for a packet still to come waits for it; with every slot held by its asker the next one
/// waits for a slot (the frames go on drawing) and is served once one is given back; the rows are
/// read on another thread; a BGRA surface gives the same RGBA picture as an RGBA one.
#[test]
fn captures_through_the_ring() {
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
    if !required && matches!(info.device_type, wgpu::DeviceType::Cpu | wgpu::DeviceType::VirtualGpu | wgpu::DeviceType::Other) {
        eprintln!("skipped: a software adapter, and HEAT3D_GPU_SMOKE is not set");
        return;
    }
    type Got = Arc<Mutex<Vec<(char, Option<heat3d_viewport::Captured>)>>>;
    let mut pictures = Vec::new();
    for format in [wgpu::TextureFormat::Rgba8Unorm, wgpu::TextureFormat::Bgra8Unorm] {
        let mut r = Renderer::new(&adapter, format).expect("renderer");
        let scope = r.device.push_error_scope(wgpu::ErrorFilter::Validation);
        r.clear_dataset(false);
        let c = chunk().upload(&r.device);
        r.add_chunk(c);
        let out = r.device.create_texture(&wgpu::TextureDescriptor {
            label: Some("out"),
            size: wgpu::Extent3d { width: SIDE, height: SIDE, depth_or_array_layers: 1 },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format,
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            view_formats: &[],
        });
        let view = out.create_view(&Default::default());
        let got: Got = Arc::default();
        let ask = |r: &mut Renderer, name: char, after: u32| {
            let g = got.clone();
            r.request_capture_after(after, Box::new(move |c| g.lock().unwrap().push((name, c))));
        };
        let settle = |r: &mut Renderer| {
            for _ in 0..20 {
                let _ = r.device.poll(wgpu::PollType::wait_indefinitely());
                r.poll();
            }
        };
        // Served in any order (the read-backs land as the driver maps them).
        let names = |g: &Got| {
            let mut v: Vec<char> = g.lock().unwrap().iter().map(|(n, _)| *n).collect();
            v.sort();
            v.into_iter().collect::<String>()
        };
        let mut p = packet();
        p.ranges = None;
        ask(&mut r, 'a', 3);
        p.seq = 1;
        r.draw(&[p.clone()], &view, (SIDE, SIDE), false);
        settle(&mut r);
        assert_eq!(names(&got), "", "a capture of packet 3 served at packet 1");
        for n in ['b', 'c', 'd'] {
            ask(&mut r, n, 0);
        }
        p.seq = 2;
        r.draw(&[p.clone()], &view, (SIDE, SIDE), false);
        settle(&mut r);
        assert_eq!(names(&got), "bcd");
        // Packet 3 drawn, but all three slots held: 'a' waits.
        p.seq = 3;
        r.draw(&[p.clone()], &view, (SIDE, SIDE), false);
        settle(&mut r);
        assert_eq!(names(&got), "bcd", "a capture served with every slot held");
        assert!(r.capture_overdue(), "a capture waiting for a slot must keep the frames coming");
        // 'b' read on another thread and given back: 'a' is served at the next frame.
        let at = got.lock().unwrap().iter().position(|(n, _)| *n == 'b').unwrap();
        let b = got.lock().unwrap().remove(at).1.expect("b");
        let b_rgba = std::thread::spawn(move || b.rgba()).join().unwrap();
        r.draw(&[], &view, (SIDE, SIDE), false);
        settle(&mut r);
        assert_eq!(names(&got), "acd");
        let at = got.lock().unwrap().iter().position(|(n, _)| *n == 'a').unwrap();
        let a = got.lock().unwrap().remove(at).1.expect("a");
        let a_rgba = a.rgba();
        assert_eq!((a.width, a.height), (SIDE, SIDE));
        assert_eq!(a_rgba.len(), (SIDE * SIDE * 4) as usize);
        assert!(a_rgba.chunks_exact(4).any(|px| px[..3] != [0, 0, 0]), "a black picture");
        assert_eq!(a_rgba, b_rgba, "the same packet, another picture");
        got.lock().unwrap().clear();
        let error = pollster::block_on(scope.pop());
        assert!(error.is_none(), "validation error: {error:?}");
        pictures.push(a_rgba);
    }
    assert_eq!(pictures[0], pictures[1], "a BGRA surface's picture is not the RGBA one");
}
