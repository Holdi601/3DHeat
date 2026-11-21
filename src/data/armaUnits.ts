/**
 * What an Arma recording's vehicle is, in words the figures and model packs
 * know: the `Unit` column of an OCAP table (`ocap.ts`).
 *
 * - Arma Reforger names a vehicle by its prefab (`Prefabs/Vehicles/Wheeled/
 *   M151A2/M151A2_transport.et`) or its editor name, often a string-table
 *   key (`#AR-Vehicle_M151A2_Name`): the unit is the prefab's base name, the
 *   id the Reforger catalogue and model pack use (`M151A2_transport`).
 * - Arma 3's own vehicles have made-up names for real ones ("M2A4 Slammer"
 *   is a Merkava Mk.4): the unit is the real vehicle, so another game's model
 *   of it can stand in, only ever on a figure of the same kind (a "Hunter"
 *   typed as a car is never the Hawker jet). Mods that use real names (CUP,
 *   RHS: "T-72B3", "UH-60M") need nothing: their names are matched as they
 *   are.
 */

/** Arma 3's vehicles by a word of their name, as the real vehicle each is drawn from; by OCAP class where a word is ambiguous. */
const ARMA3_REAL: [RegExp, string, RegExp?][] = [
  [/\bslammer\b/i, 'Merkava Mk.4'],
  [/\bvarsuk\b|\bangara\b/i, 'T-14'],
  [/\bkuma\b/i, 'Leopard 2A6'],
  [/\brhino\b/i, 'Centauro II'],
  [/\bnyx\b/i, 'Wiesel 2'],
  [/\bmarshall\b/i, 'Patria AMV'],
  [/\bgorgon\b/i, 'Pandur II'],
  [/\bmora\b/i, 'ASCOD'],
  [/\bmarid\b/i, 'BTR-90'],
  [/\btigris\b/i, '2S6 Tunguska'],
  [/\bscorcher\b/i, 'M109'],
  [/\bsochor\b/i, '2S19 Msta'],
  [/\bsandstorm\b/i, 'M270 MLRS'],
  [/\bhunter\b/i, 'M-ATV', /^(car|truck)$/],
  [/\bstrider\b/i, 'Fennek'],
  [/\bhemtt\b/i, 'HEMTT'],
  [/\bghost ?hawk\b/i, 'UH-60M'],
  [/\bblackfoot\b/i, 'RAH-66 Comanche'],
  [/\bkajman\b/i, 'Mi-28N'],
  [/\borca\b/i, 'Ka-60 Kasatka'],
  [/\bhummingbird\b/i, 'MH-6 Little Bird'],
  [/\bpawnee\b/i, 'AH-6 Little Bird'],
  [/\bhellcat\b/i, 'AW159 Wildcat'],
  [/\bmohawk\b/i, 'AW101 Merlin'],
  [/\bhuron\b/i, 'CH-47F'],
  [/\bblackfish\b/i, 'V-22 Osprey'],
  [/\bwipeout\b/i, 'A-10C'],
  [/\bneophron\b/i, 'Yak-130'],
  [/\bbuzzard\b/i, 'L-159'],
  [/\bblack wasp\b/i, 'F-35A'],
  [/\bshikra\b/i, 'Su-57'],
  [/\bgryphon\b/i, 'JAS 39 Gripen'],
  [/\bgreyhawk\b/i, 'MQ-1 Predator'],
  [/\bsentinel\b/i, 'X-47B'],
];

/** The real vehicle an Arma 3 vehicle name stands for, or ''. `cls` is OCAP's class (car, tank, heli...). */
export function arma3RealVehicle(name: string, cls = ''): string {
  for (const [re, real, only] of ARMA3_REAL) if (re.test(name) && (!only || only.test(cls))) return real;
  return '';
}

/**
 * A Reforger vehicle's catalogue id from its recorded name: a prefab path's
 * base name, a string-table key's middle, '' for a display name (matched by
 * the figures as it is).
 */
export function reforgerUnitId(name: string): string {
  const n = name.trim();
  const prefab = /(?:^|[\\/])([A-Za-z0-9_-]+)\.et$/i.exec(n.replace(/^\{[0-9A-Fa-f]+\}/, ''));
  if (prefab) return prefab[1];
  const key = /^#AR-(?:Vehicle_|Vehicles?_)?([A-Za-z0-9_-]+?)(?:_Name)?$/i.exec(n);
  if (key) return key[1];
  return '';
}

/** Reforger's three stock factions as the OCAP recorder for Reforger maps them to sides; any other faction it records as CIV. */
const REFORGER_FACTION: Record<string, string> = {
  WEST: 'US',
  EAST: 'USSR',
  GUER: 'FIA',
};

/** The faction a Reforger recording's side stands for, where the recorder's mapping leaves only one; '' otherwise. */
export function reforgerFactionOfSide(side: string): string {
  return REFORGER_FACTION[side.toUpperCase()] ?? '';
}

/** A faction key (Reforger's `US`, `USSR`, `FIA`, Arma 3's `BLU_F`...) as the side OCAP uses; '' when not known. */
export function sideOfFaction(faction: string): string {
  const f = faction.trim().toUpperCase();
  if (!f) return '';
  if (/^(WEST|EAST|GUER|CIV)$/.test(f)) return f;
  if (f === 'US' || f === 'USA' || /^BLU_/.test(f)) return 'WEST';
  if (f === 'USSR' || f === 'RUSSIA' || /^OPF_/.test(f)) return 'EAST';
  if (f === 'FIA' || /^IND_/.test(f)) return 'GUER';
  if (/^CIV/.test(f)) return 'CIV';
  return '';
}

/** The side a mission's end message names as the winner ("BLUFOR triumphed!"), or '' for none or several. */
export function winnerOfText(text: string): string {
  const said = [
    /\b(blufor|west|nato)\b/i.test(text) ? 'WEST' : '',
    /\b(opfor|east|csat|redfor)\b/i.test(text) ? 'EAST' : '',
    /\b(indfor|independent|guer|resistance|aaf)\b/i.test(text) ? 'GUER' : '',
  ].filter(Boolean);
  return said.length === 1 ? said[0] : '';
}
