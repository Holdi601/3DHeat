import { describe, expect, it } from 'vitest';
import { classifyEvent, eventInView, isCut, nextShot, type DirectorEvent, type DirectorUnit, type Shot } from './director';

const units: DirectorUnit[] = [
  { person: 1, air: true, speed: 200 },
  { person: 2, air: true, speed: 300 },
  { person: 3, air: false, speed: 10 },
];

describe('director', () => {
  it('weighs event kinds', () => {
    expect(classifyEvent('kill')).toBe('kill');
    expect(classifyEvent('Shot down')).toBe('kill');
    expect(classifyEvent('missile_launch')).toBe('launch');
    expect(classifyEvent('hit_critical')).toBe('hit');
    expect(classifyEvent('takeoff')).toBe('other');
  });

  it('films the fastest flier between events, then moves on with the next kind', () => {
    const a = nextShot(10, null, [], units)!;
    expect(a).toMatchObject({ person: 2, kind: 'chase', event: null });
    // Held while it has time.
    expect(nextShot(12, a, [], units)).toBe(a);
    const b = nextShot(a.until + 0.1, a, [], units)!;
    expect(b.person).toBe(1);
    expect(b.kind).toBe('flyby');
    expect(isCut(a, b)).toBe(true);
  });

  it('cuts to a coming kill with an orbit, but never inside the minimum hold', () => {
    const events: DirectorEvent[] = [{ time: 20, person: 3, kind: 'kill' }];
    const cur: Shot = {
      person: 2,
      kind: 'chase',
      start: 16,
      until: 25,
      event: null,
    };
    // 17.5: kill within the lead, but the shot started 1.5 s ago.
    expect(nextShot(17.5, cur, events, units)).toBe(cur);
    const s = nextShot(19.2, cur, events, units)!;
    expect(s).toMatchObject({ person: 3, kind: 'orbit', event: 20 });
    expect(s.until).toBeGreaterThanOrEqual(24);
    // And stays on it through the event.
    expect(nextShot(21, s, events, units)).toBe(s);
  });

  it('prefers the weightiest event and skips dead units', () => {
    const events: DirectorEvent[] = [
      { time: 30, person: 1, kind: 'hit' },
      { time: 31, person: 9, kind: 'kill' },
      { time: 31.5, person: 2, kind: 'launch' },
    ];
    const alive = (p: number) => p !== 9;
    expect(eventInView(29.5, events, alive, 3)).toMatchObject({
      person: 2,
      kind: 'launch',
    });
    expect(nextShot(29.5, null, events, units)).toMatchObject({
      person: 2,
      kind: 'chase',
    });
  });

  it('drops a shot whose unit is gone at once', () => {
    const cur: Shot = {
      person: 7,
      kind: 'orbit',
      start: 5,
      until: 15,
      event: null,
    };
    expect(nextShot(5.5, cur, [], units)!.person).not.toBe(7);
  });
});
