/**
 * What a weapon is, from the name a DCS World recording or an IL-2 mission
 * report gives it: its calibre (mm), its type in the words the hit analysis
 * groups by (`AP`, `HEI`, `APFSDS`, `missile ARH AAM`, `bomb GP`...) and
 * whether it is a gun round, a rocket, a missile or a bomb. Neither source
 * says these per hit; they name the round.
 *
 *   DCS World  shells as the game's own ids (`weapons.shells.M61_20_HE_gr`,
 *              `2A46M_125_AP`, `7_62x51tr`): the calibre is in the id for
 *              almost all of them, the type in its suffix; missiles, rockets
 *              and bombs by their ids (`AIM_120C`, `C_8`, `GBU_12`), typed
 *              by a short list of public figures (seeker, diameter)
 *   IL-2       `BULLET_GER_792x57_SS`, `SHELL_RUS_37x195_AP`, `BOMB_SC250`,
 *              `ROCKET_RS82`: nation, calibre x case, type
 *
 * Every answer says where it is from (`src`): `name` (read from the id
 * itself), `table` (the public figures below), or nothing found (`unknown`).
 * Nothing of a game's own files is in here.
 */

export type AmmoKind = 'round' | 'rocket' | 'missile' | 'bomb' | 'unknown';

export interface AmmoInfo {
  /** mm; null not known. */
  calibre: number | null;
  /** The type in the analysis' words ('' not known). */
  type: string;
  kind: AmmoKind;
  /** The round's own name, cleaned of the recorder's prefix. */
  name: string;
  src: 'name' | 'table' | 'unknown';
}

/** Calibres (mm) a gun of these games fires, for telling a calibre from a model number in an id (`UOF_17_100HE`). */
const CALIBRES = new Set([15, 20, 23, 25, 27, 30, 35, 37, 40, 45, 57, 73, 75, 76, 85, 88, 90, 100, 105, 115, 120, 122, 125, 130, 152, 155, 203]);

/** DCS shells whose id holds no calibre, by a word of the id (public calibres of the round named). */
const DCS_SHELL_CALIBRE: [RegExp, number][] = [
  [/^53-u[a-z]+-281/, 57],
  [/^m230/, 30],
  [/^m56a3|^m53_apt|^m50a|pgu28|^m61_/, 20],
  [/^pgu(20|22|23|25|32)/, 25],
  [/^hispano/, 20],
  [/^mk_?108|^mingr/, 30],
  [/^vog.?17/, 30],
  [/^vog.?25|hedpm430|^m430|^m433/, 40],
  [/british ?303|^br303|_303/, 7.7],
  [/50browning|_50_aero|^m2_50|^m20_50|^m8_50/, 12.7],
];

/** A DCS shell id's type: its suffix as the analysis' words. */
function dcsShellType(id: string): string {
  const s = id.toLowerCase();
  if (/apfsds|_bm\d|3bm\d|ubm|dm53|dm33|m829/.test(s) || /^m256_120_ap|^2a46m?_125_ap/.test(s)) return 'APFSDS';
  if (/apds/.test(s)) return 'APDS';
  if (/heat|hedp|_mp_/.test(s)) return 'HEAT';
  if (/saphei|pgu28/.test(s)) return 'SAPHEI';
  if (/mgsch|mingr/.test(s)) return 'HE (mine)';
  if (/_sap/.test(s)) return 'SAP';
  if (/apit|api_?t/.test(s)) return 'APIT';
  if (/api\b|_api|api$/.test(s)) return 'API';
  if (/aphe|ubr/.test(s)) return 'APHE';
  if (/(^|_)ap(_|$|t|\b)|_ap\d|_ap$|\dap$/.test(s) || /ap_gr|_ap_/.test(s)) return 'AP';
  if (/heit|hei_?t/.test(s)) return 'HEIT';
  if (/hei/.test(s)) return 'HEI';
  if (/pfhe|ahead/.test(s)) return 'HE (proximity)';
  if (/(^|_|\d)he|uof|uor|_of|frag|sprgr|mingr|vog|ks19/.test(s)) return 'HE';
  if (/_tp\b|_tp$|_tp_/.test(s)) return 'practice';
  if (/notr/.test(s)) return 'ball';
  if (/tr$|_t$|_tr\b|_t_|tracer|_g_mk/.test(s)) return 'ball (tracer)';
  if (/_i$|_i_|_b_mk|_w_mk|incend/.test(s)) return 'incendiary';
  if (/ball|x\d+$/.test(s)) return 'ball';
  return '';
}

