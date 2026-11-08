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
import { HelpButton, HelpPanel } from './ui/help/HelpPanel';
import { RaceWheelLabels } from './ui/race/RaceHelp';
import { RaceHud } from './ui/race/RaceHud';
import { RaceLabels } from './ui/race/RaceLabels';
import { RacePanel } from './ui/race/RacePanel';
import './ui/race/race.css';
import { useMatchStore } from './state/matchStore';
import { MatchPanel } from './ui/match/MatchPanel';
import { BoardBar, TacticsPanel } from './ui/tactics/TacticsPanel';
import { BoardLabels } from './ui/tactics/BoardLabels';
import { ReplayOverlay } from './ui/replay/ReplayOverlay';
import { ReplayExtras } from './ui/replay/ReplayExtras';
import { ReplayPanel } from './ui/replay/ReplayPanel';
import { UnitCard } from './ui/replay/UnitCard';
import { OverlayPanel, useFigureOverlay } from './ui/replay/FigureOverlay';
import { LeanOverlayPanel } from './ui/overlay/LeanOverlayPanel';
import { GameOverview, MatchPicker } from './ui/match/MatchPicker';
import { matchesAreSessions } from './match/matches';
import { useReplayStore } from './state/replayStore';
import { usePlanStore } from './state/planStore';
import './ui/match/match.css';
import type { ViewMode } from './state/types';
import { Rich, Segmented } from './ui/controls';
import { EngineContext } from './ui/EngineContext';
import { LanguagePicker } from './ui/LanguagePicker';
import { UnitsPicker } from './ui/UnitsPicker';
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
import { CameraReadout, copyCameraPose } from './ui/CameraReadout';
import { PickCard } from './ui/PickCard';
import { useInspectStore } from './state/inspectStore';
import { Timeline } from './ui/Timeline';
import { LinePanel } from './ui/panels/LinePanel';
import { UpdateBanner } from './ui/UpdateBanner';
import { VehiclePanel } from './ui/vehicle/VehiclePanel';
import { VehicleOverlay } from './ui/vehicle/VehicleOverlay';

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
  const setTab = useRaceStore((s) => s.setTab);
  const raceTab = tab === 'race';
  const matchTab = tab === 'match';
  const planTab = tab === 'plan';
  const vehicleTab = tab === 'vehicle';
  const raceCharts = useRaceStore((s) => s.view.charts);
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
  useEffect(() => {
    if (mode !== 'team') lastHeat.current = mode;
    if (useRaceStore.getState().tab === 'heat') heatTabMode.current = mode;
  }, [mode]);
  useEffect(() => {
    if (tab === 'match') setMode('team');
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
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLSelectElement) return;
      // By the character: which key makes a ? depends on the keyboard's language.
      if (ev.key === '?' || ev.code === 'F1') {
        ev.preventDefault();
        useHelpStore.getState().toggle();
        return;
      }
      const race = useRaceStore.getState();
      if (race.tab === 'plan') {
        const board = usePlanStore.getState();
        const ctrl = ev.ctrlKey || ev.metaKey;
        if (ctrl && ev.code === 'KeyZ') {
          ev.preventDefault();
          if (ev.shiftKey) board.redo();
          else board.undo();
          return;
        }
        if (ctrl && ev.code === 'KeyY') {
          ev.preventDefault();
          board.redo();
          return;
        }
        if (ev.code === 'Enter') {
          board.finish();
          return;
        }
        if (ev.code === 'Escape') {
          board.cancel();
          return;
        }
        if ((ev.code === 'Delete' || ev.code === 'Backspace') && board.selected) {
          ev.preventDefault();
          board.remove(board.selected);
          return;
        }
        if (ev.code === 'KeyR' && !ctrl) {
          board.rotateSelected(ev.shiftKey ? -Math.PI / 12 : Math.PI / 12);
          return;
        }
        if (ev.code === 'KeyM' && !ctrl && board.selected) {
          board.startMove();
          return;
        }
        if (ev.code === 'KeyK') {
          ev.preventDefault();
          board.play(!board.playing);
          return;
        }
        if (ev.code.startsWith('Digit')) return;
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
      } else if (ev.code === 'KeyF') {
        engine?.frameDataset();
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
        useReplayStore.getState().stopFollow();
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
      <div className={`app${raceTab ? ' race' : ''}${matchTab ? ' match' : ''}${vehicleTab ? ' vehicle' : ''}${raceTab && !raceCharts ? ' no-charts' : ''}`}>
        <aside className="sidebar">
          <div className="brand">
            <h1>3DHeat</h1>
            <span className="sub">{t('app.brand.sub')}</span>
            <HelpButton />
            <UnitsPicker />
            <LanguagePicker />
          </div>
          <UpdateBanner />

          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'heat'} className={tab === 'heat' ? 'on' : ''} onClick={() => setTab('heat')}>
              {t('app.tab.heat')}
            </button>
            <button role="tab" aria-selected={raceTab} className={raceTab ? 'on' : ''} onClick={() => setTab('race')}>
              {t('app.tab.race')}
            </button>
            <button
              role="tab"
              aria-selected={matchTab}
              className={matchTab ? 'on' : ''}
              onClick={() => setTab('match')}
              title={t('app.tab.matchTitle')}
            >
              {t('app.tab.match')}
            </button>
            <button role="tab" aria-selected={planTab} className={planTab ? 'on' : ''} onClick={() => setTab('plan')} title={t('app.tab.planTitle')}>
              {t('app.tab.plan')}
            </button>
            <button role="tab" aria-selected={vehicleTab} className={vehicleTab ? 'on' : ''} onClick={() => setTab('vehicle')} title={t('vehicle.tab.title')}>
              {t('vehicle.tab.label')}
            </button>
          </div>

          {vehicleTab ? (
            <>
              <div style={{ padding: '12px 16px 0' }}>
                <SoftwareRenderingWarning />
              </div>
              <VehiclePanel />
              <SourcePanel />
              <CameraPanel />
            </>
          ) : planTab ? (
            <>
              <TacticsPanel />
              <LevelPanel />
              <CameraPanel />
            </>
          ) : raceTab ? (
            <>
              <RacePanel />
              <LevelPanel />
              <CameraPanel />
            </>
          ) : matchTab ? (
            <>
              <div style={{ padding: '12px 16px 0' }}>
                <SoftwareRenderingWarning />
                <Segmented<MatchView>
                  value={matchView}
                  options={[
                    { value: 'replay', label: t('app.matchView.replay'), title: t('app.matchView.replayTitle') },
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
              {/* The level first: it is loaded before the data, then the rest is done on top of both. */}
              <LevelPanel />
              {!dataset && <SourcePanel />}
              <MatchPicker />
              <GameOverview />
              {matchView === 'replay' ? (
                <>
                  <ReplayPanel />
                  <TeamPanel />
                </>
              ) : (
                <HeatPanel />
              )}
              <MatchPanel />
              {dataset && <SourcePanel />}
              <FilterPanel />
              <VolumePanel />
              <CameraPanel />
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

          {/* The level first: it is loaded before the data, then the rest is done on top of both. */}
          <LevelPanel />
          <SourcePanel />
          <LeanOverlayPanel />
          <DatasetPanel />
          {mode === 'heat-lines' && <LinePanel />}
          {mode === 'team' ? (
            <>
              <OverlayPanel />
              <TeamPanel />
            </>
          ) : (
            <HeatPanel />
          )}
          <SplitPanel />
          <TeamsList />
          <EntityPanel />
          <FilterPanel />
          <SlicePanel />
          <VolumePanel />
          <MeasurePanel />
          <PathPanel />
          <PerfPanel />
          <CameraPanel />
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
              void useMatchStore.getState().load(Array.from(e.dataTransfer.files));
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
              {vehicleTab ? <VehicleOverlay /> : planTab ? <BoardLabels /> : raceTab ? (
                <>
                  <RaceLabels />
                  <RaceWheelLabels />
                  <RaceHud />
                  <RaceEmpty />
                </>
              ) : (
                <>
              <ReplayOverlay />
              <ReplayExtras />
              <StatsOverlay />
              <SpeedOverlay />
              <InspectHud />
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
              <div className="help">
                <Rich text={t('app.help.move')} />
                <br />
                <Rich text={t('app.help.keys')} />
              </div>
            </>
          )}
        </div>

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
