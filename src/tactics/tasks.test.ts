import { describe, expect, it } from 'vitest';
import { emptyPlan, playbackAt, posesAt, readPlan, type Plan, type Vec3 } from './plan';
import { gamePreset } from './games';
import { orbitPath, patrolPath, sweepPath, taskSchedule, winKey, type PlanTask } from './tasks';
import { planTimings, stepDuration, topSpeed } from './timing';
import { applyOps, diffPlans } from './ops';
import { badgeMesh, coneMesh, svgPaths, badgeStrokes } from './taskSymbols';
import { TASKS } from './tasks';

const at = (x: number, z: number, y = 0): Vec3 => ({ x, y, z });

/** A plan in metres with figures standing at points, and routes where given. */
function board(figs: { id: string; kind: string; at: Vec3; route?: Vec3[] }[]): Plan {
  const plan = emptyPlan('squad', gamePreset('squad').teams);
  plan.unitsPerMetre = 1;
  plan.steps = [{ name: '1', seconds: 4 }];
  for (const f of figs) {
    plan.figures.push({ id: f.id, kind: f.kind, team: plan.teams[0].id, label: f.id, keys: { 0: { ...f.at, yaw: 0 } }, from: 0 });
    if (f.route) plan.arrows.push({ id: `r-${f.id}`, step: 0, team: plan.teams[0].id, style: 'move', points: [f.at, ...f.route], figure: f.id });
  }
  return plan;
}
const task = (t: Partial<PlanTask> & Pick<PlanTask, 'id' | 'kind'>): PlanTask => ({ team: 'blufor', figures: [], step: 0, ...t });
const poseAt = (plan: Plan, t: number, id: string) => {
  const p = playbackAt(plan, t);
  return posesAt(plan, p.step, p.u).get(id)!;
};

describe('task paths', () => {
  it('goes round a patrol route back to its start, or there and back', () => {
    const pts = [at(0, 0), at(10, 0), at(10, 10)];
    const loop = patrolPath(pts, 'loop');
    expect(loop).toHaveLength(4);
    expect(loop[3]).toEqual(pts[0]);
    const back = patrolPath(pts, 'back');
    expect(back.map((p) => [p.x, p.z])).toEqual([[0, 0], [10, 0], [10, 10], [10, 0], [0, 0]]);
  });

  it('sweeps a circle in lanes inside it, turning at the ends', () => {
    const path = sweepPath([at(0, 0), at(100, 0)], 'lanes', 20, Math.PI / 2);
    expect(path.length).toBe(20);
    for (const p of path) expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(100 + 1e-6);
    // Lanes along +x (bearing pi/2), each the other way from the last.
    expect(Math.sign(path[1].x - path[0].x)).toBe(-Math.sign(path[3].x - path[2].x));
    expect(Math.abs(path[1].z - path[0].z)).toBeLessThan(1e-6);
  });

  it('cuts lanes to a polygon, and grows an expanding square to its edge', () => {
    const square = [at(0, 0), at(50, 0), at(50, 50), at(0, 50)];
    const lanes = sweepPath(square, 'lanes', 10);
    for (const p of lanes) {
      expect(p.x).toBeGreaterThanOrEqual(-1e-6);
      expect(p.x).toBeLessThanOrEqual(50 + 1e-6);
      expect(p.z).toBeGreaterThanOrEqual(-1e-6);
      expect(p.z).toBeLessThanOrEqual(50 + 1e-6);
    }
    expect(lanes.length).toBe(10);
    const es = sweepPath([at(0, 0), at(60, 0)], 'square', 10);
    expect(es[0]).toEqual(at(0, 0));
    const legs = es.slice(1).map((p, i) => Math.hypot(p.x - es[i].x, p.z - es[i].z));
    expect(legs.slice(0, 4).map((l) => Math.round(l))).toEqual([10, 10, 20, 20]);
    for (const p of es) expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(60 + 1e-6);
  });

  it('flies a sector search as three triangles through the middle', () => {
    const s = sweepPath([at(0, 0), at(30, 0)], 'sector', 5, 0);
    expect(s).toHaveLength(10);
    for (const i of [0, 3, 6, 9]) expect(Math.hypot(s[i].x, s[i].z)).toBeLessThan(1e-6);
    for (const i of [1, 2, 4, 5, 7, 8]) expect(Math.hypot(s[i].x, s[i].z)).toBeCloseTo(30);
  });

  it('orbits in a circle or a racetrack at its height', () => {
    const c = orbitPath([at(0, 0)], 500, 3000);
    for (const p of c) {
      expect(Math.hypot(p.x, p.z)).toBeCloseTo(500);
      expect(p.y).toBe(3000);
    }
    const r = orbitPath([at(0, 0), at(0, -4000)], 500, 2000);
    expect(r[0]).toEqual(at(0, 0, 2000));
    expect(r[r.length - 1]).toEqual(at(0, 0, 2000));
    expect(Math.max(...r.map((p) => p.x))).toBeCloseTo(1000);
  });
});

