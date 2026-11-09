import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { endsOf } from './despawn';
import { CUBE_STRIDE, TrackCursor } from './tracks';
import { parseAcmi } from './acmi';
import { gpuTrackStore } from '../render/gpuTracks/store';
import { isGreyed, isShown, visWords, withHidden } from '../render/gpuTracks/visibility';
import { hiddenAt } from './acmiFlags';
import { sliceBudget } from './slices';
import { MotionModel } from '../figures/motion';
import { defaultEventKinds, eventRows, eventText, splitEvent } from '../ui/replay/replayData';
import { recordingInfo } from '../ui/match/RecordingInfo';

interface Row {
  p: number;
  t: number;
  event?: string;
  visible?: number;
  disabled?: number;
  info?: string;
}

const cat = (name: string, values: string[]): AttributeColumn => {
  const labels = [...new Set(values)];
  return { name, kind: 'category', data: Uint32Array.from(values, (v) => labels.indexOf(v)), min: 0, max: labels.length - 1, categories: labels };
};

const num = (name: string, values: number[]): AttributeColumn => {
  const finite = values.filter(Number.isFinite);
  return { name, kind: 'number', data: Float32Array.from(values), min: Math.min(...finite), max: Math.max(...finite) };
};

function dataset(rows: Row[], persons: number): Dataset {
  rows = [...rows].sort((a, b) => a.t - b.t);
  const n = rows.length;
  return {
    id: 'acmi-flags',
    name: 'acmi-flags',
    count: n,
    px: Float32Array.from(rows, (r) => r.p * 10),
    py: Float32Array.from(rows, (r) => 100 + r.t),
    pz: new Float32Array(n),
    time: Float32Array.from(rows, (r) => r.t),
    personId: Uint32Array.from(rows, (r) => r.p),
    personLabels: Array.from({ length: persons }, (_, i) => `P${i}`),
    personShared: null,
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    sessionId: null,
    lifetime: null,
    yaw: null,
    pitch: null,
    timeSorted: true,
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 100, maxY: 200, maxZ: 1 },
    timeRange: [rows[0].t, rows[n - 1].t],
    attrs: [
      cat(
        'Event',
        rows.map((r) => r.event ?? ''),
      ),
      num(
        'Visible',
        rows.map((r) => r.visible ?? NaN),
      ),
      num(
        'Disabled',
        rows.map((r) => r.disabled ?? NaN),
      ),
      cat(
        'RecordingInfo',
        rows.map((r) => r.info ?? ''),
      ),
    ],
  } as unknown as Dataset;
}

const track = (p: number, from: number, to: number, dt: number, at?: (t: number) => Partial<Row>): Row[] => {
  const out: Row[] = [];
  for (let t = from; t <= to + 1e-9; t += dt) out.push({ p, t, ...(at ? at(t) : {}) });
  return out;
};

describe("ACMI's Visible and Disabled", () => {
  // P0 hidden from 3 s to 6 s; P1 out of combat from 5 s on; P2 plain.
  const d = dataset(
    [
      ...track(0, 0, 10, 0.5, (t) => ({ visible: t >= 3 && t < 6 ? 0 : 1 })),
      ...track(1, 0, 10, 0.5, (t) => (t >= 5 ? { disabled: 1 } : {})),
      ...track(2, 0, 10, 0.5),
    ],
    3,
  );
  const cubes = (t: number) => {
    const cursor = new TrackCursor(d);
    cursor.update(t);
    const c = cursor.buildCubes(t, true, 10, () => true, endsOf(d));
    const out = new Map<number, number[]>();
    for (let i = 0; i < c.count; i++) out.set(Math.round(c.data[i * CUBE_STRIDE] / 10), Array.from(c.data.subarray(i * CUBE_STRIDE + 3, i * CUBE_STRIDE + 6)));
    return out;
  };

  it('hides an object while Visible is 0, and shows it again after, without ending it', () => {
    expect([...cubes(2).keys()].sort()).toEqual([0, 1, 2]);
    expect([...cubes(4).keys()].sort()).toEqual([1, 2]);
    expect([...cubes(7).keys()].sort()).toEqual([0, 1, 2]);
  });

  it('greys a disabled object rather than removing it', () => {
    const before = cubes(4).get(1)!;
    const after = cubes(6).get(1)!;
    expect(after).toBeDefined();
    for (let c = 0; c < 3; c++) expect(after[c]).toBeCloseTo(before[c] * 0.5 + 0.25, 5);
  });

  it('hides the GPU track for the same span, sending new bits only when the hidden set changes', () => {
    const s = gpuTrackStore(d, { maxKeys: 1e9 })!;
    const track0 = Array.from(s.personOf).indexOf(0);
    expect(withHidden(s, d, null, 2)).toBeNull();
    const a = withHidden(s, d, null, 4);
    expect(isShown(a, track0)).toBe(false);
    expect(isShown(a, Array.from(s.personOf).indexOf(2))).toBe(true);
    expect(withHidden(s, d, null, 4.5)).toBe(a);
    // From 5 s P1 is out of combat: greyed bits after the shown ones, P1's set.
    const g = withHidden(s, d, null, 7)!;
    const words = visWords(s);
    expect(g.length).toBe(2 * words);
    expect(isGreyed(g, words, Array.from(s.personOf).indexOf(1))).toBe(true);
    expect(isGreyed(g, words, track0)).toBe(false);
    expect(isShown(g, track0)).toBe(true);
    expect(withHidden(s, d, null, 2)).toBeNull();
  });

  it('knows on the CPU when a person is hidden, for the unit list', () => {
    expect(hiddenAt(d, 0, 2)).toBe(false);
    expect(hiddenAt(d, 0, 4)).toBe(true);
    expect(hiddenAt(d, 0, 7)).toBe(false);
    expect(hiddenAt(d, 1, 4)).toBe(false);
  });

  it('builds the motion model a slice a frame once the viewer asks it to, the same model in the end', () => {
    const whole = new MotionModel(d);
    sliceBudget.ms = 0;
    try {
      const big = dataset([...track(0, 0, 400, 0.01), ...track(1, 0, 400, 0.01)], 2);
      let m = MotionModel.of(big);
      let frames = 1;
      for (; !m && frames < 10000; frames++) m = MotionModel.of(big);
      expect(frames).toBeGreaterThan(1);
      expect(m!.knots.length).toBe(new MotionModel(big).knots.length);
    } finally {
      sliceBudget.ms = Infinity;
    }
    expect(whole.knots.length).toBeGreaterThan(0);
  });
});

