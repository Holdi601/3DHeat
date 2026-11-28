/**
 * View sync: everyone in a session seeing the same settings - the mode, the
 * heat, the filters, the lines, the figures, the race, match, tactics and
 * vehicle tabs - and the same moment of playback, for those who keep their
 * view in sync (on by default). The camera is not part of it: following and
 * "look here" move cameras.
 *
 * The view is cut into slices (`viewSlices.ts`), each read and set through
 * its store. Ten times a second the sync looks at each slice's references;
 * a slice whose references moved is read, and when it reads differently it
 * goes out (at most five messages a second). Each slice carries a version
 * (a Lamport clock and the member's id), so two members changing the same
 * slice at once end at the same value everywhere, and a slice applied from
 * someone else is not sent back.
 *
 * A playback clock is a slice too: play, pause, speed and direction are its
 * value, the time travels beside it with the server's clock, so a member
 * whose message took 80 ms starts 80 ms further on. While it plays, the
 * member whose clock it is says the time every two seconds and the others
 * catch up when they drifted.
 *
 * What arrives is checked against what this viewer has (`shaped`): only
 * fields it knows, of the types it holds, within sizes. It never reaches the
 * render loop: slices are set through the stores, as a click would.
 */

type Ver = [number, number];

/** A clock's value as it travels: play state, and the time `t` when it left. */
export interface ClockValue {
  playing: boolean;
  speed: number;
  reverse: boolean;
  t: number;
}

export interface ViewSlice {
  key: string;
  /** Cheap references: while they are the same as last time, the slice has not changed. */
  deps(): readonly unknown[];
  /** The slice as JSON-able data (for a clock: without its time). */
  capture(): unknown;
  /** Puts a value from someone else in; it checks the value itself. */
  apply(v: unknown): void;
  /** Slices the stores change in turn when this one is set (not this viewer's doing for a moment). */
  settles?: readonly string[];
  /** A playback clock: its time now, and setting it. */
  clock?: {
    time(): number;
    /** Puts the time (after `apply` set play state), without a word to the others. */
    seek(t: number): void;
  };
}

export interface ViewEnv {
  slices(): ViewSlice[];
  me(): number;
  /** `performance.now()`. */
  now(): number;
  /** The server's clock, milliseconds since 1970. */
  serverNow(): number;
  send(kind: 'change' | 'state' | 'ask' | 'want' | 'clock' | 'release', json: string, to?: number[]): void;
}

/** Changes from someone, waiting for this viewer's answer. */
export interface PendingChange {
  from: number;
  slices: Record<string, { value: unknown; ver: Ver; at: number }>;
}

/** A view to go back to: every slice's value, clocks with their time. */
interface Saved {
  at: number;
  values: Record<string, unknown>;
  times: Record<string, number>;
}

const newer = (a: Ver | undefined, b: Ver | undefined): boolean => !!a && (!b || a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]));

const sameDeps = (a: readonly unknown[], b: readonly unknown[]): boolean => a.length === b.length && a.every((x, i) => Object.is(x, b[i]));

function readVer(v: unknown): Ver | undefined {
  return Array.isArray(v) && v.length === 2 && Number.isSafeInteger(v[0]) && Number.isSafeInteger(v[1]) && v[0] >= 0 ? [v[0], v[1]] : undefined;
}

function readClock(v: unknown): ClockValue | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const t = o.t;
  const speed = o.speed;
  if (typeof o.playing !== 'boolean' || typeof t !== 'number' || !Number.isFinite(t) || typeof speed !== 'number' || !Number.isFinite(speed)) return null;
  return {
    playing: o.playing,
    speed: Math.max(-1000, Math.min(1000, speed)),
    reverse: o.reverse === true,
    t,
  };
}

/** Sends at most this often, ms (the server allows ten a second). */
const SEND_EVERY = 200;
/** After a view from someone else went in: changes it set off are its, not this viewer's. */
const QUIET_MS = 450;
/**
 * The slices just set from someone are the stores settling, not this viewer's
 * change, for this many of its ticks (counted, not timed: a page busy drawing
 * ticks late, and its stores react before its next tick, however late).
 */
const QUIET_TICKS = 2;
/** A clock's time said this often while it plays, ms. */
const BEAT_MS = 2000;
/** Drift past which a follower of a clock catches up, seconds (times the speed). */
const DRIFT = 0.25;
/** Views kept to go back to. */
const HISTORY = 20;

