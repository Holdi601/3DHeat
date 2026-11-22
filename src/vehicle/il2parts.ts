/**
 * IL-2 Great Battles damage-model parts by name. An IL-2 pack model's parts
 * carry the game's part numbers (`Cf.10200`, `Ailer_L.12240`,
 * `Object044.10213`, `14143.14161`): the same numbering on every aircraft,
 * a range a region (102xx the fuselage, 111xx the wings, 122xx the ailerons,
 * 141xx the first engine...). This turns a part's number into the region it
 * stands for, for the plate's title; the name itself stays the plate's key.
 */

const SIDE4 = ['bottom', 'top', 'left', 'right'];

/** A region by part number; null for a number outside the ranges. */
function regionOf(id: number): string | null {
  const hundreds = Math.floor(id / 100);
  const tens = Math.floor(id / 10) % 10;
  const ones = id % 10;
  if (hundreds === 102) return `fuselage ${tens + 1}${ones < 4 ? `, ${SIDE4[ones]}` : ''}`;
  if (hundreds >= 106 && hundreds <= 107) return 'horizontal tail';
  if (hundreds === 108) return 'fin';
  if (hundreds === 109) return 'pylon';
  if (hundreds === 111) return `${tens % 2 ? 'right' : 'left'} wing ${Math.floor(tens / 2) + 1}${ones < 2 ? `, ${ones ? 'top' : 'bottom'}` : ''}`;
  if (hundreds >= 110 && hundreds <= 116) return 'wing';
  if (hundreds === 117) return 'wing centre section';
  if (hundreds === 118) return 'upper wing';
  if (hundreds >= 120 && hundreds <= 121) return 'elevator';
  if (hundreds === 122 && tens === 4) return `${ones < 5 ? 'left' : 'right'} aileron`;
  if (hundreds >= 122 && hundreds <= 123) return 'aileron';
  if (hundreds >= 124 && hundreds <= 125) return 'rudder';
  if (hundreds >= 126 && hundreds <= 127) return 'flap';
  if (hundreds >= 128 && hundreds <= 129) return 'airbrake';
  if (hundreds >= 130 && hundreds <= 132) return 'landing gear door';
  if (hundreds >= 133 && hundreds <= 139) return 'landing gear';
  if (hundreds === 140) return 'propeller';
  if (hundreds >= 141 && hundreds <= 149) return `engine ${hundreds - 140}`;
  if (hundreds >= 150 && hundreds <= 159) return `propeller ${Math.max(1, hundreds - 150)}`;
  if (hundreds >= 220 && hundreds <= 229) return 'cockpit, canopy or bay door';
  if (hundreds >= 230 && hundreds <= 239) return 'glass';
  return null;
}

/** The region an IL-2 damage-model part stands for (`fuselage 1, bottom`, `left aileron`, `engine 1`), or null. */
export function il2PartLabel(name: string): string | null {
  const m = /(?:^|[.:])(1[0-5]\d{3}|2[23]\d{3})(?=\.|$)/.exec(name);
  if (m) return regionOf(Number(m[1]));
  if (/^blister/i.test(name)) return 'canopy';
  const g = /^gear([clr])\d/i.exec(name);
  if (g) return g[1].toLowerCase() === 'c' ? 'tail wheel' : `${g[1].toLowerCase() === 'l' ? 'left' : 'right'} landing gear`;
  return null;
}

/** A plate's title: its region where the name says one (IL-2's part numbers), else the name in plain words. */
export function plateTitle(name: string): string {
  const plain = name.replace(/_dm$/, '').replace(/_/g, ' ');
  const region = il2PartLabel(name);
  return region ? `${region} (${name})` : plain;
}
