import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { extent, type Template } from './kit';
import { ACCENTS, OPERATORS, operatorFigureName, operatorOf, operatorSlug } from './operators';
import { iou, silhouette, type SilView } from './silhouette';

/** The views a replay is watched from: straight down, and three-quarters from above. */
const VIEWS: SilView[] = [
  { name: 'top', dir: [0, -1, 0] },
  { name: 'three-quarter', dir: [-0.5, -0.7071, -0.5] },
  { name: 'side', dir: [0, 0, -1] },
];
/** About what a figure covers on screen at replay distance: 4 cm cells, a soldier some 45 cells tall. */
const CELL = 0.04;
/** Silhouettes this alike in every view look the same at that distance. */
const SAME = 0.9;

const names = Object.keys(OPERATORS);
const figureOf = (n: string) => operatorFigureName(operatorSlug(n), OPERATORS[n].carries[0], 'stand', OPERATORS[n].look.side);

describe('operator figures', () => {
  const built = new Map<string, Template>(names.map((n) => [n, CATALOG[figureOf(n)].build()]));

  it('has a figure for every operator, weapon class and stance, a person tall', () => {
    expect(names.length).toBeGreaterThanOrEqual(78);
    expect(new Set(names.map(operatorSlug)).size).toBe(names.length);
    for (const n of names) {
      for (const carry of OPERATORS[n].carries) {
        for (const stance of ['stand', 'crouch', 'prone'] as const) expect(CATALOG[operatorFigureName(operatorSlug(n), carry, stance, OPERATORS[n].look.side)], `${n} ${carry} ${stance}`).toBeDefined();
      }
      const x = extent(built.get(n)!);
      expect(x.height, n).toBeGreaterThan(1.6);
      expect(x.height, n).toBeLessThan(2.2);
      expect(built.get(n)!.triangles, n).toBeLessThan(4000);
    }
    expect(operatorOf('capitao')?.name).toBe('Capitão');
    expect(operatorOf('Nokk')?.name).toBe('Nøkk');
    expect(operatorOf('IQ')?.name).toBe('IQ');
  });

  it('tells every pair of operators apart by silhouette or colour from above and from three-quarters', () => {
    const masks = new Map(names.map((n) => [n, VIEWS.map((v) => silhouette(built.get(n)!, v, 80, CELL).mask)]));
    const alike: string[] = [];
    let bySilhouette = 0;
    let pairs = 0;
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = OPERATORS[names[i]].look;
        const b = OPERATORS[names[j]].look;
        pairs++;
        const shape = VIEWS.some((_, v) => iou(masks.get(names[i])![v], masks.get(names[j])![v]) < SAME);
        if (shape) bySilhouette++;
        // Colour: the side's colour on the plate carrier, the accent on the shoulders.
        const colour = a.side !== b.side || ACCENTS[a.accent % ACCENTS.length] !== ACCENTS[b.accent % ACCENTS.length];
        if (!shape && !colour) alike.push(`${names[i]} / ${names[j]}`);
      }
    }
    expect(alike).toEqual([]);
    // Nearly every pair differs in shape alone, colour aside (3051 of 3081 when written).
    expect(bySilhouette / pairs).toBeGreaterThan(0.95);
  });
});