/** A calibre written in an id: `7_62x51`, `12_7x108`, `23x115`, `40mm`, or a calibre between underscores (`M61_20_HE`). */
function calibreInId(id: string): number | null {
  const s = id.toLowerCase();
  let m = /(?:^|[^0-9])(5|7|12|14)_(45|56|62|92|7|5)x\d+/.exec(s);
  if (m) return Number(`${m[1]}.${m[2]}`);
  m = /(?:^|[^0-9])(\d{1,3})x\d{2,3}/.exec(s);
  if (m) return Number(m[1]);
  m = /(?:^|_)(5|7|12|14)_(45|56|62|7|5)(?:_|$|[a-z])/.exec(s);
  if (m) return Number(`${m[1]}.${m[2]}`);
  m = /(\d{2,3})\s?mm/.exec(s);
  if (m && CALIBRES.has(Number(m[1]))) return Number(m[1]);
  for (const g of s.matchAll(/(?:^|_)(\d{2,3})(?=_|[a-z]|$)/g)) if (CALIBRES.has(Number(g[1]))) return Number(g[1]);
  return null;
}

/** DCS missiles, rockets and bombs by id: their type and diameter (public figures), most named first. */
const DCS_WEAPONS: [RegExp, string, number | null][] = [
  // Air to air.
  [/aim.?120|r.?77\b|p_77|sd.?10|pl.?12|mica.?r|meteor|aim.?54|r.?37m/, 'missile ARH AAM', null],
  [/aim.?7|r.?3r\b|p_27pe?\b|r.?27e?r|super.?530|r_530|p_24r|sky.?flash|aspide/, 'missile SARH AAM', null],
  [/aim.?9|r.?73\b|p_73|r.?60|r-?13|r.?3s|r_550|magic|pl.?5|pl.?8|rb ?24|gar.?8|p_60|p_27te?\b|p_24t|r.?27e?t|mica.?t|iris.?t(?!.?sl)|aim.?132/, 'missile IR AAM', null],
  [/rs2us|rs.?2u/, 'missile beam AAM', null],
  // Surface to air.
  [/^sa\d|^sa[_-]|roland|hawk|mim_|patriot|sm_?2|seasparrow|rapier|hq.?\d|5v\d|48h6|9m3\d|9m311|9m33|57e6|iris.?t.?sl|crotale/, 'missile SAM', null],
  [/fim.?92|stinger|igla|mistral|9m313|9m39|9m342|strela|9m31\b/, 'missile MANPADS', null],
  // Air to ground.
  [/agm.?88|agm.?45|agm.?122|kh.?58|x_58|x_25mp|ld.?10|alarm|harm/, 'missile anti-radiation', null],
  [/agm.?114|hellfire|vikhr|tow|at.?6|ataka|9m120|9m220|konkurs|malutka|malyutka|hot\d?|milan|kornet|9m117|reflex|9m119|spike/, 'missile ATGM', null],
  [/agm.?65|maverick|x_29|kh.?29|x_25ml|kh.?25|s_25l|c_701|agm.?62|rb.?75|agm.?84|harpoon|slam|exocet|kh.?31|kh.?35|kh.?59|kh.?66/, 'missile AGM', null],
  [/agr.?20|apkws/, 'rocket guided', 70],
  [/brm.?1/, 'rocket guided', 90],
  [/m31\b|gmlrs/, 'rocket guided', 227],
  [/m48\b|atacms/, 'rocket guided', 610],
  [/agm.?154|jsow|ls.?6|gb.?6|bk.?90|adm.?141/, 'bomb glide', null],
  // Rockets: diameters.
  [/^c_8|^s.?8/, 'rocket', 80],
  [/^c_13|^s.?13/, 'rocket', 122],
  [/^c_5|^s.?5/, 'rocket', 57],
  [/^c_24|^s.?24/, 'rocket', 240],
  [/^c_25|^s.?25/, 'rocket', 340],
  [/hydra|ffar/, 'rocket', 70],
  [/zuni|hvar/, 'rocket', 127],
  [/sneb/, 'rocket', 68],
  [/3inch|rp.?3/, 'rocket', 76.2],
  [/uragan|9m27/, 'rocket', 220],
  [/pg.?16|pg.?9/, 'rocket', 73],
  // Bombs.
  [/gbu|kab|paveway|jdam|bk90|bunker/, 'bomb guided', null],
  [/cbu|blg.?66|rbk|bl.?755|cluster|samp.*(cl|gr)/, 'bomb cluster', null],
  [/mk.?8\d|m.?117|fab|ofab|br.?\d|samp|blu|sc.?\d|sd.?\d|an.?m\d|british_gp|bomb/, 'bomb GP', null],
];

const typeKind = (t: string): AmmoKind => (t.startsWith('missile') ? 'missile' : t.startsWith('rocket') ? 'rocket' : t.startsWith('bomb') ? 'bomb' : 'unknown');

