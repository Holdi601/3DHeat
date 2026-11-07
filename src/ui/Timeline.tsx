import { useEffect, useRef } from 'react';
import { playbackRange } from '../data/sessions';
import { useStore } from '../state/store';
import type { TimelineMode, WindowMode } from '../state/store';
import { useAnimationFrame, useEngine } from './EngineContext';
import { num, t } from '../i18n';

const SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16, 60, 300, 1800];

const windowModes = (): Array<{ value: WindowMode; label: string; title: string }> => [
  {
    value: 'cumulative',
    label: t('heat.timeline.window.cumulative'),
    title: t('heat.timeline.window.cumulativeTitle'),
  },
  {
    value: 'fixed',
    label: t('heat.timeline.window.fixed'),
    title: t('heat.timeline.window.fixedTitle'),
  },
  {
    value: 'lifetime',
    label: t('heat.timeline.window.lifetime'),
    title: t('heat.timeline.window.lifetimeTitle'),
  },
];

/** A playback speed as the menu shows it: with as many decimals as it has. */
function speedLabel(s: number): string {
  const digits = Number.isInteger(s) ? 0 : Number.isInteger(s * 10) ? 1 : 2;
  return t('heat.timeline.speedOption', { speed: num(s, digits) });
}

/**
 * Timeline controls.
 *
 * The mode toggle is the important part: `All` ignores the playhead completely,
 * which answers "where does this happen" over the whole dataset, while `Play`
 * answers "when". They are different questions, so scrubbing to the end is not a
 * substitute for the first.
 */
