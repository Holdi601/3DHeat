/**
 * One external-model answer per slot (the debrief, the caster's lines):
 * streamed text, cancel, and the failure in words. Kept outside the panel, so
 * an answer survives the sidebar being rebuilt - entering the replay does
 * that - and goes on streaming meanwhile.
 */

import { create } from 'zustand';
import type { ChatPrompt } from '../../insights/ai/provider';
import { streamChat } from '../../insights/ai/provider';
import { aiConfig } from '../../insights/ai/settings';
import { aiErrorText } from './AiSettings';

export type AiSlot = 'debrief' | 'cast';

interface Answer {
  text: string;
  running: boolean;
  error: string | null;
  /** What wrote it: model and host. */
  via: { model: string; host: string } | null;
  /** What it was asked about (a report, a match), to drop it when that changes. */
  about: string | null;
}

const EMPTY: Answer = { text: '', running: false, error: null, via: null, about: null };
const useAnswers = create<Record<AiSlot, Answer>>(() => ({ debrief: EMPTY, cast: EMPTY }));
const controllers = new Map<AiSlot, AbortController>();
const patch = (slot: AiSlot, p: Partial<Answer>) => useAnswers.setState((s) => ({ [slot]: { ...s[slot], ...p } }));

export interface AiStream extends Answer {
  start: (prompt: ChatPrompt, about: string) => void;
  cancel: () => void;
  clear: () => void;
}

function start(slot: AiSlot, prompt: ChatPrompt, about: string): void {
  controllers.get(slot)?.abort();
  const c = new AbortController();
  controllers.set(slot, c);
  const cfg = aiConfig();
  let host = '';
  try {
    host = new URL(cfg.baseUrl).host;
  } catch {
    /* said by the request */
  }
  patch(slot, { text: '', error: null, running: true, via: { model: cfg.model, host }, about });
  const live = () => controllers.get(slot) === c;
  // Pieces arrive faster than frames: gathered, and shown once a frame.
  let pending = '';
  let raf = 0;
  const flush = () => {
    raf = 0;
    const p = pending;
    pending = '';
    if (p && live()) patch(slot, { text: useAnswers.getState()[slot].text + p });
  };
  streamChat(
    cfg,
    prompt,
    (piece) => {
      pending += piece;
      if (!raf) raf = requestAnimationFrame(flush);
    },
    c.signal,
  )
    .catch((e) => {
      if (live()) patch(slot, { error: aiErrorText(e) });
    })
    .finally(() => {
      if (raf) cancelAnimationFrame(raf);
      flush();
      if (live()) patch(slot, { running: false });
    });
}

export function clearAnswer(slot: AiSlot): void {
  controllers.get(slot)?.abort();
  controllers.delete(slot);
  useAnswers.setState({ [slot]: EMPTY });
}

export function useAiStream(slot: AiSlot): AiStream {
  const a = useAnswers((s) => s[slot]);
  return {
    ...a,
    start: (prompt, about) => start(slot, prompt, about),
    cancel: () => controllers.get(slot)?.abort(),
    clear: () => clearAnswer(slot),
  };
}
