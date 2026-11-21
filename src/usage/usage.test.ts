import { beforeEach, describe, expect, it } from 'vitest';
import { has } from '../i18n';
import { batches, drain, record, useUsage, _buffer } from './recorder';
import { checkBatch, checkEvent, fileType, fileTypesId, LIMITS, rowsBucket, validId, type UsageEvent } from './schema';
import { noteError, noteOpen, notePaletteDone, notePaletteOpen, notePick, noteSet, noteStep, noteUndo, noteUse, takePick } from './hooks';
import { featureOfCommand } from './features';
import { buildReport, formatReport, toFix, type IndexEntry } from './report';
import { extraFeatures } from './extras';

const base = { t: 1_800_000_000_000, s: 'abcdef012345' };
const ev = (e: Partial<UsageEvent>): UsageEvent => ({ ...base, k: 'use', ...e }) as UsageEvent;

describe('usage schema', () => {
  it('takes the events the recorder makes', () => {
    expect(checkEvent(ev({ id: 'cmd:play', src: 'key', ws: 'heat', n: 1 }))).toBeNull();
    expect(checkEvent(ev({ k: 'use', id: 'ctl:heat.measurePanel.title/heat.measurePanel.active', src: 'button', n: 3, sc: 2, dev: 1 }), has)).toBeNull();
    expect(checkEvent(ev({ k: 'session', v: 'webgpu', id: 'scr:1920x1080' }))).toBeNull();
    expect(checkEvent(ev({ k: 'load', v: 'drop', id: 'data:csv+parquet', n: 6, ms: 1200 }))).toBeNull();
    expect(checkEvent(ev({ k: 'search', n: 0, q: 'where is the ruler' }))).toBeNull();
    expect(checkEvent(ev({ k: 'feedback', id: 'cmd:play', v: 'wish', note: 'a second line\nis fine' }))).toBeNull();
    expect(checkEvent(ev({ k: 'friction', v: 'dead', id: 'cmd:frame' }))).toBeNull();
  });

  it('refuses anything else', () => {
    expect(checkEvent({ ...ev({}), file: 'x' })).toBe('field file');
    expect(checkEvent(ev({ k: 'nope' as never }))).toBe('k');
    expect(checkEvent(ev({ s: 'NOT-HEX' }))).toBe('s');
    expect(checkEvent(ev({ src: 'mouse' as never }))).toBe('src');
    expect(checkEvent(ev({ ws: 'elsewhere' }))).toBe('ws');
    expect(checkEvent(ev({ n: 1.5 }))).toBe('n');
    expect(checkEvent(ev({ v: 'Some Value' }))).toBe('v');
    expect(checkEvent(ev({ k: 'friction', v: 'annoyed', id: 'cmd:play' }))).toBe('friction kind');
    expect(checkEvent(ev({ k: 'pick', v: 'ftp' }))).toBe('load method');
  });

  it('keeps the user\'s words only where they belong', () => {
    // A search's words only when it found nothing; feedback's note only on feedback.
    expect(checkEvent(ev({ k: 'search', n: 3, q: 'ruler' }))).toBe('q');
    expect(checkEvent(ev({ k: 'use', id: 'cmd:play', q: 'x' }))).toBe('q');
    expect(checkEvent(ev({ k: 'use', id: 'cmd:play', note: 'x' }))).toBe('note');
    expect(checkEvent(ev({ k: 'search', n: 0, q: 'a\u0007b' }))).toBe('q');
    expect(checkEvent(ev({ k: 'search', n: 0, q: 'x'.repeat(LIMITS.q + 1) }))).toBe('q');
    expect(checkEvent(ev({ k: 'feedback', id: 'cmd:play', v: 'wish', note: 'x'.repeat(LIMITS.note + 1) }))).toBe('note');
  });
});

