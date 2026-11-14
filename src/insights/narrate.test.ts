import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { castPrompt, citedIds, debriefPrompt, parseCastLines, pseudonymize, aliases } from './ai/prompt';
import { AiError, listModels, streamChat, type AiConfig } from './ai/provider';
import { findMoments, type CastKill, type CastRound } from './cast/moments';
import { baseDebrief } from './narrate';
import type { Insight, InsightReport } from './types';

function insight(id: string, kind: string, strength: number, level: 'high' | 'medium' | 'low', params: Record<string, number | string> = {}): Insight {
  return {
    id, detector: kind.split('.')[0] as Insight['detector'], kind, sentence: { key: `insights.say.${kind}`, params }, strength,
    effect: { measure: 'rateRatio', value: 2, raw: 2.2, lo: 1.5, hi: 3 },
    confidence: { p: 0.001, q: 0.01, level, tests: 40, method: 'binomial' },
    evidence: { kills: 12 }, place: null, time: null, filters: [], subject: {},
  };
}

const report = (insights: Insight[]): InsightReport => ({
  schema: 'heat3d.insights/1',
  dataset: { name: 'secret-file.parquet', rows: 1000, shownRows: 1000, matches: 3, persons: 20, teams: 2, hasLevel: true, exposure: 'seconds' },
  grid: { x0: 0, z0: 0, fine: 1, mid: 4, coarse: 16, nx: 10, nz: 10 },
  baseline: { presence: 1, kills: 1, deaths: 1, spawns: 1, crossings: 1 },
  detectors: [], insights, fdr: 0.05, elapsedMs: 1,
});

