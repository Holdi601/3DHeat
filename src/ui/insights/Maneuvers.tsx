/**
 * Maneuvers: how the units of each side moved as groups in a match and the
 * maneuvers they made (`src/insights/maneuver`), on a timeline and in a list.
 * A click goes there - the replay at its start, the camera on its place - and
 * draws it in 3D: the groups' ways as arrows, their outlines, the enemy's
 * front. Each opens its numbers, whether it paid off, and its parallels in
 * doctrine and history from the knowledge base. Counted in its own worker
 * when the tab is first opened on a dataset, and again on request.
 */

import { useEffect, useMemo, useRef } from 'react';
import { int, num, t, useLang } from '../../i18n';
import { citeList, KB_BY_ID } from '../../insights/knowledge';
import { runManeuvers } from '../../insights/maneuver/run';
import { shownMatch, useManeuvers, type Level } from '../../insights/maneuver/store';
import { sideColor } from '../../insights/maneuver/lines';
import type { Maneuver } from '../../insights/maneuver/types';
import { analysisScope } from '../../insights/run';
import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { currentScope, scopeKey } from '../../volumes/scope';
import { Check, Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import './maneuvers.css';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const css = (c: [number, number, number], a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;

/** A maneuver's name in the viewer's language, with its variant. */
export function maneuverName(m: { kind: string; variant?: string }): string {
  const k = t(`maneuver.kind.${m.kind}`);
  return m.variant ? `${k} (${t(`maneuver.variant.${m.variant}`)})` : k;
}

/** Go to a maneuver: the replay in its match at its start, the camera on its place. */
let timer = 0;
function goTo(m: Maneuver, start: number, session: number, d: Dataset, engine: Engine | null): void {
  const st = useStore.getState();
  if (st.mode !== 'team') {
    st.setMode('team');
    clearTimeout(timer);
    timer = window.setTimeout(() => goTo(m, start, session, d, engine), 150);
    return;
  }
  if (session >= 0 && d.sessionId && st.team.session !== session) st.patchTeam({ session });
  st.seek(start + m.t0);
  if (engine) {
    engine.frameAround(m.place.x, m.place.y, m.place.z, Math.max(m.place.radius * 1.8, 1));
    engine.invalidate(2);
  }
}

export function Maneuvers() {
  useLang();
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const teamVisibility = useStore((s) => s.teamVisibility);
  const session = useStore((s) => s.team.session);
  const st = useManeuvers();
  const ctl = useRef<AbortController | null>(null);
  const key = useMemo(
    () => (dataset ? `${dataset.id}|${scopeKey(analysisScope(currentScope(useStore.getState(), 0)))}` : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataset, filters, teamVisibility, session],
  );

  const run = () => {
    const s = useStore.getState();
    const ds = s.dataset;
    if (!ds) return;
    ctl.current?.abort();
    const c = new AbortController();
    ctl.current = c;
    const k = key;
    useManeuvers.getState().set({ running: true, progress: 0, error: null });
    runManeuvers(ds, currentScope(s, 0), { signal: c.signal, onProgress: (f) => useManeuvers.getState().set({ progress: f }) })
      .then((report) => {
        const ms = report.matches;
        const pick = ms.find((m) => m.session === s.team.session) ?? ms[0];
        useManeuvers.getState().set({ report, key: k, running: false, selected: null, session: pick?.session ?? -1, teams: ds.teamLabels.slice() });
      })
      .catch((e) => {
        if ((e as Error).name !== 'AbortError') useManeuvers.getState().set({ running: false, error: String((e as Error).message ?? e) });
      });
  };

  const dsId = key.split('|')[0];
  useEffect(() => {
    const cur = useManeuvers.getState();
    if (cur.key && cur.key.split('|')[0] !== dsId) cur.set({ report: null, key: null, selected: null });
    if (!useManeuvers.getState().report && !useManeuvers.getState().running) run();
    return () => ctl.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsId]);

  // The replay's match picked elsewhere: show that one.
  useEffect(() => {
    const r = useManeuvers.getState().report;
    if (r && session >= 0 && r.matches.some((m) => m.session === session)) useManeuvers.getState().set({ session, selected: null });
  }, [session]);

  if (!dataset) return null;
  const r = st.report;
  const stale = !!r && st.key !== key;
  const { match, list } = shownMatch(st);
  const pick = (m: Maneuver) => {
    st.set({ selected: m.id });
    if (match) goTo(m, match.start, match.session, dataset, engine);
  };
  const redraw = () => engine?.invalidate(2);
  return (
    <div className="ins mv">
      <div className="row wrap" style={{ gap: 6 }}>
        <button onClick={run} disabled={st.running} title={t('maneuver.runTitle')}>
          {r ? t('maneuver.rerun') : t('maneuver.run')}
        </button>
        <Segmented<Level>
          value={st.level}
          onChange={(level) => {
            st.set({ level });
            redraw();
          }}
          options={(['high', 'medium', 'low'] as const).map((v) => ({ value: v, label: t(`maneuver.level.${v}`) }))}
        />
        <Check
          checked={st.showAll}
          onChange={(v) => {
            st.set({ showAll: v });
            redraw();
          }}
          label={t('maneuver.showAll')}
        />
      </div>
      {st.running && <div className="hint">{t('maneuver.counting', { pct: `${num(st.progress * 100, 0)}%` })}</div>}
      {st.error && <div className="hint" style={{ color: 'var(--warm)' }}>{t('maneuver.error', { error: st.error })}</div>}
      {stale && !st.running && <div className="hint" style={{ color: 'var(--warm)' }}>{t('maneuver.stale')}</div>}
      {r && r.matches.length > 1 && (
        <label className="row" style={{ gap: 6 }}>
          {t('maneuver.match')}
          <select value={match?.session ?? -1} onChange={(e) => st.set({ session: Number(e.target.value), selected: null })}>
            {r.matches.map((m) => (
              <option key={m.session} value={m.session}>
                {dataset.sessionLabels[m.session] ?? `#${m.session}`}
              </option>
            ))}
          </select>
        </label>
      )}
      {match && (
        <>
          <div className="hint">
            {t('maneuver.summary', { n: int(list.length), groups: int(match.groups.length), ms: int(match.ms) })}
          </div>
          {list.length === 0 ? (
            <div className="hint">{t('maneuver.none')}</div>
          ) : (
            <>
              <Timeline list={list} duration={match.duration} teams={dataset.teamLabels} selected={st.selected} onPick={pick} />
              <ol className="ins-list mv-list">
                {list.map((m) => (
                  <ManeuverRow key={m.id} m={m} teams={dataset.teamLabels} open={st.selected === m.id} onPick={() => pick(m)} />
                ))}
              </ol>
              <PaidTable list={list} teams={dataset.teamLabels} />
            </>
          )}
        </>
      )}
    </div>
  );
}

/** The match on a time axis: a lane per side, each maneuver a bar from its start to its end. */
function Timeline({ list, duration, teams, selected, onPick }: { list: Maneuver[]; duration: number; teams: string[]; selected: string | null; onPick: (m: Maneuver) => void }) {
  const sides = [...new Set(list.map((m) => m.team))].sort((a, b) => a - b);
  // In about the panel's own pixels, so the labels keep their shape.
  const W = 300;
  const lane = 12;
  const H = sides.length * lane + 14;
  const end = Math.max(duration, ...list.map((m) => m.t1), 1);
  const x = (s: number) => (s / end) * W;
  const tick = [30, 60, 120, 300, 600, 900, 1800, 3600, 7200].find((s) => end / s <= 6) ?? 14400;
  const ticks: number[] = [];
  for (let s = 0; s <= end; s += tick) ticks.push(s);
  return (
    <svg className="mv-timeline" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('maneuver.timeline')}>
      {ticks.map((s) => (
        <g key={s}>
          <line x1={x(s)} x2={x(s)} y1={0} y2={H - 12} className="mv-tick" />
          <text x={x(s) + 2} y={H - 2} className="mv-tick-label">
            {clock(s)}
          </text>
        </g>
      ))}
      {list.map((m) => {
        const row = sides.indexOf(m.team);
        const on = selected === m.id;
        return (
          <rect
            key={m.id}
            x={x(m.t0)}
            y={row * lane + 2}
            width={Math.max(4, x(m.t1) - x(m.t0))}
            height={lane - 4}
            rx={2}
            fill={css(sideColor(m.team, teams[m.team]), on ? 1 : 0.35 + 0.5 * m.confidence)}
            stroke={on ? 'var(--text, #fff)' : 'none'}
            onClick={() => onPick(m)}
            style={{ cursor: 'pointer' }}
          >
            <title>{`${clock(m.t0)} ${maneuverName(m)} - ${teams[m.team] ?? '—'}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

function ManeuverRow({ m, teams, open, onPick }: { m: Maneuver; teams: string[]; open: boolean; onPick: () => void }) {
  const side = teams[m.team] ?? '—';
  const paid = m.outcome.paid === 1 ? 'yes' : m.outcome.paid === 0 ? 'no' : 'unknown';
  return (
    <li className={`ins-item${open ? ' open' : ''}`}>
      <button className="ins-head" onClick={onPick} title={t('maneuver.showTitle')}>
        <span className="mv-dot" style={{ background: css(sideColor(m.team, side)) }} aria-hidden />
        <span className="ins-text">
          <b>{clock(m.t0)}</b> {maneuverName(m)} <span className="mv-dim">{side}</span>
        </span>
        <span className="ins-tags">
          <span className={`ins-conf ${m.level}`}>{t(`maneuver.level.${m.level}`)}</span>
          <span className={`mv-paid ${paid}`}>{t(`maneuver.paid.${paid}`)}</span>
        </span>
      </button>
      {open && <Details m={m} teams={teams} />}
    </li>
  );
}

function Details({ m, teams }: { m: Maneuver; teams: string[] }) {
  const o = m.outcome;
  const entries = m.kb.map((id) => KB_BY_ID.get(id)).filter((e): e is NonNullable<typeof e> => !!e);
  return (
    <div className="ins-details">
      <div>
        {t('maneuver.outcome', { kills: int(o.kills), losses: int(o.losses), secs: int(o.secs), exchange: num(o.exchange, 2), baseline: num(o.baseline, 2) })}
        {o.captures > 0 && ` ${t('maneuver.captures', { n: int(o.captures) })}`}
      </div>
      <div className="hint">
        {t('maneuver.against', { side: m.against >= 0 ? (teams[m.against] ?? '—') : '—', units: int(m.units.length), conf: num(m.confidence * 100, 0) })}
      </div>
      <dl>
        {Object.entries(m.evidence).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{typeof v === 'number' ? (Number.isInteger(v) ? int(v) : num(v, 2)) : v}</dd>
          </div>
        ))}
      </dl>
      {entries.length > 0 && (
        <div className="mv-kb">
          <div className="hint">{t('maneuver.parallels')}</div>
          <ul>
            {entries.map((e) => (
              <li key={e.id}>
                <b>{e.title}</b>
                {e.when ? ` (${e.when})` : ''} <span className="mv-dim">{citeList(e, 2)}</span>
                <div className="mv-dim">{e.lesson}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** How often each kind paid off in this match, by side. */
function PaidTable({ list, teams }: { list: Maneuver[]; teams: string[] }) {
  const rows = new Map<string, { kind: Maneuver['kind']; team: number; n: number; paid: number; judged: number }>();
  for (const m of list) {
    const k = `${m.kind}|${m.team}`;
    let r = rows.get(k);
    if (!r) rows.set(k, (r = { kind: m.kind, team: m.team, n: 0, paid: 0, judged: 0 }));
    r.n++;
    if (m.outcome.paid !== null) r.judged++;
    if (m.outcome.paid === 1) r.paid++;
  }
  return (
    <table className="mv-table">
      <thead>
        <tr>
          <th>{t('maneuver.col.kind')}</th>
          <th>{t('maneuver.col.side')}</th>
          <th>{t('maneuver.col.made')}</th>
          <th>{t('maneuver.col.paid')}</th>
        </tr>
      </thead>
      <tbody>
        {[...rows.values()]
          .sort((a, b) => b.n - a.n)
          .map((r) => (
            <tr key={`${r.kind}|${r.team}`}>
              <td>{t(`maneuver.kind.${r.kind}`)}</td>
              <td>{teams[r.team] ?? '—'}</td>
              <td>{int(r.n)}</td>
              <td>{r.judged ? `${int(r.paid)}/${int(r.judged)}` : '—'}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
