import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import type { Joint, Template } from './kit';

/** Every vertex of a template moving with joint j (both parts), as [x, y, z] triples. */
function verticesOf(t: Template, j: number): number[][] {
  const out: number[][] = [];
  for (const [d, jn] of [[t.team, t.teamJ], [t.fixed, t.fixedJ]] as const) {
    if (!jn) continue;
    for (let i = 0; i < jn.length; i++) if (jn[i] === j + 1) out.push([d[i * 7], d[i * 7 + 1], d[i * 7 + 2]]);
  }
  return out;
}

const shape = (js: Joint[] | undefined) => (js ?? []).map((j) => [j.kind, j.parent, j.rest, j.pitch ?? 0, ...j.pivot.map((v) => Math.round(v * 100) / 100)]);

describe('ship gun joints', () => {
  for (const name of ['fletcher', 'iowa', 'yamato']) {
    it(`gives ${name}'s turrets a yaw joint each and their guns a pitch joint at the trunnion`, () => {
      const t = CATALOG[name].build();
      const js = t.joints ?? [];
      const yaws = js.filter((j) => j.kind === 'yaw');
      expect(yaws.length, name).toBeGreaterThanOrEqual(3);
      // After turrets are built facing aft.
      expect(yaws.some((j) => j.rest === Math.PI), name).toBe(true);
      expect(yaws.some((j) => j.rest === 0), name).toBe(true);
      js.forEach((j, i) => {
        const vs = verticesOf(t, i);
        expect(vs.length, `${name} joint ${i}`).toBeGreaterThan(0);
        if (j.kind === 'yaw') {
          expect(j.parent).toBe(-1);
          // The mount lies round its pivot: within its own size of it, standing on its deck.
          const reach = Math.max(...vs.map(([x, , z]) => Math.hypot(x - j.pivot[0], z - j.pivot[2])));
          expect(reach, `${name} joint ${i}`).toBeLessThan(20);
          expect(Math.min(...vs.map((v) => v[1])), `${name} joint ${i}`).toBeGreaterThan(j.pivot[1] - 0.3);
        } else {
          expect(js[j.parent]?.kind, `${name} joint ${i}`).toBe('yaw');
          expect(j.rest).toBe(js[j.parent].rest);
          expect(j.pitch ?? -1).toBeGreaterThanOrEqual(0);
          // Every barrel vertex lies ahead of the trunnion, the way the turret faces.
          const fwd = Math.cos(j.rest);
          for (const [x] of vs) expect((x - j.pivot[0]) * fwd, `${name} joint ${i}`).toBeGreaterThan(-0.6);
        }
      });
      // Coarse and far builds train the same mounts.
      expect(shape(t.coarse!().joints)).toEqual(shape(js));
      expect(shape(t.far!().joints)).toEqual(shape(js));
    });
  }

  it('keeps every ship within the joint ids a vertex can carry', () => {
    for (const [name, e] of Object.entries(CATALOG)) {
      if (e.domain !== 'sea') continue;
      const t = e.build();
      expect(t.joints?.length ?? 0, name).toBeLessThan(255);
    }
  });
});
