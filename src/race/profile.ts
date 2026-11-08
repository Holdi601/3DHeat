/**
 * What kind of car it is, from how it went round: how much grip it holds, how
 * easily its rear lets go, how hard it pulls and where it runs out of pull,
 * how hard it stops - measured from every loaded lap of it, and said in plain
 * words against another car.
 *
 * The analysis needs this to be fair to the driver. A car that cannot turn as
 * well will not match a better-turning car through a corner by braking later
 * or earlier; a car that loses its rear easily cannot use all of its grip on
 * the way out; a car that runs out of pull halfway down a straight loses there
 * whatever the exit. So each corner is judged against what this car does, and
 * the tips say how to make the most of it. See docs/race-analytics.md, "The
 * cars".
 *
 * - **Grip** is what the car holds for half a second - the 95th percentile of
 *   its lateral acceleration averaged over 0.5 s - not the peak of a single
 *   sample: a kerb, a slide snapping back or a car being caught all spike the
 *   lateral acceleration for a moment, and a car that does that often looks
 *   grippier than it is.
 * - **Losing the rear** is counted where the driver had to catch it: the car
 *   sliding (10° or more of drift on tarmac, 20° on loose ground) with the
 *   steering against the turn. A car driven a little sideways on purpose is
 *   not losing anything; one that needs opposite lock is.
 * - **Pull** is the full-throttle acceleration the car showed in each speed
 *   band, and **top speed** where it stopped gaining at full throttle on a
 *   straight - driven straight, not a long bend taken flat, where a car
 *   scrubs speed at any power. Where no straight was long enough, what it was
 *   still pulling at its fastest says how far off its top speed it was: no
 *   guess beyond what the laps show, since gearing and the limiter end a
 *   car's pull before drag does.
 */

import { list, num, t } from '../i18n';
import { slipScale } from './control';
import { at, grounded, heldAbs, HOLD, strengths, type Envelope } from './envelope';
import { struckMask } from './impacts';
import { groundAt, type LapTrace } from './lap';
import { speedArg } from '../state/unitsStore';

export interface CarProfile {
  key: string;
  laps: number;
  /** Ground the laps were driven on. */
  surface: 'tarmac' | 'loose' | 'mixed';
  /** Lateral acceleration held for half a second, m/s²: 95th percentile. */
  grip: number;
  /** Of hard cornering (at 60% of that grip or more): the share past the drift that counts as sliding, and the median drift, radians. NaN with no drift angle. */
  sideways: number;
  drift: number;
  /**
   * Times a lap the rear stepped out far enough to be caught with opposite
   * lock; the share of them that began on the throttle; and the half-second
   * lateral acceleration at which they began, as a share of the grip. NaN
   * without steering or drift angle.
   */
  rearSlides: number;
  onPower: number;
  letsGo: number;
  /** Front minus rear slip angle at the limit, as multiples of the nominal peak: + pushes wide, - turns in sharply. NaN without slip angles. */
  balance: number;
  /** Full-throttle pull, m/s²: to 50 km/h, 50-120, 120-200, above 200; the most it showed and at what speed. */
  pull: { launch: number; low: number; mid: number; high: number; peak: number; peakAt: number };
  /** Braking, m/s², 60-160 km/h. */
  braking: number;
  /** The fastest it went, m/s. */
  vmax: number;
  /** Where it stopped gaining at full throttle on a straight, m/s; NaN where no straight was long enough. */
  topsOut: number;
  /** Full-throttle pull at its fastest, m/s²: how far it still had to go. */
  pullAtTop: number;
}

/** Drift past this is sliding, for every car alike: on tarmac, and on loose ground. */
const SLIDING = { tarmac: (10 * Math.PI) / 180, loose: (20 * Math.PI) / 180 };

function finite(v: number): boolean {
  return Number.isFinite(v);
}

function percentile(values: number[], p: number): number {
  if (!values.length) return Number.NaN;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))];
}

