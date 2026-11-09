import { useMemo } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useMatchStore } from '../../state/matchStore';
import type { AttributeColumn, Dataset } from '../../state/types';
import { int, t } from '../../i18n';
import { Check, Section } from '../controls';
import { download, eventsCsv } from './stats';
import { useEngine } from '../EngineContext';
import { defaultEventKinds, eventBursts, eventRows, eventText, eventWords } from './replayData';
import { clock } from './hooks';
import { partyName, sortUnits, unitsOf } from './units';
import { flyTo } from './replayView';
import { useObjectivesStore } from '../../state/objectivesStore';
import { captureMarks, objectiveSources } from '../../render/objectives';

/** The chip of the battles' captures (`objectives.ts`), apart from the data's own event kinds. */
const CAPTURE = '@capture';

/** Lines the list shows at most; the filters narrow the rest. */
const MAX_ROWS = 600;

function attr(d: Dataset, name: string): AttributeColumn | undefined {
  return d.attrs.find((a) => a.name.trim().toLowerCase() === name);
}

function textAt(a: AttributeColumn | undefined, row: number): string {
  if (!a?.categories) return '';
  return a.categories[(a.data as Uint32Array)[row]] ?? '';
}

export { eventWords };

/**
 * The recording's events, in time order: a click goes to the moment and flies
 * the camera to where it happened. Filtered by kind and by unit, and to the
 * matches and round being played.
 */
