import { describe, expect, it } from 'vitest';
import {
  TEAM_MAX_HUES,
  isUnassignedLabel,
  mixTeamColor,
  reverse16,
  teamHeatColor,
  teamHeatColors,
  teamHueCount,
  teamSlice,
} from './colors';

/**
 * How many hues, and which group gets which.
 *
 * Dividing the circle by the group count is right up to a point and unusable
 * past it. `derive_teams.py` numbers landing places in position order, so
 * hundreds of places gave neighbouring beaches hues under a degree apart — and
 * since a round only ever shows a couple of dozen of those ids, no reordering
 * could rescue it: the hues available were simply too close together. So the divisor is capped and
 * ids above the cap are placed by repeated halving.
 */
describe('the hue assignment', () => {
  it('gives every group its own hue while there are few enough', () => {
    for (const n of [1, 2, 3, 4, 8, TEAM_MAX_HUES]) {
      expect(teamHueCount(n), `n=${n}`).toBe(n);
      const seen = new Set<number>();
      for (let i = 0; i < n; i++) seen.add(teamSlice(i, n));
      expect(seen.size, `n=${n}`).toBe(n);
    }
  });

  it('and stops dividing once the hues would stop being distinguishable', () => {
    for (const n of [TEAM_MAX_HUES + 1, 29, 36, 100, 510, 521]) {
      expect(teamHueCount(n), `n=${n}`).toBe(TEAM_MAX_HUES);
      const seen = new Set<number>();
      for (let i = 0; i < n; i++) seen.add(teamSlice(i, n));
      // Never more hues than the cap, and never a hue outside it.
      expect(seen.size, `n=${n}`).toBeLessThanOrEqual(TEAM_MAX_HUES);
      for (const s of seen) expect(s, `n=${n}`).toBeLessThan(TEAM_MAX_HUES);
      // Once there are comfortably more groups than hues, all of them get used.
      // Not asserted just above the cap: halving n ids into fewer slices need not
      // hit every one, and demanding it would be demanding that a sequence built
      // to spread also happen to be surjective at every length.
      if (n >= 2 * TEAM_MAX_HUES) expect(seen.size, `n=${n}`).toBe(TEAM_MAX_HUES);
    }
  });

  it('places nearby ids far apart, which is what the halving is for', () => {
    /**
     * The property that fixes the picture. Ids near each other are places near
     * each other, so what matters is the hue distance between id `i` and `i+1`,
     * not the average over the palette.
     *
     * Asserted as a mean rather than a minimum: with 510 ids over 16 hues some
     * consecutive pair must eventually collide, and demanding otherwise would be
     * demanding an impossibility. Under the old in-order assignment this mean was
     * one slice; the halving lifts it to a third of the circle or more.
     */
    for (const n of [29, 36, 100, 510]) {
      const slices = teamHueCount(n);
      let total = 0;
      for (let i = 0; i + 1 < n; i++) {
        const d = Math.abs(teamSlice(i, n) - teamSlice(i + 1, n));
        total += Math.min(d, slices - d) / slices;
      }
      expect(total / (n - 1), `n=${n}`).toBeGreaterThan(0.3);
    }
  });

  it('leaves two groups exactly opposite, which is the case with no slack', () => {
    // Below the cap nothing changes: the even split already puts two teams as far
    // apart as a circle allows, and reordering could only spoil it.
    expect(teamSlice(0, 2)).toBe(0);
    expect(teamSlice(1, 2)).toBe(1);
  });

  it('reverses bits the way repeated halving requires', () => {
    // 0, ½, ¼, ¾, ⅛, ⅝, ⅜, ⅞ — each new value in the middle of the largest gap.
    const eighths = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (reverse16(i) / 65536) * 8);
    expect(eighths).toEqual([0, 4, 2, 6, 1, 5, 3, 7]);
  });

  it('recognises the labels that name no group', () => {
    // 0 is what `derive_teams.py` writes for a player whose spawn could not be
    // read — every AI row. Treated as a team it was 18% of one file rendered in
    // one confident colour.
    for (const l of ['0', '', ' 0 ', 'none', 'Unknown', 'NULL', '-1']) {
      expect(isUnassignedLabel(l), l).toBe(true);
    }
    for (const l of ['1', '27', '510', 'alpha']) {
      expect(isUnassignedLabel(l), l).toBe(false);
    }
  });
});
/**
 * The colour rules for the per-team heat mode.
 *
 * Worth pinning because every one of them is a claim about *readability* that is
 * invisible in code: evenly spaced hues, equal brightness across hues, a mixture
 * that sits between its ingredients, and a density axis that never touches hue.
 * Get any of them wrong and the mode still renders — it just stops meaning what
 * it says.
 */

/** Perceived brightness, near enough for comparing hues at equal lightness. */
const luma = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * A colour's Oklab lightness, chroma and hue, measured back out of its sRGB.
 *
 * The inverse of what `teamHeatColor` does, written out separately here on
 * purpose: it makes these a round-trip check rather than a restatement of the
 * implementation, and it is the only way to measure the spacing in the space the
 * spacing is defined in. Measuring hue the RGB way — max channel, then the
 * others — is what the first version of this file did, and it reported evenly
 * spaced Oklch hues as unevenly spaced, because RGB hue angles and perceptual
 * hue angles are not the same circle. That disagreement is the entire reason for
 * preferring one over the other.
 */
