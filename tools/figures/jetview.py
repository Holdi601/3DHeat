"""
Digitise a jet's three-view drawing into the outlines of an `air-extra.ts` `Fig` (body stations, wing, tailplane
and fin planforms, canopy, wing height and dihedral), using threeview.py's view cleaning and measurements. For
jets: the fin's trailing edge often runs on behind the nozzle, the canopy sits on a long spine, the intakes and
the wing roots blend into the body - so the body is measured where the side view has a body, and the fin is
what stands over the spine line.

USAGE (from the repo root; run Python isolated, keep the drawing in its own folder outside the repo):

    python -I tools/figures/jetview.py DRAWING.png --front X0,Y0,X1,Y1 --top ... --side ... \
        --length 13.98 --span 10.26 --out OUTDIR --name hunter-f1 [--lines] [--canopy F,B] [--fin X] [--end X]

  --lines        the drawing is a line drawing (outlines on white): each view is filled to the silhouette its
                 outline encloses before measuring. Without it the views are solid silhouettes (FM 30-30 style).
  --side-nose left|right|up|down, --top-nose up|down|left|right   which way the nose points in those views.
  --length/--span   published length and span (metres): the side and top views are scaled by the length, the
                 front view by the span. --length-px-skip M: the drawing's length includes M metres (a pitot)
                 that the published length does not.
  --canopy F,B   the canopy's front and back, metres behind the nose (default: found round the crown).
  --fin X        the fin's root leading edge, metres behind the nose (default: found as threeview.py does).
  --end X        where the body ends (the nozzle), metres behind the nose (default: the last column whose bottom
                 lies below the spine line - behind it only the fin's trailing edge).
  --thin S       thin parts narrower than S (share of the view's long side) are opened away (default 0.008).

OUTPUT (OUTDIR/NAME.*): .json (every measurement, metres, figure frame: x forward from the middle of the
length, y out, z up from the nose tip's height), .ts.txt (a Fig's fields to paste), .png (the masks with the
lines drawn over them).

MIT licence, part of 3DHeat. No drawing data lives here.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

sys.path.insert(0, str(Path(__file__).resolve().parent))
import threeview as tv  # noqa: E402


def fill_lines(gray: np.ndarray, close: int = 2) -> np.ndarray:
    """A line drawing's view as the silhouette its outline encloses (black on white)."""
    dark = gray < 150
    d = ndi.binary_dilation(dark, iterations=close)
    lab, _ = ndi.label(~d)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    inside = ~np.isin(lab, list(border))
    inside = ndi.binary_erosion(inside, iterations=close, border_value=0)
    return np.where(inside, 0.0, 255.0).astype(np.float32)


