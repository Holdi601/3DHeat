import { describe, expect, it } from 'vitest';
import { TEAM_CHROMA, TEAM_LIGHTNESS, oklabToRgb } from './colors';
import { COMPOSITE_FS, HEAT_VS } from './webgl2/shaders';
import { COMPOSITE_WGSL, HEAT_WGSL } from './webgpu/shaders';

/**
 * Do the three copies of the team-colour arithmetic agree?
 *
 * The mode's maths lives in `colors.ts`, in WGSL and in GLSL, and eighteen of its
 * numbers are Oklab coefficients typed out by hand in each place. A single wrong
 * digit or sign there does not crash and does not look like a bug — it produces a
 * plausible palette that is subtly wrong, on one backend only. That is exactly the
 * class of defect a screenshot cannot catch and a reviewer will not see.
 *
 * `probe-teams.mjs` catches it on real hardware by comparing rendered pixels
 * against this file's implementation, but that needs a GPU, a dev server and a
 * couple of minutes. This is the same guarantee for the coefficients alone, from
 * the shader *sources*, in milliseconds — so a typo fails in `npm test` rather
 * than surviving until someone runs the probes.
 *
 * It reads the numbers out of the shader text rather than duplicating them here,
 * because a fourth hand-written copy of the same table would be one more thing to
 * drift.
 */

/** Every float literal in a source string, in order, as written. */
function literals(source: string): number[] {
  return (source.match(/-?\d+\.\d+/g) ?? []).map(Number);
}

/** The body of a named function in a shader source. */
function body(source: string, name: string): string {
  const at = source.indexOf(name);
  expect(at, `${name} is missing from the shader`).toBeGreaterThan(-1);
  const open = source.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`unbalanced braces after ${name}`);
}

/**
 * Ottosson's Oklab-to-linear-sRGB coefficients, in the order the conversion
 * writes them: the three LMS rows, then the three RGB rows.
 *
 * Signs are dropped before comparison — each shader writes them as its own
 * language's `+`/`-` operators, in one case as a leading unary minus inside a
 * vector constructor — so what is checked is the magnitudes and their order. The
 * signs themselves are covered by `teamHeat.test.ts`, which round-trips a colour
 * through an independently written inverse; that is the test that caught the blue
 * row's sign being wrong in the first draft of `colors.ts`.
 */
const OKLAB_COEFFS = [
  0.3963377774, 0.2158037573,
  0.1055613458, 0.0638541728,
  0.0894841775, 1.291485548,
  4.0767416621, 3.3077115913, 0.2309699292,
  1.2684380046, 2.6097574011, 0.3413193965,
  0.0041960863, 0.7034186147, 1.707614701,
];

/** The sRGB transfer function's constants, in the order they are applied. */
const TRANSFER = [1.055, 2.4, 0.055, 12.92, 0.0031308];

describe('the shader copies of the Oklab conversion', () => {
  for (const [name, source] of [
    ['WGSL', COMPOSITE_WGSL],
    ['GLSL', COMPOSITE_FS],
  ] as const) {
    it(`${name} uses the same coefficients as colors.ts`, () => {
      const nums = literals(body(source, 'oklabToSrgb')).map(Math.abs);
      // The matrices come first, in order; the transfer function's constants
      // follow. Compared as a prefix and a suffix rather than as the whole list,
      // so a clamp bound or a comment number in between does not break it.
      expect(nums.slice(0, OKLAB_COEFFS.length)).toEqual(OKLAB_COEFFS);
      for (const c of TRANSFER) expect(nums).toContain(c);
    });
  }

  it('and both reach sRGB, not linear light', () => {
    // Without the transfer function every colour lands too dark and too saturated
    // — which reads as a deliberate palette rather than as a missing step, so it
    // is worth asserting rather than assuming.
    for (const source of [COMPOSITE_WGSL, COMPOSITE_FS]) {
      const b = body(source, 'oklabToSrgb');
      expect(b).toMatch(/2\.4/);
      expect(b).toMatch(/12\.92/);
    }
  });
});

describe('the shader copies of the palette constants', () => {
  it('spend the same chroma as colors.ts', () => {
    // Interpolated into the source from the same constant, so this is really a
    // check that the interpolation happens at all: a shader that hard-coded the
    // number would pass today and drift the first time the palette is retuned.
    for (const source of [HEAT_WGSL, HEAT_VS]) {
      expect(literals(source)).toContain(TEAM_CHROMA);
    }
  });

  it('and the same lightness', () => {
    for (const source of [COMPOSITE_WGSL, COMPOSITE_FS]) {
      expect(literals(source)).toContain(TEAM_LIGHTNESS);
    }
  });

  it('divide the hue circle by a full turn', () => {
    // Half a turn, or degrees, would give a palette that is evenly spaced and
    // wrong: two groups would come out adjacent rather than opposite.
    for (const source of [HEAT_WGSL, HEAT_VS]) {
      expect(source).toMatch(/6\.283185/);
    }
  });

  it('and take the centre of each slice, not its edge', () => {
    // `(i + 0.5) / n`. Edges put group 0 at hue 0 and, only for an even count,
    // group n/2 opposite it — so odd and even counts would disagree about what
    // "opposite" means. The 0.5 is the whole of that fix.
    // Both now index by the permuted *slice* rather than the raw id, so the
    // numerator is `f32(slice)` or `float(slice)` — the `+ 0.5` is what this is
    // about and it survives either spelling.
    for (const source of [HEAT_WGSL, HEAT_VS]) {
      expect(source).toMatch(/\(f(?:32|loat)\(slice\)\s*\+\s*0\.5\)\s*\/\s*f(?:32|loat)\(n\)/);
    }
  });
});

describe('the neutral the shaders will produce for a tie', () => {
  it('is a grey at the palette lightness', () => {
    // What both composites compute when the accumulated mixture is at the origin.
    // Asserted on the CPU implementation because the probe predicts the rendered
    // tie from it: if this were not neutral, the probe's strongest check would be
    // comparing the picture against the wrong answer and passing.
    const [r, g, b] = oklabToRgb(TEAM_LIGHTNESS, 0, 0);
    expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThan
      (1e-6);
    // And a mid grey rather than black or white, or "the tie is neutral" would be
    // satisfied by a mode that drew nothing.
    expect(r).toBeGreaterThan(0.4);
    expect(r).toBeLessThan(0.85);
  });
});