export class ViewSync {
  /** Keeps this viewer's view in sync with everyone's (sends its changes, takes theirs). */
  enabled = true;
  /** Changes from the host wait for an answer (`pending`) rather than going in. */
  askHost = true;
  /** Looking through a member's eyes: only theirs go in, this viewer's own go nowhere. */
  peek: number | null = null;
  /** Members looking through this viewer's eyes: they get its changes even when it is not in sync. */
  readonly watchers = new Set<number>();
  /** The host's changes waiting for an answer. */
  pending: PendingChange | null = null;
  /** Calls back when `pending`, the history or what was applied changed (for the UI). */
  onChange: (what: { applied?: { from: number; keys: string[] }; pending?: boolean }) => void = () => {};
  /** The member who is host (their changes are asked about). */
  hostId: () => number | null = () => null;
  /** Said with a whole view (the data's name, for whoever looks through this viewer's eyes). */
  stateExtra: () => Record<string, unknown> = () => ({});

  private last = new Map<string, { deps: readonly unknown[]; json: string }>();
  private ver = new Map<string, Ver>();
  private lamport = 0;
  private quietUntil = 0;
  /** The slices just set from someone: their changes are the stores settling, until then. */
  private keyQuiet = new Map<string, number>();
  private tickNo = 0;
  private lastSend = -Infinity;
  private dirty = new Set<string>();
  private times = new Map<string, { t: number; wall: number; playing: boolean; rate: number }>();
  private lastBeat = new Map<string, number>();
  private history: Saved[] = [];
  private again: { at: number; values: Record<string, unknown> } | null = null;
  /** The last events, for the smoke test and the console (`window.__heat3dSession.client.view.events`). */
  readonly events: string[] = [];
  private note(e: string): void {
    this.events.push(`${Math.round(this.env.now())} ${e}`);
    if (this.events.length > 200) this.events.shift();
  }

  constructor(private env: ViewEnv) {}

  private quietFor(key: string): void {
    this.keyQuiet.set(key, Math.max(this.keyQuiet.get(key) ?? -1, this.tickNo + QUIET_TICKS));
  }

  /** For `ms`, what changes is not this viewer's doing (data loading resets settings): read, not sent. */
  hold(ms: number): void {
    this.note(`hold ${ms}`);
    this.quietUntil = Math.max(this.quietUntil, this.env.now() + ms);
  }

  /** Views there are to go back to. */
  canGoBack(): boolean {
    return this.history.length > 0;
  }

  /** Ten times a second: changes out, clock beats out. */
  tick(): void {
    const now = this.env.now();
    this.tickNo++;
    const still = now < this.quietUntil || this.peek !== null;
    for (const s of this.env.slices()) {
      const quiet = still || this.tickNo <= (this.keyQuiet.get(s.key) ?? -1);
      const deps = s.deps();
      const prev = this.last.get(s.key);
      let changed = false;
      let json = prev?.json ?? '';
      if (!prev || !sameDeps(prev.deps, deps)) {
        json = JSON.stringify(s.capture() ?? null);
        changed = !!prev && json !== prev.json;
      }
      if (s.clock) changed = this.clockJumped(s, now) || changed;
      this.last.set(s.key, { deps, json });
      // Out of sync, a change is this viewer's alone: no version, so it never outranks the session's later.
      if (changed && (quiet || (!this.enabled && !this.watchers.size))) this.note(`kept ${s.key}${quiet ? ' (quiet)' : ' (out of sync)'}`);
      if (!changed || quiet || (!this.enabled && !this.watchers.size)) continue;
      this.ver.set(s.key, [++this.lamport, this.env.me()]);
      this.dirty.add(s.key);
    }
    // Once the stores' own reactions to what came in have run (a tab switch picks its mode a
    // frame later, say), what came in is put again, so it is what stays.
    const again = this.again;
    if (again && this.tickNo >= again.at) {
      this.again = null;
      for (const k of Object.keys(again.values)) this.quietFor(k);
      for (const s of this.env.slices()) {
        if (s.clock || !(s.key in again.values)) continue;
        try {
          s.apply(again.values[s.key]);
        } catch {
          /* stays as it is */
        }
      }
      this.rebase(Object.keys(again.values));
    }
    if (this.dirty.size && now - this.lastSend >= SEND_EVERY) {
      const keys = [...this.dirty];
      this.dirty.clear();
      this.lastSend = now;
      this.note(`send ${keys.map((k) => `${k}@${this.ver.get(k)?.join('.')}`).join(',')}${this.enabled ? '' : ' (watchers)'}`);
      this.out('change', this.payload(keys));
    }
    this.beats(now);
  }

