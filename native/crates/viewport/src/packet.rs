//! One frame from the page, as `src/render/native/framePacket.ts` writes it:
//! a header (magic, version, sequence, section count), then sections, each a
//! tag, its length in words and its words.

use anyhow::{bail, ensure, Result};

use crate::generated::*;

#[derive(Clone)]
pub struct PlanEntry {
    pub chunk: u32,
    pub min_row: u32,
    pub max_row: u32,
    /// Chunk-relative first row of each block.
    pub starts: Vec<u32>,
}

#[derive(Clone)]
pub struct Filter {
    /// The core's name for the column.
    pub column: String,
    pub key: String,
}

#[derive(Clone)]
pub struct FilterSet {
    pub generation: u32,
    pub filters: Vec<Filter>,
    /// `packFilterTable` (src/render/filterTables.ts).
    pub table: Vec<u32>,
}

impl FilterSet {
    pub fn keys(&self) -> Vec<String> {
        self.filters.iter().map(|f| f.key.clone()).collect()
    }
}

#[derive(Clone, Default)]
pub struct Packet {
    pub seq: u32,
    pub frame: Option<Vec<f32>>,
    pub plan: Vec<PlanEntry>,
    /// RGBA8, `LUT_WIDTH` x `LUT_HEIGHT`.
    pub color_lut: Option<Vec<u8>>,
    pub curve_lut: Option<Vec<f32>>,
    pub signs: Option<Vec<f32>>,
    pub filters: Option<FilterSet>,
    pub volumes: Option<Vec<f32>>,
    /// The difference split's column and the value weight's (core names, empty for none).
    pub values: Option<(String, String)>,
    /// The figures this frame: per batch its mesh id and instance count, the instances end to end
    /// (`INSTANCE_STRIDE` floats each, relative to `F_ORIGIN`).
    pub figures: Vec<(u32, u32)>,
    pub instances: Vec<f32>,
    /// The box replay's cubes, eight floats each.
    pub cubes: Vec<f32>,
    /// The scene's triangles, trails and overlay lines, seven floats a vertex (xyz, rgba).
    pub tris: Vec<f32>,
    pub trails: Vec<f32>,
    pub overlay: Vec<f32>,
    /// The far-off glyphs the CPU placed: style, mode, ticks, the sides' colours (64 floats), the
    /// instances (`INSTANCE_STRIDE` floats each).
    pub glyphs: Option<Glyphs>,
    /// The objectives' marks and the lines over the finished picture.
    pub top: Option<Top>,
    /// The capture zones' discs, the spawn marks and the volumes' contours (`SECTION_OVERLAYS`).
    pub overlays: Option<Overlays>,
    /// The engagement ranges (`SECTION_RANGES`).
    pub ranges: Option<Ranges>,
    /// The GPU tracks' frame (`SECTION_TRACKS`).
    pub tracks: Option<TracksFrame>,
}

/// `SECTION_TRACKS`: the store's id, the place shader's uniform, the visibility bits when they changed.
#[derive(Clone, Default)]
pub struct TracksFrame {
    pub id: u32,
    /// `TRACKS_UNIFORM_BYTES / 4` words.
    pub uniform: Vec<u32>,
    pub vis: Option<Vec<u32>>,
}

/// `SECTION_RANGES`: the page packs every uniform; the shell mesh comes once.
#[derive(Clone, Default)]
pub struct Ranges {
    pub count: u32,
    pub cone_start: u32,
    /// Vertices of the sphere and of the cone in the mesh.
    pub sphere: u32,
    pub cone: u32,
    pub mesh: Option<Vec<f32>>,
    /// `SHELL_UNIFORM_BYTES`.
    pub shell_uniform: Vec<f32>,
    /// `SHELL_FLOATS` each.
    pub instances: Vec<f32>,
    /// `GROUND_UNIFORM_BYTES`, when the ground is shaded.
    pub ground: Option<Vec<f32>>,
    /// The faces to take this frame: layer, its capture uniforms (16 floats).
    pub captures: Vec<(u32, Vec<f32>)>,
}

