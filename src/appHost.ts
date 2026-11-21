/**
 * The native app's own commands (native/crates/app-tauri), when the page runs
 * in the app's window; null in a browser. The window is served from the app's
 * loopback server, so Tauri's internals are the way in (no @tauri-apps/api).
 */

type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

export function appInvoke(): Invoke | null {
  const t = (globalThis as unknown as { __TAURI_INTERNALS__?: { invoke: Invoke } }).__TAURI_INTERNALS__;
  return t ? (cmd, args) => t.invoke(cmd, args) : null;
}

export function inApp(): boolean {
  return appInvoke() !== null;
}

/** The app's update state (`update_status`, native/crates/app-tauri/src/update.rs). */
export interface UpdateStatus {
  current: string;
  settings: { auto: boolean; skip: string | null; checkedRequirements: string | null };
  available: { version: string; notes: string; date: string | null } | null;
  ready: boolean;
  canInstall: boolean;
  phase: 'idle' | 'checking' | 'downloading' | 'ready' | 'installing' | 'failed';
  error: string;
  off: boolean;
  releases: string;
}

/** One system check (`requirements`, native/crates/app-tauri/src/requirements.rs). */
export interface RequirementCheck {
  id: string;
  status: 'ok' | 'warn' | 'missing';
  detail: string;
  fix: string | null;
}

export async function updateStatus(): Promise<UpdateStatus | null> {
  const invoke = appInvoke();
  if (!invoke) return null;
  return ((await invoke('update_status').catch(() => null)) as UpdateStatus | null) ?? null;
}

export async function updateCheck(): Promise<UpdateStatus | null> {
  const invoke = appInvoke();
  if (!invoke) return null;
  return ((await invoke('update_check').catch(() => null)) as UpdateStatus | null) ?? null;
}

/** Download, verify, install and restart (or open the release page where the app cannot replace itself). */
export async function updateNow(): Promise<void> {
  const invoke = appInvoke();
  if (invoke) await invoke('update_now');
}

export async function updateSettings(s: { auto?: boolean; skip?: string; checkedRequirements?: string }): Promise<UpdateStatus | null> {
  const invoke = appInvoke();
  if (!invoke) return null;
  return ((await invoke('update_settings', s).catch(() => null)) as UpdateStatus | null) ?? null;
}

export async function requirements(): Promise<RequirementCheck[]> {
  const invoke = appInvoke();
  if (!invoke) return [];
  return ((await invoke('requirements').catch(() => [])) as RequirementCheck[]) ?? [];
}

export async function openFix(url: string): Promise<void> {
  const invoke = appInvoke();
  if (invoke) await invoke('open_fix', { url }).catch(() => undefined);
}

/**
 * The first lines of release notes, for the notice: Markdown list marks and
 * headings dropped, at most `lines` lines and `chars` characters.
 */
export function notesExcerpt(notes: string, lines = 4, chars = 280): string {
  const kept = notes
    .split(/\r?\n/)
    .map((l) => l.replace(/^#+\s*/, '').replace(/^\s*[-*]\s+/, '').trim())
    .filter((l) => l.length > 0)
    .slice(0, lines)
    .join(' · ');
  return kept.length > chars ? `${kept.slice(0, chars - 1).trimEnd()}…` : kept;
}
