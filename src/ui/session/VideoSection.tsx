/**
 * Video mode in the session panel (Stage 8): the host draws this member's view
 * and streams it, for a device that cannot draw the data itself. Chosen by
 * itself (unless switched off here) when the device looks too weak for the
 * session's data - no WebGPU or WebGL2, the data far beyond its memory, or its
 * own frames too slow for a while - or by hand with the button.
 */

import { useEffect, useRef } from 'react';
import { t } from '../../i18n';
import type { Engine } from '../../render/engine';
import { useSessionStore } from '../../session/store';
import { deviceNeedsVideo, setVideoAutoPref, useVideoStore, video, type AutoWhy } from '../../session/video';
import { useEngine } from '../EngineContext';

/** Frames slower than this (ms) for `SLOW_CHECKS` checks a second apart: too slow to draw it here. */
const SLOW_MS = 50;
const SLOW_CHECKS = 6;

/** Starts video mode by itself once per session when the device needs it and the host offers it. */
export function useVideoAuto(engine: Engine | null): void {
  const state = useSessionStore((s) => s.state);
  const role = useSessionStore((s) => s.role);
  const size = useSessionStore((s) => s.info?.dataset?.size ?? 0);
  const autoPref = useVideoStore((s) => s.autoPref);
  const tried = useRef(false);
  useEffect(() => video.setEngine(engine), [engine]);
  useEffect(() => {
    if (state !== 'joined') tried.current = false;
  }, [state]);
  useEffect(() => {
    if (state !== 'joined' || !engine || role === 'host' || !autoPref) return;
    const go = (why: AutoWhy) => {
      if (tried.current) return;
      tried.current = true;
      void video.info().then((i) => {
        if (i?.available && i.lan && useVideoStore.getState().state === 'off') void video.start(engine, why);
      });
    };
    const need = deviceNeedsVideo(size);
    if (need.need && need.why) {
      go(need.why);
      return;
    }
    // Its own frames: slow for a few seconds in a row while it draws data.
    let slow = 0;
    const timer = window.setInterval(() => {
      if (tried.current || useVideoStore.getState().state !== 'off') return;
      const l = engine.live;
      const drawing = l.residentRows > 0 || l.splats > 0;
      slow = drawing && l.frameMs > SLOW_MS ? slow + 1 : 0;
      if (slow >= SLOW_CHECKS) go('slow');
    }, 1000);
    return () => window.clearInterval(timer);
  }, [engine, state, role, size, autoPref]);
}

export function VideoSection() {
  const engine = useEngine();
  const role = useSessionStore((s) => s.role);
  const st = useVideoStore();
  useEffect(() => {
    if (st.available === null) void video.info();
  }, [st.available]);
  if (role === 'host' || !engine) return null;
  const on = st.state === 'on' || st.state === 'starting' || st.state === 'waiting';
  const s = st.stats;
  const blocked = st.available === false || st.lan === false;
  return (
    <section className="session-sec" aria-label={t('session.video.title')}>
      <h3>{t('session.video.title')}</h3>
      <p className="session-hint">{t('session.video.hint')}</p>
      <div className="session-actions">
        {on ? (
          <button type="button" onClick={() => video.stop()}>
            {t('session.video.stop')}
          </button>
        ) : (
          <button type="button" className="primary" disabled={blocked} onClick={() => void video.start(engine)}>
            {t('session.video.start')}
          </button>
        )}
      </div>
      <label className="session-check">
        <input type="checkbox" checked={st.autoPref} onChange={(e) => setVideoAutoPref(e.target.checked)} />
        {t('session.video.autoPref')}
      </label>
      {!on && st.lan === false && <p className="session-hint">{t('session.video.why.lan')}</p>}
      {!on && st.lan !== false && st.available === false && <p className="session-hint">{t('session.video.unavailable')}</p>}
      {st.state === 'starting' && <p className="session-hint">{t('session.video.starting')}</p>}
      {st.state === 'waiting' && (
        <p className="session-hint" role="status" title={st.detail || undefined}>
          {t('session.video.waiting')}
        </p>
      )}
      {st.shared && st.state === 'on' && <p className="session-hint">{t('session.video.shared')}</p>}
      {st.state === 'failed' && (
        <div className="session-error" role="alert" title={st.detail || undefined}>
          {t('session.video.failed', { why: t(`session.video.why.${st.reason || 'start'}`) })}
        </div>
      )}
      {st.auto && on && <p className="session-hint">{t(`session.video.auto.${st.auto}`)}</p>}
      {s && st.state === 'on' && (
        <p className="session-hint session-video-stats" title={`${s.codec.toUpperCase()} · ${s.hardware ? t('session.video.hardware') : t('session.video.software')} · ${s.encoder}`}>
          {t('session.video.stats', { w: s.width, h: s.height, fps: s.fps, kbps: s.kbps, lat: Math.round(s.latencyP50) })}
        </p>
      )}
    </section>
  );
}