/// `SECTION_OVERLAYS`. The kept arrays (the zones' vertices, the spawn instances) come only when new.
#[derive(Clone, Default)]
pub struct Overlays {
    pub zones: Option<Zones>,
    pub spawns: Option<Spawns>,
    pub contours: Option<Contours>,
}

/// The capture zones' discs (`FrameParams.objectiveZones`, `zoneShaders.ts`).
#[derive(Clone, Default)]
pub struct Zones {
    /// On the ground in the scene as well (depth tested).
    pub ground: bool,
    pub xray: f32,
    /// The smallest radius drawn, device pixels.
    pub min_px: f32,
    pub count: u32,
    /// `MAX_ZONES * ZONE_STATE_FLOATS`.
    pub state: Vec<f32>,
    pub verts: Option<Vec<f32>>,
}

/// The layout's spawn points (`FrameParams.spawnMarks`, `spawnMarks.ts`).
#[derive(Clone, Default)]
pub struct Spawns {
    pub count: u32,
    pub lines: bool,
    pub dpr: f32,
    pub data: Option<Vec<f32>>,
}

/// Where the volumes cut the level (`FrameParams.volumeContours`, `volumeContours.ts`).
#[derive(Clone, Default)]
pub struct Contours {
    /// `VOLUME_BLOCK_FLOATS`.
    pub block: Vec<f32>,
    /// `MAX_GPU_VOLUMES` x rgba.
    pub colors: Vec<f32>,
    /// The inverse of the frame's view-projection.
    pub inv: Vec<f32>,
}

/// `SECTION_TOP`: seven floats a vertex throughout. The kept arrays come only when new.
#[derive(Clone, Default)]
pub struct Top {
    pub lines: Vec<f32>,
    pub static_version: u32,
    pub static_count: u32,
    pub static_data: Option<Vec<f32>>,
    pub tris_count: u32,
    pub tris_data: Option<Vec<f32>>,
    pub ground_count: u32,
    pub ground_data: Option<Vec<f32>>,
    /// The objectives drawn under the units, in the scene (`FrameParams.objectivesUnder`).
    pub under: bool,
    pub under_lines: Vec<f32>,
}

#[derive(Clone, Default)]
pub struct Glyphs {
    pub style: f32,
    pub mode: f32,
    pub ticks: f32,
    pub sides: Vec<f32>,
    pub instances: Vec<f32>,
}

impl Packet {
    /// One of the frame's numbers, by its `F_*` index.
    pub fn f(&self, at: usize) -> f32 {
        self.frame.as_ref().map_or(0.0, |f| f[at])
    }

    pub fn flag(&self, at: usize) -> bool {
        self.f(at) > 0.5
    }
}

struct Words<'a> {
    w: &'a [u32],
    at: usize,
}

impl<'a> Words<'a> {
    fn take(&mut self) -> Result<u32> {
        ensure!(self.at < self.w.len(), "packet ends early");
        self.at += 1;
        Ok(self.w[self.at - 1])
    }

    fn slice(&mut self, n: usize) -> Result<&'a [u32]> {
        ensure!(self.at + n <= self.w.len(), "packet ends early");
        self.at += n;
        Ok(&self.w[self.at - n..self.at])
    }

    fn string(&mut self) -> Result<String> {
        let len = self.take()? as usize;
        let words = self.slice(len.div_ceil(4))?;
        let bytes: &[u8] = bytemuck::cast_slice(words);
        Ok(String::from_utf8_lossy(&bytes[..len]).into_owned())
    }
}

