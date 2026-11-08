/**
 * Recognition cues for ships and boats (see cues.ts): what a lookout or a
 * recognition manual names first - funnel count and spacing, the gun
 * arrangement fore and aft (A, B, X, Y and superfiring), the masts, the
 * torpedo tubes, a carrier's island and flight deck.
 *
 * Written from the real ships' published appearance (ONI recognition
 * manuals, general plans, published dimensions); no game data.
 */

import type { NavalSpec, NavalTurret } from '../naval';
import type { Cue, CueEntry } from './cues';

const naval = (figures: string | string[], cues: Cue<NavalSpec>[]): CueEntry<'naval'> => ({ domain: 'naval', figures: typeof figures === 'string' ? [figures] : figures, cues });

// Checks on a naval spec.
const turrets = (s: NavalSpec): NavalTurret[] => s.turrets ?? [];
/** Torpedo tube mounts (the class builder's 0.27 m tube bundles). */
const tubeMounts = (s: NavalSpec) => turrets(s).filter((t) => t.calibre === 0.27);
const tubes = (s: NavalSpec) => tubeMounts(s).length + (s.launchers ?? []).filter((l) => l.kind === 'tubes').length;
/** The main guns: 76 mm and over, not the tubes. */
const mains = (s: NavalSpec, min = 0.076) => turrets(s).filter((t) => t.calibre >= min && t.calibre !== 0.27);
const fwd = (s: NavalSpec, min?: number) => mains(s, min).filter((t) => t.x > 0 && !t.side);
const aft = (s: NavalSpec, min?: number) => mains(s, min).filter((t) => t.x < 0 && !t.side);
/** A gun standing higher than the one ahead of it on that end (B or X superfiring). */
const superfires = (ts: NavalTurret[]) => ts.some((t) => ts.some((u) => Math.abs(u.x) > Math.abs(t.x) && (t.up ?? 0) - (u.up ?? 0) >= 1));
const funnels = (s: NavalSpec) => s.funnels?.length ?? 0;
const mastKind = (k: 'pole' | 'tripod' | 'lattice') => (s: NavalSpec) => !!s.masts?.some((m) => (m.kind ?? 'pole') === k);
const twins = (s: NavalSpec, min?: number) => mains(s, min).every((t) => t.barrels === 2);
const singles = (s: NavalSpec, min?: number) => mains(s, min).every((t) => t.barrels === 1);
const beamGuns = (s: NavalSpec) => mains(s).some((t) => !!t.side);
const beamTubes = (s: NavalSpec) => tubeMounts(s).some((t) => !!t.side);
/** A raised forecastle ending at its break, or a hull outline whose deck steps down aft. */
const forecastle = (s: NavalSpec) => !!s.forecastle || !!s.hullOutline?.top.some((p, i, a) => i > 0 && a[i - 1][1] - p[1] > 1 && Math.abs(a[i - 1][0] - p[0]) < 3);
const flush = (s: NavalSpec) => !forecastle(s);
/** The island blocks to one side (+1 starboard, -1 port) of a carrier. */
const islandSide = (s: NavalSpec) => {
  const b = (s.oneSide ?? []).filter((o) => Math.max(...o.top.map((p) => p[1])) > s.freeboard + 4);
  return b.length ? Math.sign(b[0].side ?? 0) : 0;
};
const islandX = (s: NavalSpec) => {
  const b = (s.oneSide ?? []).filter((o) => Math.max(...o.top.map((p) => p[1])) > s.freeboard + 4);
  return b.length ? b[0].plan[0][0] : NaN;
};
/** The flight deck's forward end as a share of the half-length (1 at the bow). */
const deckFwd = (s: NavalSpec) => Math.max(...(s.decks?.[0]?.plan ?? [[0, 0]]).map((p) => p[0])) / (s.length / 2);
/** Lifts on the deck edge: notches standing out of the flight deck's straight side. */
const edgeLifts = (s: NavalSpec) => {
  const sides = (s.decks?.[0]?.plan ?? []).map((p) => Math.abs(p[1]));
  const usual = [...sides].sort((a, b) => a - b)[Math.floor(sides.length / 2)] ?? 0;
  return sides.filter((w) => w > usual + 5).length / 2;
};
const small = (max: number) => (s: NavalSpec) => mains(s, 0).every((t) => t.calibre <= max);
/** A body standing this high over the deck: a tower bridge, a pagoda. */
const tall = (above: number) => (s: NavalSpec) => (s.bodies ?? []).some((b) => Math.max(...b.top.map((p) => p[1])) > s.freeboard + above);
const mastCount = (k: 'pole' | 'tripod' | 'lattice') => (s: NavalSpec) => (s.masts ?? []).filter((m) => (m.kind ?? 'pole') === k).length;
/** Secondary mounts of a calibre on the beams. */
const wings = (s: NavalSpec, cal: number, barrels?: number) => turrets(s).filter((t) => Math.abs(t.calibre - cal) < 0.004 && !!t.side && (barrels === undefined || t.barrels === barrels)).length;
/** The main battery as forward-aft mounts of `barrels` guns each, e.g. 2, 1, 3 for two triple turrets forward and one aft. */
const battery = (s: NavalSpec, min: number, nf: number, na: number, barrels: number) => fwd(s, min).length === nf && aft(s, min).length === na && mains(s, min).filter((t) => !t.side).every((t) => t.barrels === barrels);
const funnelGap = (s: NavalSpec) => (funnels(s) >= 2 ? Math.abs(s.funnels![0].x - s.funnels![funnels(s) - 1].x) : 0);

// The cue lists, families first.

const FOUR_PIPER: Cue<NavalSpec>[] = [
  { cue: 'four tall thin funnels in a row, evenly spaced (the four-piper)', check: (s) => funnels(s) === 4 },
  { cue: 'flush deck with a strong sheer to the bow', check: (s) => flush(s) && (s.sheer ?? 0) >= 1 },
  { cue: 'single 4-inch guns: one forward, two on the beams, one aft', check: (s) => singles(s) && beamGuns(s) && fwd(s).length === 1 },
  { cue: 'triple torpedo tubes on the deck edges, two a side', check: (s) => beamTubes(s) && tubeMounts(s).length === 4 },
  { cue: 'tall pole foremast, short mainmast aft', check: (s) => mastKind('pole')(s) && (s.masts?.length ?? 0) === 2 },
];

