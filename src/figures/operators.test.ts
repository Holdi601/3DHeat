import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { extent, type Template } from './kit';
import { OPERATORS, operatorFigureName, operatorOf, operatorSlug } from './operators';
import { APART, figureOf, operatorNames, pairs, renders, SHAPES_APART } from './operatorPixels';

describe('operator figures', () => {
  const built = new Map<string, Template>(operatorNames.map((n) => [n, CATALOG[figureOf(n)].build()]));

  it('has a figure for every operator, weapon class and stance, a person tall', () => {
    expect(operatorNames.length).toBeGreaterThanOrEqual(78);
    expect(new Set(operatorNames.map(operatorSlug)).size).toBe(operatorNames.length);
    for (const n of operatorNames) {
      for (const carry of OPERATORS[n].carries) {
        for (const stance of ['stand', 'crouch', 'prone'] as const) expect(CATALOG[operatorFigureName(operatorSlug(n), carry, stance, OPERATORS[n].look.side)], `${n} ${carry} ${stance}`).toBeDefined();
      }
      const x = extent(built.get(n)!);
      expect(x.height, n).toBeGreaterThan(1.6);
      expect(x.height, n).toBeLessThan(2.3);
      expect(built.get(n)!.triangles, n).toBeLessThan(4000);
    }
    expect(operatorOf('capitao')?.name).toBe('Capitão');
    expect(operatorOf('Nokk')?.name).toBe('Nøkk');
    expect(operatorOf('IQ')?.name).toBe('IQ');
  });

  it('tells every pair of operators apart in pixels at replay distance, from above or from three-quarters', () => {
    const all = pairs(renders(false));
    const alike = all.filter((p) => p.deltaE < APART && p.iou >= SHAPES_APART).map((p) => `${p.a} / ${p.b} (${p.deltaE.toFixed(1)}, ${p.iou.toFixed(2)})`);
    expect(alike).toEqual([]);
  });
});
