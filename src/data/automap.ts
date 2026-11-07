import {
  DEFAULT_AXIS_MAPPING,
  emptyColumnMapping,
  TIME_UNIT_LABELS,
  type AxisMapping,
  type ColumnMapping,
  type LookMode,
  type TimeUnit,
} from '../state/types';

/**
 * Guess a column mapping from column names and sampled values.
 *
 * The point is that a dataset should open and render without anyone filling in a
 * form first. Every guess is shown in the UI and overridable — this only has to
 * be right often enough to be a better starting point than blank.
 */

export interface AutoMapInput {
  columns: string[];
  /** Sampled rows as strings, parallel to `columns`. */
  rows: string[][];
  numeric: boolean[];
  /** Parquet logical types by column, where known. Detects real timestamps. */
  logicalTypes?: Record<string, string>;
  /**
   * How many files this load will merge. Defaults to 1.
   *
   * Only the first file is ever sampled, so this is what tells the mapping
   * whether "constant in the sample" means "constant in the dataset". Above one,
   * a per-file constant is kept as a filter candidate — see the note beside
   * `PER_FILE_CONSTANT_SCORE`.
   */
  fileCount?: number;
  /**
   * What the file itself says about how to read it, where it says (see
   * `MappingHints`). Applied over the guesses, column by column, wherever the
   * named column exists.
   */
  hints?: MappingHints | null;
}

/**
 * A file's own reading instructions: which column is which and which way round
 * its world is. An exporter that knows its data writes them - the CS2 demo
 * export puts them in the Parquet footer under the key `heat3d` - so the file
 * opens right, mirrored worlds included, with nothing filled in by hand. Every
 * entry is optional, and each is still shown and overridable like a guess.
 */
export interface MappingHints {
  axes?: Partial<AxisMapping>;
  /** The tracked things: how big one is, in the data's units. */
  entity?: { size?: number };
  columns?: {
    x?: string;
    y?: string;
    z?: string;
    time?: string;
    timeUnit?: TimeUnit;
    personId?: string;
    teamId?: string;
    sessionId?: string;
    lookMode?: LookMode;
    yaw?: string;
    pitch?: string;
    dirX?: string;
    dirY?: string;
    dirZ?: string;
    angleUnit?: 'degrees' | 'radians';
    /** The filter columns to retain, in order of usefulness. */
    extra?: string[];
  };
}

/** The `heat3d` hints from a JSON string; null for anything that does not parse as an object. */
export function parseHints(text: string | undefined | null): MappingHints | null {
  if (!text) return null;
  try {
    const v = JSON.parse(text) as unknown;
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as MappingHints) : null;
  } catch {
    return null;
  }
}

const ROLE_COLUMNS = ['x', 'y', 'z', 'time', 'personId', 'teamId', 'sessionId', 'yaw', 'pitch', 'dirX', 'dirY', 'dirZ'] as const;

/** Lay a file's hints over a guessed mapping. Names that are not columns of the file are ignored. */
export function applyHints(
  mapping: ColumnMapping,
  hints: MappingHints,
  columns: string[],
  numeric: boolean[],
): ColumnMapping {
  const out: ColumnMapping = { ...mapping, axes: { ...mapping.axes }, extra: [...mapping.extra], extraNumeric: { ...mapping.extraNumeric } };
  const has = (c: unknown): c is string => typeof c === 'string' && columns.includes(c);
  const h = hints.columns ?? {};
  for (const role of ROLE_COLUMNS) {
    if (has(h[role])) out[role] = h[role]!;
  }
  if (h.timeUnit && h.timeUnit in TIME_UNIT_LABELS) out.timeUnit = h.timeUnit;
  if (h.angleUnit === 'degrees' || h.angleUnit === 'radians') out.angleUnit = h.angleUnit;
  if (h.lookMode === 'vector' && out.dirX && out.dirY && out.dirZ) out.lookMode = 'vector';
  else if (h.lookMode === 'yawPitch' && out.yaw) out.lookMode = 'yawPitch';
  else if (h.lookMode === 'none') out.lookMode = 'none';
  const roles = new Set(ROLE_COLUMNS.map((r) => out[r]).filter(Boolean));
  if (Array.isArray(h.extra)) {
    out.extra = h.extra.filter((c) => has(c) && !roles.has(c));
    out.extraNumeric = {};
    for (const c of out.extra) out.extraNumeric[c] = !!numeric[columns.indexOf(c)];
  } else {
    // A column now playing a role is no longer a filter.
    out.extra = out.extra.filter((c) => !roles.has(c));
  }
  const a = hints.axes ?? {};
  if (a.up === 'y' || a.up === 'z') out.axes.up = a.up;
  for (const flip of ['flipX', 'flipY', 'flipZ'] as const) if (typeof a[flip] === 'boolean') out.axes[flip] = a[flip]!;
  if (typeof a.scale === 'number' && a.scale > 0) out.axes.scale = a.scale;
  const size = hints.entity?.size;
  if (typeof size === 'number' && size > 0) out.entitySize = size;
  return out;
}