/** The car's laps, measured. `env` is its envelope, for the pull and the braking. */
export function profile(key: string, laps: LapTrace[], env: Envelope): CarProfile {
  const held: number[] = [];
  const hard: { drift: number; sliding: boolean }[] = [];
  const balance: number[] = [];
  let slides = 0;
  let onPower = 0;
  const letGo: number[] = [];
  let loose = 0;
  let total = 0;
  let vmax = 0;
  const plateau: number[] = [];
  let plateauTime = 0;
  let hasSlides = false;

  // Grip first: every other measure is relative to it.
  const perLap = laps.map((lap) => {
    const c = lap.channels;
    const n = lap.count;
    const settled = grounded(c, n);
    const struck = struckMask(lap);
    const ok = (i: number) => settled[i] === 1 && struck[i] === 0 && c.speed[i] > 8;
    const lat = c.latAcc ? heldAbs(c.time, c.latAcc, HOLD) : null;
    if (lat) for (let i = 0; i < n; i++) if (ok(i)) held.push(lat[i]);
    return { lap, c, n, ok, lat };
  });
  const grip = percentile(held, 0.95);

  for (const { lap, c, n, ok, lat } of perLap) {
    const { speed, steer, bodySlip: beta, throttle, brake, time } = c;
    // Which way steering and cornering force agree in this game: their sign
    // while turning without sliding.
    let agree = 0;
    if (steer && c.latAcc) {
      for (let i = 0; i < n; i++) {
        if (ok(i) && Math.abs(steer[i]) > 0.05 && Math.abs(c.latAcc[i]) > 3 && !(beta && Math.abs(beta[i]) > 0.05)) {
          agree += Math.sign(steer[i]) * Math.sign(c.latAcc[i]);
        }
      }
    }
    const angles = (['FL', 'FR', 'RL', 'RR'] as const).map((w) => c[`slipAngle.${w}`]);
    const hasAngles = angles.every(Boolean);
    let inSlide = false;
    for (let i = 0; i < n; i++) {
      if (!ok(i)) {
        inSlide = false;
        continue;
      }
      vmax = Math.max(vmax, speed[i]);
      const ground = groundAt(c, lap, i);
      total++;
      if (ground === 'loose') loose++;
      if (!lat || !finite(grip) || lat[i] < 0.6 * grip) {
        inSlide = false;
        continue;
      }
      const drift = beta ? Math.abs(beta[i]) : Number.NaN;
      const sliding = finite(drift) && drift > SLIDING[ground];
      if (beta) hard.push({ drift, sliding });
      if (hasAngles && !sliding) {
        const scale = slipScale(lap, ground).angle;
        const front = Math.max(Math.abs(angles[0]![i]), Math.abs(angles[1]![i]));
        const rear = Math.max(Math.abs(angles[2]![i]), Math.abs(angles[3]![i]));
        balance.push((front - rear) / scale);
      }
      // Caught with opposite lock: sliding, the wheel turned against the corner.
      const caught =
        sliding &&
        !!steer &&
        agree !== 0 &&
        Math.abs(steer[i]) > 0.06 &&
        Math.sign(steer[i]) * Math.sign(c.latAcc[i]) === -Math.sign(agree);
      if (steer && beta && agree !== 0) hasSlides = true;
      if (caught && !inSlide) {
        slides++;
        if ((throttle?.[i] ?? 0) > 0.5 && !((brake?.[i] ?? 0) > 0.1)) onPower++;
        // Where it let go: the held lateral a moment before.
        let k = i;
        while (k > 0 && time[i] - time[k] < 0.15) k--;
        if (finite(lat[k])) letGo.push(lat[k] / grip);
      }
      inSlide = caught || (inSlide && sliding);
    }
    // Topping out: full throttle for a second around it, driven straight, not
    // gaining any more.
    if (throttle) {
      // Near the fastest the lap went: full throttle up a hill or through a
      // long bend also stops gaining, well below the car's top speed.
      let lapMax = 0;
      for (let i = 0; i < n; i++) if (ok(i)) lapMax = Math.max(lapMax, speed[i]);
      const off = new Int32Array(n + 1);
      const straight = (i: number) => !c.latAcc || Math.abs(c.latAcc[i]) < Math.max(4, 0.25 * grip);
      for (let i = 0; i < n; i++) off[i + 1] = off[i] + (throttle[i] > 0.95 && !((brake?.[i] ?? 0) > 0.05) && ok(i) && straight(i) ? 0 : 1);
      let lo = 0;
      let hi = 0;
      for (let i = 0; i < n; i++) {
        while (lo < i && time[i] - time[lo] > 0.5) lo++;
        while (hi + 1 < n && time[hi + 1] - time[i] <= 0.5) hi++;
        if (time[hi] - time[lo] < 0.9 || off[hi + 1] - off[lo] > 0) continue;
        const gain = (speed[hi] - speed[lo]) / (time[hi] - time[lo]);
        if (gain < 0.35 && speed[i] > 25 && speed[i] > 0.9 * lapMax) {
          plateau.push(speed[i]);
          if (i > 0) plateauTime += Math.min(0.1, time[i] - time[i - 1]);
        }
      }
    }
  }

  const s = strengths(env);
  const band = (from: number, to: number) => {
    let sum = 0;
    let k = 0;
    for (let v = from; v <= to; v += 1) {
      const a = at(env.accel, v);
      if (finite(a) && v <= vmax + 2) {
        sum += a;
        k++;
      }
    }
    return k >= 3 ? sum / k : Number.NaN;
  };
  let peak = Number.NaN;
  let peakAt = Number.NaN;
  env.accel.forEach((a, b) => {
    if (finite(a) && !(a <= peak)) {
      peak = a;
      peakAt = (b + 0.5) * 5;
    }
  });
  // A second of plateau, all told: where it topped out.
  const topsOut = plateauTime >= 1 ? percentile(plateau, 0.5) : Number.NaN;
  const sideways = hard.length >= 30 ? hard.filter((h) => h.sliding).length / hard.length : Number.NaN;
  return {
    key,
    laps: laps.length,
    surface: total && loose / total > 0.8 ? 'loose' : total && loose / total < 0.2 ? 'tarmac' : 'mixed',
    grip,
    sideways,
    drift: hard.length >= 30 ? percentile(hard.map((h) => h.drift), 0.5) : Number.NaN,
    rearSlides: hasSlides ? slides / laps.length : Number.NaN,
    onPower: slides ? onPower / slides : Number.NaN,
    letsGo: letGo.length ? percentile(letGo, 0.5) : Number.NaN,
    balance: balance.length >= 30 ? balance.reduce((a, b) => a + b, 0) / balance.length : Number.NaN,
    pull: { launch: band(3, 14), low: band(14, 33), mid: band(33, 56), high: band(56, 90), peak, peakAt },
    braking: s.braking,
    vmax,
    topsOut,
    pullAtTop: vmax > 0 ? at(env.accel, vmax) : Number.NaN,
  };
}