const US_FIVE_INCH: Cue<NavalSpec>[] = [
  { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  { cue: 'five single 5-inch/38: two forward, three aft', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 3 },
  { cue: 'enclosed gunhouses forward, open mounts aft', check: (s) => fwd(s).every((t) => t.kind === 'mount') && aft(s).some((t) => t.kind !== 'mount') },
  { cue: 'B gun superfiring over A', check: (s) => superfires(fwd(s)) },
  { cue: 'quadruple torpedo tube mounts amidships', check: (s) => tubeMounts(s).some((t) => t.barrels === 4) },
];

const RN_TWO_FUNNEL_SINGLES: Cue<NavalSpec>[] = [
  { cue: 'two funnels, the fore one larger', check: (s) => funnels(s) === 2 && s.funnels![0].diameter >= s.funnels![1].diameter },
  { cue: 'four single 4.7-inch: A and B forward, X and Y aft', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 2 },
  { cue: 'B and X superfiring', check: (s) => superfires(fwd(s)) && superfires(aft(s)) },
  { cue: 'raised forecastle ending aft of the bridge', check: forecastle },
  { cue: 'quadruple torpedo tubes between the funnels and X gun', check: (s) => tubeMounts(s).some((t) => t.barrels === 4) },
];

const GERMAN_FIVE_GUN: Cue<NavalSpec>[] = [
  { cue: 'two funnels, the fore one taller and wider', check: (s) => funnels(s) === 2 && s.funnels![0].height >= s.funnels![1].height },
  { cue: 'five single 12.7 cm: two forward, three aft', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 3 },
  { cue: 'two quadruple torpedo tube mounts, fore and aft of the second funnel', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
  { cue: 'tall pole foremast on the bridge, short mainmast aft', check: (s) => mastKind('pole')(s) && (s.masts?.length ?? 0) === 2 },
];

const IJN_SECOND_CLASS: Cue<NavalSpec>[] = [
  { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  { cue: 'single 12 cm guns behind shields, one on the forecastle', check: (s) => singles(s) && fwd(s).length >= 1 && mains(s).every((t) => t.kind === 'shield') },
  { cue: 'well deck between the forecastle and the bridge with a tube mount', check: (s) => tubeMounts(s).some((t) => t.x > 0) },
  { cue: 'tripod foremast', check: mastKind('tripod') },
];

const SMALL_BOAT_TUBES: Cue<NavalSpec>[] = [
  { cue: 'torpedoes along the sides of a low planing hull', check: (s) => tubes(s) >= 1 && s.freeboard <= 1.5 },
  { cue: 'light automatic guns only, in open tubs', check: small(0.025) },
];

export const NAVAL_CUES: Record<string, CueEntry> = {
  // Replay figures, in replay rank order.
  clemson: naval('clemson', FOUR_PIPER),
  'project-206': naval('project-206', [
    { cue: 'twin 30 mm AK-230 turrets fore and aft', check: (s) => mains(s, 0.03).length === 2 && twins(s, 0.03) && fwd(s, 0.03).length === 1 && aft(s, 0.03).length === 1 },
    { cue: 'four torpedo tubes along the sides of the deckhouse', check: (s) => tubes(s) >= 2 },
    { cue: 'lattice mast with the radar dome', check: (s) => mastKind('lattice')(s) && !!s.radars?.some((r) => r.kind === 'dome') },
    { cue: 'long low deckhouse over most of the deck', check: (s) => (s.bodies?.length ?? 0) >= 1 },
  ]),
  raubtier: naval('raubtier', [
    { cue: 'two funnels, the fore one much larger', check: (s) => funnels(s) === 2 && s.funnels![0].diameter > s.funnels![1].diameter * 1.2 },
    { cue: 'three single 10.5 cm: one forward, two aft', check: (s) => singles(s) && fwd(s).length === 1 && aft(s).length === 2 },
    { cue: 'raised forecastle, the break forward of the first funnel', check: (s) => !!s.forecastle && s.forecastle.x > s.funnels![0].x },
    { cue: 'two triple torpedo tube mounts aft of the funnels', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
  ]),
  mahan: naval('mahan', [
    ...US_FIVE_INCH,
    { cue: 'tripod foremast', check: mastKind('tripod') },
    { cue: 'two of the three tube mounts on the beams, abreast', check: (s) => beamTubes(s) && tubeMounts(s).length === 3 },
  ]),
  'hunt-ii': naval('hunt-ii', [
    { cue: 'single squat funnel', check: (s) => funnels(s) === 1 },
    { cue: 'three twin 4-inch: A and B forward, X aft', check: (s) => twins(s) && fwd(s).length === 2 && aft(s).length === 1 },
    { cue: 'B mount superfiring over A', check: (s) => superfires(fwd(s)) },
    { cue: 'no torpedo tubes', check: (s) => tubes(s) === 0 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'j-class': naval('j-class', [
    { cue: 'one broad funnel (the J, K, N class mark)', check: (s) => funnels(s) === 1 },
    { cue: 'three twin 4.7-inch gunhouses: A, B forward, Y aft', check: (s) => twins(s) && fwd(s).length === 2 && aft(s).length === 1 },
    { cue: 'B superfiring over A', check: (s) => superfires(fwd(s)) },
    { cue: 'two quintuple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 5).length === 2 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'new-orleans': naval('new-orleans', [
    { cue: 'three triple 8-inch turrets, two forward, one aft', check: (s) => fwd(s, 0.2).length === 2 && aft(s, 0.2).length === 1 && mains(s, 0.2).every((t) => t.barrels === 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.2)) },
    { cue: 'two widely spaced funnels', check: (s) => funnels(s) === 2 && s.funnels![0].x - s.funnels![1].x > 12 },
    { cue: 'single 5-inch guns in a row along both sides amidships', check: (s) => mains(s).filter((t) => t.calibre < 0.2 && !!t.side).length >= 6 },
  ]),
  'v-class': naval('v-class', [
    { cue: 'two funnels: slender fore, squat broad aft', check: (s) => funnels(s) === 2 && s.funnels![0].height > s.funnels![1].height && s.funnels![1].diameter >= s.funnels![0].diameter },
    { cue: 'twin 4-inch high-angle mounts fore and aft (the WAIR conversion)', check: (s) => twins(s) && fwd(s).length === 1 && aft(s).length === 1 },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'single pole foremast', check: (s) => mastKind('pole')(s) },
  ]),
  farragut: naval('farragut', [
    { cue: 'five single 5-inch/38, two enclosed forward', check: (s) => singles(s) && fwd(s).length === 2 && fwd(s).every((t) => t.kind === 'mount') },
    { cue: 'B gun superfiring over A', check: (s) => superfires(fwd(s)) },
    { cue: 'forecastle ending just aft of the bridge', check: forecastle },
    { cue: 'two quadruple torpedo tube mounts on the centre line', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4 && !t.side).length === 2 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  's-class': naval('s-class', [
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'four single 4.7-inch: A, B forward, X, Y aft', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 2 },
    { cue: 'B superfiring over A', check: (s) => superfires(fwd(s)) },
    { cue: 'lattice foremast', check: mastKind('lattice') },
    { cue: 'two quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
  ]),
  tribal: naval('tribal', [
    { cue: 'two funnels, the fore one larger', check: (s) => funnels(s) === 2 && s.funnels![0].diameter > s.funnels![1].diameter },
    { cue: 'four twin 4.7-inch gunhouses: A, B forward, X, Y aft', check: (s) => twins(s) && fwd(s).length === 2 && aft(s).length === 2 },
    { cue: 'B and X superfiring', check: (s) => superfires(fwd(s)) && superfires(aft(s)) },
    { cue: 'one quadruple torpedo tube mount', check: (s) => tubeMounts(s).length === 1 && tubeMounts(s)[0].barrels === 4 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'lexington-cv2': naval('lexington-cv2', [
    { cue: 'huge flat-sided funnel on the starboard edge', check: (s) => funnels(s) === 1 && s.funnels![0].diameter > 20 && (s.funnels![0].side ?? 0) > 0 },
    { cue: 'small island forward of the funnel, in line with it', check: (s) => islandSide(s) > 0 && islandX(s) > s.funnels![0].x },
    { cue: 'twin 8-inch turrets fore and aft of the island, two pairs', check: (s) => turrets(s).filter((t) => t.calibre === 0.203).length === 4 },
    { cue: 'flight deck carried almost to the bow', check: (s) => deckFwd(s) > 0.95 },
  ]),
  'saratoga-cv3': naval('saratoga-cv3', [
    { cue: 'huge flat-sided funnel on the starboard edge', check: (s) => funnels(s) === 1 && s.funnels![0].diameter > 20 },
    { cue: 'twin 5-inch/38 gunhouses where the 8-inch turrets were', check: (s) => turrets(s).filter((t) => t.calibre === 0.127 && t.barrels === 2).length === 4 },
    { cue: 'small island forward of the funnel', check: (s) => islandSide(s) > 0 },
  ]),
  'type-1936': naval('type-1936', GERMAN_FIVE_GUN),
  'ww2-tanker': naval('ww2-tanker', [
    { cue: 'bridge house amidships, engine and funnel right aft', check: (s) => funnels(s) === 1 && s.funnels![0].x < -s.length * 0.35 },
    { cue: 'long low flush deck between them', check: (s) => s.freeboard < 7 },
    { cue: 'a gun on the bow and one on the stern', check: (s) => fwd(s, 0.07).length === 1 && aft(s, 0.07).length === 1 },
  ]),
  'gunboat-1124': naval('gunboat-1124', [
    { cue: 'tank turrets with 76 mm guns fore and aft', check: (s) => fwd(s).length === 1 && aft(s).length === 1 },
    { cue: 'very low hull, a river boat', check: (s) => s.freeboard < 1.6 },
  ]),
  frunze: naval('frunze', [
    { cue: 'three funnels evenly spaced', check: (s) => funnels(s) === 3 },
    { cue: 'long forecastle ending aft of the funnels, single 4-inch guns', check: (s) => forecastle(s) && singles(s) },
    { cue: 'three torpedo tube mounts along the centre line', check: (s) => tubeMounts(s).length === 3 },
  ]),
  opytny: naval('opytny', [
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'single 130 mm: one forward, two aft, X superfiring', check: (s) => fwd(s).length === 1 && aft(s).length === 2 && superfires(aft(s)) },
    { cue: 'three triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 3 },
  ]),
  turbine: naval('turbine', [
    { cue: 'two funnels close together forward', check: (s) => funnels(s) === 2 && s.funnels!.every((f) => f.x > 0) },
    { cue: 'twin 120 mm fore and aft', check: (s) => twins(s) && fwd(s).length === 1 && aft(s).length === 1 },
    { cue: 'two triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
    { cue: 'long forecastle', check: forecastle },
  ]),
  'type-1934a': naval('type-1934a', [
    { cue: 'two tall funnels', check: (s) => funnels(s) === 2 && s.funnels!.every((f) => f.height > 9) },
    { cue: 'five single 12.7 cm: two forward, three aft', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 3 },
    { cue: 'B and X superfiring', check: (s) => superfires(fwd(s)) && superfires(aft(s)) },
    { cue: 'two quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
  ]),
  'g-class': naval('g-class', [...RN_TWO_FUNNEL_SINGLES, { cue: 'tripod foremast', check: mastKind('tripod') }]),
  momi: naval('momi', IJN_SECOND_CLASS),
  leander: naval('leander', [
    { cue: 'one large trunked funnel', check: (s) => funnels(s) === 1 && s.funnels![0].diameter > 6 },
    { cue: 'four twin 6-inch turrets: A, B forward, X, Y aft', check: (s) => fwd(s, 0.15).length === 2 && aft(s, 0.15).length === 2 && twins(s, 0.15) },
    { cue: 'B and X superfiring', check: (s) => superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'tripod fore and main masts', check: (s) => (s.masts ?? []).filter((m) => m.kind === 'tripod').length === 2 },
  ]),
  forrestal: naval('forrestal', [
    { cue: 'angled deck to port', check: (s) => Math.min(...(s.decks?.[0]?.plan ?? [[0, 0]]).map((p) => p[1])) < -s.beam * 0.9 },
    { cue: 'island on the starboard edge forward of the middle', check: (s) => islandSide(s) > 0 && islandX(s) > 0 },
    { cue: 'deck-edge lifts, none on the centre line', check: (s) => edgeLifts(s) >= 3 },
    { cue: 'big search radar on the island mast', check: (s) => !!s.radars?.some((r) => r.kind === 'array') },
  ]),
  'type-1939': naval('type-1939', [
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'single 10.5 cm guns, one forward, the rest aft', check: (s) => singles(s) && fwd(s).length === 1 && aft(s).length >= 2 },
    { cue: 'two triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
  ]),
  matsu: naval('matsu', [
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'single 12.7 cm forward, twin 12.7 cm aft', check: (s) => fwd(s).length === 1 && fwd(s)[0].barrels === 1 && aft(s).length === 1 && aft(s)[0].barrels === 2 },
    { cue: 'one quadruple torpedo tube mount amidships', check: (s) => tubeMounts(s).length === 1 && tubeMounts(s)[0].barrels === 4 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  vifor: naval('vifor', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'single guns fore, amidships and aft', check: (s) => singles(s) && fwd(s).length >= 1 && aft(s).length >= 2 },
    { cue: 'pole masts fore and aft', check: (s) => (s.masts ?? []).filter((m) => (m.kind ?? 'pole') === 'pole').length === 2 },
  ]),
  mutsuki: naval('mutsuki', [
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'four single 12 cm behind shields, one forward of the bridge', check: (s) => singles(s) && mains(s).length === 4 && mains(s).every((t) => t.kind === 'shield') },
    { cue: 'two triple 61 cm torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),

  // Carriers by ship.
  soryu: naval('soryu', [
    { cue: 'small island forward on the starboard side', check: (s) => islandSide(s) > 0 && islandX(s) > s.length * 0.2 },
    { cue: 'two funnels curving down over the starboard side', check: (s) => (s.oneSide ?? []).filter((o) => (o.side ?? 0) > s.beam / 2).length >= 4 },
    { cue: 'six twin 12.7 cm mounts, three a side on sponsons', check: (s) => turrets(s).filter((t) => t.calibre === 0.127 && t.barrels === 2).length === 6 },
    { cue: 'flight deck short of the bow and the stern overhang', check: (s) => deckFwd(s) < 0.95 },
  ]),
  hiryu: naval('hiryu', [
    { cue: 'island on the port side, near the middle', check: (s) => islandSide(s) < 0 && Math.abs(islandX(s)) < s.length * 0.15 },
    { cue: 'two funnels curving down over the starboard side', check: (s) => (s.oneSide ?? []).filter((o) => (o.side ?? 0) > s.beam / 2).length >= 4 },
    { cue: 'six twin 12.7 cm mounts, three a side on sponsons', check: (s) => turrets(s).filter((t) => t.calibre === 0.127 && t.barrels === 2).length === 6 },
  ]),
  ryujo: naval('ryujo', [
    { cue: 'no island: a flush flight deck', check: (s) => islandSide(s) === 0 },
    { cue: 'flight deck ending well aft of the bow over an open forecastle', check: (s) => deckFwd(s) < 0.8 },
    { cue: 'tall slab-sided two-hangar hull for her size', check: (s) => s.freeboard / s.length > 0.07 },
    { cue: 'two small funnels curving down to starboard', check: (s) => (s.oneSide ?? []).filter((o) => (o.side ?? 0) > s.beam / 2).length >= 4 },
  ]),

  // The catalogue's families, most game units first.
  shokaku: naval('shokaku', [
    { cue: 'small island well forward on the starboard side', check: (s) => islandSide(s) > 0 && islandX(s) > s.length * 0.15 },
    { cue: 'two funnels curving down over the starboard side', check: (s) => (s.oneSide ?? []).filter((o) => (o.side ?? 0) > s.beam / 2).length >= 4 },
    { cue: 'eight twin 12.7 cm mounts, four a side on sponsons', check: (s) => turrets(s).filter((t) => t.calibre === 0.127 && t.barrels === 2).length === 8 },
    { cue: 'flight deck ending short of the bow', check: (s) => deckFwd(s) < 0.95 },
  ]),
  bagley: naval('bagley', [
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'four single 5-inch/38: two forward, two aft', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 2 },
    { cue: 'four quadruple torpedo tube mounts, two on each beam', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4 && !!t.side).length === 4 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  fletcher: naval('fletcher', [
    { cue: 'two raked funnels', check: (s) => funnels(s) === 2 },
    { cue: 'five enclosed single 5-inch/38 gunhouses: two forward, three aft', check: (s) => singles(s, 0.12) && fwd(s, 0.12).length === 2 && aft(s, 0.12).length === 3 && mains(s, 0.12).every((t) => t.kind === 'mount') },
    { cue: 'long flush deck with sheer to the bow', check: (s) => flush(s) },
    { cue: 'two quintuple torpedo tube mounts on the centre line', check: (s) => tubeMounts(s).filter((t) => t.barrels === 5 && !t.side).length === 2 },
    { cue: 'twin 40 mm tubs beside the aft funnel and the after deckhouse', check: (s) => turrets(s).filter((t) => t.calibre === 0.04 && !!t.side).length >= 4 },
  ]),
  yorktown: naval('yorktown', [
    { cue: 'compact island amidships on the starboard edge, funnel built in', check: (s) => islandSide(s) > 0 && Math.abs(islandX(s)) < s.length * 0.15 },
    { cue: 'single 5-inch guns in galleries at the flight deck corners', check: (s) => turrets(s).filter((t) => t.calibre === 0.127 && t.barrels === 1 && !!t.side).length === 8 },
    { cue: 'straight flight deck open at the bow and stern', check: (s) => !s.angled && (s.decks?.length ?? 0) === 1 },
  ]),
  essex: naval('essex', [
    { cue: 'island with its big raked funnel on the starboard edge', check: (s) => islandSide(s) > 0 },
    { cue: 'twin 5-inch turrets fore and aft of the island, two pairs', check: (s) => turrets(s).filter((t) => t.calibre === 0.127 && t.barrels === 2).length === 4 },
    { cue: 'deck-edge lift on the port side', check: (s) => Math.min(...(s.decks?.[0]?.plan ?? [[0, 0]]).map((p) => p[1])) < -s.beam * 0.8 },
  ]),
  kuznetsov: naval('kuznetsov', [
    { cue: 'ski-jump bow', check: (s) => (s.oneSide ?? []).some((o) => o.top[0][1] > s.freeboard + 3 && o.top[o.top.length - 1][1] <= s.freeboard + 1.5) },
    { cue: 'angled deck to port', check: (s) => Math.min(...(s.decks?.[0]?.plan ?? [[0, 0]]).map((p) => p[1])) < -s.beam * 0.9 },
    { cue: 'long island to starboard with its mast, dome and arrays', check: (s) => islandSide(s) > 0 && !!s.radars?.some((r) => r.kind === 'dome') },
  ]),
  colossus: naval('colossus', [
    { cue: 'small island with a raked funnel on the starboard edge', check: (s) => islandSide(s) > 0 },
    { cue: 'big search radar on the mast', check: (s) => !!s.radars?.some((r) => r.kind === 'array') },
  ]),
  'elco-80': naval(['elco-80', 'higgins-78'], [
    { cue: 'four torpedo tubes along the deck edges', check: (s) => tubes(s) >= 1 },
    { cue: 'twin .50 machine guns in open tubs either side of the cockpit', check: (s) => turrets(s).filter((t) => t.calibre === 0.013 && t.barrels === 2 && !!t.side).length === 2 },
    { cue: 'a 40 mm Bofors on the stern', check: (s) => aft(s, 0.04).length === 1 },
  ]),
  'vosper-mtb': naval('vosper-mtb', [
    { cue: 'torpedo tubes at the sides of a low hard-chined hull', check: (s) => tubes(s) >= 1 },
    { cue: 'twin machine guns in tubs either side of the bridge', check: (s) => turrets(s).filter((t) => t.barrels === 2 && !!t.side).length === 2 },
    { cue: '20 mm Oerlikon aft', check: (s) => aft(s, 0.02).length === 1 },
  ]),
  'g-5-torpedo-boat': naval('g-5-torpedo-boat', [
    { cue: 'turtle-backed hydroplane hull', check: (s) => typeof s.hullOutline?.round === 'number' && s.hullOutline.round < 5 },
    { cue: 'torpedoes in troughs at the stern', check: (s) => (s.bodies ?? []).some((b) => !!b.side && Math.min(...b.plan.map((p) => p[0])) < -s.length * 0.4) },
    { cue: 'small conning cupola forward of the middle', check: (s) => (s.bodies ?? []).some((b) => !b.side && b.plan[0][0] > 0) },
    { cue: 'stepped planing bottom', modelled: false, note: 'below the waterline: the figure is drawn above it' },
  ]),
  'pt-810': naval('pt-810', [
    { cue: '40 mm guns fore and aft', check: (s) => fwd(s, 0.04).length === 1 && aft(s, 0.04).length === 1 },
    { cue: 'twin 20 mm mounts either side amidships', check: (s) => turrets(s).filter((t) => t.calibre === 0.02 && !!t.side).length === 2 },
    { cue: 'radar dome on the mast', check: (s) => !!s.radars?.some((r) => r.kind === 'dome') },
  ]),
  schnellboot: naval(['schnellboot', 's-38', 's-700'], [
    { cue: 'raised forecastle with the two tubes in it', check: (s) => !!s.forecastle },
    { cue: 'round-bilged displacement hull, long and narrow', check: (s) => s.length / s.beam > 6 },
    { cue: 'guns fore, amidships and aft', check: (s) => fwd(s, 0.02).length >= 1 && aft(s, 0.02).length >= 2 },
  ]),
  shiratsuyu: naval('shiratsuyu', [
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'twin 12.7 cm forward; a single and a twin aft', check: (s) => fwd(s).length === 1 && fwd(s)[0].barrels === 2 && aft(s).length === 2 },
    { cue: 'two quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
    { cue: 'forecastle ending forward of the first funnel', check: (s) => !!s.forecastle && s.forecastle.x > s.funnels![0].x },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'type-1936a': naval('type-1936a', [
    { cue: 'twin 15 cm turret forward', check: (s) => fwd(s).length === 1 && fwd(s)[0].barrels === 2 && fwd(s)[0].calibre === 0.15 },
    { cue: 'three single 15 cm aft', check: (s) => aft(s).length === 3 && aft(s).every((t) => t.barrels === 1) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'two quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
  ]),
  'french-big-destroyers': naval(['guepard', 'jaguar-1923'], [
    { cue: 'four funnels', check: (s) => funnels(s) === 4 },
    { cue: 'five single guns: two forward, three aft', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 3 },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'two triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
  ]),
  akizuki: naval('akizuki', [
    { cue: 'one big trunked funnel', check: (s) => funnels(s) === 1 && s.funnels![0].diameter >= 5 },
    { cue: 'four twin 10 cm gunhouses: A, B forward, X, Y aft', check: (s) => twins(s) && fwd(s).length === 2 && aft(s).length === 2 },
    { cue: 'B and X superfiring', check: (s) => superfires(fwd(s)) && superfires(aft(s)) },
    { cue: 'one quadruple torpedo tube mount', check: (s) => tubeMounts(s).length === 1 && tubeMounts(s)[0].barrels === 4 },
  ]),
  kotlin: naval('kotlin', [
    { cue: 'twin 130 mm turrets fore and aft', check: (s) => fwd(s, 0.1).length === 1 && aft(s, 0.1).length === 1 && twins(s, 0.1) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'quadruple 45 mm mounts fore and aft of the superstructure', check: (s) => turrets(s).filter((t) => t.calibre === 0.045 && t.barrels === 4).length === 2 },
    { cue: 'two quintuple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 5).length === 2 },
  ]),
  'charles-f-adams': naval('charles-f-adams', [
    { cue: 'single 5-inch/54 mounts fore and aft', check: (s) => fwd(s).length === 1 && aft(s).length === 1 },
    { cue: 'missile launcher on the after deckhouse', check: (s) => (s.launchers ?? []).some((l) => l.x < 0) },
    { cue: 'two lattice masts and two funnels', check: (s) => funnels(s) === 2 && (s.masts ?? []).filter((m) => m.kind === 'lattice').length === 2 },
  ]),
  kongo: naval('kongo', [
    { cue: 'four twin 14-inch turrets, two forward superfiring', check: (s) => mains(s, 0.3).length === 4 && superfires(fwd(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'turret three aft of the funnels, well forward of turret four', check: (s) => aft(s, 0.3).length === 2 && Math.abs(aft(s, 0.3)[0].x - aft(s, 0.3)[1].x) > 20 },
  ]),
  nagato: naval('nagato', [
    { cue: 'four twin 41 cm turrets: A, B forward, X, Y aft, superfiring', check: (s) => fwd(s, 0.3).length === 2 && aft(s, 0.3).length === 2 && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one large funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tall pagoda foremast', check: (s) => (s.bodies ?? []).some((b) => Math.max(...b.top.map((p) => p[1])) > s.freeboard + 20) },
  ]),
  yamato: naval('yamato', [
    { cue: 'three triple 46 cm turrets, two forward, one aft', check: (s) => fwd(s, 0.4).length === 2 && aft(s, 0.4).length === 1 },
    { cue: 'single big funnel raked aft behind the tower', check: (s) => funnels(s) === 1 && s.funnels![0].diameter > 8 },
    { cue: 'triple 15.5 cm turrets fore and aft of the superstructure', check: (s) => turrets(s).filter((t) => t.calibre === 0.155 && t.barrels === 3).length === 2 },
    { cue: 'long sheered hull dipping amidships', check: (s) => (s.hullOutline?.top[0][1] ?? 0) > s.freeboard + 5 },
  ]),
  'bismarck-battleship': naval('bismarck-battleship', [
    { cue: 'four twin 38 cm turrets: Anton, Bruno forward, Caesar, Dora aft', check: (s) => fwd(s, 0.3).length === 2 && aft(s, 0.3).length === 2 && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one big funnel amidships', check: (s) => funnels(s) === 1 },
    { cue: 'six twin 15 cm turrets on the sides', check: (s) => turrets(s).filter((t) => t.calibre === 0.15 && !!t.side).length === 6 },
  ]),
  omaha: naval('omaha', [
    { cue: 'four tall funnels', check: (s) => funnels(s) === 4 },
    { cue: 'twin 6-inch turrets fore and aft', check: (s) => fwd(s, 0.15).length === 1 && aft(s, 0.15).length === 1 },
    { cue: 'tripod masts fore and aft', check: (s) => (s.masts ?? []).filter((m) => m.kind === 'tripod').length === 2 },
    { cue: 'single 6-inch guns in casemates at the corners of the superstructure', modelled: false, note: 'casemates in the hull side are not drawn' },
  ]),
  richelieu: naval('richelieu', [
    { cue: 'two quadruple 380 mm turrets, both forward', check: (s) => fwd(s, 0.3).length === 2 && aft(s, 0.3).length === 0 && mains(s, 0.3).every((t) => t.barrels === 4) },
    { cue: 'triple 152 mm turrets aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.152 && t.x < 0).length === 3 },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  brooklyn: naval('brooklyn', [
    { cue: 'five triple 6-inch turrets: three forward, two aft', check: (s) => fwd(s, 0.15).length === 3 && aft(s, 0.15).length === 2 },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  ]),
  'liberty-ship': naval('liberty-ship', [
    { cue: 'bridge house and funnel amidships', check: (s) => funnels(s) === 1 && Math.abs(s.funnels![0].x) < s.length * 0.1 },
    { cue: 'three masts with cargo booms', check: (s) => (s.masts?.length ?? 0) === 3 },
    { cue: 'a gun on the bow and one on the stern', check: (s) => fwd(s, 0.07).length === 1 && aft(s, 0.07).length === 1 },
  ]),

  clemenceau: naval('clemenceau', [
    { cue: 'angled deck to port', check: (s) => Math.min(...(s.decks?.[0]?.plan ?? [[0, 0]]).map((p) => p[1])) < -s.beam * 0.75 },
    { cue: 'island on the starboard edge with a tall funnel and a big radar', check: (s) => islandSide(s) > 0 && !!s.radars?.some((r) => r.kind === 'array') },
    { cue: 'single 100 mm turrets on sponsons at the corners', check: (s) => turrets(s).filter((t) => t.calibre === 0.1 && !!t.side).length === 4 },
  ]),
  baku: naval('baku', [
    { cue: 'missile tubes and guns on a long forecastle, no flight deck there', check: (s) => tubes(s) >= 1 && deckFwd(s) < 0.5 },
    { cue: 'angled flight deck to port from the island aft', check: (s) => Math.min(...(s.decks?.[0]?.plan ?? [[0, 0]]).map((p) => p[1])) < -s.beam * 0.75 },
    { cue: 'tall island to starboard with fixed array faces', check: (s) => islandSide(s) > 0 && !!s.radars?.some((r) => r.kind === 'faces') },
  ]),
  goldenfels: naval('goldenfels', [
    { cue: 'house and broad funnel amidships', check: (s) => funnels(s) === 1 && Math.abs(s.funnels![0].x) < s.length * 0.1 },
    { cue: 'masts over the hatches fore and aft', check: (s) => (s.masts?.length ?? 0) === 2 },
  ]),

  // Boats.
  'mas-boat': naval('mas-boat', SMALL_BOAT_TUBES),
  'vtb-boat': naval('vtb-boat', SMALL_BOAT_TUBES),
  't-14-boat': naval('t-14-boat', [
    { cue: 'small single-engined boat, about 15 m', check: (s) => s.length < 16 },
    { cue: 'two torpedoes aft, one a side', check: (s) => tubes(s) >= 1 },
    { cue: 'one light gun on the foredeck', check: (s) => fwd(s, 0.01).length === 1 },
  ]),
  't-51-boat': naval('t-51-boat', [
    { cue: 'S-boat shape: raised forecastle hiding the two tubes', check: (s) => !!s.forecastle },
    { cue: 'three single 25 mm guns fore, amidships and aft', check: (s) => mains(s, 0.02).filter((t) => t.calibre === 0.025).length === 3 },
    { cue: 'open bridge, no armoured dome', check: (s) => (s.bodies ?? []).length >= 1 },
  ]),
  'artilleriefahrprahm': naval('artilleriefahrprahm', [
    { cue: 'flat-bottomed barge hull with a square bow', check: (s) => s.length / s.beam < 8 },
    { cue: 'two single 8.8 cm guns on the centre line', check: (s) => mains(s).filter((t) => t.calibre === 0.088).length === 2 },
    { cue: 'quad 20 mm Flakvierling aft', check: (s) => turrets(s).some((t) => t.barrels === 4 && t.calibre === 0.02) },
  ]),
  // Catalogue ships by unit count (round v5): battleships, cruisers, destroyers and submarines.
  hipper: naval('hipper', [
    { cue: 'four twin 20.3 cm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.2, 2, 2, 2) && superfires(fwd(s, 0.2)) && superfires(aft(s, 0.2)) },
    { cue: 'one big funnel amidships with a raked cap', check: (s) => funnels(s) === 1 },
    { cue: 'tall tower bridge forward', check: tall(20) },
    { cue: 'pole mainmast aft of the funnel', check: (s) => (s.masts ?? []).some((m) => m.x < s.funnels![0].x && (m.kind ?? 'pole') === 'pole') },
    { cue: 'triple torpedo tubes on the upper deck aft', check: (s) => tubes(s) >= 1 },
  ]),
  iowa: naval('iowa', [
    { cue: 'three triple 16-inch turrets: two forward, one aft', check: (s) => battery(s, 0.4, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.4)) },
    { cue: 'two funnels well apart', check: (s) => funnels(s) === 2 && funnelGap(s) > 15 },
    { cue: 'twin 5-inch mounts stepped along both sides', check: (s) => wings(s, 0.127, 2) >= 6 },
    { cue: 'long, fine hull (length over eight beams)', check: (s) => s.length / s.beam > 8 },
  ]),
  pillau: naval('pillau', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'single 15 cm guns, fore and aft on the centre line and on the beams', check: (s) => singles(s) && beamGuns(s) && fwd(s).length === 1 && aft(s).length === 1 },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'two pole masts', check: (s) => mastCount('pole')(s) === 2 },
  ]),
  kronshtadt: naval('kronshtadt', [
    { cue: 'three triple 305 mm turrets: two forward, one aft', check: (s) => battery(s, 0.3, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.3)) },
    { cue: 'one big funnel', check: (s) => funnels(s) === 1 },
    { cue: 'twin 152 mm turrets on the beams', check: (s) => wings(s, 0.152, 2) >= 4 },
    { cue: 'tower bridge forward', check: tall(25) },
  ]),
  littorio: naval('littorio', [
    { cue: 'three triple 381 mm turrets: two forward, one aft', check: (s) => battery(s, 0.3, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'four triple 152 mm turrets at the corners of the superstructure', check: (s) => wings(s, 0.152, 3) === 4 },
    { cue: 'tall tower bridge', check: tall(25) },
  ]),
  baltimore: naval('baltimore', [
    { cue: 'three triple 8-inch turrets: two forward, one aft', check: (s) => battery(s, 0.2, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.2)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'twin 5-inch mounts on the beams', check: (s) => wings(s, 0.127, 2) >= 4 },
  ]),
  kent: naval('kent', [
    { cue: 'three tall funnels evenly spaced', check: (s) => funnels(s) === 3 },
    { cue: 'four twin 8-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.2, 2, 2, 2) && superfires(fwd(s, 0.2)) && superfires(aft(s, 0.2)) },
    { cue: 'very high flush-sided hull', check: (s) => s.freeboard >= 9 && flush(s) },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  belfast: naval('belfast', [
    { cue: 'four triple 6-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 3) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels far apart, the hangar between them', check: (s) => funnels(s) === 2 && funnelGap(s) >= 15 },
    { cue: 'tripod masts fore and aft', check: (s) => mastCount('tripod')(s) === 2 },
  ]),
  battle: naval('battle', [
    { cue: 'two twin 4.5-inch turrets, both forward, B superfiring', check: (s) => battery(s, 0.1, 2, 0, 2) && superfires(fwd(s, 0.1)) },
    { cue: 'one big funnel', check: (s) => funnels(s) === 1 },
    { cue: 'lattice foremast', check: mastKind('lattice') },
    { cue: 'two quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  zara: naval('zara', [
    { cue: 'four twin 203 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.2, 2, 2, 2) && superfires(fwd(s, 0.2)) && superfires(aft(s, 0.2)) },
    { cue: 'two funnels close together', check: (s) => funnels(s) === 2 && funnelGap(s) < 16 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
    { cue: 'tripod foremast behind the bridge', check: mastKind('tripod') },
  ]),
  myoko: naval('myoko', [
    { cue: 'five twin 20 cm turrets: three forward in a pyramid, two aft', check: (s) => battery(s, 0.2, 3, 2, 2) },
    { cue: 'two funnels, the fore one trunked and far thicker', check: (s) => funnels(s) === 2 && s.funnels![0].diameter > s.funnels![1].diameter * 1.3 },
    { cue: 'tall pagoda bridge', check: tall(15) },
    { cue: 'long forecastle stepping down aft', check: forecastle },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  algerie: naval('algerie', [
    { cue: 'four twin 203 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.2, 2, 2, 2) && superfires(fwd(s, 0.2)) && superfires(aft(s, 0.2)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tall tower bridge', check: tall(20) },
    { cue: 'flush deck', check: flush },
  ]),
  'sovetsky-soyuz': naval('sovetsky-soyuz', [
    { cue: 'three triple 406 mm turrets: two forward, one aft', check: (s) => battery(s, 0.4, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.4)) },
    { cue: 'one big funnel', check: (s) => funnels(s) === 1 },
    { cue: 'twin 152 mm turrets on the beams', check: (s) => wings(s, 0.152, 2) >= 4 },
    { cue: 'tall tower bridge', check: tall(25) },
  ]),
  'lion-1938': naval('lion-1938', [
    { cue: 'three triple 16-inch turrets: two forward, one aft', check: (s) => battery(s, 0.4, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.4)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'twin 5.25-inch turrets, four a side', check: (s) => wings(s, 0.133, 2) === 8 },
  ]),
  'king-george-v': naval('king-george-v', [
    { cue: 'quadruple 14-inch turrets A and Y, a twin B superfiring', check: (s) => fwd(s, 0.3).map((t) => t.barrels).join() === '4,2' && aft(s, 0.3).map((t) => t.barrels).join() === '4' && superfires(fwd(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'twin 5.25-inch turrets, four a side', check: (s) => wings(s, 0.133, 2) === 8 },
    { cue: 'pole masts fore and aft', check: (s) => mastCount('pole')(s) === 2 },
  ]),
  gato: naval('gato', [
    { cue: 'deck gun aft of the conning tower', check: (s) => mains(s, 0.07).length === 1 && mains(s, 0.07)[0].x < 0 },
    { cue: 'cut-down tower with 20 mm guns fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.02).length === 2 },
    { cue: 'long low hull, the casing flat on top', check: (s) => s.length / s.beam > 10 && s.freeboard < 3 },
  ]),
  balao: naval('balao', [
    { cue: '5-inch deck gun forward of the conning tower', check: (s) => mains(s, 0.1).length === 1 && mains(s, 0.1)[0].x > 0 },
    { cue: '40 mm guns on the tower platforms fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.04).length === 2 },
    { cue: 'long low hull, the casing flat on top', check: (s) => s.length / s.beam > 10 && s.freeboard < 3 },
  ]),
  'type-viic': naval('type-viic', [
    { cue: '88 mm deck gun forward of the tower', check: (s) => turrets(s).some((t) => t.calibre === 0.088 && t.x > 0) },
    { cue: 'conning tower with the stepped Wintergarten platform aft', check: (s) => (s.bodies?.[0]?.top ?? []).some((p) => p[0] < -3 && p[1] > s.freeboard + 0.5 && p[1] < 5) },
    { cue: 'bow planes standing out at the waterline', check: (s) => (s.bodies ?? []).some((b) => b.plan[0][0] > s.length / 3 && b.plan.some((p) => p[1] > s.beam / 2)) },
    { cue: 'narrow saddle-tank hull, short and low', check: (s) => s.length < 70 && s.beam < 7 },
  ]),
  sverdlov: naval('sverdlov', [
    { cue: 'four triple 152 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 3) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'tripod masts fore and aft', check: (s) => mastCount('tripod')(s) === 2 },
    { cue: 'flush deck with sheer forward', check: (s) => flush(s) && (s.sheer ?? 0) >= 3 },
  ]),
  'south-dakota': naval('south-dakota', [
    { cue: 'three triple 16-inch turrets: two forward, one aft', check: (s) => battery(s, 0.4, 2, 1, 3) },
    { cue: 'one funnel faired into the superstructure', check: (s) => funnels(s) === 1 },
    { cue: 'short, beamy hull', check: (s) => s.length / s.beam < 6.5 },
    { cue: 'tall tower bridge', check: tall(25) },
    { cue: 'twin 5-inch mounts on the beams', check: (s) => wings(s, 0.127, 2) >= 6 },
  ]),
  mogami: naval('mogami', [
    { cue: 'five twin 20 cm turrets: three forward, two aft', check: (s) => battery(s, 0.2, 3, 2, 2) },
    { cue: 'one big trunked funnel, raked', check: (s) => funnels(s) === 1 && (s.funnels![0].rake ?? 0) > 0 },
    { cue: 'tripod masts fore and aft', check: (s) => mastCount('tripod')(s) === 2 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  'des-moines': naval('des-moines', [
    { cue: 'three triple 8-inch turrets: two forward, one aft', check: (s) => battery(s, 0.2, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.2)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tall bridge tower and tripod foremast', check: (s) => tall(20)(s) && mastKind('tripod')(s) },
  ]),
  z52: naval('z52', [
    { cue: 'twin 12.8 cm turrets: one forward, two aft', check: (s) => battery(s, 0.1, 1, 2, 2) },
    { cue: 'X turret superfiring over Y', check: (s) => superfires(aft(s, 0.1)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  emerald: naval('emerald', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'long raised forecastle running aft past the funnels', check: (s) => !!s.forecastle && s.forecastle.x < -20 },
    { cue: 'two 6-inch guns forward, B superfiring', check: (s) => fwd(s, 0.15).length === 2 && superfires(fwd(s, 0.15)) },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  chapayev: naval('chapayev', [
    { cue: 'four triple 152 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 3) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  gearing: naval('gearing', [
    { cue: 'three twin 5-inch mounts: two forward, one aft', check: (s) => battery(s, 0.1, 2, 1, 2) },
    { cue: 'B mount superfiring over A', check: (s) => superfires(fwd(s, 0.1)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'quintuple torpedo tubes amidships', check: (s) => tubeMounts(s).some((t) => t.barrels === 5) },
    { cue: 'flush deck', check: flush },
  ]),
  'type-7-destroyer': naval('type-7-destroyer', [
    { cue: 'four single 130 mm guns: two forward, two aft, superfiring', check: (s) => battery(s, 0.1, 2, 2, 1) && superfires(fwd(s, 0.1)) && superfires(aft(s, 0.1)) },
    { cue: 'one big funnel (the 7U had two)', check: (s) => funnels(s) === 1 },
    { cue: 'two triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
  ]),
  scharnhorst: naval('scharnhorst', [
    { cue: 'three triple 28 cm turrets: two forward, one aft', check: (s) => battery(s, 0.25, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.25)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'Atlantic bow with a strong sheer', check: (s) => (s.sheer ?? 0) >= 5 },
    { cue: 'twin 15 cm turrets on the beams', check: (s) => wings(s, 0.15, 2) >= 4 },
  ]),
  fiji: naval('fiji', [
    { cue: 'four triple 6-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 3) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'square transom stern', check: (s) => (s.transom ?? 0) >= 0.7 },
    { cue: 'tripod masts fore and aft', check: (s) => mastCount('tripod')(s) === 2 },
  ]),
  kagero: naval('kagero', [
    { cue: 'three twin 12.7 cm turrets: one forward, two aft', check: (s) => battery(s, 0.1, 1, 2, 2) },
    { cue: 'X turret superfiring over Y', check: (s) => superfires(aft(s, 0.1)) },
    { cue: 'two funnels, the fore one thicker', check: (s) => funnels(s) === 2 && s.funnels![0].diameter > s.funnels![1].diameter },
    { cue: 'two quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
    { cue: 'raised forecastle with the bridge at its end', check: forecastle },
  ]),
  mogador: naval('mogador', [
    { cue: 'four twin 138 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.1, 2, 2, 2) && superfires(fwd(s, 0.1)) && superfires(aft(s, 0.1)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  arethusa: naval('arethusa', [
    { cue: 'three twin 6-inch turrets: two forward, one aft', check: (s) => battery(s, 0.15, 2, 1, 2) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'long raised forecastle', check: forecastle },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  tone: naval('tone', [
    { cue: 'all four twin 20 cm turrets forward of the bridge', check: (s) => battery(s, 0.2, 4, 0, 2) },
    { cue: 'one trunked funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tripod masts fore and aft', check: (s) => mastCount('tripod')(s) === 2 },
    { cue: 'raised forecastle stepping down to the aircraft deck', check: forecastle },
  ]),
  izmail: naval('izmail', [
    { cue: 'four triple 356 mm turrets spread along the centre line, none superfiring', check: (s) => mains(s, 0.3).length === 4 && mains(s, 0.3).every((t) => t.barrels === 3) && !superfires(fwd(s, 0.3)) && !superfires(aft(s, 0.3)) },
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'flush deck', check: flush },
  ]),
  cleveland: naval('cleveland', [
    { cue: 'four triple 6-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 3) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels close together', check: (s) => funnels(s) === 2 && funnelGap(s) < 16 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  alaska: naval('alaska', [
    { cue: 'three triple 12-inch turrets: two forward, one aft', check: (s) => battery(s, 0.3, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.3)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'twin 5-inch mounts on the beams', check: (s) => wings(s, 0.127, 2) >= 4 },
    { cue: 'tall tower bridge', check: tall(20) },
  ]),
  leipzig: naval('leipzig', [
    { cue: 'three triple 15 cm turrets: one forward, two aft', check: (s) => battery(s, 0.14, 1, 2, 3) },
    { cue: 'C turret superfiring over D aft', check: (s) => superfires(aft(s, 0.14)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tall pole foremast on the bridge', check: (s) => (s.masts ?? []).some((m) => m.x > 0 && (m.kind ?? 'pole') === 'pole') },
  ]),
  bourrasque: naval('bourrasque', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'four single 130 mm guns: two forward, two aft', check: (s) => battery(s, 0.1, 2, 2, 1) },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'two triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
  ]),
  tashkent: naval('tashkent', [
    { cue: 'three twin 130 mm turrets: two forward, one aft', check: (s) => battery(s, 0.1, 2, 1, 2) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.1)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'triple torpedo tube mounts amidships', check: (s) => tubeMounts(s).some((t) => t.barrels === 3) },
  ]),
  gleaves: naval('gleaves', [
    { cue: 'four single 5-inch guns: two forward, two aft, superfiring', check: (s) => battery(s, 0.1, 2, 2, 1) && superfires(fwd(s, 0.1)) && superfires(aft(s, 0.1)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'quintuple torpedo tubes on the centre line', check: (s) => tubes(s) >= 2 },
    { cue: 'flush deck with sheer forward', check: (s) => flush(s) && (s.sheer ?? 0) >= 2 },
  ]),
  'egret-sloop': naval('egret-sloop', [
    { cue: 'four twin 4-inch mounts: two forward, two aft', check: (s) => battery(s, 0.1, 2, 2, 2) },
    { cue: 'B and X superfiring', check: (s) => superfires(fwd(s, 0.1)) && superfires(aft(s, 0.1)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  amagi: naval('amagi', [
    { cue: 'five twin 41 cm turrets: two forward, one amidships, two aft', check: (s) => battery(s, 0.4, 2, 3, 2) && mains(s, 0.4).some((t) => Math.abs(t.x) < 20) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
    { cue: 'long hull with superfiring pairs at both ends', check: (s) => superfires(fwd(s, 0.4)) && superfires(aft(s, 0.4)) },
  ]),
  nelson: naval('nelson', [
    { cue: 'all three triple 16-inch turrets forward of the bridge', check: (s) => battery(s, 0.4, 3, 0, 3) },
    { cue: 'B turret superfiring, X lower behind it', check: (s) => superfires(fwd(s, 0.4)) },
    { cue: 'tall tower bridge aft of the guns', check: tall(20) },
    { cue: 'one funnel aft of the tower', check: (s) => funnels(s) === 1 },
    { cue: 'twin 6-inch turrets aft on the beams', check: (s) => wings(s, 0.152, 2) === 4 },
  ]),
  'project-41': naval('project-41', [
    { cue: 'twin 130 mm turrets, one forward, one aft', check: (s) => battery(s, 0.1, 1, 1, 2) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'quintuple torpedo tube mounts', check: (s) => tubeMounts(s).some((t) => t.barrels === 5) },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'project-30bis': naval('project-30bis', [
    { cue: 'twin 130 mm turrets, one forward, one aft', check: (s) => battery(s, 0.1, 1, 1, 2) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'quintuple torpedo tube mounts', check: (s) => tubeMounts(s).some((t) => t.barrels === 5) },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'north-carolina': naval('north-carolina', [
    { cue: 'three triple 16-inch turrets: two forward, one aft', check: (s) => battery(s, 0.4, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.4)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'twin 5-inch mounts stepped along both sides', check: (s) => wings(s, 0.127, 2) >= 6 },
    { cue: 'tower bridge forward', check: tall(25) },
  ]),
  fubuki: naval('fubuki', [
    { cue: 'three twin 12.7 cm gunhouses: one forward, two aft', check: (s) => battery(s, 0.1, 1, 2, 2) },
    { cue: 'X superfiring over Y', check: (s) => superfires(aft(s, 0.1)) },
    { cue: 'two funnels, the fore one larger', check: (s) => funnels(s) === 2 && s.funnels![0].diameter > s.funnels![1].diameter },
    { cue: 'three triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 3 },
    { cue: 'raised forecastle with the bridge at its end', check: forecastle },
  ]),
  atlanta: naval('atlanta', [
    { cue: 'six twin 5-inch mounts on the centre line, three stepped up at each end', check: (s) => battery(s, 0.1, 3, 3, 2) && superfires(fwd(s, 0.1)) && superfires(aft(s, 0.1)) },
    { cue: 'two funnels close together', check: (s) => funnels(s) === 2 && funnelGap(s) < 16 },
    { cue: 'slim hull with sheer forward', check: (s) => s.length / s.beam > 9.5 },
  ]),
  'type-1936c': naval('type-1936c', [
    { cue: 'twin 12.8 cm turrets: one forward, two aft', check: (s) => battery(s, 0.1, 1, 2, 2) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'two quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
    { cue: 'Atlantic bow with sheer', check: (s) => flush(s) && (s.sheer ?? 0) >= 3 },
  ]),
  renown: naval('renown', [
    { cue: 'three twin 15-inch turrets: two forward, one aft', check: (s) => battery(s, 0.3, 2, 1, 2) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'long, fine battlecruiser hull', check: (s) => s.length / s.beam > 8.5 },
  ]),
  'le-fantasque': naval('le-fantasque', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'five single 138 mm guns: two forward, three aft', check: (s) => battery(s, 0.1, 2, 3, 1) },
    { cue: 'three triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 3 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  'la-galissoniere': naval('la-galissoniere', [
    { cue: 'three triple 152 mm turrets: two forward, one aft', check: (s) => battery(s, 0.15, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.15)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  ise: naval('ise', [
    { cue: 'six twin 36 cm turrets: pairs forward, amidships and aft', check: (s) => mains(s, 0.3).length === 6 && mains(s, 0.3).filter((t) => Math.abs(t.x) < 30).length === 2 },
    { cue: 'tall pagoda foremast', check: tall(25) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  'iron-duke': naval('iron-duke', [
    { cue: 'five twin 13.5-inch turrets: A, B forward, Q amidships, X, Y aft', check: (s) => battery(s, 0.3, 2, 3, 2) && mains(s, 0.3).some((t) => Math.abs(t.x) < 20) },
    { cue: 'two funnels close together', check: (s) => funnels(s) === 2 && funnelGap(s) < 16 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
    { cue: 'superfiring pairs at both ends', check: (s) => superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
  ]),
  gangut: naval('gangut', [
    { cue: 'four triple 305 mm turrets spread along a flush deck, none superfiring', check: (s) => mains(s, 0.3).length === 4 && mains(s, 0.3).every((t) => t.barrels === 3) && !superfires(fwd(s, 0.3)) && !superfires(aft(s, 0.3)) && flush(s) },
    { cue: 'two funnels far apart', check: (s) => funnels(s) === 2 && funnelGap(s) > 25 },
    { cue: 'low hull with pole masts at the ends', check: (s) => mastCount('pole')(s) === 2 },
  ]),
  deutschland: naval('deutschland', [
    { cue: 'two triple 28 cm turrets, one forward, one aft', check: (s) => battery(s, 0.25, 1, 1, 3) },
    { cue: 'single 15 cm guns on the beams', check: (s) => wings(s, 0.15, 1) >= 4 },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tower bridge forward', check: tall(20) },
  ]),
  colorado: naval('colorado', [
    { cue: 'four twin 16-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.4, 2, 2, 2) && superfires(fwd(s, 0.4)) && superfires(aft(s, 0.4)) },
    { cue: 'cage masts fore and aft', check: (s) => mastCount('lattice')(s) === 2 },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'single 5-inch guns along the superstructure sides', check: (s) => wings(s, 0.127, 1) >= 4 },
  ]),
  yubari: naval('yubari', [
    { cue: 'one big trunked funnel, strongly raked', check: (s) => funnels(s) === 1 && (s.funnels![0].rake ?? 0) >= 0.2 },
    { cue: 'a single and a superfiring twin 14 cm at each end', check: (s) => fwd(s, 0.14).length === 2 && aft(s, 0.14).length === 2 && superfires(fwd(s, 0.14)) && superfires(aft(s, 0.14)) },
    { cue: 'short raised forecastle', check: forecastle },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  worcester: naval('worcester', [
    { cue: 'six twin 6-inch turrets: three stepped up at each end', check: (s) => battery(s, 0.15, 3, 3, 2) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'tiger-1959': naval('tiger-1959', [
    { cue: 'twin automatic 6-inch turrets, one forward, one aft', check: (s) => battery(s, 0.15, 1, 1, 2) },
    { cue: 'twin 3-inch mounts', check: (s) => turrets(s).filter((t) => t.calibre === 0.076).length >= 2 },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'lattice masts fore and aft', check: (s) => mastCount('lattice')(s) === 2 },
  ]),
  shimakaze: naval('shimakaze', [
    { cue: 'three twin 12.7 cm turrets: one forward, two aft', check: (s) => battery(s, 0.1, 1, 2, 2) },
    { cue: 'three quintuple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 5).length === 3 },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  montecuccoli: naval('montecuccoli', [
    { cue: 'four twin 152 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 2) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels far apart', check: (s) => funnels(s) === 2 && funnelGap(s) >= 20 },
    { cue: 'flush deck with sheer', check: (s) => flush(s) && (s.sheer ?? 0) >= 3 },
  ]),
  mackensen: naval('mackensen', [
    { cue: 'four twin 35 cm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 2) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  kamikaze: naval('kamikaze', [
    { cue: 'four single 12 cm guns: forecastle, between the funnels, two aft', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 2 },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'well deck between the forecastle and the bridge', check: forecastle },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  kaiser: naval('kaiser', [
    { cue: 'five twin 30.5 cm turrets: one forward, two wing turrets amidships, two aft', check: (s) => fwd(s, 0.3).length === 1 && aft(s, 0.3).length === 2 && mains(s, 0.3).filter((t) => !!t.side).length === 2 },
    { cue: 'X superfiring over Y', check: (s) => superfires(aft(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  ]),
  dreadnought: naval('dreadnought', [
    { cue: 'five twin 12-inch turrets: one forward, two wing turrets, two aft on the centre line', check: (s) => fwd(s, 0.3).length === 1 && aft(s, 0.3).length === 2 && mains(s, 0.3).filter((t) => !!t.side).length === 2 },
    { cue: 'no superfiring turrets', check: (s) => !superfires(fwd(s, 0.3)) && !superfires(aft(s, 0.3)) },
    { cue: 'two funnels, the tripod foremast between them', check: (s) => funnels(s) === 2 && mastKind('tripod')(s) },
  ]),
  daring: naval('daring', [
    { cue: 'three twin 4.5-inch turrets: two forward, one aft', check: (s) => battery(s, 0.1, 2, 1, 2) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.1)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'lattice foremast', check: mastKind('lattice') },
    { cue: 'quintuple torpedo tube mounts', check: (s) => tubeMounts(s).some((t) => t.barrels === 5) },
  ]),
  bayern: naval('bayern', [
    { cue: 'four twin 38 cm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 2) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels close together', check: (s) => funnels(s) === 2 && funnelGap(s) < 16 },
    { cue: 'short beamy hull', check: (s) => s.length / s.beam < 6.5 },
  ]),
  novik: naval('novik', [
    { cue: 'four funnels', check: (s) => funnels(s) === 4 },
    { cue: 'single 102 mm guns on a low flush deck', check: (s) => singles(s) && flush(s) },
    { cue: 'triple torpedo tube mounts on the centre line', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 3 },
  ]),
  'kirov-1936': naval('kirov-1936', [
    { cue: 'three triple 180 mm turrets: two forward, one aft', check: (s) => battery(s, 0.17, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.17)) },
    { cue: 'one big funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tall bridge tower with a tripod foremast', check: (s) => tall(15)(s) && mastKind('tripod')(s) },
  ]),
  dunkerque: naval('dunkerque', [
    { cue: 'two quadruple 330 mm turrets, both forward', check: (s) => battery(s, 0.3, 2, 0, 4) && superfires(fwd(s, 0.3)) },
    { cue: 'quadruple 130 mm turrets aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.13 && t.barrels === 4 && t.x < 0).length >= 2 },
    { cue: 'tall tower bridge', check: tall(25) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  bretagne: naval('bretagne', [
    { cue: 'five twin 340 mm turrets: two forward, one amidships, two aft', check: (s) => battery(s, 0.3, 2, 3, 2) && mains(s, 0.3).some((t) => Math.abs(t.x) < 15) },
    { cue: 'superfiring pairs at both ends', check: (s) => superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels far apart, the midships turret between them', check: (s) => funnels(s) === 2 && funnelGap(s) > 25 },
  ]),
  'von-der-tann': naval('von-der-tann', [
    { cue: 'four twin 28 cm turrets: fore, aft and two wing turrets en echelon', check: (s) => fwd(s, 0.25).length === 1 && aft(s, 0.25).length === 1 && mains(s, 0.25).filter((t) => !!t.side).length === 2 },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'pole masts fore and aft', check: (s) => mastCount('pole')(s) === 2 },
  ]),
  tennessee: naval('tennessee', [
    { cue: 'four triple 14-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 3) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one funnel faired into the tower (as rebuilt)', check: (s) => funnels(s) === 1 },
    { cue: 'twin 5-inch mounts on the beams', check: (s) => wings(s, 0.127, 2) >= 4 },
    { cue: 'very beamy hull with bulges', check: (s) => s.length / s.beam < 5.6 },
  ]),
  'mogami-1943': naval('mogami-1943', [
    { cue: 'three twin 20 cm turrets, all forward', check: (s) => battery(s, 0.2, 3, 0, 2) },
    { cue: 'aircraft deck in place of the aft turrets', check: (s) => (s.bodies ?? []).some((b) => b.plan.some((p) => p[0] < -s.length / 2 + 15) && b.plan[0][1] >= 8) },
    { cue: 'one big trunked funnel', check: (s) => funnels(s) === 1 },
  ]),
  kuma: naval('kuma', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'single 14 cm guns: two forward, two aft and on the beams', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 2 && beamGuns(s) },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  'cavour-1933': naval('cavour-1933', [
    { cue: 'triple 320 mm turrets A and Y, twin B and X superfiring', check: (s) => fwd(s, 0.3).map((t) => t.barrels).join() === '3,2' && aft(s, 0.3).map((t) => t.barrels).join() === '2,3' && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'tower bridge (as rebuilt)', check: tall(20) },
  ]),
  wyoming: naval('wyoming', [
    { cue: 'six twin 12-inch turrets: two forward, four aft', check: (s) => battery(s, 0.3, 2, 4, 2) },
    { cue: 'superfiring pairs forward and aft', check: (s) => superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'cage masts fore and aft', check: (s) => mastCount('lattice')(s) === 2 },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  svetlana: naval('svetlana', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'single 130 mm guns, fore and aft and along the beams', check: (s) => singles(s) && beamGuns(s) },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'two masts', check: (s) => (s.masts?.length ?? 0) === 2 },
  ]),
  leone: naval('leone', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'four twin 120 mm mounts: two forward, two aft', check: (s) => battery(s, 0.1, 2, 2, 2) },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  leningrad: naval('leningrad', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'five single 130 mm guns: two forward, three aft', check: (s) => battery(s, 0.1, 2, 3, 1) },
    { cue: 'quadruple torpedo tube mounts', check: (s) => tubeMounts(s).some((t) => t.barrels === 4) },
  ]),
  konigsberg: naval('konigsberg', [
    { cue: 'three triple 15 cm turrets: one forward, two aft', check: (s) => battery(s, 0.14, 1, 2, 3) },
    { cue: 'C turret superfiring over D', check: (s) => superfires(aft(s, 0.14)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  ]),
  hatsuharu: naval('hatsuharu', [
    { cue: 'two 12.7 cm gunhouses forward, B superfiring, one aft', check: (s) => fwd(s, 0.1).length === 2 && aft(s, 0.1).length === 1 && superfires(fwd(s, 0.1)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'triple torpedo tube mounts', check: (s) => tubeMounts(s).some((t) => t.barrels === 3) },
  ]),
  furutaka: naval('furutaka', [
    { cue: 'three twin 20 cm turrets: two forward, one aft', check: (s) => battery(s, 0.2, 2, 1, 2) },
    { cue: 'two funnels, the fore one trunked', check: (s) => funnels(s) === 2 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  courbet: naval('courbet', [
    { cue: 'six twin 305 mm turrets: superfiring pairs fore and aft, two wing turrets', check: (s) => fwd(s, 0.3).length === 2 && aft(s, 0.3).length === 2 && mains(s, 0.3).filter((t) => !!t.side).length === 2 && superfires(fwd(s, 0.3)) },
    { cue: 'two funnels far apart', check: (s) => funnels(s) === 2 && funnelGap(s) > 25 },
  ]),
  'capitani-romani': naval('capitani-romani', [
    { cue: 'four twin 135 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.13, 2, 2, 2) && superfires(fwd(s, 0.13)) && superfires(aft(s, 0.13)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'slim, very fast hull (length ten beams)', check: (s) => s.length / s.beam > 9.5 },
  ]),
  yugumo: naval('yugumo', [
    { cue: 'three twin 12.7 cm gunhouses: one forward, two aft', check: (s) => battery(s, 0.1, 1, 2, 2) },
    { cue: 'X superfiring over Y', check: (s) => superfires(aft(s, 0.1)) },
    { cue: 'two funnels, the fore one thicker', check: (s) => funnels(s) === 2 && s.funnels![0].diameter > s.funnels![1].diameter },
    { cue: 'two quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
  ]),
  warspite: naval('warspite', [
    { cue: 'four twin 15-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 2) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one funnel (as rebuilt)', check: (s) => funnels(s) === 1 },
    { cue: 'tower bridge (as rebuilt)', check: tall(20) },
  ]),
  sumner: naval('sumner', [
    { cue: 'three twin 5-inch mounts: two forward, one aft', check: (s) => battery(s, 0.1, 2, 1, 2) },
    { cue: 'B mount superfiring over A', check: (s) => superfires(fwd(s, 0.1)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'quintuple torpedo tubes amidships', check: (s) => tubeMounts(s).some((t) => t.barrels === 5) },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  suffren: naval('suffren', [
    { cue: 'four twin 203 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.2, 2, 2, 2) && superfires(fwd(s, 0.2)) && superfires(aft(s, 0.2)) },
    { cue: 'two funnels far apart', check: (s) => funnels(s) === 2 && funnelGap(s) >= 15 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  soldati: naval('soldati', [
    { cue: 'twin 120 mm mounts forward and aft, a single amidships', check: (s) => fwd(s, 0.1).filter((t) => t.barrels === 2).length === 1 && aft(s, 0.1).length === 1 && mains(s, 0.1).some((t) => t.barrels === 1) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  'royal-sovereign': naval('royal-sovereign', [
    { cue: 'four twin 15-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 2) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tall foremast over the bridge', check: (s) => (s.masts ?? []).some((m) => m.x > 0 && m.height > 25) },
  ]),
  'queen-mary': naval('queen-mary', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'four twin 13.5-inch turrets: A, B forward, Q amidships, Y aft', check: (s) => fwd(s, 0.3).length === 2 && aft(s, 0.3).length === 2 && superfires(fwd(s, 0.3)) },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'project-48': naval('project-48', [
    { cue: 'three twin 130 mm turrets: two forward, one aft', check: (s) => battery(s, 0.1, 2, 1, 2) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.1)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  ]),
  pensacola: naval('pensacola', [
    { cue: 'twin 8-inch turrets low at the ends, triples superfiring over them', check: (s) => fwd(s, 0.2).map((t) => t.barrels).join() === '2,3' && aft(s, 0.2).map((t) => t.barrels).join() === '3,2' && superfires(fwd(s, 0.2)) && superfires(aft(s, 0.2)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  pennsylvania: naval('pennsylvania', [
    { cue: 'four triple 14-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 3) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tripod masts fore and aft', check: (s) => mastCount('tripod')(s) === 2 },
  ]),
  oyodo: naval('oyodo', [
    { cue: 'two triple 15.5 cm turrets, both forward', check: (s) => battery(s, 0.15, 2, 0, 3) },
    { cue: 'long hangar and catapult aft', check: (s) => (s.bodies ?? []).some((b) => b.plan[b.plan.length - 1][0] < -25 && b.plan[0][1] >= 5) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  'new-york': naval('new-york', [
    { cue: 'five twin 14-inch turrets: two forward, one amidships, two aft', check: (s) => battery(s, 0.3, 2, 3, 2) && mains(s, 0.3).some((t) => Math.abs(t.x) < 15) },
    { cue: 'superfiring pairs at both ends', check: (s) => superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'london-1941': naval('london-1941', [
    { cue: 'four twin 8-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.2, 2, 2, 2) && superfires(fwd(s, 0.2)) && superfires(aft(s, 0.2)) },
    { cue: 'two funnels (as rebuilt)', check: (s) => funnels(s) === 2 },
    { cue: 'very high flush-sided hull', check: (s) => s.freeboard >= 9 && flush(s) },
  ]),
  impetuoso: naval('impetuoso', [
    { cue: 'twin 127 mm mounts, one forward, one aft', check: (s) => battery(s, 0.1, 1, 1, 2) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'two masts amidships', check: (s) => (s.masts?.length ?? 0) === 2 },
  ]),
  hood: naval('hood', [
    { cue: 'four twin 15-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 2) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two big funnels', check: (s) => funnels(s) === 2 },
    { cue: 'very long hull with a sheered bow', check: (s) => s.length > 255 && (s.sheer ?? 0) >= 4 },
  ]),
  giussano: naval('giussano', [
    { cue: 'four twin 152 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 2) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'slim hull with a long forecastle', check: (s) => s.length / s.beam > 10 && forecastle(s) },
  ]),
  'forrest-sherman': naval('forrest-sherman', [
    { cue: 'three single 5-inch/54 mounts: one forward, two aft', check: (s) => battery(s, 0.1, 1, 2, 1) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'flush deck with sheer forward', check: (s) => flush(s) && (s.sheer ?? 0) >= 2 },
  ]),
  'emile-bertin': naval('emile-bertin', [
    { cue: 'three triple 152 mm turrets: two forward, one aft', check: (s) => battery(s, 0.15, 2, 1, 3) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  agano: naval('agano', [
    { cue: 'three twin 15 cm turrets: two forward, one aft', check: (s) => battery(s, 0.14, 2, 1, 2) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  abruzzi: naval('abruzzi', [
    { cue: 'triple 152 mm turrets A and Y, twins B and X superfiring', check: (s) => fwd(s, 0.15).map((t) => t.barrels).join() === '3,2' && aft(s, 0.15).map((t) => t.barrels).join() === '2,3' && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  ]),
  'leander-frigate': naval('leander-frigate', [
    { cue: 'twin 4.5-inch turret forward', check: (s) => battery(s, 0.1, 1, 0, 2) },
    { cue: 'one big funnel amidships', check: (s) => funnels(s) === 1 },
    { cue: 'big radar aerial on the mainmast', check: (s) => (s.radars ?? []).some((r) => (r.size ?? 0) >= 6) },
    { cue: 'hangar and flight deck aft', check: (s) => !!s.helideck },
  ]),
  aoba: naval('aoba', [
    { cue: 'three twin 20 cm turrets: two forward, one aft', check: (s) => battery(s, 0.2, 2, 1, 2) },
    { cue: 'two funnels, the fore one larger', check: (s) => funnels(s) === 2 && s.funnels![0].diameter > s.funnels![1].diameter },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  nevada: naval('nevada', [
    { cue: 'triple 14-inch turrets A and Y, twins B and X superfiring', check: (s) => fwd(s, 0.3).map((t) => t.barrels).join() === '3,2' && aft(s, 0.3).map((t) => t.barrels).join() === '2,3' && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tripod masts fore and aft', check: (s) => mastCount('tripod')(s) === 2 },
  ]),
  nassau: naval('nassau', [
    { cue: 'six twin 28 cm turrets in a hexagon: fore, aft and two on each beam', check: (s) => fwd(s, 0.25).length === 1 && aft(s, 0.25).length === 1 && mains(s, 0.25).filter((t) => !!t.side).length === 4 },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'short beamy hull', check: (s) => s.length / s.beam < 6 },
  ]),
  'doria-1940': naval('doria-1940', [
    { cue: 'triple 320 mm turrets A and Y, twins B and X superfiring', check: (s) => fwd(s, 0.3).map((t) => t.barrels).join() === '3,2' && aft(s, 0.3).map((t) => t.barrels).join() === '2,3' && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'tower bridge (as rebuilt)', check: tall(20) },
  ]),
  fuso: naval('fuso', [
    { cue: 'six twin 35.6 cm turrets: two forward, two amidships, two aft', check: (s) => mains(s, 0.3).length === 6 && mains(s, 0.3).filter((t) => Math.abs(t.x) < 30).length === 2 },
    { cue: 'very tall, top-heavy pagoda', check: tall(40) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  'duguay-trouin': naval('duguay-trouin', [
    { cue: 'four twin 155 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 2) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  somers: naval('somers', [
    { cue: 'four twin 5-inch mounts, superfiring pairs fore and aft', check: (s) => battery(s, 0.1, 2, 2, 2) && superfires(fwd(s, 0.1)) && superfires(aft(s, 0.1)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'quadruple torpedo tube mounts', check: (s) => tubeMounts(s).some((t) => t.barrels === 4) },
  ]),
  mitscher: naval('mitscher', [
    { cue: 'single 5-inch/54 mounts, one forward, one aft', check: (s) => battery(s, 0.1, 1, 1, 1) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'long flush deck with sheer forward', check: (s) => flush(s) && (s.sheer ?? 0) >= 2 },
  ]),
  maestrale: naval('maestrale', [
    { cue: 'twin 120 mm mounts, one forward, one aft on a deckhouse', check: (s) => battery(s, 0.1, 1, 1, 2) },
    { cue: 'one big trunked funnel', check: (s) => funnels(s) === 1 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  delaware: naval('delaware', [
    { cue: 'five twin 12-inch turrets: two forward, three aft', check: (s) => battery(s, 0.3, 2, 3, 2) },
    { cue: 'cage masts fore and aft', check: (s) => mastCount('lattice')(s) === 2 },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  ]),
  'new-mexico': naval('new-mexico', [
    { cue: 'four triple 14-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 3) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tower bridge (as rebuilt)', check: tall(20) },
  ]),
  konig: naval('konig', [
    { cue: 'five twin 30.5 cm turrets on the centre line: two forward, one amidships, two aft', check: (s) => mains(s, 0.3).filter((t) => !t.side && t.barrels === 2).length === 5 && fwd(s, 0.3).length === 2 && mains(s, 0.3).some((t) => Math.abs(t.x) < 10) },
    { cue: 'superfiring pairs at both ends', check: (s) => superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  ]),
  derfflinger: naval('derfflinger', [
    { cue: 'four twin 30.5 cm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 2) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'flush deck', check: flush },
  ]),
  'gneisenau-380': naval('gneisenau-380', [
    { cue: 'three twin 38 cm turrets: two forward, one aft', check: (s) => battery(s, 0.3, 2, 1, 2) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.3)) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'Atlantic bow with a strong sheer', check: (s) => (s.sheer ?? 0) >= 5 },
  ]),
  'imperatritsa-mariya': naval('imperatritsa-mariya', [
    { cue: 'four triple 305 mm turrets spread along the deck, none superfiring', check: (s) => mains(s, 0.3).length === 4 && mains(s, 0.3).every((t) => t.barrels === 3) && !superfires(fwd(s, 0.3)) && !superfires(aft(s, 0.3)) },
    { cue: 'two funnels far apart', check: (s) => funnels(s) === 2 && funnelGap(s) > 25 },
  ]),
  stalingrad: naval('stalingrad', [
    { cue: 'three triple 305 mm turrets: two forward, one aft', check: (s) => battery(s, 0.3, 2, 1, 3) },
    { cue: 'B turret superfiring over A', check: (s) => superfires(fwd(s, 0.3)) },
    { cue: 'one big funnel', check: (s) => funnels(s) === 1 },
    { cue: 'very long hull', check: (s) => s.length > 270 },
  ]),
  'invincible-1908': naval('invincible-1908', [
    { cue: 'four twin 12-inch turrets: fore, aft and two wing turrets en echelon', check: (s) => fwd(s, 0.3).length === 1 && aft(s, 0.3).length === 1 && mains(s, 0.3).filter((t) => !!t.side).length === 2 },
    { cue: 'three funnels, the aft one apart', check: (s) => funnels(s) === 3 && s.funnels![1].x - s.funnels![2].x > s.funnels![0].x - s.funnels![1].x },
  ]),
  orion: naval('orion', [
    { cue: 'five twin 13.5-inch turrets on the centre line: two forward, Q amidships, two aft', check: (s) => battery(s, 0.3, 2, 3, 2) && mains(s, 0.3).some((t) => Math.abs(t.x) < 10) },
    { cue: 'superfiring pairs at both ends', check: (s) => superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels, the tripod foremast between them', check: (s) => funnels(s) === 2 && mastKind('tripod')(s) },
  ]),
  vanguard: naval('vanguard', [
    { cue: 'four twin 15-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 2) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'strong sheer to a high bow', check: (s) => (s.sheer ?? 0) >= 6 },
  ]),
  kawachi: naval('kawachi', [
    { cue: 'six twin 12-inch turrets: fore, aft and two on each beam', check: (s) => fwd(s, 0.3).length === 1 && aft(s, 0.3).length === 1 && mains(s, 0.3).filter((t) => !!t.side).length === 4 },
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
  ]),
  tosa: naval('tosa', [
    { cue: 'five twin 41 cm turrets: two forward, three aft', check: (s) => battery(s, 0.4, 2, 3, 2) },
    { cue: 'superfiring pairs at both ends', check: (s) => superfires(fwd(s, 0.4)) && superfires(aft(s, 0.4)) },
  ]),
  'dante-alighieri': naval('dante-alighieri', [
    { cue: 'four triple 305 mm turrets: fore, aft and two amidships', check: (s) => mains(s, 0.3).length === 4 && mains(s, 0.3).every((t) => t.barrels === 3) && mains(s, 0.3).filter((t) => Math.abs(t.x) < 30).length === 2 },
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'no superfiring turrets', check: (s) => !superfires(fwd(s, 0.3)) && !superfires(aft(s, 0.3)) },
  ]),
  'cavour-1915': naval('cavour-1915', [
    { cue: 'thirteen 305 mm guns: triples A, Q and Y, twins B and X superfiring', check: (s) => mains(s, 0.3).reduce((n, t) => n + t.barrels, 0) === 13 && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels far apart', check: (s) => funnels(s) === 2 && funnelGap(s) > 25 },
  ]),
  caracciolo: naval('caracciolo', [
    { cue: 'four twin 381 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.3, 2, 2, 2) && superfires(fwd(s, 0.3)) && superfires(aft(s, 0.3)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
  ]),
  portland: naval('portland', [
    { cue: 'three triple 8-inch turrets: two forward, one aft', check: (s) => battery(s, 0.2, 2, 1, 3) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  'maxim-gorky': naval('maxim-gorky', [
    { cue: 'three triple 180 mm turrets: two forward, one aft', check: (s) => battery(s, 0.17, 2, 1, 3) },
    { cue: 'one big funnel', check: (s) => funnels(s) === 1 },
    { cue: 'tower bridge', check: tall(20) },
  ]),
  hawkins: naval('hawkins', [
    { cue: 'single 7.5-inch guns behind shields: two forward, two aft, more on the beams', check: (s) => singles(s, 0.18) && fwd(s, 0.18).length === 2 && aft(s, 0.18).length === 2 && beamGuns(s) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'long forecastle stepping down aft', check: forecastle },
  ]),
  dido: naval('dido', [
    { cue: 'five twin 5.25-inch turrets: three stepped up forward, two aft', check: (s) => battery(s, 0.13, 3, 2, 2) && superfires(fwd(s, 0.13)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'long forecastle', check: forecastle },
  ]),
  york: naval('york', [
    { cue: 'three twin 8-inch turrets: two forward, one aft', check: (s) => battery(s, 0.2, 2, 1, 2) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'very high flush-sided hull', check: (s) => s.freeboard >= 9 && flush(s) },
  ]),
  trento: naval('trento', [
    { cue: 'four twin 203 mm turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.2, 2, 2, 2) && superfires(fwd(s, 0.2)) && superfires(aft(s, 0.2)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'flush deck with sheer', check: (s) => flush(s) && (s.sheer ?? 0) >= 3 },
  ]),
  porter: naval('porter', [
    { cue: 'four twin 5-inch mounts, superfiring pairs fore and aft', check: (s) => battery(s, 0.1, 2, 2, 2) && superfires(fwd(s, 0.1)) && superfires(aft(s, 0.1)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'quadruple torpedo tube mounts', check: (s) => tubeMounts(s).some((t) => t.barrels === 4) },
  ]),
  navigatori: naval('navigatori', [
    { cue: 'three twin 120 mm mounts: forward, amidships between the funnels, aft', check: (s) => battery(s, 0.1, 1, 2, 2) && mains(s, 0.1).some((t) => Math.abs(t.x) < 10) },
    { cue: 'two funnels far apart', check: (s) => funnels(s) === 2 && funnelGap(s) > 15 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  'medaglie-d-oro': naval('medaglie-d-oro', [
    { cue: 'four single 135 mm guns: two forward, two aft', check: (s) => battery(s, 0.13, 2, 2, 1) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  'riga-frigate': naval('riga-frigate', [
    { cue: 'three single 100 mm guns: two forward, one aft', check: (s) => battery(s, 0.09, 2, 1, 1) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'triple torpedo tube mount amidships', check: (s) => tubeMounts(s).some((t) => t.barrels === 3) },
  ]),
  // Carriers, amphibious ships, coastal craft and boats.
  'nimitz-carrier': naval('nimitz-carrier', [
    { cue: 'island on the starboard edge, aft of the middle', check: (s) => islandSide(s) > 0 && islandX(s) < 5 },
    { cue: 'angled deck overhanging to port', check: (s) => Math.min(...(s.decks?.[0]?.plan ?? []).map((p) => p[1])) < -s.beam * 0.7 },
    { cue: 'deck-edge lifts, three to starboard and one to port', check: (s) => edgeLifts(s) >= 3 },
    { cue: 'very long flat deck, over 300 m', check: (s) => s.length > 300 },
  ]),
  invincible: naval('invincible', [
    { cue: 'ski-jump ramp at the bow', check: (s) => (s.oneSide ?? []).some((o) => o.top.length === 3 && o.top[0][1] > o.top[2][1] + 2) },
    { cue: 'long island on the starboard edge', check: (s) => islandSide(s) > 0 },
    { cue: 'two masts on the island with big radar aerials', check: (s) => (s.masts?.length ?? 0) === 2 && (s.radars ?? []).filter((r) => r.kind === 'array').length === 2 },
    { cue: 'twin Sea Dart launcher on the foredeck', check: (s) => turrets(s).some((t) => t.calibre === 0.3 && t.barrels === 2 && t.x > s.length * 0.35) },
  ]),
  'lcvp-landing-craft': naval('lcvp-landing-craft', [
    { cue: 'square box hull with a bow ramp', check: (s) => s.length / s.beam < 4 && s.cls === 'landing-craft' },
    { cue: 'two machine guns in tubs aft', check: (s) => turrets(s).filter((t) => t.x < 0).length === 2 },
    { cue: 'about 11 m long', check: (s) => s.length > 10 && s.length < 12 },
  ]),
  'cargo-ship': naval('cargo-ship', [
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'three masts with cargo derricks over the holds', check: (s) => (s.masts?.length ?? 0) === 3 },
    { cue: 'bridge house standing high over the deck', check: tall(8) },
  ]),
  'lst-mk2': naval('lst-mk2', [
    { cue: 'long box hull with bow doors, the superstructure right aft', check: (s) => (s.bodies ?? []).some((b) => Math.max(...b.top.map((p) => p[1])) > s.freeboard + 5 && b.plan[0][0] < -20) },
    { cue: 'single 40 mm guns at the bow and stern', check: (s) => turrets(s).filter((t) => t.calibre === 0.04 && !t.side).length === 2 },
    { cue: '20 mm guns along the sides', check: (s) => wings(s, 0.02) >= 4 },
    { cue: 'one mast on the aft deckhouse', check: (s) => (s.masts?.length ?? 0) === 1 && s.masts![0].x < -20 },
  ]),
  'ms-crda': naval('ms-crda', [
    { cue: 'torpedo tubes on the foredeck', check: (s) => (s.launchers ?? []).some((l) => l.kind === 'tubes' && l.x > 0) },
    { cue: '20 mm gun aft', check: (s) => turrets(s).some((t) => t.calibre === 0.02 && t.x < 0) },
    { cue: 'small enclosed bridge with a mast', check: (s) => (s.masts?.length ?? 0) === 1 && (s.bodies ?? []).length >= 1 },
    { cue: 'planing hull with a broad square transom', check: (s) => (s.transom ?? 0) >= 0.8 },
  ]),
  daihatsu: naval('daihatsu', [
    { cue: 'landing barge with a bow ramp, short and broad', check: (s) => s.length / s.beam < 5 && s.cls === 'landing-craft' },
    { cue: 'about 15 m long', check: (s) => s.length > 13 && s.length < 16 },
    { cue: 'coxswain shelter aft', check: (s) => (s.bodies ?? []).some((b) => b.plan[b.plan.length - 1][0] < -s.length / 4) },
  ]),
  peniche: naval('peniche', [
    { cue: 'long low barge hull', check: (s) => s.length / s.beam > 7 && s.freeboard < 2 },
    { cue: 'small wheelhouse at the stern', check: (s) => (s.bodies ?? []).some((b) => b.plan[b.plan.length - 1][0] < -s.length / 3) },
  ]),
  'fairmile-d': naval('fairmile-d', [
    { cue: '6-pounder guns fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.057 && !t.side).length === 2 },
    { cue: 'twin 0.5-inch machine guns on the bridge wings', check: (s) => wings(s, 0.013, 2) === 2 },
    { cue: 'torpedo tubes on the sides', check: (s) => tubes(s) >= 1 },
    { cue: 'high flared bow (the Dog Boat)', check: (s) => (s.sheer ?? 0) >= 1 },
  ]),
  'dark-class': naval('dark-class', [
    { cue: '6-pounder forward, 40 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.057 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.04 && t.x < 0) },
    { cue: 'torpedo tubes on the sides', check: (s) => tubes(s) >= 1 },
    { cue: 'broad square transom', check: (s) => (s.transom ?? 0) >= 0.8 },
  ]),
  'arras-aviso': naval('arras-aviso', [
    { cue: 'two single 138 mm guns, fore and aft', check: (s) => battery(s, 0.13, 1, 1, 1) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  'mc-gunboat': naval('mc-gunboat', [
    { cue: 'single 40 mm guns fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.04).length === 2 },
    { cue: 'small planing hull under 30 m', check: (s) => s.length < 30 },
    { cue: 'mast on the small bridge', check: (s) => (s.masts?.length ?? 0) === 1 },
  ]),
  'patrol-boat': naval('patrol-boat', [
    { cue: 'one gun on the foredeck', check: (s) => turrets(s).length === 1 && turrets(s)[0].x > 0 },
    { cue: 'mast on the wheelhouse', check: (s) => (s.masts?.length ?? 0) === 1 },
  ]),
  tango: naval('tango', [
    { cue: 'long tall sail forward of the middle', check: (s) => (s.bodies ?? []).some((b) => Math.max(...b.top.map((p) => p[1])) > 8 && b.plan[0][0] > 0) },
    { cue: 'no deck guns', check: (s) => turrets(s).length === 0 },
    { cue: 'running awash, the deck at the waterline', check: (s) => s.freeboard === 0 && s.hull === 'submarine' },
  ]),
  shchuka: naval('shchuka', [
    { cue: '45 mm guns on the tower platforms fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.045).length === 2 },
    { cue: 'short hull under 60 m', check: (s) => s.length < 60 },
    { cue: 'conning tower with gun platforms', check: (s) => (s.bodies ?? []).length >= 3 },
  ]),
  'interceptor-boat': naval('interceptor-boat', [
    { cue: 'heavy machine gun aft', check: (s) => turrets(s).some((t) => t.calibre === 0.013 && t.x < 0) },
    { cue: 'small planing hull, about 15 m', check: (s) => s.length < 17 },
  ]),
  'project-183': naval('project-183', [
    { cue: 'twin 25 mm mounts fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.025 && t.barrels === 2).length === 2 },
    { cue: 'torpedo tubes along the sides', check: (s) => tubes(s) >= 1 },
    { cue: 'wooden planing hull, 25 m', check: (s) => s.length < 27 },
  ]),
  'pc-subchaser': naval('pc-subchaser', [
    { cue: '3-inch gun forward, 40 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.04 && t.x < 0) },
    { cue: 'one small funnel', check: (s) => funnels(s) === 1 },
    { cue: 'long slim hull', check: (s) => s.length / s.beam > 7 },
  ]),
  'assault-hovercraft': naval('assault-hovercraft', [
    { cue: 'big ducted propellers aft', check: (s) => (s.ducts?.length ?? 0) >= 1 },
    { cue: 'skirted craft, as wide as half its length', check: (s) => s.beam / s.length >= 0.45 },
    { cue: 'gun on the cabin roof', check: (s) => turrets(s).length === 1 },
  ]),
  'pr-122': naval('pr-122', [
    { cue: '85 mm gun forward', check: (s) => turrets(s).some((t) => t.calibre === 0.085 && t.x > 0) },
    { cue: '37 mm guns aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.037 && t.x < 0).length === 2 },
    { cue: 'small funnel aft of the bridge', check: (s) => funnels(s) === 1 },
  ]),
  'lcs-l3': naval('lcs-l3', [
    { cue: '3-inch gun on the bow', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) },
    { cue: 'twin 40 mm mounts, the forward one raised', check: (s) => turrets(s).filter((t) => t.calibre === 0.04 && t.barrels === 2).length === 2 },
    { cue: '20 mm guns on the sides', check: (s) => wings(s, 0.02) >= 2 },
  ]),
  'bpb-71': naval('bpb-71', [
    { cue: '40 mm forward, 20 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.04 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.02 && t.x < 0) },
    { cue: 'twin machine guns on the bridge wings', check: (s) => wings(s, 0.013, 2) === 2 },
    { cue: 'broad square transom', check: (s) => (s.transom ?? 0) >= 0.8 },
  ]),
  freccia: naval('freccia', [
    { cue: 'twin 120 mm mounts, one forward, one aft', check: (s) => battery(s, 0.1, 1, 1, 2) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'two triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  'kilo-submarine': naval('kilo-submarine', [
    { cue: 'long low sail forward of the middle', check: (s) => (s.bodies ?? []).some((b) => Math.max(...b.top.map((p) => p[1])) > 8 && b.plan[0][0] > 0) },
    { cue: 'blunt teardrop hull running awash', check: (s) => s.freeboard === 0 && s.length / s.beam < 8 },
    { cue: 'cruciform stern planes', check: (s) => (s.bodies ?? []).filter((b) => b.plan[0][0] < -s.length / 2 + 8).length >= 2 },
  ]),
  rhib: naval('rhib', [
    { cue: 'small open boat, about 11 m', check: (s) => s.length < 12 },
    { cue: 'low on the water', check: (s) => s.freeboard < 1 },
    { cue: 'console, seats and engines on an open deck', check: (s) => (s.bodies ?? []).length >= 3 },
  ]),
  ticonderoga: naval('ticonderoga', [
    { cue: 'single 5-inch guns fore and aft', check: (s) => battery(s, 0.1, 1, 1, 1) },
    { cue: 'two deckhouses with SPY-1 faces', check: (s) => (s.radars ?? []).filter((r) => r.kind === 'faces').length === 2 },
    { cue: 'vertical launch cells fore and aft', check: (s) => (s.launchers ?? []).filter((l) => (l.kind ?? 'vls') === 'vls').length === 2 },
    { cue: 'two masts', check: (s) => (s.masts?.length ?? 0) === 2 },
    { cue: 'Phalanx mounts high on both deckhouses', check: (s) => turrets(s).filter((t) => t.calibre === 0.02).length === 4 },
  ]),
  'la-combattante': naval('la-combattante', [
    { cue: '76 mm gun forward, twin 40 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.04 && t.barrels === 2 && t.x < 0) },
    { cue: 'anti-ship missile launchers amidships', check: (s) => tubes(s) >= 1 },
    { cue: 'radome on the mast', check: (s) => (s.radars ?? []).some((r) => r.kind === 'dome') },
  ]),
  grisha: naval('grisha', [
    { cue: 'twin 57 mm mount aft', check: (s) => turrets(s).some((t) => t.calibre === 0.057 && t.barrels === 2 && t.x < 0) },
    { cue: 'SA-N-4 launcher bin on the foredeck', check: (s) => (s.launchers ?? []).some((l) => l.kind === 'box' && l.x > 0) },
    { cue: 'radome and search radar on the mast', check: (s) => (s.radars ?? []).some((r) => r.kind === 'dome') },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  'osa-missile-boat': naval('osa-missile-boat', [
    { cue: 'four big missile containers along the sides', check: (s) => tubes(s) >= 1 },
    { cue: 'twin 30 mm mounts fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.03 && t.barrels === 2).length === 2 },
    { cue: 'radome on the mast', check: (s) => (s.radars ?? []).some((r) => r.kind === 'dome') },
  ]),
  'attack-transport': naval('attack-transport', [
    { cue: 'merchant hull with the superstructure amidships', check: tall(6) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'kingposts and booms fore and aft for the landing craft', check: (s) => (s.masts?.length ?? 0) >= 4 },
    { cue: '5-inch gun aft, 3-inch forward', check: (s) => turrets(s).some((t) => t.calibre === 0.127 && t.x < 0) && turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) },
  ]),
  marinefahrprahm: naval('marinefahrprahm', [
    { cue: 'flat-bottomed ferry barge with a bow ramp', check: (s) => s.cls === 'landing-craft' && s.length / s.beam < 8 },
    { cue: '8.8 cm gun on the deck aft', check: (s) => turrets(s).some((t) => t.calibre === 0.088 && t.x < 0) },
    { cue: '20 mm gun on a raised stern platform', check: (s) => turrets(s).some((t) => t.calibre === 0.02 && t.x < 0 && (t.up ?? 0) > 2) },
  ]),
  'x-lighter': naval('x-lighter', [
    { cue: 'barge hull with a bow ramp', check: (s) => s.cls === 'landing-craft' },
    { cue: 'wheelhouse and mast aft', check: (s) => (s.masts ?? []).some((m) => m.x < 0) },
    { cue: 'unarmed', check: (s) => turrets(s).length === 0 },
  ]),
  cb90: naval('cb90', [
    { cue: 'heavy machine guns on the cabin roof and in the bow', check: (s) => turrets(s).filter((t) => t.calibre === 0.013).length === 2 },
    { cue: 'waterjet assault boat, about 16 m', check: (s) => s.length < 17 },
  ]),
  pbr: naval('pbr', [
    { cue: 'twin .50 machine guns in the bow tub', check: (s) => turrets(s).some((t) => t.barrels === 2 && t.x > 0) },
    { cue: 'single .50 aft', check: (s) => turrets(s).some((t) => t.barrels === 1 && t.x < 0) },
    { cue: 'small fibreglass hull under 10 m', check: (s) => s.length < 10 },
  ]),
  'armed-speedboat': naval('armed-speedboat', [
    { cue: 'one heavy machine gun forward', check: (s) => turrets(s).length === 1 && turrets(s)[0].x > 0 },
    { cue: 'small open speedboat, about 11 m', check: (s) => s.length < 12 },
  ]),
  bulker: naval('bulker', [
    { cue: 'bridge and funnel right aft', check: (s) => funnels(s) === 1 && s.funnels![0].x < -s.length / 3 },
    { cue: 'cranes between the hatches', check: (s) => (s.masts?.length ?? 0) === 4 },
    { cue: 'long flat deck of hatch covers', check: (s) => (s.bodies ?? []).length >= 6 },
  ]),
  'river-cargo-ship': naval('river-cargo-ship', [
    { cue: 'funnel and wheelhouse aft', check: (s) => funnels(s) === 1 && s.funnels![0].x < -s.length / 4 },
    { cue: 'low river hull', check: (s) => s.freeboard < 3 },
    { cue: 'cargo mast forward', check: (s) => (s.masts ?? []).some((m) => m.x > 0) },
  ]),
  helgoland: naval('helgoland', [
    { cue: 'six twin 30.5 cm turrets in a hexagon: fore, aft and two on each beam', check: (s) => fwd(s, 0.3).length === 1 && aft(s, 0.3).length === 1 && mains(s, 0.3).filter((t) => !!t.side).length === 4 },
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'pole masts fore and aft', check: (s) => mastCount('pole')(s) === 2 },
  ]),
  southampton: naval('southampton', [
    { cue: 'four triple 6-inch turrets, superfiring pairs fore and aft', check: (s) => battery(s, 0.15, 2, 2, 3) && superfires(fwd(s, 0.15)) && superfires(aft(s, 0.15)) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'tripod masts fore and aft', check: (s) => mastCount('tripod')(s) === 2 },
  ]),
  'type-7u': naval('type-7u', [
    { cue: 'four single 130 mm guns: two forward, two aft, superfiring', check: (s) => battery(s, 0.1, 2, 2, 1) && superfires(fwd(s, 0.1)) && superfires(aft(s, 0.1)) },
    { cue: 'two funnels (the Type 7 had one)', check: (s) => funnels(s) === 2 },
    { cue: 'two triple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 3).length === 2 },
    { cue: 'tripod foremast', check: mastKind('tripod') },
  ]),
  'r-boot': naval('r-boot', [
    { cue: '20 mm gun forward, 37 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.02 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.037 && t.x < 0) },
    { cue: 'small funnel', check: (s) => funnels(s) === 1 },
    { cue: 'mast on the wheelhouse', check: (s) => (s.masts?.length ?? 0) === 1 },
  ]),
  'type-143-fac': naval('type-143-fac', [
    { cue: '76 mm guns fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.076).length === 2 },
    { cue: 'Exocet box launchers aft', check: (s) => (s.launchers ?? []).some((l) => l.kind === 'box' && l.x < 0) },
    { cue: 'mast on the bridge', check: (s) => (s.masts?.length ?? 0) === 1 },
  ]),
  'flower-corvette': naval('flower-corvette', [
    { cue: '4-inch gun on the forecastle', check: (s) => turrets(s).some((t) => t.calibre === 0.102 && t.x > 0) },
    { cue: 'one short funnel', check: (s) => funnels(s) === 1 },
    { cue: 'short whaler hull with a raised forecastle', check: (s) => forecastle(s) && s.length < 65 },
    { cue: 'pom-pom aft', check: (s) => turrets(s).some((t) => t.calibre === 0.04 && t.x < 0) },
  ]),
  'gabbiano-corvette': naval('gabbiano-corvette', [
    { cue: '100 mm gun forward', check: (s) => turrets(s).some((t) => t.calibre === 0.1 && t.x > 0) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'flush deck with sheer forward', check: (s) => flush(s) && (s.sheer ?? 0) >= 1 },
  ]),
  'hiburi-kaibokan': naval('hiburi-kaibokan', [
    { cue: 'single 12 cm gun forward, twin aft', check: (s) => turrets(s).some((t) => t.calibre === 0.12 && t.barrels === 1 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.12 && t.barrels === 2 && t.x < 0) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  'river-frigate': naval('river-frigate', [
    { cue: 'twin 4-inch forward, single aft', check: (s) => turrets(s).some((t) => t.calibre === 0.102 && t.barrels === 2 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.102 && t.barrels === 1 && t.x < 0) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'raised forecastle', check: forecastle },
  ]),
  'koln-frigate': naval('koln-frigate', [
    { cue: 'four single 100 mm guns: two forward, two aft', check: (s) => battery(s, 0.09, 2, 2, 1) },
    { cue: 'two funnels', check: (s) => funnels(s) === 2 },
    { cue: 'flush deck with sheer', check: (s) => flush(s) && (s.sheer ?? 0) >= 2 },
  ]),
  'gunboat-1124-mrls': naval('gunboat-1124-mrls', [
    { cue: '76 mm tank turret forward', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) },
    { cue: 'rocket launcher aft', check: (s) => (s.launchers ?? []).some((l) => l.x < 0) },
    { cue: 'small armoured river boat, about 25 m', check: (s) => s.length < 27 },
  ]),
  nagara: naval('nagara', [
    { cue: 'three funnels', check: (s) => funnels(s) === 3 },
    { cue: 'single 14 cm guns: two forward, two aft and on the beams', check: (s) => singles(s) && fwd(s).length === 2 && aft(s).length === 2 && beamGuns(s) },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'quadruple torpedo tube mounts', check: (s) => tubeMounts(s).filter((t) => t.barrels === 4).length === 2 },
  ]),
  'asheville-pg': naval('asheville-pg', [
    { cue: '3-inch gun forward, 40 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.04 && t.x < 0) },
    { cue: 'mast with a search radar', check: (s) => (s.radars?.length ?? 0) >= 1 },
  ]),
  'nasty-ptf': naval('nasty-ptf', [
    { cue: '20 mm forward, 40 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.02 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.04 && t.x < 0) },
    { cue: 'small fast boat, about 25 m', check: (s) => s.length < 26 },
  ]),
  parchim: naval('parchim', [
    { cue: 'twin 30 mm forward, twin 57 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.03 && t.x > 0) && turrets(s).some((t) => t.calibre === 0.057 && t.barrels === 2 && t.x < 0) },
    { cue: 'mast with a search radar', check: (s) => (s.radars?.length ?? 0) >= 1 },
  ]),
  'whitby-type-12': naval('whitby-type-12', [
    { cue: 'twin 4.5-inch turret forward', check: (s) => battery(s, 0.1, 1, 0, 2) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
    { cue: 'flush deck with a strong sheer to the bow', check: (s) => flush(s) && (s.sheer ?? 0) >= 3 },
  ]),
  'le-corse-e50': naval('le-corse-e50', [
    { cue: 'three twin 57 mm mounts: two forward, one aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.057 && t.x > 0).length === 2 && turrets(s).filter((t) => t.calibre === 0.057 && t.x < 0).length === 1 },
    { cue: 'triple torpedo tube mount', check: (s) => tubeMounts(s).some((t) => t.barrels === 3) },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  'albatros-corvette': naval('albatros-corvette', [
    { cue: '76 mm guns fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.076).length === 2 },
    { cue: 'one funnel', check: (s) => funnels(s) === 1 },
  ]),
  'peacock-pc': naval('peacock-pc', [
    { cue: '76 mm gun forward', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) },
    { cue: 'no funnel', check: (s) => funnels(s) === 0 },
    { cue: 'mast with a search radar', check: (s) => (s.radars?.length ?? 0) >= 1 },
  ]),
  'brave-fpb': naval('brave-fpb', [
    { cue: '40 mm guns fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.04).length === 2 },
    { cue: 'torpedo tubes', check: (s) => tubes(s) >= 1 },
    { cue: 'broad planing hull, about 30 m', check: (s) => s.length < 31 && s.beam / s.length > 0.2 },
  ]),
  'siebel-ferry': naval('siebel-ferry', [
    { cue: 'twin pontoons with a platform across them', check: (s) => s.beam / s.length > 0.5 },
    { cue: 'five 8.8 cm guns on the platform', check: (s) => turrets(s).filter((t) => t.calibre === 0.088).length === 5 },
  ]),
  komsomolets: naval('komsomolets', [
    { cue: 'twin heavy machine-gun turrets fore and aft', check: (s) => turrets(s).filter((t) => t.barrels === 2).length === 2 },
    { cue: 'torpedo tubes', check: (s) => tubes(s) >= 1 },
    { cue: 'small boat under 20 m', check: (s) => s.length < 20 },
  ]),
  'd-3': naval('d-3', [
    { cue: 'machine guns fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.013).length === 2 },
    { cue: 'small wooden boat, about 22 m', check: (s) => s.length < 23 },
  ]),
  'mo-4': naval('mo-4', [
    { cue: '45 mm guns fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.045).length === 2 },
    { cue: 'small wooden hunter, about 27 m', check: (s) => s.length < 28 },
  ]),
  shmel: naval('shmel', [
    { cue: '76 mm tank turret forward', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) },
    { cue: 'twin 25 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.025 && t.barrels === 2 && t.x < 0) },
    { cue: 'rocket launcher amidships', check: (s) => (s.launchers?.length ?? 0) >= 1 },
  ]),
  'pr-191': naval('pr-191', [
    { cue: '85 mm tank turret forward', check: (s) => turrets(s).some((t) => t.calibre === 0.085 && t.x > 0) },
    { cue: 'twin 25 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.025 && t.barrels === 2 && t.x < 0) },
  ]),
  'mbk-161': naval('mbk-161', [
    { cue: 'two 85 mm tank turrets, fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.085).length === 2 },
    { cue: '37 mm guns on the deckhouses', check: (s) => turrets(s).filter((t) => t.calibre === 0.037).length === 2 },
  ]),
  'mbk-186': naval('mbk-186', [
    { cue: 'two 85 mm tank turrets, fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.085).length === 2 },
    { cue: '37 mm guns on the deckhouses', check: (s) => turrets(s).filter((t) => t.calibre === 0.037).length === 2 },
  ]),
  'so-1': naval('so-1', [
    { cue: 'twin 25 mm mounts fore and aft', check: (s) => turrets(s).filter((t) => t.calibre === 0.025 && t.barrels === 2).length === 2 },
    { cue: 'small funnel', check: (s) => funnels(s) === 1 },
  ]),
  pauk: naval('pauk', [
    { cue: '76 mm gun forward', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) },
    { cue: '30 mm gatling aft', check: (s) => turrets(s).some((t) => t.calibre === 0.03 && t.x < 0) },
    { cue: 'lattice mast with a radome', check: (s) => mastKind('lattice')(s) && (s.radars ?? []).some((r) => r.kind === 'dome') },
    { cue: 'torpedo tubes aft', check: (s) => tubes(s) >= 1 },
  ]),
  sgb: naval('sgb', [
    { cue: '3-inch gun aft, 40 mm forward', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x < 0) && turrets(s).some((t) => t.calibre === 0.04 && t.x > 0) },
    { cue: 'small funnel', check: (s) => funnels(s) === 1 },
  ]),
  'ab-tei': naval('ab-tei', [
    { cue: '37 mm gun forward, machine gun aft', check: (s) => turrets(s).some((t) => t.calibre === 0.037 && t.x > 0) && turrets(s).some((t) => t.x < 0) },
    { cue: 'small boat, about 17 m', check: (s) => s.length < 18 },
  ]),
  kusentei: naval('kusentei', [
    { cue: '40 mm gun forward', check: (s) => turrets(s).some((t) => t.calibre === 0.04 && t.x > 0) },
    { cue: 'raised forecastle', check: forecastle },
    { cue: 'tripod mast', check: mastKind('tripod') },
    { cue: 'small funnel', check: (s) => funnels(s) === 1 },
  ]),
  sparviero: naval('sparviero', [
    { cue: 'hydrofoils under the hull', check: (s) => (s.bodies ?? []).some((b) => Math.max(...b.top.map((p) => p[1])) < 0) },
    { cue: '76 mm gun forward', check: (s) => turrets(s).some((t) => t.calibre === 0.076 && t.x > 0) },
    { cue: 'missile launchers aft', check: (s) => tubes(s) >= 1 },
  ]),
  'elco-77': naval('elco-77', [
    { cue: 'twin .50 turrets beside the bridge', check: (s) => wings(s, 0.013, 2) === 2 },
    { cue: 'torpedo tubes along the sides', check: (s) => tubes(s) >= 1 },
  ]),
  'huckins-78': naval('huckins-78', [
    { cue: 'twin .50 turrets beside the bridge', check: (s) => wings(s, 0.013, 2) === 2 },
    { cue: 'torpedo tubes along the sides', check: (s) => tubes(s) >= 1 },
    { cue: '20 mm gun aft', check: (s) => turrets(s).some((t) => t.calibre === 0.02 && t.x < 0) },
  ]),
  'bpb-60': naval('bpb-60', [
    { cue: 'twin machine guns on both sides', check: (s) => wings(s, 0.008, 2) === 2 },
    { cue: 'small boat under 19 m', check: (s) => s.length < 19 },
  ]),
  'r-301': naval('r-301', [
    { cue: '37 mm gun forward', check: (s) => turrets(s).some((t) => t.calibre === 0.037 && t.x > 0) },
    { cue: 'quadruple 20 mm aft', check: (s) => turrets(s).some((t) => t.calibre === 0.02 && t.barrels === 4 && t.x < 0) },
    { cue: 'twin 20 mm on the deckhouse', check: (s) => turrets(s).some((t) => t.calibre === 0.02 && t.barrels === 2) },
  ]),
};
