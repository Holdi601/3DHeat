import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { checkGeometry, tolFor } from './geomcheck';
import { buildGround, type AddOn } from './ground';
import { T72 } from './specs/tanks';

/**
 * Figures with a part standing clear of the rest by more than three times the touching distance (about 2.4 % of the
 * figure's size), as built or with the turrets turned and the guns raised: known defects still to be fixed, with how
 * many such parts each has. None left; a figure listed here must be fixed and taken off, and one not listed must
 * have none.
 */
const KNOWN_FLOATING: Record<string, number> = {};

/** The T-72 / T-90 and Leopard 2 families: every add-on on its hull or turret, as built and turned, to the touching distance itself. */
const FAMILIES = ['t-72a', 't-72av', 't-72b', 't-72b-1989', 't-72b3', 't-72b3m', 't-72b3-arena-m', 't-90', 't-90a', 't-90m', 'leopard-2a4', 'leopard-2a5', 'leopard-2a6', 'leopard-2a7', 'leopard-2e', 'strv-122', 'leopard-2pl', 'leopard-2a4m-can'];

describe('figure geometry', () => {
  it('keeps every figure in one piece, as built and with its turrets turned and guns raised', () => {
    const bad: string[] = [];
    for (const [name, e] of Object.entries(CATALOG)) {
      const t = e.build();
      const r = checkGeometry(t, { tol: tolFor(t) * 3 });
      const n = Math.max(r.floating.length, r.floatingPosed.length);
      // Lit from inside or squashed flat: a part's faces turned in, or triangles with no area, more than a few.
      if (r.inverted > r.triangles * 0.1) bad.push(`${name}: ${r.inverted} of ${r.triangles} triangles lit from inside`);
      if (r.degenerate > r.triangles * 0.08) bad.push(`${name}: ${r.degenerate} of ${r.triangles} triangles without area`);
      if (n > (KNOWN_FLOATING[name] ?? 0)) {
        const p = [...r.floating, ...r.floatingPosed][0];
        bad.push(`${name}: ${n} parts standing clear (${p.tris} triangles at ${p.min.map((v) => v.toFixed(2))}..${p.max.map((v) => v.toFixed(2))}, ${p.gap.toFixed(2)} m off)`);
      }
    }
    expect(bad).toEqual([]);
  }, 300_000);

  it('keeps the T-72, T-90 and Leopard 2 add-ons on their hull or turret, the turret turned or not', () => {
    for (const name of FAMILIES) {
      const r = checkGeometry(CATALOG[name].build());
      expect(r.floating, name).toEqual([]);
      expect(r.floatingPosed, name).toEqual([]);
      expect(r.inverted, name).toBe(0);
      expect(r.degenerate, name).toBe(0);
    }
  });

  it('finds a part standing clear, and one riding on the wrong joint', () => {
    const tank = (addOns: AddOn[]) => buildGround({ ...T72, addOns });
    expect(checkGeometry(tank([])).floating).toEqual([]);
    // A sight head lifted 0.6 m clear of the turret roof (0.8 m up): floating as built.
    const lifted = checkGeometry(tank([{ on: 'turret', kind: 'drum', at: [0, 0.7, 1.55], size: [0.3, 0.3, 0.3] }]));
    expect(lifted.floating.length).toBe(1);
    expect(lifted.floating[0].moves).toBe(1);
    // A box on the gun barrel out past the hull's nose (the gun's axis 1.61 m up, the barrel about 0.1 m round it) drawn
    // on the hull: in place as built, left in the air once the turret turns and the gun rises.
    const wrong = checkGeometry(tank([{ on: 'hull', kind: 'box', at: [4.0, 0, 1.79], size: [0.3, 0.2, 0.16] }]));
    expect(wrong.floating).toEqual([]);
    expect(wrong.floatingPosed.length).toBe(1);
    expect(wrong.floatingPosed[0].moves).toBe(0);
  });
});
