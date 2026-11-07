import { describe, expect, it } from 'vitest';
import { ingestFiles, parseHere, parseInOrder, ParserCrash, type Outcome, type ParseFileFn } from './ingestFiles';
import { progress } from './ingest';
import { fileParseBytes, parseHeadroom } from './memory';
import { msg } from './msg';
import { emptyColumnMapping, type ColumnMapping } from '../state/types';

/**
 * The "Parser threads" budget has to do what it says.
 *
 * It was shown in the resource panel, with a default and a hint, and read by
 * nothing: every file of a selection was parsed one after another in a single
 * worker whatever it was set to. These pin down the three things parsing in
 * parallel must keep — no more than N parses at once, nothing started that the
 * memory budget has no room for, and a merged dataset identical to the one a
 * sequential load builds.
 */

/** A promise and the means to settle it from outside. */
function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

/**
 * A scheduler run whose parses finish only when told to, recording what was in
 * flight at every start.
 */
function harness(count: number, threads: number, headroom = Number.POSITIVE_INFINITY, cost = (_i: number) => 1) {
  const jobs = new Map<number, ReturnType<typeof deferred<number>>>();
  const started: number[] = [];
  const taken: number[] = [];
  let running = 0;
  let maxRunning = 0;
  let reserved = 0;
  let maxReserved = 0;
  const run = parseInOrder<number>({
    count,
    threads,
    headroom,
    cost,
    parse: (i) => {
      started.push(i);
      running++;
      maxRunning = Math.max(maxRunning, running);
      reserved += cost(i);
      maxReserved = Math.max(maxReserved, reserved);
      const d = deferred<number>();
      jobs.set(i, d);
      return d.promise.finally(() => running--);
    },
    take: (i, o: Outcome<number>) => {
      reserved -= cost(i);
      taken.push(i);
      if (!o.ok) throw o.error;
      expect(o.value).toBe(i * 10);
    },
  });
  return {
    run,
    started,
    taken,
    finish: async (i: number) => {
      jobs.get(i)!.resolve(i * 10);
      await tick();
    },
    fail: async (i: number, e: unknown) => {
      jobs.get(i)!.reject(e);
      await tick();
    },
    get running() {
      return running;
    },
    get maxRunning() {
      return maxRunning;
    },
    get maxReserved() {
      return maxReserved;
    },
  };
}

