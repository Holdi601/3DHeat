/**
 * In-game economies of the round-based shooters: Counter-Strike 2 (dollars)
 * and Valorant (credits). Prices change with patches; the values are those the
 * games' own buy menus showed at the patch named in `sources`.
 *
 * CS2 rows: a grenade thrown is its price spent there, a gun shot costs
 * nothing (the game sells no ammunition), a death loses the equipment the
 * player carried (the data's `equipment` value), money spent is the rise of
 * the player's cash spent, and kills, plants and defuses earn the game's
 * rewards. Valorant has no reader yet: the table maps weapon, shield and
 * ability names for when one exists.
 */

import type { CostItem, GameCosts } from './types';

const w = (m: RegExp, v: number, reward = 300): CostItem => ({ m, v, s: 'menu', reward });
/** Thrown: spent where it leaves the hand. */
const g = (m: RegExp, v: number): CostItem => ({ m, v, s: 'menu', reward: 300, use: true });

export const CS2: GameCosts = {
  id: 'cs2',
  label: 'Counter-Strike 2',
  currency: 'cs2',
  realWorld: false,
  sources: {
    menu: 'CS2 buy menu prices and kill rewards (Valve, 2025 patches)',
    round: 'CS2 round rewards: win 3250 (3500 by bomb or defuse), loss bonus 1400 to 3400, plant and defuse 300',
  },
  items: [
    // Pistols.
    w(/glock/, 200),
    w(/usps?|p2000|p2k/, 200),
    w(/p250/, 300),
    w(/dualberettas|elite/, 300),
    w(/cz75/, 500, 100),
    w(/tec9/, 500),
    w(/fiveseven/, 500),
    w(/deagle|deserteagle/, 700),
    w(/r8|revolver/, 600),
    // SMGs.
    w(/mac10/, 1050, 600),
    w(/mp9/, 1250, 600),
    w(/mp7/, 1500, 600),
    w(/mp5/, 1500, 600),
    w(/ump/, 1200, 600),
    w(/p90/, 2350, 300),
    w(/bizon/, 1400, 600),
    // Rifles.
    w(/galil/, 1800),
    w(/famas/, 1950),
    w(/ak47/, 2700),
    w(/m4a1s|m4a1silencer/, 2900),
    w(/m4a4|m4a1/, 3000),
    w(/sg553|sg556|krieg/, 3000),
    w(/aug/, 3300),
    w(/ssg08|scout/, 1700),
    w(/awp/, 4750, 100),
    w(/g3sg1|scar20/, 5000),
    // Heavy.
    w(/nova/, 1050, 900),
    w(/xm1014/, 2000, 600),
    w(/mag7/, 1300, 900),
    w(/sawedoff/, 1100, 900),
    w(/m249/, 5200),
    w(/negev/, 1700),
    // Equipment and grenades.
    w(/kevlarhelmet|vesthelm|assaultsuit/, 1000),
    w(/kevlar|vest/, 650),
    w(/zeus|taser/, 200, 0),
    w(/defuse|kit/, 400),
    g(/hegrenade|^he$|highexplosive/, 300),
    g(/flash/, 200),
    g(/smoke/, 300),
    g(/molotov/, 400),
    g(/incendiary|incgrenade/, 500),
    g(/decoy/, 50),
    w(/knife|bayonet|karambit/, 0, 1500),
  ],
  classAvg: { infantry: 3500 },
  munitionAvg: { grenade: 300 },
  earn: { kill: 300, plant: 300, defuse: 300, roundWin: 3250, roundLoss: [1400, 1900, 2400, 2900, 3400] },
  note: 'Gun shots are free; grenades are spent where thrown. A death loses the equipment value carried.',
};

const a = (m: RegExp, v: number): CostItem => ({ m, v, s: 'agents', use: true });

