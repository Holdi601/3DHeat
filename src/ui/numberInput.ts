import { num } from '../i18n';

/**
 * The pure parts of `NumberBox`: what a number box shows, what typed text means
 * and where an arrow key or the wheel takes the value.
 */

/**
 * Typed text as a number: "," or "." as the decimal mark, a leading minus (also
 * the typographic one), an exponent. A comma beside a point is grouping and
 * dropped. null for text that is not a complete number ("", "-", "1e").
 */
export function parseNumber(text: string): number | null {
  let s = text.trim().replace(/[\s  ']/g, '').replace(/[−–]/g, '-');
  if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

/** Decimals a plain number is written with, 0 for a whole one. */
export function decimalsOf(v: number): number {
  const s = String(v);
  if (s.includes('e')) {
    const [mant, exp] = s.split('e');
    return Math.min(12, Math.max(0, (mant.split('.')[1]?.length ?? 0) - Number(exp)));
  }
  return s.split('.')[1]?.length ?? 0;
}

/**
 * The value as the box shows it: rounded to at most `digits` decimals, trailing
 * zeros dropped, the language's decimal mark, no digit grouping.
 */
export function formatBox(value: number, digits: number, fmt: (v: number, digits: number) => string = num): string {
  if (!Number.isFinite(value)) return '';
  const r = Number(value.toFixed(digits));
  return fmt(r, Math.min(digits, decimalsOf(r)));
}

export function clampTo(v: number, min?: number, max?: number): number {
  if (min !== undefined && v < min) return min;
  if (max !== undefined && v > max) return max;
  return v;
}

/** One step up (`dir` 1) or down (-1); `fast` is ten steps. Clamped, and free of float dust. */
export function stepValue(value: number, dir: 1 | -1, step: number, fast: boolean, min?: number, max?: number): number {
  const amount = step * (fast ? 10 : 1);
  const digits = Math.min(10, Math.max(decimalsOf(amount), decimalsOf(value)));
  return clampTo(Number((value + dir * amount).toFixed(digits)), min, max);
}
