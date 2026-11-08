import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CATALOG } from '../catalog';
import { CUES, cueCounts } from './cues';

describe('recognition cues', () => {
  const counts = cueCounts();

  it('names only figures in the catalogue, each with a spec of its domain', () => {
    const missing = Object.entries(CUES).flatMap(([k, e]) => e.figures.filter((f) => !CATALOG[f]).map((f) => `${k}: ${f}`));
    expect(missing).toEqual([]);
    expect(counts.filter((c) => c.noSpec).map((c) => c.figure)).toEqual([]);
  });

  it('every cue is a short phrase, every entry has cues', () => {
    for (const [k, e] of Object.entries(CUES)) {
      expect(e.cues.length, k).toBeGreaterThan(0);
      for (const q of e.cues) expect(q.cue.length, `${k}: ${q.cue}`).toBeLessThan(90);
    }
  });

  it('every check passes on its figure', () => {
    expect(counts.flatMap((c) => c.failed.map((q) => `${c.figure}: ${q}`))).toEqual([]);
  });

  it('lists the cues not modelled yet', () => {
    const list = counts.flatMap((c) => c.notModelledCues.map((q) => `${c.figure}: ${q}`));
    if (list.length) console.log(`cues not modelled yet (${list.length}):\n  ` + list.join('\n  '));
    // A local tally for aggregation (CUES_REPORT=<path>): figure, domain, total, checked, not modelled, open.
    const out = process.env.CUES_REPORT;
    if (out) {
      const rows = counts.map((c) => [c.figure, c.domain, c.total, c.checked, c.notModelled, c.open, c.notModelledCues.join('; ')].join('\t'));
      writeFileSync(out, ['figure\tdomain\ttotal\tchecked\tnot_modelled\topen\tnot_modelled_cues', ...rows].join('\n') + '\n');
    }
  });
});
