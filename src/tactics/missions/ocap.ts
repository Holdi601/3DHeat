/**
 * An OCAP recording (`data/ocap.ts`: Arma 3's OCAP and OCAP2, OCAP2's
 * recorder for Arma Reforger, 3DHeat's own Reforger recorder) as the board's
 * starting state: every group of units where the recording first saw them,
 * its leader's path as its route (a point a minute, when it moved), every
 * vehicle where it first stood, on the side of its first crew, and the
 * markers with a text as places.
 *
 * Board coordinates are the heat view's for the same recording: Arma 3's
 * north is -z (as for mission.sqm), Reforger's the engine's +z, the frame of
 * the Reforger levels.
 */

import { firstPlaceOf, NotOcapError, ocapText, pathOf, readOcapDocument, type RawEntity } from '../../data/ocap';
import { armaWorldOf } from '../../data/armaWorlds';
import { arma3RealVehicle, reforgerUnitId } from '../../data/armaUnits';
import { SIDES, sideOf } from './arma';
import type { MissionGroup, MissionImporter, MissionPlace, MissionState, MissionUnit, UnitCategory } from './index';

/** OCAP's vehicle classes as the board's categories and the figure each stands for when its name says nothing. */
const CLASS: Record<string, { category: UnitCategory; figure?: string }> = {
  car: { category: 'ground', figure: 'jeep' },
  truck: { category: 'ground', figure: 'truck' },
  apc: { category: 'ground', figure: 'apc-wheeled' },
  tank: { category: 'ground', figure: 'mbt' },
  heli: { category: 'heli' },
  plane: { category: 'air' },
  sea: { category: 'sea', figure: 'patrol-boat' },
  'static-weapon': { category: 'ground', figure: 'emplacement-gun' },
  'static-mortar': { category: 'ground', figure: 'emplacement-gun' },
  parachute: { category: 'infantry', figure: 'soldier' },
};

/** Reads a recording into a mission: the frame each entity first shows up in is its starting place. */
export function readOcapMission(text: string, name: string): MissionState {
  const { doc, reforger } = readOcapDocument(text);
  const delay = doc.captureDelay! > 0 ? doc.captureDelay! : 1;
  // Board world: east, height, then north as -z (Arma 3) or +z (Reforger).
  const at = (p: { x: number; y: number; z: number }) => ({
    x: p.x,
    y: p.z,
    z: reforger ? p.y : -p.y,
  });
  const yawOf = (dir: number) => ((reforger ? 180 - dir : dir) * Math.PI) / 180;
  const ents = (doc.entities ?? []).filter((e): e is RawEntity => !!e && typeof e === 'object' && typeof e.id === 'number');
  const byId = new Map(ents.map((e) => [e.id!, e]));
  const groups = new Map<string, MissionGroup & { leader: RawEntity }>();
  const notes: string[] = [];
  for (const e of ents) {
    const first = firstPlaceOf(e, reforger);
    if (!first) continue;
    if (e.type === 'unit') {
      const side = sideOf(e.side ?? '');
      const key = `${side}|${e.group || e.name}`;
      const unit: MissionUnit = {
        name: e.name || `#${e.id}`,
        type: e.role || 'Rifleman',
        category: 'infantry',
        figure: 'soldier',
        at: at(first),
        yaw: yawOf(first.dir),
        ...(e.isPlayer ? { player: true } : {}),
      };
      const g = groups.get(key);
      if (g) g.units.push(unit);
      else
        groups.set(key, {
          name: e.group || e.name || `Group ${groups.size + 1}`,
          side,
          category: 'infantry',
          units: [unit],
          route: [],
          leader: e,
        });
    } else if (e.type === 'vehicle') {
      const cls = CLASS[e.class ?? ''] ?? {
        category: 'ground' as UnitCategory,
      };
      const real = reforger ? reforgerUnitId(e.prefab ?? '') || reforgerUnitId(e.name ?? '') : arma3RealVehicle(e.name ?? '', e.class ?? '');
      // On the side of its first crew, as OCAP's own player has it; an empty one is civilian.
      let side = e.side ?? '';
      for (const r of e.positions ?? []) {
        const crew = Array.isArray(r) && Array.isArray(r[3]) ? (r[3] as unknown[]).filter((c): c is number => typeof c === 'number') : [];
        const s = crew.map((c) => byId.get(c)?.side).find(Boolean);
        if (s) {
          side = s;
          break;
        }
      }
      const unit: MissionUnit = {
        name: e.name || `#${e.id}`,
        type: real || e.name || e.class || 'vehicle',
        category: cls.category,
        ...(cls.figure ? { figure: cls.figure } : {}),
        at: at(first),
        yaw: yawOf(first.dir),
      };
      groups.set(`v|${e.id}`, {
        name: unit.name,
        side: side ? sideOf(side) : 'civ',
        category: cls.category,
        units: [unit],
        route: [],
        leader: e,
      });
    }
  }
  // Routes: the leader's path, a point a minute where it moved 25 m or more.
  const step = Math.max(1, Math.round(60 / delay));
  for (const g of groups.values()) {
    const path = pathOf(g.leader, reforger, step);
    const pts: MissionGroup['route'] = [];
    let last: { x: number; y: number; z: number } | null = null;
    for (const [f, x, y, z] of path) {
      const p = at({ x, y, z });
      if (last && Math.hypot(p.x - last.x, p.z - last.z) < 25) continue;
      pts.push({ at: p, eta: f * delay });
      last = p;
      if (pts.length >= 60) break;
    }
    g.route = pts.length > 1 ? pts : [];
  }
  // The markers someone wrote on: their first place.
  const places: MissionPlace[] = [];
  for (const m of doc.Markers ?? []) {
    if (!Array.isArray(m) || typeof m[1] !== 'string' || !m[1].trim() || !Array.isArray(m[7])) continue;
    const pos = (m[7] as unknown[]).find((p) => Array.isArray(p) && Array.isArray(p[1])) as unknown[] | undefined;
    const p = pos ? (pos[1] as number[]) : null;
    if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
    const xyz = reforger ? { x: p[0], y: p[2] ?? 0, z: p[1] ?? 0 } : { x: p[0], y: p[1], z: p[2] ?? 0 };
    places.push({
      name: m[1],
      kind: /flag|objective|end/i.test(String(m[0])) ? 'objective' : 'marker',
      at: at(xyz),
      text: m[1],
    });
  }
  const list = [...groups.values()].map(({ leader: _leader, ...g }) => g);
  const used = new Set(list.map((g) => g.side));
  const world = armaWorldOf(doc.worldName ?? '', reforger);
  if (!list.length) notes.push('the recording has no units');
  return {
    format: 'ocap',
    game: 'arma',
    title: doc.missionName || name.replace(/\.jsonl?(\.gz)?$/i, ''),
    map: world ? `${reforger ? 'Arma Reforger' : 'Arma 3'}: ${world.name}` : '',
    sides: SIDES.filter((s) => used.has(s.id) || s.id !== 'civ').map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
    })),
    groups: list,
    places,
    notes,
  };
}

export const ocapRecording: MissionImporter = {
  id: 'ocap',
  name: 'Arma recording (OCAP)',
  accepts: (name) => /\.json(\.gz)?$|\.jsonl$/.test(name),
  read: async (bytes, name) => {
    const text = await ocapText(new Blob([bytes as BlobPart]));
    try {
      return readOcapMission(text, name.split(/[\\/]/).pop() ?? name);
    } catch (e) {
      if (e instanceof NotOcapError) throw new Error(`"${name}" is no OCAP recording`);
      throw e;
    }
  },
};
