import { describe, expect, it } from 'vitest';
import { DatasetBuilder, type SourceBlock } from '../data/builder';
import { realDate } from '../data/series';
import { campaignObjectives } from './campaignObjectives';
import { zoneAt } from './objectives';
import { objectiveSources } from '../render/objectives';
import { campaignIndex } from '../../tools/campaign-files.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REAL0 = Date.parse('2026-11-01T06:00:00Z') / 1000;

/**
 * A session of a synthetic round: three places 10 km apart, four ground
 * units each, their sides as `sides` says, written at the session's start
 * and a minute later; an aircraft that holds no ground.
 */
function session(k: number, sides: ('Red' | 'Blue')[]): SourceBlock {
  const rows: { x: number; z: number; t: number; p: number; type: number; color: number }[] = [];
  const t0 = 1e9 + k * 1e7;
  sides.forEach((c, place) => {
    for (let u = 0; u < 4; u++) for (const dt of [0, 60]) rows.push({ x: place * 10000 + u * 50, z: 500, t: t0 + dt, p: place * 4 + u, type: 0, color: c === 'Red' ? 0 : 1 });
  });
  for (const dt of [0, 30, 60]) rows.push({ x: 4000 + dt * 100, z: 0, t: t0 + dt, p: 12, type: 1, color: 0 });
  rows.sort((a, b) => a.t - b.t);
  const n = rows.length;
  const real = REAL0 + k * 6 * 3600;
  return {
    rows: n,
    px: Float32Array.from(rows, (r) => r.x),
    py: new Float32Array(n),
    pz: Float32Array.from(rows, (r) => r.z),
    time: Float64Array.from(rows, (r) => r.t),
    timeIsAbsolute: true,
    yaw: null,
    pitch: null,
    personIds: Uint32Array.from(rows, (r) => r.p),
    personLabels: Array.from({ length: 13 }, (_, i) => `s${k} unit ${i}`),
    teamIds: Uint32Array.from(rows, (r) => r.color),
    teamLabels: ['Allies', 'Enemies'],
    sessionIds: new Uint32Array(n),
    sessionLabels: [`Test_North ${realDate(real)}`],
    attrs: [
      { name: 'campaign', kind: 'category', data: new Uint32Array(n), categories: ['Test North 1'] },
      { name: 'sessionStart', kind: 'number', data: new Float32Array(n).fill(real) },
      { name: 'Type', kind: 'category', data: Uint32Array.from(rows, (r) => r.type), categories: ['Ground+Vehicle+Armor', 'Air+FixedWing'] },
      { name: 'Color', kind: 'category', data: Uint32Array.from(rows, (r) => r.color), categories: ['Red', 'Blue'] },
    ],
    rejected: 0,
    sourceName: `s${k}.parquet`,
  };
}

describe('a campaign round’s places on the map', () => {
  // Place 1 changes hands Red to Blue before session 2; places 0 and 2 never do.
  const b = new DatasetBuilder();
  for (const [k, sides] of [[0, ['Red', 'Red', 'Blue']], [1, ['Red', 'Blue', 'Blue']], [2, ['Red', 'Blue', 'Blue']]] as const) b.append(session(k, [...sides]));
  const d = b.finish('round');

  it('makes the contested places capture zones, owned from each session’s start', () => {
    const co = campaignObjectives(d)!;
    expect(co.objectives).toHaveLength(1);
    const o = co.objectives[0];
    expect(o).toMatchObject({ type: 'capture_zone', layer: 'zones', ownerAtStart: 1 });
    // Its middle: the place's units, back in the data's own frame.
    expect(o.position[0]).toBeCloseTo(10075, 0);
    const tl = co.timeline.zones.get(o.letter)!;
    const s = d.series!.sessions;
    expect(zoneAt(tl, s[0].start + 10, o.ownerAtStart).owner).toBe(1);
    expect(zoneAt(tl, s[1].start + 10, o.ownerAtStart).owner).toBe(2);
    expect(co.timeline.events).toMatchObject([{ zone: o.letter, team: 2, kind: 'captured' }]);
    expect(co.ownerLabels).toEqual({ 1: 'Allies', 2: 'Enemies' });
  });

  it('is drawn for the series as its one battle, coloured by the coalitions’ teams', () => {
    const co = campaignObjectives(d)!;
    const src = objectiveSources(d, [{ match: co.match, objectives: co.objectives, ownerLabels: co.ownerLabels }], { [co.match]: co.timeline }, [], -1);
    expect(src).toHaveLength(1);
    expect(src[0].ownerLabels).toEqual({ 1: 'Allies', 2: 'Enemies' });
    expect(src[0].timeline).toBe(co.timeline);
  });
});

describe('a round’s recordings on this machine', () => {
  it('finds a round’s sessions by their recording names, serves only those, and counts the ones not here', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heat3d-campaign-'));
    const rec = path.join(dir, 'rec', 'North');
    fs.mkdirSync(rec, { recursive: true });
    fs.writeFileSync(path.join(rec, 'Tacview-a.3dheat'), 'a');
    fs.writeFileSync(path.join(rec, 'Tacview-b.3dheat'), 'bb');
    fs.mkdirSync(path.join(dir, 'rounds'));
    fs.writeFileSync(
      path.join(dir, 'rounds', 'test-rounds.json'),
      JSON.stringify({ format: 'heat3d-dcs-rounds', version: 1, server: 'Test', source: 't', rounds: [{ id: 1, campaign: 'Test North 1', start: '2026-11-01T00:00:00Z', sessions: [{ start: '2026-11-01T00:00:00Z', file: 'Tacview-a.zip.acmi' }, { start: '2026-11-01T06:00:00Z', file: 'Tacview-c.zip.acmi' }, { start: '2026-11-01T12:00:00Z', file: 'Tacview-b.zip.acmi' }] }] }),
    );
    const idx = campaignIndex({ rounds: path.join(dir, 'rounds'), recordings: [path.join(dir, 'rec')] });
    const r = idx.round('Test North 1')!;
    expect(r.sessions.map((s) => [s.n, s.name, s.bytes])).toEqual([[1, 'Tacview-a.3dheat', 1], [3, 'Tacview-b.3dheat', 2]]);
    expect(r.missing).toBe(1);
    expect(idx.file(r.sessions[1].id)).toBe(path.join(rec, 'Tacview-b.3dheat'));
    expect(idx.file(99)).toBeNull();
    expect(idx.round('Other 1')).toBeNull();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