function oklabOf([r, g, b]: [number, number, number]): { L: number; C: number; h: number } {
  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(Bb, A) / (Math.PI * 2) + 1) % 1;
  return { L, C: Math.hypot(A, Bb), h };
}

const hueOf = (c: [number, number, number]) => oklabOf(c).h;

/** Shortest distance between two hue angles, in turns. */
function hueGap(a: number, b: number): number {
  const d = Math.abs(a - b) % 1;
  return Math.min(d, 1 - d);
}

describe('teamHeatColor — dividing the circle', () => {
  it('spaces teams evenly around the hue circle', () => {
    /**
     * The *set* of hues is evenly spaced; the sequence deliberately is not.
     *
     * Consecutive ids are consecutive landing places, so giving id `i` hue `i/n`
     * made neighbouring teams indistinguishable — see the slice permutation. What
     * survives, and what this asserts, is that the n hues still sit at the n slice
     * centres: sort them and the gaps are equal.
     */
    // Only up to the cap: past it the divisor stops growing, so several groups
    // share a hue and the sorted gaps include zeros by design.
    for (const n of [2, 3, 4, 5, 8, TEAM_MAX_HUES]) {
      const hues = Array.from({ length: n }, (_, i) => hueOf(teamHeatColor(i, n))).sort(
        (a, b) => a - b,
      );
      for (let i = 0; i < n; i++) {
        const gap = hueGap(hues[i], hues[(i + 1) % n]);
        expect(gap, `n=${n} at ${i}`).toBeCloseTo(1 / n, 5);
      }
    }
  });

  it('takes the centre of each slice, not its edge', () => {
    // Edges would put team 0 at hue 0 for every count, and with an even count put
    // one team exactly opposite it — so "opposite" would mean different pairs at
    // five teams and at six. Centres keep the arrangement consistent.
    expect(hueOf(teamHeatColor(0, 4))).toBeCloseTo(0.125, 5);
    expect(hueOf(teamHeatColor(0, 6))).toBeCloseTo(1 / 12, 5);
    expect(hueOf(teamHeatColor(0, 2))).toBeCloseTo(0.25, 5);
  });

  it('puts two teams on opposite sides of the circle', () => {
    // The user-visible promise: with two teams the colours are as far apart as
    // colours get.
    const a = hueOf(teamHeatColor(0, 2));
    const b = hueOf(teamHeatColor(1, 2));
    expect(hueGap(a, b)).toBeCloseTo(0.5, 5);
  });

  it('keeps every hue at the same brightness', () => {
    // The reason the circle is divided in Oklch and not in HSL. Density is
    // carried by opacity here, so a hue that is intrinsically brighter reads as
    // more traffic than it has. Evenly spaced HSL hues at full saturation span a
    // nine-fold luminance range — measured, 9.1x across eight teams — because
    // HSL "lightness" is the midpoint of the extreme channels and not a
    // brightness at all. Blue against yellow is the worst pair and the one this
    // guards.
    for (const n of [2, 3, 8, 16]) {
      const lumas = Array.from({ length: n }, (_, i) => luma(teamHeatColor(i, n)));
      expect(Math.max(...lumas) / Math.min(...lumas)).toBeLessThan(1.35);
    }
  });

  it('gives every team the same chroma and lightness', () => {
    // Saturation carries identity in this mode, so it has to be spent equally: a
    // team whose colour is nearer grey than its neighbours' looks like a team
    // with less data. Constant by construction in Oklch, so this is really a
    // check that the transform is right and nothing is being clamped.
    const measured = Array.from({ length: 8 }, (_, i) => oklabOf(teamHeatColor(i, 8)));
    const chromas = measured.map((m) => m.C);
    const lights = measured.map((m) => m.L);
    expect(Math.min(...chromas)).toBeGreaterThan(0.09);
    expect(Math.max(...chromas) - Math.min(...chromas)).toBeLessThan(0.004);
    expect(Math.max(...lights) - Math.min(...lights)).toBeLessThan(0.004);
  });

  it('stays inside the sRGB gamut at every hue', () => {
    // The lightness and chroma constants are chosen to fit every hue *without*
    // clamping, because clamping is per-hue and would quietly restore the
    // inequality the Oklch circle exists to remove. If either is raised too far
    // this fails rather than silently desaturating a few teams.
    for (const n of [2, 3, 5, 7, 12, 24]) {
      for (let i = 0; i < n; i++) {
        for (const v of teamHeatColor(i, n)) {
          expect(v).toBeGreaterThan(0.001);
          expect(v).toBeLessThan(0.999);
        }
      }
    }
  });

  it('wraps an out-of-range index rather than failing', () => {
    // Team ids arrive from data and a stale selection can outlive its dataset.
    expect(teamHeatColor(7, 3)).toEqual(teamHeatColor(1, 3));
    expect(teamHeatColor(-1, 3)).toEqual(teamHeatColor(2, 3));
    expect(() => teamHeatColor(0, 0)).not.toThrow();
  });

  it('packs each team as an Oklab (a, b) pair for the GPU', () => {
    // Two numbers per team, not three: lightness is shared, so all accumulation
    // has to carry is where on the colour plane the mixture lands.
    const packed = teamHeatColors(5);
    expect(packed.length).toBe(10);
    for (let i = 0; i < 5; i++) {
      const measured = oklabOf(teamHeatColor(i, 5));
      const a = packed[i * 2];
      const b = packed[i * 2 + 1];
      expect(Math.hypot(a, b)).toBeCloseTo(measured.C, 2);
      expect((Math.atan2(b, a) / (Math.PI * 2) + 1) % 1).toBeCloseTo(measured.h, 2);
    }
  });

  it('packs opposed teams as exact negatives', () => {
    // The property the whole mixing scheme rests on: opposites cancel, so a dead
    // heat between two teams lands on the neutral axis rather than near it.
    const packed = teamHeatColors(2);
    expect(packed[0]).toBeCloseTo(-packed[2], 12);
    expect(packed[1]).toBeCloseTo(-packed[3], 12);
  });
});