def orient(g: np.ndarray, nose: str, view: str) -> np.ndarray:
    if view == "side":
        return {"left": g, "right": g[:, ::-1], "up": np.rot90(g, 1), "down": np.rot90(g, -1)}[nose]
    return {"up": g, "down": g[::-1, :], "left": np.rot90(g, -1), "right": np.rot90(g, 1)}[nose]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image")
    for v in ("front", "top", "side"):
        ap.add_argument(f"--{v}", required=v != "front")
    ap.add_argument("--length", type=float, required=True)
    ap.add_argument("--span", type=float, required=True)
    ap.add_argument("--side-nose", default="left")
    ap.add_argument("--top-nose", default="up")
    ap.add_argument("--lines", action="store_true")
    ap.add_argument("--canopy")
    ap.add_argument("--fin", type=float)
    ap.add_argument("--end", type=float)
    ap.add_argument("--thin", type=float, default=0.008)
    ap.add_argument("--stations", type=int, default=28)
    ap.add_argument("--tol", type=float, default=0.02)
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", required=True)
    a = ap.parse_args()

    gray = tv.load_gray(a.image)
    L, S = a.length, a.span

    def view(name: str, nose: str, axis: str) -> np.ndarray:
        x0, y0, x1, y1 = tv.box(getattr(a, name))
        g = gray[y0:y1, x0:x1]
        if a.lines:
            g = fill_lines(g)
        g = orient(g, nose, name) if name != "front" else g
        return tv.clean(np.ascontiguousarray(g), a.thin, axis)

    sm = view("side", a.side_nose, "x")
    side = tv.side_view(sm, L, True)
    tg = view("top", a.top_nose, "y")
    tgs = view("top", a.top_nose, "both")
    top = tv.top_view(tg, L, S, True, tgs)

    sx, st, sb = side["x"], side["top"].copy(), side["bottom"].copy()
    nose_dist = L / 2 - sx
    # The canopy.
    if a.canopy:
        cf, cb = [float(v) for v in a.canopy.split(",")]
    else:
        cf, cb = tv.find_canopy(nose_dist, st, L)
    k = (nose_dist >= cf) & (nose_dist <= cb)
    za, zb = np.interp(cf, nose_dist, st), np.interp(cb, nose_dist, st)
    canopy_top = [[float(x), float(v)] for x, v in zip(sx[k], st[k])]
    st[k] = za + (zb - za) * (nose_dist[k] - cf) / max(1e-6, cb - cf)
    # The fin's root and the body's end.
    fin_x = a.fin if a.fin is not None else tv.fin_root(nose_dist, st, L)
    z_root = float(np.interp(fin_x, nose_dist, st))
    if a.end is not None:
        end_x = a.end
    else:
        # Behind the nozzle only the fin's trailing edge is left: its bottom stands above the spine line's half.
        cut = np.where((nose_dist > fin_x) & (sb > z_root * 0.5))[0]
        end_x = float(nose_dist[cut[0]]) if cut.size else float(nose_dist[-1])
    kf = nose_dist >= fin_x
    # Under the fin the body's top runs straight from the fin's root to the top of the nozzle at the end.
    # The nozzle's top is hidden under the fin: take the bottom there plus three quarters of the body's depth just
    # ahead of the fin (check it on the drawing; a spec usually wants its own value).
    pre = (nose_dist > fin_x - 1.2) & (nose_dist < fin_x)
    depth_pre = float(np.mean(st[pre] - sb[pre])) if pre.any() else 1.0
    z_end_top = float(np.interp(end_x - 0.05, nose_dist, sb)) + depth_pre * 0.75
    fin_line = st.copy()
    body_top = st.copy()
    body_top[kf] = z_root + (z_end_top - z_root) * (nose_dist[kf] - fin_x) / max(1e-6, end_x - fin_x)
    fin_pts = [[float(x), float(v - (z_root + (z_end_top - z_root) * (d - fin_x) / max(1e-6, end_x - fin_x)))] for x, v, d in zip(sx[kf], fin_line[kf], nose_dist[kf])]
    # The fin as a planform up from its root line, closed along the spine.
    fin_poly = [[float(L / 2 - fin_x), 0.0]] + [p for p in fin_pts if p[1] > 0.02] + [[float(L / 2 - nose_dist[kf][-1]), 0.0]]
    fin_poly = tv.simplify(fin_poly, a.tol)

    n = a.stations
    x_end = L / 2 - end_x
    xs = np.linspace(L / 2, x_end, n)
    top_l = tv.resample(sx, body_top, xs)
    bot_l = tv.resample(sx, sb, xs)
    plan_l = tv.resample(top["x"], top["plan"], xs)
    rows = [[round(float(x), 3), round(float(t), 3), round(float(b), 3), round(float(max(0.0, w)), 3)] for x, t, b, w in zip(xs, top_l, bot_l, plan_l)]

    wing = top["_planform"](top["_wing_g"], top["_root_w"] * 1.02, max(12, int(n * 0.6)))
    tail = []
    if top["_tail_g"] is not None:
        g = top["_tail_g"]
        tw = float(np.interp(np.mean(top["x"][g[0] : g[1] + 1]), top["x"][::-1], top["plan"][::-1]))
        tail = top["_planform"](g, tw * 1.02, max(10, int(n * 0.4)))
    res = {
        "name": a.name, "length": L, "span": S,
        "frame": "x forward from the middle, y out, z up from the nose tip; metres",
        "canopy_fromNose": [round(cf, 3), round(cb, 3)], "fin_fromNose": round(fin_x, 3), "end_fromNose": round(end_x, 3),
        "finBase_z": round(z_root, 3),
        "body": rows,
        "wing": tv.r3(tv.simplify(wing, a.tol)),
        "tail": tv.r3(tv.simplify(tail, a.tol)),
        "fin": tv.r3(fin_poly),
        "canopy": tv.r3(tv.simplify(canopy_top, a.tol * 0.5)),
        "halfWidth": tv.r3(tv.simplify([[float(x), float(v)] for x, v in zip(top["x"], top["halfWidth"])], a.tol)),
        "sideTop": tv.r3(tv.simplify([[float(x), float(v)] for x, v in zip(sx, side["top"])], a.tol)),
        "sideBottom": tv.r3(tv.simplify([[float(x), float(v)] for x, v in zip(sx, side["bottom"])], a.tol)),
    }
    front = None
    if a.front:
        fm = view("front", "", "x")
        tail_half = max([p[1] for p in tail], default=0.0)
        crown = float(side["top"][nose_dist < fin_x - 0.2].max())
        belly = float(sb[nose_dist < end_x].min())
        front = tv.front_view(fm, S, crown, belly, float(top["plan"].max()), tail_half, None)
        res["front"] = {
            "dihedral": round(front["dihedral"], 2), "wingRootZ": round(front["wingRootZ"], 3),
            "wingMid": tv.r3([[float(y), float(v)] for y, v in zip(front["wingY"], front["wingMid"])]),
            "wingThick": tv.r3([[float(y), float(u - l)] for y, u, l in zip(front["wingY"], front["wingUpper"], front["wingLower"])]),
            "tailZ": None if front["tailZ"] is None else round(front["tailZ"], 3),
            "section": tv.r3(front["section"]),
        }
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / f"{a.name}.json").write_text(json.dumps(res, indent=1))
    ts = lambda p: "[" + ", ".join("[" + ", ".join(str(v) for v in q) + "]" for q in p) + "]"
    lines = [
        f"// {a.name}: digitised by tools/figures/jetview.py (see specs/sources.md)",
        f"body: {ts(rows)},",
        f"wing: {ts(res['wing'])},",
        f"tail: {ts(res['tail'])},",
        f"fin: {ts(res['fin'])}, finBase: {res['finBase_z']},",
        f"canopy: {ts(res['canopy'])}, // from nose {res['canopy_fromNose']}",
    ]
    if front:
        lines.append(f"// front: wingRootZ {res['front']['wingRootZ']}, dihedral {res['front']['dihedral']}, tailZ {res['front']['tailZ']}")
    (out / f"{a.name}.ts.txt").write_text("\n".join(lines) + "\n")
    # Check image: side and top masks, the lines over them.
    tiles = []
    im = Image.fromarray(np.where(side["mask"], 200, 255).astype(np.uint8)).convert("RGB")
    d = ImageDraw.Draw(im)
    s, c0, r0 = side["scale"], side["c0"], side["rowDatum"]
    P = lambda x, z: (c0 + (L / 2 - x) / s, r0 - z / s)
    d.line([P(r[0], r[1]) for r in rows], fill=(220, 0, 0), width=2)
    d.line([P(r[0], r[2]) for r in rows], fill=(220, 0, 0), width=2)
    xr = lambda x: z_root + (z_end_top - z_root) * ((L / 2 - x) - fin_x) / max(1e-6, end_x - fin_x)
    d.line([P(x, z + xr(x)) for x, z in res["fin"]], fill=(0, 0, 220), width=2)
    d.line([P(x, z) for x, z in res["canopy"]], fill=(0, 160, 0), width=2)
    tiles.append(im)
    im = Image.fromarray(np.where(top["mask"], 200, 255).astype(np.uint8)).convert("RGB")
    d = ImageDraw.Draw(im)
    sx_, sy_, cc, rt = top["scaleX"], top["scaleY"], top["centre"], top["r0"]
    T = lambda x, y: (cc + y / sy_, rt + (L / 2 - x) / sx_)
    for sg in (-1, 1):
        d.line([T(r[0], sg * r[3]) for r in rows], fill=(220, 0, 0), width=2)
        for key in ("wing", "tail"):
            if res[key]:
                d.line([T(x, sg * y) for x, y in res[key]], fill=(0, 0, 220), width=2)
    tiles.append(im)
    if front:
        im = Image.fromarray(np.where(front["mask"], 200, 255).astype(np.uint8)).convert("RGB")
        d = ImageDraw.Draw(im)
        fs, fc = front["scale"], front["cc"]
        z0 = front["zOf"](0)
        F = lambda y, z: (fc + y / fs, (z0 - z) / fs)
        for sg in (-1, 1):
            d.line([F(sg * y, z) for y, z in res["front"]["wingMid"]], fill=(0, 0, 220), width=2)
        tiles.append(im)
    w = sum(t.width for t in tiles) + 10 * len(tiles)
    h = max(t.height for t in tiles)
    sheet = Image.new("RGB", (w, h), "white")
    x = 0
    for t in tiles:
        sheet.paste(t, (x, 0))
        x += t.width + 10
    sheet.save(out / f"{a.name}.png")
    print(json.dumps({k: res[k] for k in ("canopy_fromNose", "fin_fromNose", "end_fromNose", "finBase_z")}))
    if front:
        print(json.dumps({k: res["front"][k] for k in ("dihedral", "wingRootZ", "tailZ")}))


if __name__ == "__main__":
    main()