/**
 * How many filter columns to retain automatically.
 *
 * Each one costs a decode pass at load and 4 bytes per row in memory, so the
 * default is a small useful set rather than everything available.
 */
export const MAX_AUTO_FILTER_COLUMNS = 6;

/**
 * Rank for a column that is constant in the sampled file but may vary across the
 * others.
 *
 * Above the numerics at 500, because these are the cross-file dimensions someone
 * merging a folder actually wants — which region, which test run — and below any
 * categorical that visibly varies, which scores 1000 minus its cardinality.
 */
const PER_FILE_CONSTANT_SCORE = 600;

/** Patterns are ordered: earlier entries win. */
const X_NAMES = [/^x$/i, /(^|[_\s])x$/i, /pos.*x/i, /x.*pos/i, /loc.*x/i, /^lon/i, /longitude/i];
const Y_NAMES = [/^y$/i, /(^|[_\s])y$/i, /pos.*y/i, /y.*pos/i, /loc.*y/i, /^lat/i, /latitude/i];
const Z_NAMES = [/^z$/i, /(^|[_\s])z$/i, /pos.*z/i, /z.*pos/i, /loc.*z/i, /alt/i, /height/i, /elev/i];

const TIME_NAMES = [
  /^time$/i,
  /^timestamp$/i,
  /^ts$/i,
  /event.*time/i,
  /time.*stamp/i,
  /^t$/i,
  /date.*time/i,
  /^when$/i,
  /^tick$/i,
  /frame/i,
  // Elapsed-since-start axes. Lower priority than a real instant, but often the
  // more useful one: they align every match at its own start instead of
  // scattering them across wall-clock time.
  ...ELAPSED_NAMES(),
];

/**
 * Duration-style time axes.
 *
 * Exported so the UI can point out that choosing one of these overlays matches
 * on a shared "minutes into the round" axis rather than absolute time.
 */
export function ELAPSED_NAMES(): RegExp[] {
  return [
    /^gdur$/i,
    /^g_?duration$/i,
    /duration/i,
    /elapsed/i,
    /match.?time/i,
    /round.?time/i,
    /game.?time/i,
    /minute.?from.?start/i,
    /(^|_)since.?start/i,
    /^age$/i,
  ];
}

export function isElapsedAxis(column: string): boolean {
  return ELAPSED_NAMES().some((p) => p.test(column));
}

const PERSON_NAMES = [
  /^name$/i,
  /player.*(id|name)/i,
  /(^|_)user(_|$|id|name)/i,
  /account/i,
  /^persona/i,
  /character/i,
  /^victim$/i,
  /^actor$/i,
  /puuid/i,
  /steam.?id/i,
  /^subject/i,
  // Racing telemetry has no players in it. What moves continuously — the thing
  // a track is drawn for — is the car, so that is the "person" here. Last in the
  // list so a file with both a driver and a car column picks the driver.
  /^driver(_?id|_?name)?$/i,
  /^car(_?id|_?name)?$/i,
];

/**
 * Columns that identify one match, raid or run.
 *
 * Detected on purpose rather than left to the extra-column mechanism, because a
 * session is not merely another thing to filter on: it is what makes a person's
 * samples one continuous track. See `Dataset.sessionId`.
 *
 * A session column is very often a *timestamp* — the match's start instant, the
 * same value on every row of that match — which is why `bestTimestamp` scores
 * timestamp columns by how many distinct values they take. That check exists to
 * stop a session start being chosen as the time axis; this list is the other half
 * of the same observation.
 */
