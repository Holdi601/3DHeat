import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { CATALOG } from './catalog';
import { extent } from './kit';
import { GADGET_KINDS } from './gadgets';
import { gadgetFigure, hiddenRow, operatorLabel, placedFigure, ROLE_FIGURES, tacticalColumns, tacticalFigure } from './tactical';
import { placedGadgets, drawPlacedGadgets } from './gadgetLayer';
import { InstanceBatches } from './instances';
import { FigureReplay } from './replay';

const cat = (name: string, labels: string[], ids: number[]) => ({ name, kind: 'category', data: Uint32Array.from(ids), min: 0, max: labels.length - 1, categories: labels });

/**
 * Six rows of a round: Ash's body (assault rifle, attack), her drone, a
 * gadget she placed twice written (once at the origin, before it is placed),
 * Mute's body (SMG, defence) and a mark; then the round ends.
 */
const dataset = {
  count: 7,
  time: new Float64Array([1, 1, 2, 3, 4, 5, 9]),
  px: new Float32Array([10, 12, 0, 14, 20, 30, 10]),
  py: new Float32Array([0, 0, -100, 0, 0, 1, 0]),
  pz: new Float32Array([5, 6, 0, 7, 8, 9, 5]),
  yaw: new Float32Array(7),
  personId: new Uint32Array([0, 1, 2, 2, 3, 4, 0]),
  personLabels: ['Ash', 'Ash · drone 1', 'Ash · gadget 1', 'Mute', ''],
  personTeam: new Uint8Array([0, 0, 0, 1, 1]),
  sessionId: new Uint32Array(7),
  attrs: [
    cat('pawn', ['operator', 'drone', 'gadget', 'mark'], [0, 1, 2, 2, 0, 3, 0]),
    cat('operator', ['Ash', 'Mute', ''], [0, 0, 0, 0, 1, 2, 0]),
    cat('operatorRole', ['entry', 'anti-gadget', ''], [0, 0, 0, 0, 1, 2, 0]),
    cat('primaryClass', ['assault rifle', 'smg', ''], [0, 0, 0, 0, 1, 2, 0]),
    cat('side', ['attack', 'defense', ''], [0, 0, 0, 0, 1, 2, 0]),
    cat('gadget', ['Breach Charge', 'Bulletproof Camera', ''], [0, 0, 0, 0, 1, 2, 0]),
    cat('gadgetRole', ['breach', 'intel', ''], [0, 0, 0, 0, 1, 2, 0]),
    { name: 'round', kind: 'number', data: new Float32Array([1, 1, 1, 1, 1, 1, 1]), min: 1, max: 1 },
  ],
} as unknown as Dataset;

describe('close-quarters figures', () => {
  it('builds every operator and gadget figure, people a person tall and gadgets their size', () => {
    for (const k of GADGET_KINDS) {
      const x = extent(CATALOG[k].build());
      expect(Math.max(x.length, x.width, x.height), k).toBeLessThan(2.8);
    }
    const x = extent(CATALOG['operator-shield-defense'].build());
    expect(x.height).toBeGreaterThan(1.6);
    expect(x.height).toBeLessThan(2.0);
    // A claymore's face is about 22 cm wide, a drone about 30 cm.
    const clay = extent(CATALOG.claymore.build());
    expect(clay.width).toBeGreaterThan(0.18);
    expect(clay.width).toBeLessThan(0.3);
  });

  it('names a gadget by its name, then by its role', () => {
    expect(gadgetFigure('Barbed Wire')).toBe('barbed-wire');
    expect(gadgetFigure('Black Mirror')).toBe('one-way-window');
    expect(gadgetFigure('"Rtila" Electroclaw')).toBe('jammer');
    expect(gadgetFigure('Exothermic Charge')).toBe('hard-breach-charge');
    expect(gadgetFigure('Something New', 'trap')).toBe('floor-trap');
    expect(gadgetFigure('', '')).toBeNull();
    for (const f of Object.values(ROLE_FIGURES)) expect(CATALOG[f], f).toBeDefined();
  });

  it('draws a body as its operator with its weapon and side, a drone as the drone, and nothing for gadgets and marks', () => {
    const c = tacticalColumns(dataset)!;
    expect(c).not.toBeNull();
    expect(tacticalFigure(c, 0)).toBe('op-ash-rifle-attack');
    expect(tacticalFigure(c, 4)).toBe('op-mute-smg-defense');
    expect(tacticalFigure(c, 1)).toBe('throw-drone');
    expect(hiddenRow(c, 3)).toBe(true);
    expect(hiddenRow(c, 5)).toBe(true);
    for (const r of [0, 1, 4]) expect(CATALOG[tacticalFigure(c, r)!]).toBeDefined();
    const fr = new FigureReplay();
    expect(fr.knowsTypes(dataset)).toBe(true);
    expect(fr.kindOf(dataset, 0)).toBe('op-ash-rifle-attack');
  });

  it('keeps a placed gadget from where it was placed until its round ends', () => {
    const ix = placedGadgets(dataset)!;
    expect(ix.items.length).toBe(1);
    // The row at the origin is no place; the round's last row is at 9 s.
    expect(ix.items[0].times[0]).toBe(3);
    expect(ix.items[0].end).toBe(9);
    expect(ix.items[0].figure).toBe(placedFigure(tacticalColumns(dataset)!, 3));
    const count = (time: number) => drawPlacedGadgets(dataset, new InstanceBatches(), { time, session: -1, scale: 1, template: (k) => CATALOG[k]?.build() ?? null });
    expect(count(2.5)).toBe(0);
    expect(count(6)).toBe(1);
    expect(count(9.5)).toBe(0);
  });

  it('labels a soldier with the operator played then and their role symbol', () => {
    expect(operatorLabel(dataset, 0, 1.5)).toBe('Ash ➤');
    expect(operatorLabel(dataset, 3, 4)).toBe('Mute ↯');
  });
});
