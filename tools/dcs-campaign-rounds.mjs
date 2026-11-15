#!/usr/bin/env node
/**
 * A DCS server's campaign rounds from its Tacview recordings alone: each
 * recording's start (the ground units and statics of both sides where the
 * campaign left them) chained per server and map in time order, into rounds,
 * their sessions, the places taken between sessions and, for a round that
 * ended, who held the most (`src/data/dcsCampaign.ts`). Writes one rounds
 * file per server (format heat3d-dcs-rounds, read by `acmi-to-parquet.mjs
 * --rounds`) into the out folder.
 *
 *   node tools/dcs-campaign-rounds.mjs <out-folder> <folder>... [--official rounds.json ...] [--cache starts.jsonl]
 *
 * --official names a rounds file a server publishes (its winners): that
 * server's file keeps its rounds, gets the chain's sessions, and the run says
 * how far the chain agrees with it. --cache keeps every recording's start, so
 * a second run reads only new recordings. Only the first minutes of each
 * recording are read.
 */

import fs from 'node:fs';
import path from 'node:path';
import { readText } from './acmi-read.mjs';

const { AcmiStreamReader } = await import(new URL('../src/data/acmiStream.ts', import.meta.url).href);
const { dcsServer, DcsRounds } = await import(new URL('../src/data/dcsOutcome.ts', import.meta.url).href);
const { chainCampaigns, roundOfChain, START_S: LIMIT_S, START_UNIT: SIDE_UNIT, NOT_START_UNIT: NOT_UNIT } = await import(new URL('../src/data/dcsCampaign.ts', import.meta.url).href);

async function startOf(file) {
  const units = new Map();
  const reader = new AcmiStreamReader((row) => {
    if (!row.placed || !row.id || row.event || units.has(row.id)) return;
    const type = row.props.get('Type') ?? '';
    const color = row.props.get('Color') ?? '';
    if (!SIDE_UNIT.test(type) || NOT_UNIT.test(type) || (color !== 'Red' && color !== 'Blue')) {
      units.set(row.id, null);
      return;
    }
    units.set(row.id, [Math.round(row.lat * 1e5) / 1e5, Math.round(row.lon * 1e5) / 1e5, color === 'Red' ? 'R' : 'B']);
  }, path.basename(file));
  await readText(file, (s) => {
    reader.push(s);
    return reader.lastTime <= LIMIT_S;
  });
  const g = reader.globals;
  return { title: g.Title ?? '', author: g.Author ?? '', comments: (g.Comments ?? '').slice(0, 400), recordingTime: g.RecordingTime ?? '', units: [...units.values()].filter(Boolean) };
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.acmi$/i.test(e.name)) out.push(p);
  }
  return out;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unattributed';

