import { describe, expect, it } from 'vitest';
import { exprToChartData, readChartData } from './convert';
import { tableOf } from './draw';

describe('charts made elsewhere, in the module form', () => {
  it('turn an expression chart into chart data: labels the groups, sides the series', () => {
    const d = exprToChartData(
      { v: 1, kind: 'bar', measure: { expr: 'count()', name: 'Rows' }, groupBy: { by: 'column', column: 'team' }, diff: { a: { label: 'A', filter: '' }, b: { label: 'B', filter: '' } } },
      { labels: ['Allies', 'Axis'], series: [{ label: 'A', values: [3, 4] }, { label: 'B', values: [5, NaN] }], unit: '', rows: 12, at: 0, dataset: 'x' },
    );
    expect(d.kind).toBe('bar');
    expect(d.groups.map((g) => g.label)).toEqual(['Allies', 'Axis']);
    expect(d.series.map((s) => s.label)).toEqual(['A', 'B']);
    expect(d.values[1][1]).toBeNaN();
    expect(d.format).toBe('int');
    expect(tableOf(d).rows[0]).toEqual(['Allies', '3', '5']);
    const line = exprToChartData({ v: 1, kind: 'line', measure: { expr: 'avg(speed)' }, groupBy: { by: 'time' } }, { labels: ['0:00', '1:00'], series: [{ label: 'x', values: [1.5, 2] }], unit: 'm/s', rows: 2, at: 0, dataset: '' });
    expect(line.kind).toBe('line');
    expect(line.format).toBe('dec');
    expect(line.valueLabel).toBe('avg(speed) (m/s)');
  });

  it('read chart data back from JSON, whole and checked', () => {
    const d = readChartData(JSON.parse(JSON.stringify({ kind: 'histogram', groups: [{ key: 'a', label: 'x' }], series: [{ key: 's', label: 'y', team: 1 }], values: [[null]], format: 'int', valueLabel: 'v', rows: 3, axis: { lo: 0, hi: 1, label: 'speed' } })));
    expect(d).not.toBeNull();
    expect(d!.kind).toBe('histogram');
    expect(d!.values[0][0]).toBeNaN();
    expect(d!.series[0].team).toBe(1);
    expect(d!.axis?.label).toBe('speed');
    expect(readChartData({ kind: 'nope', groups: [], series: [], values: [] })!.kind).toBe('bar');
    expect(readChartData({ groups: 1 })).toBeNull();
  });
});