export function Timeline() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const timeline = useStore((s) => s.timeline);
  const seek = useStore((s) => s.seek);
  const setPlaying = useStore((s) => s.setPlaying);
  const patchTimeline = useStore((s) => s.patchTimeline);

  const mode = useStore((s) => s.mode);
  const session = useStore((s) => s.team.session);

  const slider = useRef<HTMLInputElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);

  // Release the drag from the window, not the input. A pointer released outside
  // the slider never fires the element's own pointerup, which would leave the
  // scrubber stuck detached from playback for the rest of the session.
  useEffect(() => {
    const release = () => {
      dragging.current = false;
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, []);

  // The selected session's span in team mode, so the scrubber covers the match
  // being watched rather than the whole file. See `playbackRange`.
  const range = dataset ? playbackRange(dataset, mode, session) : [0, 1];
  const span = Math.max(1e-6, range[1] - range[0]);
  const hasTime = !!dataset?.time;
  const isAll = timeline.mode === 'all';
  const lines = mode === 'heat-lines';

  // Mirror the engine's playhead into the scrubber without React state, so
  // playback stays smooth no matter what the panels are doing.
  useAnimationFrame(() => {
    if (!engine || !dataset) return;
    const head = engine.live.playhead;
    if (slider.current && !dragging.current) slider.current.value = String(head);
    if (clock.current) {
      const txt = isAll
        ? t('heat.timeline.allClock', { span: formatClock(span) })
        : `${formatClock(head - range[0])} / ${formatClock(span)}${
            dataset.epochMs
              ? `   ${new Date(dataset.epochMs + head * 1000).toISOString().slice(11, 19)}Z`
              : ''
          }`;
      if (clock.current.textContent !== txt) clock.current.textContent = txt;
    }
  }, !!engine && !!dataset);

  const setMode = (mode: TimelineMode) => {
    patchTimeline({ mode });
    if (mode === 'all') setPlaying(false);
  };

  return (
    <>
      <div className="scrub">
        <input
          // Remount on dataset change so the uncontrolled value picks up the
          // new range instead of keeping the old dataset's position.
          key={dataset?.id ?? 'none'}
          ref={slider}
          type="range"
          min={range[0]}
          max={range[1]}
          step={span / 20000}
          defaultValue={range[0]}
          disabled={!hasTime || isAll}
          onPointerDown={() => {
            dragging.current = true;
          }}
          onChange={(e) => seek(Number(e.target.value))}
        />
      </div>
      <div className="tl-controls">
        <div className="seg" style={{ flex: '0 0 auto' }}>
          <button
            className={isAll ? 'on' : ''}
            title={t('heat.timeline.allTitle')}
            onClick={() => setMode('all')}
          >
            {t('heat.timeline.all')}
          </button>
          <button
            className={!isAll ? 'on' : ''}
            disabled={!hasTime}
            title={t('heat.timeline.playTitle')}
            onClick={() => setMode('play')}
          >
            {t('heat.timeline.play')}
          </button>
        </div>

        {!isAll && (
          <>
            <button
              className="play"
              disabled={!hasTime}
              title={t(timeline.playing ? 'heat.timeline.pauseKey' : 'heat.timeline.playKey', { key: 'K' })}
              onClick={() => setPlaying(!timeline.playing)}
            >
              {timeline.playing ? '❚❚' : '▶'}
            </button>
            <button disabled={!hasTime} title={t('heat.timeline.toStart')} onClick={() => seek(range[0])}>
              ⏮
            </button>
          </>
        )}

        <span className="clock" ref={clock}>
          —
        </span>

        {!isAll && (
          <>
            <label>
              {t('heat.timeline.speed')}
              <select
                value={timeline.speed}
                onChange={(e) => patchTimeline({ speed: Number(e.target.value) })}
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {speedLabel(s)}
                  </option>
                ))}
              </select>
            </label>

            <label title={t('heat.timeline.historyTitle')}>
              {t('heat.timeline.history')}
              <select
                value={timeline.window}
                onChange={(e) => patchTimeline({ window: e.target.value as WindowMode })}
              >
                {windowModes().map((w) => (
                  <option key={w.value} value={w.value} title={w.title}>
                    {w.label}
                  </option>
                ))}
              </select>
            </label>

            {/*
              Line heat draws each route's tail over the span in either history
              but the cumulative one - it has no per-row lifetime - so the span
              is shown in both there, and the lifetime's own controls are not.
            */}
            {(timeline.window === 'fixed' || (lines && timeline.window === 'lifetime')) && (
              <label title={t('heat.timeline.spanTitle')}>
                {t('heat.timeline.span')}
                <input
                  className="narrow"
                  type="number"
                  min={0.01}
                  step={1}
                  value={timeline.windowSeconds}
                  onChange={(e) =>
                    patchTimeline({ windowSeconds: Math.max(0.01, Number(e.target.value) || 1) })
                  }
                />
                {t('heat.timeline.seconds')}
              </label>
            )}

            {timeline.window === 'lifetime' && !lines && (
              <>
                <label title={t('heat.timeline.fallbackLifeTitle')}>
                  {t('heat.timeline.fallbackLife')}
                  <input
                    className="narrow"
                    type="number"
                    min={0}
                    step={1}
                    value={timeline.defaultLifetime}
                    onChange={(e) =>
                      patchTimeline({ defaultLifetime: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                  {t('heat.timeline.seconds')}
                </label>
                <label title={t('heat.timeline.fadeTitle')}>
                  {t('heat.timeline.fade')}
                  <input
                    className="narrow"
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={timeline.fadeOut}
                    onChange={(e) =>
                      patchTimeline({
                        fadeOut: Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                      })
                    }
                  />
                </label>
              </>
            )}

            <label>
              <input
                type="checkbox"
                checked={timeline.loop}
                onChange={(e) => patchTimeline({ loop: e.target.checked })}
              />
              {t('heat.timeline.loop')}
            </label>
          </>
        )}

        <span className="spacer" />
        <span className="progress-note">
          {dataset
            ? dataset.name
            : t('heat.timeline.noDataset', { formats: 'parquet/csv' })}
        </span>
      </div>
    </>
  );
}

function formatClock(seconds: number): string {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (v: number) => String(Math.floor(v)).padStart(2, '0');
  // Tenths of a second behind the language's decimal mark.
  return h > 0
    ? `${h}:${pad(m)}:${pad(sec)}`
    : `${pad(m)}:${num(Math.floor(sec * 10) / 10, 1).padStart(4, '0')}`;
}