describe('usage privacy: no content can be recorded', () => {
  const contents = [
    'C:\\Users\\someone\\exports\\movement.parquet',
    'exports/folder-a/movement.parquet',
    '/home/me/levels/Some_Map.glb',
    'movement.parquet',
    'match_2026-11-07.wrpl',
    'Tacview-20261107.zip.acmi',
    'Some Level Name',
    'PlayerOne',
    '12345.678',
  ];

  it('no id can carry a path, a file name, a name or a value', () => {
    for (const c of contents)
      for (const p of ['ctl:', 'sec:', 'cmd:', 'data:', 'err:', 'area:', 'scr:'])
        for (const id of [`${p}${c}`, `${p}heat.measurePanel.title/${c}`]) expect(validId(id, has), id).toBe(false);
    // Section and control ids are message keys, nothing else.
    expect(validId('sec:PlayerOne', has)).toBe(false);
    expect(validId('ctl:heat.measurePanel.title/PlayerOne', has)).toBe(false);
    expect(validId('sec:heat.measurePanel.title', has)).toBe(true);
    // A message key that ends like a file is still a key.
    expect(validId('ctl:replay.events.csv/replay.stats.csv', has)).toBe(true);
    expect(validId('ctl:replay.events.csv/replay.stats.csv')).toBe(false);
  });

  it('file types are kept, file names are not', () => {
    expect(fileType('C:/x/y/movement.parquet')).toBe('parquet');
    expect(fileType('a.zip.acmi')).toBe('acmi');
    expect(fileType('secret.weird')).toBe('other');
    expect(fileTypesId(['a.parquet', 'b.csv', 'c.parquet'])).toBe('data:csv+parquet');
  });

  it('what the hooks record holds none of the content they were handed', () => {
    useUsage.getState().setChoice('on');
    _buffer.length = 0;
    notePick('files', contents);
    notePick('drop', contents.slice(0, 3));
    noteUse('cmd:play');
    noteUse(`ctl:${contents[0]}`);
    noteSet('sec:Some Level Name', 'on');
    noteOpen('sec:heat.measurePanel.title', true);
    noteOpen('sec:heat.measurePanel.title', false);
    notePaletteDone('heatmap', 12, 'cmd:play');
    noteError('error', 'err:toast');
    record({ k: 'use', id: 'cmd:play', v: contents[6] } as never);
    const kept = drain();
    expect(kept.length).toBeGreaterThan(4);
    const text = JSON.stringify(kept);
    for (const c of contents) expect(text, c).not.toContain(c);
    for (const frag of ['exports', 'movement', 'Users', 'Some_Map', 'PlayerOne', 'Level Name', '\\\\', '/home']) expect(text, frag).not.toContain(frag);
    // The ones with content were dropped and counted.
    expect(useUsage.getState().dropped).toBeGreaterThanOrEqual(3);
    for (const e of kept) expect(checkEvent(e, has)).toBeNull();
    useUsage.getState().setChoice(null);
  });

  it('nothing is recorded while off', () => {
    useUsage.getState().setChoice('off');
    _buffer.length = 0;
    noteUse('cmd:play');
    notePick('files', ['a.csv']);
    record({ k: 'use', id: 'cmd:frame' });
    expect(_buffer.length).toBe(0);
    expect(drain()).toEqual([]);
    useUsage.getState().setChoice(null);
  });
});

