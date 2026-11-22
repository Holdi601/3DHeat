import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Section, Select, Slider } from '../controls';
import { BOARD_TOOLS, momentOf, movableSelection, usePlanStore, type BoardTool } from '../../state/planStore';
import { toolKeys } from './boardKeys';
import { LayersPanel } from './LayersPanel';
import { MISSION_ACCEPT, missionToPlan, readMission, type MissionState } from '../../tactics/missions';
import { keepMissionFile } from '../../tactics/missions/sources';
import { MissionOpenedDialog, MissionSaveDialog } from './MissionDialog';
import { hasContent } from '../../tactics/autosave';
import { DrawOptions, NoteOptions, ThrowOptions } from './PenOptions';
import { useStore } from '../../state/store';
import { GAMES, gamePreset } from '../../tactics/games';
import { figureLabel } from '../../tactics/names';
import { playbackAt, type ArrowStyle } from '../../tactics/plan';
import { clock } from '../../tactics/timing';
import { has, num, t, useLang } from '../../i18n';
import { useHelpStore } from '../../state/helpStore';
import { useEngine } from '../EngineContext';
import { SortControl } from '../sort/SortControl';
import { sortList } from '../sort/order';
import { useSort } from '../sort/useSort';
import { fetchValorantMaps, RIOT_NOTICE, valorantLevel, type ValorantMap } from '../../tactics/valorantMaps';
import { GizmoControls, SelectionInspector, TelemetryPanel, TimingSettings } from './TacticsInspector';
import { TasksPanel } from './TasksPanel';
import './tactics.css';
import { NumberBox } from '../NumberBox';
import { Icon } from '../shell/Icon';
import { confirmDialog } from '../shell/kit';
import { TaskBar, TaskGroup } from '../shell/Shell';

/**
 * The tactics board's sidebar: the plan's game, name and side on top, then by
 * task - Draw (the tools with what the one in hand needs under it, what is
 * selected, the figures to place, the layers), Plan (tasks, timing, match
 * data), Load (the plan's file, mission import, the level) and Present.
 */
