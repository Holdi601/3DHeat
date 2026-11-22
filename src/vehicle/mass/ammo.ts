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
 *   IL-2       the game's object names, in its mission reports (`AMMO:`) and
 *              in the Tacview recordings it writes: `BULLET_GER_7-92x57_AP`,
 *              `SHELL_RUS_20x99_HE`, `SHELL_GER_75_CV`, `RKT_RUS_RBS82`,
 *              `BOMB_GER_SC250` (nation, calibre x case with `-` for the
 *              decimal point, type); older spellings (`BULLET_GER_792x57_SS`,
 *              `ROCKET_RS82`, `BOMB_SC250`) read the same
 *   DCS World  `supply.shells.N`: the rounds of the F-4E's M61A1 (a module's
 *              own shell table; the recordings show no other unit firing
 *              them), 20 mm, the belt slot not known
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

/**
 * Body diameters (mm) of DCS World missiles and bombs by id: the nominal body of the public figures (not fins, not a
 * booster stage), so a missile's calibre is comparable with a round's in the charts. A weapon not listed keeps none.
 */
const DCS_DIAMETERS: [RegExp, number][] = [
  // Air to air.
  [/aim.?120|meteor/, 178],
  [/aim.?54/, 380],
  [/aim.?7|sky.?flash|aspide/, 203],
  [/aim.?9|rb ?2?4|rb ?74|iris.?t(?!.?sl)|aim.?132|^r.?3[sr]\b|r-?13m|gar.?8/, 127],
  [/p_77|r.?77\b/, 200],
  [/p_27[pt]e|r.?27e[rt]/, 260],
  [/p_27|r.?27/, 230],
  [/p_73|r.?73\b/, 170],
  [/p_60|r.?60/, 120],
  [/p_33|r.?33/, 380],
  [/pl.?12|sd.?10/, 203],
  [/pl.?5/, 127],
  [/pl.?8/, 160],
  [/mica/, 160],
  [/magic|r_550/, 157],
  [/530/, 263],
  // Surface to air.
  [/fim.?92|stinger/, 70],
  [/igla|9m39|9m342/, 72],
  [/mistral/, 90],
  [/roland/, 160],
  [/hawk|mim.?23/, 370],
  [/mim.?104|patriot/, 410],
  [/mim.?72|chaparral/, 127],
  [/sm_?2/, 343],
  [/9m38/, 400],
  [/9m330|9m331\b/, 235],
  [/9m311/, 170],
  [/9m333|9m37\b|9m31$|9m31\b/, 120],
  [/9m33$|9m33\b/, 210],
  [/5b55|5v55/, 508],
  [/48h6/, 515],
  [/5b27|5v27/, 375],
  [/v755|v750/, 500],
  [/3m9/, 330],
  [/57e6/, 90],
  [/iris.?t.?sl/, 127],
  // Air to ground.
  [/agm.?65|maverick|rb.?75/, 305],
  [/agm.?114|hellfire/, 178],
  [/agm.?88|harm/, 254],
  [/agm.?45|shrike/, 203],
  [/agm.?12c/, 457],
  [/vikhr|ataka|9m120|9m220|at.?6|9m114/, 130],
  [/svir|reflex|9m119/, 125],
  [/tow/, 152],
  [/hot3/, 150],
  [/hot/, 136],
  [/x_29|kh.?29|x_58|kh.?58/, 380],
  [/x_25|kh.?25/, 275],
  [/s_25l/, 340],
  [/c_701/, 180],
  // Bombs: the bomb body (a guided kit on it the same).
  [/mk.?82|gbu.?12|gbu.?38|gbu.?54/, 273],
  [/mk.?83|gbu.?32|gbu.?16/, 356],
  [/mk.?84|gbu.?31|gbu.?10|gbu.?8\b|gbu_8_/, 457],
  [/gbu.?24|blu.?109/, 370],
  [/fab.?500/, 400],
  [/fab.?250/, 325],
];

/** A DCS weapon's diameter (mm) by its id, null not listed. */
function dcsDiameter(low: string): number | null {
  for (const [re, mm] of DCS_DIAMETERS) if (re.test(low)) return mm;
  return null;
}