describe('mixTeamColor — what an overlap looks like', () => {
  /** Team `i` of `n` as the `(a, b)` pair the accumulator stores. */
  const ab = (i: number, n: number): [number, number] => {
    const p = teamHeatColors(n);
    return [p[i * 2], p[i * 2 + 1]];
  };
  const [a0, b0] = ab(0, 3);
  const [a1, b1] = ab(1, 3);

  it('is the team colour where only one team is present', () => {
    const mixed = mixTeamColor(a0 * 7, b0 * 7, 7);
    const want = teamHeatColor(0, 3);
    for (let i = 0; i < 3; i++) expect(mixed[i]).toBeCloseTo(want[i], 5);
  });

  it('does not change as more of the same team arrives', () => {
    // The reason hue is read from a *normalised* sum. Otherwise a busy spot and a
    // quiet spot belonging to the same team would be different colours, and the
    // colour would drift as the accumulation filled in.
    const light = mixTeamColor(a0, b0, 1);
    const heavy = mixTeamColor(a0 * 900, b0 * 900, 900);
    for (let i = 0; i < 3; i++) expect(heavy[i]).toBeCloseTo(light[i], 6);
  });

  it('lands halfway between two teams when they overlap equally', () => {
    // Halfway on the colour plane, which is what "mixed" should mean to a reader.
    const mixed = mixTeamColor(a0 + a1, b0 + b1, 2);
    const want = oklabOf(mixed);
    const half = oklabOf(mixTeamColor((a0 + a1) / 2, (b0 + b1) / 2, 1));
    expect(want.h).toBeCloseTo(half.h, 5);
    expect(want.C).toBeCloseTo(half.C, 5);
  });

  it('leans toward whichever team is denser', () => {
    const mixed = oklabOf(mixTeamColor(a0 * 9 + a1, b0 * 9 + b1, 10));
    const near = oklabOf(teamHeatColor(0, 3));
    const far = oklabOf(teamHeatColor(1, 3));
    expect(hueGap(mixed.h, near.h)).toBeLessThan(hueGap(mixed.h, far.h));
  });

  it('goes exactly grey for two opposed teams, at any boost', () => {
    // Grey is the honest answer for "equally contested", and boost must not
    // invent a winner where there is none. Exact here, not merely close, because
    // the pairs cancel on the colour plane rather than after a curve — the two
    // earlier attempts at this mixed in sRGB and in linear RGB and left a cast of
    // 0.044 and 0.096 respectively.
    const [p, q] = [ab(0, 2), ab(1, 2)];
    for (const boost of [1, 2, 6]) {
      const mixed = mixTeamColor(p[0] + q[0], p[1] + q[1], 2, boost);
      expect(Math.max(...mixed) - Math.min(...mixed)).toBeLessThan(1e-6);
    }
  });

  it('boost sharpens an existing imbalance without leaving the gamut', () => {
    const plain = oklabOf(mixTeamColor(a0 * 6 + a1 * 4, b0 * 6 + b1 * 4, 10, 1));
    const sharp = mixTeamColor(a0 * 6 + a1 * 4, b0 * 6 + b1 * 4, 10, 2);
    expect(oklabOf(sharp).C).toBeGreaterThan(plain.C);
    // …and the hue is unchanged: boost is a chroma control, not a hue control.
    expect(oklabOf(sharp).h).toBeCloseTo(plain.h, 3);
    for (const v of sharp) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('has no colour where there is no weight', () => {
    // An empty pixel must not divide by zero and must not come out grey either:
    // grey is a reading, and "nothing here" is the absence of one.
    expect(mixTeamColor(0, 0, 0)).toEqual([0, 0, 0]);
    expect(mixTeamColor(1, 1, -1)).toEqual([0, 0, 0]);
  });
});
