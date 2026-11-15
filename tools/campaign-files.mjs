/**
 * The converted recordings of a campaign round on this machine, for the local
 * viewer server's `/__heat3d/campaign` route (vite.config.ts): the viewer asks
 * for a round by its `campaign` name and gets its sessions' `.3dheat` files,
 * in order, to load the round whole.
 *
 * Where to look comes from the git-ignored `tools/local-data.json`:
 *
 *   "campaigns": { "rounds": "<folder of *-rounds.json>", "recordings": ["<folder of .3dheat files>", ...] }
 *
 * The rounds files (`dcs-campaign-rounds.mjs`) list each round's sessions by
 * recording file name; a session's `.3dheat` is the file of the same stem
 * under one of the recording folders. Only files found that way are ever
 * served: the route takes an index into the list, never a path.
 */

import fs from 'node:fs';
import path from 'node:path';

const stem = (name) => name.replace(/\.(zip|txt)\.acmi$/i, '').replace(/\.(acmi|3dheat|parquet)$/i, '');

function walk(dir, out, depth = 0) {
  let list;
  try {
    list = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of list) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (depth < 8) walk(p, out, depth + 1);
    } else if (/\.3dheat$/i.test(e.name)) out.set(stem(e.name), p);
  }
  return out;
}

/** How long (ms) a listing of the folders is kept before they are walked again. */
const KEEP_MS = 60_000;

/**
 * The campaign rounds and recordings named by `config` (`{ rounds, recordings }`),
 * walked at most once a minute.
 */
export function campaignIndex(config) {
  let held = null;
  /** Every file listed so far, by id: an id handed out stays the same file. */
  const served = [];
  const load = () => {
    if (held && Date.now() - held.at < KEEP_MS) return held;
    const rounds = new Map();
    const dir = config?.rounds;
    const files = dir && fs.existsSync(dir) ? (fs.statSync(dir).isDirectory() ? fs.readdirSync(dir).filter((f) => /-rounds\.json$/i.test(f)).map((f) => path.join(dir, f)) : [dir]) : [];
    for (const f of files) {
      try {
        const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
        for (const r of doc.rounds ?? []) if (r.campaign && Array.isArray(r.sessions) && r.sessions.length) rounds.set(r.campaign, r);
      } catch {
        // A rounds file that does not parse names no round.
      }
    }
    const recordings = new Map();
    for (const root of [config?.recordings ?? []].flat()) walk(root, recordings);
    held = { at: Date.now(), rounds, recordings };
    return held;
  };
  return {
    /** The round's sessions found here, in order: `{ n, start, name, bytes, id }` (`id` for `file`), and how many are not here. */
    round(name) {
      const h = load();
      const r = h.rounds.get(name);
      if (!r) return null;
      const sessions = [];
      let missing = 0;
      r.sessions.forEach((s, i) => {
        const p = s.file ? h.recordings.get(stem(s.file)) : undefined;
        if (!p) {
          missing++;
          return;
        }
        let id = served.indexOf(p);
        if (id < 0) id = served.push(p) - 1;
        sessions.push({ n: i + 1, start: s.start, name: path.basename(p), bytes: fs.statSync(p).size, id });
      });
      return { campaign: name, winner: r.winner ?? null, sessions, missing };
    },
    /** A file listed by `round`, by its id; null for any other. */
    file(id) {
      return Number.isInteger(id) && id >= 0 && id < served.length ? served[id] : null;
    },
  };
}
