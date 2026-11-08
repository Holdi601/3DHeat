import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { Check, Section } from '../controls';
import { useStore } from '../../state/store';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { clock, usePlayhead } from './hooks';
import { num, t } from '../../i18n';
import './replay.css';

/**
 * An audio or video file played with the replay (Tacview's synchronised
 * audio and video): a cockpit video, a radio recording, a stream. It starts
 * at `offset` seconds of the replay's time, plays, pauses, seeks and changes
 * speed with the timeline, and shows (a video) in a panel of its own over the
 * view, or in the browser's picture-in-picture window. The file stays in this
 * browser; nothing is uploaded or kept after the page closes.
 */
interface MediaState {
  url: string | null;
  name: string;
  video: boolean;
  /** The replay's time (dataset seconds) at the media's start. */
  offset: number;
  show: boolean;
  volume: number;
  /** The media's length, seconds, once known. */
  duration: number;
  open: (file: File, offset: number) => void;
  close: () => void;
  patch: (p: Partial<Pick<MediaState, 'offset' | 'show' | 'volume' | 'duration'>>) => void;
}

export const useMedia = create<MediaState>((set, get) => ({
  url: null,
  name: '',
  video: false,
  offset: 0,
  show: true,
  volume: 1,
  duration: NaN,
  open: (file, offset) => {
    const was = get().url;
    if (was) URL.revokeObjectURL(was);
    set({ url: URL.createObjectURL(file), name: file.name, video: file.type.startsWith('video') || /\.(mp4|webm|mkv|mov|m4v|ogv)$/i.test(file.name), offset, duration: NaN, show: true });
  },
  close: () => {
    const was = get().url;
    if (was) URL.revokeObjectURL(was);
    set({ url: null, name: '' });
  },
  patch: (p) => set(p),
}));

/** Where the media should be at a replay time: its own seconds, or null outside it. */
export function mediaTimeAt(playhead: number, offset: number, duration: number): number | null {
  const m = playhead - offset;
  if (m < 0 || (Number.isFinite(duration) && m > duration)) return null;
  return m;
}

/** The sidebar section: open a file, line it up, show or hide it. */
export function MediaPanel() {
  const dataset = useStore((s) => s.dataset);
  const m = useMedia();
  const now = usePlayhead(500);
  const input = useRef<HTMLInputElement>(null);
  if (!dataset || !dataset.time) return null;
  const start = dataset.timeRange[0];
  return (
    <Section title={t('replay.media.title')}>
      <div className="hint">{t('replay.media.hint')}</div>
      <input
        ref={input}
        type="file"
        accept="audio/*,video/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) m.open(f, now);
          e.target.value = '';
        }}
      />
      <div className="row">
        <button onClick={() => input.current?.click()}>{m.url ? t('replay.media.replace') : t('replay.media.open')}</button>
        {m.url && <button onClick={() => m.close()}>{t('replay.media.close')}</button>}
      </div>
      {m.url && (
        <>
          <div className="hint mono">{m.name}</div>
          <div className="row">
            <span>{t('replay.media.startsAt')}</span>
            <span className="mono">{clock(m.offset - start)}</span>
            <input
              className="narrow"
              type="number"
              step={0.1}
              value={Number((m.offset - start).toFixed(2))}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) m.patch({ offset: start + v });
              }}
              title={t('replay.media.offsetTitle')}
            />
          </div>
          <div className="row">
            <button className="small" onClick={() => m.patch({ offset: now })} title={t('replay.media.startHereTitle')}>
              {t('replay.media.startHere')}
            </button>
            <button className="small" onClick={() => m.patch({ offset: m.offset - 0.1 })}>
              −0.1 s
            </button>
            <button className="small" onClick={() => m.patch({ offset: m.offset + 0.1 })}>
              +0.1 s
            </button>
          </div>
          {Number.isFinite(m.duration) && <div className="hint">{t('replay.media.length', { v: clock(m.duration), at: clock(m.offset - start) })}</div>}
          {m.video && <Check label={t('replay.media.show')} checked={m.show} onChange={(v) => m.patch({ show: v })} />}
          <label className="row">
            {t('replay.media.volume')}
            <input type="range" min={0} max={1} step={0.05} value={m.volume} onChange={(e) => m.patch({ volume: Number(e.target.value) })} />
            <span className="dim">{num(m.volume * 100, 0)}%</span>
          </label>
        </>
      )}
    </Section>
  );
}

/** The media element, kept in step with the replay each frame; a video in its panel over the view. */
export function MediaPlayer() {
  const engine = useEngine();
  const m = useMedia();
  const el = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (el.current) el.current.volume = m.volume;
  }, [m.volume, m.url]);

  useAnimationFrame(() => {
    const v = el.current;
    if (!engine || !v || v.readyState < 1) return;
    const s = useStore.getState();
    const st = useMedia.getState();
    const want = mediaTimeAt(engine.live.playhead, st.offset, v.duration);
    // Slower than the browser plays a video, it is held and stepped to the playhead like a scrub.
    const playing = s.timeline.playing && !s.timeline.reverse && s.timeline.mode === 'play' && s.timeline.speed >= 0.0625;
    if (want === null) {
      if (!v.paused) v.pause();
      return;
    }
    const rate = Math.max(0.0625, Math.min(16, s.timeline.speed));
    if (v.playbackRate !== rate) v.playbackRate = rate;
    // Past 4x the sound is noise: muted, the picture still follows.
    v.muted = s.timeline.speed > 4;
    const drift = Math.abs(v.currentTime - want);
    if (playing) {
      if (v.paused) void v.play().catch(() => undefined);
      if (!v.seeking && drift > 0.3 * Math.max(1, rate)) v.currentTime = want;
    } else {
      if (!v.paused) v.pause();
      if (!v.seeking && drift > 0.04) v.currentTime = want;
    }
  }, !!engine && !!m.url);

  if (!m.url) return null;
  const hidden = !m.video || !m.show;
  return (
    <div className="media-pip" style={hidden ? { display: 'none' } : undefined} onPointerDown={(e) => e.stopPropagation()}>
      <div className="media-head">
        <span className="dim">{m.name}</span>
        <span className="spacer" />
        {m.video && 'pictureInPictureEnabled' in document && (
          <button className="small" onClick={() => void el.current?.requestPictureInPicture().catch(() => undefined)} title={t('replay.media.popOutTitle')}>
            ⧉
          </button>
        )}
        <button className="small" onClick={() => m.patch({ show: false })} title={t('replay.media.hide')}>
          ×
        </button>
      </div>
      <video ref={el} src={m.url} playsInline preload="auto" onLoadedMetadata={(e) => m.patch({ duration: (e.target as HTMLVideoElement).duration })} />
    </div>
  );
}