  /** Whether a clock's time went where its play state does not take it (a seek); its reading kept. */
  private clockJumped(s: ViewSlice, now: number): boolean {
    const c = s.clock!;
    const t = c.time();
    const v = (s.capture() ?? {}) as {
      playing?: boolean;
      speed?: number;
      reverse?: boolean;
    };
    const rate = (v.playing ? (v.speed ?? 1) : 0) * (v.reverse ? -1 : 1);
    const prev = this.times.get(s.key);
    this.times.set(s.key, { t, wall: now, playing: !!v.playing, rate });
    if (!prev || !Number.isFinite(t)) return false;
    const dt = (now - prev.wall) / 1000;
    const expect = prev.t + prev.rate * dt;
    // Paused, any move is a seek; playing, only a jump past what slow frames could explain.
    const slack = prev.playing && v.playing ? 1.5 + Math.abs(prev.rate) * dt : 1e-3;
    return Math.abs(t - expect) > slack;
  }

  private beats(now: number): void {
    const me = this.env.me();
    for (const s of this.env.slices()) {
      if (!s.clock) continue;
      const v = this.ver.get(s.key);
      const tm = this.times.get(s.key);
      if (!v || v[1] !== me || !tm?.playing) continue;
      if (now - (this.lastBeat.get(s.key) ?? -Infinity) < BEAT_MS) continue;
      this.lastBeat.set(s.key, now);
      this.out(
        'clock',
        JSON.stringify({
          k: s.key,
          ver: v,
          v: { ...(s.capture() as object), t: s.clock.time() },
        }),
      );
    }
  }

  /** The slices named (all of them when none are), as they travel. */
  private payload(keys?: string[], extra: Record<string, unknown> = {}): string {
    const s: Record<string, unknown> = {};
    const ver: Record<string, Ver> = {};
    for (const sl of this.env.slices()) {
      if (keys && !keys.includes(sl.key)) continue;
      const v = sl.capture();
      s[sl.key] = sl.clock ? { ...(v as object), t: sl.clock.time() } : v;
      const vv = this.ver.get(sl.key);
      if (vv) ver[sl.key] = vv;
    }
    return JSON.stringify({ l: this.lamport, s, ver, ...extra });
  }

  /** A change goes to everyone when in sync, else to those looking through this viewer's eyes only. */
  private out(kind: 'change' | 'clock', json: string): void {
    if (this.enabled) this.env.send(kind, json);
    else if (this.watchers.size) this.env.send(kind, json, [...this.watchers]);
  }

  // ------------------------------------------------------------ in

  /** A view message from member `from`, passed on by the server at `at` (its clock). */
  receive(from: number, kind: 'change' | 'state' | 'ask' | 'want' | 'clock' | 'release', json: string, at: number): 'ask' | null {
    let msg: Record<string, unknown>;
    try {
      const v: unknown = json ? JSON.parse(json) : {};
      if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
      msg = v as Record<string, unknown>;
    } catch {
      return null;
    }
    if (typeof msg.l === 'number' && Number.isSafeInteger(msg.l) && msg.l > this.lamport) this.lamport = msg.l;
    switch (kind) {
      case 'want':
        if (msg.stop === true) this.watchers.delete(from);
        else {
          if (msg.watch === true) this.watchers.add(from);
          this.env.send('state', this.payload(undefined, this.stateExtra()), [from]);
        }
        return null;
      case 'change':
        this.change(from, msg, at);
        return null;
      case 'clock':
        this.clockBeat(from, msg, at);
        return null;
      case 'state':
      case 'ask':
      case 'release':
        // The caller decides (a request card, a peek, joining).
        return kind === 'ask' ? 'ask' : null;
    }
  }