export const VALORANT: GameCosts = {
  id: 'valorant',
  label: 'Valorant',
  currency: 'creds',
  realWorld: false,
  sources: {
    menu: 'Valorant buy menu (Riot, patch 9.x)',
    agents: 'Valorant agent ability prices (Riot, patch 9.x); vary by patch',
    round: 'Valorant round economy: kill 200, spike plant 300, win 3000, loss 1900/2400/2900',
  },
  items: [
    { m: /classic/, v: 0, s: 'menu', reward: 200 },
    { m: /shorty/, v: 300, s: 'menu', reward: 200 },
    { m: /frenzy/, v: 450, s: 'menu', reward: 200 },
    { m: /ghost/, v: 500, s: 'menu', reward: 200 },
    { m: /sheriff/, v: 800, s: 'menu', reward: 200 },
    { m: /stinger/, v: 1100, s: 'menu', reward: 200 },
    { m: /spectre/, v: 1600, s: 'menu', reward: 200 },
    { m: /bucky/, v: 850, s: 'menu', reward: 200 },
    { m: /judge/, v: 1850, s: 'menu', reward: 200 },
    { m: /bulldog/, v: 2050, s: 'menu', reward: 200 },
    { m: /guardian/, v: 2250, s: 'menu', reward: 200 },
    { m: /phantom/, v: 2900, s: 'menu', reward: 200 },
    { m: /vandal/, v: 2900, s: 'menu', reward: 200 },
    { m: /marshal/, v: 950, s: 'menu', reward: 200 },
    { m: /outlaw/, v: 2400, s: 'menu', reward: 200 },
    { m: /operator/, v: 4700, s: 'menu', reward: 200 },
    { m: /ares/, v: 1600, s: 'menu', reward: 200 },
    { m: /odin/, v: 3200, s: 'menu', reward: 200 },
    { m: /heavyshield|heavyarmor/, v: 1000, s: 'menu' },
    { m: /regenshield|regen/, v: 650, s: 'menu' },
    { m: /lightshield|lightarmor/, v: 400, s: 'menu' },
    // Abilities, by agent: the bought ones (signatures are free).
    a(/cloudburst/, 200), a(/updraft/, 150),
    a(/curveball/, 250), a(/hothands/, 200), a(/blaze/, 200),
    a(/shockbolt|shockdart/, 150), a(/owldrone|recondrone/, 400), a(/boombot/, 400), a(/blastpack/, 200), a(/paintshells/, 200),
    a(/flashdrive|flashpoint/, 250), a(/trademark/, 200), a(/headhunter/, 150), a(/rendezvous/, 0),
    a(/fragment/, 200), a(/aftershock/, 100), a(/faultline/, 0), a(/guidinglight/, 250), a(/trailblazer/, 300),
    a(/nanoswarm/, 200), a(/alarmbot/, 200), a(/turret/, 0), a(/stimbeacon/, 100), a(/incendiary/, 250),
    a(/snakebite/, 200), a(/poisoncloud/, 200), a(/toxicscreen/, 0), a(/darkcover/, 150), a(/paranoia/, 300),
    a(/shroudedstep/, 100), a(/barrierorb/, 300), a(/sloworb/, 100), a(/healingorb/, 0), a(/leer/, 250), a(/devour|dismiss/, 0),
    a(/cyber?cage/, 100), a(/spycam/, 0), a(/trapwire/, 200), a(/gravnet/, 200), a(/sonicsensor/, 200), a(/fastlane/, 300),
    a(/relayblot|relaybolt/, 200), a(/highgear/, 0), a(/regrowth/, 150), a(/fakeout/, 300), a(/wingman/, 400),
    a(/stealthdrone/, 300), a(/zeropoint/, 200), a(/thunderbolt/, 250), a(/ruse/, 200),
  ],
  classAvg: { infantry: 3000 },
  munitionAvg: { grenade: 200 },
  earn: { kill: 200, plant: 300, roundWin: 3000, roundLoss: [1900, 2400, 2900] },
  note: 'No Valorant reader yet; the names map for when replays or files arrive.',
};

/**
 * World of Tanks and World of Warships credits. Neither game publishes a
 * per-vehicle price list in a form a table could keep current, so these are
 * per-class averages over the tiers most played (VIII to X), flagged as such:
 * WoT purchase prices run about 2.5M (VIII) to 6.1M (X) credits; WoWs ships
 * about 5M (VIII) to 19.5M (X). WoWs shells cost nothing since 0.8.0.
 */
export const WOT: GameCosts = {
  id: 'wot',
  label: 'World of Tanks',
  currency: 'credits',
  realWorld: false,
  sources: { tiers: 'WoT tech tree purchase prices by tier (Wargaming), tier VIII-X average' },
  items: [],
  classAvg: { tank: 3.5e6, armoured: 3.5e6, artillery: 3e6, spaa: 3e6 },
  shotByClass: { tank: 1100, armoured: 900, artillery: 1300 },
  note: 'Class averages only: per-vehicle prices depend on tier the replay does not carry.',
};

export const WOWS: GameCosts = {
  id: 'wows',
  label: 'World of Warships',
  currency: 'credits',
  realWorld: false,
  sources: { tiers: 'WoWs tech tree purchase prices by tier (Wargaming), tier VIII-X average' },
  items: [],
  classAvg: { ship: 11e6, submarine: 11e6 },
  shotByClass: { ship: 0 },
  note: 'Class averages only; shells are free in WoWs.',
};
