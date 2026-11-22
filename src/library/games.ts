/**
 * How the Library names and marks games, kinds and numbers: a game's name,
 * its short mark and colour (a plain monogram, never a game's own logo), and
 * sizes, lengths and dates the way the viewer writes them.
 */

import { num, t } from '../i18n';

interface GameInfo {
  name: string;
  mark: string;
  hue: number;
}

const GAMES: Record<string, GameInfo> = {
  warthunder: { name: 'War Thunder', mark: 'WT', hue: 12 },
  dcs: { name: 'DCS World', mark: 'DCS', hue: 205 },
  cs2: { name: 'Counter-Strike 2', mark: 'CS2', hue: 38 },
  dota2: { name: 'Dota 2', mark: 'D2', hue: 355 },
  r6: { name: 'Rainbow Six Siege', mark: 'R6', hue: 220 },
  wows: { name: 'World of Warships', mark: 'WoWs', hue: 190 },
  wot: { name: 'World of Tanks', mark: 'WoT', hue: 28 },
  squad: { name: 'Squad', mark: 'SQ', hue: 95 },
  il2: { name: 'IL-2 Sturmovik', mark: 'IL2', hue: 48 },
  bf6: { name: 'Battlefield 6', mark: 'BF6', hue: 25 },
  bf4: { name: 'Battlefield 4', mark: 'BF4', hue: 200 },
  bf1: { name: 'Battlefield 1', mark: 'BF1', hue: 30 },
  forza: { name: 'Forza', mark: 'FZ', hue: 330 },
  acrally: { name: 'Assetto Corsa Rally', mark: 'ACR', hue: 0 },
  beamng: { name: 'BeamNG.drive', mark: 'BNG', hue: 25 },
  reforger: { name: 'Arma Reforger', mark: 'AR', hue: 80 },
  hllv: { name: 'Hell Let Loose: Vietnam', mark: 'HLL', hue: 60 },
  lol: { name: 'League of Legends', mark: 'LoL', hue: 45 },
  valorant: { name: 'VALORANT', mark: 'VAL', hue: 350 },
  bms: { name: 'Falcon BMS', mark: 'BMS', hue: 210 },
  unreal: { name: 'Unreal level', mark: 'UE', hue: 260 },
};

/** The Library's game id for a name an extractor or a file uses (`War Thunder`, `battlefield-6`). */
export function canonGame(raw: string | null | undefined): string {
  if (!raw) return '';
  const s = raw.trim().toLowerCase().replace(/[_ .]+/g, '-');
  const alias: Record<string, string> = {
    'war-thunder': 'warthunder', wt: 'warthunder', 'dcs-world': 'dcs', 'counter-strike-2': 'cs2', csgo: 'cs2', dota: 'dota2', 'dota-2': 'dota2',
    'rainbow-six-siege': 'r6', siege: 'r6', 'world-of-warships': 'wows', 'world-of-tanks': 'wot', 'il-2': 'il2', 'il-2-sturmovik': 'il2',
    'battlefield-6': 'bf6', 'battlefield-4': 'bf4', 'battlefield-1': 'bf1', 'forza-horizon': 'forza', 'forza-motorsport': 'forza',
    'assetto-corsa-rally': 'acrally', 'beamng-drive': 'beamng', 'arma-reforger': 'reforger', 'league-of-legends': 'lol',
  };
  if (alias[s]) return alias[s];
  return GAMES[s] ? s : '';
}

export function gameName(id: string | null | undefined): string {
  if (!id) return t('library.game.unknown');
  return GAMES[id]?.name ?? id;
}

export function gameMark(id: string | null | undefined): { mark: string; hue: number } {
  if (!id) return { mark: '?', hue: 220 };
  const g = GAMES[id];
  if (g) return { mark: g.mark, hue: g.hue };
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return { mark: id.slice(0, 3).toUpperCase(), hue: h };
}

/** A size in bytes, as KB, MB, GB. */
export function size(b: number): string {
  if (b < 1024) return `${b} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = b / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${num(v, v < 10 ? 1 : 0)} ${units[i]}`;
}

/** A length in seconds, as 12:34 or 1:02:03. */
export function length(s: number | null | undefined): string {
  if (s === null || s === undefined || !Number.isFinite(s)) return '';
  const total = Math.round(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const two = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`;
}

/** Hours, for the totals line. */
export function hours(s: number): string {
  return num(s / 3600, s < 36_000 ? 1 : 0);
}

const dateFmt = new Map<string, Intl.DateTimeFormat>();
/** A date (and time) in the browser's own way. */
export function date(ms: number | null | undefined, withTime = true): string {
  if (ms === null || ms === undefined) return '';
  const key = withTime ? 't' : 'd';
  let f = dateFmt.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(undefined, withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
    dateFmt.set(key, f);
  }
  return f.format(new Date(ms));
}

/** A kind's word. */
export function kindName(k: string): string {
  return t(`library.kind.${k}`);
}

/** A file format's word (`wrpl` is a War Thunder replay). */
export function formatName(f: string): string {
  const words: Record<string, string> = {
    '3dheat': '.3dheat',
    acmi: 'Tacview ACMI',
    parquet: 'Parquet',
    csv: 'CSV',
    wrpl: '.wrpl',
    dem: '.dem',
    rec: '.rec',
    wowsreplay: '.wowsreplay',
    wotreplay: '.wotreplay',
    'ue-replay': '.replay',
    rofl: '.rofl',
    glb: 'glTF',
    h3dcars: '.h3dcars',
    'model-pack': t('library.format.modelPack'),
    'figure-pack': t('library.format.figurePack'),
    watcher: t('library.format.watcher'),
  };
  return words[f] ?? f;
}