  /** The slices a message carries, with their versions. */
  private entries(msg: Record<string, unknown>, at: number): PendingChange['slices'] {
    const out: PendingChange['slices'] = {};
    const s = msg.s && typeof msg.s === 'object' && !Array.isArray(msg.s) ? (msg.s as Record<string, unknown>) : {};
    const ver = msg.ver && typeof msg.ver === 'object' ? (msg.ver as Record<string, unknown>) : {};
    const known = new Set(this.env.slices().map((x) => x.key));
    for (const [k, value] of Object.entries(s)) {
      if (!known.has(k)) continue;
      out[k] = { value, ver: readVer(ver[k]) ?? [0, 0], at };
    }
    return out;
  }

  private change(from: number, msg: Record<string, unknown>, at: number): void {
    const all = this.entries(msg, at);
    if (this.peek !== null) {
      if (from === this.peek) this.put(all, from, false);
      return;
    }
    if (!this.enabled) {
      this.note(`from ${from}: out of sync`);
      return;
    }
    const fresh: PendingChange['slices'] = {};
    for (const [k, e] of Object.entries(all)) if (newer(e.ver, this.ver.get(k))) fresh[k] = e;
    this.note(
      `from ${from}: ${Object.entries(all)
        .map(([k, e]) => `${k}@${e.ver.join('.')}${k in fresh ? '' : ` old(${this.ver.get(k)?.join('.')})`}`)
        .join(',')}`,
    );
    if (!Object.keys(fresh).length) return;
    const host = this.hostId();
    if (this.askHost && host !== null && from === host && this.env.me() !== host) {
      // The newest of each slice waits; the answer takes them all.
      const p = this.pending && this.pending.from === from ? this.pending : { from, slices: {} };
      for (const [k, e] of Object.entries(fresh)) p.slices[k] = e;
      this.pending = p;
      this.onChange({ pending: true });
      return;
    }
    this.put(fresh, from, true);
  }

  private clockBeat(from: number, msg: Record<string, unknown>, at: number): void {
    const key = typeof msg.k === 'string' ? msg.k : '';
    const s = this.env.slices().find((x) => x.key === key && x.clock);
    const v = readClock(msg.v);
    if (!s || !v) return;
    const mine = this.ver.get(key);
    // Only the clock this viewer took from that member (or the one it looks through).
    if (this.peek !== null ? from !== this.peek : !this.enabled || !mine || mine[1] !== from) return;
    const local = (s.capture() ?? {}) as { playing?: boolean };
    if (!local.playing || !v.playing) return;
    const want = this.timeNow(v, at);
    if (Math.abs(s.clock!.time() - want) <= DRIFT * Math.max(1, Math.abs(v.speed))) return;
    this.quietFor(key);
    s.clock!.seek(want);
    this.rebase([key]);
  }

  /** A clock's time now, from its value and when the server passed it on. */
  private timeNow(v: ClockValue, at: number): number {
    if (!v.playing) return v.t;
    const late = Math.max(0, Math.min(10_000, this.env.serverNow() - at)) / 1000;
    return v.t + late * v.speed * (v.reverse ? -1 : 1);
  }

  /** Slices from someone else in: the view before them kept to go back to (`remember`); `adopt` takes their versions as they are. */
  private put(entries: PendingChange['slices'], from: number, remember: boolean, adopt = false): void {
    const keys = Object.keys(entries);
    if (!keys.length) return;
    if (remember) this.remember();
    const slices = this.env.slices();
    // The slices set, and those the stores set in turn when these change (a tab picks its mode).
    for (const k of keys) {
      this.quietFor(k);
      for (const x of slices.find((y) => y.key === k)?.settles ?? []) this.quietFor(x);
    }
    for (const k of keys) {
      const s = slices.find((x) => x.key === k);
      if (!s) continue;
      const e = entries[k];
      try {
        if (s.clock) {
          const v = readClock(e.value);
          if (!v) continue;
          s.apply(v);
          s.clock.seek(this.timeNow(v, e.at));
        } else s.apply(e.value);
      } catch {
        continue;
      }
      if (adopt || newer(e.ver, this.ver.get(k))) this.ver.set(k, e.ver);
      this.dirty.delete(k);
      if (!s.clock) {
        this.again ??= { at: this.tickNo + QUIET_TICKS, values: {} };
        this.again.values[k] = e.value;
        this.again.at = this.tickNo + QUIET_TICKS;
      }
    }
    this.rebase(keys);
    this.onChange({ applied: { from, keys } });
  }

