import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { CANON } from '../data/canonical';
import { exprChartSync } from '../charts/exprRun';
import { exprChartSvg, exprChartTable } from '../charts/exprSvg';
import { readExprChartSpec, type ExprChartSpec } from '../charts/exprSpec';
import { anchorKey, dataKey, readAnchor, resolveAnchor, rowAnchor, type Anchor } from './anchors';
import { docToHtml, docToMarkdown, docToZip } from './export';
import { inline, markdownToHtml, plainText } from './markdown';
import { blockRefs, outline, readBook, type AnalysisDoc, type DataNote, type NotesBook } from './model';
import { applyBookOps, diffBooks, isNoteBatch } from './ops';
import { pinInstances, pinsOf, NotePinLayer } from './pins';
import { loadNotesState, notesState, onLocalBatch, useNotes } from './store';
import { crc32 } from './zip';
import { isSharedChartBlock } from './sharedChart';
import { SPAWN_INSTANCE_FLOATS } from '../render/spawnMarks';

/**
 * Two matches of two teams, synthetic: the Allies (ann, bob) walk x 0..19
 * one unit a second, the Axis (cid, dan) stand at x 30. An event column:
 * each Ally kills once at t 5, each Axis dies once at t 6.
 */
function synth(shift = 0): Dataset {
  const rows: { x: number; t: number; p: number; s: number; e: number }[] = [];
  for (let s = 0; s < 2; s++)
    for (let p = 0; p < 4; p++)
      for (let k = 0; k < 20; k++) {
        const t = s * 100 + k;
        rows.push({ x: p < 2 ? k : 30, t, p, s, e: p < 2 && k === 5 ? 2 : p >= 2 && k === 6 ? 3 : 0 });
      }
  rows.sort((a, b) => a.t - b.t || a.p - b.p);
  // A reload that orders the rows differently: the same data, other indices.
  if (shift) rows.push(...rows.splice(0, shift));
  const n = rows.length;
  return {
    id: 's',
    name: 'synthetic',
    count: n,
    px: Float32Array.from(rows, (r) => r.x),
    py: Float32Array.from(rows, (r) => r.p),
    pz: new Float32Array(n),
    time: Float32Array.from(rows, (r) => r.t),
    epochMs: null,
    lifetime: new Float32Array(n).fill(1),
    maxLifetimeGap: 1,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: Uint32Array.from(rows, (r) => r.p),
    teamId: Uint16Array.from(rows, (r) => (r.p < 2 ? 0 : 1)),
    personLabels: ['ann', 'bob', 'cid', 'dan'],
    teamLabels: ['Allies', 'Axis'],
    sessionId: Uint32Array.from(rows, (r) => r.s),
    sessionLabels: ['m0', 'm1'],
    sessionRows: new Uint32Array([n / 2, n / 2]),
    sessionStart: new Float32Array([0, 100]),
    sessionEnd: new Float32Array([19, 119]),
    personTeam: new Uint16Array([0, 0, 1, 1]),
    personSlot: new Uint16Array([0, 1, 0, 1]),
    teamSizes: new Uint32Array([2, 2]),
    attrs: [{ name: CANON.event, kind: 'category', data: Uint32Array.from(rows, (r) => r.e), min: 0, max: 3, categories: ['position', 'fire', 'kill', 'death'] }],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 30, maxY: 3, maxZ: 0 },
    timeRange: [0, 119],
    timeSorted: !shift,
  } as unknown as Dataset;
}

const rowOf = (d: Dataset, person: number, t: number) => {
  for (let r = 0; r < d.count; r++) if (d.personId![r] === person && d.time![r] === t) return r;
  return -1;
};

const note = (id: string, anchor: Anchor, extra: Partial<DataNote> = {}): DataNote => ({ id, title: id, text: '', tags: [], color: '#f5c542', author: 'a', created: 1, updated: 1, anchor, ...extra });

