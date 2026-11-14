/**
 * Strategy games: unit, building and upgrade costs in each game's own
 * resources. Each resource becomes its own column (`cost_lost_minerals`...),
 * and a combined value weighs them by `exchange` - an assumption, said in
 * `exchangeNote`, which the viewer lets you change.
 *
 * A unit appearing is its cost spent there, its death the cost lost, and its
 * killer's row the cost destroyed. No RTS reader exists yet: the tables map
 * unit names for when one does. The tables start with the common units; the
 * rest falls back to class averages, flagged. Values are the games' published
 * stats (Liquipedia, the games' wikis and rule files), at the patch named.
 */

import type { CostItem, GameCosts, Price } from './types';

const u = (m: RegExp, v: Price, s = 'wiki'): CostItem => ({ m, v, s });
const mg = (minerals: number, gas = 0) => ({ minerals, gas });

export const SC2: GameCosts = {
  id: 'sc2',
  label: 'StarCraft II',
  currency: 'res',
  resources: ['minerals', 'gas'],
  exchange: { minerals: 1, gas: 1.5 },
  exchangeNote: 'Gas weighed 1.5 minerals: it is mined about two thirds as fast per worker.',
  realWorld: false,
  sources: { wiki: 'Liquipedia StarCraft II unit pages (patch 5.0.x)' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [
    u(/^scv$|probe|drone/, mg(50)),
    u(/marine/, mg(50)), u(/marauder/, mg(100, 25)), u(/reaper/, mg(50, 50)), u(/ghost/, mg(150, 125)),
    u(/hellion|hellbat/, mg(100)), u(/widowmine/, mg(75, 25)), u(/siegetank/, mg(150, 125)), u(/cyclone/, mg(125, 50)),
    u(/thor/, mg(300, 200)), u(/viking/, mg(150, 75)), u(/medivac/, mg(100, 100)), u(/liberator/, mg(150, 125)),
    u(/raven/, mg(100, 150)), u(/banshee/, mg(150, 100)), u(/battlecruiser/, mg(400, 300)),
    u(/zealot/, mg(100)), u(/stalker/, mg(125, 50)), u(/sentry/, mg(50, 100)), u(/adept/, mg(100, 25)),
    u(/hightemplar/, mg(50, 150)), u(/darktemplar/, mg(125, 125)), u(/archon/, mg(100, 300)), u(/immortal/, mg(275, 100)),
    u(/colossus/, mg(300, 200)), u(/disruptor/, mg(150, 150)), u(/observer/, mg(25, 75)), u(/warpprism/, mg(250)),
    u(/phoenix/, mg(150, 100)), u(/voidray/, mg(250, 150)), u(/oracle/, mg(150, 150)), u(/tempest/, mg(250, 175)),
    u(/carrier/, mg(350, 250)), u(/mothership/, mg(400, 400)),
    u(/zergling/, mg(25)), u(/baneling/, mg(50, 25)), u(/queen/, mg(150)), u(/ravager/, mg(100, 100)), u(/roach/, mg(75, 25)),
    u(/lurker/, mg(150, 150)), u(/hydralisk/, mg(100, 50)), u(/infestor/, mg(100, 150)), u(/swarmhost/, mg(100, 75)),
    u(/ultralisk/, mg(275, 200)), u(/overseer/, mg(150, 50)), u(/overlord/, mg(100)), u(/mutalisk/, mg(100, 100)),
    u(/broodlord/, mg(300, 250)), u(/corruptor/, mg(150, 100)), u(/viper/, mg(100, 200)),
    u(/commandcenter|orbital|nexus/, mg(400)), u(/hatchery/, mg(300)), u(/supplydepot|pylon/, mg(100)),
    u(/barracks|gateway/, mg(150)), u(/spawningpool/, mg(200)), u(/refinery|assimilator|extractor/, mg(75)),
    u(/factory/, mg(150, 100)), u(/starport|stargate/, mg(150, 150)), u(/bunker|photoncannon|spinecrawler/, mg(100)),
  ],
  classAvg: { infantry: mg(75, 25), armoured: mg(150, 75), tank: mg(200, 125), otherAir: mg(150, 100), fighter: mg(150, 100), structure: mg(150, 50), other: mg(100, 50) },
};

export const BAR: GameCosts = {
  id: 'bar',
  label: 'Beyond All Reason / Spring',
  currency: 'res',
  resources: ['metal', 'energy'],
  exchange: { metal: 1, energy: 1 / 70 },
  exchangeNote: 'Energy weighed 1/70 metal: the energy converter rate.',
  realWorld: false,
  sources: { wiki: 'Beyond All Reason unit files (class averages, order of magnitude)' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [u(/commander|armcom|corcom/, { metal: 2700, energy: 26000 })],
  classAvg: {
    infantry: { metal: 60, energy: 900 },
    armoured: { metal: 150, energy: 1800 },
    tank: { metal: 300, energy: 4000 },
    artillery: { metal: 400, energy: 6000 },
    spaa: { metal: 150, energy: 2000 },
    fighter: { metal: 120, energy: 4000 },
    attack: { metal: 200, energy: 6000 },
    bomber: { metal: 250, energy: 9000 },
    ship: { metal: 600, energy: 6000 },
    structure: { metal: 300, energy: 3000 },
    other: { metal: 150, energy: 2000 },
  },
  note: 'Class averages flagged; per-unit values to come with a reader.',
};

const credits = (v: number, m: RegExp) => u(m, v);

export const OPENRA: GameCosts = {
  id: 'openra',
  label: 'OpenRA (Red Alert)',
  currency: 'credits',
  realWorld: false,
  sources: { wiki: 'OpenRA RA mod rules (actor Valued cost)' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [
    credits(100, /^e1$|rifle/), credits(300, /^e3$|rocketsoldier/), credits(160, /^e2$|grenadier/), credits(500, /^e6$|engineer/),
    credits(1200, /tanya|^e7$/), credits(300, /^dog$|attackdog/), credits(700, /^1tnk$|lighttank/), credits(850, /^2tnk$|mediumtank/),
    credits(1150, /^3tnk$|heavytank/), credits(2000, /^4tnk$|mammoth/), credits(900, /^v2rl$|v2/), credits(800, /^apc$/),
    credits(800, /^arty$|artillery/), credits(1100, /^harv$|harvester/), credits(2500, /^mcv$/), credits(600, /^jeep$|ranger/),
    credits(1100, /^heli$|longbow/), credits(1000, /^hind$/), credits(1300, /^yak$/), credits(2000, /^mig$/),
    credits(1000, /^powr$|powerplant/), credits(1400, /^proc$|refinery/), credits(300, /^tent$|^barr$|barracks/), credits(2000, /^weap$|warfactory/),
  ],
  classAvg: { infantry: 200, armoured: 800, tank: 1000, artillery: 900, helicopter: 1100, fighter: 1500, ship: 1000, structure: 1000, other: 600 },
};

const fwgs = (food = 0, wood = 0, gold = 0, stone = 0) => ({ food, wood, gold, stone });

export const AOE2: GameCosts = {
  id: 'aoe2',
  label: 'Age of Empires II DE',
  currency: 'res',
  resources: ['food', 'wood', 'gold', 'stone'],
  exchange: { food: 1, wood: 1, gold: 1.3, stone: 1.2 },
  exchangeNote: 'Gold and stone weighed 1.3 and 1.2: slower to gather and scarcer, roughly their market price.',
  realWorld: false,
  sources: { wiki: 'Age of Empires II DE unit and building costs (Age of Empires wiki)' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [
    u(/villager/, fwgs(50)), u(/militia|manatarms|longswords|champion/, fwgs(60, 0, 20)), u(/spear|pike|halberd/, fwgs(35, 25)),
    u(/crossbow|arbalest|archer/, fwgs(0, 25, 45)), u(/skirmish/, fwgs(25, 35)), u(/scout|lightcav|hussar/, fwgs(80)),
    u(/knight|cavalier|paladin/, fwgs(60, 0, 75)), u(/cavalryarcher|cavarcher/, fwgs(0, 40, 70)), u(/camel/, fwgs(55, 0, 60)),
    u(/handcannon/, fwgs(45, 0, 50)), u(/mangonel|onager/, fwgs(0, 160, 135)), u(/ram/, fwgs(0, 160, 75)),
    u(/trebuchet/, fwgs(0, 200, 200)), u(/scorpion/, fwgs(0, 75, 75)), u(/monk/, fwgs(0, 0, 100)), u(/bombardcannon/, fwgs(0, 225, 225)),
    u(/elephant/, fwgs(120, 0, 70)), u(/towncenter/, fwgs(0, 275, 0, 100)), u(/castle/, fwgs(0, 0, 0, 650)), u(/house/, fwgs(0, 25)),
    u(/barracks|archeryrange|stable/, fwgs(0, 175)), u(/blacksmith/, fwgs(0, 150)), u(/mill|lumbercamp|miningcamp/, fwgs(0, 100)),
    u(/tower/, fwgs(0, 50, 0, 125)), u(/wall/, fwgs(0, 0, 0, 5)),
  ],
  classAvg: { infantry: fwgs(50, 20, 30), armoured: fwgs(70, 0, 60), artillery: fwgs(0, 180, 150), ship: fwgs(0, 150, 50), structure: fwgs(0, 175), other: fwgs(40, 40, 20) },
};

export const AOE4: GameCosts = {
  id: 'aoe4',
  label: 'Age of Empires IV',
  currency: 'res',
  resources: ['food', 'wood', 'gold', 'stone'],
  exchange: { food: 1, wood: 1, gold: 1.3, stone: 1.2 },
  exchangeNote: 'As Age of Empires II.',
  realWorld: false,
  sources: { wiki: 'Age of Empires IV unit costs (aoe4world.com data, season patches)' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [
    u(/villager/, fwgs(50)), u(/spearman/, fwgs(60, 20)), u(/archer/, fwgs(30, 50)), u(/manatarms/, fwgs(100, 0, 20)),
    u(/horseman/, fwgs(100, 20)), u(/knight|lancer/, fwgs(140, 0, 100)), u(/crossbow/, fwgs(80, 0, 40)), u(/handcannon/, fwgs(120, 0, 120)),
    u(/ram/, fwgs(0, 300)), u(/mangonel/, fwgs(0, 400, 200)), u(/trebuchet/, fwgs(0, 400, 150)), u(/springald/, fwgs(0, 250, 250)),
    u(/bombard/, fwgs(0, 400, 600)), u(/monk|scholar/, fwgs(0, 0, 120)), u(/towncenter/, fwgs(0, 400, 0, 300)), u(/house/, fwgs(0, 50)),
    u(/barracks|archeryrange|stable/, fwgs(0, 150)), u(/keep|castle/, fwgs(0, 0, 0, 800)),
  ],
  classAvg: { infantry: fwgs(80, 20, 20), armoured: fwgs(120, 0, 60), artillery: fwgs(0, 350, 200), ship: fwgs(0, 250, 50), structure: fwgs(0, 150), other: fwgs(60, 40, 20) },
};

const mmf = (manpower = 0, munitions = 0, fuel = 0) => ({ manpower, munitions, fuel });

export const COH: GameCosts = {
  id: 'coh',
  label: 'Company of Heroes',
  currency: 'res',
  resources: ['manpower', 'munitions', 'fuel'],
  exchange: { manpower: 1, munitions: 2, fuel: 3 },
  exchangeNote: 'Munitions 2 and fuel 3 manpower: their income is about a half and a third of manpower.',
  realWorld: false,
  sources: { wiki: 'Company of Heroes 2/3 unit costs (coh2.org stats, CoH3 wiki), approximate across factions' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [
    u(/conscript/, mmf(240)), u(/rifle/, mmf(280)), u(/grenadier/, mmf(240)), u(/panzergrenadier|pgren/, mmf(340)),
    u(/pioneer|engineer|sapper/, mmf(200)), u(/sniper/, mmf(340)), u(/mg42|mg34|maxim|hmg|vickers|m1919/, mmf(260)),
    u(/mortar/, mmf(240)), u(/atgun|pak|zis|57mm|6pdr|17pdr/, mmf(320)), u(/t3476|t34/, mmf(280, 0, 85)),
    u(/sherman/, mmf(340, 0, 100)), u(/panzeriv|p4|pziv/, mmf(350, 0, 105)), u(/panther/, mmf(490, 0, 175)),
    u(/tiger/, mmf(640, 0, 230)), u(/kingtiger/, mmf(800, 0, 260)), u(/is2/, mmf(640, 0, 230)), u(/stug/, mmf(320, 0, 90)),
    u(/halftrack|m3|sdkfz251|251/, mmf(220, 0, 15)), u(/puma|222|scoutcar|m8/, mmf(240, 0, 40)), u(/jeep|kubel/, mmf(220)),
  ],
  classAvg: { infantry: mmf(270), armoured: mmf(260, 0, 40), tank: mmf(400, 0, 130), artillery: mmf(300, 0, 60), spaa: mmf(280, 0, 60), structure: mmf(200, 0, 20), other: mmf(250, 0, 30) },
};

const gl = (gold: number, lumber = 0) => ({ gold, lumber });

export const WC3: GameCosts = {
  id: 'wc3',
  label: 'Warcraft III',
  currency: 'res',
  resources: ['gold', 'lumber'],
  exchange: { gold: 1, lumber: 1.5 },
  exchangeNote: 'Lumber weighed 1.5 gold: scarcer in most builds.',
  realWorld: false,
  sources: { wiki: 'Warcraft III Reforged unit costs (Liquipedia, patch 1.36)' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [
    u(/peasant|peon|acolyte/, gl(75)), u(/wisp/, gl(60)), u(/footman/, gl(135)), u(/rifleman/, gl(205, 30)), u(/knight/, gl(245, 60)),
    u(/priest/, gl(135, 10)), u(/sorceress/, gl(155, 20)), u(/gryphon/, gl(280, 70)), u(/mortarteam/, gl(180, 70)),
    u(/grunt/, gl(200)), u(/headhunter|troll/, gl(135, 20)), u(/tauren/, gl(280, 80)), u(/raider/, gl(180, 40)), u(/wyvern/, gl(265, 40)),
    u(/ghoul/, gl(120)), u(/cryptfiend/, gl(215, 40)), u(/abomination/, gl(240, 70)), u(/frostwyrm/, gl(385, 120)), u(/gargoyle/, gl(185, 30)),
    u(/archer/, gl(130, 10)), u(/huntress/, gl(195, 20)), u(/dryad/, gl(145, 60)), u(/bear|druidoftheclaw/, gl(255, 80)), u(/chimaera/, gl(330, 70)),
    u(/townhall|greathall|necropolis|treeoflife/, gl(385, 205)), u(/farm|burrow|ziggurat|moonwell/, gl(80, 20)),
  ],
  classAvg: { infantry: gl(170, 20), armoured: gl(250, 60), fighter: gl(280, 60), artillery: gl(200, 70), structure: gl(160, 60), other: gl(180, 40) },
};

export const FAF: GameCosts = {
  id: 'faf',
  label: 'Supreme Commander / FAF',
  currency: 'res',
  resources: ['mass', 'energy'],
  exchange: { mass: 1, energy: 1 / 100 },
  exchangeNote: 'Energy weighed 1/100 mass: between the T2 and T3 mass fabricator rates.',
  realWorld: false,
  sources: { wiki: 'FAF unit database (class averages by tech level, order of magnitude)' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [u(/engineer/, { mass: 52, energy: 260 }), u(/commander|acu/, { mass: 18000, energy: 5000000 })],
  classAvg: {
    infantry: { mass: 60, energy: 300 },
    tank: { mass: 300, energy: 1500 },
    armoured: { mass: 120, energy: 600 },
    artillery: { mass: 400, energy: 2000 },
    spaa: { mass: 150, energy: 800 },
    fighter: { mass: 350, energy: 10000 },
    bomber: { mass: 400, energy: 12000 },
    ship: { mass: 1500, energy: 15000 },
    structure: { mass: 500, energy: 4000 },
    other: { mass: 200, energy: 1500 },
  },
  note: 'Class averages flagged.',
};

export const WARNO: GameCosts = {
  id: 'warno',
  label: 'Wargame / WARNO',
  currency: 'points',
  realWorld: false,
  sources: { wiki: 'WARNO / Wargame deck points (class averages from the armories)' },
  spawnIsSpent: true,
  items: [],
  classAvg: { infantry: 35, armoured: 50, tank: 150, artillery: 100, spaa: 70, helicopter: 110, fighter: 140, attack: 160, truck: 15, other: 50 },
  note: 'Class averages flagged.',
};

export const BROKEN_ARROW: GameCosts = {
  id: 'brokenarrow',
  label: 'Broken Arrow',
  currency: 'points',
  realWorld: false,
  sources: { wiki: 'Broken Arrow deployment points (class averages)' },
  spawnIsSpent: true,
  items: [],
  classAvg: { infantry: 40, armoured: 70, tank: 180, artillery: 130, spaa: 90, helicopter: 140, fighter: 200, attack: 220, truck: 20, other: 60 },
  note: 'Class averages flagged.',
};

export const GENERALS: GameCosts = {
  id: 'generals',
  label: 'C&C Generals Zero Hour',
  currency: 'credits',
  realWorld: false,
  sources: { wiki: 'C&C Generals Zero Hour unit costs (INI data, patch 1.04)' },
  spawnIsSpent: true,
  earn: { gather: true },
  items: [
    credits(225, /ranger/), credits(300, /missiledefender/), credits(700, /humvee/), credits(900, /crusader/), credits(1100, /paladin/),
    credits(1200, /tomahawk/), credits(1500, /comanche/), credits(1400, /raptor/), credits(2500, /aurora/), credits(1000, /dozer/),
    credits(300, /redguard/), credits(300, /tankhunter/), credits(800, /battlemaster/), credits(2000, /overlord/), credits(800, /gatling|gattling/),
    credits(900, /infernocannon/), credits(1600, /nukecannon/), credits(1200, /^mig/), credits(1400, /troopcrawler/), credits(800, /dragontank/),
    credits(150, /rebel/), credits(300, /rpgtrooper/), credits(500, /technical/), credits(600, /scorpion/), credits(800, /marauder/),
    credits(700, /quadcannon/), credits(900, /rocketbuggy/), credits(1200, /scud/), credits(200, /worker/), credits(600, /supplytruck|chinook/),
    credits(500, /barracks/), credits(2000, /warfactory|supplycenter|supplycentre/), credits(800, /powerplant|reactor/),
  ],
  classAvg: { infantry: 250, armoured: 700, tank: 900, artillery: 1100, spaa: 800, helicopter: 1300, fighter: 1400, structure: 1000, other: 600 },
};

export const RTS_TABLES: readonly GameCosts[] = [SC2, BAR, OPENRA, AOE2, AOE4, COH, WC3, FAF, WARNO, BROKEN_ARROW, GENERALS];
