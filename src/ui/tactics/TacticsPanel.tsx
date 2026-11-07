import { useMemo, useRef, useState } from 'react';
import { Section, Select, Slider } from '../controls';
import { usePlanStore, type BoardTool } from '../../state/planStore';
import { useStore } from '../../state/store';
import { GAMES, gamePreset } from '../../tactics/games';
import { figureLabel } from '../../tactics/names';
import type { ArrowStyle } from '../../tactics/plan';
import { num, t } from '../../i18n';
import { useEngine } from '../EngineContext';
import { fetchValorantMaps, RIOT_NOTICE, valorantLevel, type ValorantMap } from '../../tactics/valorantMaps';
import './tactics.css';

/**
 * The tactics board's sidebar: which game, which side, the tool in hand, the
 * figures to place, the board's size of figures, what is selected, and the
 * plan's file.
 */
export function TacticsPanel() {
  const plan = usePlanStore((s) => s.plan);
  const tool = usePlanStore((s) => s.tool);
  const kind = usePlanStore((s) => s.kind);
  const team = usePlanStore((s) => s.team);
  const arrowStyle = usePlanStore((s) => s.arrowStyle);
  const selected = usePlanStore((s) => s.selected);
  const draft = usePlanStore((s) => s.draft);
  const moving = usePlanStore((s) => s.moving);
  const canUndo = usePlanStore((s) => s.past.length > 0);
  const canRedo = usePlanStore((s) => s.future.length > 0);
  const store = usePlanStore.getState;
  const engine = useEngine();
  const level = useStore((s) => s.level);
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const setLevel = useStore((s) => s.setLevel);
  const [maps, setMaps] = useState<ValorantMap[] | null>(null);
  const [mapBusy, setMapBusy] = useState(false);
  const loadMaps = async () => {
    setMapBusy(true);
    try {
      setMaps(await fetchValorantMaps());
      setError(null);
    } catch (e) {
      setError(t('tactics.valorant.failed', { reason: e instanceof Error ? e.message : String(e) }));
    } finally {
      setMapBusy(false);
    }
  };
  const pickMap = async (uuid: string | null) => {
    const m = maps?.find((x) => x.uuid === uuid);
    if (!m) return;
    setMapBusy(true);
    try {
      setLevel(await valorantLevel(m));
      engine?.applyPreset('Top');
      setError(null);
    } catch (e) {
      setError(t('tactics.valorant.failed', { reason: e instanceof Error ? e.message : String(e) }));
    } finally {
      setMapBusy(false);
    }
  };

  const preset = gamePreset(plan.game);
  const figure = plan.figures.find((f) => f.id === selected) ?? null;
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return preset.palette
      .map((g) => ({ group: g.group, items: g.items.filter((n) => !q || n.includes(q) || figureLabel(n).toLowerCase().includes(q)) }))
      .filter((g) => g.items.length);
  }, [preset, search]);

  const tools: { id: BoardTool; label: string }[] = [
    { id: 'select', label: t('tactics.tool.select') },
    { id: 'place', label: t('tactics.tool.place') },
    { id: 'arrow', label: t('tactics.tool.arrow') },
    { id: 'throw', label: t('tactics.tool.throw') },
    { id: 'area', label: t('tactics.tool.area') },
    { id: 'note', label: t('tactics.tool.note') },
    { id: 'erase', label: t('tactics.tool.erase') },
  ];
  const styles: { id: ArrowStyle; label: string }[] = [
    { id: 'move', label: t('tactics.arrow.move') },
    { id: 'attack', label: t('tactics.arrow.attack') },
    { id: 'look', label: t('tactics.arrow.look') },
  ];

  const save = () => {
    const name = (plan.title || 'plan').replace(/[^\w\- ]+/g, '_');
    const blob = new Blob([JSON.stringify(plan, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.h3dplan.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const open = async (file: File) => {
    try {
      store().load(await file.text(), level?.name ?? '');
      setError(null);
    } catch (e) {
      setError(t('tactics.file.bad', { reason: e instanceof Error ? e.message : String(e) }));
    }
  };

  return (
    <div className="tactics-panel">
      <Section title={t('tactics.title')} defaultOpen>
        <Select
          label={t('tactics.game')}
          value={plan.game}
          options={GAMES.map((g) => ({ value: g.id, label: g.name }))}
          onChange={(g) => g && store().setGame(g)}
        />
        <label className="field">
          <span>{t('tactics.name')}</span>
          <input type="text" value={plan.title} placeholder={t('tactics.namePlaceholder')} onChange={(e) => store().setTitle(e.target.value)} />
        </label>
        {plan.game === 'valorant' &&
          (maps ? (
            <Select
              label={t('tactics.valorant.map')}
              value={null}
              options={maps.map((m) => ({ value: m.uuid, label: m.name }))}
              onChange={(v) => void pickMap(v)}
              allowEmpty
            />
          ) : (
            <div className="tactics-tools">
              <button disabled={mapBusy} onClick={() => void loadMaps()}>
                {mapBusy ? t('tactics.valorant.loading') : t('tactics.valorant.load')}
              </button>
            </div>
          ))}
        {plan.game === 'valorant' && <div className="hint">{RIOT_NOTICE}</div>}
        {!level && <div className="hint">{t('tactics.noLevel')}</div>}
        <div className="tactics-teams" role="radiogroup" aria-label={t('tactics.team')}>
          {plan.teams.map((tm) => (
            <button
              key={tm.id}
              role="radio"
              aria-checked={team === tm.id}
              className={team === tm.id ? 'on' : ''}
              onClick={() => store().setTeam(tm.id)}
            >
              <i style={{ background: `rgb(${tm.color.map((c) => Math.round(c * 255)).join(',')})` }} /> {tm.name}
            </button>
          ))}
        </div>
        <div className="tactics-tools" role="toolbar" aria-label={t('tactics.tools')}>
          {tools.map((x) => (
            <button key={x.id} className={tool === x.id ? 'on' : ''} onClick={() => store().setTool(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        {tool === 'arrow' && (
          <div className="tactics-tools">
            {styles.map((x) => (
              <button key={x.id} className={arrowStyle === x.id ? 'on' : ''} onClick={() => store().setArrowStyle(x.id)}>
                {x.label}
              </button>
            ))}
          </div>
        )}
        <div className="hint">{t(`tactics.hint.${moving ? 'moving' : tool}`)}{draft ? ` ${t('tactics.hint.finish')}` : ''}</div>
        <div className="tactics-tools">
          <button disabled={!canUndo} onClick={() => store().undo()} title="Ctrl+Z">
            {t('tactics.undo')}
          </button>
          <button disabled={!canRedo} onClick={() => store().redo()} title="Ctrl+Y">
            {t('tactics.redo')}
          </button>
          <button onClick={() => store().rotateSelected(-Math.PI / 12)} title="Shift+R">
            ⟲
          </button>
          <button onClick={() => store().rotateSelected(Math.PI / 12)} title="R">
            ⟳
          </button>
          <button onClick={() => engine?.applyPreset('Top')}>{t('tactics.topView')}</button>
          <button onClick={() => engine?.applyPreset('Perspective')}>{t('tactics.view3d')}</button>
          <button onClick={() => engine?.frameDataset(true)} title="F">
            {t('tactics.frame')}
          </button>
        </div>
        <Slider
          label={t('tactics.figureScale')}
          value={plan.figureScale}
          min={0.1}
          max={200}
          logarithmic
          onChange={(v) => store().setFigureScale(v)}
          format={(v) => `${num(v, v < 10 ? 1 : 0)}×`}
          hint={t('tactics.figureScaleHint')}
        />
      </Section>

      {figure && (
        <Section title={t('tactics.selected')} defaultOpen>
          <div className="hint">{figureLabel(figure.kind)}</div>
          <label className="field">
            <span>{t('tactics.label')}</span>
            <input type="text" value={figure.label} onChange={(e) => store().setLabel(figure.id, e.target.value)} />
          </label>
          <div className="tactics-tools">
            <button className={moving ? 'on' : ''} onClick={() => store().startMove()} title="M">
              {t('tactics.move')}
            </button>
            <button onClick={() => store().remove(figure.id)} title="Del">
              {t('tactics.remove')}
            </button>
          </div>
        </Section>
      )}

      <Section title={t('tactics.palette')} defaultOpen>
        <input className="tactics-search" type="search" value={search} placeholder={t('tactics.search')} onChange={(e) => setSearch(e.target.value)} />
        {groups.map((g) => (
          <div key={g.group} className="tactics-group">
            <div className="tactics-group-name">{t(`tactics.group.${g.group.replace(/ /g, '-')}`)}</div>
            <div className="tactics-items">
              {g.items.map((n) => (
                <button key={n} className={tool === 'place' && kind === n ? 'on' : kind === n ? 'picked' : ''} onClick={() => store().setKind(n)}>
                  {figureLabel(n)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title={t('tactics.file')}>
        <div className="tactics-tools">
          <button onClick={save}>{t('tactics.save')}</button>
          <button onClick={() => fileRef.current?.click()}>{t('tactics.open')}</button>
          <button onClick={() => window.confirm(t('tactics.clearConfirm')) && store().clear()}>{t('tactics.clear')}</button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.h3dplan.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void open(f);
            e.target.value = '';
          }}
        />
        {error && <div className="hint" style={{ color: 'var(--warm)' }}>{error}</div>}
        <div className="hint">{t('tactics.counts', { figures: plan.figures.length, arrows: plan.arrows.length, steps: plan.steps.length })}</div>
      </Section>
    </div>
  );
}

/** The bottom bar on the board: the steps, their length, and playback. */
export function BoardBar() {
  const plan = usePlanStore((s) => s.plan);
  const step = usePlanStore((s) => s.step);
  const playing = usePlanStore((s) => s.playing);
  const store = usePlanStore.getState;
  return (
    <div className="board-bar">
      <button className="play" onClick={() => store().play(!playing)} title="K">
        {playing ? '❚❚' : '▶'}
      </button>
      <span className="board-steps" role="tablist" aria-label={t('tactics.steps')}>
        {plan.steps.map((_, i) => (
          <button key={i} role="tab" aria-selected={step === i} className={step === i ? 'on' : ''} onClick={() => store().setStep(i)}>
            {t('tactics.step', { n: i + 1 })}
          </button>
        ))}
        <button onClick={() => store().addStep()} title={t('tactics.addStep')}>
          +
        </button>
        {plan.steps.length > 1 && (
          <button onClick={() => store().removeStep(step)} title={t('tactics.removeStep')}>
            −
          </button>
        )}
      </span>
      <label className="board-seconds">
        {t('tactics.seconds')}
        <input
          type="number"
          min={0.5}
          max={120}
          step={0.5}
          value={plan.steps[step]?.seconds ?? 4}
          onChange={(e) => store().setStepSeconds(step, Number(e.target.value))}
        />
      </label>
    </div>
  );
}
