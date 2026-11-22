/**
 * A preferred game for unit models: where a unit's own game has a model and
 * the preferred game's pack has one of the same vehicle (its real name, as
 * `vehiclenames.ts` matches names across games, and of the same kind: an
 * aircraft's for an aircraft), the preferred game's model is drawn. An IL-2 Bf
 * 109 K-4 is then drawn with the DCS model, or a DCS Ju 88 A-4 with IL-2's.
 *
 * The choice is a cookie (`MODEL_PREFER_COOKIE`, the preferred pack's game), so
 * every thread's request for the packs' index carries it; the dev and preview
 * servers swap the models (`vite.config.ts`). This module imports only name
 * matching, so the servers' config can take it.
 */

import { packSide, type ModelPackUnit } from "./modelpack.ts";
import { strongKeys } from "./vehiclenames.ts";

export const MODEL_PREFER_COOKIE = "heat3d_model_prefer";

/** The preferred game from a request's `Cookie` header, or null. */
export function preferFromCookie(
  header: string | undefined | null,
): string | null {
  for (const part of String(header ?? "").split(";")) {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (k === MODEL_PREFER_COOKIE && v && /^[a-z0-9_-]{1,32}$/.test(v))
      return v;
  }
  return null;
}

/** Sets the preferred game for this browser ('' for each game's own models). */
export function setModelPreference(game: string): void {
  if (typeof document === "undefined") return;
  const v = /^[a-z0-9_-]{1,32}$/.test(game) ? game : "";
  document.cookie = `${MODEL_PREFER_COOKIE}=${v}; path=/; max-age=${v ? 31536000 : 0}; SameSite=Strict`;
}

/** The preferred game this browser has set, or ''. */
export function modelPreference(): string {
  return typeof document === "undefined"
    ? ""
    : (preferFromCookie(document.cookie) ?? "");
}

type Unit = Pick<ModelPackUnit, "domain" | "type" | "kind" | "name" | "names">;

/**
 * For each unit of another pack whose vehicle the preferred game's pack also has: `<game>|<unit>` -> the preferred
 * pack's unit drawn in its place. Units of the preferred game itself, static objects and units no name meets keep
 * their own models.
 */
export function preferredModels(
  packs: readonly { game: string; units: Record<string, Unit> }[],
  prefer: string | null,
): Map<string, { game: string; unit: string }> {
  const out = new Map<string, { game: string; unit: string }>();
  const own = prefer ? packs.find((p) => p.game === prefer) : undefined;
  if (!own) return out;
  const byKey = new Map<string, { unit: string; side: string }[]>();
  for (const [unit, info] of Object.entries(own.units)) {
    const side = packSide(info);
    if (side === "static" || side === "item" || side === "other") continue;
    for (const n of [info.name, ...(info.names ?? [])]) {
      if (typeof n !== "string" || !n.trim()) continue;
      for (const k of strongKeys(n)) {
        const list = byKey.get(k) ?? [];
        if (!list.some((x) => x.unit === unit)) list.push({ unit, side });
        byKey.set(k, list);
      }
    }
  }
  for (const p of packs) {
    if (p === own) continue;
    for (const [unit, info] of Object.entries(p.units)) {
      const side = packSide(info);
      if (side === "static" || side === "item" || side === "other") continue;
      let hit: string | undefined;
      for (const n of [info.name, ...(info.names ?? [])]) {
        if (typeof n !== "string" || !n.trim()) continue;
        for (const k of strongKeys(n)) {
          hit = byKey.get(k)?.find((x) => x.side === side)?.unit;
          if (hit) break;
        }
        if (hit) break;
      }
      if (hit) out.set(`${p.game}|${unit}`, { game: own.game, unit: hit });
    }
  }
  return out;
}