pub fn decode(bytes: &[u8]) -> Result<Packet> {
    ensure!(bytes.len() % 4 == 0 && bytes.len() >= 16, "not a frame packet");
    let words: Vec<u32> = bytes.chunks_exact(4).map(|b| u32::from_le_bytes([b[0], b[1], b[2], b[3]])).collect();
    ensure!(words[0] == PACKET_MAGIC, "not a frame packet");
    ensure!(words[1] == PACKET_VERSION, "frame packet version {} (this viewport reads {})", words[1], PACKET_VERSION);
    let mut p = Packet { seq: words[2], ..Default::default() };
    let sections = words[3];
    let mut r = Words { w: &words, at: 4 };
    for _ in 0..sections {
        let tag = r.take()?;
        let len = r.take()? as usize;
        let body = r.slice(len)?;
        let mut s = Words { w: body, at: 0 };
        match tag {
            SECTION_FRAME => {
                ensure!(len >= FRAME_WORDS, "frame section of {len} words");
                p.frame = Some(body[..FRAME_WORDS].iter().map(|w| f32::from_bits(*w)).collect());
            }
            SECTION_PLAN => {
                let n = s.take()?;
                for _ in 0..n {
                    let chunk = s.take()?;
                    let min_row = s.take()?;
                    let max_row = s.take()?;
                    let _blocks = s.take()?;
                    let mode = s.take()?;
                    let count = s.take()? as usize;
                    let mut starts = Vec::new();
                    if mode == 1 {
                        for _ in 0..count {
                            let first = s.take()?;
                            let k = s.take()?;
                            starts.extend((0..k).map(|i| first + i * SAMPLE_BLOCK));
                        }
                    } else {
                        starts.extend_from_slice(s.slice(count)?);
                    }
                    p.plan.push(PlanEntry { chunk, min_row, max_row, starts });
                }
            }
            SECTION_COLOR_LUT => p.color_lut = Some(bytemuck::cast_slice::<u32, u8>(body).to_vec()),
            SECTION_CURVE_LUT => p.curve_lut = Some(body.iter().map(|w| f32::from_bits(*w)).collect()),
            SECTION_SIGNS => p.signs = Some(body.iter().map(|w| f32::from_bits(*w)).collect()),
            SECTION_VOLUMES => p.volumes = Some(body.iter().map(|w| f32::from_bits(*w)).collect()),
            SECTION_VALUES => {
                let split = s.string()?;
                let weight = s.string()?;
                p.values = Some((split, weight));
            }
            SECTION_FILTERS => {
                let generation = s.take()?;
                let n = s.take()?;
                let mut filters = Vec::new();
                for _ in 0..n {
                    let column = s.string()?;
                    let key = s.string()?;
                    filters.push(Filter { column, key });
                }
                let len = s.take()? as usize;
                let table = s.slice(len)?.to_vec();
                p.filters = Some(FilterSet { generation, filters, table });
            }
            SECTION_FIGURES => {
                let n = s.take()?;
                for _ in 0..n {
                    let mesh = s.take()?;
                    let count = s.take()?;
                    let words = s.slice(count as usize * INSTANCE_STRIDE as usize)?;
                    p.figures.push((mesh, count));
                    p.instances.extend(words.iter().map(|w| f32::from_bits(*w)));
                }
            }
            SECTION_GEOMETRY => {
                for out in [&mut p.tris, &mut p.trails, &mut p.overlay] {
                    let n = s.take()? as usize;
                    *out = s.slice(n * 7)?.iter().map(|w| f32::from_bits(*w)).collect();
                }
            }
            SECTION_SYMBOLS => {
                let f = |w: &[u32]| w.iter().map(|x| f32::from_bits(*x)).collect::<Vec<f32>>();
                let head = f(s.slice(3)?);
                let sides = f(s.slice(64)?);
                let n = s.take()? as usize;
                let instances = f(s.slice(n * INSTANCE_STRIDE as usize)?);
                p.glyphs = Some(Glyphs { style: head[0], mode: head[1], ticks: head[2], sides, instances });
            }
            SECTION_TOP => {
                let f = |w: &[u32]| w.iter().map(|x| f32::from_bits(*x)).collect::<Vec<f32>>();
                let mut t = Top::default();
                let n = s.take()? as usize;
                t.lines = f(s.slice(n * 7)?);
                t.static_version = s.take()?;
                t.static_count = s.take()?;
                if s.take()? == 1 {
                    t.static_data = Some(f(s.slice(t.static_count as usize * 7)?));
                }
                t.tris_count = s.take()?;
                if s.take()? == 1 {
                    t.tris_data = Some(f(s.slice(t.tris_count as usize * 7)?));
                }
                t.ground_count = s.take()?;
                if s.take()? == 1 {
                    t.ground_data = Some(f(s.slice(t.ground_count as usize * 7)?));
                }
                t.under = s.take()? == 1;
                let n = s.take()? as usize;
                t.under_lines = f(s.slice(n * 7)?);
                p.top = Some(t);
            }
            SECTION_OVERLAYS => {
                let f = |w: &[u32]| w.iter().map(|x| f32::from_bits(*x)).collect::<Vec<f32>>();
                let mut o = Overlays::default();
                if s.take()? == 1 {
                    let ground = s.take()? == 1;
                    let head = f(s.slice(2)?);
                    let count = s.take()?;
                    let state = f(s.slice((MAX_ZONES * ZONE_STATE_FLOATS) as usize)?);
                    let verts = if s.take()? == 1 { Some(f(s.slice(count as usize * ZONE_VERTEX_FLOATS as usize)?)) } else { None };
                    o.zones = Some(Zones { ground, xray: head[0], min_px: head[1], count, state, verts });
                }
                let count = s.take()?;
                if count > 0 {
                    let lines = s.take()? == 1;
                    let dpr = f32::from_bits(s.take()?);
                    let data = if s.take()? == 1 { Some(f(s.slice(count as usize * SPAWN_INSTANCE_FLOATS as usize)?)) } else { None };
                    o.spawns = Some(Spawns { count, lines, dpr, data });
                }
                if s.take()? == 1 {
                    let block = f(s.slice(VOLUME_BLOCK_FLOATS as usize)?);
                    let colors = f(s.slice(MAX_GPU_VOLUMES as usize * 4)?);
                    let inv = f(s.slice(16)?);
                    o.contours = Some(Contours { block, colors, inv });
                }
                p.overlays = Some(o);
            }
            SECTION_RANGES => {
                let f = |w: &[u32]| w.iter().map(|x| f32::from_bits(*x)).collect::<Vec<f32>>();
                let mut r = Ranges { count: s.take()?, cone_start: s.take()?, sphere: s.take()?, cone: s.take()?, ..Default::default() };
                if s.take()? == 1 {
                    let n = s.take()? as usize;
                    r.mesh = Some(f(s.slice(n)?));
                }
                r.shell_uniform = f(s.slice(SHELL_UNIFORM_BYTES as usize / 4)?);
                r.instances = f(s.slice(r.count as usize * SHELL_FLOATS as usize)?);
                if s.take()? == 1 {
                    r.ground = Some(f(s.slice(GROUND_UNIFORM_BYTES as usize / 4)?));
                }
                let n = s.take()?;
                for _ in 0..n {
                    let layer = s.take()?;
                    r.captures.push((layer, f(s.slice(16)?)));
                }
                p.ranges = Some(r);
            }
            SECTION_TRACKS => {
                let id = s.take()?;
                let uniform = s.slice(TRACKS_UNIFORM_BYTES as usize / 4)?.to_vec();
                let n = s.take()? as usize;
                let vis = (n > 0).then(|| s.slice(n).map(|v| v.to_vec())).transpose()?;
                p.tracks = Some(TracksFrame { id, uniform, vis });
            }
            SECTION_CUBES => {
                let n = s.take()? as usize;
                p.cubes = s.slice(n * 8)?.iter().map(|w| f32::from_bits(*w)).collect();
            }
            _ => bail!("unknown section {tag}"),
        }
    }
    Ok(p)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn plan_runs_expand() {
        let mut w = vec![PACKET_MAGIC, PACKET_VERSION, 9, 1, SECTION_PLAN, 0];
        let body = [1u32, 3, 12, 4096 * 3, 3, 1, 1, 12, 3];
        w[5] = body.len() as u32;
        w.extend_from_slice(&body);
        let bytes: Vec<u8> = w.iter().flat_map(|x| x.to_le_bytes()).collect();
        let p = decode(&bytes).unwrap();
        assert_eq!(p.seq, 9);
        assert_eq!(p.plan[0].chunk, 3);
        assert_eq!(p.plan[0].starts, vec![12, 12 + 4096, 12 + 8192]);
    }
}
