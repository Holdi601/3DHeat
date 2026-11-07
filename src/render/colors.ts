import { TEAM_HUES, type ColorStop, type HeatColorScheme } from '../state/types';

export const LUT_WIDTH = 256;
/** Row 0 = positive ramp, row 1 = negative ramp. */
export const LUT_HEIGHT = 2;

/**
 * Bake the editable colour stops into an RGBA8 texture the composite shader
 * samples. Straight (non-premultiplied) alpha; the shader premultiplies.
 */
export function buildColorLut(scheme: HeatColorScheme, out?: Uint8Array): Uint8Array {
  const lut = out ?? new Uint8Array(LUT_WIDTH * LUT_HEIGHT * 4);
  writeRamp(lut, 0, scheme.positive);
  writeRamp(lut, 1, scheme.negative);
  return lut;
}

function writeRamp(lut: Uint8Array, row: number, stopsIn: ColorStop[]): void {
  const stops = [...stopsIn].sort((a, b) => a.pos - b.pos);
  if (stops.length === 0) {
    lut.fill(0, row * LUT_WIDTH * 4, (row + 1) * LUT_WIDTH * 4);
    return;
  }
  const base = row * LUT_WIDTH * 4;
  let si = 0;
  for (let i = 0; i < LUT_WIDTH; i++) {
    const t = i / (LUT_WIDTH - 1);
    while (si < stops.length - 2 && t > stops[si + 1].pos) si++;
    const a = stops[Math.min(si, stops.length - 1)];
    const b = stops[Math.min(si + 1, stops.length - 1)];
    const span = b.pos - a.pos;
    const f = span > 1e-6 ? clamp01((t - a.pos) / span) : t <= a.pos ? 0 : 1;
    const o = base + i * 4;
    // Interpolate in linear light so red->yellow doesn't dip through mud.
    lut[o + 0] = linearMixToSrgb8(a.rgb[0], b.rgb[0], f);
    lut[o + 1] = linearMixToSrgb8(a.rgb[1], b.rgb[1], f);
    lut[o + 2] = linearMixToSrgb8(a.rgb[2], b.rgb[2], f);
    lut[o + 3] = Math.round(clamp01(a.alpha + (b.alpha - a.alpha) * f) * 255);
  }
}