export function EventList() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const session = useStore((s) => s.team.session);
  const kinds = useReplayStore((s) => s.eventKinds);
  const unitKey = useReplayStore((s) => s.eventUnit);
  const games = useMatchStore((s) => s.games);
  const timelines = useObjectivesStore((s) => s.timelines);
  const events = useMemo(() => (dataset ? eventRows(dataset) : null), [dataset]);
  // The battles' captures: zone, side, moment, of the matches played.
  const captures = useMemo(() => (dataset ? captureMarks(dataset, objectiveSources(dataset, games, timelines, filters, session)) : []), [dataset, games, timelines, filters, session]);
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);

  // Every kind and how often it happens, for the chips.
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    if (events) for (const l of events.labels) m.set(l, (m.get(l) ?? 0) + 1);
    if (captures.length) m.set(CAPTURE, captures.length);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [events, captures.length]);

  // The units that have events, for the unit filter.
  const actors = useMemo(() => {
    if (!events || !index) return [];
    const keys = new Set<string>();
    for (const p of events.persons) if (p >= 0 && index.personUnit[p] >= 0) keys.add(index.units[index.personUnit[p]].key);
    return sortUnits(index.units.filter((u) => keys.has(u.key)));
  }, [events, index]);

  const defaults = useMemo(() => [...(events ? defaultEventKinds(events.labels) : []), ...(captures.length ? [CAPTURE] : [])], [events, captures.length]);
  const effective = kinds ?? defaults;

  const pauseOnEvent = useReplayStore((s) => s.pauseOnEvent);
  const listed = useMemo(() => {
    if (!dataset || !events || !index) return { all: [] as number[], bursts: [] as ReturnType<typeof eventBursts> };
    const matchFilter = filters.find((f) => f.kind === 'categories' && f.column.trim().toLowerCase() === 'match');
    const matchCol = matchFilter && matchFilter.kind === 'categories' ? dataset.attrs.find((a) => a.name === matchFilter.column) : undefined;
    const allowedMatch = matchFilter && matchFilter.kind === 'categories' ? new Set(matchFilter.allowed) : null;
    const kindSet = new Set(effective);
    const out: number[] = [];
    for (let i = 0; i < events.rows.length; i++) {
      const row = events.rows[i];
      if (!kindSet.has(events.labels[i])) continue;
      if (session >= 0 && dataset.sessionId && dataset.sessionId[row] !== session) continue;
      if (allowedMatch && matchCol && !allowedMatch.has((matchCol.data as Uint32Array)[row])) continue;
      if (unitKey) {
        const p = events.persons[i];
        if (p < 0 || index.units[index.personUnit[p]]?.key !== unitKey) continue;
      }
      out.push(i);
    }
    // A burst of the same by the same against the same is one line.
    const other = attr(dataset, 'other');
    return { all: out, bursts: eventBursts(dataset, events, out, (i) => `${events.persons[i] >= 0 ? index.personUnit[events.persons[i]] : -1}|${textAt(other, events.rows[i])}`) };
    // `effective` by its contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, events, index, filters, session, effective.join('|'), unitKey]);
  const shown = listed.bursts;
  const capturesShown = effective.includes(CAPTURE) ? captures : [];

  if (!dataset || !events || events.rows.length === 0 || !dataset.time || !index) return null;
  // Names of the units a summary knows that have no track: what a bomb destroyed.
  const known = new Map<number, string>();
  for (const g of games) for (const [k, v] of g.unitNames) known.set(k, v);
  const time = dataset.time;
  const start = session >= 0 && dataset.sessionStart ? dataset.sessionStart[session] : dataset.timeRange[0];
  const other = attr(dataset, 'other');
  const weapon = attr(dataset, 'weapon');
  // The weapon's name as the game says it, where the converter wrote one (War Thunder's kills and deaths).
  const weaponName = attr(dataset, 'weaponname');
  const toggleKind = (k: string) => {
    const now = new Set(effective);
    if (now.has(k)) now.delete(k);
    else now.add(k);
    const same = now.size === defaults.length && defaults.every((d) => now.has(d));
    useReplayStore.getState().setEventFilter({ kinds: same ? null : [...now] });
  };

  return (
    <Section title={t('replay.events.title')} defaultOpen right={<span className="count">{int(shown.length + capturesShown.length)}</span>}>
      <div className="chips">
        {counts.map(([k, n]) => (
          <button key={k} className={`chip${effective.includes(k) ? ' on' : ''}`} onClick={() => toggleKind(k)} title={t('replay.events.kindTitle')}>
            {k === CAPTURE ? t('objectives.events.chip') : eventWords(k)} <span className="dim">{int(n)}</span>
          </button>
        ))}
        {effective.length < counts.length && (
          <button className="chip link" onClick={() => useReplayStore.getState().setEventFilter({ kinds: counts.map(([c]) => c) })}>
            {t('replay.events.allKinds')}
          </button>
        )}
        {kinds && (
          <button className="chip link" onClick={() => useReplayStore.getState().setEventFilter({ kinds: null })} title={t('replay.events.defaultKindsTitle')}>
            {t('replay.events.defaultKinds')}
          </button>
        )}
      </div>
      <div className="field">
        <select value={unitKey ?? ''} onChange={(e) => useReplayStore.getState().setEventFilter({ unit: e.target.value || null })}>
          <option value="">{t('replay.events.everyone')}</option>
          {actors.map((u) => (
            <option key={u.key} value={u.key}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <div className="row-buttons">
        <Check label={t('replay.events.pause')} checked={pauseOnEvent} onChange={(v) => useReplayStore.setState({ pauseOnEvent: v })} title={t('replay.events.pauseTitle')} />
        <button
          className="small"
          disabled={!listed.all.length}
          title={t('replay.events.csvTitle')}
          onClick={() =>
            download(
              `${dataset.name.replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '_')}.events.csv`,
              eventsCsv(
                listed.all.map((i) => {
                  const row = events.rows[i];
                  const p = events.persons[i];
                  return {
                    time: time[row] - start,
                    event: events.texts[i] ? `${events.labels[i]}: ${events.texts[i]}` : events.labels[i],
                    unit: p >= 0 ? (index.units[index.personUnit[p]]?.name ?? '') : '',
                    other: partyName(dataset, textAt(other, row), known),
                    weapon: textAt(weaponName, row).trim() || textAt(weapon, row),
                  };
                }),
              ),
            )
          }
        >
          {t('replay.events.csv')}
        </button>
      </div>
      <div className="replay-events event-list">
        {mergeByTime(shown.slice(0, MAX_ROWS), (b) => time[events.rows[b.first]], capturesShown, (c) => c.t).map((item) => {
          if ('zone' in item) {
            const c = item;
            return (
              <button
                key={`capture-${c.match}-${c.zone}-${c.t}`}
                onClick={() => {
                  useStore.getState().seek(c.t);
                  if (engine && Number.isFinite(c.x)) flyTo(engine, dataset, { x: c.x, y: c.y, z: c.z }, 400);
                }}
                title={t('replay.jump')}
              >
                <span>{clock(c.t - start)}</span>
                <span>
                  <b>{t(c.kind === 'captured' ? 'objectives.events.captured' : 'objectives.events.neutralised', { zone: c.zone, team: t('replay.team', { n: c.team }) })}</b>
                </span>
              </button>
            );
          }
          const b = item;
          const i = b.first;
          const row = events.rows[i];
          const p = events.persons[i];
          const u = p >= 0 ? index.units[index.personUnit[p]] : undefined;
          const extra = [eventText(events.texts[i]), textAt(weaponName, row).trim() || textAt(weapon, row), partyName(dataset, textAt(other, row), known)].filter(Boolean);
          return (
            <button
              key={row}
              onClick={() => {
                useStore.getState().seek(time[row]);
                if (engine) flyTo(engine, dataset, { x: dataset.px[row], y: dataset.py[row], z: dataset.pz[row] }, 220);
              }}
              title={t('replay.jump')}
            >
              <span>{clock(time[row] - start)}</span>
              <span>
                <b>{eventWords(events.labels[i])}</b>
                {b.count > 1 && <span className="burst"> ×{int(b.count)}</span>}
                {u ? ` · ${u.name}` : ''}
                {extra.length ? <span className="dim"> · {extra.join(' · ')}</span> : null}
              </span>
            </button>
          );
        })}
        {shown.length > MAX_ROWS && <div className="hint">{t('replay.events.more', { count: shown.length - MAX_ROWS })}</div>}
        {shown.length === 0 && capturesShown.length === 0 && <div className="hint">{t('replay.events.none')}</div>}
      </div>
    </Section>
  );
}

/** Two lists, each in time order, as one in time order. */
function mergeByTime<A, B>(a: A[], ta: (x: A) => number, b: B[], tb: (x: B) => number): (A | B)[] {
  const out: (A | B)[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (j >= b.length || (i < a.length && ta(a[i]) <= tb(b[j]))) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return out;
}
