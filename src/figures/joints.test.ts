import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { finish, into, joint, newKit, type Joint, type Template } from './kit';
import { articulate, carrierOf, meshOf, MESH_STRIDE } from './instances';
import { block } from './parts';

/** Every vertex of a template (both parts) with the joint it moves with: -1 the hull, else the index into `joints`. */
function vertices(t: Template): { p: [number, number, number]; j: number }[] {
  const out: { p: [number, number, number]; j: number }[] = [];
  for (const [d, jn] of [[t.team, t.teamJ], [t.fixed, t.fixedJ]] as const) {
    for (let i = 0; i < d.length / 7; i++) out.push({ p: [d[i * 7], d[i * 7 + 1], d[i * 7 + 2]], j: (jn ? jn[i] : 0) - 1 });
  }
  return out;
}

const build = (name: string): Template => {
  const e = CATALOG[name];
  if (!e) throw new Error(`no figure ${name}`);
  return e.build();
};

/** The way a pitch joint's gun points as built: its rest yaw, then its elevation. */
const pointing = (j: Joint): [number, number, number] => {
  const p = j.pitch ?? 0;
  return [Math.cos(j.rest) * Math.cos(p), Math.sin(p), Math.sin(j.rest) * Math.cos(p)];
};

describe('ground figure joints', () => {
  // A turret and its gun; a turret whose guns sit outside its sides; a casemate gun; five turrets, three of them gunned and two machine-gun turrets (T-35).
  const cases: { name: string; yaw: number; pitch: number; hullGuns: number }[] = [
    { name: 't-72b', yaw: 1, pitch: 1, hullGuns: 0 },
    { name: 'm1a2-abrams', yaw: 1, pitch: 1, hullGuns: 0 },
    { name: 'flakpanzer-gepard', yaw: 1, pitch: 1, hullGuns: 0 },
    { name: 'su-100', yaw: 0, pitch: 1, hullGuns: 1 },
    { name: 't-35', yaw: 5, pitch: 3, hullGuns: 0 },
  ];

  for (const c of cases) {
    it(`${c.name}: a joint for each turret and gun`, () => {
      const t = build(c.name);
      const js = t.joints ?? [];
      expect(js.filter((j) => j.kind === 'yaw').length).toBe(c.yaw);
      expect(js.filter((j) => j.kind === 'pitch').length).toBe(c.pitch);
      // A turret's gun rides on a turret; a casemate's on the hull.
      expect(js.filter((j) => j.kind === 'pitch' && j.parent < 0).length).toBe(c.hullGuns);
      for (const j of js) if (j.kind === 'pitch' && j.parent >= 0) expect(js[j.parent].kind).toBe('yaw');
      const vs = vertices(t);
      js.forEach((_, i) => expect(vs.some((v) => v.j === i), `joint ${i} has vertices`).toBe(true));
      // The hull keeps the running gear: a good part of the figure does not turn.
      expect(vs.filter((v) => v.j < 0).length).toBeGreaterThan(vs.length * 0.3);
    });
  }

  it('keeps each turret round its pivot, above the deck, and each gun ahead of its trunnion', () => {
    for (const c of cases) {
      const t = build(c.name);
      const js = t.joints ?? [];
      const vs = vertices(t);
      const len = t.max[0] - t.min[0];
      js.forEach((j, i) => {
        const mine = vs.filter((v) => v.j === i);
        if (j.kind === 'yaw') {
          // Within a turret's reach of its ring: less than half the vehicle's length out, nothing far below the deck.
          for (const v of mine) {
            expect(Math.hypot(v.p[0] - j.pivot[0], v.p[2] - j.pivot[2]), `${c.name} yaw ${i}`).toBeLessThan(len * 0.45);
            expect(v.p[1], `${c.name} yaw ${i}`).toBeGreaterThan(j.pivot[1] - 0.35);
          }
          // And the turret's own vertices are nearer its pivot than the vehicle's ends are.
          const far = Math.max(...mine.map((v) => Math.abs(v.p[0] - j.pivot[0])));
          expect(far, `${c.name} yaw ${i}`).toBeLessThan(Math.max(t.max[0] - j.pivot[0], j.pivot[0] - t.min[0]));
        } else {
          const d = pointing(j);
          for (const v of mine) {
            const along = (v.p[0] - j.pivot[0]) * d[0] + (v.p[1] - j.pivot[1]) * d[1] + (v.p[2] - j.pivot[2]) * d[2];
            expect(along, `${c.name} pitch ${i}`).toBeGreaterThan(-0.02);
          }
          // The muzzle is the gun's far end: a barrel's length out.
          expect(Math.max(...mine.map((v) => (v.p[0] - j.pivot[0]) * d[0] + (v.p[1] - j.pivot[1]) * d[1] + (v.p[2] - j.pivot[2]) * d[2]))).toBeGreaterThan(0.8);
        }
      });
    }
  });

  it('gives each gun of a multi-turret tank its own turret (T-35)', () => {
    const js = build('t-35').joints!;
    const parents = js.filter((j) => j.kind === 'pitch').map((j) => j.parent);
    expect(new Set(parents).size).toBe(3);
    // The 45 mm turrets at the front right and back left corners, the main one raised between them.
    const yaws = js.filter((j) => j.kind === 'yaw');
    expect(Math.max(...yaws.map((j) => j.pivot[0]))).toBeGreaterThan(2);
    expect(Math.min(...yaws.map((j) => j.pivot[0]))).toBeLessThan(-2);
    expect(Math.max(...yaws.map((j) => j.pivot[1]))).toBeGreaterThan(2.4);
  });

  it('turns a turret-side mount\'s guns about one axis across the turret (Gepard)', () => {
    const t = build('flakpanzer-gepard');
    const pitch = t.joints!.find((j) => j.kind === 'pitch')!;
    const guns = vertices(t).filter((v) => v.j === t.joints!.indexOf(pitch));
    // Both guns, either side of the turret.
    expect(Math.min(...guns.map((v) => v.p[2]))).toBeLessThan(-1);
    expect(Math.max(...guns.map((v) => v.p[2]))).toBeGreaterThan(1);
    expect(pitch.pitch).toBeCloseTo(0.15, 5);
  });

  it('leaves a fixed casemate and a hull machine gun with the hull', () => {
    const stug = build('stug-iii-g');
    expect(stug.joints!.filter((j) => j.kind === 'yaw').length).toBe(0);
    expect(stug.joints!.filter((j) => j.kind === 'pitch' && j.parent < 0).length).toBe(1);
    const carrier = build('universal-carrier');
    expect(carrier.joints ?? []).toHaveLength(0);
  });

  it('turns a towed gun on its carriage and a mount drawn from add-ons on its base', () => {
    for (const name of ['pak-40', 'zu-23-2', 'lvtdgb-m40']) {
      const js = build(name).joints!;
      expect(js.map((j) => j.kind), name).toEqual(['yaw', 'pitch']);
      expect(js[1].parent, name).toBe(0);
      expect(js[1].pitch, name).toBeGreaterThanOrEqual(0);
    }
  });

  it('rests a gun built pointing aft facing aft (Archer)', () => {
    const t = build('valentine-archer');
    const pitch = t.joints!.find((j) => j.kind === 'pitch')!;
    expect(pitch.rest).toBeCloseTo(Math.PI, 5);
    expect(Math.abs(pitch.pitch!)).toBeLessThan(0.1);
  });

  it('gives the coarse and far builds the same joints', () => {
    for (const c of cases) {
      const t = build(c.name);
      for (const lod of [t.coarse!(), t.far!()]) {
        expect(lod.joints).toEqual(t.joints);
        const vs = vertices(lod);
        (t.joints ?? []).forEach((_, i) => expect(vs.some((v) => v.j === i), `${c.name} lod joint ${i}`).toBe(true));
      }
    }
  });
});

