/**
 * What a recording says in words, as subtitles: Tacview's Message and
 * Comment events (an ACMI `Event=Message|id|text`), and chat from any game -
 * an event called Chat, Say or Radio, or a column of chat or messages - each
 * with who said it and when, in time order. Worked out once per dataset.
 */

import type { Dataset } from '../../state/types';
import { eventRows, trackName } from './replayData';

export interface Subtitle {
  time: number;
  /** Who said it: the track's name; '' for the recording's own. */
  who: string;
  text: string;
  session: number;
}

/** Event kinds that are words to show. */
const SPOKEN = /^(message|comment|comments|chat|say|radio|text|team ?chat|all ?chat)$/i;
/** Columns that hold chat. */
const CHAT_COLUMN = /^(chat|chat ?message|message|messages|comment|comments|say|text)$/i;

const cache = new WeakMap<Dataset, Subtitle[]>();

export function subtitlesOf(d: Dataset): Subtitle[] {
  const hit = cache.get(d);
  if (hit) return hit;
  const out: Subtitle[] = [];
  const time = d.time;
  const who = (row: number) => {
    if (!d.personId) return '';
    const label = d.personLabels[d.personId[row]] ?? '';
    return label === '(recording)' ? '' : trackName(d, d.personId[row], row);
  };
  if (time) {
    const ev = eventRows(d);
    if (ev)
      ev.labels.forEach((label, i) => {
        // The kind and its text, as `eventRows` splits "Kind: text"; a label it left whole split at its colon.
        const colon = ev.texts[i] ? -1 : label.indexOf(':');
        const kind = (colon < 0 ? label : label.slice(0, colon)).trim();
        const text = ev.texts[i] || (colon < 0 ? '' : label.slice(colon + 1).trim());
        if (!SPOKEN.test(kind) || !text) return;
        const row = ev.rows[i];
        out.push({ time: time[row], who: who(row), text, session: d.sessionId ? d.sessionId[row] : -1 });
      });
    for (const a of d.attrs) {
      if (a.kind !== 'category' || !a.categories || !CHAT_COLUMN.test(a.name.trim())) continue;
      const ids = a.data as Uint32Array;
      const empty = a.categories.map((c) => !c || !c.trim());
      // A chat column that is mostly full is not chat: a per-row text a game writes every frame.
      let n = 0;
      for (let r = 0; r < d.count; r++) if (!empty[ids[r]]) n++;
      if (n === 0 || n > d.count / 4) continue;
      let last = '';
      for (let r = 0; r < d.count; r++) {
        if (empty[ids[r]]) continue;
        const text = a.categories[ids[r]].trim();
        const key = `${time[r]}|${text}`;
        // The same line logged by every row of one moment once.
        if (key === last) continue;
        last = key;
        out.push({ time: time[r], who: who(r), text, session: d.sessionId ? d.sessionId[r] : -1 });
      }
    }
  }
  out.sort((a, b) => a.time - b.time);
  cache.set(d, out);
  return out;
}

/**
 * The subtitles to show at `now`: said within the last `hold` seconds, of
 * the session played (-1 every one), the newest `max` of them, oldest first.
 */
export function subtitlesAt(list: Subtitle[], now: number, session: number, hold = 6, max = 4): Subtitle[] {
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].time <= now) lo = mid + 1;
    else hi = mid;
  }
  const out: Subtitle[] = [];
  for (let i = lo - 1; i >= 0 && out.length < max; i--) {
    const s = list[i];
    if (now - s.time > hold) break;
    if (session >= 0 && s.session >= 0 && s.session !== session) continue;
    out.push(s);
  }
  return out.reverse();
}
