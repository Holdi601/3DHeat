import { describe, expect, it } from 'vitest';
import { shaped, ViewSync, type ViewSlice } from './viewSync';

/** A viewer: a settings object, a clock, and its sync. */
interface Peer {
  id: number;
  state: { mode: string; heat: { radius: number; ramp: number[] } };
  clock: { playing: boolean; speed: number; t: number };
  sync: ViewSync;
}

/** Members wired through a stand-in server that passes messages on at once, with a shared clock. */
function world(n: number, hostId = 1) {
  let now = 0;
  const peers: Peer[] = [];
  const outbox: { from: number; kind: string; json: string; to: number[] }[] = [];
  for (let i = 1; i <= n; i++) {
    const p = {
      id: i,
      state: { mode: 'heat', heat: { radius: 1, ramp: [0, 1] } },
      clock: { playing: false, speed: 1, t: 0 },
    } as Peer;
    const slices: ViewSlice[] = [
      {
        key: 'mode',
        deps: () => [p.state.mode],
        capture: () => p.state.mode,
        apply: (v) => typeof v === 'string' && (p.state.mode = v),
      },
      {
        key: 'heat',
        deps: () => [p.state.heat],
        capture: () => p.state.heat,
        apply: (v) => (p.state.heat = shaped(p.state.heat, v)),
      },
      {
        key: 'play',
        deps: () => [p.clock.playing, p.clock.speed],
        capture: () => ({
          playing: p.clock.playing,
          speed: p.clock.speed,
          reverse: false,
        }),
        apply: (v) => {
          const c = v as { playing: boolean; speed: number };
          p.clock.playing = c.playing;
          p.clock.speed = c.speed;
        },
        clock: { time: () => p.clock.t, seek: (t) => (p.clock.t = t) },
      },
    ];
    p.sync = new ViewSync({
      slices: () => slices,
      me: () => i,
      now: () => now,
      serverNow: () => now,
      send: (kind, json, to) => outbox.push({ from: i, kind, json, to: to ?? [] }),
    });
    p.sync.hostId = () => hostId;
    peers.push(p);
  }
  const deliver = () => {
    while (outbox.length) {
      const m = outbox.shift()!;
      for (const p of peers) {
        if (p.id === m.from || (m.to.length && !m.to.includes(p.id))) continue;
        if (m.kind === 'state') p.sync.takeState(m.from, m.json, now);
        else p.sync.receive(m.from, m.kind as 'change', m.json, now);
      }
    }
  };
  /** Moves the clock on (playing clocks advance) and ticks everyone. */
  const step = (ms: number) => {
    for (let k = 0; k < ms / 100; k++) {
      now += 100;
      for (const p of peers) if (p.clock.playing) p.clock.t += 0.1 * p.clock.speed;
      for (const p of peers) p.sync.tick();
      deliver();
    }
  };
  return { peers, step, deliver, outbox, at: () => now };
}