const SESSION_NAMES = [
  /^session(_?id)?$/i,
  /^match(_?id)?$/i,
  /^round(_?id)?$/i,
  /^raid(_?id)?$/i,
  /^game(_?id)?$/i,
  /^run(_?id)?$/i,
  /^replay(_?id)?$/i,
  /^instance(_?id)?$/i,
  // A lap is a session in every sense this cares about: it is one continuous
  // run, and two laps by the same car must not be joined into one track however
  // few seconds apart they were driven. Without this every lap of a course
  // strings together and the track jumps from the finish line back to the start
  // once per lap.
  /^lap(_?id)?$/i,
  /^stint(_?id)?$/i,
];

/**
 * Group candidates, best first.
 *
 * `realTeam` and `spawnTeam` lead because they exist for no other purpose: they
 * are derived by `tools/derive_teams.py` specifically so this data can be grouped
 * by who came ashore together and by which spawn was chosen. Both were previously
 * unreachable — the old first pattern was `/^team.../`, which requires the name to
 * *begin* with "team", so neither matched and the AI fallback below won. The
 * result was a heatmap coloured by an AI flag while the columns built for the job
 * sat unused, and it looked exactly like a broken derivation.
 *
 * `spawnTeam` before `realTeam`, on the numbers rather than on which name sounds
 * more like a team. The coast resolves into a modest number of spawn areas, only
 * some of which carry real traffic, and few enough appear in one round that every
 * one gets a hue of its own and a stretch of coast comes out one colour — arrivals
 * at any single landing spot come from one area at the median. `realTeam` runs to
 * hundreds of places globally and dozens in a round, past any workable hue count,
 * so its colours are shared and it reads as a wash at map scale. It answers a different and finer question —
 * who came ashore together — and the mapping panel lists every column, so choosing
 * it is a click.
 */
const TEAM_NAMES = [
  /^spawn_?team$/i,
  /^real_?team$/i,
  /^team(_?id|_?name)?$/i,
  /^squad/i,
  /^side$/i,
  /faction/i,
  /^clan/i,
  /^party/i,
  /^alliance/i,
  // What splits racing data the way a team splits a shooter: the class a car
  // runs in. Spelled out rather than matching a bare `class`, which means
  // something different in most other datasets and would collide with them.
  /^car_?class$/i,
];

/**
 * Columns that are not called "team" but split the data the way a team would.
 *
 * Raw event telemetry usually has no team column at all; what it has is a
 * player-versus-AI flag or an outcome flag, and that is the distinction someone
 * opening a difference heatmap actually wants on the two sides.
 */
const TEAM_FALLBACK_NAMES = [
  /victim_?ai/i,
  /killer_?ai/i,
  /is_?(ai|bot|npc)/i,
  /^target_?type$/i,
  /^survived$/i,
  /^outcome$/i,
  /^result$/i,
  /^event_?env$/i,
  /^playtest_?id$/i,
];

const YAW_NAMES = [/^yaw$/i, /rot.*yaw/i, /heading/i, /^azimuth/i, /view.*yaw/i, /^rot(ation)?_?z$/i];
const PITCH_NAMES = [/^pitch$/i, /rot.*pitch/i, /elevation.*angle/i, /view.*pitch/i];

/**
 * Columns that must never be auto-picked as an id or a filter.
 *
 * These are constant or near-constant per file (or duplicate a column already
 * mapped), so mapping them wastes a texture and, in the team case, collapses
 * every row into one group.
 */
/**
 * Columns this pipeline adds *in order to be filtered on*, which therefore win
 * their place rather than competing for it.
 *
 * The mirror of `NOISE_NAMES`, and needed for the same reason that list is: the
 * ranking below cannot tell these apart from any other column holding one value
 * per file. `region` scored a tie with a per-file test-run id and lost it on
 * column order alone — so the column added specifically so that regions could be
 * told apart was absent exactly when all of them were loaded. That is not a ranking to
 * tune, it is a fact the ranking has no way to know.
 *
 * Deliberately short. Anything here costs 4 bytes per row whether or not it is
 * used, so it is for columns whose only purpose is filtering, not for columns
 * that are merely useful.
 *
 * `actor` earns its place by separating three things that were being read as one.
 * A large share of the rows in one file had no spawn group, and that bucket held both
 * every non-player actor — creatures, bots, and a surprising number of desk lamps
 * and neon signs, all of which emit position rows — and ordinary players whose
 * session was logged from partway through. Without a way to exclude the scenery,
 * a density map counts furniture.
 */
const PREFER_NAMES = [/^region$/i, /^sessionMode$/i, /^actor$/i];

