/**
 * Which car stands in for a lap's car.
 *
 * Worked out each time from what is loaded and never stored, so a car with no
 * counterpart today gets its own as soon as a newer car file has it. In order:
 *
 * 1. the same game's same car number: that very car;
 * 2. the same make and a word of the model: that model, nearest in years;
 * 3. the same make: its car nearest in years, of the same kind of body, if the
 *    viewer knows no closer car of its own (step 5);
 * 4. any make: the same kind of body, nearest in years;
 * 5. no car file, or nothing that near in it, and the viewer knows this very car
 *    (`carSpecs.ts`): its own body at that car's size;
 * 6. otherwise the viewer's own body of that kind and era.
 *
 * An open-wheel car is none of these: the scene's own single-seater is nearer to
 * it than any road car, and it keeps that.
 */

import { bodyModel, eraOf, type BodyEra, type BodyKind } from './carBodies';
import type { CarModel } from './carModel';
import { packCarModel, type CarPack, type PackCar } from './carPack';
import { findSpec, type CarSpec } from './carSpecs';
import type { CarInfo, LapTrace } from './lap';

export type CarMatchKind = 'exact' | 'sameModel' | 'sameMake' | 'similar' | 'plain' | 'openWheel';

export interface CarMatch {
  kind: CarMatchKind;
  /** The viewer's own body that fits: drawn when there is no car file. */
  body: BodyKind;
  era: BodyEra;
  pack?: CarPack;
  car?: PackCar;
  /** The real car the viewer knows by its size, drawn when no file's car is as near. */
  spec?: CarSpec;
}

const OPEN_WHEEL = /\b(formula(?! drift)|f[1-4]\b|fr2\.0|indy|dallara|skip barber|single.?seater|open.?wheel)/i;

/** Words that say what kind of car a name is, the most telling first. */
const KIND_WORDS: [BodyKind, RegExp][] = [
  ['pickup', /\b(pickup|pick-up|truck|ute|f-?150|f-?250|f-?450|raptor|hilux|tacoma|tundra|silverado|ram|gladiator|syclone|maloo|colorado)\b/i],
  ['van', /\b(van|bus|transporter|microbus|id\.? ?buzz|acty|hiace|sprinter)\b/i],
  ['suv', /\b(suv|4x4|4wd|wrangler|defender|bronco|land cruiser|g.?class|g63|x5|x6|cayenne|urus|macan|unimog|baja|trophy|range rover|4runner|pajero|patrol|jimmy|bentayga|dbx|purosangue|trackhawk|trailcat)\b/i],
  ['micro', /\b(p50|isetta|trident|kei|cappuccino|beat|2cv|figaro|acty|ami|500)\b/i],
  ['supercar', /\b(gt[1-4]|lmp\d?|lmdh|gte|hypercar|supercar|prototype|f40|f50|f1 lm|le mans|countach|diablo|aventador|huracan|veyron|chiron|senna|p1|laferrari|enzo|zonda|huayra|valkyrie|mclaren|koenigsegg|pagani|bugatti|lamborghini|ferrari)\b/i],
  ['muscle', /\b(mustang|camaro|challenger|charger|firebird|trans am|gto|barracuda|chevelle|nova|cuda|monaro)\b/i],
  ['estate', /\b(estate|wagon|avant|touring|combi|kombi|sportwagon|shooting brake|variant)\b/i],
  ['hatch', /\b(hatch|hot hatch|golf|polo|civic|focus|fiesta|clio|megane|yaris|mini|cooper|205|206|207|puma|lupo|corsa|i30|swift|impreza hatch)\b/i],
  ['sports', /\b(roadster|spider|spyder|miata|mx-?5|boxster|cayman|911|z3|z4|s2000|brz|gt86|86|nsx|supra|rx-?7|elise|exige|4c|tt|sl|corvette|viper|m1|gt-?r|skyline|silvia|240z|350z|370z)\b/i],
  ['coupe', /\b(coup[e\u00e9]|m2|m4|m6|850|rc|cl|gran turismo|db[0-9]|vantage|continental)\b/i],
];

/** The kind of body a name speaks of, or what its class letter makes likely. */
export function kindOf(car: CarInfo): BodyKind {
  const name = car.name ?? '';
  for (const [kind, words] of KIND_WORDS) if (words.test(name)) return kind;
  if (!name && car.class && /^(S2|X|R)$/i.test(car.class)) return 'supercar';
  return 'saloon';
}

/** Off-road and van bodies stand tall, the fast ones low: what a shell's height can tell. */
type Stance = 'tall' | 'low' | 'middle';

function stanceOf(kind: BodyKind): Stance {
  if (kind === 'suv' || kind === 'pickup' || kind === 'van') return 'tall';
  return kind === 'supercar' || kind === 'sports' ? 'low' : 'middle';
}

/** A file's car's stance, by its height over the road. */
function shapeOf(car: PackCar): Stance {
  if (car.height > 1.6) return 'tall';
  return car.height < 1.24 ? 'low' : 'middle';
}

/** Other spellings of a make, in lower case, by the name the file uses. */
const ALIASES: Record<string, string[]> = {
  volkswagen: ['vw'],
  mercedes: ['mercedes-benz', 'mercedes-amg', 'amg', 'merc', 'benz'],
  chevrolet: ['chevy'],
  'alfa romeo': ['alfa'],
  'aston martin': ['aston'],
  'land rover': ['range rover'],
  citroen: ['citroën'],
};

function hasWord(text: string, word: string): boolean {
  const at = text.indexOf(word);
  if (at < 0) return false;
  const before = at === 0 ? ' ' : text[at - 1];
  const after = at + word.length >= text.length ? ' ' : text[at + word.length];
  return !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
}

