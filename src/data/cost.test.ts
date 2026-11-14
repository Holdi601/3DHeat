import { describe, expect, it } from 'vitest';
import { EVENT_KINDS, VEHICLE_CLASSES, type CategoryInput } from './canonical';
import { COST_SOURCE, detectGame, parseValueColumn, priceOf, valueColumns, type ValueInput } from './cost';
import { COST_TABLES } from './costs';
import { costColumns } from './costs/columns';

const cat = (name: string, values: string[]): CategoryInput => {
  const labels = [...new Set(values)];
  return { name, labels, data: Uint32Array.from(values, (v) => labels.indexOf(v)) };
};
const table = (id: string) => COST_TABLES.find((t) => t.id === id)!;
const col = (cols: ReturnType<typeof valueColumns>, name: string) => cols.find((c) => c.name === name)?.data as Float32Array | undefined;
const sum = (a: Float32Array | undefined) => (a ? a.reduce((s, v) => s + v, 0) : 0);

function input(rows: { event: string; name: string; cls: string; person: number; t: number; weapon?: string }[], extra: Partial<ValueInput> = {}): ValueInput {
  return {
    n: rows.length,
    cats: [cat('Name', rows.map((r) => r.name)), cat('weapon', rows.map((r) => r.weapon ?? ''))],
    nums: [],
    event: cat('Event type', rows.map((r) => r.event)),
    vehicleClass: cat('Vehicle class', rows.map((r) => r.cls)),
    targetClass: null,
    person: Uint32Array.from(rows, (r) => r.person),
    personLabels: null,
    session: null,
    time: Float32Array.from(rows, (r) => r.t),
    order: null,
    ...extra,
  };
}

