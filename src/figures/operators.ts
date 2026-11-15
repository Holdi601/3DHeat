/**
 * Rainbow Six Siege's operators, each as a figure of their own: the
 * close-quarters soldier (`infantry.ts`) with that operator's headgear, face,
 * build, outfit, what they carry on the back, at the hip or on the arm, their
 * own shield where they have one, and an accent colour on the shoulders - so
 * ten players in a round tell apart from above and from three-quarters at the
 * distance a replay is watched from, beside the side colour on the plate
 * carrier.
 *
 * Own simplified designs after the operators' public descriptions and art
 * (what they wear and the device that is their ability), not after any game
 * file or model. A build is light, medium or heavy as the operator is lightly
 * or heavily armoured; the parts are shared, so a figure is the base soldier
 * and a few blocks and tubes more.
 */

import { finish, newKit, PAINT, type Kit, type Template } from './kit';
import { blob, block, ring, tube } from './parts';
import { personInto, type Kitbag, type PersonAnchors, type Stance } from './infantry';
import type { Rgb } from '../race/geometry';

export type Head =
  | 'helmet' | 'visor-helmet' | 'heavy-helmet' | 'cap' | 'cap-back' | 'beanie' | 'beret' | 'boonie' | 'ushanka'
  | 'hood' | 'bandana' | 'headscarf' | 'hair' | 'hair-bun' | 'hair-pony' | 'top-knot' | 'bald' | 'headset' | 'hat' | 'robot';
export type Face = 'goggles' | 'gasmask' | 'shades' | 'trilens' | 'mask' | 'beard' | 'eyepiece' | 'balaclava';
export type Back =
  | 'hammer' | 'charge-box' | 'drone' | 'quad' | 'canisters' | 'tank' | 'tube' | 'crossbow' | 'panel' | 'window' | 'clear-shield'
  | 'bag' | 'jammer' | 'dish' | 'cluster' | 'trap' | 'cross-box' | 'drum' | 'projector' | 'robot-box' | 'medic' | 'cape' | 'ghillie';
export type Hand = 'arm-launcher' | 'wrist' | 'gauntlet' | 'claw' | 'phone' | 'hip' | 'hook' | 'underbarrel' | 'rifle-shield' | 'knife' | 'flash-shield' | 'riot-glow';
export type Build = 'light' | 'medium' | 'heavy';
export type Outfit = 'vest' | 'coat' | 'suit' | 'sneaking';
/** Where the accent goes besides the shoulders. */
export type Pattern = 'shoulders' | 'belt' | 'head' | 'back';

export interface OperatorLook {
  side: 'attack' | 'defense';
  /** Their clothes: jacket and sleeves, trousers, gear (plate carrier, pack, helmet) - after their default public look. */
  wear: [Rgb, Rgb, Rgb];
  build: Build;
  head: Head;
  face?: Face;
  back?: Back;
  hand?: Hand;
  outfit?: Outfit;
  shield?: 'standard' | 'tall' | 'riot';
  /** Hair or a cloth headgear's colour. */
  hair?: Rgb;
  /** Index into `ACCENTS`. */
  accent: number;
  pattern?: Pattern;
}

/** Accent colours, far apart from each other. */
export const ACCENTS: Rgb[] = [
  [0.92, 0.18, 0.18], // red
  [0.98, 0.52, 0.1], // orange
  [0.98, 0.9, 0.15], // yellow
  [0.5, 0.88, 0.15], // lime
  [0.1, 0.62, 0.3], // green
  [0.1, 0.8, 0.8], // teal
  [0.2, 0.45, 1.0], // blue
  [0.42, 0.25, 0.85], // violet
  [0.92, 0.3, 0.75], // magenta
  [0.97, 0.97, 0.97], // white
  [0.08, 0.08, 0.09], // black
  [0.55, 0.36, 0.18], // brown
];

// Clothes.
const BLK: Rgb = [0.1, 0.1, 0.11];
const CHAR: Rgb = [0.22, 0.23, 0.24];
const GRY: Rgb = [0.45, 0.46, 0.48];
const LGRY: Rgb = [0.68, 0.69, 0.7];
const WHT: Rgb = [0.9, 0.9, 0.88];
const SLATE: Rgb = [0.3, 0.36, 0.44];
const NAVY: Rgb = [0.13, 0.18, 0.34];
const BLUE: Rgb = [0.18, 0.35, 0.7];
const LBLUE: Rgb = [0.45, 0.62, 0.85];
const TEAL: Rgb = [0.1, 0.55, 0.55];
const GRN: Rgb = [0.18, 0.4, 0.2];
const OLV: Rgb = [0.36, 0.4, 0.22];
const DOLV: Rgb = [0.22, 0.25, 0.15];
const KHK: Rgb = [0.6, 0.53, 0.36];
const TAN: Rgb = [0.72, 0.6, 0.42];
const SAND: Rgb = [0.82, 0.74, 0.55];
const BRN: Rgb = [0.4, 0.27, 0.15];
const DBRN: Rgb = [0.25, 0.17, 0.1];
const RED: Rgb = [0.7, 0.14, 0.12];
const MAROON: Rgb = [0.42, 0.1, 0.14];
const ORNG: Rgb = [0.9, 0.45, 0.1];
const YEL: Rgb = [0.9, 0.78, 0.15];
const PURP: Rgb = [0.38, 0.2, 0.55];

const BLACK: Rgb = [0.07, 0.07, 0.07];
const BROWN: Rgb = [0.24, 0.16, 0.1];
const BLOND: Rgb = [0.78, 0.62, 0.35];
const GREEN: Rgb = [0.25, 0.65, 0.35];
const OLIVE: Rgb = [0.28, 0.3, 0.22];
const KHAKI: Rgb = [0.55, 0.48, 0.34];
const CLOTH_DARK: Rgb = [0.16, 0.17, 0.18];
const WHITE: Rgb = [0.92, 0.92, 0.9];
const GLOW: Rgb = [0.35, 1.0, 0.45];

const L = (o: Omit<OperatorLook, 'side'>): OperatorLook => ({ side: 'attack', ...o });
const D = (o: Omit<OperatorLook, 'side'>): OperatorLook => ({ side: 'defense', ...o });

