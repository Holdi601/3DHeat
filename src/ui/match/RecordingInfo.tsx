/**
 * A Tacview recording's own words in the Match tab: its title, category,
 * author, source and recorder, when it starts and was recorded, and the
 * mission's briefing, debriefing and comments (ACMI 2.2 global properties),
 * as the RecordingInfo column (`data/acmi.ts`) holds them at the end of the
 * recording - of the session being played, when one is chosen.
 */

import { useMemo } from 'react';
import { lang, t } from '../../i18n';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { Section } from '../controls';

/** The properties shown, in order, by their messages; the rest follow under their own names. */
const KNOWN: [string, string][] = [
  ['Title', 'title'],
  ['Category', 'category'],
  ['Author', 'author'],
  ['DataSource', 'source'],
  ['DataRecorder', 'recorder'],
  ['ReferenceTime', 'start'],
  ['RecordingTime', 'recorded'],
  ['Briefing', 'briefing'],
  ['Debriefing', 'debriefing'],
  ['Comments', 'comments'],
];

/** Not for reading: the reference point is the map's, the key a server's secret, the file type the parser's. */
const SKIP = new Set(['ReferenceLongitude', 'ReferenceLatitude', 'AuthenticationKey', 'FileType']);

const TIMES = new Set(['ReferenceTime', 'RecordingTime']);

const cache = new WeakMap<Dataset, Map<number, Record<string, string> | null>>();

/** The recording's properties as they stand at its end (of `session`, when one is chosen); null for a load without. */
export function recordingInfo(d: Dataset, session: number): Record<string, string> | null {
  let per = cache.get(d);
  if (!per) cache.set(d, (per = new Map()));
  if (per.has(session)) return per.get(session)!;
  const a = d.attrs.find((x) => x.kind === 'category' && x.name === 'RecordingInfo' && x.categories);
  let out: Record<string, string> | null = null;
  if (a) {
    const ids = a.data as Uint32Array;
    let pick = -1;
    if (session >= 0 && d.sessionId) {
      // From the session's end backwards (rows are in time order): a few rows, not the whole load.
      let from = d.count - 1;
      if (d.time && d.sessionEnd) {
        const end = d.sessionEnd[session];
        let lo = 0;
        let hi = d.count;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (d.time[mid] <= end) lo = mid + 1;
          else hi = mid;
        }
        from = Math.min(d.count - 1, lo);
      }
      for (let r = from; r >= 0; r--) {
        if (d.sessionId[r] === session && a.categories![ids[r]]) {
          pick = ids[r];
          break;
        }
      }
    } else {
      // The categories in the order first seen: the last is the newest state.
      for (let c = a.categories!.length - 1; c >= 0 && pick < 0; c--) if (a.categories![c]) pick = c;
    }
    if (pick >= 0) {
      try {
        const v = JSON.parse(a.categories![pick]);
        if (v && typeof v === 'object') out = v as Record<string, string>;
      } catch {
        out = null;
      }
    }
  }
  per.set(session, out);
  return out;
}

function when(v: string): string {
  const ms = Date.parse(v);
  if (!Number.isFinite(ms)) return v;
  return `${new Intl.DateTimeFormat(lang(), { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'UTC' }).format(ms)} UTC`;
}

export function RecordingInfoSection() {
  const dataset = useStore((s) => s.dataset);
  const session = useStore((s) => s.team.session);
  const info = useMemo(() => (dataset ? recordingInfo(dataset, session) : null), [dataset, session]);
  if (!info) return null;
  const rows: [string, string, boolean][] = [];
  for (const [key, msg] of KNOWN) {
    const v = info[key]?.trim();
    if (v) rows.push([t(`match.recording.${msg}`), TIMES.has(key) ? when(v) : v, /briefing|comments/i.test(key)]);
  }
  const known = new Set(KNOWN.map(([k]) => k));
  for (const [key, v] of Object.entries(info)) {
    if (known.has(key) || SKIP.has(key) || !String(v).trim()) continue;
    rows.push([key, String(v), false]);
  }
  if (!rows.length) return null;
  return (
    <Section title={t('match.recording.section')} defaultOpen right={<span className="count">{info.Title ?? ''}</span>}>
      <dl className="recording-info">
        {rows.map(([k, v, long]) => (
          <div key={k} className={long ? 'long' : undefined}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