describe('a turret on a turret', () => {
  // A main turret, a cupola on its roof (a yaw joint whose parent is the turret's) and the cupola's machine gun.
  const k = newKit();
  const turretJ = joint(k, { kind: 'yaw', pivot: [0.5, 2, 0], parent: -1, rest: 0 });
  const cupolaJ = joint(k, { kind: 'yaw', pivot: [-0.4, 2.9, 0.6], parent: turretJ, rest: 0 });
  const gunJ = joint(k, { kind: 'pitch', pivot: [-0.2, 3.1, 0.6], parent: cupolaJ, rest: 0, pitch: 0 });
  for (const [j, c] of [[turretJ, [0.5, 0, 2.4]], [cupolaJ, [-0.4, 0.6, 3.1]], [gunJ, [0.1, 0.6, 3.2]]] as const) {
    into(k, j);
    block(k.team, k.fr, [...c], 0.3, 0.2, 0.2, [0.8, 0.8, 0.8]);
  }
  into(k, -1);
  const t = finish(k, 'ground');

  it("is carried round with the turret under it, about that turret's pivot", () => {
    const m = meshOf(t);
    const yaw = 0.7;
    const out = [0, 0, 0];
    const [px, , pz] = t.joints![turretJ].pivot;
    for (let v = 0; v < m.count; v++) {
      const p = v * MESH_STRIDE;
      const [x, y, z] = [m.data[p], m.data[p + 1], m.data[p + 2]];
      articulate(m.data, p, x, y, z, yaw, 0, true, out);
      // All three parts turn rigidly with the main turret.
      const rx = x - px;
      const rz = z - pz;
      expect(out[0]).toBeCloseTo(px + rx * Math.cos(yaw) - rz * Math.sin(yaw), 5);
      expect(out[1]).toBeCloseTo(y, 5);
      expect(out[2]).toBeCloseTo(pz + rx * Math.sin(yaw) + rz * Math.cos(yaw), 5);
    }
    expect(carrierOf(t.joints!, t.joints![cupolaJ])).toBe(t.joints![turretJ]);
  });
});
