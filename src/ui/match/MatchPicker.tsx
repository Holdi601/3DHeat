import { useEffect, useMemo } from 'react';
import { int, t } from '../../i18n';
import { matchesOf, pickedMatches, pickMatches, type MatchEntry } from '../../match/matches';
import { killWeapon, type GameMatch } from '../../match/wtMatch';
import { useMatchStore } from '../../state/matchStore';
import { useStore } from '../../state/store';
import { Section } from '../controls';
import { useEngine } from '../EngineContext';
import { partyName, unitByUid, unitsOf, type Unit } from '../replay/units';
import { selectAndFollow } from '../replay/ReplayOverlay';
import { flyTo } from '../replay/replayView';
import { clock } from '../replay/hooks';
import { eventRows } from '../replay/replayData';
import type { Dataset } from '../../state/types';

function duration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * The matches in the loaded replay: one, several or all of them played back
 * at once. A click picks one; the box beside it adds or takes away one more.
 */
export function MatchPicker() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const session = useStore((s) => s.team.session);
  const games = useMatchStore((s) => s.games);
  const docs = useMatchStore((s) => s.docs);
  const mode = useStore((s) => s.mode);
  const set = useMemo(() => (dataset ? matchesOf(dataset) : null), [dataset]);
  const replay = mode === 'team';
  const picked0 = set ? pickedMatches(set, filters, session) : null;
  // The replay is of one match: with several loaded and none picked, the biggest.
  useEffect(() => {
    if (!replay || !dataset || !set || set.entries.length < 2 || picked0 !== null) return;
    const biggest = set.entries.reduce((a, b) => (b.rows > a.rows ? b : a));
    pickMatches(dataset, [biggest.index]);
  }, [replay, dataset, set, picked0]);
  if (!dataset || !set) {
    return (
      <Section title={t('match.picker.title')} defaultOpen>
        <div className="hint">{t('match.picker.noData')}</div>
      </Section>
    );
  }
  const picked = pickedMatches(set, filters, session);
  const isOn = (e: MatchEntry) => picked === null || picked.includes(e.index);
  // The figure replay plays one match or all of them; the heat adds up any set.
  const multi = set.via === 'column' && mode !== 'team';
  // Pick, and bring them into view: matches on different maps are kilometres apart.
  const pick = (picked: number[] | null) => {
    const b = pickMatches(dataset, picked);
    if (b && engine) {
      const r = 0.5 * Math.hypot(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ);
      engine.frameAround((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, (b.minZ + b.maxZ) / 2, Math.max(r, 1));
    }
  };
  const describe = (e: MatchEntry) => {
    const g = games.find((x) => x.match === e.id || e.id.startsWith(x.match));
    if (g) return { name: `${g.map} · ${g.mission || g.battleClass}`, sub: g.started.replace('T', ' ').replace(/\+.*$/, '') };
    const doc = docs.find((d) => d.match === e.id);
    if (doc) return { name: `${doc.teams.join(` ${t('match.matches.vs')} `)}`, sub: doc.map };
    return { name: e.id, sub: '' };
  };
  return (
    <Section title={t('match.picker.title')} defaultOpen right={<span className="count">{set.entries.length > 1 ? int(set.entries.length) : ''}</span>}>
      {set.entries.length > 1 && !replay && (
        <div className={`match-row${picked === null ? ' on' : ''}`} onClick={() => pick(null)}>
          <div className="match-name">{t('match.picker.all', { count: set.entries.length })}</div>
          <div className="match-sub">{t('match.picker.allSub')}</div>
        </div>
      )}
      <div className="match-list">
        {set.entries.map((e) => {
          const d = describe(e);
          const on = isOn(e) && (picked !== null || set.entries.length === 1);
          return (
            <div key={e.index} className={`match-row pick${on ? ' on' : ''}`} onClick={() => pick([e.index])}>
              {multi && set.entries.length > 1 && (
                <input
                  type="checkbox"
                  checked={isOn(e)}
                  title={t('match.picker.addTitle')}
                  onClick={(ev) => ev.stopPropagation()}
                  onChange={(ev) => {
                    const now = picked ?? set.entries.map((x) => x.index);
                    const next = ev.target.checked ? [...now, e.index] : now.filter((i) => i !== e.index);
                    if (next.length) pick(next.length === set.entries.length ? null : next);
                  }}
                />
              )}
              <div>
                <div className="match-name">{d.name}</div>
                <div className="match-sub mono">
                  {[d.sub, duration(e.end - e.start), t('match.picker.rows', { count: e.rows })].filter(Boolean).join(' · ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {set.entries.length > 1 && replay && <div className="hint">{t('match.picker.sessionHint')}</div>}
    </Section>
  );
}

/** A player's unit in the replay, by name. */
function unitOf(d: Dataset | null, name: string): Unit | null {
  if (!d) return null;
  return unitsOf(d).units.find((u) => u.name === name || u.key === name) ?? null;
}

/**
 * The scoreboard and kill feed of the picked matches' summaries (War
 * Thunder's `.match.json`): a player's row follows them in the replay, a kill
 * goes to the moment and the place.
 */
export function GameOverview() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const session = useStore((s) => s.team.session);
  const games = useMatchStore((s) => s.games);
  const set = useMemo(() => (dataset ? matchesOf(dataset) : null), [dataset]);
  if (!games.length) return null;
  // The summaries of the matches being played; every one when the data says nothing of matches.
  const picked = set ? pickedMatches(set, filters, session) : null;
  const ids = set && set.via !== 'whole' ? set.entries.filter((e) => picked === null || picked.includes(e.index)).map((e) => e.id) : null;
  const shown = ids ? games.filter((g) => ids.some((id) => id === g.match || id.startsWith(g.match))) : games;
  const list = shown.length ? shown : games;
  return (
    <>
      {list.map((g) => (
        <Game
          key={g.match}
          g={g}
          dataset={dataset}
          onKill={(time, victim) => {
            if (!dataset) return;
            // The summary counts the replay's own seconds; the table may count from its first row.
            const at = time - (dataset.epochMs === null ? (dataset.timeOrigin ?? 0) : 0);
            useStore.getState().seek(at);
            const place = killPlace(dataset, at, victim);
            if (engine && place) flyTo(engine, dataset, place, 250);
          }}
        />
      ))}
    </>
  );
}

/** Where a kill happened: the event row at its moment naming the victim, else any kill or death row then. */
function killPlace(d: Dataset, time: number, victim: string): { x: number; y: number; z: number } | null {
  const ev = eventRows(d);
  if (!ev || !d.time) return null;
  const index = unitsOf(d);
  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < ev.rows.length; i++) {
    const row = ev.rows[i];
    const dt = Math.abs(d.time[row] - time);
    if (dt > 1) continue;
    const u = ev.persons[i] >= 0 ? index.units[index.personUnit[ev.persons[i]]] : null;
    const named = u && (u.name === victim || u.key === victim);
    const score = dt + (named ? 0 : 1) + (/death|destroy|kill/i.test(ev.labels[i]) ? 0 : 0.5);
    if (score < bestScore) {
      bestScore = score;
      best = row;
    }
  }
  return best >= 0 ? { x: d.px[best], y: d.py[best], z: d.pz[best] } : null;
}

function Game({ g, dataset, onKill }: { g: GameMatch; dataset: Dataset | null; onKill: (time: number, victim: string) => void }) {
  // Times as the timeline and the event list count them: from the table's first row.
  const start = dataset && dataset.epochMs === null ? (dataset.timeOrigin ?? 0) + dataset.timeRange[0] : 0;
  const uids = dataset ? unitByUid(dataset) : null;
  const victimName = (k: GameMatch['kills'][number]) =>
    (k.victimUid !== null && (uids?.get(k.victimUid)?.name ?? (g.unitNames.get(k.victimUid) ? `${g.unitNames.get(k.victimUid)} #${k.victimUid}` : null))) ||
    partyName(dataset!, k.victim, g.unitNames);
  return (
    <Section title={t('match.game.title', { map: g.map })} defaultOpen right={<span className="count">{duration(g.duration)}</span>}>
      <div className="match-sub">
        {[g.mission, g.battleClass.replace(/_/g, ' '), g.started.replace('T', ' ').replace(/\+.*$/, ''), g.author && t('match.game.recordedBy', { name: g.author })].filter(Boolean).join(' · ')}
      </div>
      {g.teams.map((team) => {
        const players = g.players.filter((p) => p.team === team).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        if (!players.length) return null;
        return (
          <table key={team} className="score-table">
            <thead>
              <tr>
                <th>{t('replay.team', { n: team })}</th>
                <th title={t('match.game.airTitle')}>{t('match.game.air')}</th>
                <th title={t('match.game.groundTitle')}>{t('match.game.ground')}</th>
                <th title={t('match.scoreboard.assistsTitle')}>A</th>
                <th title={t('match.scoreboard.deathsTitle')}>D</th>
                <th>{t('match.game.score')}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const u = unitOf(dataset, p.name);
                return (
                  <tr
                    key={p.name}
                    onClick={() => {
                      if (u) selectAndFollow(u, u.persons[u.persons.length - 1]);
                    }}
                    title={t('match.game.playerTitle', { vehicles: p.vehicles.map((v) => u?.vehicle && p.vehicles.length === 1 ? u.vehicle : v).join(', ') })}
                  >
                    <td className="who">
                      {p.clan ? <span className="dim">{p.clan} </span> : null}
                      {p.name}
                      {u?.vehicle ? <span className="dim"> · {u.vehicle}</span> : null}
                    </td>
                    <td>{int(p.air)}</td>
                    <td>{int(p.ground)}</td>
                    <td>{int(p.assists)}</td>
                    <td>{int(p.deaths)}</td>
                    <td>{int(p.score)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })}
      {g.kills.length > 0 && (
        <details className="kill-list">
          <summary>{t('match.game.kills', { count: g.kills.length })}</summary>
          <div className="replay-events">
            {g.kills.map((k, i) => (
              <button key={i} onClick={() => onKill(k.time, dataset ? victimName(k) : k.victim)} title={t('replay.jump')}>
                <span>{clock(k.time - start)}</span>
                <span>
                  {k.killer || '—'} <span className="dim">→</span> {dataset ? victimName(k) : k.victim}
                  {k.weapon || k.weaponName ? <span className="dim" title={k.weaponName && k.weapon !== k.weaponName ? k.weapon : undefined}> · {killWeapon(k)}</span> : null}
                  {k.crash ? <span className="dim"> · {t('match.game.crash')}</span> : null}
                </span>
              </button>
            ))}
          </div>
        </details>
      )}
      {!dataset && <div className="hint">{t('match.game.noData')}</div>}
    </Section>
  );
}