export function TacticsPanel({ load, present }: { load?: ReactNode; present?: ReactNode }) {
  const plan = usePlanStore((s) => s.plan);
  const tool = usePlanStore((s) => s.tool);
  const kind = usePlanStore((s) => s.kind);
  const team = usePlanStore((s) => s.team);
  const arrowStyle = usePlanStore((s) => s.arrowStyle);
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
  const sort = useSort<string>(
    'tactics.palette',
    [
      { id: 'order', label: t('ui.sort.order'), key: null },
      { id: 'name', label: t('ui.sort.name'), key: (n) => figureLabel(n) },
    ],
    'order',
  );
  const language = useLang();
  // Each group's figures, sorted within the group.
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return preset.palette
      .map((g) => ({
        group: g.group,
        items: sortList(
          g.items.filter((n) => !q || n.includes(q) || figureLabel(n).toLowerCase().includes(q)),
          sort.option.key,
          sort.option.kind ?? 'text',
          sort.dir,
          language,
        ),
      }))
      .filter((g) => g.items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, search, sort.by, sort.dir, language]);

  const tools: { id: BoardTool; label: string; keys: string }[] = BOARD_TOOLS.map((x) => ({ id: x.id, label: t(`tactics.tool.${x.id}`), keys: toolKeys(x.id) }));
  const measuring = usePlanStore((s) => s.measure);
  const author = usePlanStore((s) => s.author);
  const autosave = usePlanStore((s) => s.autosave);
  const formation = usePlanStore((s) => s.formation);
  const groupSize = usePlanStore((s) => movableSelection(s.plan, s.step, s.selection).length);
  const styles: { id: ArrowStyle; label: string }[] = [
    { id: 'move', label: t('tactics.arrow.move') },
    { id: 'attack', label: t('tactics.arrow.attack') },
    { id: 'look', label: t('tactics.arrow.look') },
  ];

  const save = () => {
    const name = (plan.title || 'plan').replace(/[^\w\- ]+/g, '_');
    const author = usePlanStore.getState().author;
    const out = { ...plan, ...(author ? { savedBy: author } : {}), savedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.h3dplan.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const missionRef = useRef<HTMLInputElement>(null);
  const dcsRef = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<string | null>(null);
  const [opened, setOpened] = useState<MissionState | null>(null);
  const [saving, setSaving] = useState(false);
  const importMission = async (file: File) => {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const m = await readMission(file.name, bytes);
      if (hasContent(usePlanStore.getState().plan) && !(await confirmDialog(t('tactics.mission.replace'), t('tactics.mission.replaceOk')))) return;
      // Kept for writing the plan back into it (Save as DCS mission).
      if (m.format === 'dcs-miz') keepMissionFile(m.title, bytes);
      store().replacePlan(missionToPlan(m));
      if (m.format === 'dcs-miz') setOpened(m);
      const units = m.groups.reduce((n, g) => n + g.units.length, 0);
      const count = (k: string) => m.places.filter((p) => p.kind === k).length;
      setImported(
        [
          t('tactics.mission.done', { units, groups: m.groups.length, airbases: count('airbase') + count('farp'), zones: count('zone'), markers: count('marker') + count('objective') + count('bullseye') }),
          m.map ? t('tactics.mission.map', { map: m.map }) : '',
          ...m.notes,
        ]
          .filter(Boolean)
          .join(' '),
      );
      setError(null);
      engine?.frameDataset(true);
    } catch (e) {
      setImported(null);
      setError(t('tactics.mission.bad', { reason: e instanceof Error ? e.message : String(e) }));
    }
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
      {/* The plan itself, above the task bar: which game, its name, and the side placed for. */}
      <div className="tactics-head">
        <div className="tactics-head-row">
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
        </div>
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
      </div>

      <TaskBar tab="plan" />

      <TaskGroup task="draw">
        <Section title={t('tactics.tools')} defaultOpen>
          <div className="tactics-toolgrid" role="toolbar" aria-label={t('tactics.tools')}>
            {tools.map((x) => (
              <button key={x.id} className={tool === x.id ? 'on' : ''} onClick={() => store().setTool(x.id)} title={`${x.label} (${x.keys})`} aria-keyshortcuts={x.keys.replace(' / ', ' ')}>
                <span className="tactics-tool-name">{x.label}</span>
                <kbd>{x.keys.split(' / ')[0]}</kbd>
              </button>
            ))}
          </div>
          {/* What the tool in hand needs, under it; nothing for the tools that need nothing. */}
          {(tool === 'waypoints' || tool === 'select' || tool === 'draw' || tool === 'throw' || tool === 'note') && (
            <div className="tactics-options">
              {tool === 'waypoints' && (
                <>
                  <div className="tactics-tools">
                    {styles.map((x) => (
                      <button key={x.id} className={arrowStyle === x.id ? 'on' : ''} onClick={() => store().setArrowStyle(x.id)}>
                        {x.label}
                      </button>
                    ))}
                  </div>
                  {groupSize > 1 && (
                    <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <input type="checkbox" checked={formation} onChange={(e) => store().setFormation(e.target.checked)} />
                      <span>{t('tactics.formation', { n: groupSize })}</span>
                    </label>
                  )}
                </>
              )}
              {tool === 'select' && <GizmoControls />}
              {tool === 'draw' && <DrawOptions />}
              {tool === 'throw' && <ThrowOptions />}
              {tool === 'note' && <NoteOptions />}
            </div>
          )}
          <ToolHint
            tool={moving ? 'moving' : tool}
            finishing={!!draft || (tool === 'measure' && !!measuring && !measuring.done)}
          />
          {draft && (
            <div className="tactics-tools">
              <button className="on" onClick={() => store().finish()} title="Enter">
                {t('tactics.finishRoute')}
              </button>
              <button onClick={() => store().undoPoint()} title="Backspace">
                {t('tactics.undoPoint')}
              </button>
              <button onClick={() => store().cancel()}>{t('tactics.dropRoute')}</button>
            </div>
          )}
          <div className="tactics-editbar">
            <div className="btn-group">
              <button className="icon-btn" disabled={!canUndo} onClick={() => store().undo()} title={`${t('tactics.undo')} (Ctrl+Z)`} aria-label={t('tactics.undo')}>
                <Icon name="undo" size={15} />
              </button>
              <button className="icon-btn" disabled={!canRedo} onClick={() => store().redo()} title={`${t('tactics.redo')} (Ctrl+Y)`} aria-label={t('tactics.redo')}>
                <Icon name="redo" size={15} />
              </button>
              <button className="icon-btn" onClick={() => store().rotateSelected(-Math.PI / 12)} title={`${t('tactics.rotateLeft')} (Shift+R)`} aria-label={t('tactics.rotateLeft')}>
                <Icon name="rotl" size={15} />
              </button>
              <button className="icon-btn" onClick={() => store().rotateSelected(Math.PI / 12)} title={`${t('tactics.rotateRight')} (R)`} aria-label={t('tactics.rotateRight')}>
                <Icon name="rotr" size={15} />
              </button>
            </div>
            <div className="btn-group">
              <button onClick={() => engine?.applyPreset('Top')}>{t('tactics.topView')}</button>
              <button onClick={() => engine?.applyPreset('Perspective')}>{t('tactics.view3d')}</button>
              <button onClick={() => engine?.frameDataset(true)} title="F">
                {t('tactics.frame')}
              </button>
            </div>
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

        <SelectionInspector />

        <Section title={t('tactics.palette')} defaultOpen>
          <div className="tactics-search-row">
            <input className="tactics-search" type="search" value={search} placeholder={t('tactics.search')} onChange={(e) => setSearch(e.target.value)} />
            <SortControl sort={sort} />
          </div>
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

        <LayersPanel />
      </TaskGroup>

      <TaskGroup task="plan">
        <TasksPanel />

        <Section title={t('tactics.timing.title')}>
          <TimingSettings />
        </Section>

        <TelemetryPanel />
      </TaskGroup>

      <TaskGroup task="load">
        <Section title={t('tactics.file')} defaultOpen>
          <div className="tactics-tools">
            <button onClick={save}>{t('tactics.save')}</button>
            <button onClick={() => fileRef.current?.click()}>{t('tactics.open')}</button>
            <button onClick={() => missionRef.current?.click()} title={t('tactics.mission.hint')}>
              {t('tactics.mission.import')}
            </button>
            <button onClick={() => dcsRef.current?.click()} title={t('tactics.dcs.openHint')}>
              {t('tactics.dcs.open')}
            </button>
            <button onClick={() => setSaving(true)} title={t('tactics.dcs.saveHint')}>
              {t('tactics.dcs.save')}
            </button>
            <button className="danger" onClick={() => void confirmDialog(t('tactics.clearConfirm'), t('tactics.clear')).then((ok) => ok && store().clear())}>
              {t('tactics.clear')}
            </button>
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
          <input
            ref={missionRef}
            type="file"
            accept={MISSION_ACCEPT}
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importMission(f);
              e.target.value = '';
            }}
          />
          <input
            ref={dcsRef}
            type="file"
            accept=".miz"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importMission(f);
              e.target.value = '';
            }}
          />
          {opened && <MissionOpenedDialog mission={opened} onClose={() => setOpened(null)} />}
          {saving && <MissionSaveDialog onClose={() => setSaving(false)} />}
          {imported && <div className="hint">{imported}</div>}
          {error && <div className="hint" style={{ color: 'var(--warm)' }}>{error}</div>}
          <div className="hint">{t('tactics.counts', { figures: plan.figures.length, arrows: plan.arrows.length, steps: plan.steps.length })}</div>
          <label className="field">
            <span>{t('tactics.author')}</span>
            <input type="text" value={author} placeholder={t('tactics.authorPlaceholder')} onChange={(e) => store().setAuthor(e.target.value)} />
          </label>
          {plan.savedAt && <div className="hint">{t('tactics.savedBy', { who: plan.savedBy ?? '-', at: new Date(plan.savedAt).toLocaleString() })}</div>}
          <div className="hint">
            {autosave.full
              ? t('tactics.autosave.full')
              : autosave.at
                ? t(autosave.restored ? 'tactics.autosave.restored' : 'tactics.autosave.kept', { at: new Date(autosave.at).toLocaleTimeString() })
                : t('tactics.autosave.none')}
          </div>
        </Section>
        {load}
      </TaskGroup>

      <TaskGroup task="present">{present}</TaskGroup>
    </div>
  );
}