/** DCS missiles, rockets and bombs by id: their type and diameter (public figures), most named first. */
const DCS_WEAPONS: [RegExp, string, number | null][] = [
  // Air to air.
  [/aim.?120|r.?77\b|p_77|sd.?10|pl.?12|mica.?r|meteor|aim.?54|r.?37m/, 'missile ARH AAM', null],
  [/aim.?7|r.?3r\b|p_27pe?\b|r.?27e?r|super.?530|r_530|p_24r|sky.?flash|aspide|p_33|r.?33/, 'missile SARH AAM', null],
  [/aim.?9|r.?73\b|p_73|r.?60|r-?13|r.?3s|r_550|magic|pl.?5|pl.?8|rb ?24|gar.?8|p_60|p_27te?\b|p_24t|r.?27e?t|mica.?t|iris.?t(?!.?sl)|aim.?132|rb ?74/, 'missile IR AAM', null],
  [/rs2us|rs.?2u/, 'missile beam AAM', null],
  // Surface to air.
  [/^sa\d|^sa[_-]|roland|hawk|mim_|patriot|sm_?2|seasparrow|rapier|hq.?\d|5v\d|48h6|9m3\d|9m311|9m33|57e6|iris.?t.?sl|crotale/, 'missile SAM', null],
  [/fim.?92|stinger|igla|mistral|9m313|9m39|9m342|strela|9m31\b/, 'missile MANPADS', null],
  // Air to ground.
  [/agm.?88|agm.?45|agm.?122|kh.?58|x_58|x_25mp|ld.?10|alarm|harm/, 'missile anti-radiation', null],
  [/agm.?114|hellfire|vikhr|tow|at.?6|ataka|9m120|9m220|konkurs|malutka|malyutka|hot\d?|milan|kornet|9m117|reflex|svir|9m119|spike/, 'missile ATGM', null],
  [/agm.?65|maverick|x_29|kh.?29|x_25ml|kh.?25|s_25l|c_701|agm.?62|rb.?75|agm.?84|harpoon|slam|exocet|kh.?31|kh.?35|kh.?59|kh.?66|agm.?12|bullpup/, 'missile AGM', null],
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
  [/arak/, 'rocket', 135],
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
  // IL-2's own Tacview recording: its object names, read as its mission reports' (`BULLET_GER_7-92x57_AP`).
  if (IL2_NAME.test(id)) return il2Ammo(id);
  // The F-4E's M61A1 rounds (a module's shell table, numbered): 20 mm, which belt slot not known.
  if (/^supply\.shells\./i.test(name)) return { calibre: 20, type: '', kind: 'round', name: name.trim(), src: 'table' };
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
      return { calibre: dia ?? dcsDiameter(low), type: k === kind ? type : k, kind: k, name: id, src: 'table' };
    }
  const k: AmmoKind = /missile/i.test(tacviewType) ? 'missile' : /rocket/i.test(tacviewType) ? 'rocket' : /bomb/i.test(tacviewType) ? 'bomb' : 'unknown';
  const dia = dcsDiameter(low);
  return { calibre: dia, type: k === 'unknown' ? '' : k, kind: k, name: id, src: dia !== null ? 'table' : 'unknown' };
}

/** An IL-2 object name of a round, a rocket or a bomb (the game's own; `NPC_` for the ground gunners' rounds). */
const IL2_NAME = /^(npc_)?(bullet|shell|rkt|bomb|cluster)_[a-z]{3}_/i;

/**
 * IL-2's type words (the name's last part) to the analysis' types: the game's own suffixes (`AP`, `APsmk`, `HE`,
 * `CV` armour-piercing capped with a charge, `HT` hollow charge, `HV` / `SPHV` sub-calibre, `HEM` mine shell) and
 * the older spellings.
 */
const IL2_TYPES: [RegExp, string][] = [
  [/_(sp)?hv\b|_(sp)?hv_|apcr|hvap|pzgr40|_bk\b/, 'APCR'],
  [/_ht\b|_ht_|heat/, 'HEAT'],
  [/_cv\b|_cv_|aphe|pzgr\b|pzgr39|_br\b|apbc/, 'APHE'],
  [/_hem\b|mgsch|minengeschoss|_mg\b/, 'HE (mine)'],
  [/apit|api_?t|bzt/, 'APIT'],
  [/api\b|_api|_bz\b|b32/, 'API'],
  [/_ap(smk)?\b|_ap_|_ap$|ap_t|_apt/, 'AP'],
  [/hei_?t|het\b|_het|ofzt/, 'HEIT'],
  [/hei\b|_hei|_i\b|_ofz|_oz/, 'HEI'],
  [/_he\b|_he_|_he$|sprgr|_of\b|_of_|_f\b|_o\b|frag/, 'HE'],
  [/_smk\b|smoke/, 'smoke'],
  [/_t\b|_t$|_tr|tracer|_spur/, 'ball (tracer)'],
  [/_ss\b|_ss$|_ball|_ps\b|_l\b|_lps|_sms/, 'ball'],
];