describe('ACMI events', () => {
  it('splits "Kind: text" into one kind and its words', () => {
    expect(splitEvent('Message: Maverick has violated ATC directives')).toEqual({ kind: 'Message', text: 'Maverick has violated ATC directives' });
    expect(splitEvent('hit_critical')).toEqual({ kind: 'hit_critical', text: '' });
    expect(eventText('SourceId:507|AmmoType:FOX2|AmmoCount:1|TargetId:201|Outcome:Kill')).toBe('FOX2 · 1 · Kill');
  });

  it('lists every message under one kind, and leaves removals and debug out by default', () => {
    const text = [
      'FileType=text/acmi/tacview',
      'FileVersion=2.2',
      '0,ReferenceTime=2026-10-20T20:29:10Z,Title=Test,Briefing=Fly north\\, then east,Category=Training',
      '#0',
      'a01,T=1|2|3000,Name=F-16C',
      '0,Event=Message|a01|Hello',
      '#1',
      '0,Event=Message|a01|Again',
      '0,Event=Bookmark|Landing practice',
      '0,Event=Debug|327 active planes',
      '0,Event=Timeout | SourceId:a01 | AmmoType:FOX2 | Outcome:Kill',
      '0,Event=LeftArea|a01|',
      '-a01',
    ].join('\n');
    const t = parseAcmi(text);
    const ev = t.data[t.columns.indexOf('Event')] as string[];
    expect(ev.filter(Boolean)).toEqual(['Message: Hello', 'Message: Again', 'Bookmark: Landing practice', 'Debug: 327 active planes', 'Timeout: SourceId:a01|AmmoType:FOX2|Outcome:Kill', 'LeftArea', 'Removed']);
    const rows: Row[] = ev.map((e, i) => ({ p: 0, t: i, event: e }));
    const ds = dataset(rows, 1);
    const er = eventRows(ds)!;
    expect(er.labels).toEqual(['Message', 'Message', 'Bookmark', 'Debug', 'Timeout', 'LeftArea', 'Removed']);
    expect(er.texts[0]).toBe('Hello');
    expect(defaultEventKinds(er.labels)).toEqual(['Message', 'Bookmark', 'Timeout', 'LeftArea']);
  });

  it('ends an object at LeftArea with its text', () => {
    const e = endsOf(dataset([...track(0, 0, 5, 1), { p: 0, t: 5.5, event: 'LeftArea: Viper left' }, ...track(1, 0, 10, 1)], 2));
    expect(e.end[0]).toBeCloseTo(5.5);
  });
});

describe("the recording's own properties", () => {
  it('reads the newest RecordingInfo for the Match tab', () => {
    const d = dataset(
      [
        { p: 0, t: 0, info: JSON.stringify({ Title: 'Test' }) },
        { p: 0, t: 1, info: JSON.stringify({ Title: 'Test', Briefing: 'Fly north', Comments: 'after' }) },
      ],
      1,
    );
    expect(recordingInfo(d, -1)).toEqual({ Title: 'Test', Briefing: 'Fly north', Comments: 'after' });
  });
});
