/**
 * Which figure a tracked thing is, from what the data says about it: a name
 * (a DCS unit type, a War Thunder id, a Battlefield vehicle, a Tacview Name)
 * matched against the catalogue and its aliases, else a type (Tacview's tags
 * like `Air+Rotorcraft`, War Thunder's map icons like `MediumTank`, plain words
 * like "tank" or "infantry") mapped to a class, else nothing - the caller
 * decides what nothing means (a box, or a soldier for a game of people).
 */

import { ALIASES, CATALOG, type FigureDomain } from './catalog';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

let index: Map<string, string> | null = null;
let byClass: Map<string, string> | null = null;

function build(): void {
  index = new Map();
  byClass = new Map();
  for (const name of Object.keys(CATALOG)) {
    index.set(norm(name), name);
    const cls = CATALOG[name].cls;
    if (!byClass.has(cls)) byClass.set(cls, name);
  }
  // A catalogue name keeps its own key: an alias spelt like another figure's name never takes it over.
  const own = new Set(index.keys());
  for (const [alias, name] of Object.entries(ALIASES)) if (CATALOG[name] && !own.has(norm(alias))) index.set(norm(alias), name);
}

/** The catalogue figure a name stands for: exact, by alias, or by the longest known prefix of it. */
export function figureForName(label: string): string | null {
  if (!index) build();
  if (!label) return null;
  if (CATALOG[label]) return label;
  const alias = ALIASES[label.toLowerCase()];
  if (alias && CATALOG[alias]) return alias;
  const n = norm(label);
  if (n.length < 2) return null;
  const hit = index!.get(n);
  if (hit) return hit;
  // "F-16C_50" -> "f16c": the longest prefix that names a figure, of four characters or more.
  for (let k = n.length - 1; k >= 4; k--) {
    const p = index!.get(n.slice(0, k));
    if (p) return p;
  }
  // "Mi-24P" -> "mi-24p-hind": the shortest figure name that begins with it.
  if (n.length >= 4) {
    let best: [string, string] | null = null;
    for (const [key, name] of index!) if (key.startsWith(n) && (!best || key.length < best[0].length)) best = [key, name];
    if (best) return best[1];
  }
  return null;
}

/** A class's figure: its generic one when the catalogue has it, else the first named one of the class. */
export function figureForClass(cls: string): string | null {
  if (!byClass) build();
  if (CATALOG[cls]) return cls;
  return byClass!.get(cls) ?? null;
}

/**
 * Ordered: the first rule a type string matches gives the figure. Each lists
 * figure names or classes to try in turn - the catalogue's neutral class
 * figures first, so a bare "Helicopter" is a plain helicopter rather than an
 * Apache - and the domain the type belongs to.
 */
const TYPE_RULES: [RegExp, string[], FigureDomain][] = [
  [/missile|rocket\b|\baam\b|\bsam\b/i, ['aam', 'agm'], 'missile'],
  [/bomb/i, ['bomb'], 'missile'],
  [/torpedo/i, ['aam'], 'missile'],
  // Before the aircraft rule: "AntiAircraft" and "AircraftCarrier" have "Aircraft" in them.
  [/antiaircraft|airdefen[cs]e|\bspaa\b|\baaa\b/i, ['spaa', 'sam'], 'ground'],
  [/aircraftcarrier|\bcarrier\b/i, ['carrier'], 'sea'],
  [/submarine/i, ['submarine'], 'sea'],
  [/warship|destroyer|cruiser|frigate|battleship|\bship\b/i, ['destroyer', 'battleship'], 'sea'],
  [/watercraft|boat/i, ['patrol-boat', 'rhib'], 'sea'],
  [/attack.?heli|gunship|\bah-/i, ['attack-helicopter', 'heli-attack'], 'heli'],
  [/scout.?heli|light.?heli/i, ['scout-helicopter', 'heli-scout'], 'heli'],
  [/rotorcraft|helicopter|\bheli/i, ['transport-helicopter', 'heli-transport'], 'heli'],
  [/bomber/i, ['bomber', 'ww2-bomber'], 'air'],
  [/fixedwing|aircraft|fighter|assault|airplane|\bplane\b|\bjet\b/i, ['multirole-jet', 'multirole', 'fighter'], 'air'],
  [/mortar|static|emplacement|\bturret\b|\bmg\b|machine.?gun|launcher/i, ['emplacement-gun'], 'ground'],
  [/tankdestroyer|tank_destroyer|\btd\b/i, ['light-tank', 'mbt'], 'ground'],
  [/lighttank|light_tank/i, ['light-tank'], 'ground'],
  [/heavytank|mediumtank|\btank\b|\bmbt\b|tracked/i, ['mbt'], 'ground'],
  [/armou?r|\bifv\b|\bapc\b/i, ['ifv', 'apc-wheeled'], 'ground'],
  [/artillery|howitzer|\bmlrs\b/i, ['sp-artillery', 'mlrs'], 'ground'],
  [/truck|wheeled|vehicle|\bcar\b|jeep/i, ['truck', 'jeep'], 'ground'],
  [/human|infantry|soldier|pilot|parachut|person|player|\bman\b/i, ['soldier'], 'person'],
];

/** The domain a type string says a thing is in, or null when no rule knows it. */
export function domainOfType(type: string): FigureDomain | null {
  if (!type) return null;
  for (const [re, , domain] of TYPE_RULES) if (re.test(type)) return domain;
  return null;
}

/** The figure a type string's class has, or null when no rule knows it. */
export function figureForType(type: string): string | null {
  if (!type) return null;
  for (const [re, classes] of TYPE_RULES) {
    if (!re.test(type)) continue;
    for (const c of classes) {
      const f = figureForClass(c);
      if (f) return f;
    }
  }
  return null;
}

/** Whether a figure of `figure`'s domain can be a thing the type puts in `domain`: aircraft are never trucks. */
function fits(figure: string, domain: FigureDomain | null): boolean {
  if (!domain) return true;
  const d = CATALOG[figure]?.domain;
  if (!d || d === 'marker') return true;
  if (d === domain) return true;
  // Air and helicopter types overlap in data (a "VTOL", "Aircraft" for a helicopter); ground and person do not.
  return (d === 'air' && domain === 'heli') || (d === 'heli' && domain === 'air');
}

/**
 * Names first (they are specific), then types; null when nothing is known. A
 * name whose figure is in another domain than the type says is not taken: a
 * "Typhoon" that the data calls a truck is not the Hawker fighter of that name.
 */
export function figureFor(names: string[], types: string[]): string | null {
  const domain = types.map(domainOfType).find((d) => d !== null) ?? null;
  for (const n of names) {
    const f = figureForName(n);
    if (f && fits(f, domain)) return f;
  }
  for (const t of types) {
    const f = figureForType(t);
    if (f) return f;
  }
  return null;
}
