import { describe, expect, it } from 'vitest';
import { clampTo, decimalsOf, formatBox, parseNumber, stepValue } from './numberInput';

const comma = (v: number, d: number) => v.toFixed(d).replace('.', ',');

describe('parseNumber', () => {
  it('reads both decimal marks', () => {
    expect(parseNumber('1,5')).toBe(1.5);
    expect(parseNumber('1.5')).toBe(1.5);
    expect(parseNumber(' 0,25 ')).toBe(0.25);
    expect(parseNumber('.5')).toBe(0.5);
  });
  it('reads signs and exponents', () => {
    expect(parseNumber('-3,5')).toBe(-3.5);
    expect(parseNumber('−3')).toBe(-3);
    expect(parseNumber('1e3')).toBe(1000);
    expect(parseNumber('2,5E-2')).toBe(0.025);
  });
  it('treats a comma beside a point as grouping', () => {
    expect(parseNumber('1,234.5')).toBe(1234.5);
  });
  it('rejects incomplete text', () => {
    for (const s of ['', '-', ',', '1e', 'abc', '1.2.3']) expect(parseNumber(s)).toBeNull();
  });
});

describe('formatBox', () => {
  it('rounds and drops trailing zeros', () => {
    expect(formatBox(57.8998, 2, comma)).toBe('57,9');
    expect(formatBox(2, 3, comma)).toBe('2');
    expect(formatBox(0.1 + 0.2, 4, comma)).toBe('0,3');
  });
  it('shows nothing for a non-number', () => {
    expect(formatBox(NaN, 3)).toBe('');
  });
  it('counts decimals', () => {
    expect(decimalsOf(1.25)).toBe(2);
    expect(decimalsOf(100)).toBe(0);
    expect(decimalsOf(1e-7)).toBe(7);
  });
});

describe('stepValue', () => {
  it('steps without float dust', () => {
    expect(stepValue(0.1, 1, 0.2, false)).toBe(0.3);
    expect(stepValue(0.3, -1, 0.1, false)).toBe(0.2);
  });
  it('steps ten at a time with shift', () => {
    expect(stepValue(1, 1, 0.5, true)).toBe(6);
  });
  it('clamps', () => {
    expect(stepValue(0.98, 1, 0.05, false, 0, 1)).toBe(1);
    expect(clampTo(-2, 0)).toBe(0);
  });
});
