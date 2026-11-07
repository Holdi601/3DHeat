import { describe, expect, it } from 'vitest';
import { buildFixedWing, buildHeli, chordAt, type FixedWingSpec, type HeliSpec } from './air';
import type { Template } from './kit';

/** The lowest and highest points of a template's team part beyond `out` metres to the side. */
function beyond(t: Template, out: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < t.team.length; i += 7) {
    if (Math.abs(t.team[i + 2]) <= out) continue;
    lo = Math.min(lo, t.team[i + 1]);
    hi = Math.max(hi, t.team[i + 1]);
  }
  return [lo, hi];
}
const depth = (t: Template, out: number) => beyond(t, out)[1] - beyond(t, out)[0];

describe('fixed-wing builder features', () => {
  const plan: FixedWingSpec = {
    length: 15, span: 12, height: 4.5, bodyWidth: 1.6, bodyHeight: 1.6,
    wing: { x: -1, span: 12, rootChord: 4, tipChord: 1.2, sweep: 40 },
    wingPlan: [[1, 0], [1, 0.8], [-3.8, 6], [-5, 6], [-3, 0.8], [-3, 0]],
    tail: { kind: 'single', finHeight: 2.5, finChord: 3, tailSpan: 5, tailChord: 2 },
    tailPlan: [[-5, 0.6], [-6.5, 2.5], [-7.4, 2.5], [-7.4, 0.6]],
    finPlan: [[-4.5, 0], [-7.2, 0], [-7.5, 2.5], [-6.5, 2.5]],
  };

  it('cuts a planform across', () => {
    expect(chordAt(plan.wingPlan!, 0)).toBeCloseTo(4);
    expect(chordAt(plan.wingPlan!, 6)).toBeCloseTo(1.2);
    expect(chordAt(plan.wingPlan!, 7)).toBe(0);
  });

  it('thins the wing toward the tip and thickens it by its ratio', () => {
    const thin = buildFixedWing(plan);
    const thick = buildFixedWing({ ...plan, wing: { ...plan.wing, thicknessRatio: 0.16 } });
    expect(depth(thick, 3)).toBeGreaterThan(depth(thin, 3) * 2);
    // Near the tip the wing is a few centimetres thick.
    expect(depth(thin, 5.8)).toBeLessThan(0.1);
  });

  it('bends the outer wing up and the tailplane down', () => {
    const bent = buildFixedWing({ ...plan, wing: { ...plan.wing, outerDihedral: { at: 4, deg: 12 } } });
    const flat = buildFixedWing(plan);
    expect(beyond(bent, 5.8)[1] - beyond(flat, 5.8)[1]).toBeGreaterThan(0.3);
    const droop = buildFixedWing({ ...plan, tail: { ...plan.tail, planeDihedral: -23 } });
    // The tailplane's tip, behind the wing and out past the body: 1.9 m out at -23 degrees, 0.8 m lower.
    const tip = (t: Template) => {
      let lo = Infinity;
      for (let i = 0; i < t.team.length; i += 7) if (t.team[i] < -6.4 + (t.min[0] + t.max[0]) / 2 && Math.abs(t.team[i + 2]) > 2.2) lo = Math.min(lo, t.team[i + 1]);
      return lo;
    };
    expect(tip(droop) - (droop.min[1] + droop.max[1]) / 2).toBeLessThan(tip(flat) - (flat.min[1] + flat.max[1]) / 2 - 0.5);
  });

  it('leaves a one-sided body on its side', () => {
    const probe = { top: [[8, 0.1], [6, 0.1]], bottom: [[8, -0.1], [6, -0.1]], plan: [[8, 0.1], [6, 0.1]], side: 2.5 } as NonNullable<FixedWingSpec['bodies']>[number];
    const one = buildFixedWing({ ...plan, bodies: [{ ...probe, oneSide: true }] });
    const both = buildFixedWing({ ...plan, bodies: [probe] });
    expect(both.triangles).toBeGreaterThan(one.triangles);
  });
});

describe('helicopter builder features', () => {
  const heli: HeliSpec = { length: 16, rotor: 14, height: 4.5, bodyWidth: 1.6, bodyHeight: 2, cabin: 'tandem', blades: 4 };

  it('draws the tail rotor by its blades, the main blades by their chord, and outline glass', () => {
    const base = buildHeli(heli);
    expect(buildHeli({ ...heli, tailBlades: 3 }).triangles).toBeGreaterThan(base.triangles);
    expect(buildHeli({ ...heli, tailScissor: 35 }).triangles).toBe(base.triangles);
    const wide = buildHeli({ ...heli, bladeChord: 0.53, sweptTips: true, tipChord: 0.8 });
    expect(wide.triangles).not.toBe(base.triangles);
    const glass = buildHeli({ ...heli, glassOutlines: [{ top: [[6, 0.4], [3, 1.2], [1, 0.8]], bottom: [[6, 0.2], [1, 0.2]], plan: [[6, 0.1], [3, 0.5], [1, 0.4]] }] });
    expect(glass.triangles).not.toBe(base.triangles);
  });
});