describe('built-in debrief', () => {
  it('leads, says the clearest, tactics and balance, then the rest by detector, and cites each', () => {
    const r = report([
      insight('a', 'zones.hot', 0.9, 'high', { kind: 'kill' }),
      insight('b', 'power.kd', 0.7, 'medium'),
      insight('c', 'spawn.trap', 0.6, 'low', { team: 'Red' }),
      insight('d', 'players.over', 0.5, 'medium', { player: 'Alice' }),
      insight('e', 'players.under', 0.4, 'low', { player: 'Bob' }),
      insight('f', 'players.fragile', 0.3, 'low', { player: 'Carol' }),
    ]);
    const d = baseDebrief(r, (i) => `S(${i.id})`);
    expect(d.paragraphs[0].text).toContain('6 findings');
    expect(d.paragraphs[1].cites).toEqual(['a']);
    expect(d.paragraphs[2].text).toMatch(/^For tactics: S\(b\)/);
    expect(d.paragraphs[3].text).toMatch(/^For balancing: S\(c\)/);
    expect(d.paragraphs[4].cites).toEqual(['d', 'e']);
    expect(d.paragraphs[4].text).toContain('and 1 more');
    expect(d.paragraphs.at(-1)!.text).toContain('3 of them');
    expect(d.cites).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('says so when nothing stands out', () => {
    expect(baseDebrief(report([]), () => '').text).toMatch(/Nothing stands out/);
  });
});

describe('what a model is sent', () => {
  it('keeps names and the file name out unless allowed', () => {
    const r = report([insight('d', 'players.over', 0.5, 'medium', { player: 'Alice' })]);
    r.insights[0].subject.person = 'Alice';
    r.insights[0].filters = [{ by: 'person', values: ['Alice'] }];
    const say = () => 'Alice kills 2x as often';
    const off = debriefPrompt(r, say, { language: 'de', names: false });
    expect(off.user).not.toContain('Alice');
    expect(off.user).not.toContain('secret-file');
    expect(off.user).toContain('P1 kills');
    expect(off.system).toContain('Deutsch');
    const on = debriefPrompt(r, say, { language: 'en', names: true });
    expect(on.user).toContain('Alice');
    expect(pseudonymize({ a: ['Ann and Anna'] }, aliases(['Ann', 'Anna']))).toEqual({ a: ['P1 and P2'] });
  });

  it('reads cast lines and cited ids out of partial answers', () => {
    expect([...parseCastLines('m1: What a shot!\n- m2 – Clutch!\nnoise\nm3')]).toEqual([['m1', 'What a shot!'], ['m2', 'Clutch!']]);
    expect(citedIds('see [a] and [zz] and [b] [a]', new Set(['a', 'b']))).toEqual(['a', 'b']);
    const p = castPrompt([{ id: 'm1', kind: 'trade', round: 0, time: 3, from: 0, to: 5, actor: 0, other: 1, team: 0, x: 0, y: 0, z: 0, weight: 1, params: { victim: 2, secs: 1 } }], { player: (u) => ['Ann', 'Bo', 'Cy'][u], team: () => 'Red', className: (c) => c }, { language: 'en', names: false });
    expect(p.user).toContain('"player":"P1"');
    expect(p.user).toContain('"victim":"P3"');
    expect(p.user).not.toMatch(/Ann|Bo"|Cy/);
  });
});

const kill = (time: number, killer: number, victim: number, kt: number, vt: number, extra: Partial<CastKill> = {}): CastKill => ({
  time, killer, victim, killerTeam: kt, victimTeam: vt, killerClass: '', victimClass: '', x: 0, y: 0, z: 0, distance: null, round: 0, ...extra,
});

describe('caster moments', () => {
  it('finds first blood, a multi-kill, a trade and a won clutch in a round without respawns', () => {
    // Team 0: players 0,1,2; team 1: players 3,4,5.
    const roster = new Map([[0, new Set([0, 1, 2])], [1, new Set([3, 4, 5])]]);
    const rounds: CastRound[] = [{ start: 0, end: 100, roster }];
    const kills = [
      kill(10, 3, 0, 1, 0), // first blood
      kill(12, 1, 3, 0, 1), // trade for 0
      kill(30, 4, 1, 1, 0), // team 0 down to player 2 against 4 and 5
      kill(40, 2, 4, 0, 1),
      kill(44, 2, 5, 0, 1), // clutch won, a double
    ];
    const ms = findMoments({ kills, captures: [], rounds });
    const kinds = ms.map((m) => m.kind);
    expect(kinds).toContain('firstBlood');
    expect(ms.find((m) => m.kind === 'trade')).toMatchObject({ actor: 1, other: 3, params: { victim: 0 } });
    expect(ms.find((m) => m.kind === 'clutch')).toMatchObject({ actor: 2, params: { against: 2, outcome: 'won', kills: 2 } });
    expect(ms.find((m) => m.kind === 'multiKill')).toMatchObject({ actor: 2, params: { n: 2 } });
    expect(ms.map((m) => m.time)).toEqual([...ms.map((m) => m.time)].sort((a, b) => a - b));
  });

  it('finds the long shots, the standout and a comeback over a respawning match', () => {
    const roster = new Map([[0, new Set([0, 1, 2, 3])], [1, new Set([4, 5, 6, 7])]]);
    const kills: CastKill[] = [];
    let t = 0;
    // Team 1 goes 6 up, then team 0 (player 0 mostly) takes it back.
    for (let i = 0; i < 6; i++) kills.push(kill((t += 5), 4 + (i % 4), i % 4, 1, 0, { distance: 50 }));
    for (let i = 0; i < 10; i++) kills.push(kill((t += 5), i < 7 ? 0 : 1 + (i % 3), 4 + (i % 4), 0, 1, { distance: i === 3 ? 900 : 60 }));
    const ms = findMoments({ kills, captures: [], rounds: [{ start: 0, end: t, roster }] });
    expect(ms.find((m) => m.kind === 'comeback')).toMatchObject({ team: 0, params: { deficit: 6, unit: 'kills' } });
    expect(ms.find((m) => m.kind === 'longRange')).toMatchObject({ actor: 0, params: { distance: 900 } });
    expect(ms.find((m) => m.kind === 'standout')).toMatchObject({ actor: 0, params: { kills: 7 } });
    expect(ms.some((m) => m.kind === 'clutch')).toBe(false); // players die twice: respawns
  });

  it('says an objective changing hands is a swing', () => {
    const ms = findMoments({ kills: [], rounds: [], captures: [{ time: 10, round: 0, person: 1, team: 0, x: 0, y: 0, z: 0 }, { time: 40, round: 0, person: 2, team: 1, x: 0, y: 0, z: 0 }] });
    expect(ms.map((m) => m.kind)).toEqual(['objective', 'swing']);
  });
});

describe('external model, against a local mock', () => {
  let server: Server;
  let base = '';
  const seen: { url: string; headers: Record<string, string | string[] | undefined>; body: string }[] = [];
  beforeAll(async () => {
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        seen.push({ url: req.url ?? '', headers: req.headers, body });
        const sse = (events: string[]) => {
          res.writeHead(200, { 'content-type': 'text/event-stream' });
          // Split mid-event, as a network does.
          const all = events.join('');
          res.write(all.slice(0, 37));
          setTimeout(() => res.end(all.slice(37)), 5);
        };
        if (req.url === '/v1/messages') {
          if (req.headers['x-api-key'] !== 'sk-test') return void res.writeHead(401).end('{"error":{"message":"invalid x-api-key"}}');
          return sse([
            'event: message_start\ndata: {"type":"message_start","message":{"id":"msg_1"}}\n\n',
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":""}}\n\n',
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"Hello "}}\n\n',
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"[a]"}}\n\n',
            'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}\n\n',
            'event: message_stop\ndata: {"type":"message_stop"}\n\n',
          ]);
        }
        if (req.url === '/v1/chat/completions') {
          return sse(['data: {"choices":[{"delta":{"role":"assistant"}}]}\n\n', 'data: {"choices":[{"delta":{"content":"m1: "}}]}\n\n', 'data: {"choices":[{"delta":{"content":"Boom"}}]}\n\n', 'data: [DONE]\n\n']);
        }
        if (req.url === '/v1/models') return void res.writeHead(200, { 'content-type': 'application/json' }).end('{"data":[{"id":"llama3"},{"id":"qwen"}]}');
        if (req.url === '/bad/chat/completions') return void res.writeHead(404).end('{"error":{"message":"model not found"}}');
        res.writeHead(500).end('nope');
      });
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => new Promise<void>((r) => server.close(() => r())));

  it('streams an Anthropic answer, with the key and the browser-access header, and no key in errors', async () => {
    const pieces: string[] = [];
    const cfg: AiConfig = { kind: 'anthropic', baseUrl: `${base}/v1/`, model: 'claude-opus-5-5', key: 'sk-test' };
    const text = await streamChat(cfg, { system: 'S', user: 'U' }, (p) => pieces.push(p));
    expect(text).toBe('Hello [a]');
    expect(pieces).toEqual(['Hello ', '[a]']);
    const req = seen.find((s) => s.url === '/v1/messages')!;
    expect(req.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    expect(req.headers['anthropic-version']).toBeTruthy();
    const body = JSON.parse(req.body);
    expect(body).toMatchObject({ model: 'claude-opus-5-5', stream: true, system: 'S', messages: [{ role: 'user', content: 'U' }] });
    const err = await streamChat({ ...cfg, key: 'sk-wrong' }, { system: '', user: '' }, () => undefined).catch((e) => e);
    expect(err).toBeInstanceOf(AiError);
    expect(err.code).toBe('auth');
    expect(JSON.stringify({ ...err, m: err.message })).not.toContain('sk-wrong');
  });

  it('streams an OpenAI-compatible answer, lists models and says what failed', async () => {
    const cfg: AiConfig = { kind: 'openai', baseUrl: `${base}/v1`, model: 'llama3', key: '' };
    expect(await streamChat(cfg, { system: 'S', user: 'U' }, () => undefined)).toBe('m1: Boom');
    const req = seen.find((s) => s.url === '/v1/chat/completions')!;
    expect(req.headers.authorization).toBeUndefined();
    expect(JSON.parse(req.body).messages[0]).toEqual({ role: 'system', content: 'S' });
    expect(await listModels(cfg)).toEqual(['llama3', 'qwen']);
    const nf = await streamChat({ ...cfg, baseUrl: `${base}/bad` }, { system: '', user: '' }, () => undefined).catch((e) => e);
    expect([nf.code, nf.values.detail]).toEqual(['notFound', 'model not found']);
    const down = await streamChat({ ...cfg, baseUrl: 'http://127.0.0.1:9/v1' }, { system: '', user: '' }, () => undefined).catch((e) => e);
    expect(down.code).toBe('cors');
    const ctl = new AbortController();
    ctl.abort();
    const ab = await streamChat(cfg, { system: '', user: '' }, () => undefined, ctl.signal).catch((e) => e);
    expect(ab.name).toBe('AbortError');
    expect((await streamChat({ ...cfg, model: '' }, { system: '', user: '' }, () => undefined).catch((e) => e)).code).toBe('config');
  });
});