describe('usage recording', () => {
  beforeEach(() => {
    useUsage.getState().setChoice('on');
    // A use starts the step count again.
    noteUse('cmd:play');
    _buffer.length = 0;
    drain();
  });

  it('counts the steps to a feature and starts again after it', () => {
    noteStep();
    noteOpen('sec:heat.measurePanel.title', true);
    noteUse('cmd:frame');
    noteUse('cmd:play');
    const uses = drain().filter((e) => e.k === 'use');
    expect(uses.map((e) => e.n)).toEqual([3, 1]);
  });

  it('tells friction: closed at once, undone, searched again, wandered', () => {
    noteOpen('panel:sheet', true);
    noteOpen('panel:sheet', false);
    noteUse('cmd:frame');
    noteUndo();
    notePaletteDone('ruler', 0, null);
    notePaletteOpen();
    noteStep();
    noteStep();
    noteStep();
    notePaletteDone('measure', 4, 'ctl:heat.measurePanel.title/heat.measurePanel.active');
    const out = drain();
    const kinds = out.filter((e) => e.k === 'friction').map((e) => `${e.v} ${e.id}`);
    expect(kinds).toEqual(['quick-close panel:sheet', 'undo cmd:frame', 'repeat-search panel:palette', 'lost ctl:heat.measurePanel.title/heat.measurePanel.active']);
    const miss = out.find((e) => e.k === 'search' && e.n === 0);
    expect(miss?.q).toBe('ruler');
    expect(out.find((e) => e.k === 'search' && e.n === 4)?.q).toBeUndefined();
  });

  it('a pick waits for its load', () => {
    notePick('generator', [], { dev: true });
    expect(takePick()?.method).toBe('generator');
    expect(takePick()).toBeNull();
    expect(drain()[0]).toMatchObject({ k: 'pick', v: 'generator', dev: 1 });
  });

  it('batches stay inside the server\'s limits and pass its check', () => {
    const many: UsageEvent[] = Array.from({ length: 5000 }, (_, i) => ev({ id: 'cmd:play', n: i % 50 }));
    const parts = batches(many);
    expect(parts.length).toBeGreaterThan(2);
    let total = 0;
    for (const p of parts) {
      expect(p.length).toBeLessThanOrEqual(LIMITS.bytes);
      const got = checkBatch(JSON.parse(p), has);
      expect(typeof got).not.toBe('string');
      total += (got as UsageEvent[]).length;
    }
    expect(total).toBe(5000);
    expect(checkBatch({ v: 1, events: [ev({ id: 'sec:Not A Key' })] }, has)).toMatch(/^event 0/);
    expect(checkBatch({ v: 2, events: [ev({})] })).toBe('version');
    expect(checkBatch({ v: 1, events: [], extra: 1 })).toBe('fields');
  });

  it('palette commands count as the control or key they run', () => {
    expect(featureOfCommand('action.play', 'heat')).toBe('cmd:play');
    expect(featureOfCommand('action.notes', 'heat')).toBe('cmd:notesPanel');
    expect(featureOfCommand('action.chart.add.v7', 'heat')).toBe('cmd:chart.add');
    expect(featureOfCommand('camera.Iso NE', 'heat')).toBe('cam:isoNE');
    expect(featureOfCommand('task.load', 'race')).toBe('task:race.load');
    expect(featureOfCommand('view.1234-abcd', 'heat')).toBe('cmd:view.apply');
    expect(featureOfCommand('setting.heat|heat.measurePanel.title|heat.measurePanel.active', 'heat')).toBe('ctl:heat.measurePanel.title/heat.measurePanel.active');
    expect(featureOfCommand('section.heat|heat.measurePanel.title|', 'heat')).toBe('sec:heat.measurePanel.title');
  });
});

