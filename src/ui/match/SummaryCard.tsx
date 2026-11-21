import { int, t } from '../../i18n';
import type { SummaryHead } from '../../mass/types';

function duration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Players shown at most, the most kills first. */
const TOP = 12;

/**
 * A loaded match's summary (`mass/types.ts`) where it has no scoreboard of
 * its own: the map, mode and length, each side's players, kills and deaths
 * and whether it won, and the players with the most kills.
 */
export function SummaryCard({ s }: { s: SummaryHead }) {
  const players = [...s.playerStats].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths || a.name.localeCompare(b.name)).slice(0, TOP);
  const head = [s.map, s.mode, s.mission].filter((v): v is string => !!v && !!v.trim());
  return (
    <div className="match-summary">
      <div className="match-name">{head.length ? head.join(' · ') : s.id}</div>
      <div className="match-sub mono">
        {[s.started?.replace('T', ' ').replace(/(\.\d+)?(Z|[+-]\d\d:?\d\d)$/, ''), duration(s.duration)].filter(Boolean).join(' · ')}
      </div>
      {s.teams.length > 0 && (
        <table className="score-table compact">
          <thead>
            <tr>
              <th>{t('mass.col.team')}</th>
              <th>{s.players > 0 ? t('mass.stat.players') : t('replay.units.title')}</th>
              <th>{t('mass.col.kills')}</th>
              <th>{t('mass.col.deaths')}</th>
              <th>{t('heat.filterPanel.outcome.won')}</th>
            </tr>
          </thead>
          <tbody>
            {s.teams.map((tm) => (
              <tr key={tm.name}>
                <td className="who">{tm.name}</td>
                <td>{int(s.players > 0 ? tm.players : tm.units)}</td>
                <td>{int(tm.kills)}</td>
                <td>{int(tm.deaths)}</td>
                <td>{s.winner === tm.name || (tm.won !== null && tm.won > 0.5) ? '✓' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {players.length > 0 && (
        <table className="score-table compact">
          <thead>
            <tr>
              <th>{t('match.across.players')}</th>
              <th>{t('mass.col.team')}</th>
              <th>K-D</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} title={p.vehicles.join(', ')}>
                <td className="who">{p.name}</td>
                <td>{s.teams[p.team]?.name ?? ''}</td>
                <td>
                  {int(p.kills)}-{int(p.deaths)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