/** Every operator by name as the reader writes it, with the weapon classes of their primaries (Ubisoft's loadouts, 2026-11). */
export const OPERATORS: Record<string, { look: OperatorLook; carries: Kitbag[] }> = {
  // Attack.
  Ace: { look: L({ wear: [NAVY, CHAR, ORNG], build: 'medium', head: 'helmet', face: 'goggles', back: 'canisters', accent: 0 }), carries: ['rifle', 'shotgun'] },
  Amaru: { look: L({ wear: [OLV, KHK, BRN], build: 'medium', head: 'hair', hair: BLACK, hand: 'hook', accent: 1, pattern: 'belt' }), carries: ['lmg', 'shotgun'] },
  Ash: { look: L({ wear: [TAN, KHK, BRN], build: 'light', head: 'cap', hair: KHAKI, hand: 'arm-launcher', accent: 2 }), carries: ['rifle'] },
  Blackbeard: { look: L({ wear: [CHAR, KHK, OLV], build: 'medium', head: 'helmet', face: 'beard', hair: BROWN, hand: 'rifle-shield', accent: 3 }), carries: ['rifle', 'dmr'] },
  Blitz: { look: L({ wear: [GRY, CHAR, BLK], build: 'medium', head: 'visor-helmet', shield: 'standard', hand: 'flash-shield', accent: 4 }), carries: ['shield'] },
  Brava: { look: L({ wear: [SLATE, CHAR, ORNG], build: 'light', head: 'helmet', face: 'shades', back: 'drone', accent: 5 }), carries: ['rifle', 'dmr'] },
  Buck: { look: L({ wear: [LGRY, OLV, TAN], build: 'medium', head: 'beanie', hair: CLOTH_DARK, face: 'beard', hand: 'underbarrel', accent: 6 }), carries: ['rifle', 'dmr'] },
  'Capitão': { look: L({ wear: [GRN, KHK, BRN], build: 'light', head: 'boonie', hair: OLIVE, back: 'crossbow', accent: 7 }), carries: ['lmg', 'rifle'] },
  Deimos: { look: L({ wear: [DBRN, BLK, CHAR], build: 'medium', head: 'hat', hair: BLACK, face: 'beard', outfit: 'coat', accent: 0, pattern: 'belt' }), carries: ['rifle', 'shotgun'] },
  Dokkaebi: { look: L({ wear: [WHT, CHAR, GRY], build: 'medium', head: 'headset', hair: BLACK, hand: 'phone', accent: 8 }), carries: ['shotgun', 'dmr'] },
  Finka: { look: L({ wear: [OLV, GRY, WHT], build: 'medium', head: 'hair-pony', hair: BLOND, hand: 'wrist', back: 'medic', accent: 9 }), carries: ['lmg', 'shotgun', 'rifle'] },
  Flores: { look: L({ wear: [BLUE, KHK, RED], build: 'medium', head: 'cap-back', hair: CLOTH_DARK, back: 'robot-box', accent: 10, pattern: 'head' }), carries: ['rifle', 'dmr', 'lmg'] },
  Fuze: { look: L({ wear: [DOLV, OLV, BRN], build: 'heavy', head: 'heavy-helmet', face: 'gasmask', back: 'cluster', accent: 11 }), carries: ['rifle', 'lmg', 'shield'] },
  Glaz: { look: L({ wear: [GRN, DOLV, OLV], build: 'medium', head: 'hood', hair: OLIVE, face: 'balaclava', back: 'ghillie', accent: 1 }), carries: ['dmr'] },
  Gridlock: { look: L({ wear: [TAN, DBRN, ORNG], build: 'heavy', head: 'cap', hair: KHAKI, back: 'drum', accent: 2, pattern: 'belt' }), carries: ['rifle', 'lmg'] },
  Grim: { look: L({ wear: [DOLV, CHAR, TEAL], build: 'light', head: 'beanie', hair: OLIVE, hand: 'arm-launcher', accent: 3, pattern: 'head' }), carries: ['rifle', 'shotgun'] },
  Hibana: { look: L({ wear: [LGRY, BLK, RED], build: 'light', head: 'hair-pony', hair: BLACK, face: 'goggles', hand: 'arm-launcher', accent: 0, pattern: 'back' }), carries: ['shotgun', 'rifle'] },
  Iana: { look: L({ wear: [WHT, NAVY, LGRY], build: 'medium', head: 'visor-helmet', hand: 'wrist', accent: 5, pattern: 'belt' }), carries: ['rifle'] },
  IQ: { look: L({ wear: [CHAR, GRY, WHT], build: 'light', head: 'hair-pony', hair: BLOND, face: 'goggles', hand: 'wrist', accent: 6, pattern: 'belt' }), carries: ['rifle', 'lmg'] },
  Jackal: { look: L({ wear: [SLATE, NAVY, ORNG], build: 'medium', head: 'beanie', hair: BLACK, face: 'eyepiece', accent: 7, pattern: 'belt' }), carries: ['rifle', 'smg', 'shotgun'] },
  Kali: { look: L({ wear: [MAROON, BLK, GRY], build: 'light', head: 'beret', hair: CLOTH_DARK, face: 'shades', hand: 'underbarrel', accent: 8, pattern: 'back' }), carries: ['dmr'] },
  Lion: { look: L({ wear: [NAVY, GRY, WHT], build: 'medium', head: 'helmet', face: 'goggles', back: 'quad', accent: 9, pattern: 'head' }), carries: ['dmr', 'shotgun', 'rifle'] },
  Maverick: { look: L({ wear: [SAND, OLV, BRN], build: 'light', head: 'cap', hair: CLOTH_DARK, face: 'balaclava', back: 'tank', accent: 10 }), carries: ['rifle'] },
  Montagne: { look: L({ wear: [NAVY, BLK, GRY], build: 'heavy', head: 'visor-helmet', shield: 'tall', accent: 11, pattern: 'head' }), carries: ['shield'] },
  'Nøkk': { look: L({ wear: [BLK, BLK, CHAR], build: 'medium', head: 'hood', hair: CLOTH_DARK, face: 'mask', accent: 4 }), carries: ['smg', 'shotgun', 'rifle'] },
  Nomad: { look: L({ wear: [SAND, TAN, BRN], build: 'medium', head: 'headscarf', hair: KHAKI, face: 'goggles', hand: 'underbarrel', accent: 5, pattern: 'back' }), carries: ['rifle'] },
  Osa: { look: L({ wear: [LGRY, CHAR, BLUE], build: 'medium', head: 'hair-bun', hair: BLOND, back: 'clear-shield', accent: 6 }), carries: ['rifle', 'smg'] },
  Ram: { look: L({ wear: [RED, CHAR, ORNG], build: 'heavy', head: 'helmet', back: 'robot-box', accent: 7, pattern: 'belt' }), carries: ['lmg', 'rifle'] },
  Rauora: { look: L({ wear: [GRN, BLK, TAN], build: 'medium', head: 'visor-helmet', back: 'panel', accent: 8, pattern: 'belt' }), carries: ['dmr', 'lmg'] },
  Sens: { look: L({ wear: [WHT, BLK, PURP], build: 'heavy', head: 'robot', back: 'projector', accent: 9 }), carries: ['dmr', 'rifle'] },
  Sledge: { look: L({ wear: [CHAR, DOLV, KHK], build: 'medium', head: 'helmet', face: 'balaclava', back: 'hammer', accent: 10, pattern: 'head' }), carries: ['rifle', 'shotgun'] },
  'Solid Snake': { look: L({ wear: [SLATE, SLATE, BLK], build: 'light', head: 'bandana', hair: BLACK, outfit: 'sneaking', hand: 'wrist', accent: 0 }), carries: ['rifle'] },
  Striker: { look: L({ wear: [KHK, CHAR, YEL], build: 'medium', head: 'helmet', back: 'bag', accent: 1, pattern: 'back' }), carries: ['rifle', 'lmg', 'dmr'] },
  Thatcher: { look: L({ wear: [KHK, OLV, BRN], build: 'medium', head: 'beret', hair: CLOTH_DARK, face: 'beard', hand: 'hip', accent: 2, pattern: 'back' }), carries: ['rifle', 'shotgun'] },
  Thermite: { look: L({ wear: [KHK, NAVY, BRN], build: 'medium', head: 'cap', hair: OLIVE, back: 'charge-box', accent: 3, pattern: 'belt' }), carries: ['rifle', 'shotgun'] },
  Twitch: { look: L({ wear: [LBLUE, TAN, GRY], build: 'medium', head: 'hair-pony', hair: BROWN, face: 'goggles', back: 'drone', accent: 4, pattern: 'head' }), carries: ['rifle', 'dmr', 'shotgun'] },
  Ying: { look: L({ wear: [RED, BLK, CHAR], build: 'medium', head: 'hair-bun', hair: BLACK, hand: 'hip', accent: 5, pattern: 'head' }), carries: ['lmg', 'shotgun'] },
  Zero: { look: L({ wear: [BLK, CHAR, GRN], build: 'medium', head: 'beanie', hair: CLOTH_DARK, face: 'trilens', accent: 6, pattern: 'head' }), carries: ['smg', 'rifle'] },
  Zofia: { look: L({ wear: [GRN, DOLV, BLK], build: 'heavy', head: 'helmet', face: 'goggles', back: 'tube', accent: 8 }), carries: ['lmg', 'rifle'] },
  // Defence.
  Alibi: { look: D({ wear: [LGRY, BLK, GRY], build: 'light', head: 'hair-pony', hair: BLACK, face: 'shades', hand: 'hip', accent: 0 }), carries: ['smg', 'shotgun'] },
  Aruni: { look: D({ wear: [TAN, OLV, ORNG], build: 'light', head: 'hair-bun', hair: BLACK, hand: 'gauntlet', accent: 1 }), carries: ['smg', 'dmr'] },
  Azami: { look: D({ wear: [PURP, PURP, WHT], build: 'medium', head: 'top-knot', hair: BLACK, hand: 'hip', accent: 2, pattern: 'back' }), carries: ['smg', 'shotgun'] },
  Bandit: { look: D({ wear: [BLK, BLUE, CHAR], build: 'light', head: 'bald', hair: BROWN, face: 'shades', back: 'jammer', accent: 3, pattern: 'belt' }), carries: ['smg', 'shotgun'] },
  Castle: { look: D({ wear: [BLUE, KHK, BLK], build: 'heavy', head: 'helmet', back: 'panel', accent: 4 }), carries: ['smg', 'shotgun'] },
  Caveira: { look: D({ wear: [DBRN, GRN, BLK], build: 'light', head: 'bald', hair: BLACK, face: 'mask', hand: 'knife', accent: 5, pattern: 'back' }), carries: ['smg', 'shotgun'] },
  Clash: { look: D({ wear: [BLK, GRY, BLUE], build: 'heavy', head: 'visor-helmet', shield: 'riot', hand: 'riot-glow', accent: 6 }), carries: ['shield'] },
  Denari: { look: D({ wear: [LGRY, LGRY, BLK], build: 'medium', head: 'hair', hair: BLACK, outfit: 'suit', hand: 'wrist', accent: 7 }), carries: ['smg'] },
  Doc: { look: D({ wear: [NAVY, CHAR, WHT], build: 'heavy', head: 'helmet', back: 'medic', accent: 8, pattern: 'head' }), carries: ['smg', 'shotgun'] },
  Echo: { look: D({ wear: [GRY, BLK, TEAL], build: 'heavy', head: 'headset', hair: BLACK, back: 'quad', accent: 9 }), carries: ['smg', 'shotgun'] },
  Ela: { look: D({ wear: [OLV, BLK, GRN], build: 'light', head: 'hair', hair: GREEN, hand: 'hip', accent: 10, pattern: 'back' }), carries: ['smg', 'shotgun'] },
  Fenrir: { look: D({ wear: [CHAR, GRY, BLUE], build: 'medium', head: 'helmet', face: 'mask', hand: 'hip', accent: 11, pattern: 'belt' }), carries: ['smg', 'shotgun'] },
  Frost: { look: D({ wear: [WHT, OLV, BRN], build: 'medium', head: 'beanie', hair: CLOTH_DARK, back: 'trap', accent: 0, pattern: 'head' }), carries: ['shotgun', 'smg'] },
  Goyo: { look: D({ wear: [GRN, TAN, ORNG], build: 'heavy', head: 'helmet', face: 'shades', back: 'tank', accent: 1, pattern: 'belt' }), carries: ['smg', 'shotgun'] },
  'Jäger': { look: D({ wear: [GRN, GRY, BLK], build: 'light', head: 'helmet', face: 'shades', back: 'dish', accent: 2 }), carries: ['shotgun', 'rifle'] },
  Kaid: { look: D({ wear: [BRN, TAN, MAROON], build: 'heavy', head: 'headscarf', hair: WHITE, face: 'beard', hand: 'claw', accent: 3 }), carries: ['smg', 'shotgun'] },
  Kapkan: { look: D({ wear: [DOLV, KHK, BRN], build: 'medium', head: 'ushanka', hair: BROWN, hand: 'hip', accent: 4, pattern: 'belt' }), carries: ['smg', 'shotgun'] },
  Lesion: { look: D({ wear: [BLK, KHK, RED], build: 'medium', head: 'cap', hair: CLOTH_DARK, face: 'mask', hand: 'hip', accent: 5 }), carries: ['shotgun', 'smg'] },
  Maestro: { look: D({ wear: [CHAR, OLV, MAROON], build: 'heavy', head: 'bald', hair: BLACK, face: 'beard', back: 'jammer', accent: 6, pattern: 'back' }), carries: ['lmg', 'shotgun'] },
  Melusi: { look: D({ wear: [SAND, BRN, GRN], build: 'light', head: 'hair-bun', hair: BLACK, back: 'dish', hand: 'hip', accent: 7, pattern: 'head' }), carries: ['smg', 'shotgun'] },
  Mira: { look: D({ wear: [NAVY, BLK, ORNG], build: 'heavy', head: 'hair-bun', hair: BROWN, back: 'window', accent: 8 }), carries: ['smg', 'shotgun'] },
  Mozzie: { look: D({ wear: [KHK, OLV, ORNG], build: 'medium', head: 'cap-back', hair: OLIVE, face: 'goggles', hand: 'arm-launcher', accent: 9 }), carries: ['rifle', 'smg'] },
  Mute: { look: D({ wear: [NAVY, GRY, BLK], build: 'medium', head: 'cap', hair: CLOTH_DARK, face: 'gasmask', back: 'jammer', accent: 10, pattern: 'head' }), carries: ['smg', 'shotgun'] },
  Noor: { look: D({ wear: [MAROON, BLK, TAN], build: 'medium', head: 'headscarf', hair: OLIVE, back: 'tube', accent: 11 }), carries: ['rifle', 'lmg'] },
  Oryx: { look: D({ wear: [DBRN, TAN, CHAR], build: 'medium', head: 'bald', hair: BLACK, face: 'beard', outfit: 'sneaking', accent: 0, pattern: 'belt' }), carries: ['shotgun', 'smg'] },
  Pulse: { look: D({ wear: [TAN, NAVY, BLUE], build: 'light', head: 'cap', hair: KHAKI, face: 'shades', hand: 'wrist', accent: 1, pattern: 'back' }), carries: ['smg', 'shotgun'] },
  Rook: { look: D({ wear: [BLUE, NAVY, BLK], build: 'heavy', head: 'heavy-helmet', back: 'bag', accent: 2, pattern: 'head' }), carries: ['smg', 'shotgun'] },
  Sentry: { look: D({ wear: [GRY, BLK, OLV], build: 'medium', head: 'helmet', face: 'goggles', accent: 3, pattern: 'back' }), carries: ['rifle', 'shotgun'] },
  'Skopós': { look: D({ wear: [WHT, LGRY, TEAL], build: 'medium', head: 'robot', outfit: 'sneaking', accent: 4, pattern: 'belt' }), carries: ['rifle'] },
  Smoke: { look: D({ wear: [DOLV, TAN, YEL], build: 'medium', head: 'beanie', hair: BLACK, face: 'gasmask', back: 'canisters', accent: 5, pattern: 'head' }), carries: ['shotgun', 'smg'] },
  Solis: { look: D({ wear: [LBLUE, CHAR, WHT], build: 'medium', head: 'headset', hair: BROWN, face: 'goggles', accent: 6, pattern: 'belt' }), carries: ['shotgun', 'smg'] },
  Tachanka: { look: D({ wear: [CHAR, DOLV, RED], build: 'heavy', head: 'visor-helmet', back: 'drum', accent: 7, pattern: 'belt' }), carries: ['lmg'] },
  Thorn: { look: D({ wear: [DOLV, CHAR, GRN], build: 'medium', head: 'hood', hair: GREEN, back: 'cape', accent: 8, pattern: 'belt' }), carries: ['smg', 'shotgun'] },
  Thunderbird: { look: D({ wear: [WHT, BRN, RED], build: 'medium', head: 'hair-pony', hair: BLACK, back: 'cross-box', accent: 9, pattern: 'belt' }), carries: ['shotgun', 'rifle'] },
  'Tubarão': { look: D({ wear: [BLUE, GRY, YEL], build: 'medium', head: 'visor-helmet', hand: 'hip', accent: 10, pattern: 'back' }), carries: ['smg', 'rifle'] },
  Valkyrie: { look: D({ wear: [OLV, GRY, TEAL], build: 'light', head: 'hair-pony', hair: BLOND, hand: 'hip', accent: 11, pattern: 'head' }), carries: ['smg', 'shotgun'] },
  Vigil: { look: D({ wear: [BLK, CHAR, WHT], build: 'light', head: 'hood', hair: BLACK, face: 'mask', accent: 0, pattern: 'back' }), carries: ['smg', 'shotgun'] },
  Wamai: { look: D({ wear: [LGRY, KHK, ORNG], build: 'medium', head: 'beanie', hair: KHAKI, back: 'trap', accent: 1, pattern: 'belt' }), carries: ['rifle', 'smg'] },
  Warden: { look: D({ wear: [NAVY, NAVY, LGRY], build: 'medium', head: 'hair', hair: BROWN, face: 'shades', outfit: 'suit', accent: 2 }), carries: ['shotgun', 'smg'] },
  Recruit: { look: D({ wear: [LGRY, NAVY, GRY], build: 'medium', head: 'helmet', accent: 9, pattern: 'belt' }), carries: ['rifle', 'smg', 'shotgun'] },
};