/** Rank for `PREFER_NAMES`: above any column that competes on cardinality. */
const PREFERRED_SCORE = 1200;

const NOISE_NAMES = [
  /^filename$/i,
  /^level$/i,
  /^year$/i,
  /^month$/i,
  /^day$/i,
  /^hour$/i,
  /^location$/i,
];

function firstMatch(columns: string[], patterns: RegExp[], exclude: Set<string>): string | null {
  for (const p of patterns) {
    for (const c of columns) {
      if (exclude.has(c)) continue;
      if (p.test(c)) return c;
    }
  }
  return null;
}

/** Distinct-value count in the sample, for telling ids from categories. */
function cardinality(rows: string[][], col: number): number {
  const seen = new Set<string>();
  for (const r of rows) {
    const v = r[col];
    if (v !== undefined && v !== '') seen.add(v);
  }
  return seen.size;
}

/**
 * Does this column hold an id rather than a category?
 *
 * The sample is what there is to go on, so this only catches the clear case: a
 * distinct value on most rows of it. It cannot catch an id that happens to repeat
 * within the sampled window — a per-match key in file order looks like a handful
 * of groups — which is why the load itself also handles a column that turns out
 * to have too many values, rather than relying on this.
 *
 * The floor keeps a genuinely varied category column — 25 squads, 40 weapons —
 * on the group side when the sample is small.
 */
function looksLikeId(rows: string[][], col: number): boolean {
  if (col < 0 || rows.length === 0) return false;
  return cardinality(rows, col) > Math.max(48, rows.length * 0.6);
}

