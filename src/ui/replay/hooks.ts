import { useEffect, useState } from 'react';
import { useEngine } from '../EngineContext';

/** The playhead, read every `ms`: for lists that say what is live without re-rendering at frame rate. */
export function usePlayhead(ms = 500): number {
  const engine = useEngine();
  const [now, setNow] = useState(() => engine?.live.playhead ?? 0);
  useEffect(() => {
    if (!engine) return;
    const id = setInterval(() => {
      const p = engine.live.playhead;
      setNow((was) => (was === p ? was : p));
    }, ms);
    return () => clearInterval(id);
  }, [engine, ms]);
  return now;
}

/** mm:ss.s from `start`. */
export function clock(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
}
