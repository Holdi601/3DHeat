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
};
