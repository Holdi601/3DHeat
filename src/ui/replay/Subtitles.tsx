import { useMemo, useRef } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { subtitlesAt, subtitlesOf } from './subtitleRows';
import './replay.css';

/** The recording's messages, comments and chat at the bottom of the view as they are said, as Tacview shows comments. */
export function Subtitles() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const show = useReplayStore((s) => s.subtitles);
  const list = useMemo(() => (dataset ? subtitlesOf(dataset) : []), [dataset]);
  const box = useRef<HTMLDivElement>(null);
  const on = !!engine && show && list.length > 0;

  useAnimationFrame(() => {
    if (!engine || !box.current) return;
    const lines = subtitlesAt(list, engine.live.playhead, useStore.getState().team.session);
    const html = lines.map((s) => `<div>${s.who ? `<b>${esc(s.who)}:</b> ` : ''}${esc(s.text)}</div>`).join('');
    if (box.current.innerHTML !== html) box.current.innerHTML = html;
    box.current.style.display = lines.length ? '' : 'none';
  }, on);

  if (!on) return null;
  return <div className="replay-subtitles" ref={box} style={{ display: 'none' }} />;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'));
}
