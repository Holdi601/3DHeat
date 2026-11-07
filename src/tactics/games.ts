/**
 * What the tactics board offers per game: the sides, and the figures in the
 * palette, grouped. Names are catalogue entries (`figures/catalog.ts`); a game
 * whose own vehicles are not built yet gets the generic figure of each class.
 * Valorant's abilities are generic shapes, never the game's art.
 */

import type { PlanTeam } from './plan';

export interface GamePreset {
  id: string;
  name: string;
  teams: PlanTeam[];
  palette: { group: string; items: string[] }[];
  /** Width of a drawn arrow, metres: a corridor in CS is narrower than a flank in Battlefield. */
  arrowWidth: number;
  /** Peak of a throw's arc above its ends, metres. */
  throwApex: number;
}

const BLUE: [number, number, number] = [0.26, 0.55, 0.95];
const RED: [number, number, number] = [0.93, 0.33, 0.27];
const YELLOW: [number, number, number] = [0.95, 0.75, 0.25];
const TEAL: [number, number, number] = [0.25, 0.8, 0.75];
const NEUTRAL: [number, number, number] = [0.8, 0.8, 0.8];

const PEOPLE = ['soldier', 'soldier-crouch', 'soldier-prone', 'sniper', 'anti-tank', 'medic', 'crew'];
const MARKERS = ['objective-flag', 'spawn', 'waypoint', 'rally-point', 'forward-base'];
const GROUND = ['mbt', 'light-tank', 'ifv', 'apc-tracked', 'apc-wheeled', 'mrap', 'jeep', 'truck', 'spaa', 'sp-artillery', 'mlrs', 'towed-gun'];

