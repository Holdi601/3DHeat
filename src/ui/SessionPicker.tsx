import { useMemo } from 'react';
import { useStore } from '../state/store';
import { int, num, t } from '../i18n';

/**
 * Which match, raid or run to play back.
 *
 * At the top of the sidebar rather than inside the team panel, because it is not
 * a display preference: it decides what counts as one continuous track, and
 * therefore what the team viewer is showing at all. A person is only the same
 * moving thing within one session, and real telemetry is a pile of sessions that
 * overlap in wall-clock time — on the test export three consecutive rows
 * belong to three different matches within the same minute. Played back together
 * they are dozens of players from a dozen matches standing on one map, and the
 * lines drawn between a player's samples in different matches cross it.
 *
 * Shown only when the data has a session column, so nothing appears for a file
 * that is one continuous run.
 */
export function SessionPicker() {
  const dataset = useStore((s) => s.dataset);
  const session = useStore((s) => s.team.session);
  const patchTeam = useStore((s) => s.patchTeam);
  const seek = useStore((s) => s.seek);
  const mode = useStore((s) => s.mode);

  const options = useMemo(() => {
    if (!dataset?.sessionId || dataset.sessionLabels.length === 0) return [];
    const rows = dataset.sessionRows;
    const start = dataset.sessionStart;
    const end = dataset.sessionEnd;
    return dataset.sessionLabels
      .map((label, index) => ({
        index,
        label,
        rows: rows ? rows[index] : 0,
        seconds: start && end ? Math.max(0, end[index] - start[index]) : 0,
      }))
      // Busiest first: with hundreds of sessions the list is only usable if the
      // ones worth watching are at the top. The label alone — an ISO timestamp —
      // says nothing about whether anything happened in that match.
      .sort((a, b) => b.rows - a.rows);
  }, [dataset]);

  if (options.length === 0) return null;

  const current = options.find((o) => o.index === session);

  return (
    <div className="field" style={{ marginTop: 10 }}>
      <div className="label">
        <span>{t('heat.sessionPicker.session')}</span>
        <span className="value">
          {current
            ? t('heat.sessionPicker.rows', { count: current.rows })
            : t('heat.sessionPicker.allAtOnce')}
        </span>
      </div>
      <select
        value={String(session)}
        onChange={(e) => {
          const next = Number(e.target.value);
          patchTeam({ session: next });
          // Jump the playhead to where that match starts.
          //
          // Without this, choosing a session leaves the playhead wherever it was
          // — which for a dataset spanning days is almost certainly outside the
          // few minutes the chosen match occupies, so the correct answer is an
          // empty screen and it reads as the picker having broken something.
          const picked = options.find((o) => o.index === next);
          if (picked && dataset?.sessionStart) seek(dataset.sessionStart[picked.index]);
        }}
      >
        <option value="-1">{t('heat.sessionPicker.all', { count: options.length })}</option>
        {options.map((o) => (
          <option key={o.index} value={String(o.index)}>
            {o.seconds > 0
              ? t('heat.sessionPicker.optionSpan', {
                  session: o.label,
                  count: o.rows,
                  span: formatSpan(o.seconds),
                })
              : t('heat.sessionPicker.option', { session: o.label, count: o.rows })}
          </option>
        ))}
      </select>
      {session < 0 && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          {t('heat.sessionPicker.allHint')}
        </div>
      )}
      {/*
        The session is what box replay plays back. The heat modes count every
        session whatever is picked, so say there that the pick only moves the
        playhead, rather than let it read as a filter.
      */}
      {session >= 0 && mode !== 'team' && <div className="hint">{t('heat.sessionPicker.seekHint')}</div>}
    </div>
  );
}

function formatSpan(seconds: number): string {
  if (seconds < 90) return t('heat.sessionPicker.seconds', { value: num(seconds, 0) });
  const m = Math.floor(seconds / 60);
  if (m < 90) return t('heat.sessionPicker.minutes', { value: int(m) });
  return t('heat.sessionPicker.hours', { value: num(m / 60, 1) });
}