describe('anchors', () => {
  const ds = synth();

  it('fingerprint the data: the same rows give the same key, other rows another, the name does not count', () => {
    expect(dataKey(ds)).toBe(dataKey(synth()));
    expect(dataKey({ ...synth(), name: 'renamed' } as Dataset)).toBe(dataKey(ds));
    const other = synth();
    other.px[3] += 1;
    expect(dataKey({ ...other } as Dataset)).not.toBe(dataKey(ds));
  });

  it('find a row again by its signature when a reload moved it, and say when the data lacks it', () => {
    const r = rowOf(ds, 1, 7);
    const a = rowAnchor(ds, r);
    expect(a.kind).toBe('row');
    const same = resolveAnchor(ds, a);
    expect(same).toMatchObject({ ok: true, row: r, time: 7, point: { x: 7, y: 1, z: 0 } });
    expect(same.moved).toBeFalsy();
    const moved = synth(13);
    const again = resolveAnchor(moved, a);
    expect(again.ok).toBe(true);
    expect(again.moved).toBe(true);
    expect(moved.time![again.row!]).toBe(7);
    expect(moved.personId![again.row!]).toBe(1);
    // A survives JSON (a file, the session).
    expect(resolveAnchor(moved, readAnchor(JSON.parse(JSON.stringify(a)))!).row).toBe(again.row);
    const other = synth();
    other.px.fill(99);
    expect(resolveAnchor({ ...other } as Dataset, a)).toMatchObject({ ok: false, reason: 'otherData' });
  });

  it('make an event of an event row, kind and all', () => {
    const r = rowOf(ds, 0, 5);
    const a = rowAnchor(ds, r);
    expect(a.kind).toBe('event');
    expect(a.kind === 'event' && a.event).toBe('kill');
    expect(anchorKey(a)).toBe(`row:${dataKey(ds)}:${r}`);
  });

  it('resolve units, matches, rounds and times by name, on any data that has them', () => {
    const unit: Anchor = { kind: 'unit', key: '#1', name: 'bob', t: 105 };
    const u = resolveAnchor(ds, unit);
    expect(u.ok).toBe(true);
    expect(u.point).toEqual({ x: 5, y: 1, z: 0 });
    expect(resolveAnchor(ds, { kind: 'unit', key: 'nobody', name: 'nobody' })).toMatchObject({ ok: false, reason: 'noUnit' });
    expect(resolveAnchor(ds, { kind: 'round', session: 'm1' })).toMatchObject({ ok: true, session: 1, range: [100, 119] });
    expect(resolveAnchor(ds, { kind: 'round', session: 'm9' })).toMatchObject({ ok: false, reason: 'noRound' });
    expect(resolveAnchor(ds, { kind: 'time', from: 3, to: 9, session: 'm0' })).toMatchObject({ ok: true, range: [3, 9], session: 0 });
    expect(resolveAnchor(ds, { kind: 'match', id: 'm1' }).ok).toBe(true);
    expect(resolveAnchor(ds, { kind: 'match', id: 'zz' })).toMatchObject({ ok: false, reason: 'noMatch' });
    expect(resolveAnchor(null, unit)).toMatchObject({ ok: false, reason: 'noData' });
  });

  it('keep places, heat spots, views and plans with what they point at', () => {
    const heat: Anchor = { kind: 'heat', point: { x: 1, y: 2, z: 3 }, t: 4, heat: { value: 9, place: 8, rows: 7, percentile: 0.9, places: 100, ofMedian: 3, ofPeak: 0.5, mode: 'heat-simple' } };
    expect(resolveAnchor(null, heat)).toMatchObject({ ok: true, point: { x: 1, y: 2, z: 3 }, time: 4 });
    expect(resolveAnchor(null, { kind: 'view', id: 'v', name: 'v', view: {} }).ok).toBe(true);
    const ins: Anchor = { kind: 'insight', id: 'i1', insightKind: 'zones.hot', text: 'hot', place: { x: 0, y: 0, z: 0 }, time: null, filters: [] };
    expect(resolveAnchor(ds, ins, new Map()).reason).toBe('noInsight');
    expect(resolveAnchor(ds, ins, new Map([['i1', { place: null }]]))).toMatchObject({ ok: true });
    expect(readAnchor({ kind: 'row', row: 1 })).toBeNull();
    expect(readAnchor({ kind: 'nonsense' })).toBeNull();
  });
});

