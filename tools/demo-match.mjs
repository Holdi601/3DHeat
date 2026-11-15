/**
 * A CS2-style match summary (`.match.json`, version 2, docs/match-analysis.md)
 * on the demo yard: teams Blue and Red, 24 rounds, kills, economy, plants and a
 * scoreboard, all synthetic, players named like the shooter demo (Blue 1 ...).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = rng(77123);
const pick = (l) => l[Math.floor(R() * l.length)];
const WEAPONS = ['ak47', 'm4a1', 'awp', 'mp9', 'deagle', 'galil'];
const PLACES = ['Left Lane', 'Mid', 'Right Lane', 'Site A', 'Site B', 'Yard Wall', 'Blue Gate'];
const FULL = { T: 4350, CT: 4900 };

export default async function (outDir) {
  const teams = ['Blue', 'Red'];
  const names = { Blue: [1, 2, 3, 4, 5].map((i) => `Blue ${i}`), Red: [1, 2, 3, 4, 5].map((i) => `Red ${i}`) };
  const stat = {};
  for (const t of teams) for (const n of names[t]) stat[n] = { name: n, steamid: `demo-${n.replace(' ', '-').toLowerCase()}`, team: t, kills: 0, deaths: 0, assists: 0, flashAssists: 0, hs: 0, openK: 0, openD: 0, tradeK: 0, tradedD: 0, clutches: 0, clutchesWon: 0, plants: 0, defuses: 0, dmg: 0, kastRounds: 0 };
  const score = { Blue: 0, Red: 0 };
  const rounds = [];
  let clock = 100;
  for (let n = 1; n <= 24; n++) {
    const secondHalf = n > 12;
    const sides = secondHalf ? { Blue: 'CT', Red: 'T' } : { Blue: 'T', Red: 'CT' };
    const winnerTeam = R() < 0.54 ? 'Blue' : 'Red';
    const winner = sides[winnerTeam];
    const loserTeam = winnerTeam === 'Blue' ? 'Red' : 'Blue';
    const planted = sides.Blue === 'T' ? true : true;
    const tTeam = teams.find((t) => sides[t] === 'T');
    const reason = winner === 'T' ? (R() < 0.55 ? 'bomb' : 'elimination') : R() < 0.3 ? 'defuse' : R() < 0.5 ? 'time' : 'elimination';
    const alive = { Blue: [...names.Blue], Red: [...names.Red] };
    const kills = [];
    let t = 14;
    const nKills = reason === 'time' ? 3 + Math.floor(R() * 3) : 5 + Math.floor(R() * 4);
    for (let k = 0; k < nKills; k++) {
      const attTeam = k === 0 ? (R() < 0.5 ? winnerTeam : loserTeam) : R() < 0.65 ? winnerTeam : loserTeam;
      const vicTeam = attTeam === 'Blue' ? 'Red' : 'Blue';
      if (alive[attTeam].length < 1 || alive[vicTeam].length < 1) break;
      if (alive[vicTeam].length === 1 && attTeam === loserTeam && reason === 'elimination') continue;
      const a = pick(alive[attTeam]);
      const v = pick(alive[vicTeam]);
      alive[vicTeam] = alive[vicTeam].filter((x) => x !== v);
      t += 4 + R() * 14;
      const hs = R() < 0.4;
      const pa = R() < 0.25 ? pick(alive[attTeam]) : null;
      const assister = pa !== a ? pa : null;
      if (assister) stat[assister].assists++;
      const prev = kills[kills.length - 1];
      const traded = false;
      kills.push({
        time: +t.toFixed(1), attacker: a, attackerSide: sides[attTeam], victim: v, victimSide: sides[vicTeam], assister,
        flashAssist: false, weapon: pick(WEAPONS), headshot: hs, wallbang: R() < 0.05, throughSmoke: R() < 0.06, opening: k === 0, traded, trade: !!prev && prev.attackerSide !== sides[attTeam] && t - prev.time < 5 && prev.victim !== v ? true : false,
        teamkill: false, suicide: false, noscope: false, attackerBlind: false, after: false, place: pick(PLACES),
      });
      stat[a].kills++; stat[v].deaths++;
      if (hs) stat[a].hs++;
      if (k === 0) { stat[a].openK++; stat[v].openD++; }
    }
    score[winnerTeam]++;
    const survivors = { T: alive[tTeam], CT: alive[tTeam === 'Blue' ? 'Red' : 'Blue'] };
    const plant = planted && (reason === 'bomb' || reason === 'defuse')
      ? { site: R() < 0.5 ? 'A' : 'B', time: +(30 + R() * 30).toFixed(1), player: pick(names[tTeam]), x: 10, y: 0, z: 40, place: 'Site A' }
      : null;
    if (plant) stat[plant.player].plants++;
    const start = clock;
    const len = Math.max(t + 6, plant ? plant.time + 40 : 60);
    clock += len + 20;
    const eco = n === 1 || n === 13 ? 'pistol' : R() < 0.2 ? 'eco' : R() < 0.25 ? 'force' : 'full';
    rounds.push({
      number: n, start: +start.toFixed(1), end: +(start + len).toFixed(1), until: +(start + len + 7).toFixed(1),
      winner, winnerTeam, reason, score: { ...score }, sides,
      equipment: eco === 'pistol' ? { T: 800, CT: 800 } : eco === 'eco' ? { T: 900, CT: FULL.CT } : { T: FULL.T, CT: FULL.CT - (R() < 0.3 ? 1500 : 0) },
      buy: eco === 'pistol' ? { T: 'pistol', CT: 'pistol' } : { T: eco, CT: 'full' },
      plant, survivors, clutches: [], kills,
    });
    for (const team of teams) for (const nm of names[team]) if (alive[team].includes(nm)) stat[nm].kastRounds++;
  }
  const players = Object.values(stat).map((s) => ({
    name: s.name, steamid: s.steamid, team: s.team, kills: s.kills, deaths: s.deaths, assists: s.assists, flashAssists: 0, diff: s.kills - s.deaths,
    adr: +(s.kills * 82 / 24 + 12).toFixed(1), kast: Math.min(95, Math.round(100 * (s.kastRounds + s.kills) / 36)), headshotPct: s.kills ? Math.round((100 * s.hs) / s.kills) : 0,
    openingKills: s.openK, openingDeaths: s.openD, tradeKills: 0, tradedDeaths: 0, multiKills: { 2: 2, 3: 1 }, clutches: 0, clutchesWon: 0,
    utilityDamage: 20, enemiesFlashed: 3, plants: s.plants, defuses: 0, teamkills: 0, roundsPlayed: 24,
  }));
  const doc = { format: 'heat3d-cs2-match', version: 2, match: 'Demo Yard Final', map: 'Demo Yard', demos: ['demo-yard.dem'], teams, score, rounds, incomplete: [], halfLength: 12, pistolRounds: [1, 13], players };
  writeFileSync(join(outDir, 'demo-yard.match.json'), JSON.stringify(doc));
  console.log(`match: demo-yard.match.json, ${rounds.length} rounds, ${score.Blue}-${score.Red}`);
}