function linearMixToSrgb8(a8: number, b8: number, f: number): number {
  const a = srgbToLinear(a8 / 255);
  const b = srgbToLinear(b8 / 255);
  return Math.round(clamp01(linearToSrgb(a + (b - a) * f)) * 255);
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** CSS colour for a swatch, matching what the shader will produce. */
export function stopToCss(stop: ColorStop): string {
  return `rgba(${stop.rgb[0]}, ${stop.rgb[1]}, ${stop.rgb[2]}, ${stop.alpha.toFixed(3)})`;
}

/**
 * One hue family per team, one shade per member, so a glance tells you which
 * side someone is on before you can read a label.
 */
export function teamMemberColor(
  teamIndex: number,
  memberIndex: number,
  memberCount: number,
): [number, number, number] {
  const hue = TEAM_HUES[((teamIndex % TEAM_HUES.length) + TEAM_HUES.length) % TEAM_HUES.length];
  const n = Math.max(1, memberCount);
  // Spread members across lightness and a little saturation; keep everything
  // bright enough to read against the dark default background.
  const f = n === 1 ? 0.5 : memberIndex / (n - 1);
  const light = 0.42 + 0.34 * f;
  const sat = 0.9 - 0.25 * f;
  return hslToRgb(hue / 360, sat, light);
}

export function teamBaseColor(teamIndex: number): [number, number, number] {
  const hue = TEAM_HUES[((teamIndex % TEAM_HUES.length) + TEAM_HUES.length) % TEAM_HUES.length];
  return hslToRgb(hue / 360, 0.82, 0.55);
}

/**
 * One hue per team, from the hue circle divided by however many teams there are.
 *
 * Team `i` of `n` takes the *centre* of its slice — `(i + 0.5) / n` — rather than
 * its edge. Taking edges puts team 0 at hue 0 and, whenever `n` is even, team
 * `n/2` exactly opposite it, which sounds tidy and is the one arrangement to
 * avoid: with an odd count the pairs no longer line up, so a five-team map and a
 * six-team map disagree about which colour "opposite" means. Centres keep the
 * spacing even and every team the same distance from its neighbours regardless
 * of the count.
 *
 * Full saturation, mid lightness. Both matter for what these colours are for:
 * saturation is the only axis carrying team identity here — density is carried by
 * how opaque the pixel is — so spending any of it on shading would be spending
 * the signal. Mid lightness keeps every hue at a similar brightness, so a red
 * team and a yellow team read as equally present rather than yellow looking
 * hotter, which it does at high lightness.
 *
 * Distinct from `teamBaseColor`, which draws from a fixed hand-picked palette and
 * is right for cubes and legends: a palette of nine is more readable at small
 * counts, and does not change every team's colour when a tenth team appears. This
 * one has to divide evenly, because the whole point of it is that a mixture of
 * two teams is a colour halfway between them.
 */
export function teamHeatColor(teamIndex: number, teamCount: number): [number, number, number] {
  const [r, g, b] = teamHeatColorLinear(teamIndex, teamCount);
  return [toSrgb(r), toSrgb(g), toSrgb(b)];
}

/**
 * Which slice of the circle group `i` gets.
 *
 * Two regimes, because the honest answer differs at two teams and at five
 * hundred.
 *
 * Up to `TEAM_MAX_HUES` groups, the slice *is* the id: the circle is divided by
 * the group count and each takes the centre of its own slice, which is the
 * original arrangement — two teams exactly opposite, every count consistent with
 * every other. Nothing about that case changes.
 *
 * Past it, the divisor stops growing. Dividing by every id is what made the map
 * unreadable: `derive_teams.py` numbers landing places in position order, so
 * hundreds of places gave neighbouring beaches hues under a degree apart, and a
 * single round only ever shows a couple of dozen of them. Ids are then placed by repeated
 * halving instead — 0, then the far side, then the quarter points, then the
 * eighths — so ids that are near each other land as far apart as the circle
 * allows, and every hue drawn is plainly distinct from its neighbour.
 *
 * The cost above the cap is that two groups can share a hue. That is a real loss
 * and the better trade: a colour shared with one other team out of five hundred
 * is still information, whereas five hundred colours nobody can tell apart is
 * none.
 */
export function teamSlice(teamIndex: number, teamCount: number): number {
  const n = Math.max(1, Math.floor(teamCount));
  const slices = teamHueCount(n);
  const i = ((Math.floor(teamIndex) % n) + n) % n;
  // Few enough groups that every one can have its own hue: the plain even split,
  // which is the arrangement with two teams exactly opposite and every count
  // consistent with every other.
  if (slices >= n) return i;
  // More groups than there are distinguishable hues. Ids are then placed by
  // repeated halving — 0, then the far side, then the two quarter points, then
  // the eighths — so ids that are close together land as far apart as the circle
  // allows. That is what `reverseBits` computes in one step.
  return (reverse16(i) * slices) >>> 16;
}

/**
 * How many distinct hues to use for `n` groups.
 *
 * The number that fixes the actual complaint. Dividing the circle by every id
 * sounded right and is unusable at scale: hundreds of landing places gave hues
 * under a degree apart, and a round only ever shows a couple of dozen of them,
 * so neighbouring teams were the same colour to the eye. Capping the hue count
 * means each colour is plainly distinct; the cost is that above the cap two
 * groups can share one, which the legend and the group filter still separate.
 *
 * Sixteen puts adjacent hues 22.5 degrees apart, which is still a plain
 * difference at constant lightness, and it is the number that covers the coarse
 * groupings the test data produces: a coast of fewer than twenty spawn areas,
 * a dozen or so of them busy. A cap of twelve would force arbitrary collisions
 * among the busy ones, which is a worse outcome than a slightly tighter circle.
 * The finer groupings - hundreds of co-landing places, a few dozen teams in a
 * round - are past any cap and rely on the halving below instead.
 *
 * Below the cap nothing changes at all, so the two- and three-team cases keep the
 * exact arrangement they had.
 */
export const TEAM_MAX_HUES = 16;

export function teamHueCount(teamCount: number): number {
  return Math.min(Math.max(1, Math.floor(teamCount)), TEAM_MAX_HUES);
}

/**
 * Reverse the low 16 bits, which is what turns counting into repeated halving.
 *
 * `reverse16(0, 1, 2, 3, …) / 65536` walks 0, ½, ¼, ¾, ⅛, ⅝, ⅜, ⅞ — every new
 * value falls in the middle of the largest remaining gap. Written out rather than
 * using `reverseBits` because the same five lines have to exist in WGSL and in
 * GLSL ES 3.00, and the latter has no such builtin.
 */
/**
 * Labels that name no group, rather than naming one.
 *
 * `derive_teams.py` writes 0 for a player whose spawn could not be read: every
 * AI, and anyone whose session was logged from partway through. Zero is a real
 * value in the column, so it becomes a group like any other and takes a slice of
 * the hue circle — on one file that was 18% of rows drawn as one confident colour
 * across the whole map, which looks exactly like a team that is everywhere.
 *
 * Lives here rather than in the engine because the legend has to agree with the
 * picture: a swatch showing a hue for a group the shader draws grey is worse than
 * no swatch, since it looks authoritative.
 */
const UNASSIGNED_LABELS = new Set(['0', '', 'none', 'unknown', 'null', '-1']);

export function isUnassignedLabel(label: string): boolean {
  return UNASSIGNED_LABELS.has(label.trim().toLowerCase());
}

/** Neutral grey at the palette's lightness: what an abstaining group looks like. */
export function teamNeutralColor(): [number, number, number] {
  return oklabToRgb(TEAM_LIGHTNESS, 0, 0);
}

export function reverse16(x: number): number {
  let v = x & 0xffff;
  v = ((v >>> 1) & 0x5555) | ((v & 0x5555) << 1);
  v = ((v >>> 2) & 0x3333) | ((v & 0x3333) << 2);
  v = ((v >>> 4) & 0x0f0f) | ((v & 0x0f0f) << 4);
  v = ((v >>> 8) & 0x00ff) | ((v & 0x00ff) << 8);
  return v & 0xffff;
}


/**
 * The same hue in *linear* light, which is what the accumulation buffer holds.
 *
 * The distinction matters and it is not pedantry. Overlapping team colours are
 * summed on the GPU, and a sum is only a mixture of light if the values being
 * summed are proportional to light. sRGB values are not — they are gamma
 * encoded — so averaging the sRGB triples of two opposed hues does not give grey
 * but a colour with a visible cast; measured, a spread of 0.044 between its
 * channels where zero was intended. In linear light the two are exact negatives
 * about the neutral axis and cancel properly, which is what "these two teams are
 * equally present here" should look like.
 *
 * So: linear for the GPU tints and for any mixing arithmetic, sRGB for swatches
 * and legends, and the conversion happens once at composite.
 */
export function teamHeatColorLinear(
  teamIndex: number,
  teamCount: number,
): [number, number, number] {
  const slices = teamHueCount(teamCount);
  const slice = teamSlice(teamIndex, teamCount);
  return oklchToLinearRgb((slice + 0.5) / slices, TEAM_CHROMA, TEAM_LIGHTNESS);
}

/**
 * Fixed lightness and chroma for the team hues, in Oklab terms.
 *
 * The circle is divided in Oklch rather than in HSL, and that is not fussiness.
 * Equal steps of HSL hue at full saturation are wildly unequal in brightness:
 * pure blue has a relative luminance of 0.07 and pure yellow 0.93, so eight teams
 * spaced evenly in HSL span a nine-fold brightness range. In *this* mode that is
 * a correctness problem rather than a cosmetic one, because density is carried by
 * how opaque a pixel is — so a blue team's hotspot would read as much quieter
 * than a yellow team's identical one, and no amount of staring would tell you it
 * was the palette rather than the data.
 *
 * Oklch is a hue circle at genuinely constant lightness, so "divide the circle
 * evenly" and "every team equally visible" are both true at once. Mixing benefits
 * too: the average of two colours of equal lightness has that lightness, so a
 * contested pixel does not change apparent density as it changes hue.
 *
 * The values are the largest chroma that stays inside sRGB for *every* hue at
 * this lightness — picked that way because clamping per hue would quietly
 * reintroduce the inequality this exists to remove. `teamHeatColor` is tested for
 * gamut, so raising either number will fail rather than silently desaturate.
 *
 * Exported because both shader backends need the same two numbers, interpolated
 * into their source. A second copy written out in WGSL and again in GLSL is three
 * places for one decision to drift between, and the failure would be a palette
 * that mixes to something slightly off-neutral only on one backend.
 */
export const TEAM_LIGHTNESS = 0.7;
export const TEAM_CHROMA = 0.115;

/**
 * Oklch (hue in turns, chroma, lightness) to sRGB 0..1.
 *
 * Björn Ottosson's Oklab, plus the sRGB transfer function. Worth the thirty lines
 * over reaching for HSL: HSL's "lightness" is the midpoint of the largest and
 * smallest channel, which has almost nothing to do with how bright a colour
 * looks, and every palette built on it inherits that.
 */
export function oklchToRgb(
  hueTurns: number,
  chroma: number,
  lightness: number,
): [number, number, number] {
  const [r, g, b] = oklchToLinearRgb(hueTurns, chroma, lightness);
  return [toSrgb(r), toSrgb(g), toSrgb(b)];
}

/** Oklch to *linear* sRGB, clamped to the gamut. */
export function oklchToLinearRgb(
  hueTurns: number,
  chroma: number,
  lightness: number,
): [number, number, number] {
  const h = hueTurns * Math.PI * 2;
  return oklabToLinearRgb(lightness, Math.cos(h) * chroma, Math.sin(h) * chroma);
}

export function toSrgb(linear: number): number {
  const v = clamp01(linear);
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

/**
 * Every team's position on the Oklab colour plane, as `(a, b)` pairs.
 *
 * What the GPU accumulates, and it is deliberately *not* RGB. Mixing has to
 * happen somewhere, and where it happens decides what a contested pixel looks
 * like:
 *
 *   - Averaging **sRGB** triples is the usual mistake: the values are gamma
 *     encoded, so they are not proportional to light and their mean is not a
 *     mixture of anything. Two opposed hues came out with a clear cast rather
 *     than neutral — measured, 0.044 of spread between channels.
 *   - Averaging **linear** RGB is at least physically a mixture of light, and it
 *     is still wrong here, worse in fact at 0.096 of spread. Oklab reaches RGB
 *     through a cube, so a mean taken after that curve is not the mean before it,
 *     and hues that are perceptual opposites are not physical complements.
 *   - Averaging in **Oklab** is exact: opposed hues have `(a, b)` that are exact
 *     negatives, so they cancel to the neutral axis and a dead heat is grey,
 *     which is what a dead heat should look like.
 *
 * Oklab also makes the chroma boost well behaved, which none of the others do:
 * boosting is scaling `(a, b)` away from zero, so it sharpens a real imbalance
 * and leaves a genuine tie exactly where it is. Amplifying an RGB cast would have
 * invented a winner out of a rounding artefact.
 *
 * Lightness is not stored per team. Every team shares `TEAM_LIGHTNESS`, so the
 * only thing accumulation has to carry is where on the colour plane the mixture
 * sits, plus how much of it there is.
 */
export function teamHeatColors(teamCount: number): Float32Array {
  const n = Math.max(1, Math.floor(teamCount));
  // Through the same permutation the shaders use. This is not currently read by
  // the renderer — both shaders derive the hue from the group index themselves,
  // which saves a buffer binding — so it exists as the CPU statement of the same
  // rule, and a version that skipped the stride would be a second, disagreeing
  // definition waiting for someone to use it.
  const slices = teamHueCount(n);
  const out = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const h = ((teamSlice(i, n) + 0.5) / slices) * Math.PI * 2;
    out[i * 2] = Math.cos(h) * TEAM_CHROMA;
    out[i * 2 + 1] = Math.sin(h) * TEAM_CHROMA;
  }
  return out;
}

/**
 * What a pixel's colour is, given the summed team-weighted colour and the summed
 * weight at it.
 *
 * The rule the whole mode rests on, and the reason it needs two accumulated
 * quantities rather than one. `sum` is the sum over every sprite of its team's
 * colour times its contribution; `weight` is the sum of the contributions alone.
 * Their ratio is the *contribution-weighted mean team colour* — which is the
 * mixture, and which is independent of how much heat there is. Density then comes
 * from `weight` on its own and drives opacity.
 *
 * Separating them that way is what makes every other control keep working: the
 * ramp, the response curve, the saturation point and the minimum all act on
 * `weight` exactly as they do in the single-colour modes, and hue is carried
 * orthogonally. It also means the colour of a spot does not drift as more of the
 * same team's data arrives, which it would under any scheme that read hue off an
 * un-normalised sum.
 *
 * `boost` pushes the mixture away from grey. Averaging opposed hues lands on grey
 * — which is the honest answer for "equally contested" and is why it is the
 * default — but with many teams almost every busy pixel is a mixture of several,
 * and a map that is grey everywhere has lost the plot. Boost amplifies whatever
 * imbalance exists without inventing one: at 1 it does nothing, and a pixel that
 * is genuinely a dead heat stays grey at any setting.
 */
export function mixTeamColor(
  sumA: number,
  sumB: number,
  weight: number,
  boost = 1,
): [number, number, number] {
  if (!(weight > 0)) return [0, 0, 0];
  const a = (sumA / weight) * boost;
  const b = (sumB / weight) * boost;
  return oklabToRgb(TEAM_LIGHTNESS, a, b);
}

/** Oklab (L, a, b) to sRGB 0..1. */
export function oklabToRgb(L: number, a: number, b: number): [number, number, number] {
  const [r, g, bl] = oklabToLinearRgb(L, a, b);
  return [toSrgb(r), toSrgb(g), toSrgb(bl)];
}

export function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    clamp01(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp01(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp01(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function rgbToCss([r, g, b]: [number, number, number]): string {
  const to8 = (v: number) => Math.round(clamp01(v) * 255);
  return `rgb(${to8(r)}, ${to8(g)}, ${to8(b)})`;
}

/** h, s, l in 0..1 -> linear-ish sRGB 0..1 triple. */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hueToChannel(p, q, h + 1 / 3), hueToChannel(p, q, h), hueToChannel(p, q, h - 1 / 3)];
}

function hueToChannel(p: number, q: number, tIn: number): number {
  let t = tIn;
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