/** An operator's figure-name part: letters and digits, accents dropped ("Capitão" -> "capitao", "Solid Snake" -> "solid-snake"). */
export function operatorSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/gi, 'o')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const BY_SLUG = new Map(Object.entries(OPERATORS).map(([n, o]) => [operatorSlug(n), { name: n, ...o }]));

/** The operator of a name in data (case and accents ignored), or null. */
export function operatorOf(name: string): { name: string; look: OperatorLook; carries: Kitbag[] } | null {
  return BY_SLUG.get(operatorSlug(name)) ?? null;
}

/** An operator figure's name: `op-<slug>-<weapon>[-crouch|-prone]-<attack|defense>`. */
export function operatorFigureName(slug: string, carry: Kitbag, stance: Stance, side: 'attack' | 'defense'): string {
  return `op-${slug}-${carry}${stance === 'stand' ? '' : `-${stance}`}-${side}`;
}

const BUILD_BULK: Record<Build, number> = { light: 0.84, medium: 1, heavy: 1.28 };

/** Builds an operator's figure. */
export function buildOperator(look: OperatorLook, carry: Kitbag, stance: Stance, band: Rgb, groundRing = true): Template {
  const k = newKit();
  const shieldCarry = carry === 'shield';
  const a = personInto(k, {
    carry,
    stance,
    vest: look.outfit !== 'suit' && look.outfit !== 'sneaking',
    band,
    helmet: false,
    pack: false,
    bulk: BUILD_BULK[look.build],
    shield: shieldCarry ? (look.shield ?? 'standard') : undefined,
    outfit: { top: look.wear[0], bottom: look.wear[1], gear: look.wear[2] },
  });
  const accent = ACCENTS[look.accent % ACCENTS.length];
  build(k, a, look, accent, carry);
  // The side, apart from the clothes: a ring on the ground in its colour with the team's colour inside it, and a band round the head.
  if (groundRing) {
    ring(k.fixed, k.fr, 0, 0, 0.015, 0.55 * a.s, band, 1, 28, 0.45 * a.s);
    ring(k.team, k.fr, 0, 0, 0.012, 0.45 * a.s, [0.95, 0.95, 0.95], 1, 28, 0.39 * a.s);
  }
  const [hx, hy, hz] = a.head;
  ring(k.fixed, k.fr, hx, hy, hz + (a.prone ? 0.02 : 0.05) * a.s, 0.155 * a.s, band, 1, 16, 0.1 * a.s);
  return finish(k, 'ground');
}