describe('usage report', () => {
  const index: IndexEntry[] = [
    { tab: 'heat', path: ['a.sec'], label: 'a.broken' },
    { tab: 'heat', path: ['a.sec'], label: 'a.confusing' },
    { tab: 'heat', path: ['a.sec'], label: 'a.unclear' },
    { tab: 'race', path: ['b.sec', 'b.inner'], label: 'b.deep', more: true },
    { tab: 'heat', path: ['a.sec'], label: 'a.hidden' },
    { tab: 'heat', path: ['a.sec'], label: 'a.seen' },
    { tab: 'heat', path: ['a.sec'], label: 'a.passing' },
    { tab: 'heat', path: ['a.sec'], label: 'a.used' },
  ];
  const c = (l: string) => `ctl:${l.split('.')[0]}.sec/${l}`;
  let t = 1_800_000_000_000;
  const e = (x: Partial<UsageEvent>) => ({ t: t++, s: 'aaaaaaaa', k: 'use', ...x }) as UsageEvent;
  const events: UsageEvent[] = [
    e({ k: 'session', v: 'webgpu', id: 'scr:1920x1080' }),
    e({ k: 'time', ws: 'heat', mode: 'heat-simple', ms: 60_000 }),
    e({ k: 'load', v: 'generator', n: 7, ms: 900, dev: 1 }),
    e({ id: c('a.broken'), src: 'button', n: 2 }),
    e({ k: 'friction', v: 'dead', id: c('a.broken') }),
    e({ id: c('a.confusing'), n: 2 }),
    e({ k: 'friction', v: 'undo', id: c('a.confusing') }),
    e({ k: 'friction', v: 'quick-close', id: c('a.confusing') }),
    e({ id: c('a.unclear'), n: 2 }),
    ...[1, 2, 3].map(() => e({ k: 'help', id: c('a.unclear'), src: 'hover' })),
    ...[5, 6, 5].map((n) => e({ id: 'ctl:b.inner/b.deep', src: 'button', n })),
    e({ k: 'seen', id: c('a.seen'), ms: 90_000 }),
    e({ k: 'open', id: c('a.seen'), src: 'palette' }),
    e({ k: 'seen', id: c('a.passing'), ms: 4000 }),
    ...[1, 1, 2, 1].map((n) => e({ id: c('a.used'), src: 'quick', n })),
    e({ k: 'search', n: 0, q: 'Ruler' }),
    e({ k: 'search', n: 0, q: 'ruler' }),
    e({ k: 'feedback', id: c('a.used'), v: 'wish', note: 'a key for it' }),
    e({ k: 'fps', ws: 'heat', n: 4, ms: 50_000 }),
    e({ k: 'degrade', ws: 'heat' }),
  ];

  it('classes every feature by its evidence', () => {
    const r = buildReport({ events, index, smoke: new Set([c('a.used')]) });
    const cls = Object.fromEntries(r.features.map((x) => [x.id, x.cls]));
    expect(cls[c('a.broken')]).toBe('possibly-broken');
    expect(cls[c('a.confusing')]).toBe('confusing');
    expect(cls[c('a.unclear')]).toBe('unclear');
    expect(cls['ctl:b.inner/b.deep']).toBe('hard-to-reach');
    expect(cls[c('a.hidden')]).toBe('too-hidden');
    expect(cls[c('a.seen')]).toBe('seen-not-tried');
    expect(cls[c('a.passing')]).toBe('fine-but-unused');
    expect(cls[c('a.used')]).toBe('used');
    // Possibly broken first.
    expect(r.features[0].cls).toBe('possibly-broken');
    const deep = r.features.find((x) => x.id === 'ctl:b.inner/b.deep')!;
    // race (1) + More (1) + two sections (2) + the control (1).
    expect(deep.pathStatic).toBe(5);
    expect(deep.pathTypical).toBe(5);
    expect(r.misses).toEqual([{ q: 'ruler', n: 2 }]);
    expect(r.loads[0]).toMatchObject({ method: 'generator', count: 1 });
    expect(toFix(r).map((x) => x.id)).toEqual([c('a.broken')]);
    expect(r.features.find((x) => x.id === c('a.broken'))!.evidence.join(' ')).toMatch(/no smoke step/);
  });

  it('prints the lists the user reads', () => {
    const text = formatReport(buildReport({ events, index, extras: extraFeatures() }), { all: true });
    for (const h of ['Top features by use', 'To fix first', 'Hard to reach', 'Friction hot spots', 'Palette searches that found nothing', 'Unused features, by why', 'Every feature', 'Feedback'])
      expect(text).toContain(h);
    expect(text).toContain('"ruler"');
    expect(text).toContain('a key for it');
  });

  it('rows buckets are powers of ten', () => {
    expect([0, 9, 10, 999_999, 1_000_000, 4e10].map(rowsBucket)).toEqual([0, 0, 1, 5, 6, 10]);
  });
});