describe('parseInOrder', () => {
  it('runs up to the thread budget at once and hands results over in order', async () => {
    const h = harness(8, 3);
    await tick();
    expect(h.started).toEqual([0, 1, 2]);
    // Finishing out of order frees a thread, but merges nothing until 0 is in.
    await h.finish(2);
    await h.finish(1);
    expect(h.taken).toEqual([]);
    expect(h.started).toEqual([0, 1, 2, 3, 4]);
    await h.finish(0);
    expect(h.taken).toEqual([0, 1, 2]);
    for (const i of [7, 5, 3, 6, 4]) if (h.started.includes(i)) await h.finish(i);
    for (let i = 0; i < 8; i++) if (!h.taken.includes(i)) await h.finish(i);
    await h.run;
    expect(h.taken).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(h.maxRunning).toBe(3);
  });

  it('with one thread is strictly sequential', async () => {
    const h = harness(4, 1);
    for (let i = 0; i < 4; i++) {
      await tick();
      expect(h.started).toEqual([...Array(i + 1).keys()]);
      expect(h.taken).toEqual([...Array(i).keys()]);
      await h.finish(i);
    }
    await h.run;
    expect(h.maxRunning).toBe(1);
    expect(h.taken).toEqual([0, 1, 2, 3]);
  });

  it('never reserves more than the headroom for files in flight', async () => {
    // Four threads, but room for only two files of 10 at a time.
    const h = harness(6, 4, 25, () => 10);
    await tick();
    expect(h.started).toEqual([0, 1]);
    await h.finish(1);
    // A finished file still holds its reservation until it is merged.
    expect(h.started).toEqual([0, 1]);
    await h.finish(0);
    expect(h.started).toEqual([0, 1, 2, 3]);
    for (let i = 2; i < 6; i++) await h.finish(i);
    await h.run;
    expect(h.maxReserved).toBeLessThanOrEqual(25);
    expect(h.taken).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('still loads a file bigger than the headroom, alone', async () => {
    const h = harness(3, 4, 10, () => 100);
    for (let i = 0; i < 3; i++) {
      await tick();
      expect(h.running).toBe(1);
      await h.finish(i);
    }
    await h.run;
    expect(h.maxRunning).toBe(1);
  });

  it('passes a failed parse to take in its place, and stops when take throws', async () => {
    const h = harness(6, 2);
    await tick();
    await h.finish(1);
    const boom = new Error('boom');
    const ended = expect(h.run).rejects.toBe(boom);
    await h.fail(0, boom);
    await ended;
    const before = h.started.length;
    // Nothing further starts once the run is over, whatever settles later.
    for (const i of h.started.slice()) if (i > 1) await h.finish(i);
    expect(h.started.length).toBe(before);
    expect(h.taken).toEqual([0]);
  });
});

/** A small CSV with a person, a time and a category, distinct per file. */
function csvFile(name: string, seed: number, rows: number): File {
  const lines = ['t,x,y,z,who,kind'];
  for (let r = 0; r < rows; r++) {
    const v = seed * 1000 + r;
    lines.push(`${(v % 97) + r * 0.5},${v % 13},${(v * 7) % 17},${v % 5},p${(seed + r) % 4},k${(seed * 3 + r) % 3}`);
  }
  return new File([lines.join('\n') + '\n'], name);
}

const COLUMNS = ['t', 'x', 'y', 'z', 'who', 'kind'];

function mapping(): ColumnMapping {
  return {
    ...emptyColumnMapping(),
    x: 'x',
    y: 'y',
    z: 'z',
    time: 't',
    timeUnit: 'seconds',
    personId: 'who',
    extra: ['kind'],
    extraNumeric: { kind: false },
    delimiter: ',',
  };
}

/** Files of different sizes, an empty one among them, so parses finish out of order. */
function selection(): File[] {
  return [
    csvFile('a.csv', 1, 40),
    csvFile('b.csv', 2, 5),
    new File([], 'empty.csv'),
    csvFile('c.csv', 3, 25),
    csvFile('d.csv', 4, 60),
    csvFile('e.csv', 5, 1),
  ];
}

/**
 * `parseHere`, delayed so that later files tend to finish first, counting overlap.
 * Says it is halfway through each file while it waits, so progress has something
 * to blend: files this small are read before the parsers' own reports start.
 */
function delayed(): { parse: ParseFileFn; max: () => number } {
  let running = 0;
  let max = 0;
  let n = 0;
  const parse: ParseFileFn = async (file, m, columns, stride, onProgress) => {
    const delay = 30 - (n++ % 6) * 5;
    running++;
    max = Math.max(max, running);
    try {
      const reading = msg('data.ingestParquet.reading', { file: file.name });
      onProgress(progress(reading, 0, 0));
      await new Promise((r) => setTimeout(r, delay));
      onProgress(progress(reading, 0.5, 0));
      await new Promise((r) => setTimeout(r, 1));
      return await parseHere(file, m, columns, stride, onProgress);
    } finally {
      running--;
    }
  };
  return { parse, max: () => max };
}

describe('ingestFiles with several parser threads', () => {
  it('builds the same dataset as a sequential load', async () => {
    const seq = await ingestFiles({ files: selection(), mapping: mapping(), columns: COLUMNS, name: 'merged' });
    const d = delayed();
    const fractions: Array<number | null> = [];
    const par = await ingestFiles({
      files: selection(),
      mapping: mapping(),
      columns: COLUMNS,
      name: 'merged',
      threads: 3,
      parseFile: d.parse,
      onProgress: (p) => fractions.push(p.fraction),
    });
    expect(d.max()).toBe(3);
    expect(par.failures).toEqual(seq.failures);
    expect(par.failures.map((f) => f.file)).toEqual(['empty.csv']);
    // Everything but the id, which is stamped with the time it was built.
    expect({ ...par.dataset, id: '' }).toEqual({ ...seq.dataset, id: '' });
    // Progress over several files in flight still only moves forward, within 0..1.
    let last = 0;
    for (const f of fractions) {
      if (f === null) continue;
      expect(f).toBeGreaterThanOrEqual(last);
      expect(f).toBeLessThanOrEqual(1);
      last = f;
    }
    expect(last).toBeGreaterThan(0.5);
  });

  it('parses one file at a time with one thread', async () => {
    const d = delayed();
    await ingestFiles({ files: selection(), mapping: mapping(), columns: COLUMNS, name: 'merged', threads: 1, parseFile: d.parse });
    expect(d.max()).toBe(1);
  });

  it('parses one file at a time when the RAM budget leaves no room beside the builder', async () => {
    const d = delayed();
    const files = selection();
    await ingestFiles({
      files,
      mapping: mapping(),
      columns: COLUMNS,
      name: 'merged',
      threads: 4,
      ramBudget: 1,
      parseFile: d.parse,
    });
    expect(d.max()).toBe(1);
  });

  it('ends the load when a parser thread dies', async () => {
    const parse: ParseFileFn = async (file, m, columns, stride, onProgress) => {
      if (file.name === 'c.csv') throw new ParserCrash(msg('data.loader.crashed'));
      return parseHere(file, m, columns, stride, onProgress);
    };
    await expect(
      ingestFiles({ files: selection(), mapping: mapping(), columns: COLUMNS, name: 'merged', threads: 2, parseFile: parse }),
    ).rejects.toBeInstanceOf(ParserCrash);
  });
});

describe('what parsing in parallel may reserve', () => {
  it('leaves the budget less the builder, and nothing when the builder fills it', () => {
    const m = mapping();
    const one = fileParseBytes(m, 1);
    expect(one).toBeGreaterThan(0);
    expect(fileParseBytes(m, 1000)).toBe(1000 * one);
    const budget = 1024 ** 3;
    const room = parseHeadroom(m, budget, 1_000_000, 4, true);
    expect(room).toBeGreaterThan(0);
    expect(room).toBeLessThan(budget);
    // An estimated count reserves for the builder growing.
    expect(parseHeadroom(m, budget, 1_000_000, 4, false)).toBeLessThan(room);
    expect(parseHeadroom(m, budget, 1e12, 4, true)).toBe(0);
  });
});

describe('the loader', () => {
  it('hands the chosen parser threads and RAM budget to the ingest worker', async () => {
    const posted: unknown[] = [];
    class FakeWorker {
      onmessage: ((ev: MessageEvent) => void) | null = null;
      onerror: ((ev: ErrorEvent) => void) | null = null;
      postMessage(m: unknown) {
        posted.push(m);
      }
      terminate() {}
    }
    const real = globalThis.Worker;
    globalThis.Worker = FakeWorker as unknown as typeof Worker;
    try {
      const { Loader } = await import('./loader');
      const { useStore } = await import('../state/store');
      const budgets = { ...useStore.getState().budgets, cpu: 3, ram: 5 * 1024 ** 3 };
      useStore.setState({ budgets });
      const loader = new Loader();
      const job = loader.ingest(selection(), mapping(), COLUMNS, 'merged', 1, 0);
      job.catch(() => {});
      expect(posted).toHaveLength(1);
      expect(posted[0]).toMatchObject({ kind: 'ingest', threads: 3, ramBudget: 5 * 1024 ** 3 });
      loader.dispose();
    } finally {
      globalThis.Worker = real;
    }
  });
});
