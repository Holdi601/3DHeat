import { createContext, useContext, useEffect, useRef } from 'react';
import type { Engine } from '../render/engine';

export const EngineContext = createContext<Engine | null>(null);

export function useEngine(): Engine | null {
  return useContext(EngineContext);
}

/**
 * Runs `cb` on the browser's frame clock so it can write engine state straight
 * to the DOM.
 *
 * The playhead and the perf counters change every frame; routing them through
 * React state would re-render the panels 60 times a second just to move a few
 * numbers, and that cost would land on the same thread as the render loop.
 */
export function useAnimationFrame(cb: () => void, enabled = true): void {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!enabled) return;
    let id = requestAnimationFrame(function tick() {
      id = requestAnimationFrame(tick);
      ref.current();
    });
    return () => cancelAnimationFrame(id);
  }, [enabled]);
}