export const GAMES: GamePreset[] = [
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    teams: [
      { id: 't', name: 'T', color: YELLOW },
      { id: 'ct', name: 'CT', color: BLUE },
    ],
    palette: [
      { group: 'players', items: ['soldier', 'soldier-crouch'] },
      { group: 'utility', items: ['cs2-smoke', 'cs2-flash', 'cs2-molotov', 'cs2-he', 'cs2-decoy', 'cs2-bomb'] },
      { group: 'markers', items: ['waypoint'] },
    ],
    arrowWidth: 0.5,
    throwApex: 4,
  },
  {
    id: 'valorant',
    name: 'Valorant',
    teams: [
      { id: 'atk', name: 'Attack', color: RED },
      { id: 'def', name: 'Defense', color: TEAL },
    ],
    palette: [
      { group: 'players', items: ['soldier', 'soldier-crouch'] },
      { group: 'abilities', items: ['cs2-smoke', 'ability-wall', 'cs2-flash', 'cs2-molotov', 'ability-recon', 'ability-trap', 'ability-heal'] },
      { group: 'markers', items: ['cs2-bomb', 'waypoint'] },
    ],
    arrowWidth: 0.5,
    throwApex: 4,
  },
  {
    id: 'battlefield',
    name: 'Battlefield',
    teams: [
      { id: 'us', name: 'Team 1', color: BLUE },
      { id: 'ru', name: 'Team 2', color: RED },
    ],
    palette: [
      { group: 'infantry', items: PEOPLE },
      { group: 'ground', items: [...GROUND, 'm1a2-abrams', 't-90a', 'leopard-2a6', 'm2a2-bradley', 'bmp-2', 'btr-80', 'm1126-stryker', 'm1025-humvee'] },
      { group: 'air', items: ['ah-64d-apache', 'mi-24p-hind', 'uh-60a-black-hawk', 'mi-8mtv2', 'f-16c', 'su-27', 'a-10c', 'su-25t'] },
      { group: 'sea', items: ['rhib', 'patrol-boat', 'lcac-hovercraft'] },
      { group: 'markers', items: MARKERS },
    ],
    arrowWidth: 3,
    throwApex: 6,
  },
  {
    id: 'squad',
    name: 'Squad',
    teams: [
      { id: 'blufor', name: 'BLUFOR', color: BLUE },
      { id: 'opfor', name: 'OPFOR', color: RED },
    ],
    palette: [
      { group: 'infantry', items: PEOPLE },
      { group: 'ground', items: [...GROUND, 'm1126-stryker', 'btr-80', 'bmp-2', 'm1a2-abrams', 't-90a', 'ural-4320', 'm1025-humvee'] },
      { group: 'air', items: ['uh-60a-black-hawk', 'mi-8mtv2', 'uh-1h-huey'] },
      { group: 'markers', items: MARKERS },
    ],
    arrowWidth: 3,
    throwApex: 6,
  },
  {
    id: 'arma',
    name: 'Arma',
    teams: [
      { id: 'blufor', name: 'BLUFOR', color: BLUE },
      { id: 'opfor', name: 'OPFOR', color: RED },
      { id: 'indep', name: 'Independent', color: [0.35, 0.8, 0.4] },
    ],
    palette: [
      { group: 'infantry', items: PEOPLE },
      { group: 'ground', items: GROUND },
      { group: 'air', items: ['ah-64d-apache', 'mi-24p-hind', 'uh-60a-black-hawk', 'mi-8mtv2', 'ch-47-chinook', 'a-10c', 'f-16c', 'c-130h-hercules'] },
      { group: 'sea', items: ['rhib', 'patrol-boat', 'lcvp-landing-craft'] },
      { group: 'markers', items: MARKERS },
    ],
    arrowWidth: 4,
    throwApex: 6,
  },
  {
    id: 'air',
    name: 'DCS / War Thunder / IL-2',
    teams: [
      { id: 'blue', name: 'Blue', color: BLUE },
      { id: 'red', name: 'Red', color: RED },
      { id: 'neutral', name: 'Neutral', color: NEUTRAL },
    ],
    palette: [
      { group: 'jets', items: ['f-16c', 'f-15c', 'f-a-18c', 'su-27', 'mig-29a', 'mig-21bis', 'mirage-2000c', 'eurofighter-typhoon', 'a-10c', 'su-25t', 'c-130h-hercules'] },
      { group: 'props', items: ['bf-109-g6', 'spitfire-mk-ix', 'p-51d-mustang', 'fw-190-a8', 'ju-87-stuka', 'b-17g', 'sopwith-camel'] },
      { group: 'helicopters', items: ['ah-64d-apache', 'mi-24p-hind', 'ka-50', 'uh-1h-huey', 'uh-60a-black-hawk', 'ch-47-chinook', 'mi-8mtv2', 'sa-342-gazelle'] },
      { group: 'air defence', items: ['zsu-23-4-shilka', '2k22-tunguska', 'flakpanzer-gepard', 'roland-marder', '9k330-tor', 'zu-23-2', 'mim-104-patriot-launcher'] },
      { group: 'ground', items: [...GROUND, 'm1a2-abrams', 't-90a', 'leopard-2a6', 'leopard-1a5', 't-55a', 'bmp-2', 'm2a2-bradley', 'bm-21-grad', 'm109-paladin'] },
      { group: 'sea', items: ['arleigh-burke', 'nimitz-carrier', 'kilo-submarine', 'bismarck-battleship', 'patrol-boat'] },
      { group: 'weapons', items: ['aim-9m', 'aim-120c', 'aim-7m', 'r-73', 'r-27r', 'agm-65d', 'agm-114-hellfire', 'mk-82', 'bgm-109-tomahawk'] },
      { group: 'markers', items: MARKERS },
    ],
    arrowWidth: 40,
    throwApex: 200,
  },
  {
    id: 'generic',
    name: 'Other',
    teams: [
      { id: 'a', name: 'Team A', color: BLUE },
      { id: 'b', name: 'Team B', color: RED },
    ],
    palette: [
      { group: 'people', items: PEOPLE },
      { group: 'markers', items: [...MARKERS, 'cs2-smoke', 'cs2-flash', 'cs2-molotov'] },
    ],
    arrowWidth: 1,
    throwApex: 4,
  },
];

export function gamePreset(id: string): GamePreset {
  return GAMES.find((g) => g.id === id) ?? GAMES[GAMES.length - 1];
}
