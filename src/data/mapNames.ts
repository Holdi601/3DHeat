/**
 * A level's name as a person would say it, from the name its extractor gave
 * the file (`avg_netherlands` -> "Netherlands", `MP_Prison` -> "Operation
 * Locker", `de_dust2` -> "Dust II"): the game's prefixes and suffixes left out,
 * the words spaced and capitalised. Names the file cannot tell (Battlefield 4's
 * code names) come from a short list; anything unknown is still readable.
 */

import { t } from '../i18n';
import { canonGame, gameName } from '../library/games';

/** A game's levels folder (`warthunder`, `battlefield-4`) as a name: the game's own ("War Thunder"), else its folder's words. */
export function folderGameName(folder: string): string {
  const id = canonGame(folder);
  return id ? gameName(id) : titleWords(folder);
}

/** Battlefield 4's code names, as the maps are called in the game. */
const BF4: Record<string, string> = {
  mp_abandoned: 'Zavod 311',
  mp_damage: 'Lancang Dam',
  mp_flooded: 'Flood Zone',
  mp_journey: 'Golmud Railway',
  mp_naval: 'Paracel Storm',
  mp_playground: 'Test Range',
  mp_prison: 'Operation Locker',
  mp_resort: 'Hainan Resort',
  mp_siege: 'Siege of Shanghai',
  mp_thedish: 'Rogue Transmission',
  mp_tremors: 'Dawnbreaker',
  xp0_caspian: 'Caspian Border 2014',
  xp0_firestorm: 'Operation Firestorm 2014',
  xp0_metro: 'Operation Metro 2014',
  xp0_oman: 'Gulf of Oman 2014',
  xp1_001: 'Silk Road',
  xp1_002: 'Altai Range',
  xp1_003: 'Guilin Peaks',
  xp1_004: 'Dragon Pass',
  xp2_001: 'Lost Islands',
  xp2_002: 'Nansha Strike',
  xp2_003: 'Wave Breaker',
  xp2_004: 'Operation Mortar',
  xp3_marketpl: 'Pearl Market',
  xp3_prpganda: 'Propaganda',
  xp3_urbangdn: 'Lumphini Garden',
  xp3_wtrfront: 'Sunken Dragon',
  xp4_arctic: 'Operation Whiteout',
  xp4_subbase: 'Hammerhead',
  xp4_titan: 'Hangar 21',
  xp4_wlkrftry: 'Giants of Karelia',
  xp5_night_01: 'Zavod: Graveyard Shift',
  xp6_cmp: 'Operation Outbreak',
  xp7_valley: 'Dragon Valley 2015',
};

/** Words written in capitals or another way than capitalised. */
const WORDS: Record<string, string> = { ii: 'II', iii: 'III', usa: 'USA', uk: 'UK', ussr: 'USSR', ww2: 'WW2', vr: 'VR', cw: 'Cold War', wwii: 'WWII' };

/** `some_level-name` as `Some Level Name`; a word already mixed case (`GermanyCW`) split where its case changes. */
export function titleWords(raw: string): string {
  return raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\d)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_\-.]+/)
    .filter(Boolean)
    .map((w) => WORDS[w.toLowerCase()] ?? (w.length > 1 && w === w.toUpperCase() && !/\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

const CS2: Record<string, string> = { dust2: 'Dust II' };

/** IL-2's season letters at the end of a map's name. */
const SEASON: Record<string, 'winter' | 'summer' | 'autumn' | 'spring'> = { w: 'winter', s: 'summer', su: 'summer', a: 'autumn', au: 'autumn', sp: 'spring' };

/**
 * A level's name to show, from its game's folder and the name the extractor gave it (its file's stem), and its path
 * under the levels folder where the folders say more (`dcs/Caucasus/r1/Caucasus_r1.glb`).
 */
export function mapTitle(game: string, name: string, path = ''): string {
  const preview = /-\d+m-preview$/i.test(name) || /(^|\/)preview\//i.test(path);
  const n = name.replace(/-\d+m-preview$/i, '');
  const lower = n.toLowerCase();
  let title: string;
  if (game === 'battlefield-4' && BF4[lower]) title = BF4[lower];
  else if (/^battlefield/.test(game)) title = titleWords(n.replace(/^(mp|xp\d+)_/i, '').replace(/_textured_ground_nav$/i, ''));
  else if (game === 'warthunder') {
    const air = /^air_/i.test(n);
    const name = titleWords(n.replace(/^(avg|avn|air|arcade)_/i, ''));
    title = air ? t('catalog.mapAir', { map: name }) : name;
  } else if (game === 'cs2') {
    const m = /^(de|cs|ar|dz|gd)_(.+)$/i.exec(n);
    title = m ? (CS2[m[2].toLowerCase()] ?? titleWords(m[2])) : titleWords(n);
  } else if (game === 'r6') title = titleWords(n.replace(/^r6_/i, ''));
  else if (game === 'il2') {
    const m = /^landscape_(.+?)(?:_(w|s|su|a|au|sp))?$/i.exec(n);
    title = m && m[2] ? t('catalog.mapSeason', { map: titleWords(m[1]), season: t(`catalog.season.${SEASON[m[2].toLowerCase()]}`) }) : titleWords(m ? m[1] : n);
  } else if (game === 'dcs') {
    // A theatre's region (`Caucasus_r1`) or a place in it (`Caucasus_Beslan`).
    const m = /^([^_]+)_(.+)$/.exec(n);
    if (m && /^r\d+$/i.test(m[2])) title = t('catalog.mapRegion', { theatre: titleWords(m[1]), region: m[2].slice(1) });
    else title = m ? `${titleWords(m[1])}, ${titleWords(m[2])}` : titleWords(n);
  } else title = titleWords(n);
  return preview ? t('catalog.mapPreview', { map: title }) : title;
}