describe('the task schedule', () => {
  it('loops a patrol for its loops, then brings the figure back where it stood', () => {
    const plan = board([{ id: 'a', kind: 'soldier', at: at(0, 0) }]);
    plan.steps[0].seconds = 400;
    plan.tasks.push(task({ id: 'p', kind: 'patrol', figures: ['a'], start: 0, loops: 2, points: [at(0, 0), at(40, 0), at(40, 40), at(0, 40)] }));
    const s = taskSchedule(plan);
    const w = s.windows.get(winKey('p', 'a'))!;
    const mp = s.moves.get('a')![0];
    const loop = mp.segs.find((x) => x.period)!;
    expect(w.t1 - w.t0).toBeCloseTo(2 * loop.timing!.total, 3);
    expect(s.conflicts).toEqual([]);
    // A quarter of the way round: on the first leg's end.
    const q = poseAt(plan, loop.timing!.total / 4, 'a');
    expect(q.x).toBeCloseTo(40, 0);
    expect(q.z).toBeCloseTo(0, 0);
    const end = poseAt(plan, w.t1 + 1, 'a');
    expect(end.x).toBeCloseTo(0);
    expect(end.z).toBeCloseTo(0);
  });

  it('waits on the route for a patrol at a waypoint, and the step lasts for it', () => {
    const plan = board([{ id: 'a', kind: 'soldier', at: at(0, 0), route: [at(50, 0)] }]);
    const before = stepDuration(structuredClone(plan), 0);
    plan.tasks.push(task({ id: 'p', kind: 'patrol', figures: ['a'], on: { step: 0, from: 1 }, loops: 1, points: [at(50, 0), at(50, 30), at(80, 30)] }));
    const t = planTimings(plan).get('r-a')!;
    const s = taskSchedule(plan);
    const w = s.windows.get(winKey('p', 'a'))!;
    expect(t.depart[1] - t.arrive[1]).toBeGreaterThan(10);
    expect(w.t1 - w.t0).toBeCloseTo(t.depart[1] - t.arrive[1], 3);
    expect(stepDuration(plan, 0)).toBeGreaterThan(before + 10);
    const mid = poseAt(plan, (w.t0 + w.t1) / 2, 'a');
    expect(Math.hypot(mid.x - 50, mid.z)).toBeGreaterThan(5);
  });

  it('holds at a waypoint until its go-code, and says when the code is never given', () => {
    const plan = board([{ id: 'a', kind: 'soldier', at: at(0, 0), route: [at(60, 0)] }]);
    plan.steps[0].seconds = 1;
    plan.codes.push({ id: 'c1', name: 'ALPHA', at: 20 });
    plan.tasks.push(task({ id: 'h', kind: 'hold', figures: ['a'], on: { step: 0, from: 0 }, trigger: { kind: 'code', code: 'c1' } }));
    expect(planTimings(plan).get('r-a')!.depart[0]).toBeCloseTo(20, 3);
    expect(poseAt(plan, 10, 'a').x).toBeCloseTo(0);
    expect(poseAt(plan, 22, 'a').x).toBeGreaterThan(1);
    const never = structuredClone(plan);
    never.codes[0] = { id: 'c1', name: 'ALPHA' };
    const c = taskSchedule(never).conflicts.find((x) => x.kind === 'trigger');
    expect(c?.reason).toBe('code');
  });

  it('holds until another figure reaches its waypoint', () => {
    const plan = board([
      { id: 'a', kind: 'soldier', at: at(0, 0), route: [at(30, 0)] },
      { id: 'b', kind: 'soldier', at: at(0, 50), route: [at(100, 50)] },
    ]);
    plan.tasks.push(task({ id: 'h', kind: 'hold', figures: ['a'], on: { step: 0, from: 0 }, trigger: { kind: 'reach', figure: 'b', step: 0, point: 1 } }));
    const tm = planTimings(plan);
    expect(tm.get('r-a')!.depart[0]).toBeCloseTo(tm.get('r-b')!.arrive[1], 3);
  });

  it('speeds a patrol up to fit its time, and says when even the top speed cannot', () => {
    const plan = board([{ id: 'a', kind: 'soldier', at: at(0, 0) }]);
    plan.steps[0].seconds = 1000;
    const pts = [at(0, 0), at(100, 0), at(100, 100), at(0, 100)];
    plan.tasks.push(task({ id: 'p', kind: 'patrol', figures: ['a'], start: 0, loops: 1, points: pts }));
    const loop = taskSchedule(plan).moves.get('a')![0].segs.find((x) => x.period)!.timing!.total;
    const top = topSpeed(plan, plan.figures[0])!;
    const fits = structuredClone(plan);
    fits.tasks[0].duration = Math.max(400 / top + 1, loop * 0.9);
    expect(taskSchedule(fits).conflicts.filter((c) => c.kind === 'fit')).toEqual([]);
    const tight = structuredClone(plan);
    tight.tasks[0].duration = (400 / top) * 0.5;
    const c = taskSchedule(tight).conflicts.find((x) => x.kind === 'fit');
    expect(c && c.needs! > c.given!).toBe(true);
  });

  it('flags two moving tasks at once, firing under weapons hold, and an air task for a soldier', () => {
    const plan = board([{ id: 'a', kind: 'soldier', at: at(0, 0) }]);
    plan.steps[0].seconds = 300;
    plan.tasks.push(
      task({ id: 'p', kind: 'patrol', figures: ['a'], start: 0, duration: 100, points: [at(0, 0), at(20, 0)] }),
      task({ id: 's', kind: 'sweep', figures: ['a'], start: 50, duration: 100, points: [at(0, 0), at(30, 0)] }),
      task({ id: 'x', kind: 'suppress', figures: ['a'], start: 0, duration: 50 }),
      task({ id: 'r', kind: 'roe', figures: ['a'], start: 10, duration: 20, state: 'hold' }),
      task({ id: 'o', kind: 'orbit', figures: ['a'], start: 200, duration: 50, points: [at(0, 0)] }),
    );
    const kinds = taskSchedule(plan).conflicts.map((c) => `${c.kind}:${c.task}${c.other ? `/${c.other}` : ''}`);
    expect(kinds).toContain('moves:p/s');
    expect(kinds).toContain('roe:x/r');
    expect(kinds).toContain('domain:o');
  });

  it('follows another figure behind it once it has caught up', () => {
    const plan = board([
      { id: 'lead', kind: 'mbt', at: at(0, 0), route: [at(0, -400)] },
      { id: 'w', kind: 'mbt', at: at(10, 20) },
    ]);
    plan.tasks.push(task({ id: 'f', kind: 'follow', figures: ['w'], target: 'lead', start: 0, offset: 25 }));
    const t = 20;
    const l = poseAt(plan, t, 'lead');
    const w = poseAt(plan, t, 'w');
    expect(w.x).toBeCloseTo(l.x, 0);
    expect(w.z - l.z).toBeCloseTo(25, 0);
  });

  it('flies an orbit at its height for an aircraft, banked in the turns', () => {
    const plan = board([{ id: 'v', kind: 'f-16c', at: at(0, 0, 3000) }]);
    plan.steps[0].seconds = 600;
    plan.tasks.push(task({ id: 'o', kind: 'orbit', figures: ['v'], start: 0, duration: 500, points: [at(0, 0)], range: 4000, altitude: 5000, speed: 200 }));
    expect(taskSchedule(plan).conflicts).toEqual([]);
    const p = poseAt(plan, 200, 'v');
    expect(p.y).toBeCloseTo(5000, 0);
    expect(Math.hypot(p.x, p.z)).toBeCloseTo(4000, -1);
    expect(Math.abs(p.roll ?? 0)).toBeGreaterThan(0.3);
  });
});