/** The bottom bar on the board: the steps, their length, and playback. */
export function BoardBar() {
  const plan = usePlanStore((s) => s.plan);
  const step = usePlanStore((s) => s.step);
  const playing = usePlanStore((s) => s.playing);
  const moment = usePlanStore((s) => momentOf(s).time);
  const total = playbackAt(plan, Infinity).total;
  const store = usePlanStore.getState;
  return (
    <div className="board-bar">
      <button className="play" onClick={() => store().play(!playing)} title="K">
        {playing ? '❚❚' : '▶'}
      </button>
      <input
        className="board-time"
        type="range"
        min={0}
        max={Math.max(0.1, total)}
        step={0.1}
        value={Math.min(moment, total)}
        onChange={(e) => store().setScrub(Number(e.target.value))}
        aria-label={t('tactics.time')}
        title={t('tactics.timeHint')}
      />
      <span className="board-clock">
        {clock(moment)} / {clock(total)}
      </span>
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
        <NumberBox
          min={0.5}
          max={120}
          step={0.5}
          digits={2}
          value={plan.steps[step]?.seconds ?? 4}
          onChange={(v) => store().setStepSeconds(step, v)}
        />
      </label>
    </div>
  );
}

/**
 * What the tool in hand does, in one short line where the tool has one (`tactics.hint.<tool>Short`); the whole
 * text, with the gizmo's for the Select tool, is the line's tooltip and is written out while the help (F1) is on.
 */
function ToolHint({ tool, finishing }: { tool: string; finishing: boolean }) {
  const helpOn = useHelpStore((s) => s.on);
  const toggleHelp = useHelpStore((s) => s.toggle);
  const full = [t(`tactics.hint.${tool}`), tool === 'select' ? t('tactics.gizmo.hint') : '', finishing ? t('tactics.hint.finish') : '']
    .filter(Boolean)
    .join(' ');
  const shortKey = `tactics.hint.${tool}Short`;
  if (helpOn || !has(shortKey)) return <div className="hint tactics-hint">{full}</div>;
  return (
    <div className="hint tactics-hint" title={full}>
      {t(shortKey)}
      {finishing ? ` ${t('tactics.hint.finish')}` : ''}{' '}
      <button type="button" className="tactics-hint-more" onClick={toggleHelp} title={full} aria-label={t('tactics.hint.more')}>
        F1
      </button>
    </div>
  );
}