type V3 = [number, number, number];

function build(k: Kit, a: PersonAnchors, look: OperatorLook, accent: Rgb, carry: Kitbag): void {
  const F = k.fixed;
  const fr = k.fr;
  const s = a.s;
  const b = a.bulk;
  const [hx, hy, hz] = a.head;
  const h = (f: number, side: number, up: number): V3 => [hx + f * s, hy + side * s, hz + up * s];
  const hairCol = look.hair ?? BROWN;
  const accentHead = look.pattern === 'head';
  const capCol = accentHead ? accent : hairCol;

  // Headgear.
  switch (look.head) {
    case 'helmet':
      blob(F, fr, h(-0.03, 0, 0.06), [0.16 * s, 0.15 * s, 0.1 * s], look.wear[2]);
      if (accentHead) block(F, fr, h(-0.03, 0, 0.14), 0.22 * s, 0.05 * s, 0.03 * s, accent);
      break;
    case 'visor-helmet':
      blob(F, fr, h(-0.03, 0, 0.06), [0.16 * s, 0.15 * s, 0.1 * s], look.wear[2]);
      block(F, fr, h(0.1, 0, -0.01), 0.03 * s, 0.2 * s, 0.17 * s, PAINT.glass);
      if (accentHead) block(F, fr, h(-0.03, 0, 0.14), 0.22 * s, 0.05 * s, 0.03 * s, accent);
      break;
    case 'heavy-helmet':
      blob(F, fr, h(-0.02, 0, 0.05), [0.19 * s, 0.18 * s, 0.13 * s], look.wear[2]);
      block(F, fr, h(-0.13, 0, -0.06), 0.07 * s, 0.3 * s, 0.14 * s, look.wear[2]);
      block(F, fr, h(0.12, 0, 0), 0.03 * s, 0.22 * s, 0.1 * s, PAINT.glass);
      if (accentHead) block(F, fr, h(-0.02, 0, 0.17), 0.26 * s, 0.06 * s, 0.03 * s, accent);
      break;
    case 'cap':
    case 'cap-back': {
      blob(F, fr, h(-0.01, 0, 0.07), [0.12 * s, 0.115 * s, 0.065 * s], capCol);
      const fwd = look.head === 'cap' ? 1 : -1;
      block(F, fr, h(0.15 * fwd, 0, 0.06), 0.16 * s, 0.2 * s, 0.02 * s, capCol);
      break;
    }
    case 'beanie':
      blob(F, fr, h(-0.01, 0, 0.08), [0.118 * s, 0.112 * s, 0.11 * s], capCol);
      break;
    case 'beret':
      blob(F, fr, h(-0.01, 0.03, 0.11), [0.14 * s, 0.13 * s, 0.035 * s], capCol);
      break;
    case 'boonie':
      blob(F, fr, h(-0.01, 0, 0.08), [0.11 * s, 0.11 * s, 0.07 * s], capCol);
      tube(F, fr, h(-0.01, 0, 0.055), h(-0.01, 0, 0.075), 0.27 * s, 0.25 * s, capCol, 12);
      break;
    case 'ushanka':
      blob(F, fr, h(-0.01, 0, 0.09), [0.18 * s, 0.18 * s, 0.13 * s], capCol);
      for (const o of [-1, 1]) block(F, fr, h(-0.01, o * 0.15, -0.03), 0.14 * s, 0.05 * s, 0.15 * s, capCol);
      break;
    case 'hood':
      // A hood: over the head, down the neck and onto the shoulders.
      blob(F, fr, h(-0.03, 0, 0.03), [0.17 * s, 0.16 * s, 0.17 * s], capCol);
      block(F, fr, h(-0.12, 0, -0.16), 0.12 * s, 0.4 * s, 0.18 * s, capCol);
      break;
    case 'bandana':
      blob(F, fr, h(-0.01, 0, 0.04), [0.113 * s, 0.103 * s, 0.09 * s], BLACK);
      block(F, fr, h(-0.01, 0, 0.05), 0.24 * s, 0.22 * s, 0.035 * s, accentHead ? accent : [0.1, 0.12, 0.35]);
      for (const o of [-0.03, 0.03]) tube(F, fr, h(-0.12, o, 0.05), h(-0.3, o * 3, -0.12), 0.015 * s, 0.01 * s, accentHead ? accent : [0.1, 0.12, 0.35], 4);
      break;
    case 'headscarf':
      blob(F, fr, h(-0.02, 0, 0.02), [0.135 * s, 0.125 * s, 0.14 * s], capCol);
      block(F, fr, h(-0.02, 0, -0.14), 0.2 * s, 0.24 * s, 0.08 * s, capCol);
      break;
    case 'hair':
    case 'hair-bun':
    case 'hair-pony':
    case 'top-knot':
      blob(F, fr, h(-0.02, 0, 0.04), [0.115 * s, 0.107 * s, 0.1 * s], hairCol);
      if (look.head === 'hair-bun') blob(F, fr, h(-0.11, 0, 0.06), [0.05 * s, 0.05 * s, 0.05 * s], hairCol);
      if (look.head === 'top-knot') blob(F, fr, h(-0.03, 0, 0.16), [0.045 * s, 0.045 * s, 0.06 * s], hairCol);
      if (look.head === 'hair-pony') tube(F, fr, h(-0.1, 0, 0.06), h(-0.2, 0, -0.16), 0.035 * s, 0.02 * s, hairCol, 6);
      if (accentHead) block(F, fr, h(0.02, 0, 0.08), 0.18 * s, 0.22 * s, 0.03 * s, accent);
      break;
    case 'bald':
      blob(F, fr, h(-0.02, 0, 0.02), [0.112 * s, 0.103 * s, 0.11 * s], PAINT.skin);
      if (accentHead) block(F, fr, h(-0.02, 0, 0.1), 0.18 * s, 0.05 * s, 0.03 * s, accent);
      break;
    case 'headset':
      blob(F, fr, h(-0.02, 0, 0.04), [0.115 * s, 0.107 * s, 0.1 * s], hairCol);
      for (const o of [-1, 1]) block(F, fr, h(0, o * 0.115, 0), 0.08 * s, 0.04 * s, 0.09 * s, accentHead ? accent : PAINT.dark);
      tube(F, fr, h(0, -0.11, 0.05), h(0, 0.11, 0.05), 0.012 * s, 0.012 * s, PAINT.dark, 4);
      tube(F, fr, h(0, 0.12, -0.02), h(0.11, 0.06, -0.07), 0.008 * s, 0.008 * s, PAINT.dark, 4);
      break;
    case 'hat':
      block(F, fr, h(-0.01, 0, 0.11), 0.2 * s, 0.19 * s, 0.1 * s, capCol);
      tube(F, fr, h(-0.01, 0, 0.06), h(-0.01, 0, 0.08), 0.25 * s, 0.25 * s, capCol, 12);
      break;
    case 'robot':
      block(F, fr, h(0, 0, 0.01), 0.24 * s, 0.22 * s, 0.26 * s, look.wear[0]);
      block(F, fr, h(0.11, 0, 0.03), 0.02 * s, 0.17 * s, 0.04 * s, accent);
      break;
  }

  // Face.
  switch (look.face) {
    case 'goggles':
      block(F, fr, h(0.1, 0, 0.03), 0.04 * s, 0.2 * s, 0.06 * s, PAINT.glass);
      break;
    case 'gasmask':
      blob(F, fr, h(0.09, 0, -0.04), [0.06 * s, 0.085 * s, 0.075 * s], PAINT.dark);
      tube(F, fr, h(0.12, 0, -0.07), h(0.18, 0, -0.1), 0.035 * s, 0.035 * s, PAINT.metal, 8);
      break;
    case 'shades':
      block(F, fr, h(0.105, 0, 0.025), 0.02 * s, 0.17 * s, 0.035 * s, BLACK);
      break;
    case 'trilens':
      // Three lenses on a stalk before the eyes.
      for (const [o, u] of [[-0.04, 0.03], [0.04, 0.03], [0, 0.07]] as const) tube(F, fr, h(0.09, o, u), h(0.17, o, u), 0.02 * s, 0.018 * s, GLOW, 6);
      break;
    case 'mask':
      blob(F, fr, h(0.05, 0, -0.01), [0.075 * s, 0.105 * s, 0.12 * s], look.head === 'hood' && look.hair === BLACK ? WHITE : BLACK);
      break;
    case 'beard':
      blob(F, fr, h(0.06, 0, -0.08), [0.06 * s, 0.09 * s, 0.07 * s], look.hair ?? BROWN);
      break;
    case 'eyepiece':
      tube(F, fr, h(0.09, 0.04, 0.03), h(0.18, 0.04, 0.03), 0.025 * s, 0.02 * s, PAINT.metal, 6);
      blob(F, fr, h(0.185, 0.04, 0.03), [0.012 * s, 0.012 * s, 0.012 * s], GLOW);
      break;
    case 'balaclava':
      blob(F, fr, h(0.01, 0, -0.01), [0.113 * s, 0.103 * s, 0.123 * s], BLACK);
      break;
  }

  // Outfit and shoulders.
  // Shoulder pads in the accent: what shows from straight above besides the head and the back.
  const pad = look.build === 'heavy' ? [0.26, 0.22, 0.12] : look.build === 'light' ? [0.13, 0.13, 0.05] : [0.17, 0.16, 0.07];
  if (!a.prone) {
    const sh = a.shoulder;
    for (const o of [-1, 1]) block(F, fr, [0, o * 0.24 * b * s, sh + pad[2] / 2 * s + 0.02 * s], pad[0] * s, pad[1] * s, pad[2] * s, accent);
    if (look.build === 'heavy') {
      // Heavy armour: a groin plate and a raised collar.
      block(F, fr, [0.12 * b * s, 0, a.hip - 0.08 * s], 0.06 * s, 0.3 * s, 0.2 * s, look.wear[2]);
      block(F, fr, [0, 0, a.chest - 0.02 * s], 0.3 * b * s, 0.4 * b * s, 0.08 * s, look.wear[2]);
    }
    // A long coat to the knees.
    if (look.outfit === 'coat') block(F, fr, [-0.04 * s, 0, a.hip - 0.22 * s], 0.34 * b * s, 0.54 * b * s, 0.66 * s, look.wear[0]);
    if (look.outfit === 'suit') {
      block(F, fr, [0.135 * b * s, 0, a.chest - 0.2 * s], 0.01 * s, 0.05 * s, 0.32 * s, BLACK);
      block(F, fr, [0.137 * b * s, 0, a.chest - 0.1 * s], 0.01 * s, 0.03 * s, 0.12 * s, accent);
    }
    if (look.pattern === 'belt') block(F, fr, [0, 0, a.hip + 0.02 * s], 0.28 * b * s, 0.46 * b * s, 0.06 * s, accent);
    if (look.pattern === 'back') block(F, fr, [-0.135 * b * s, 0, a.hip + 0.3 * s], 0.02 * s, 0.1 * s, 0.5 * s, accent);
  } else {
    for (const o of [-1, 1]) block(F, fr, [0.45 * s, o * 0.2 * b * s, 0.29 * s], pad[1] * s, pad[0] * s, pad[2] * s, accent);
    if (look.pattern === 'belt') block(F, fr, [-0.12 * s, 0, 0.16 * s], 0.06 * s, 0.44 * b * s, 0.26 * s, accent);
  }

  // What they carry on the back: standing up behind them, or lying on their back when prone.
  if (look.back) {
    const col = look.pattern === 'back' ? accent : backColour(look.back, look.wear[2]);
    if (a.prone) block(F, fr, [0.15 * s, 0, 0.36 * s], 0.42 * s, 0.3 * s, 0.1 * s, col);
    else backItem(k, a, look.back, col, accent);
  }

  // At the hip, on the arm, in the hand.
  if (look.hand && !a.prone) handItem(k, a, look.hand, accent, carry);
}