  /** What was just set is this viewer's reading now: not a change of its own. */
  private rebase(keys: string[]): void {
    const now = this.env.now();
    for (const s of this.env.slices()) {
      if (!keys.includes(s.key)) continue;
      this.last.set(s.key, {
        deps: s.deps(),
        json: JSON.stringify(s.capture() ?? null),
      });
      if (s.clock) {
        const v = (s.capture() ?? {}) as {
          playing?: boolean;
          speed?: number;
          reverse?: boolean;
        };
        this.times.set(s.key, {
          t: s.clock.time(),
          wall: now,
          playing: !!v.playing,
          rate: (v.playing ? (v.speed ?? 1) : 0) * (v.reverse ? -1 : 1),
        });
      }
    }
  }

  /** Puts a whole view in (an answer to "send me your view", a request taken): every slice, with its versions. */
  takeState(from: number, json: string, at: number, remember = true): void {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(json) as Record<string, unknown>;
      if (!msg || typeof msg !== 'object') return;
    } catch {
      return;
    }
    if (typeof msg.l === 'number' && Number.isSafeInteger(msg.l) && msg.l > this.lamport) this.lamport = msg.l;
    const all = this.entries(msg, at);
    // Its versions as they are: this viewer takes the session's view, and what it changed
    // meanwhile on its own does not outrank the next change anyone makes.
    this.put(all, from, remember, true);
  }

  /** The host's waiting changes: in, or dropped. */
  answer(take: boolean): void {
    const p = this.pending;
    this.pending = null;
    if (take && p) {
      const fresh: PendingChange['slices'] = {};
      for (const [k, e] of Object.entries(p.slices)) if (newer(e.ver, this.ver.get(k)) || e.ver[0] === 0) fresh[k] = e;
      this.put(fresh, p.from, true);
    }
    this.onChange({ pending: false });
  }

  // ------------------------------------------------------------ going back

  private capture(): Saved {
    const values: Record<string, unknown> = {};
    const times: Record<string, number> = {};
    for (const s of this.env.slices()) {
      values[s.key] = s.capture();
      if (s.clock) times[s.key] = s.clock.time();
    }
    return { at: this.env.now(), values, times };
  }

  /** Keeps the view as it is to go back to; changes close together are one step. */
  remember(): void {
    const top = this.history[this.history.length - 1];
    if (top && this.env.now() - top.at < 1500) return;
    this.history.push(this.capture());
    if (this.history.length > HISTORY) this.history.shift();
  }

  /** Back to the view before the last one from someone else: this viewer's alone, not sent. */
  back(): boolean {
    const h = this.history.pop();
    if (!h) return false;
    this.restore(h);
    return true;
  }

  /** Every view kept dropped, back to the oldest (where this viewer was before the others changed it). */
  backToStart(): boolean {
    const h = this.history[0];
    if (!h) return false;
    this.history = [];
    this.restore(h);
    return true;
  }

  private restore(h: Saved): void {
    this.quietUntil = this.env.now() + QUIET_MS;
    for (const s of this.env.slices()) {
      if (!(s.key in h.values)) continue;
      try {
        if (s.clock) {
          const v = h.values[s.key] as Omit<ClockValue, 't'>;
          s.apply({ ...v, t: h.times[s.key] ?? 0 });
          s.clock.seek(h.times[s.key] ?? 0);
        } else s.apply(h.values[s.key]);
      } catch {
        /* that slice stays as it is */
      }
    }
    this.rebase(this.env.slices().map((s) => s.key));
    const values: Record<string, unknown> = {};
    for (const s of this.env.slices()) if (!s.clock && s.key in h.values) values[s.key] = h.values[s.key];
    this.again = { at: this.tickNo + QUIET_TICKS, values };
    this.onChange({});
  }

  // ------------------------------------------------------------ requests out

  /** "Send me your view" to `to`; `watch` keeps their changes coming (looking through their eyes). */
  want(to: number, watch = false): void {
    this.env.send('want', JSON.stringify(watch ? { watch: true } : {}), [to]);
  }

  stopWatching(to: number): void {
    this.env.send('want', JSON.stringify({ stop: true }), [to]);
  }

  /** "Switch to my view", to the members named (everyone when none are). */
  ask(to: number[] = []): void {
    this.env.send('ask', this.payload(), to);
  }

  /** The whole view as it travels (for the session file, a test). */
  state(): string {
    return this.payload();
  }

  /** Starts looking through member `id`'s eyes: this view kept to come back to. */
  startPeek(id: number): void {
    if (this.peek === null) this.history.push(this.capture());
    this.peek = id;
    this.want(id, true);
  }

  /** Back from looking through someone's eyes: the view from before. */
  endPeek(): void {
    const id = this.peek;
    if (id === null) return;
    this.peek = null;
    this.stopWatching(id);
    this.back();
  }

  /** Someone left: they look through no one's eyes here, nothing of theirs is waiting. */
  gone(id: number): void {
    this.watchers.delete(id);
    if (this.pending?.from === id) {
      this.pending = null;
      this.onChange({ pending: false });
    }
  }
}

