/**
 * The movement analysis' patterns (`../maneuver`): the shapes a group's
 * movement can take, as the maneuver detectors find them. Joined to the
 * taxonomy in `patterns.ts`; entries that speak to them live in
 * `maneuver.ts` (new entries) and `maneuver-tags.ts` (the patterns older
 * entries also show).
 */

import type { Pattern } from './patterns.ts';

export const MANEUVER_PATTERNS: Pattern[] = [
  { id: 'formation', family: 'movement', label: 'Formation', sign: 'Units of a side move together in a recognisable shape: line, column, wedge, echelon, box.' },
  { id: 'frontal-assault', family: 'movement', label: 'Frontal assault', sign: 'A group closes on the enemy straight into the face of its front.' },
  { id: 'double-envelopment', family: 'movement', label: 'Double envelopment (pincer)', sign: 'Two groups strike both flanks of one enemy body at about the same time.' },
  { id: 'encirclement', family: 'movement', label: 'Encirclement and pocket', sign: 'An enemy group ends up with the other side all round it and few ways out.' },
  { id: 'penetration', family: 'movement', label: 'Penetration and breakthrough', sign: 'A group passes through the enemy line where enemies stand on both sides of it.' },
  { id: 'fire-and-maneuver', family: 'movement', label: 'Fire and maneuver (bounding overwatch)', sign: 'Part of a group moves while the rest stands and covers it, and the roles alternate.' },
  { id: 'feint', family: 'movement', label: 'Feint and diversion', sign: 'A small group draws the enemy to one place; the main effort strikes elsewhere soon after.' },
  { id: 'withdrawal', family: 'movement', label: 'Withdrawal and retreat', sign: 'A group in contact turns away and opens the distance to the enemy.' },
  { id: 'pursuit', family: 'movement', label: 'Pursuit', sign: 'A group follows an enemy that is moving away, keeping or closing the distance.' },
  { id: 'defence-in-depth', family: 'terrain', label: 'Defence in depth', sign: 'Defenders stand in several belts one behind the other along the enemy\'s axis of advance.' },
  { id: 'screening', family: 'movement', label: 'Screen and reconnaissance', sign: 'A small element moves well ahead of its main body and meets the enemy first.' },
  { id: 'dispersion', family: 'force', label: 'Dispersion', sign: 'A side spreads out over time; fewer of its units share one place.' },
  { id: 'missile-defence', family: 'air', label: 'Missile defence geometry', sign: 'Aircraft under missile threat turn the threat to the side or the tail: crank, notch, drag, pump.' },
  { id: 'angles-fight', family: 'air', label: 'Angles fight', sign: 'Close-range dogfight at low speed and high turn rate, fought for nose position rather than energy.' },
  { id: 'cap', family: 'air', label: 'Combat air patrol', sign: 'Aircraft orbit a fixed station for minutes, waiting for the enemy to come.' },
  { id: 'strike-package', family: 'air', label: 'Strike package', sign: 'Aircraft of different roles fly together to a target; some attack the ground, others cover them.' },
  { id: 'line-of-battle', family: 'sea', label: 'Line of battle', sign: 'Ships steam in column one behind another so that all broadsides bear.' },
  { id: 'crossing-the-t', family: 'sea', label: 'Crossing the T', sign: 'A column passes across the head of the enemy\'s column: all of its guns bear, few of the enemy\'s.' },
];