export function autoMap(input: AutoMapInput): ColumnMapping {
  const { columns, rows, numeric } = input;
  const mapping = emptyColumnMapping();
  const used = new Set<string>();
  const noise = new Set(columns.filter((c) => NOISE_NAMES.some((p) => p.test(c))));

  const numericCols = new Set(columns.filter((_, i) => numeric[i]));
  const takeNumeric = (patterns: RegExp[]): string | null => {
    const exclude = new Set([...used, ...columns.filter((c) => !numericCols.has(c))]);
    const hit = firstMatch(columns, patterns, exclude);
    if (hit) used.add(hit);
    return hit;
  };

  mapping.x = takeNumeric(X_NAMES);
  mapping.y = takeNumeric(Y_NAMES);
  mapping.z = takeNumeric(Z_NAMES);

  // Fall back to the first three numeric columns only if none were named — a
  // wrong guess here is obvious on screen, whereas leaving it blank means an
  // empty viewport with no explanation.
  if (!mapping.x || !mapping.y || !mapping.z) {
    const spare = columns.filter((c) => numericCols.has(c) && !used.has(c) && !noise.has(c));
    if (!mapping.x && spare.length) mapping.x = pop(spare, used);
    if (!mapping.y && spare.length) mapping.y = pop(spare, used);
    if (!mapping.z && spare.length) mapping.z = pop(spare, used);
  }

  // Time: prefer a real timestamp logical type, but *which* timestamp matters.
  // Real telemetry often has several — an event instant, a whole-day date, a
  // session start — and only the event instant is a usable time axis. Score by
  // name first, then by how many distinct values it actually takes: a DATE
  // column of midnights and a constant session start both collapse to one.
  const tsCol = bestTimestamp(columns, rows, input.logicalTypes, used);
  if (tsCol) {
    mapping.time = tsCol;
    used.add(tsCol);
    mapping.timeUnit = 'unix_milliseconds';
  } else {
    const t = firstMatch(columns, TIME_NAMES, used);
    if (t) {
      mapping.time = t;
      used.add(t);
      mapping.timeUnit = guessTimeUnit(rows, columns.indexOf(t), numeric[columns.indexOf(t)]);
    }
  }

  // Before person and team, and *after* the time axis has been claimed: a
  // session column is frequently a timestamp, and `bestTimestamp` has already
  // rejected it for taking too few distinct values. Claiming it here stops it
  // being picked up as a team stand-in, which is what happened to the test
  // export's per-file test-run id — a coarser grouping that reads like a session
  // and is not one.
  const session = firstMatch(columns, SESSION_NAMES, new Set([...used, ...noise]));
  if (session) {
    mapping.sessionId = session;
    used.add(session);
  }

  const person = firstMatch(columns, PERSON_NAMES, new Set([...used, ...noise]));
  if (person) {
    mapping.personId = person;
    used.add(person);
  }

  const banned = new Set([...used, ...noise]);
  let team =
    firstMatch(columns, TEAM_NAMES, banned) ?? firstMatch(columns, TEAM_FALLBACK_NAMES, banned);
  // A column called `team_id` that takes a different value on nearly every
  // sampled row is an id, not a group — a per-match team key, or a player key
  // under a group-sounding name. Mapped as a group it builds a dictionary the
  // size of the dataset and then has to be dropped at load. Where nothing was
  // found for person, an id column is a far better person than group: person ids
  // are 32-bit and per-entity, which is exactly what such a column is.
  if (team && looksLikeId(rows, columns.indexOf(team))) {
    if (!mapping.personId) {
      mapping.personId = team;
      used.add(team);
    }
    team = null;
  }
  if (team) {
    mapping.teamId = team;
    used.add(team);
  } else {
    // No team column is the common case in raw event telemetry. A low-cardinality
    // string column is the useful stand-in: it is what difference mode splits on,
    // and it is almost always the distinction someone actually wants to see.
    const candidate = columns
      .map((c, i) => ({ c, i }))
      .filter(({ c, i }) => !used.has(c) && !noise.has(c) && !numeric[i])
      .map(({ c, i }) => ({ c, card: cardinality(rows, i) }))
      .filter(({ card }) => card >= 2 && card <= 12)
      .sort((a, b) => a.card - b.card)[0];
    if (candidate) {
      mapping.teamId = candidate.c;
      used.add(candidate.c);
    }
  }

  const yaw = takeNumeric(YAW_NAMES);
  if (yaw) {
    mapping.lookMode = 'yawPitch';
    mapping.yaw = yaw;
    mapping.pitch = takeNumeric(PITCH_NAMES);
    mapping.angleUnit = guessAngleUnit(rows, columns.indexOf(yaw));
  }

  // Columns worth filtering on, deliberately few.
  //
  // Every retained column is a full decode pass at load time and a texture at
  // render time, and a string column additionally costs a dictionary lookup per
  // row. Auto-selecting all of them turned a mid-sized load into minutes of work for
  // columns nobody had asked to filter on. So: rank by usefulness as a filter —
  // low-cardinality categoricals and real numerics first — and keep a handful.
  // The mapping UI lists every column, so adding more is one click.
  /**
   * Whether the preview's one sampled file stands for the whole load.
   *
   * It does not when several files are being merged, and that changes what a
   * constant column means. The preview reads `files[0]` only, so a column holding
   * one value per *file* — which region the export came from, which test run —
   * looks constant in the sample while being exactly the dimension worth
   * filtering on once the files are side by side. Dropping it on that evidence is
   * how a `region` column added on purpose ends up unavailable precisely when all
   * the regions are loaded together.
   */
  const spansFiles = (input.fileCount ?? 1) > 1;

  const candidates: Array<{ name: string; isNumeric: boolean; score: number }> = [];
  for (let i = 0; i < columns.length; i++) {
    const c = columns[i];
    if (used.has(c) || noise.has(c)) continue;
    const card = cardinality(rows, i);
    // A column that never varies in the sample cannot filter anything — unless
    // the sample is one file of many, where it may vary between them.
    const constantInSample = card <= 1;
    if (constantInSample && !spansFiles) continue;
    // Preference does not override the test above: a column that is constant
    // across the whole load still cannot filter anything, whatever it is called.
    const preferred = PREFER_NAMES.some((p) => p.test(c));
    if (preferred) {
      candidates.push({ name: c, isNumeric: !!numeric[i], score: PREFERRED_SCORE });
      continue;
    }
    if (!numeric[i]) {
      // Free text (ids, guids, messages) would build a dictionary the size of
      // the dataset to no benefit.
      if (card > Math.max(16, rows.length * 0.5)) continue;
      // A per-file constant ranks below anything that demonstrably varies here:
      // "might differ between files" is weaker evidence than "does differ", and
      // scoring it by cardinality would rank it *top* of the list at 1000 - 1.
      candidates.push({
        name: c,
        isNumeric: false,
        score: constantInSample ? PER_FILE_CONSTANT_SCORE : 1000 - card,
      });
    } else {
      candidates.push({
        name: c,
        isNumeric: true,
        score: constantInSample ? PER_FILE_CONSTANT_SCORE : 500,
      });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  mapping.extra = [];
  mapping.extraNumeric = {};
  for (const cand of candidates.slice(0, MAX_AUTO_FILTER_COLUMNS)) {
    mapping.extra.push(cand.name);
    mapping.extraNumeric[cand.name] = cand.isNumeric;
  }

  mapping.axes = { ...DEFAULT_AXIS_MAPPING, up: guessUpAxis(rows, columns, mapping) };
  return input.hints ? applyHints(mapping, input.hints, columns, numeric) : mapping;
}

/**
 * Choose the most usable timestamp column.
 *
 * Real telemetry commonly carries several timestamp-typed columns — an event
 * instant, a whole-day date, a session start — and only the event instant is a
 * time axis. Both wrong answers give away their nature the same way: they take
 * almost no distinct values across the sample, because every row of a file
 * shares one date and one session. So score by name, then by distinctness.
 */
function bestTimestamp(
  columns: string[],
  rows: string[][],
  logicalTypes: Record<string, string> | undefined,
  used: Set<string>,
): string | null {
  if (!logicalTypes) return null;
  let best: string | null = null;
  let bestScore = -1;
  for (let i = 0; i < columns.length; i++) {
    const c = columns[i];
    if (used.has(c)) continue;
    const lt = logicalTypes[c] ?? '';
    if (!/TIMESTAMP|DATE/i.test(lt)) continue;
    const named = TIME_NAMES.some((p) => p.test(c));
    // A DATE is a whole day: never a usable axis when anything else is offered.
    const dateOnly = /^DATE$/i.test(lt);
    const score =
      (named ? 10_000 : 0) + (dateOnly ? -5_000 : 0) + cardinality(rows, i);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

function pop(spare: string[], used: Set<string>): string {
  const v = spare.shift()!;
  used.add(v);
  return v;
}

/**
 * Decide which source axis is up by comparing spreads.
 *
 * In world-position telemetry the vertical axis always has a much smaller range
 * than the two ground axes — a map is kilometres across and tens of metres tall.
 * That ratio identifies the up axis far more reliably than any naming convention.
 */
function guessUpAxis(
  rows: string[][],
  columns: string[],
  mapping: ColumnMapping,
): 'y' | 'z' {
  const spread = (name: string | null): number => {
    if (!name) return NaN;
    const ci = columns.indexOf(name);
    if (ci < 0) return NaN;
    let lo = Infinity;
    let hi = -Infinity;
    for (const r of rows) {
      const v = Number(r[ci]);
      if (!Number.isFinite(v)) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    return hi - lo;
  };
  const sx = spread(mapping.x);
  const sy = spread(mapping.y);
  const sz = spread(mapping.z);
  if (!Number.isFinite(sx) || !Number.isFinite(sy) || !Number.isFinite(sz)) return 'z';
  // Whichever of y/z is the flatter one relative to x is the vertical.
  return sz < sy ? 'z' : 'y';
}

function guessTimeUnit(rows: string[][], col: number, isNumeric: boolean): TimeUnit {
  if (col < 0) return 'seconds';
  const samples: number[] = [];
  let sawIso = false;
  for (const r of rows) {
    const v = r[col];
    if (v === undefined || v === '') continue;
    if (!isNumeric) {
      if (/\d{4}-\d{2}-\d{2}[T ]/.test(v)) sawIso = true;
      continue;
    }
    const n = Number(v);
    if (Number.isFinite(n)) samples.push(n);
  }
  if (sawIso) return 'iso8601';
  if (samples.length === 0) return 'seconds';

  const max = Math.max(...samples.map(Math.abs));
  // Magnitude bands around the current epoch. 1e9 s ~ 2001; 1e12 ms ~ 2001.
  if (max > 1e17) return 'nanoseconds';
  if (max > 1e14) return 'microseconds';
  if (max > 1e11) return 'unix_milliseconds';
  if (max > 1e8) return 'unix_seconds';
  if (max > 1e6) return 'milliseconds';
  return 'seconds';
}

function guessAngleUnit(rows: string[][], col: number): 'degrees' | 'radians' {
  if (col < 0) return 'degrees';
  let max = 0;
  for (const r of rows) {
    const v = Number(r[col]);
    if (Number.isFinite(v)) max = Math.max(max, Math.abs(v));
  }
  // Radian yaw never exceeds 2π; degree yaw routinely runs to 180 or 360.
  return max > 7 ? 'degrees' : 'radians';
}
