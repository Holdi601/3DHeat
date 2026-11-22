/**
 * The mission files opened in this session, kept by name so a plan made of
 * one can be written back into it (`dcsWrite.ts`). Held in memory only: a
 * mission file can be large, and a plan saved to disk keeps which file it
 * came from (`Plan.mission.source`), not the file. After a reload the file
 * is picked again.
 */

const files = new Map<string, Uint8Array>();
/** At most this many files are kept; the oldest go first. */
const KEEP = 4;

export function keepMissionFile(name: string, bytes: Uint8Array): void {
  files.delete(name);
  files.set(name, bytes);
  while (files.size > KEEP) files.delete(files.keys().next().value as string);
}

/** The file of that name opened in this session, or null. */
export function missionFile(name: string): Uint8Array | null {
  return files.get(name) ?? null;
}