function makeIn(name: string, makes: Set<string>): string | null {
  const low = name.toLowerCase();
  for (const make of makes) {
    const lower = make.toLowerCase();
    if (hasWord(low, lower) || (ALIASES[lower] ?? []).some((a) => hasWord(low, a))) return make;
  }
  return null;
}

/** The year in a name: `'97` or `1997`. */
export function yearIn(name: string): number | null {
  const full = /\b(19[0-9]{2}|20[0-9]{2})\b/.exec(name);
  if (full) return Number(full[1]);
  const short = /['’`]([0-9]{2})\b/.exec(name);
  if (!short) return null;
  const two = Number(short[1]);
  return two <= 30 ? 2000 + two : 1900 + two;
}

/** Words many models share: finding one in a model's tag does not make it that model. */
const NOT_A_MODEL = new Set(['turbo', 'gt', 'gti', 'rs', 'sport', 'sports', 'coupe', 'coup\u00e9', 'sedan', 'saloon', 'hatch', 'wagon', 'estate', 'convertible', 'cabrio', 'spider', 'spyder', 'super', 'race', 'racing', 'evo', 'type', 'edition', 'plus', 'rally', 'drift', 'the']);

/** What a lap's name says of its model: the words that are not the make or the year. */
function modelWords(name: string, make: string | null): string[] {
  let rest = name.toLowerCase();
  if (make) {
    for (const m of [make.toLowerCase(), ...(ALIASES[make.toLowerCase()] ?? [])]) rest = rest.replace(m, ' ');
  }
  rest = rest.replace(/['’`][0-9]{2}\b/g, ' ').replace(/\b(19|20)[0-9]{2}\b/g, ' ');
  return rest.split(/[^a-z0-9]+/).filter((w) => w.length >= 2 && !NOT_A_MODEL.has(w));
}

/** The year class letters most often mean, for a car with no name to go by. */
const CLASS_YEAR: Record<string, number> = { D: 1972, C: 1988, B: 2000, A: 2010, S1: 2018, S2: 2021, R: 2021, X: 2023 };

export function matchCar(car: CarInfo, game: string, packs: CarPack[]): CarMatch {
  const body = kindOf(car);
  const name = car.name ?? '';
  const year = yearIn(name) ?? (car.class ? CLASS_YEAR[car.class.toUpperCase()] : undefined) ?? null;
  const spec = name ? findSpec(name, year) : null;
  // A road car called "F1" is not an open-wheeler: a car the viewer knows goes by what it knows.
  const openWheel = OPEN_WHEEL.test(name) && !spec;
  const own = spec
    ? { body: spec.kind, era: eraOf(year ?? spec.from), spec }
    : { body: body, era: eraOf(year) };
  if (car.ordinal !== undefined) {
    for (const pack of packs) {
      if (pack.game !== game) continue;
      const same = pack.cars.find((c) => c.ordinals.includes(car.ordinal!));
      if (same) return { kind: 'exact', ...own, pack, car: same };
    }
  }
  if (openWheel) return { kind: 'openWheel', ...own };
  const all = packs.flatMap((pack) => pack.cars.map((c) => ({ pack, c })));
  if (!all.length) return { kind: 'plain', ...own };

  const make = name ? makeIn(name, new Set(all.map((a) => a.c.make))) : null;
  const words = modelWords(name, make);
  let best = all[0];
  let bestScore = -Infinity;
  let bestModel = false;
  for (const entry of all) {
    const { c } = entry;
    const sameMake = make !== null && c.make === make;
    const hit = sameMake && words.some((w) => c.model.toLowerCase().includes(w));
    let score = (sameMake ? 1000 : 0) + (hit ? 500 : 0);
    if (year !== null && c.year !== null) score -= Math.abs(c.year - year) * (sameMake ? 4 : 2);
    if (shapeOf(c) === stanceOf(body)) score += 60;
    // A traffic car is the plain version of a car the file also has properly.
    if (/traffic/i.test(c.key)) score -= 5;
    if (score > bestScore || (score === bestScore && c.key < best.c.key)) {
      best = entry;
      bestScore = score;
      bestModel = hit;
    }
  }
  // The very model from the file, or its car of the same make and generation: more of
  // a likeness than the viewer's own. Past that, the viewer's own of this very car.
  const sameGeneration =
    spec !== null && best.c.make === make && best.c.year !== null && best.c.year >= spec.from - 1 && best.c.year <= spec.to + 1;
  if (!bestModel && spec && !sameGeneration) return { kind: 'plain', ...own };
  const kind: CarMatchKind = bestModel ? 'sameModel' : make !== null && best.c.make === make ? 'sameMake' : 'similar';
  return { kind, ...own, pack: best.pack, car: best.c };
}

/** What a lap's car is drawn as: the match, and the body (none: the scene's single-seater). */
export interface CarBody {
  match: CarMatch;
  model?: CarModel;
}

const bodies = new WeakMap<LapTrace, { packs: CarPack[]; name?: string; ordinal?: number; body: CarBody }>();

export function carBody(lap: LapTrace, packs: CarPack[]): CarBody {
  const known = bodies.get(lap);
  if (known && known.packs === packs && known.name === lap.car.name && known.ordinal === lap.car.ordinal) return known.body;
  const match = matchCar(lap.car, lap.game, packs);
  const model =
    match.kind === 'openWheel'
      ? undefined
      : match.pack && match.car
        ? packCarModel(match.pack, match.car)
        : bodyModel(match.body, match.era, match.spec);
  const body = { match, model };
  bodies.set(lap, { packs, name: lap.car.name, ordinal: lap.car.ordinal, body });
  return body;
}