describe('the op log', () => {
  const base: NotesBook = { notes: [note('n1', { kind: 'round', session: 'm0' }), note('n2', { kind: 'round', session: 'm1' })], docs: [] };

  it('turns an edit into operations that make the same book', () => {
    const next: NotesBook = {
      notes: [{ ...base.notes[0], title: 'changed', tags: ['x'] }, note('n3', { kind: 'match', id: 'm0' })],
      docs: [{ id: 'a1', title: 'A', body: 'x', blocks: {}, author: 'a', created: 1, updated: 1 }],
    };
    const ops = diffBooks(base, next);
    expect(ops.map((o) => o.op).sort()).toEqual(['add', 'add', 'del', 'set']);
    const set = ops.find((o) => o.op === 'set');
    expect(set && set.op === 'set' && Object.keys(set.fields).sort()).toEqual(['tags', 'title']);
    expect(applyBookOps(base, ops)).toEqual(next);
    expect(diffBooks(base, base)).toEqual([]);
  });

  it('merges two people editing different notes, and the later of two edits to one field', () => {
    const mine = diffBooks(base, { ...base, notes: [{ ...base.notes[0], title: 'mine' }, base.notes[1]] });
    const theirs = diffBooks(base, { ...base, notes: [base.notes[0], { ...base.notes[1], text: 'theirs' }] });
    const both = applyBookOps(applyBookOps(base, mine), theirs);
    expect(both.notes.map((n) => [n.title, n.text])).toEqual([
      ['mine', ''],
      ['n2', 'theirs'],
    ]);
    const later = diffBooks(base, { ...base, notes: [{ ...base.notes[0], title: 'later' }, base.notes[1]] });
    expect(applyBookOps(applyBookOps(base, mine), later).notes[0].title).toBe('later');
    // An edit to a note deleted meanwhile does nothing.
    const gone = applyBookOps(base, [{ op: 'del', coll: 'notes', id: 'n1' }]);
    expect(applyBookOps(gone, mine).notes.map((n) => n.id)).toEqual(['n2']);
  });

  it('checks batches from outside', () => {
    expect(isNoteBatch({ id: 'b', author: 'x', at: 1, ops: [{ op: 'del', coll: 'notes', id: 'n1' }] })).toBe(true);
    expect(isNoteBatch({ id: 'b', author: 'x', at: 1, ops: [{ op: 'del', coll: 'figures', id: 'n1' }] })).toBe(false);
    expect(isNoteBatch({ id: 'b', at: 1, ops: [{ op: 'set', coll: 'notes', id: 'n1' }] })).toBe(false);
  });

  it('the store logs each edit, hands it on, applies a remote batch once, and saves and loads a session', () => {
    useNotes.setState({ book: { notes: [], docs: [] }, log: [], rev: 0 });
    const sent: unknown[] = [];
    const off = onLocalBatch((b) => sent.push(b));
    const n = useNotes.getState().addNote({ title: 'a', text: '', tags: [], color: '#f5c542', anchor: { kind: 'round', session: 'm0' } });
    useNotes.getState().updateNote(n.id, { text: 'more' });
    off();
    expect(sent).toHaveLength(2);
    expect(useNotes.getState().log).toHaveLength(2);
    const remote = { id: 'remote-1', author: 'peer', at: 2, ops: [{ op: 'add' as const, coll: 'notes' as const, id: 'r1', value: note('r1', { kind: 'match', id: 'm1' }) as unknown as Record<string, unknown> }] };
    useNotes.getState().applyRemote(remote);
    useNotes.getState().applyRemote(remote);
    expect(useNotes.getState().book.notes.map((x) => x.id)).toEqual([n.id, 'r1']);
    const saved = JSON.parse(JSON.stringify(notesState()));
    expect(saved.schema).toBe('heat3d.notes/1');
    useNotes.setState({ book: { notes: [], docs: [] }, log: [] });
    loadNotesState(saved);
    expect(useNotes.getState().book.notes.map((x) => x.text)).toEqual(['more', '']);
    expect(useNotes.getState().log).toHaveLength(3);
  });

  it('reads a book back with every part checked', () => {
    const b = readBook({ notes: [note('ok', { kind: 'match', id: 'm' }), { id: 'bad', anchor: { kind: 'row' } }, null], docs: [{ id: 'd', title: 'T', body: 'x', blocks: { b1: { type: 'note', noteId: 'ok' }, b2: { type: 'chart', spec: { measure: {} } } } }] });
    expect(b.notes.map((n) => n.id)).toEqual(['ok']);
    expect(Object.keys(b.docs[0].blocks)).toEqual(['b1']);
  });
});

