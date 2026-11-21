import { useEffect, useMemo, useRef, useState } from 'react';
import { filesFromDataTransfer } from './data/filePick';
import { probeHostMemory } from './data/hostMemory';
import { detectBudgets } from './data/memory';
import { datasetCapabilities, modeBlockedReason, splitHasTwoSides } from './data/validate';
import { t, useLang } from './i18n';
import type { BackendPreference } from './render/createRenderer';
import { Engine } from './render/engine';
import { useStore } from './state/store';
import { useHelpStore } from './state/helpStore';
import { raceClock, useRaceStore } from './state/raceStore';
import { loadLapFiles } from './ui/race/actions';
import { RaceBar } from './ui/race/RaceBar';
import { HelpPanel } from './ui/help/HelpPanel';
import { RaceWheelLabels } from './ui/race/RaceHelp';
import { RaceHud } from './ui/race/RaceHud';
import { RaceLabels } from './ui/race/RaceLabels';
import { RacePanel } from './ui/race/RacePanel';
import './ui/race/race.css';
import { useMatchStore } from './state/matchStore';
import { loadObjectiveFiles } from './state/objectivesStore';
import { ObjectivesPanel } from './ui/match/ObjectivesPanel';
import { ObjectiveLabels } from './ui/match/ObjectiveLabels';
import { MatchPanel } from './ui/match/MatchPanel';
import { BoardBar, TacticsPanel } from './ui/tactics/TacticsPanel';
import { LayoutReference } from './ui/tactics/LayoutReference';
import { BoardLabels } from './ui/tactics/BoardLabels';
import { boardKeyDown } from './ui/tactics/boardKeys';
import { ReplayOverlay } from './ui/replay/ReplayOverlay';
import { HitMarkTip } from './ui/replay/HitMarkTip';
import { ReplayExtras } from './ui/replay/ReplayExtras';
import { ReplayPanel } from './ui/replay/ReplayPanel';
import { UnitCard } from './ui/replay/UnitCard';
import { OverlayPanel, useFigureOverlay } from './ui/replay/FigureOverlay';
import { LeanOverlayPanel } from './ui/overlay/LeanOverlayPanel';
import { GameOverview, MatchPicker } from './ui/match/MatchPicker';
import { SeriesPanel } from './ui/match/SeriesPanel';
import { matchesAreSessions } from './match/matches';
import { useReplayStore } from './state/replayStore';
import { usePlanStore } from './state/planStore';
import './ui/match/match.css';
import type { ViewMode } from './state/types';
import { Rich, Segmented } from './ui/controls';
import { EngineContext } from './ui/EngineContext';
import { applyBuildings } from './ui/replay/buildings';
import { SessionPicker } from './ui/SessionPicker';
import { SoftwareRenderingWarning } from './ui/SoftwareRenderingWarning';
import { DatasetPanel } from './ui/panels/DatasetPanel';
import { EntityPanel } from './ui/panels/EntityPanel';
import { FilterPanel } from './ui/panels/FilterPanel';
import { HeatPanel } from './ui/panels/HeatPanel';
import { LevelPanel } from './ui/panels/LevelPanel';
import { MeasurePanel } from './ui/panels/MeasurePanel';
import { VolumePanel } from './ui/panels/VolumePanel';
import { InsightsPanel } from './ui/insights/InsightsPanel';
import { PathPanel } from './ui/panels/PathPanel';
import { SourcePanel } from './ui/panels/SourcePanel';
import { SlicePanel } from './ui/panels/SlicePanel';
import { SplitPanel } from './ui/panels/SplitPanel';
import { TeamPanel, TeamsList } from './ui/panels/TeamPanel';
import { CameraPanel, PerfPanel } from './ui/panels/ViewPanel';
import { SpeedOverlay } from './ui/SpeedOverlay';
import { StatsOverlay } from './ui/StatsOverlay';
import { WorldCredits } from './ui/WorldCredits';
import { WorldOverlay } from './ui/WorldOverlay';
import { VolumeSigns } from './ui/signs/VolumeSigns';
import { clearLook } from './ui/replay/pair';
import { CameraReadout, copyCameraPose } from './ui/CameraReadout';
import { PickCard } from './ui/PickCard';
import { HeatLabels } from './ui/heatInspect/HeatLabels';
import { CasterCinema } from './ui/insights/CasterCinema';
import { ViewsPanel } from './ui/panels/ViewsPanel';
import { NotesPanel } from './ui/notes/NotesPanel';
import { NotesLayer } from './ui/notes/NotesLayer';
import { BreakdownWindow } from './ui/breakdown/BreakdownPanel';
import { VersusWindow } from './ui/versus/VersusPanel';
import { MassPanel, MassWindow } from './ui/mass/MassPanel';
import { useInspectStore } from './state/inspectStore';
import { Timeline } from './ui/Timeline';
import { LinePanel } from './ui/panels/LinePanel';
import { UpdateBanner } from './ui/UpdateBanner';
import { VehiclePanel } from './ui/vehicle/VehiclePanel';
import { VehicleOverlay } from './ui/vehicle/VehicleOverlay';
import { guardBrowserKeys } from './ui/browserKeys';
import { Brand, More, TaskBar, TaskGroup, WorkspaceBar } from './ui/shell/Shell';
import { CommandPalette } from './ui/shell/CommandPalette';
import { ShortcutSheet } from './ui/shell/ShortcutSheet';
import { QuickBar } from './ui/shell/QuickBar';
import { ConfirmHost, ToastHost } from './ui/shell/kit';
import { installShellKeys } from './ui/shell/keys';
import { taskOf, useShell } from './ui/shell/shellStore';

