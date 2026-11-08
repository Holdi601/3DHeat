import { useEffect, useMemo, useState } from 'react';
import { suggestLineSettings, suggestMaxJump, type LineSettings } from '../../data/lines';
import { useStore } from '../../state/store';
import { useEngine } from '../EngineContext';
import { Check, Section, Segmented, Slider } from '../controls';
import { JumpChart } from './JumpChart';
import { int, t } from '../../i18n';
import { lengthText, useUnits } from '../../state/unitsStore';

/** Values offered as chips at most; an event column is a handful, an id column is not one. */
const MAX_VALUES = 120;

/**
 * Line heat's routes: which column holds the events, and which of its values
 * begin a route, end it, and lie along it. See `data/lines.ts` for the rules.
 */
export function LinePanel() {
  useUnits();
  const dataset = useStore((s) => s.dataset);
  const lines = useStore((s) => s.lines);
  const patchLines = useStore((s) => s.patchLines);
  const engine = useEngine();

  const columns = useMemo(
    () => (dataset ? dataset.attrs.filter((a) => a.kind === 'category' && a.categories) : []),
    [dataset],
  );
  const column = columns.find((c) => c.name === lines.column) ?? null;

  // The column's values, the most frequent first, with how many rows each has.
  const values = useMemo(() => {
    if (!column?.categories) return [];
    const counts = new Float64Array(column.categories.length);
    const data = column.data as Uint32Array;
    for (let i = 0; i < data.length; i++) counts[data[i]]++;
    return column.categories
      .map((value, i) => ({ value, count: counts[i] }))
      .filter((v) => v.value !== '' && v.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [column]);

  // What the routes came to, read off the engine as it builds them.
  const [stats, setStats] = useState(engine?.live.lines ?? null);
  useEffect(() => {
    if (!engine) return;
    const id = window.setInterval(() => setStats(engine.live.lines), 400);
    return () => window.clearInterval(id);
  }, [engine]);

  // The limit as the slider has it: the routes are rebuilt once it stops moving,
  // because on a big dataset each rebuild walks every row.
  const [draft, setDraft] = useState<number | null>(null);
  useEffect(() => {
    if (draft === null) return;
    const id = window.setTimeout(() => {
      patchLines({ maxJump: draft });
      setDraft(null);
    }, 200);
    return () => window.clearTimeout(id);
  }, [draft, patchLines]);

  if (!dataset) return null;

  const { minX, minY, minZ, maxX, maxY, maxZ } = dataset.bounds;
  const span = Math.max(1, Math.hypot(maxX - minX, maxY - minY, maxZ - minZ));

  const toggle = (which: 'starts' | 'ends' | 'points', value: string) => {
    const have = lines[which];
    patchLines({ [which]: have.includes(value) ? have.filter((v) => v !== value) : [...have, value] } as Partial<LineSettings>);
  };

  const chips = (which: 'starts' | 'ends' | 'points') => (
    <div className="line-chips">
      {values.slice(0, MAX_VALUES).map((v) => (
        <button
          key={v.value}
          className={`chip-toggle${lines[which].includes(v.value) ? ' on' : ''}`}
          onClick={() => toggle(which, v.value)}
          title={t('heat.linePanel.rows', { count: v.count })}
        >
          {v.value}
        </button>
      ))}
      {values.length > MAX_VALUES && (
        <span className="hint">{t('heat.linePanel.more', { count: values.length - MAX_VALUES })}</span>
      )}
    </div>
  );

  // What a route is built from, and what the data has of it.
  const hasSessions = !!dataset.sessionId;
  const needs: Array<{ label: string; state: string; ok: boolean }> = [
    { label: t('heat.linePanel.req.time'), state: t(dataset.time ? 'heat.linePanel.req.present' : 'heat.linePanel.req.missing'), ok: !!dataset.time },
    {
      label: t('heat.linePanel.req.person'),
      state: t(dataset.personId ? 'heat.linePanel.req.present' : 'heat.linePanel.req.missing'),
      ok: !!dataset.personId,
    },
    {
      label: t('heat.linePanel.req.session'),
      state: hasSessions ? t('heat.linePanel.req.present') : t('heat.linePanel.req.noSession'),
      ok: hasSessions,
    },
    {
      label: t('heat.linePanel.req.events'),
      state:
        column && (lines.starts.length > 0 || lines.ends.length > 0)
          ? t('heat.linePanel.req.eventsChosen', { starts: lines.starts.length, ends: lines.ends.length })
          : t('heat.linePanel.req.noEvents'),
      ok: !!column && lines.starts.length > 0 && lines.ends.length > 0,
    },
  ];

  return (
    <Section title={t('heat.linePanel.title')} defaultOpen>
      <div className="hint">{t('heat.linePanel.about')}</div>
      <div className="line-needs">
        {needs.map((n) => (
          <div key={n.label} className={n.ok ? 'ok' : 'warn'}>
            <span>{n.label}</span>
            <span>{n.state}</span>
          </div>
        ))}
      </div>
      <div className="field">
        <div className="label">
          <span>{t('heat.linePanel.column')}</span>
        </div>
        <select
          value={lines.column ?? ''}
          onChange={(e) => {
            const name = e.target.value || null;
            // A new column's values are new: what was chosen in the old one means nothing here.
            const fresh = suggestLineSettings(dataset);
            patchLines(
              fresh.column === name ? fresh : { column: name, starts: [], ends: [], points: [] },
            );
          }}
        >
          <option value="">{t('heat.linePanel.wholeTracksOption')}</option>
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {!column ? (
        <div className="hint">{t('heat.linePanel.wholeTracks')}</div>
      ) : (
        <>
          <div className="label">
            <span>{t('heat.linePanel.starts')}</span>
          </div>
          {chips('starts')}
          <div className="hint">{t('heat.linePanel.startsHint')}</div>
          <div className="label">
            <span>{t('heat.linePanel.ends')}</span>
          </div>
          {chips('ends')}
          <div className="hint">{t('heat.linePanel.endsHint')}</div>
          <div className="label">
            <span>{t('heat.linePanel.points')}</span>
          </div>
          {chips('points')}
          <div className="hint">{t('heat.linePanel.pointsHint')}</div>
          <div className="row">
            <button onClick={() => patchLines(suggestLineSettings(dataset))}>{t('heat.linePanel.suggest')}</button>
          </div>
        </>
      )}
      <div className="field">
        <div className="label">
          <span>{t('heat.linePanel.view')}</span>
        </div>
        <Segmented
          value={lines.view ?? 'heat'}
          options={[
            { value: 'heat', label: t('app.mode.heat.label') },
            { value: 'teams', label: t('app.mode.teamHeat.label'), disabled: dataset.teamLabels.length === 0 },
            { value: 'difference', label: t('app.mode.difference.label'), disabled: dataset.teamLabels.length < 2 },
          ]}
          onChange={(view) => patchLines({ view })}
        />
        <div className="hint">{t('heat.linePanel.viewHint')}</div>
      </div>
      <Check
        label={t('heat.linePanel.maxJumpOn')}
        checked={lines.maxJump != null}
        title={t('heat.linePanel.maxJumpHint')}
        onChange={(on) => patchLines({ maxJump: on ? (suggestMaxJump(dataset) ?? span / 10) : null })}
      />
      <JumpChart dataset={dataset} limit={draft ?? lines.maxJump ?? null} onLimit={(v) => patchLines({ maxJump: v })} />
      {lines.maxJump != null && (
        <Slider
          label={t('heat.linePanel.maxJump')}
          value={draft ?? lines.maxJump}
          min={span / 5000}
          max={span}
          logarithmic
          onChange={setDraft}
          format={(v) => lengthText(v)}
          hint={t('heat.linePanel.maxJumpHint')}
        />
      )}
      <div className="hint">{t('heat.linePanel.playback')}</div>
      {stats && (
        <div className="hint">
          {t('heat.linePanel.stats', { routes: stats.routes, ended: int(stats.ended), segments: stats.segments })}
          {stats.jumps > 0 && <> {t('heat.linePanel.jumps', { jumps: stats.jumps })}</>}
        </div>
      )}
    </Section>
  );
}