async function cli() {
  const args = process.argv.slice(2);
  const official = [];
  let cachePath = null;
  for (let i = 0; i < args.length; ) {
    if (args[i] === '--official') official.push(JSON.parse(fs.readFileSync(args.splice(i, 2)[1], 'utf8')));
    else if (args[i] === '--cache') cachePath = args.splice(i, 2)[1];
    else i++;
  }
  const [outDir, ...folders] = args;
  if (!outDir || !folders.length) {
    console.error('usage: node tools/dcs-campaign-rounds.mjs <out-folder> <folder>... [--official rounds.json ...] [--cache starts.jsonl]');
    process.exit(2);
  }
  const cache = new Map();
  if (cachePath && fs.existsSync(cachePath))
    for (const l of fs.readFileSync(cachePath, 'utf8').split('\n')) {
      if (!l.trim()) continue;
      try {
        const d = JSON.parse(l);
        cache.set(`${d.file}|${d.size}`, d);
      } catch {
        // A torn last line: read that recording again.
      }
    }
  const files = new Map();
  for (const f of folders.flatMap((d) => walk(path.resolve(d)))) if (!files.has(path.basename(f))) files.set(path.basename(f), f);
  const starts = [];
  let read = 0;
  for (const [name, file] of [...files].sort()) {
    const size = fs.statSync(file).size;
    let d = cache.get(`${name}|${size}`);
    if (!d) {
      try {
        d = { file: name, size, ...(await startOf(file)) };
      } catch (e) {
        console.error(`${name}: ${e.message}`);
        continue;
      }
      read++;
      if (cachePath) fs.appendFileSync(cachePath, `${JSON.stringify(d)}\n`);
    }
    const server = dcsServer({ Title: d.title, Author: d.author, Comments: d.comments }).server;
    starts.push({ file: name, server, title: d.title, start: Date.parse(d.recordingTime) / 1000, units: d.units.map(([lat, lon, c]) => ({ lat, lon, color: c === 'R' ? 'Red' : 'Blue' })) });
  }
  console.log(`${starts.length} recordings (${read} read, ${starts.length - read} from the cache)`);

  const chains = chainCampaigns(starts);
  fs.mkdirSync(outDir, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const byServer = new Map();
  for (const c of chains) {
    const rounds = c.rounds.length;
    const won = c.rounds.filter((r) => r.winner).length;
    console.log(`${c.campaign}: ${c.sessions} sessions, ${c.contested} contested places, ${c.persistent ? `${rounds} rounds, ${won} with a winner` : 'no state kept between sessions'}`);
    for (const r of c.rounds) {
      const s = r.sessions[r.sessions.length - 1];
      console.log(`  round ${r.n}: ${new Date(r.sessions[0].start * 1000).toISOString().slice(0, 16)} .. ${r.end}, ${r.sessions.length} sessions, last start Red ${s.red} / Blue ${s.blue}, winner ${r.winner ?? '-'} (${r.confidence ?? '-'})`);
    }
    if (!c.server) continue;
    let list = byServer.get(c.server);
    if (!list) byServer.set(c.server, (list = []));
    list.push(c);
  }

  for (const [server, list] of byServer) {
    const off = official.find((o) => o.server === server);
    let doc;
    if (off) {
      // The server's own rounds, each with the chain's sessions in its window; and how far the chain agrees.
      const rounds = new DcsRounds([off]);
      const sessions = list.flatMap((c) => c.rounds.flatMap((r) => r.sessions.map((s) => ({ ...s, title: starts.find((x) => x.file === s.file)?.title ?? '' }))));
      const agree = { rounds: 0, sameWinner: 0, otherWinner: 0, noneSaid: 0 };
      for (const c of list)
        for (const r of c.rounds) {
          const s0 = r.sessions[0];
          const title = starts.find((x) => x.file === s0.file)?.title ?? '';
          // The official round the chained one began in (its first session may start a little after the official start).
          const hit = rounds.forRecording(server, title, s0.start, s0.start + 1).rounds.find((x) => x.winner);
          const truth = hit ? hit.winner : null;
          const said = r.winner ?? r.ahead;
          if (!truth) continue;
          agree.rounds++;
          if (!said) agree.noneSaid++;
          else if (said === truth) agree.sameWinner++;
          else agree.otherWinner++;
        }
      console.log(`${server}: chained rounds against the published winners: ${JSON.stringify(agree)}`);
      doc = {
        ...off,
        rounds: off.rounds.map((r) => {
          const re = r.title ? new RegExp(r.title, 'i') : null;
          const a = Date.parse(r.start.endsWith('Z') ? r.start : `${r.start}Z`) / 1000;
          const b = r.end ? Date.parse(r.end.endsWith('Z') ? r.end : `${r.end}Z`) / 1000 : Infinity;
          const mine = sessions.filter((s) => (!re || re.test(s.title)) && s.start >= a - 600 && s.start < b).sort((p, q) => p.start - q.start);
          const campaign = r.campaign ?? [server, r.map, r.era, r.id].filter((x) => x !== undefined && x !== null && x !== '').join(' ');
          return { ...r, campaign, sessions: mine.map((s, i) => ({ start: new Date(s.start * 1000).toISOString(), file: s.file, red: s.red, blue: s.blue, captures: i ? s.captures.map((c) => ({ lat: c.lat, lon: c.lon, from: c.from, to: c.to })) : [] })) };
        }),
        validation: { against: 'the chain of mission-start snapshots (dcs-campaign-rounds.mjs)', date: today, ...agree },
      };
    } else {
      doc = {
        format: 'heat3d-dcs-rounds',
        version: 1,
        server,
        source: `chain of mission-start snapshots (dcs-campaign-rounds.mjs), ${today}`,
        note: 'Rounds worked out from the recordings: a round ends where the next session starts with a new layout or the server moved to another map; its winner held every contested place at its last session start (high), or more of them (medium at twice, else low). Times UTC.',
        rounds: list.flatMap((c) => c.rounds.map((r) => roundOfChain(r))),
        unchained: list.filter((c) => !c.persistent).map((c) => ({ campaign: c.campaign, sessions: c.sessions, why: 'every session begins alike: no state kept between sessions' })),
      };
    }
    const out = path.join(outDir, `${slug(server)}-rounds.json`);
    fs.writeFileSync(out, JSON.stringify(doc, null, 1));
    console.log(`wrote ${out}: ${doc.rounds.length} rounds`);
  }
}

await cli();