describe('the Markdown', () => {
  it('escapes everything but its own forms', () => {
    const html = markdownToHtml('# Hi <b>\n\nA **bold** and *it* `<x>` [web](https://example.org) [bad](javascript:alert(1)) <script>alert(1)</script>');
    expect(html).toContain('<h1 id="hi-b">Hi &lt;b&gt;</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code>&lt;x&gt;</code>');
    expect(html).toContain('href="https://example.org"');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('<script');
  });

  it('draws lists, tables, quotes, inner links and blocks', () => {
    const html = markdownToHtml('- a\n- b\n\n| x | y |\n|---|---:|\n| 1 | 2 |\n\n> q\n\n[the note](note:n1)\n\n{{block:b1}}', { block: (id) => `<div data-b="${id}"></div>`, title: () => null });
    expect(html).toContain('<ul><li>a</li><li>b</li></ul>');
    expect(html).toContain('<td style="text-align:right">2</td>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('data-link="note:n1"');
    expect(html).toContain('<div data-b="b1"></div>');
    expect(inline('2 * 3 * 4')).toBe('2 * 3 * 4');
    expect(plainText('# T\n**b** [x](note:a)')).toBe('T b x');
    expect(blockRefs('a\n{{block:b1}}\n {{block:b2}} \n')).toEqual(['b1', 'b2']);
    expect(outline('# A\n```\n# not\n```\n## B').map((h) => h.text)).toEqual(['A', 'B']);
  });
});

describe('charts', () => {
  const ds = synth();

  it('count per group by the Compare expressions, one side or two', () => {
    const spec: ExprChartSpec = { v: 1, kind: 'bar', measure: { expr: 'count()', name: 'Rows' }, groupBy: { by: 'column', column: 'team', top: 8 } };
    const d = exprChartSync(ds, spec);
    expect(d.labels).toEqual(['Allies', 'Axis']);
    expect(d.series[0].values).toEqual([80, 80]);
    const kills = exprChartSync(ds, { ...spec, measure: { expr: 'countIf(event == "kill")' }, diff: { a: { label: 'm0', filter: 'match == "m0"' }, b: { label: 'm1', filter: 'match == "m1"' } } });
    expect(kills.series.map((s) => s.label)).toEqual(['m0', 'm1']);
    expect(kills.series[0].values).toEqual([2, 0]);
    const line = exprChartSync(ds, { ...spec, kind: 'line', groupBy: { by: 'time', bins: 4 } });
    expect(line.labels.length).toBeGreaterThan(1);
    expect(readExprChartSpec(JSON.parse(JSON.stringify(spec)))).toMatchObject(spec);
    const svg = exprChartSvg(spec, d);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('<title>Rows · Allies: 80</title>');
    expect(exprChartTable(d)).toContain('| Allies | 80 |');
  });
});

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('exports', () => {
  const book: NotesBook = {
    notes: [note('n1', { kind: 'round', session: 'm0' }, { title: 'Round one', text: 'Push **early**' })],
    docs: [],
  };
  const doc: AnalysisDoc = {
    id: 'a1',
    title: 'Mid control',
    body: '## Findings\n\nSee [the note](note:n1).\n\n{{block:v}}\n\n{{block:c}}\n\n{{block:n}}\n\n{{block:h}}',
    blocks: {
      v: { id: 'v', type: 'view', name: 'Mid', view: { mode: 'heat-simple' }, thumb: PNG },
      c: { id: 'c', type: 'chart', spec: { v: 1, kind: 'bar', measure: { expr: 'count()', name: 'Rows' }, groupBy: null }, data: { labels: ['Rows'], series: [{ label: 'Rows', values: [160] }], unit: '', rows: 160, at: 0, dataset: 'synthetic' } },
      n: { id: 'n', type: 'note', noteId: 'n1' },
      h: { id: 'h', type: 'heat', anchor: { kind: 'heat', point: { x: 1, y: 2, z: 3 }, heat: { value: 4, place: 5, rows: 6, percentile: 0.93, places: 412, ofMedian: 3.1, ofPeak: 0.6, mode: 'heat-simple' } } },
    },
    author: 'me',
    created: 0,
    updated: 0,
  };
  book.docs.push(doc);

  it('write one self-contained HTML file: no outside resource, pictures inline, blocks drawn, no buttons', () => {
    const html = docToHtml(doc, book);
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<title>Mid control</title>');
    expect([...html.matchAll(/\b(?:src|href)="([^"]*)"/g)].map((m) => m[1]).filter((u) => !u.startsWith('data:') && !u.startsWith('#'))).toEqual([]);
    expect(html).toContain(`src="${PNG}"`);
    expect(html).toContain('<svg');
    expect(html).toContain('Round one');
    expect(html).toContain('<strong>early</strong>');
    expect(html).toContain('412');
    expect(html).not.toContain('data-action');
    expect(html).not.toContain('data-link');
  });

  it('write Markdown with the pictures as files, or inline, and zip them', () => {
    const { markdown, files } = docToMarkdown(doc, book);
    expect(markdown.startsWith('# Mid control\n')).toBe(true);
    expect(markdown).toContain('See the note.');
    expect(markdown).toContain('![](images/v.png)');
    expect(markdown).toContain('![](images/c.svg)');
    expect(markdown).toContain('| Rows | 160 |');
    expect(files.map((f) => f.name)).toEqual(['images/v.png', 'images/c.svg']);
    expect(docToMarkdown(doc, book, true).markdown).toContain('](data:image/png;base64,');
    const z = docToZip(doc, book);
    const v = new DataView(z.buffer, z.byteOffset, z.byteLength);
    expect(v.getUint32(0, true)).toBe(0x04034b50);
    const end = z.byteLength - 22;
    expect(v.getUint32(end, true)).toBe(0x06054b50);
    expect(v.getUint16(end + 10, true)).toBe(3);
    // The first entry's CRC is the Markdown's.
    expect(v.getUint32(14, true)).toBe(crc32(new TextEncoder().encode(docToMarkdown(doc, book).markdown)));
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
});

describe('chart blocks sent from elsewhere', () => {
  it('are taken by their shape, kept as they came, and drawn and tabulated as the documents draw their own', () => {
    const block = {
      schema: 'heat3d.chartBlock/1',
      type: 'chart',
      id: 'c1',
      title: 'Rows in the volume',
      spec: { kind: 'bar' },
      source: { kind: 'volume', volumeId: 'v', volumeName: 'Mid', dataset: 'synthetic', scope: 'all' },
      data: { kind: 'bar', groups: [{ key: 'a', label: 'Allies' }, { key: 'o', label: '@other' }], series: [{ key: 's', label: 'Rows' }], values: [[12, 3]], format: 'int', valueLabel: 'rows', rows: 15 },
      at: 0,
    };
    expect(isSharedChartBlock(block)).toBe(true);
    expect(isSharedChartBlock({ ...block, schema: 'x' })).toBe(false);
    const doc: AnalysisDoc = { id: 'd', title: 'T', body: '{{block:s}}', blocks: { s: { id: 's', type: 'chartBlock', block: block as never } }, author: '', created: 0, updated: 0 };
    const back = readBook(JSON.parse(JSON.stringify({ docs: [doc] })));
    expect(back.docs[0].blocks.s).toEqual(doc.blocks.s);
    const html = docToHtml(doc, { notes: [], docs: [doc] });
    expect(html).toContain('Rows in the volume');
    expect(html).toContain('<td>Allies</td>');
    expect(html).toContain('<svg');
    expect(docToMarkdown(doc, { notes: [], docs: [doc] }).markdown).toContain('| other | 3 |');
  });
});

describe('pins', () => {
  const ds = synth();

  it('show a note about a moment around it in Play mode, and every note in All mode', () => {
    const notes = [note('a', rowAnchor(ds, rowOf(ds, 0, 5))), note('b', { kind: 'place', point: { x: 1, y: 1, z: 1 } }), note('c', { kind: 'round', session: 'm0' })];
    const pins = pinsOf(notes, ds);
    expect(pins.map((p) => p.id)).toEqual(['a', 'b']);
    const out = { data: new Float32Array(0) };
    expect(pinInstances(pins, null, out)).toBe(2);
    expect(pinInstances(pins, 5, out)).toBe(2);
    expect(pinInstances(pins, 60, out)).toBe(1);
    expect(out.data[7]).toBe(1 + 9 * 4);
  });

  it('build a thousand pins once, and the same frame again for nothing', () => {
    const notes = Array.from({ length: 1000 }, (_, i) => note(`n${i}`, i % 2 ? rowAnchor(ds, i % ds.count) : { kind: 'unit', key: `#${i % 4}`, name: 'x', t: i % 120 }));
    const layer = new NotePinLayer();
    const t0 = performance.now();
    layer.resolve(notes, 1, ds);
    const resolveMs = performance.now() - t0;
    const a = layer.build(notes, 1, ds, 50.4);
    const t1 = performance.now();
    for (let f = 0; f < 600; f++) layer.build(notes, 1, ds, 50.4 + (f % 2) * 1e-3);
    const frameMs = (performance.now() - t1) / 600;
    expect(layer.pins).toHaveLength(1000);
    expect(a && a.count).toBeGreaterThan(0);
    expect(layer.build(notes, 1, ds, 50.4)).toBe(a);
    expect(a!.data.length).toBeGreaterThanOrEqual(a!.count * SPAWN_INSTANCE_FLOATS);
    // Resolving is off the frame; a frame that shows the same pins only checks which do.
    expect(resolveMs).toBeLessThan(500);
    expect(frameMs).toBeLessThan(0.5);
  });
});