function backColour(back: Back, gear: Rgb): Rgb {
  switch (back) {
    case 'cape':
      return [0.3, 0.33, 0.24];
    case 'ghillie':
      return [0.34, 0.4, 0.2];
    case 'clear-shield':
      return [0.6, 0.75, 0.85];
    case 'medic':
      return WHITE;
    case 'charge-box':
    case 'cluster':
      return [0.45, 0.42, 0.28];
    default:
      return gear;
  }
}

function backItem(k: Kit, a: PersonAnchors, back: Back, col: Rgb, accent: Rgb): void {
  const F = k.fixed;
  const fr = k.fr;
  // A third larger than life: what tells an operator from above has to show at replay distance.
  const s = a.s * 1.35;
  const bx = -0.15 * a.bulk * s;
  const mid = a.hip + 0.32 * s;
  const p = (f: number, side: number, up: number): V3 => [bx + f * s, side * s, mid + up * s];
  switch (back) {
    case 'hammer':
      tube(F, fr, p(-0.04, -0.18, -0.35), p(-0.04, 0.2, 0.45), 0.025 * s, 0.025 * s, [0.35, 0.25, 0.15], 6);
      block(F, fr, p(-0.04, 0.2, 0.47), 0.1 * s, 0.24 * s, 0.1 * s, PAINT.metal);
      break;
    case 'charge-box':
      block(F, fr, p(-0.08, 0, 0), 0.16 * s, 0.36 * s, 0.42 * s, col);
      block(F, fr, p(-0.17, 0, 0.1), 0.02 * s, 0.12 * s, 0.08 * s, accent);
      break;
    case 'drone':
      block(F, fr, p(-0.07, 0, 0), 0.14 * s, 0.3 * s, 0.36 * s, col);
      for (const o of [-1, 1]) tube(F, fr, p(-0.1, o * 0.13, 0.25), p(-0.1, o * 0.17, 0.25), 0.065 * s, 0.065 * s, PAINT.tyre, 10);
      break;
    case 'quad':
      block(F, fr, p(-0.06, 0, 0), 0.12 * s, 0.26 * s, 0.32 * s, col);
      for (const [o, u] of [[-1, 1], [1, 1], [-1, -1], [1, -1]] as const) tube(F, fr, p(-0.14, o * 0.17, 0.12 + u * 0.12), p(-0.13, o * 0.17, 0.12 + u * 0.12), 0.08 * s, 0.08 * s, PAINT.dark, 10);
      break;
    case 'canisters':
      for (const o of [-0.11, 0, 0.11]) tube(F, fr, p(-0.07, o, -0.2), p(-0.07, o, 0.22), 0.05 * s, 0.05 * s, col, 8);
      break;
    case 'tank':
      tube(F, fr, p(-0.09, 0, -0.25), p(-0.09, 0, 0.3), 0.09 * s, 0.09 * s, col, 10);
      tube(F, fr, p(-0.09, 0, 0.3), p(-0.09, 0, 0.36), 0.03 * s, 0.03 * s, accent, 6);
      break;
    case 'tube':
      tube(F, fr, p(-0.06, -0.22, -0.4), p(-0.06, 0.22, 0.55), 0.065 * s, 0.065 * s, col, 10);
      break;
    case 'crossbow':
      tube(F, fr, p(-0.05, 0, -0.3), p(-0.05, 0, 0.35), 0.025 * s, 0.025 * s, [0.35, 0.25, 0.15], 6);
      tube(F, fr, p(-0.05, -0.3, 0.2), p(-0.05, 0.3, 0.2), 0.02 * s, 0.02 * s, PAINT.dark, 6);
      break;
    case 'panel':
    case 'window':
      block(F, fr, p(-0.04, 0, 0.05), 0.05 * s, 0.5 * s, 0.62 * s, col);
      if (back === 'window') block(F, fr, p(-0.07, 0, 0.08), 0.01 * s, 0.36 * s, 0.26 * s, PAINT.glass);
      else for (const u of [-0.15, 0.05, 0.25]) block(F, fr, p(-0.07, 0, u), 0.01 * s, 0.46 * s, 0.04 * s, accent);
      break;
    case 'clear-shield':
      block(F, fr, p(-0.04, 0, 0.12), 0.04 * s, 0.6 * s, 0.9 * s, col, 0.55);
      break;
    case 'bag':
      tube(F, fr, p(-0.1, -0.25, 0.1), p(-0.1, 0.25, 0.1), 0.12 * s, 0.12 * s, col, 10);
      break;
    case 'jammer':
      block(F, fr, p(-0.07, 0, 0), 0.14 * s, 0.28 * s, 0.3 * s, col);
      tube(F, fr, p(-0.08, 0.1, 0.15), p(-0.08, 0.1, 0.5), 0.008 * s, 0.006 * s, PAINT.dark, 4);
      tube(F, fr, p(-0.08, -0.1, 0.15), p(-0.08, -0.1, 0.4), 0.008 * s, 0.006 * s, PAINT.dark, 4);
      break;
    case 'dish':
      block(F, fr, p(-0.06, 0, 0), 0.12 * s, 0.26 * s, 0.3 * s, col);
      tube(F, fr, p(-0.08, 0, 0.18), p(-0.08, 0, 0.32), 0.015 * s, 0.015 * s, PAINT.dark, 4);
      tube(F, fr, p(-0.08, 0, 0.32), p(-0.12, 0, 0.36), 0.12 * s, 0.02 * s, PAINT.metal, 10);
      break;
    case 'cluster':
      block(F, fr, p(-0.1, 0, 0), 0.2 * s, 0.42 * s, 0.46 * s, col);
      for (const o of [-0.12, 0, 0.12]) for (const u of [-0.1, 0.1]) tube(F, fr, p(-0.2, o, u), p(-0.24, o, u), 0.04 * s, 0.04 * s, accent, 6);
      break;
    case 'trap':
      tube(F, fr, p(-0.05, 0, 0.05), p(-0.12, 0, 0.05), 0.2 * s, 0.2 * s, col, 12);
      break;
    case 'cross-box':
      block(F, fr, p(-0.08, 0, 0), 0.16 * s, 0.34 * s, 0.38 * s, col);
      block(F, fr, p(-0.165, 0, 0), 0.01 * s, 0.2 * s, 0.06 * s, accent);
      block(F, fr, p(-0.165, 0, 0), 0.01 * s, 0.06 * s, 0.2 * s, accent);
      break;
    case 'drum':
      tube(F, fr, p(-0.12, 0, -0.15), p(-0.12, 0, 0.2), 0.17 * s, 0.17 * s, col, 12);
      break;
    case 'projector':
      tube(F, fr, p(-0.1, -0.22, 0.05), p(-0.1, 0.22, 0.05), 0.1 * s, 0.1 * s, col, 10);
      for (const o of [-1, 1]) tube(F, fr, p(-0.1, o * 0.22, 0.05), p(-0.1, o * 0.24, 0.05), 0.11 * s, 0.11 * s, accent, 10);
      break;
    case 'robot-box':
      block(F, fr, p(-0.1, 0, 0), 0.2 * s, 0.34 * s, 0.28 * s, col);
      for (const o of [-1, 1]) block(F, fr, p(-0.1, o * 0.19, -0.1), 0.24 * s, 0.05 * s, 0.1 * s, PAINT.track);
      break;
    case 'medic':
      block(F, fr, p(-0.07, 0, 0), 0.14 * s, 0.32 * s, 0.36 * s, col);
      block(F, fr, p(-0.145, 0, 0), 0.01 * s, 0.2 * s, 0.06 * s, [0.9, 0.15, 0.15]);
      block(F, fr, p(-0.145, 0, 0), 0.01 * s, 0.06 * s, 0.2 * s, [0.9, 0.15, 0.15]);
      break;
    case 'cape':
      block(F, fr, p(-0.02, 0, -0.25), 0.05 * s, 0.5 * a.bulk * s, 0.9 * s, col);
      break;
    case 'ghillie':
      // Shaggy tufts over the shoulders and down the back.
      for (const [f, o, u, r] of [[0, -0.15, 0.25, 0.16], [0, 0.15, 0.25, 0.16], [0.05, 0, 0.32, 0.15], [-0.02, -0.12, -0.05, 0.17], [-0.02, 0.12, -0.05, 0.17], [-0.02, 0, -0.35, 0.16]] as const)
        blob(F, fr, p(f, o, u), [0.1 * s, r * s, r * s], col);
      break;
  }
}