describe('view sync', () => {
  it('a member change reaches everyone in sync, and nobody sends it back', () => {
    const w = world(3);
    w.step(300);
    const [, b, c] = w.peers;
    b.state.mode = 'lines';
    w.step(500);
    expect(w.peers.map((p) => p.state.mode)).toEqual(['lines', 'lines', 'lines']);
    w.step(1000);
    expect(w.outbox.length).toBe(0);
    // Out of sync: keeps its own, and its own stay with it.
    c.sync.enabled = false;
    b.state.mode = 'team';
    w.step(500);
    expect(c.state.mode).toBe('lines');
    c.state.mode = 'mine';
    w.step(500);
    expect(b.state.mode).toBe('team');
  });

  it("asks before taking the host's changes: apply, ignore, and back", () => {
    const w = world(3);
    w.step(300);
    const [host, b, c] = w.peers;
    host.state.heat = { radius: 5, ramp: [0, 0.5, 1] };
    w.step(500);
    expect(b.sync.pending?.from).toBe(1);
    expect(b.state.heat.radius).toBe(1);
    b.sync.answer(true);
    expect(b.state.heat).toEqual({ radius: 5, ramp: [0, 0.5, 1] });
    c.sync.answer(false);
    expect(c.state.heat.radius).toBe(1);
    // Back to what it had before taking them.
    w.step(2000);
    expect(b.sync.back()).toBe(true);
    expect(b.state.heat.radius).toBe(1);
    // Going back is this viewer's own: nobody else moves.
    w.step(500);
    expect(host.state.heat.radius).toBe(5);
  });

  it('two changing the same slice at once end at the same value', () => {
    const w = world(3);
    w.peers.forEach((p) => (p.sync.askHost = false));
    w.step(300);
    w.peers[1].state.mode = 'b';
    w.peers[2].state.mode = 'c';
    w.step(800);
    const modes = new Set(w.peers.map((p) => p.state.mode));
    expect(modes.size).toBe(1);
  });

  it('playback starts at the same moment for everyone, and drift is caught up', () => {
    const w = world(3);
    w.peers.forEach((p) => (p.sync.askHost = false));
    w.step(300);
    const [a, b, c] = w.peers;
    a.clock.t = 10;
    a.clock.playing = true;
    a.clock.speed = 2;
    w.step(1000);
    for (const p of [b, c]) {
      expect(p.clock.playing).toBe(true);
      expect(p.clock.speed).toBe(2);
      expect(Math.abs(p.clock.t - a.clock.t)).toBeLessThan(0.25);
    }
    // c falls behind (a slow machine); the beat brings it back.
    c.clock.t -= 3;
    w.step(2500);
    expect(Math.abs(c.clock.t - a.clock.t)).toBeLessThan(0.5);
    // A seek while playing goes out too.
    b.clock.t = 100;
    w.step(500);
    expect(Math.abs(a.clock.t - b.clock.t)).toBeLessThan(0.5);
    // Pause.
    b.clock.playing = false;
    w.step(500);
    expect(a.clock.playing).toBe(false);
    expect(c.clock.playing).toBe(false);
  });

  it('looking through someone’s eyes takes their view, then comes back', () => {
    const w = world(3);
    w.step(300);
    const [, b, c] = w.peers;
    c.sync.enabled = false;
    c.state.mode = 'theirs';
    w.step(300);
    b.sync.startPeek(3);
    w.deliver();
    expect(b.state.mode).toBe('theirs');
    // Their later changes come too, even though c is not in sync.
    c.state.mode = 'later';
    w.step(500);
    expect(b.state.mode).toBe('later');
    b.sync.endPeek();
    w.deliver();
    expect(b.state.mode).toBe('heat');
    c.state.mode = 'after';
    w.step(500);
    expect(b.state.mode).toBe('heat');
  });
});

describe('shaped', () => {
  it('takes only known fields of the same types', () => {
    const cur = {
      a: 1,
      b: 'x',
      c: true,
      d: [1, 2],
      e: { f: 1 },
      g: null as string | null,
      list: [{ x: 1 }],
    };
    const out = shaped(cur, {
      a: 'no',
      b: 'y',
      c: 1,
      d: [3, 'x'],
      e: { f: 2, evil: 1 },
      g: 'set',
      h: 5,
      list: [{ x: 2 }, { x: 3 }],
    });
    expect(out).toEqual({
      a: 1,
      b: 'y',
      c: true,
      d: [1, 2],
      e: { f: 2 },
      g: 'set',
      list: [{ x: 2 }, { x: 3 }],
    });
    expect(shaped({ a: [1] }, { a: null })).toEqual({ a: [1] });
    expect(shaped({ a: [1] as number[] | null }, { a: null }, { nullable: new Set(['a']) })).toEqual({ a: null });
    expect(shaped({ a: 1 }, { a: Infinity })).toEqual({ a: 1 });
    expect(shaped({ s: '' }, { s: 'x'.repeat(5000) })).toEqual({ s: '' });
  });
});