// ---------------------------------------------------------------- in words

const v1 = (v: number) => num(v, 1);
const kmhOf = (v: number) => speedArg(v);
const pct = (r: number) => num(Math.abs(r - 1) * 100);

/** One car against another: what each is better at, and how that shows. */
export interface CarVerdict {
  /** A sentence each: what the car is, against the other. */
  summary: [string, string];
  /** The differences, one sentence each, the biggest first. */
  points: string[];
  /** How to drive each of them, from that. */
  driving: string[];
}

/**
 * Two cars, side by side, in words. Only differences the laps show clearly
 * are said: 4% of grip, 5% of pull or braking, 4 km/h of top speed, a rear
 * that had to be caught at least once a lap more and half again as often.
 */
export function compareProfiles(a: CarProfile, b: CarProfile, na: string, nb: string): CarVerdict {
  // What each car does better or worse: the keys of `race.cars.trait.*`, said after its name.
  const plus: [string[], string[]] = [[], []];
  const minus: [string[], string[]] = [[], []];
  const points: { size: number; text: string }[] = [];
  const driving: string[] = [];
  const loose = a.surface !== 'tarmac' && b.surface !== 'tarmac';
  const better = (x: number, y: number) => (x > y ? 0 : 1);
  const names = [na, nb];

  // Grip.
  if (finite(a.grip) && finite(b.grip) && Math.abs(a.grip / b.grip - 1) >= 0.04) {
    const w = better(a.grip, b.grip);
    const [hi, lo] = w === 0 ? [a.grip, b.grip] : [b.grip, a.grip];
    plus[w].push('moreGrip');
    minus[1 - w].push('lessGrip');
    points.push({
      size: hi / lo - 1,
      text: t('race.cars.grip', { better: names[w], worse: names[1 - w], more: pct(hi / lo), hi: v1(hi), lo: v1(lo), speed: pct(Math.sqrt(hi / lo)) }),
    });
  }
  // Pull: the band both cars drove most of, the higher the better.
  const bands: (keyof CarProfile['pull'])[] = ['mid', 'low', 'high'];
  const pulls = bands.filter((k) => finite(a.pull[k]) && finite(b.pull[k]));
  if (pulls.length) {
    const k = pulls[0];
    const r = a.pull[k] / b.pull[k];
    if (Math.abs(r - 1) >= 0.05) {
      const w = r > 1 ? 0 : 1;
      const [hi, lo] = w === 0 ? [a.pull[k], b.pull[k]] : [b.pull[k], a.pull[k]];
      const launch =
        finite(a.pull.launch) && finite(b.pull.launch) && Math.abs(a.pull.launch / b.pull.launch - 1) >= 0.08
          ? (a.pull.launch > b.pull.launch) === (w === 0)
            ? 'too'
            : 'other'
          : 'none';
      plus[w].push('morePull');
      minus[1 - w].push('lessPull');
      points.push({
        size: hi / lo - 1,
        text: t('race.cars.pull', { better: names[w], worse: names[1 - w], more: pct(hi / lo), band: k, hi: v1(hi), lo: v1(lo), launch }),
      });
    }
  }
  // Top speed: where each ran out of pull on these straights, or would.
  const top = (p: CarProfile) => (finite(p.topsOut) ? p.topsOut : Number.NaN);
  if (finite(top(a)) && finite(top(b)) && Math.abs(top(a) - top(b)) >= 4 / 3.6) {
    const w = better(top(a), top(b));
    plus[w].push('higherTop');
    minus[1 - w].push('lowerTop');
    points.push({
      size: Math.abs(top(a) / top(b) - 1),
      text: t('race.cars.top', { better: names[w], worse: names[1 - w], hi: kmhOf(Math.max(top(a), top(b))), lo: kmhOf(Math.min(top(a), top(b))) }),
    });
  } else if (finite(top(a)) !== finite(top(b))) {
    const w = finite(top(a)) ? 1 : 0;
    const capped = w === 0 ? b : a;
    const free = w === 0 ? a : b;
    plus[w].push('stillPulls');
    minus[1 - w].push('runsOut');
    points.push({
      size: 0.05,
      text: t('race.cars.topOne', { capped: names[1 - w], free: names[w], top: kmhOf(capped.topsOut), fastest: kmhOf(free.vmax) }),
    });
  }
  if (!finite(top(a)) && !finite(top(b)) && finite(a.pullAtTop) && finite(b.pullAtTop) && a.vmax > 0 && b.vmax > 0) {
    points.push({
      size: 0.01,
      text: t('race.cars.topNeither', { a: names[0], b: names[1], pullA: v1(a.pullAtTop), atA: kmhOf(a.vmax), pullB: v1(b.pullAtTop), atB: kmhOf(b.vmax) }),
    });
  }
  // Braking.
  if (finite(a.braking) && finite(b.braking) && Math.abs(a.braking / b.braking - 1) >= 0.05) {
    const w = better(a.braking, b.braking);
    const [hi, lo] = w === 0 ? [a.braking, b.braking] : [b.braking, a.braking];
    plus[w].push('stopsHarder');
    minus[1 - w].push('stopsLonger');
    points.push({
      size: hi / lo - 1,
      text: t('race.cars.braking', { better: names[w], worse: names[1 - w], more: pct(hi / lo), hi: v1(hi), lo: v1(lo) }),
    });
  }
  // The rear.
  if (finite(a.rearSlides) && finite(b.rearSlides)) {
    const w = a.rearSlides > b.rearSlides ? 0 : 1;
    const [hi, lo] = w === 0 ? [a.rearSlides, b.rearSlides] : [b.rearSlides, a.rearSlides];
    if (hi >= lo + 1 && hi >= 1.5 * lo) {
      const p = w === 0 ? a : b;
      const power = finite(p.onPower) && p.onPower >= 0.6;
      minus[w].push(loose ? 'catchesMore' : hi >= 2 * lo + 1 ? 'muchLooser' : 'looser');
      plus[1 - w].push('stabler');
      points.push({
        size: Math.min(1, (hi - lo) / Math.max(1, lo)) * 0.3,
        text: t('race.cars.rear', {
          loose: names[w],
          stable: names[1 - w],
          hi: v1(hi),
          lo: v1(lo),
          how: power ? 'power' : finite(p.onPower) && p.onPower <= 0.3 ? 'entry' : 'none',
          from: finite(p.letsGo) ? num(p.letsGo * 100) : 'none',
          ground: loose ? 'loose' : 'tarmac',
        }),
      });
      driving.push(t('race.cars.driveLoose', { name: names[w], how: power ? 'power' : 'entry' }));
    }
  }
  if (finite(a.sideways) && finite(b.sideways) && Math.abs(a.sideways - b.sideways) >= 0.12) {
    const w = a.sideways > b.sideways ? 0 : 1;
    points.push({
      size: Math.abs(a.sideways - b.sideways) * 0.3,
      text: t('race.cars.sideways', {
        more: names[w],
        less: names[1 - w],
        hi: num((w === 0 ? a.sideways : b.sideways) * 100),
        lo: num((w === 0 ? b.sideways : a.sideways) * 100),
        angle: loose ? 20 : 10,
      }),
    });
  }
  if (finite(a.balance) && finite(b.balance) && Math.abs(a.balance - b.balance) >= 0.3) {
    const w = a.balance > b.balance ? 0 : 1;
    minus[w].push('pushes');
    points.push({
      size: Math.abs(a.balance - b.balance) * 0.1,
      text: t('race.cars.push', { pushes: names[w], other: names[1 - w] }),
    });
  }
  // How to drive each, from where its strength is.
  const gripWin = finite(a.grip) && finite(b.grip) ? (a.grip > b.grip ? 0 : 1) : -1;
  const pullWin = pulls.length ? (a.pull[pulls[0]] > b.pull[pulls[0]] ? 0 : 1) : -1;
  if (gripWin >= 0 && pullWin >= 0 && gripWin !== pullWin) {
    driving.unshift(t('race.cars.driveLines', { grippy: names[gripWin], strong: names[pullWin] }));
  }
  if (gripWin >= 0 && pullWin >= 0 && gripWin === pullWin) {
    driving.unshift(t('race.cars.driveWeak', { weak: names[1 - gripWin] }));
  }
  const summary = [0, 1].map((k) => {
    const good = list(plus[k].map((x) => t(`race.cars.trait.${x}`)));
    const bad = list(minus[k].map((x) => t(`race.cars.trait.${x}`)));
    if (!plus[k].length && !minus[k].length) return t('race.cars.summaryNone', { name: names[k], other: names[1 - k] });
    if (!minus[k].length) return t('race.cars.summaryOne', { name: names[k], traits: good });
    if (!plus[k].length) return t('race.cars.summaryOne', { name: names[k], traits: bad });
    return t('race.cars.summaryBoth', { name: names[k], good, bad });
  }) as [string, string];
  points.sort((x, y) => y.size - x.size);
  return { summary, points: points.map((p) => p.text), driving };
}

