/**
 * The external AI as the user set it up. Off until the user turns it on. The
 * provider, base URL and model are remembered in this browser; the key only
 * when the user asks for that (`remember`), in memory otherwise - gone with
 * the tab. Nothing here is part of a saved view or an export: the store is
 * its own, read by the insights panel alone.
 */

import { create } from 'zustand';
import { PRESETS, type AiConfig, type ProviderKind } from './provider';

const SETTINGS = 'heat3d.ai';
const KEY = 'heat3d.ai.key';

export interface AiSettings {
  enabled: boolean;
  preset: string;
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  key: string;
  /** Keep the key in this browser's storage. */
  remember: boolean;
  /** Send player names; off sends them as P1, P2... */
  names: boolean;
  /** The models the endpoint listed, for the picker. */
  models: string[];
  set: (p: Partial<Omit<AiSettings, 'set'>>) => void;
}

function load(): Partial<AiSettings> {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS) ?? '{}') as Partial<AiSettings>;
    const key = localStorage.getItem(KEY);
    return { ...s, ...(key ? { key, remember: true } : {}) };
  } catch {
    return {};
  }
}

function save(s: AiSettings): void {
  try {
    const { enabled, preset, kind, baseUrl, model, names } = s;
    localStorage.setItem(SETTINGS, JSON.stringify({ enabled, preset, kind, baseUrl, model, names }));
    if (s.remember && s.key) localStorage.setItem(KEY, s.key);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage off: the settings last as long as the tab */
  }
}

const first = PRESETS[0];

export const useAi = create<AiSettings>((set, get) => ({
  enabled: false,
  preset: first.id,
  kind: first.kind,
  baseUrl: first.baseUrl,
  model: first.model,
  key: '',
  remember: false,
  names: false,
  models: [],
  ...load(),
  set: (p) => {
    set(p);
    save(get());
  },
}));

export function aiConfig(s: AiSettings = useAi.getState()): AiConfig {
  return { kind: s.kind, baseUrl: s.baseUrl, model: s.model, key: s.key };
}
