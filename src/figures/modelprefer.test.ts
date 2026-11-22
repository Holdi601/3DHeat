import { describe, expect, it } from "vitest";
import { preferFromCookie, preferredModels } from "./modelprefer";

type U = { domain: string; type: string; name: string; names?: string[] };
const packs: { game: string; units: Record<string, U> }[] = [
  {
    game: "il2",
    units: {
      bf109k4: {
        domain: "air",
        type: "fighter",
        name: "Bf 109 K-4",
        names: ["Bf-109K-4"],
      },
      spitfiremkixe: {
        domain: "air",
        type: "fighter",
        name: "Spitfire Mk IXe",
        names: ["Spitfire LF Mk IX"],
      },
      yak1s69: { domain: "air", type: "fighter", name: "Yak-1 ser.69" },
      "_pziv-g": { domain: "ground", type: "static", name: "Pz.IV G" },
      "pziv-h": { domain: "ground", type: "medium tank", name: "Pz.IV H" },
    },
  },
  {
    game: "dcs",
    units: {
      "Bf-109K-4": { domain: "air", type: "attack", name: "Bf 109 K-4" },
      SpitfireLFMkIX: {
        domain: "air",
        type: "attack",
        name: "Spitfire LF Mk. IX",
      },
      Pz_IV_H: { domain: "ground", type: "tank", name: "Pz.Kpfw.IV Ausf.H" },
    },
  },
];

describe("preferred game for unit models", () => {
  it("reads only its own cookie, and only a plain game id", () => {
    expect(preferFromCookie("a=1; heat3d_model_prefer=dcs; b=2")).toBe("dcs");
    expect(preferFromCookie("heat3d_model_prefer=../x")).toBeNull();
    expect(preferFromCookie(undefined)).toBeNull();
  });

  it("swaps another game's units of the same vehicle for the preferred game's model", () => {
    const m = preferredModels(packs, "dcs");
    expect(m.get("il2|bf109k4")).toEqual({ game: "dcs", unit: "Bf-109K-4" });
    expect(m.get("il2|spitfiremkixe")).toEqual({
      game: "dcs",
      unit: "SpitfireLFMkIX",
    });
    expect(m.get("il2|pziv-h")).toEqual({ game: "dcs", unit: "Pz_IV_H" });
    // no counterpart, a static object: their own
    expect(m.has("il2|yak1s69")).toBe(false);
    expect(m.has("il2|_pziv-g")).toBe(false);
    // the preferred game's own units are never swapped
    expect([...m.keys()].some((k) => k.startsWith("dcs|"))).toBe(false);
  });

  it("works the other way round and does nothing without a pack of that game", () => {
    expect(preferredModels(packs, "il2").get("dcs|Bf-109K-4")).toEqual({
      game: "il2",
      unit: "bf109k4",
    });
    expect(preferredModels(packs, "warthunder").size).toBe(0);
    expect(preferredModels(packs, null).size).toBe(0);
  });
});