/** A DCS weapon by the name a Tacview recording gives it and its Tacview type (`Projectile+Shell`, `Weapon+Missile`...). */
export function dcsAmmo(name: string, tacviewType = ''): AmmoInfo {
  const id = name.replace(/^(weapons|supply)\.(shells|missiles|bombs|nurs)\./i, '').trim();
  const low = id.toLowerCase();
  const shell = /shell|bullet/i.test(tacviewType) || /^weapons\.shells\./i.test(name);
  if (/^supply\./i.test(name)) return { calibre: null, type: 'supply', kind: 'unknown', name: id, src: 'unknown' };
  if (shell) {
    let cal = calibreInId(id);
    let src: AmmoInfo['src'] = cal === null ? 'unknown' : 'name';
    if (cal === null)
      for (const [re, c] of DCS_SHELL_CALIBRE)
        if (re.test(low)) {
          cal = c;
          src = 'table';
          break;
        }
    // No type word: a small-arms round is ball, a gun's of 75 mm and up most likely high explosive.
    const type = dcsShellType(id) || (cal !== null && cal <= 15 ? 'ball' : cal !== null && cal >= 75 ? 'HE' : '');
    return { calibre: cal, type, kind: 'round', name: id, src: cal !== null || type ? src === 'unknown' ? 'name' : src : 'unknown' };
  }
  for (const [re, type, dia] of DCS_WEAPONS)
    if (re.test(low)) {
      const kind = typeKind(type);
      // A weapon type the recorder wrote wins over the table's kind where they differ (a rocket named like a missile).
      const k = /rocket/i.test(tacviewType) && kind !== 'rocket' && !/guided/.test(type) ? 'rocket' : /bomb/i.test(tacviewType) && kind !== 'bomb' ? 'bomb' : kind;
      return { calibre: dia, type: k === kind ? type : k, kind: k, name: id, src: 'table' };
    }
  const k: AmmoKind = /missile/i.test(tacviewType) ? 'missile' : /rocket/i.test(tacviewType) ? 'rocket' : /bomb/i.test(tacviewType) ? 'bomb' : 'unknown';
  return { calibre: null, type: k === 'unknown' ? '' : k, kind: k, name: id, src: 'unknown' };
}

/** IL-2 ammunition words to the analysis' types. */
const IL2_TYPES: [RegExp, string][] = [
  [/apcr|hvap|pzgr40|bk|_apcr/, 'APCR'],
  [/apit|api_?t|bzt/, 'APIT'],
  [/api\b|_api|bz\b|_bz|b32/, 'API'],
  [/aphe|pzgr\b|pzgr39|_br|apbc/, 'APHE'],
  [/_ap\b|_ap_|_ap$|ap_t|_apt/, 'AP'],
  [/mgsch|minengeschoss|_mg\b/, 'HE (mine)'],
  [/hei_?t|het\b|_het|ofzt/, 'HEIT'],
  [/hei\b|_hei|_i\b|_ofz|_oz/, 'HEI'],
  [/_he\b|_he_|_he$|sprgr|_of\b|_of_|_f\b|_o\b|frag/, 'HE'],
  [/_t\b|_t$|_tr|tracer|_spur/, 'ball (tracer)'],
  [/_ss\b|_ss$|_ball|_ps\b|_l\b|_lps|_sms/, 'ball'],
];

/** An IL-2 mission report's AMMO word (`BULLET_GER_792x57_SS`, `SHELL_RUS_37x195_AP`, `BOMB_SC250`, `ROCKET_RS82`). */
export function il2Ammo(word: string): AmmoInfo {
  const name = word.trim();
  const s = name.toLowerCase();
  if (/^bomb/.test(s)) {
    const m = /(?:sc|sd|fab|an.?m|ptab|gp)\D?(\d{2,4})/.exec(s);
    return { calibre: null, type: /ptab|ab\d|cluster/.test(s) ? 'bomb cluster' : 'bomb GP', kind: 'bomb', name: m ? name : name, src: 'name' };
  }
  if (/^rocket/.test(s)) {
    const m = /rs.?(\d{2,3})|rbs.?(\d{2,3})|m8|rp.?3|wfr|r4m/.exec(s);
    const cal = m ? (m[1] ? Number(m[1]) : m[2] ? Number(m[2]) : /m8/.test(m[0]) ? 114 : /rp/.test(m[0]) ? 76.2 : /wfr/.test(m[0]) ? 210 : 55) : null;
    return { calibre: cal, type: 'rocket', kind: 'rocket', name, src: cal !== null ? 'name' : 'unknown' };
  }
  if (!/^(bullet|shell)/.test(s)) return { calibre: null, type: '', kind: 'unknown', name, src: 'unknown' };
  let cal: number | null = null;
  const m = /_(\d{2,3})x(\d{2,3})/.exec(s);
  if (m) {
    const a = Number(m[1]);
    // 792x57 is 7.92 mm, 127x99 12.7 mm, 145x114 14.5 mm, 77x56 (.303) 7.7 mm; 20x82, 37x195 as written.
    cal = a >= 500 ? a / 100 : a >= 100 && a < 200 && !CALIBRES.has(a) ? a / 10 : a === 77 || a === 76 ? a / 10 : a;
    if (a === 762 || a === 769) cal = a / 100;
  }
  let type = '';
  for (const [re, t] of IL2_TYPES)
    if (re.test(s)) {
      type = t;
      break;
    }
  return { calibre: cal, type, kind: 'round', name, src: cal !== null || type ? 'name' : 'unknown' };
}