/** The view modes, in the viewer's language: a function, so the words are looked up when shown. */
const modes = (): Array<{ value: ViewMode; label: string; title: string }> => [
  {
    value: 'heat-simple',
    label: t('app.mode.heat.label'),
    title: t('app.mode.heat.title'),
  },
  {
    value: 'heat-difference',
    label: t('app.mode.difference.label'),
    title: t('app.mode.difference.title'),
  },
  {
    value: 'heat-teams',
    label: t('app.mode.teamHeat.label'),
    title: t('app.mode.teamHeat.title'),
  },
  {
    value: 'team',
    label: t('app.mode.overlay.label'),
    title: t('app.mode.overlay.title'),
  },
  {
    value: 'heat-lines',
    label: t('app.mode.lineHeat.label'),
    title: t('app.mode.lineHeat.title'),
  },
];

/** The number keys, in the mode bar's order. */
const DIGIT_MODES: Record<string, ViewMode> = {
  Digit1: 'heat-simple',
  Digit2: 'heat-difference',
  Digit3: 'heat-teams',
  Digit4: 'heat-lines',
};

/** The match tab's two views: the units played back as figures, or the heat of the picked matches. */
type MatchView = 'replay' | 'heat';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const dataset = useStore((s) => s.dataset);
  const setPlaying = useStore((s) => s.setPlaying);
  const tab = useRaceStore((s) => s.tab);
  const raceTab = tab === 'race';
  const matchTab = tab === 'match';
  const planTab = tab === 'plan';
  const vehicleTab = tab === 'vehicle';
  const raceCharts = useRaceStore((s) => s.view.charts);
  const sidebarHidden = useShell((s) => s.sidebarHidden);
  const sidebarTask = useShell((s) => taskOf(s.task, tab));
  const lang = useLang();

  /**
   * The replay lives on the match tab: there the units play back as figures
   * (the replay mode) unless the heat of the picked matches is asked for, and
   * the heatmap tab only ever shows heat. The heat mode last used is kept, so
   * going back to the heat finds it as it was.
   */
  const lastHeat = useRef<ViewMode>('heat-simple');
  /** The heatmap tab's own mode, the figure overlay among them, kept while the match tab borrows the setting. */
  const heatTabMode = useRef<ViewMode>('heat-simple');
  // Browser shortcuts (Ctrl+S, Ctrl+P, F5...) don't fire while flying, and closing the tab with data loaded asks first.
  useEffect(() => guardBrowserKeys(), []);
  // The shell's keys (palette, key sheet, side panel, workspaces), ahead of every other handler.
  useEffect(() => installShellKeys(), []);
  // The label size on the document, so every kind of label over the view takes
  // it - units, events, objectives, the grid, place names, race and board labels
  // - and not only the units' own (`--label-scale` in the stylesheets).
  useEffect(() => {
    const apply = (v: number) => document.documentElement.style.setProperty('--label-scale', String(v));
    apply(useReplayStore.getState().labelScale);
    return useReplayStore.subscribe((s, prev) => {
      if (s.labelScale !== prev.labelScale) apply(s.labelScale);
    });
  }, []);
  useEffect(() => {
    if (mode !== 'team') lastHeat.current = mode;
    if (useRaceStore.getState().tab === 'heat') heatTabMode.current = mode;
  }, [mode]);
  useEffect(() => {
    // The figures need a person column: without one the Match tab opens on its heat.
    const st = useStore.getState();
    const figures = !st.dataset || !modeBlockedReason('team', datasetCapabilities(st.dataset));
    if (tab === 'match') setMode(figures ? 'team' : lastHeat.current);
    else if (tab === 'heat') setMode(heatTabMode.current);
    // A level's painted buildings: solid in the replay (as chosen there), see-through over the heat.
    if (tab === 'match') applyBuildings(useReplayStore.getState().buildings === 'solid');
    else if (tab === 'heat') applyBuildings(false);
  }, [tab, setMode]);
  useFigureOverlay();
  const matchView: MatchView = mode === 'team' ? 'replay' : 'heat';

  // Modes the loaded data cannot support are disabled rather than offered,
  // because the alternative is an empty viewport with no explanation.
  const capabilities = useMemo(() => datasetCapabilities(dataset), [dataset]);
  // A column split gives difference mode its two sides on data without groups.
  const split = useStore((s) => s.split);
  const columnSplit = useMemo(() => splitHasTwoSides(split, dataset), [split, dataset]);
  const modeOptions = useMemo(
    () =>
      modes().map((m) => {
        const blocked = dataset ? modeBlockedReason(m.value, capabilities, columnSplit) : null;
        return {
          ...m,
          disabled: !!blocked,
          title: blocked ? t('app.mode.unavailable', { reason: blocked }) : m.title,
        };
      }),
    // `lang`: the labels are words, looked up again in a new language.
    [dataset, capabilities, columnSplit, lang],
  );
  const figuresOption = modeOptions.find((m) => m.value === 'team');

  /**
   * Ask the host its real memory, once, at startup.
   *
   * Here rather than only in the resource panel, because the figure is what sizes
   * the fit check next to the Load button — and that is read long before anyone
   * opens the panel. Without this the first verdict a user sees is computed from
   * the browser's 8GiB cap, which on a large machine can be the difference between
   * "load every 6th row" and "loads fine".
   *
   * A null answer changes nothing: the store's initial detection already holds the
   * heuristic, and that stays correct for any static deployment, where there is no
   * server to ask.
   */
  useEffect(() => {
    let cancelled = false;
    void probeHostMemory().then((host) => {
      if (cancelled || !host) return;
      // With the renderer's own limits when there is a renderer, and this is not
      // optional: passing null here re-derived the GPU ceiling from nothing and
      // wrote back the 2GB fallback, undoing the figure the resource panel had
      // already detected. It presented as a 2GB GPU budget refusing a load on a
      // machine with a large card — a race whose loser was whichever effect ran
      // second. Depending on `engine` makes the later run the better-informed one.
      const r = engine?.rendererInfo() ?? null;
      useStore.getState().setBudgets(
        detectBudgets(
          r
            ? {
                gpuName: r.gpuName,
                maxTextureSize: r.maxTextureSize,
                maxBufferBytes: r.maxBufferBytes,
              }
            : null,
          host,
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [engine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const e = new Engine(canvas);
    let cancelled = false;

    // Backend choice is overridable from the URL so a WebGPU problem can be
    // isolated from a rendering problem without editing code.
    const forced = new URLSearchParams(window.location.search).get('backend');
    const preference: BackendPreference =
      forced === 'webgl2' || forced === 'webgpu' ? forced : 'auto';

    void e.init(preference).then(() => {
      if (cancelled) return;
      if (e.initError) {
        setFatal(e.initError);
        e.dispose();
        return;
      }
      e.start();
      setEngine(e);
      if (import.meta.env.DEV) {
        // Handle for the smoke test and console poking; dev only.
        (window as unknown as Record<string, unknown>).__3dheat_engine = e;
        (window as unknown as Record<string, unknown>).__3dheat_engineLive = e.live;
      }
    });

    return () => {
      cancelled = true;
      e.dispose();
      setEngine(null);
    };
  }, []);

  /**
   * Where the far cull plane was last put, so toggling it does not lose the spot.
   *
   * A ref rather than state: nothing renders from it, and it is written from a
   * key handler that must not re-subscribe on every keystroke.
   */
  const lastCullFar = useRef(6000);

  // Global shortcuts that don't belong to the camera.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      // Help works with the focus anywhere, a slider or a list too: F1 never types.
      // (`?` is the key sheet's now: ui/shell/keys.ts.)
      if (ev.code === 'F1') {
        ev.preventDefault();
        useHelpStore.getState().toggle();
        return;
      }
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLSelectElement) return;
      // A modal dialog (a confirm) takes the keys: the board and the view stay as they are under it.
      if (ev.target instanceof Element && ev.target.closest('[aria-modal="true"]')) return;
      const race = useRaceStore.getState();
      if (race.tab === 'plan') {
        // The board's own keys (ui/tactics/boardKeys.ts); the heat modes' number keys do nothing here.
        if (boardKeyDown(ev) || ev.code.startsWith('Digit')) return;
      }
      // The vehicle heatmap has no timeline and no heat modes: only framing (F) and the help keys reach it.
      if (race.tab === 'vehicle' && ev.code !== 'KeyF') return;
      if (race.tab === 'race') {
        // The race tab's own transport; the heat modes' number keys do nothing here.
        if (ev.code === 'KeyK') {
          ev.preventDefault();
          race.patchReplay({ playing: !race.replay.playing });
          return;
        }
        if (ev.code === 'Home') {
          raceClock.set(0);
          return;
        }
        if (ev.code.startsWith('Digit')) return;
      }
      if (ev.code === 'KeyK') {
        ev.preventDefault();
        setPlaying(!useStore.getState().timeline.playing);
      } else if (ev.code === 'KeyF' && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.repeat) {
        // Not with a modifier held: Ctrl is the fly camera's down key, and a
        // Ctrl+F (or a held F repeating) threw the camera out to frame the
        // whole map in the middle of a flight.
        engine?.frameDataset();
      } else if (ev.code === 'KeyT' && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        // The tactical display, on and off.
        const r = useReplayStore.getState();
        r.setLook({ on: !r.look.on });
      } else if (ev.code === 'KeyC' && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        // The camera's pose to the clipboard, as the readout over the view says it.
        void copyCameraPose(engine);
      } else if (ev.code === 'KeyG' && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        // Into the jump box. The keystroke itself must not land in it.
        ev.preventDefault();
        useInspectStore.getState().patch({ showCamera: true });
        useInspectStore.getState().requestJumpFocus();
      } else if (ev.code === 'Escape') {
        engine?.inspector.clear();
        // The second unit goes first, then the follow.
        if (!clearLook()) useReplayStore.getState().stopFollow();
      } else if (DIGIT_MODES[ev.code]) {
        // Through the same check as the mode bar, so a key cannot reach a mode
        // the bar shows as unavailable and leave an empty view.
        const next = DIGIT_MODES[ev.code];
        const st = useStore.getState();
        const columnSplit = splitHasTwoSides(st.split, st.dataset);
        if (!st.dataset || !modeBlockedReason(next, datasetCapabilities(st.dataset), columnSplit)) setMode(next);
      } else if (ev.code === 'BracketLeft' || ev.code === 'BracketRight') {
        // The far cull plane, pushed in and out while flying.
        //
        // On the keyboard rather than only on a slider because it is a control
        // you sweep, not one you set: the way to read which floor of a building
        // the traffic is on is to walk the plane through it and watch what
        // appears. Reaching for a logarithmic slider between each step loses the
        // comparison.
        //
        // Geometric steps, because the useful range spans four orders of
        // magnitude — a room is metres and the map is kilometres — and a fixed
        // step is either uselessly slow at one end or unusable at the other.
        ev.preventDefault();
        const h = useStore.getState().heat;
        const step = ev.shiftKey ? 1.35 : 1.12;
        const from = h.cullFar > 0 ? h.cullFar : lastCullFar.current;
        const next = ev.code === 'BracketRight' ? from * step : from / step;
        const clamped = Math.max(100, Math.min(400_000, next));
        lastCullFar.current = clamped;
        useStore.getState().patchHeat({ cullFar: clamped });
      } else if (ev.code === 'Backslash') {
        // Off and on again at the distance it was left, so a comparison against
        // the whole field is one keystroke away and does not cost the position.
        ev.preventDefault();
        const h = useStore.getState().heat;
        if (h.cullFar > 0) {
          lastCullFar.current = h.cullFar;
          useStore.getState().patchHeat({ cullFar: 0 });
        } else {
          useStore.getState().patchHeat({ cullFar: lastCullFar.current });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engine, setMode, setPlaying]);

  return (
    <EngineContext.Provider value={engine}>
      <div className={`app${sidebarHidden ? ' no-sidebar' : ''}${raceTab ? ' race' : ''}${matchTab ? ' match' : ''}${vehicleTab ? ' vehicle' : ''}${raceTab && !raceCharts ? ' no-charts' : ''}`}>
        <aside className="sidebar" data-task={sidebarTask}>
          <Brand />
          <UpdateBanner />
          <WorkspaceBar />

          {vehicleTab ? (
            <>
              <div style={{ padding: '12px 16px 0' }}>
                <SoftwareRenderingWarning />
              </div>
              <TaskBar tab="vehicle" />
              <TaskGroup task="load">
                <SourcePanel />
              </TaskGroup>
              {/* Its own groups: Explore (the vehicle, the look, the filter) and Analyse (the tallies). */}
              <VehiclePanel />
              <TaskGroup task="present">
                <CameraPanel />
              </TaskGroup>
            </>
          ) : planTab ? (
            <TacticsPanel
              load={
                <>
                  <LevelPanel />
                  <LayoutReference />
                </>
              }
              present={<CameraPanel />}
            />
          ) : raceTab ? (
            <>
              <TaskBar tab="race" />
              <TaskGroup task="load">
                <RacePanel part="load" />
                <LevelPanel />
              </TaskGroup>
              <TaskGroup task="analyse">
                <RacePanel part="analyse" />
              </TaskGroup>
              <TaskGroup task="present">
                <RacePanel part="present" />
                <CameraPanel />
              </TaskGroup>
            </>
          ) : matchTab ? (
            <>
              <div style={{ padding: '12px 16px 0' }}>
                <SoftwareRenderingWarning />
                <Segmented<MatchView>
                  value={matchView}
                  options={[
                    {
                      value: 'replay',
                      label: t('app.matchView.replay'),
                      // As the heat tab's figure overlay: unavailable, and why, when the data cannot support it.
                      title: figuresOption?.disabled ? figuresOption.title : t('app.matchView.replayTitle'),
                      disabled: figuresOption?.disabled,
                    },
                    { value: 'heat', label: t('app.matchView.heat'), title: t('app.matchView.heatTitle') },
                  ]}
                  onChange={(v) => setMode(v === 'replay' ? 'team' : lastHeat.current)}
                />
                {matchView === 'heat' && (
                  <div style={{ marginTop: 8 }}>
                    <Segmented value={mode} options={modeOptions.filter((m) => m.value !== 'team')} onChange={setMode} />
                  </div>
                )}
                {/* Rounds (CS2): the matches themselves are picked below. */}
                {dataset && !matchesAreSessions(dataset) && <SessionPicker />}
              </div>
              <TaskBar tab="match" />
              {/* Grouped by task (ui/shell/Shell.tsx); the level first: it is loaded before the data. */}
              <TaskGroup task="load">
                <LevelPanel />
                {!dataset && <SourcePanel />}
                <MatchPicker />
                <SeriesPanel />
                <GameOverview />
                {dataset && <SourcePanel />}
              </TaskGroup>
              <TaskGroup task="explore">
                {matchView === 'replay' ? (
                  <>
                    <ReplayPanel />
                    <ObjectivesPanel />
                    <TeamPanel />
                  </>
                ) : (
                  <>
                    <HeatPanel />
                    <ObjectivesPanel />
                  </>
                )}
                <MatchPanel />
                <FilterPanel />
              </TaskGroup>
              <TaskGroup task="compare">
                <VolumePanel />
                <InsightsPanel />
              </TaskGroup>
              <TaskGroup task="present">
                <ViewsPanel />
                <NotesPanel />
                <CameraPanel />
              </TaskGroup>
            </>
          ) : (
          <>
          <div style={{ padding: '12px 16px' }}>
            {/*
              Before the controls, not filed under diagnostics: a CPU rasteriser
              is experienced as the viewer being broken, so the explanation has
              to be where the user already is.
            */}
            <SoftwareRenderingWarning />
            <Segmented value={mode} options={modeOptions} onChange={setMode} />
            {/*
              Above everything, and outside the team panel: the session decides
              what counts as one continuous track, so it changes what the viewer
              is showing rather than how it looks. Renders nothing when the data
              has no session column.
            */}
            <SessionPicker />
            {dataset && !capabilities.canTimeline && (
              <div className="hint" style={{ marginTop: 8, color: 'var(--warm)' }}>
                {t('app.hint.noTime')}
              </div>
            )}
            {dataset && capabilities.flatAxes.length > 0 && (
              <div className="hint" style={{ marginTop: 6 }}>
                {t('app.hint.flat', { axes: capabilities.flatAxes.map((a) => a.toUpperCase()).join('/') })}
              </div>
            )}
          </div>

          <TaskBar tab="heat" />
          {/* Grouped by task (ui/shell/Shell.tsx); the level first: it is loaded before the data. */}
          <TaskGroup task="load">
            <LevelPanel />
            <SourcePanel />
            <DatasetPanel />
            <More id="heat.load">
              <LeanOverlayPanel />
            </More>
          </TaskGroup>
          <TaskGroup task="explore">
            {mode === 'heat-lines' && <LinePanel />}
            {mode === 'team' ? (
              <>
                <OverlayPanel />
                <TeamPanel />
              </>
            ) : (
              <HeatPanel />
            )}
            <TeamsList />
            <EntityPanel />
            <FilterPanel />
            <SlicePanel />
          </TaskGroup>
          <TaskGroup task="compare">
            <SplitPanel />
            <VolumePanel />
            <InsightsPanel />
            <MassPanel />
            <MeasurePanel />
          </TaskGroup>
          <TaskGroup task="present">
            <ViewsPanel />
            <NotesPanel />
            <PathPanel />
            <CameraPanel />
            <More id="heat.present">
              <PerfPanel />
            </More>
          </TaskGroup>
          </>
          )}
        </aside>

        <div
          className="stage"
          onDragOver={(e) => {
            if (raceTab || matchTab || vehicleTab) e.preventDefault();
          }}
          onDrop={(e) => {
            if (matchTab || vehicleTab) {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              void useMatchStore.getState().load(files);
              // The battles' capture zones over time, dropped with them.
              void loadObjectiveFiles(files);
              return;
            }
            if (!raceTab) return;
            e.preventDefault();
            // Folders too: the car's name is in the lap library's folders.
            void filesFromDataTransfer(e.dataTransfer).then((files) =>
              loadLapFiles(files, () => engine?.frameDataset(true)),
            );
          }}
        >
          <canvas
            ref={canvasRef}
            tabIndex={0}
            onDoubleClick={() => {
              if (planTab) usePlanStore.getState().finish();
            }}
          />
          {fatal ? (
            <div className="fatal">
              <strong>{t('app.fatal')}</strong>
              <pre>{fatal}</pre>
            </div>
          ) : (
            <>
              {vehicleTab ? <VehicleOverlay /> : planTab ? (
                <>
                  <ObjectiveLabels />
                  <BoardLabels />
                </>
              ) : raceTab ? (
                <>
                  <RaceLabels />
                  <RaceWheelLabels />
                  <RaceHud />
                  <RaceEmpty />
                </>
              ) : (
                <>
              <ObjectiveLabels />
              <HeatLabels />
              <ReplayOverlay />
              <CasterCinema />
              <ReplayExtras />
              <HitMarkTip />
              <VolumeSigns />
              <StatsOverlay />
              <SpeedOverlay />
              <InspectHud />
              <NotesLayer />
              {!dataset && (
                <div className="empty-state">
                  <h2>{t('app.empty.heat.title')}</h2>
                  <div>{t('app.empty.heat.hint')}</div>
                </div>
              )}
                </>
              )}
              <HelpPanel />
              <WorldOverlay />
              <WorldCredits />
              <QuickBar />
              <ToastHost />
              <div className="help">
                <Rich text={t('shell.hint')} />
              </div>
            </>
          )}
        </div>

        <CommandPalette />
        <ShortcutSheet />
        <ConfirmHost />
        <div className="timeline-bar">{vehicleTab ? null : planTab ? <BoardBar /> : raceTab ? <RaceBar /> : <Timeline />}</div>
      </div>
    </EngineContext.Provider>
  );
}

/**
 * The camera readout and the pick card, top left of the view: the corner the
 * other overlays leave free, and stacked so the card never covers the readout.
 */
function InspectHud() {
  const showCamera = useInspectStore((s) => s.showCamera);
  return (
    <div className="inspect-hud">
      {showCamera && <CameraReadout />}
      <UnitCard />
      <PickCard />
      <BreakdownWindow />
      <VersusWindow />
      <MassWindow />
    </div>
  );
}

function RaceEmpty() {
  const laps = useRaceStore((s) => s.laps.length);
  if (laps > 0) return null;
  return (
    <div className="empty-state">
      <h2>{t('app.empty.race.title')}</h2>
      <div>{t('app.empty.race.hint')}</div>
    </div>
  );
}