describe('the cost model', () => {
  it('reads value column names, the converters\' and its own', () => {
    expect(parseValueColumn('cost_fired_sl')).toMatchObject({ flow: 'cost', kind: 'fired', currency: 'sl' });
    expect(parseValueColumn('earn_sl')).toMatchObject({ flow: 'earn', kind: null, currency: 'sl' });
    expect(parseValueColumn('net_usd')).toMatchObject({ flow: 'net', currency: 'usd' });
    expect(parseValueColumn('cost_lost')).toMatchObject({ kind: 'lost', currency: 'units' });
    expect(parseValueColumn('cost_banana_usd')).toBeNull();
    expect(parseValueColumn('weapon')).toBeNull();
  });

  it('prices names from the tables, specific entries first', () => {
    const mil = table('military');
    expect(priceOf(mil, 'AIM_120C')?.price).toBe(1.09e6);
    expect(priceOf(mil, 'AIM-9X')?.price).toBe(0.47e6);
    expect(priceOf(mil, 'F-16C_50')?.price).toBe(18.8e6);
    expect(priceOf(mil, 'FA-18E')?.price).toBe(67.4e6);
    expect(priceOf(mil, 'tomahawk')?.price).toBe(2e6);
    expect(priceOf(mil, 'P-40E Kittyhawk')?.price).toBe(45e3);
    expect(priceOf(mil, 'Tornado IDS')?.price).toBe(30e6);
    expect(priceOf(table('cs2'), 'AK-47')?.price).toBe(2700);
    expect(priceOf(table('cs2'), 'Smoke Grenade')?.use).toBe(true);
    expect(priceOf(table('sc2'), 'Siege Tank')?.price).toEqual({ minerals: 150, gas: 125 });
  });

  it('recognises the game from the names in the data', () => {
    expect(detectGame(['F-16C_50', 'AIM_120C', 'Su-27']).id).toBe('military');
    expect(detectGame(['AK-47', 'AWP', 'Glock-18', 'Flashbang']).id).toBe('cs2');
    expect(detectGame(['Marine', 'Zergling', 'Stalker', 'Siege Tank']).id).toBe('sc2');
    expect(detectGame(['Vandal', 'Sheriff', 'Operator', 'Spectre']).id).toBe('valorant');
    expect(detectGame([], ['cashSpentTotal']).id).toBe('cs2');
  });

  it('prices launches, losses and fuel in dollars, with totals', () => {
    const rows = [
      { event: 'position', name: 'F-16C_50', cls: 'fighter', person: 0, t: 0 },
      { event: 'position', name: 'F-16C_50', cls: 'fighter', person: 0, t: 10 },
      { event: 'launch', name: 'AIM_120C', cls: 'weapon', person: 1, t: 11 },
      { event: 'death', name: 'Su-27', cls: 'fighter', person: 2, t: 20 },
      { event: 'death', name: 'Su-27', cls: 'fighter', person: 2, t: 20.5 },
      { event: 'death', name: 'Mystery jet', cls: 'fighter', person: 3, t: 30 },
    ];
    const cols = valueColumns(input(rows));
    expect(sum(col(cols, 'cost_fired_usd'))).toBeCloseTo(1.09e6, -2);
    // The same death logged twice counts once; the unknown jet is the class average.
    expect(sum(col(cols, 'cost_lost_usd'))).toBeCloseTo(30e6 + 30e6, -3);
    const fuel = sum(col(cols, 'cost_fuel_usd'));
    expect(fuel).toBeGreaterThan(0);
    expect(fuel).toBeCloseTo((2500 / 3600) * 10 * 1.15, 1);
    expect(sum(col(cols, 'cost_total_usd'))).toBeCloseTo(1.09e6 + 60e6 + fuel, -3);
    const src = cols.find((c) => c.name === COST_SOURCE)!;
    expect(src.categories![src.data[5]]).toBe('class average');
    expect(src.categories![src.data[2]]).toBe('table');
  });

  it("puts a converter's own columns first and nets income against spending", () => {
    const rows = [
      { event: 'position', name: 'Glock-18', cls: 'infantry', person: 0, t: 0 },
      { event: 'kill', name: 'AK-47', cls: 'infantry', person: 0, t: 1, weapon: 'AK-47' },
    ];
    // A file with its own Silver Lions: no table is asked for them, but they are totalled.
    const own = valueColumns(
      input(rows, {
        nums: [
          { name: 'cost_lost_sl', data: Float32Array.of(0, 500) },
          { name: 'cost_fired_sl', data: Float32Array.of(100, 0) },
          { name: 'earn_sl', data: Float32Array.of(0, 2000) },
        ],
        game: 'cs2',
      }),
    );
    expect(own.map((c) => c.name)).toContain('net_sl');
    expect(Array.from(col(own, 'net_sl')!)).toEqual([-100, 1500]);
    expect(Array.from(col(own, 'cost_total_sl')!)).toEqual([100, 500]);
    // CS2 from its table: the kill reward, and spending from the cash spent.
    const cs = valueColumns(input(rows, { nums: [{ name: 'cashSpentTotal', data: Float32Array.of(0, 2700) }], game: 'cs2' }));
    expect(sum(col(cs, 'earn_cs2'))).toBe(300);
    expect(sum(col(cs, 'cost_spent_cs2'))).toBe(2700);
    expect(sum(col(cs, 'net_cs2'))).toBe(300 - 2700);
  });

  it('keeps resources apart and combines them by the exchange weights', () => {
    const rows = [
      { event: 'spawn', name: 'Siege Tank', cls: 'tank', person: 0, t: 0 },
      { event: 'death', name: 'Siege Tank', cls: 'tank', person: 0, t: 5 },
    ];
    const cols = valueColumns(input(rows, { game: 'sc2' }));
    expect(sum(col(cols, 'cost_spent_minerals'))).toBe(150);
    expect(sum(col(cols, 'cost_spent_gas'))).toBe(125);
    expect(sum(col(cols, 'cost_spent_res'))).toBeCloseTo(150 + 125 * 1.5);
    const mine = valueColumns(input(rows, { game: 'sc2', exchange: { sc2: { gas: 3 } } }));
    expect(sum(col(mine, 'cost_lost_res'))).toBeCloseTo(150 + 125 * 3);
  });

  it('asks the load for the columns it reads', () => {
    const want = costColumns(['x', 'weaponName', 'weapon', 'Vehicle', 'type', 'fuel', 'throttle', 'cost_fired_sl', 'earn_rp', 'other']);
    expect(want).toEqual(expect.arrayContaining(['weaponName', 'weapon', 'Vehicle', 'type', 'fuel', 'throttle', 'cost_fired_sl', 'earn_rp', 'other']));
    expect(want).not.toContain('x');
  });

  it('has a price source and a class fallback in every table', () => {
    for (const t of COST_TABLES) {
      expect(Object.keys(t.sources).length).toBeGreaterThan(0);
      expect(Object.keys(t.classAvg).length).toBeGreaterThan(0);
      for (const k of Object.keys(t.classAvg)) expect(VEHICLE_CLASSES).toContain(k);
    }
    expect(EVENT_KINDS).toContain('launch');
  });
});