function handItem(k: Kit, a: PersonAnchors, hand: Hand, accent: Rgb, carry: Kitbag): void {
  const F = k.fixed;
  const fr = k.fr;
  const s = a.s;
  const b = a.bulk;
  const sh = a.shoulder;
  const [hx, , hz] = a.hands;
  switch (hand) {
    case 'arm-launcher':
      // On the left forearm, pointing forward.
      tube(F, fr, [0.05 * s, -0.22 * b * s, sh - 0.1 * s], [0.48 * s, -0.14 * s, sh - 0.16 * s], 0.07 * s, 0.06 * s, PAINT.dark, 8);
      blob(F, fr, [0.2 * s, -0.19 * b * s, sh - 0.11 * s], [0.04 * s, 0.04 * s, 0.04 * s], accent);
      break;
    case 'wrist':
      block(F, fr, [0.3 * s, -0.12 * b * s, sh - 0.15 * s], 0.1 * s, 0.07 * s, 0.05 * s, PAINT.dark);
      block(F, fr, [0.3 * s, -0.12 * b * s, sh - 0.12 * s], 0.08 * s, 0.06 * s, 0.01 * s, GLOW);
      break;
    case 'gauntlet':
      // A metal arm, its lights in the accent.
      tube(F, fr, [0, -0.25 * b * s, sh], [hx, -0.02 * s, hz], 0.065 * s, 0.06 * s, PAINT.metal, 8);
      blob(F, fr, [0.22 * s, -0.14 * s, sh - 0.1 * s], [0.04 * s, 0.04 * s, 0.04 * s], accent);
      break;
    case 'claw':
      block(F, fr, [0.05 * s, 0.24 * b * s, a.hip - 0.02 * s], 0.12 * s, 0.07 * s, 0.14 * s, PAINT.dark);
      for (const o of [-0.03, 0.03]) tube(F, fr, [0.11 * s, (0.24 * b + o) * s, a.hip - 0.06 * s], [0.18 * s, (0.24 * b + o) * s, a.hip - 0.12 * s], 0.01 * s, 0.006 * s, accent, 4);
      break;
    case 'phone':
      block(F, fr, [0.32 * s, -0.16 * s, sh + 0.02 * s], 0.02 * s, 0.08 * s, 0.14 * s, PAINT.dark);
      block(F, fr, [0.335 * s, -0.16 * s, sh + 0.02 * s], 0.005 * s, 0.07 * s, 0.12 * s, accent);
      break;
    case 'hip':
      for (const o of [-1, 1]) block(F, fr, [0.04 * s, o * 0.25 * b * s, a.hip + 0.02 * s], 0.12 * s, 0.07 * s, 0.12 * s, o < 0 ? accent : PAINT.dark);
      break;
    case 'hook':
      block(F, fr, [0.02 * s, 0.26 * b * s, a.hip + 0.04 * s], 0.14 * s, 0.08 * s, 0.1 * s, PAINT.dark);
      tube(F, fr, [0.09 * s, 0.26 * b * s, a.hip + 0.04 * s], [0.16 * s, 0.26 * b * s, a.hip - 0.04 * s], 0.012 * s, 0.012 * s, accent, 4);
      break;
    case 'underbarrel':
      tube(F, fr, [0.45 * s, 0.05 * s, sh - 0.27 * s], [0.85 * s, 0.04 * s, sh - 0.27 * s], 0.03 * s, 0.03 * s, accent, 6);
      break;
    case 'rifle-shield':
      // A small armoured plate on the rifle.
      if (carry !== 'shield') block(F, fr, [0.58 * s, 0.05 * s, sh - 0.12 * s], 0.03 * s, 0.32 * s, 0.24 * s, [0.3, 0.32, 0.34]);
      break;
    case 'knife':
      tube(F, fr, [0.05 * s, 0.25 * b * s, a.hip + 0.05 * s], [0.12 * s, 0.26 * b * s, a.hip - 0.12 * s], 0.012 * s, 0.004 * s, PAINT.metal, 4);
      break;
    case 'flash-shield':
      // Lights across the shield's face.
      for (const o of [-0.2, -0.1, 0, 0.1, 0.2]) blob(F, fr, [0.46 * s, (o - 0.04) * s, a.chest - 0.22 * s], [0.025 * s, 0.025 * s, 0.025 * s], accent);
      break;
    case 'riot-glow':
      // The riot shield's electrified face.
      for (const u of [0.35, 0.65, 0.95]) block(F, fr, [0.455 * s, -0.04 * s, u * s], 0.01 * s, 0.6 * s, 0.03 * s, accent);
      break;
  }
}
