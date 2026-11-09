import { useMemo } from 'react';
import { int, t } from '../../i18n';
import { useStore } from '../../state/store';
import { useMatchStore } from '../../state/matchStore';
import { loadObjectiveFiles, useObjectivesStore } from '../../state/objectivesStore';
import { OBJECTIVE_LAYERS, modeFromName } from '../../match/objectives';
import { SOURCE_COLUMN } from '../../data/builder';
import { matchesOf, pickedMatches, pickMatches } from '../../match/matches';
import type { GameMatch } from '../../match/wtMatch';
import type { Dataset } from '../../state/types';
import { Check, Section } from '../controls';
import { useEngine } from '../EngineContext';

/** Each loaded match's mode (`Conq1`, `Dom`) and its name, from its summary or else its file name. */
export function matchModes(d: Dataset, games: GameMatch[]): { index: number; mode: string; name: string }[] {
  return matchesOf(d).entries.map((e) => {
    const g = games.find((x) => e.id === x.match || e.id.startsWith(x.match));
    const mode = g?.mode || modeFromName(e.id);
    return { index: e.index, mode, name: g?.modeName || mode };
  });
}

/**
 * The battles' objectives as the view shows them: capture zones, spawns,
 * airfields, areas and bombing targets, each shown or not, their labels; and,
 * with battles of several modes loaded, which mode's are shown.
 */
export function ObjectivesPanel() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const session = useStore((s) => s.team.session);
  const mode = useStore((s) => s.mode);
  const games = useMatchStore((s) => s.games);
  const on = useObjectivesStore((s) => s.on);
  const layers = useObjectivesStore((s) => s.layers);
  const labels = useObjectivesStore((s) => s.labels);
  const timelines = useObjectivesStore((s) => s.timelines);
  const error = useObjectivesStore((s) => s.error);
  const store = useObjectivesStore.getState();
  const modes = useMemo(() => (dataset ? matchModes(dataset, games) : []), [dataset, games]);
  const any = games.some((g) => g.objectives && g.objectives.length);
  if (!dataset || (!any && !modes.some((m) => m.mode))) return null;
  // The modes loaded, how many matches each.
  const byMode = new Map<string, { name: string; indices: number[] }>();
  for (const m of modes) {
    if (!m.mode) continue;
    const e = byMode.get(m.mode);
    if (e) e.indices.push(m.index);
    else byMode.set(m.mode, { name: m.name, indices: [m.index] });
  }
  const set = matchesOf(dataset);
  const picked = pickedMatches(set, filters, session);
  const pickedSet = picked === null ? null : new Set(picked);
  const modeOn = (indices: number[]) => !!pickedSet && indices.length === pickedSet.size && indices.every((i) => pickedSet.has(i));
  const replay = mode === 'team';
  // The heat filters by the file each row came from (named by its battle and mode): every battle of the mode at once.
  const fileAttr = dataset.attrs.find((a) => a.name === SOURCE_COLUMN && a.kind === 'category' && a.categories);
  const filesOf = (m: string | null) =>
    (fileAttr?.categories ?? [])
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c && (m === null || modeFromName(c) === m))
      .map(({ i }) => i);
  const fileFilter = filters.find((f) => f.kind === 'categories' && f.column === SOURCE_COLUMN);
  const byFile = !replay && !!fileAttr;
  const pickMode = (m: string | null, indices: number[] | null) => {
    if (!byFile) return pick(indices);
    const s = useStore.getState();
    const rest = s.filters.filter((f) => !(f.kind === 'categories' && f.column === SOURCE_COLUMN));
    s.setFilters(m === null ? rest : [...rest, { kind: 'categories', column: SOURCE_COLUMN, allowed: filesOf(m) }]);
    if (indices) pick(null);
  };
  const modeIsOn = (m: string, indices: number[]) => {
    if (!byFile) return modeOn(indices);
    if (!fileFilter || fileFilter.kind !== 'categories') return false;
    const want = filesOf(m);
    return want.length === fileFilter.allowed.length && want.every((i) => fileFilter.allowed.includes(i));
  };
  const pick = (indices: number[] | null) => {
    // The replay plays one match: the mode's biggest.
    const chosen =
      replay && indices
        ? [indices.reduce((a, b) => ((set.entries.find((e) => e.index === b)?.rows ?? 0) > (set.entries.find((e) => e.index === a)?.rows ?? 0) ? b : a))]
        : indices;
    const b = pickMatches(dataset, chosen);
    if (b && engine) {
      const r = 0.5 * Math.hypot(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ);
      engine.frameAround((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, (b.minZ + b.maxZ) / 2, Math.max(r, 1));
    }
  };
  const withTimeline = games.filter((g) => g.objectives?.length && timelines[g.match]).length;
  return (
    <Section title={t('objectives.title')} defaultOpen right={<span className="count">{any ? '' : '—'}</span>}>
      {any ? (
        <>
          <Check label={t('objectives.show')} checked={on} onChange={(v) => store.setOn(v)} title={t('objectives.showTitle')} />
          {on && (
            <div className="chips">
              {OBJECTIVE_LAYERS.map((l) => (
                <button
                  key={l}
                  className={`chip${layers[l] ? ' on' : ''}`}
                  onClick={() => store.setLayer(l, !layers[l])}
                  title={t(`objectives.layer.${l}Title`)}
                >
                  {t(`objectives.layer.${l}`)}
                </button>
              ))}
              <button className={`chip${labels ? ' on' : ''}`} onClick={() => store.setLabels(!labels)} title={t('objectives.labelsTitle')}>
                {t('objectives.labels')}
              </button>
            </div>
          )}
          {withTimeline === 0 && (
            <div className="hint">
              {t('objectives.noProgress')}{' '}
              <label className="link">
                {t('objectives.loadProgress')}
                <input
                  type="file"
                  multiple
                  accept=".parquet,.3dheat"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = '';
                    void loadObjectiveFiles(files);
                  }}
                />
              </label>
            </div>
          )}
          {error && <pre className="hint race-error">{error}</pre>}
        </>
      ) : (
        <div className="hint">{t('objectives.none')}</div>
      )}
      {byMode.size > 1 && (
        <div className="field">
          <div className="label">
            <span>{t('objectives.mode')}</span>
          </div>
          <div className="chips">
            {!replay && (
              <button
                className={`chip${(byFile ? !fileFilter : picked === null) ? ' on' : ''}`}
                onClick={() => pickMode(null, null)}
                title={t('objectives.modeAllTitle')}
              >
                {t('objectives.modeAll')} <span className="dim">{int(set.entries.length)}</span>
              </button>
            )}
            {[...byMode.entries()].map(([m, e]) => (
              <button
                key={m}
                className={`chip${modeIsOn(m, e.indices) ? ' on' : ''}`}
                onClick={() => pickMode(m, e.indices)}
                title={t('objectives.modeTitle', { mode: e.name })}
              >
                {e.name} <span className="dim">{int(e.indices.length)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