/** IL-2 rockets by the name's words: diameter (mm), public figures. */
const IL2_ROCKETS: [RegExp, number][] = [
  [/usa_m8|m8_p\d/, 114],
  [/rbs.?82|ros.?82|rs.?82|rus_m8\b|m8m\b/, 82],
  [/rofs.?132|ros.?132|rs.?132|m13/, 132],
  [/rp.?3/, 76.2],
  [/wgr.?21|wfr/, 210],
  [/r4m/, 55],
  [/280mm/, 280],
];

/** IL-2 bombs by the name's words: body diameter (mm), public figures; the rest none. */
const IL2_BOMBS: [RegExp, number][] = [
  [/sc.?2500/, 829],
  [/sc.?1800/, 660],
  [/sc.?1000/, 654],
  [/sc.?500/, 470],
  [/sc.?250/, 368],
  [/sc.?50(?!\d)/, 200],
  [/an.?m64|usa_m64/, 360],
  [/an.?m65|usa_m65/, 478],
  [/an.?m66|usa_m66/, 591],
];

const tableOf = (t: [RegExp, number][], s: string): number | null => {
  for (const [re, v] of t) if (re.test(s)) return v;
  return null;
};

/** An IL-2 round, rocket or bomb by its object name or mission-report AMMO word. */
export function il2Ammo(word: string): AmmoInfo {
  const name = word.trim();
  const s = name.toLowerCase().replace(/^npc_/, '');
  if (/^(bomb|cluster)/.test(s)) {
    const cal = tableOf(IL2_BOMBS, s);
    return { calibre: cal, type: /^cluster|ptab|ab\d/.test(s) ? 'bomb cluster' : 'bomb GP', kind: 'bomb', name, src: cal !== null ? 'table' : 'name' };
  }
  if (/^(rocket|rkt)/.test(s)) {
    let cal = tableOf(IL2_ROCKETS, s);
    if (cal === null) {
      const m = /(?:rs|rbs|ros|rofs).?(\d{2,3})/.exec(s);
      if (m) cal = Number(m[1]);
    }
    return { calibre: cal, type: 'rocket', kind: 'rocket', name, src: cal !== null ? 'table' : 'name' };
  }
  if (!/^(bullet|shell)/.test(s)) return { calibre: null, type: '', kind: 'unknown', name, src: 'unknown' };
  let cal: number | null = null;
  // The game's own: `7-92x57` (7.92 mm), `12-7x108`, `20x82`, `75` (a tank gun's, no case), `7-92` (a gunner's).
  // (An older spelling writes the decimal point away: `792x57`, `127x99`.)
  const g = /^(?:bullet|shell)_[a-z]{3}_(\d{1,3})(?:-(\d{1,2}))?(x\d{2,3})?(?:_|$)/.exec(s);
  if (g && !(Number(g[1]) >= 100 && !g[2] && g[3])) cal = Number(g[2] ? `${g[1]}.${g[2]}` : g[1]);
  if (cal === null) {
    const m = /_(\d{2,3})x(\d{2,3})/.exec(s);
    if (m) {
      const a = Number(m[1]);
      // 792x57 is 7.92 mm, 127x99 12.7 mm, 145x114 14.5 mm, 77x56 (.303) 7.7 mm; 20x82, 37x195 as written.
      cal = a >= 500 ? a / 100 : a >= 100 && a < 200 && !CALIBRES.has(a) ? a / 10 : a === 77 || a === 76 ? a / 10 : a;
      if (a === 762 || a === 769) cal = a / 100;
    }
  }
  let type = '';
  for (const [re, t] of IL2_TYPES)
    if (re.test(s)) {
      type = t;
      break;
    }
  return { calibre: cal, type, kind: 'round', name, src: cal !== null || type ? 'name' : 'unknown' };
}