describe('plan files with tasks', () => {
  it('reads a version 2 plan as version 3 with no tasks or codes', () => {
    const v2 = { version: 2, title: 'old', game: 'squad', level: '', teams: [{ id: 'a', name: 'A', color: [1, 0, 0] }], steps: [{ name: '1', seconds: 4 }], layers: [{ id: 'base', name: 'Base', visible: true, locked: false }], figures: [], arrows: [], areas: [], notes: [], drawings: [], figureScale: 1 };
    const p = readPlan(JSON.stringify(v2));
    expect(p.version).toBe(3);
    expect(p.tasks).toEqual([]);
    expect(p.codes).toEqual([]);
  });

  it('keeps tasks through a save, a game task by its own name, and on their layers', () => {
    const plan = board([{ id: 'a', kind: 'soldier', at: at(0, 0) }]);
    plan.layers.push({ id: 'l2', name: 'Two', visible: true, locked: false });
    plan.codes.push({ id: 'c', name: 'GO', at: 12 });
    plan.tasks.push(task({ id: 'h', kind: 'hold', figures: ['a'], on: { step: 0, from: 0 }, trigger: { kind: 'code', code: 'c' }, layer: 'l2' }));
    const raw = JSON.parse(JSON.stringify(plan));
    raw.tasks.push({ id: 'g', kind: 'FAC_AttackGroup', team: 'blufor', figures: ['a'], step: 0, layer: 'gone' });
    const back = readPlan(JSON.stringify(raw));
    expect(back.tasks[0]).toEqual(plan.tasks[0]);
    expect(back.tasks[1]).toMatchObject({ kind: 'game', game: 'FAC_AttackGroup' });
    expect(back.tasks[1].layer).toBeUndefined();
    expect(back.codes).toEqual(plan.codes);
  });

  it('sends task edits as operations', () => {
    const a = board([{ id: 'a', kind: 'soldier', at: at(0, 0) }]);
    const b = structuredClone(a);
    b.tasks.push(task({ id: 't', kind: 'recon', figures: ['a'], start: 0, arc: 1 }));
    b.codes.push({ id: 'c', name: 'GO' });
    const ops = diffPlans(a, b);
    expect(ops.map((o) => `${o.op}:${'coll' in o ? o.coll : ''}`)).toEqual(['add:tasks', 'add:codes']);
    const c = structuredClone(b);
    c.tasks[0].arc = 2;
    const ops2 = diffPlans(b, c);
    expect(ops2).toEqual([{ op: 'set', coll: 'tasks', id: 't', fields: { arc: 2 } }]);
    expect(applyOps(applyOps(a, ops), ops2).tasks).toEqual(c.tasks);
  });
});

describe('task symbols', () => {
  it('has a badge and a drawing for every task', () => {
    for (const d of TASKS) {
      const m = badgeMesh(d.id);
      expect(m.count).toBeGreaterThan(30);
      expect(m.count % 3).toBe(0);
      expect(svgPaths(badgeStrokes(d.id).picto).lines.length + svgPaths(badgeStrokes(d.id).picto).fills.length).toBeGreaterThan(5);
    }
    expect(coneMesh(Math.PI / 3)).toBe(coneMesh(Math.PI / 3 + 0.01));
  });

  it('gives each task its own quick digit and code', () => {
    const quick = TASKS.filter((t) => t.quick).map((t) => t.quick);
    expect(new Set(quick).size).toBe(quick.length);
    expect(quick.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(new Set(TASKS.map((t) => t.code)).size).toBe(TASKS.length);
  });
});