// ---------------------------------------------------------------- checking what arrives

export interface ShapeOpts {
  /** Field names that may also be null (null means "all", say), and so may change between null and a value. */
  nullable?: ReadonlySet<string>;
  /** Field names that hold records (any keys) of plain values. */
  records?: ReadonlySet<string>;
}

const MAX_ITEMS = 2000;
const MAX_TEXT = 400;

function plain(v: unknown): boolean {
  return v === null || typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.length <= MAX_TEXT);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

/** Whether `v` has the shape of `like` (the same types, objects with only its fields). */
function fits(like: unknown, v: unknown, opts: ShapeOpts, depth: number): boolean {
  if (depth > 8) return false;
  if (like === null || like === undefined) return plain(v) || (Array.isArray(v) && v.length <= MAX_ITEMS && v.every(plain));
  if (typeof like === 'number') return typeof v === 'number' && Number.isFinite(v);
  if (typeof like === 'boolean') return typeof v === 'boolean';
  if (typeof like === 'string') return typeof v === 'string' && v.length <= MAX_TEXT;
  if (Array.isArray(like)) return Array.isArray(v) && v.length <= MAX_ITEMS && (like.length ? v.every((x) => fits(like[0], x, opts, depth + 1)) : v.every(plain));
  if (isObj(like)) return isObj(v) && Object.keys(v).every((k) => k in like && fits(like[k], v[k], opts, depth + 1));
  return false;
}

/**
 * `incoming` laid over `current`: only the fields `current` has, each only
 * when it has the same type (numbers finite, text and lists bounded, objects
 * field by field); anything else keeps the current value. What a member
 * sends can so never put a field, a type or a size here this viewer would
 * not have made itself.
 */
export function shaped<T>(current: T, incoming: unknown, opts: ShapeOpts = {}, depth = 0, name = ''): T {
  if (depth > 8) return current;
  const cur = current as unknown;
  if (name && opts.nullable?.has(name) && incoming === null) return null as T;
  if (name && opts.records?.has(name)) {
    if (!isObj(incoming)) return current;
    const keys = Object.keys(incoming);
    if (keys.length > MAX_ITEMS || !keys.every((k) => k.length <= MAX_TEXT && plain(incoming[k]))) return current;
    return { ...incoming } as T;
  }
  if (cur === null || cur === undefined) {
    if (plain(incoming)) return (name && opts.nullable?.has(name)) || incoming !== null ? (incoming as T) : current;
    if (name && opts.nullable?.has(name) && Array.isArray(incoming) && incoming.length <= MAX_ITEMS && incoming.every(plain)) return incoming as T;
    return current;
  }
  if (typeof cur === 'number') return (typeof incoming === 'number' && Number.isFinite(incoming) ? incoming : cur) as T;
  if (typeof cur === 'boolean') return (typeof incoming === 'boolean' ? incoming : cur) as T;
  if (typeof cur === 'string') return (typeof incoming === 'string' && incoming.length <= MAX_TEXT ? incoming : cur) as T;
  if (Array.isArray(cur)) {
    if (!Array.isArray(incoming) || incoming.length > MAX_ITEMS) return current;
    if (!cur.length) return (incoming.every(plain) ? incoming : cur) as T;
    // Each item as the first one here is; a list with one that is not stays as it was.
    return (incoming.every((x) => fits(cur[0], x, opts, depth + 1)) ? incoming.map((x) => shaped(cur[0], x, opts, depth + 1)) : cur) as T;
  }
  if (isObj(cur)) {
    if (!isObj(incoming)) return current;
    const out: Record<string, unknown> = { ...cur };
    for (const k of Object.keys(cur)) if (k in incoming && typeof cur[k] !== 'function') out[k] = shaped(cur[k], incoming[k], opts, depth + 1, k);
    return out as T;
  }
  return current;
}