/** One car alone, in words: what the laps show it is. */
export function describeProfile(p: CarProfile, name: string): string[] {
  const out: string[] = [];
  if (finite(p.grip)) out.push(t('race.cars.aloneGrip', { name, grip: v1(p.grip), g: num(p.grip / 9.81, 2) }));
  const pulls = (['launch', 'low', 'mid', 'high'] as const)
    .filter((k) => finite(p.pull[k]))
    .map((k) => t('race.cars.alonePullPart', { v: v1(p.pull[k]), band: k }));
  if (pulls.length) out.push(t('race.cars.alonePull', { parts: list(pulls, 'unit') }));
  if (finite(p.topsOut)) out.push(t('race.cars.aloneTop', { top: kmhOf(p.topsOut) }));
  else if (p.vmax > 0)
    out.push(t('race.cars.aloneNoTop', { fastest: kmhOf(p.vmax), pull: finite(p.pullAtTop) ? v1(p.pullAtTop) : 'none' }));
  if (finite(p.rearSlides)) {
    out.push(
      p.rearSlides >= 1
        ? t('race.cars.aloneRear', { n: v1(p.rearSlides), power: finite(p.onPower) && p.onPower >= 0.6 ? 'yes' : 'no' })
        : t('race.cars.aloneRearNone'),
    );
  }
  return out;
}
