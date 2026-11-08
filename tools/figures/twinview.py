"""
Digitise a multi-engined aircraft's three-view silhouette drawing into the outlines of an `mp()` spec
(src/figures/specs/prop-variants.ts): the fuselage's stations, the wing's and tailplane's half planforms
without the nacelles, the nacelles as bodies of their own, the fin (or twin fins and their spacing), the
wing's and tailplane's heights and the dihedral. Builds on tools/figures/threeview.py (same drawings, same
frame, same options); read its notes first.

USAGE (from the repo root; run Python isolated, keep the drawing in its own folder outside the repo):

    python -I tools/figures/twinview.py DRAWING.jpg --panel X0,Y0,X1,Y1 --length 16.13 --span 20.6 \
        --out OUTDIR --name b-25 [--engines 2] [--twin-fins] [--hood F,B] [--fin X]

  --engines N   engines along the whole span (2 or 4; a nose engine is not counted). Default 2.
  --nac-range Y0,Y1  look for the nacelles only between these distances from the centre line (metres).
  --twin-fins   fins at the tailplane's tips (B-25, Do 217, Pe-2): their spacing is measured on the front view.
  --hood F,B    the cockpit glazing's foot and back, metres behind the nose (side view); default: found round
                the crown, as threeview's --canopy auto. `none` for a glazed nose with no stepped cockpit.
  --bridge-top F,B  the body's top straight between these stations (metres behind the nose): what stands on the
                body there (a parasol wing's pylon, nacelles above a hull) is not the body; add it by hand.
  --align crown|both  the head-on view's heights from the crown alone or from crown and belly (default both).
  --clamp-belly  between the nacelles' ends the fuselage's bottom goes no lower than its belly on the head-on
                view (for nacelles that hang below the body: in the side view they hide its bottom line). Off by
                default: a head-on view's white detail lines can cut its belly off.

OUTPUT (OUTDIR/NAME.*): .json (every measurement, metres, in the figure frame: x forward from the
aircraft's middle, y out, z up from the thrust line; `body` rows [x, top, bottom, half width], `wing` and
`tail` stations [out, leading edge, trailing edge], `fin`, `nacelles`, `hood`, `wingUp`, `dihedral`,
`tailUp`, `twin` as `mp()` takes them), .png (the cleaned views with the extracted lines over them). The
spec's class, propeller, turrets and glazing are added by hand.

The nacelles: on the plan view each nacelle is the run of columns whose leading point stands well ahead of
the wing's leading edge; its back is where its middle columns end (behind the wing when it runs past it); its width along its
length comes from those columns, its height and the height of its axis from the head-on view (the run at
the nacelle's middle, where the wing passes through it), its outline in height follows its plan width.

MIT licence, part of 3DHeat. No drawing data lives here.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import threeview as tv  # noqa: E402


def edges_of(poly: list[list[float]]) -> list[list[float]]:
    """A half planform polygon (leading edge root to tip, tip, trailing edge tip to root) as stations
    [out, leading edge, trailing edge], root to tip."""
    if not poly:
        return []
    k = int(np.argmax([p[1] for p in poly]))
    le = poly[: k + 1]
    te = poly[k:][::-1]
    ys = sorted({round(p[1], 3) for p in le} | {round(p[1], 3) for p in te})
    li = lambda pts, y: float(np.interp(y, [p[1] for p in pts], [p[0] for p in pts]))
    return [[y, li(le, y), li(te, y)] for y in ys]


def fix_nacelle_band(edges: list[list[float]], bands: list[tuple[float, float]]) -> list[list[float]]:
    """The wing's leading and trailing edges straight across the nacelles: stations inside a band are
    dropped, the line runs between the stations either side."""
    out = []
    for e in edges:
        if any(a - 0.05 <= e[0] <= b + 0.05 for a, b in bands):
            continue
        out.append(e)
    return out


def nacelles(top: dict, wing_edges: list[list[float]], span: float, engines: int, body_hw: float, rng: tuple[float, float] | None = None) -> list[dict]:
    """The nacelles on the plan view, one side's (both halves averaged)."""
    m = top["mask"]
    sx, sy, cc, r0 = top["scaleX"], top["scaleY"], top["centre"], top["r0"]
    L = (m.any(axis=1).nonzero()[0][-1] - r0 + 1) * sx
    xs_of = lambda r: L / 2 - (r - r0 + 0.5) * sx
    ws = np.array([e[0] for e in wing_edges])
    le = lambda y: float(np.interp(y, ws, [e[1] for e in wing_edges]))
    te = lambda y: float(np.interp(y, ws, [e[2] for e in wing_edges]))
    found = []
    for sgn in (-1, 1):
        cols = []
        for c in range(m.shape[1]):
            y = (c - cc) * sgn * sy
            if y < body_hw * 1.25 or y > span / 2 * 0.75:
                continue
            if rng and not rng[0] <= y <= rng[1]:
                continue
            rr = tv.runs_of(m[:, c])
            if not rr:
                continue
            # The run through the wing at this column.
            wl, wt = le(y), te(y)
            best = None
            for a, b in rr:
                fa, fb = xs_of(a), xs_of(b)
                if fb <= wl + 0.05 and fa >= wt - 0.05:
                    best = (fa, fb)
            if best is None:
                continue
            ahead = best[0] - wl
            behind = wt - best[1]
            cols.append((y, best[0], best[1], ahead, behind))
        if not cols:
            continue
        cols.sort()
        # Nacelle columns: standing well ahead of the leading edge.
        lim = max(0.35, 0.03 * L)
        flag = [c[3] > lim for c in cols]
        groups, start = [], None
        for i, f in enumerate(flag + [False]):
            if f and start is None:
                start = i
            if not f and start is not None:
                groups.append(cols[start:i])
                start = None
        groups = [g for g in groups if (g[-1][0] - g[0][0]) > 0.25]
        groups.sort(key=lambda g: -sum(c[3] for c in g))
        groups = sorted(groups[: engines // 2], key=lambda g: g[0][0])
        for j, g in enumerate(groups):
            found.append((sgn, j, g))
    out = []
    for j in range(engines // 2):
        gs = [g for s, jj, g in found if jj == j]
        if not gs:
            continue
        y0 = float(np.mean([g[0][0] for g in gs]))
        y1 = float(np.mean([g[-1][0] for g in gs]))
        yc = (y0 + y1) / 2
        front = float(np.mean([max(c[1] for c in g) for g in gs]))
        # The back: where the columns near the nacelle's middle end (behind the wing when it runs past it).
        mid = [[c for c in g if abs(c[0] - (g[0][0] + g[-1][0]) / 2) <= (g[-1][0] - g[0][0]) * 0.25] or g for g in gs]
        back = float(np.mean([np.median([c[2] for c in g]) for g in mid]))
        # Half width along its length: each side's columns that reach that far (both halves averaged).
        stations = np.linspace(front, back, 14)
        hw = []
        for x in stations:
            per = []
            for g in gs:
                ys = [c[0] for c in g if c[2] - 0.01 <= x <= c[1] + 0.01]
                if ys:
                    per.append((max(ys) - min(ys) + sy) / 2)
            hw.append(float(np.mean(per)) if per else 0.0)
        # The band the wing's edges are run straight across: a little wider than the columns flagged (the
        # nacelle's flanks, where it stands less far ahead of the wing, still bend the edges).
        pad = 0.15 * (y1 - y0) + 0.1
        out.append({"y": round(yc, 3), "x": round(front, 3), "back": round(back, 3), "halfWidth": [[round(float(x), 3), round(w, 3)] for x, w in zip(stations, hw)], "band": [y0 - pad, y1 + pad]})
    return out


def centre_run(top: dict) -> tuple[np.ndarray, np.ndarray]:
    """The plan view's run through the centre line at each row (forward position, half width)."""
    m, sx, sy, cc, r0 = top["mask"], top["scaleX"], top["scaleY"], top["centre"], top["r0"]
    ci = int(round(cc))
    xs, hw = [], []
    for i, x in enumerate(top["x"]):
        r = r0 + i
        if not m[r, ci]:
            xs.append(x)
            hw.append(0.0)
            continue
        a = ci
        while a > 0 and m[r, a - 1]:
            a -= 1
        b = ci
        while b < m.shape[1] - 1 and m[r, b + 1]:
            b += 1
        xs.append(x)
        hw.append((b - a + 1) / 2 * sy)
    return np.array(xs), np.array(hw)


def bridge(xs: np.ndarray, vs: np.ndarray, front: float, back: float) -> np.ndarray:
    """`vs` run straight from `front` to `back` (forward positions), the rows between replaced."""
    out = vs.copy()
    k = (xs <= front) & (xs >= back)
    if k.any():
        a = float(np.interp(front, xs[::-1], vs[::-1]))
        b = float(np.interp(back, xs[::-1], vs[::-1]))
        out[k] = a + (b - a) * (front - xs[k]) / max(1e-6, front - back)
    return out


def front_nacelle(front: dict, y: float, wing_z: float) -> tuple[float, float] | None:
    """The nacelle's top and bottom (z) at its middle on the head-on view: the run there through the wing."""
    m, s, cc = front["mask"], front["scale"], front["cc"]
    z = front["zOf"]
    res = []
    for sgn in (-1, 1):
        c = int(round(cc + sgn * y / s))
        rr = tv.runs_of(m[:, c])
        if not rr:
            continue
        run = min(rr, key=lambda q: abs((z(q[0]) + z(q[1])) / 2 - wing_z))
        res.append((z(run[0] - 0.5), z(run[1] + 0.5)))
    if not res:
        return None
    return float(np.mean([r[0] for r in res])), float(np.mean([r[1] for r in res]))


def twin_fin_spacing(m: np.ndarray, z, cc: float, s: float, tail_z: float | None, body_hw: float, tail_half: float, fin_top: float) -> float | None:
    """The distance between twin fins on the head-on view (`m` cleaned of specks only: a fin edge-on is thin):
    the columns between the body and the tailplane's tips that stand well above the tailplane."""
    tz = tail_z if tail_z is not None else 0.0
    ref = tz + max(0.4, (fin_top - tz) * 0.7)
    ys = []
    for c in range(m.shape[1]):
        y = abs(c - cc) * s
        if y < body_hw * 1.3 or y > tail_half * 1.15:
            continue
        r = np.where(m[:, c])[0]
        if r.size and z(r[0]) > ref:
            ys.append(y)
    if not ys:
        return None
    return float(2 * np.median(ys))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image")
    ap.add_argument("--panel")
    ap.add_argument("--front")
    ap.add_argument("--top")
    ap.add_argument("--side")
    ap.add_argument("--views", default="front,top,side")
    ap.add_argument("--length", type=float, required=True)
    ap.add_argument("--span", type=float, required=True)
    ap.add_argument("--side-nose", default="left")
    ap.add_argument("--top-nose", default="up")
    ap.add_argument("--hood", default="auto")
    ap.add_argument("--fin", type=float)
    ap.add_argument("--fin-end", type=float, help="the fin's root trailing edge, metres behind the nose (a tail cone running on behind the fins)")
    ap.add_argument("--engines", type=int, default=2)
    ap.add_argument("--nac-range", help="Y0,Y1: look for the nacelles only this far out from the centre line, metres (wingtip floats or tanks stand ahead of the wing too)")
    ap.add_argument("--twin-fins", action="store_true")
    ap.add_argument("--clamp-belly", action="store_true")
    ap.add_argument("--bridge-top", help="F,B: the body's top run straight between these stations, metres behind the nose (a parasol wing's pylon, a flying boat's engines over the hull)")
    ap.add_argument("--align", default="both", choices=["both", "crown"])
    ap.add_argument("--stations", type=int, default=28)
    ap.add_argument("--thin", type=float, default=0.012)
    ap.add_argument("--hairlines", action="store_true")
    ap.add_argument("--frames", action="store_true")
    ap.add_argument("--tol", type=float, default=0.02)
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", required=True)
    a = ap.parse_args()

    tv.HAIRLINES = a.hairlines
    gray = tv.load_gray(a.image)
    boxes: dict[str, tuple[int, int, int, int]] = {}
    if a.panel:
        x0, y0, x1, y1 = tv.box(a.panel)
        sub = gray[y0:y1, x0:x1]
        dark = sub < tv.otsu(sub)
        if a.frames:
            fx0, fy0, fx1, fy1 = tv.inside_frame(dark)
            x0, y0, x1, y1 = x0 + fx0, y0 + fy0, x0 + fx1, y0 + fy1
            sub = gray[y0:y1, x0:x1]
            dark = sub < tv.otsu(sub)
        coarse = tv.ndi.binary_opening(dark, structure=np.ones((3, 3)))
        order = a.views.split(",")
        for name, (bx0, by0, bx1, by1) in zip(order, tv.split_panel(coarse, len(order))):
            boxes[name] = (x0 + bx0, y0 + by0, x0 + bx1, y0 + by1)
    for name in ("front", "top", "side"):
        if getattr(a, name):
            boxes[name] = tv.box(getattr(a, name))
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    crop = lambda b: gray[b[1] : b[3], b[0] : b[2]]
    L, S = a.length, a.span
    sm = tv.clean(crop(boxes["side"]), a.thin, "x")
    # The side view in one piece: its box can reach up into the plan view's tailplane above it.
    lab, nl = tv.ndi.label(sm)
    if nl > 1:
        sizes = tv.ndi.sum(sm, lab, range(1, nl + 1))
        sm = lab == int(np.argmax(sizes)) + 1
    side = tv.side_view(sm, L, a.side_nose == "left")
    top = tv.top_view(tv.clean(crop(boxes["top"]), a.thin, "y"), L, S, a.top_nose == "up", tv.clean(crop(boxes["top"]), a.thin, "both"))

    sx, st, sb = side["x"], side["top"].copy(), side["bottom"].copy()
    nose_dist = L / 2 - sx
    raw_top = side["top"]
    if a.bridge_top:
        f, b = [float(v) for v in a.bridge_top.split(",")]
        st = bridge(sx, st, L / 2 - f, L / 2 - b)
        side["top"] = bridge(sx, side["top"], L / 2 - f, L / 2 - b)
    hood = None
    if a.hood != "none":
        f, b = [float(v) for v in a.hood.split(",")] if a.hood != "auto" else tv.find_canopy(nose_dist, st, L)
        hood = [round(L / 2 - f, 3), round(L / 2 - b, 3)]
    fin_x = a.fin if a.fin is not None else tv.fin_root(nose_dist, st, L)
    k = nose_dist >= fin_x
    z_root = float(np.interp(fin_x, nose_dist, st))
    z_end = float(sb[k][-1] + 0.05)
    fin_top_line = st[k].copy()
    st[k] = z_root + (z_end - z_root) * (nose_dist[k] - fin_x) / max(1e-6, nose_dist[k][-1] - fin_x)
    fin_pts = [[float(x), float(v)] for x, v in zip(sx[k], fin_top_line)]
    if a.fin_end is not None:
        # The fin ends here; behind it the tail cone's top is the body's.
        ke = nose_dist[k] <= a.fin_end
        fin_pts = [p for p, q in zip(fin_pts, ke) if q]
        tail_k = k & (nose_dist > a.fin_end)
        st[tail_k] = side["top"][tail_k]
    if a.twin_fins:
        # Twin fins: the side view shows the fin's whole height, below the tail too; the bottom line there is the fin's.
        kb = k & (nose_dist <= a.fin_end) if a.fin_end is not None else k
        fin_bot = [[float(x), float(v)] for x, v in zip(sx[kb], sb[kb])]
        fin = tv.simplify([[float(L / 2 - fin_x), z_root]] + fin_pts, a.tol) + tv.simplify(fin_bot[::-1], a.tol)
    else:
        fin = tv.simplify([[float(L / 2 - fin_x), z_root]] + fin_pts, a.tol)

    n = a.stations
    planform = top["_planform"]
    # The wing's root at the body's side: the body's widest where the centre run is the body's own (narrower than
    # a twelfth of the span; threeview's estimate bridges over the nacelles' rows and comes out too narrow).
    _, chw0 = centre_run(top)
    own = chw0[(chw0 > 0) & (chw0 < S / 12)]
    root_w = float(own.max()) if own.size else top["_root_w"]
    wing_raw = planform(top["_wing_g"], root_w * 1.05, 40)
    tail = []
    if top["_tail_g"] is not None:
        g = top["_tail_g"]
        tw = float(np.interp(np.mean(top["x"][g[0] : g[1] + 1]), top["x"][::-1], top["plan"][::-1]))
        tail = planform(g, tw * 1.02, 16)
    tail_half = max([p[1] for p in tail], default=0.0)
    body_hw = root_w
    w_edges = edges_of(wing_raw)
    # A first straight-edged guess of the wing to find the nacelles by, from the stations outboard of them.
    outer = [e for e in w_edges if e[0] > S / 2 * 0.55]
    guess = w_edges
    if len(outer) >= 2:
        pl = np.polyfit([e[0] for e in outer], [e[1] for e in outer], 1)
        pt = np.polyfit([e[0] for e in outer], [e[2] for e in outer], 1)
        inner = [e for e in w_edges if e[0] < body_hw * 1.6]
        r_le = inner[0][1] if inner else np.polyval(pl, 0)
        r_te = inner[0][2] if inner else np.polyval(pt, 0)
        # Inboard the edges run from the root's to the outer panels' line (no further forward or back).
        guess = [[y, min(e1, max(r_le, np.polyval(pl, y))), max(e2, min(r_te, np.polyval(pt, y)))] for y, e1, e2 in w_edges]
    nacs = nacelles(top, guess, S, a.engines, body_hw, tuple(float(v) for v in a.nac_range.split(",")) if a.nac_range else None)
    bands = [tuple(nc["band"]) for nc in nacs]
    w_edges = fix_nacelle_band(w_edges, bands)

    front = None
    wing_z = 0.0
    dihedral = 0.0
    tail_z = None
    fin_sp = None
    if "front" in boxes:
        tail_hint = float(np.interp(-L / 2 + 0.6, sx[::-1], st[::-1]))
        crown = float(raw_top[nose_dist < fin_x - 0.2].max())
        fm = tv.clean(crop(boxes["front"]), a.thin, "x")
        # Aligned on the crown alone (a nacelle may hang below the body in the side view).
        fr = tv.front_view(fm, S, crown, crown, body_hw, tail_half, tail_hint)
        rows = np.where(fm.any(axis=1))[0]
        s = fr["scale"]
        cc = fr["cc"]
        # The crown: the body opened across half a metre (an aerial mast or a fin head-on is narrower).
        body = tv.ndi.binary_opening(fm, structure=np.ones((1, max(3, int(0.5 / s)))))
        ci0 = int(round(cc))
        near = body[:, max(0, ci0 - int(0.2 / s)) : ci0 + int(0.2 / s) + 1].any(axis=1)
        crown_r = int(np.where(near)[0][0]) if near.any() else int(rows[0])
        # Heights: the crown and the belly (the centre's lowest point; the mask as cleaned, as the body narrows
        # round its bottom) each give them, the mean halves either's error; --align crown takes the crown alone.
        low = fm[:, max(0, ci0 - int(0.2 / s)) : ci0 + int(0.2 / s) + 1].any(axis=1)
        belly_r = int(np.where(low)[0][-1]) if low.any() else int(rows[-1])
        belly_side = float(side["bottom"][nose_dist < fin_x].min())
        off = crown + (crown_r - 0.5) * s
        if a.align == "both":
            off = (off + belly_side + (belly_r + 0.5) * s) / 2
        # front_view measured against its own middle of crown and belly; move its heights onto this alignment.
        shift = off - fr["zOf"](0)
        fr["zOf"] = lambda r, off=off, s=s: off - r * s
        wing_z = fr["wingRootZ"] + shift
        dihedral = fr["dihedral"]
        tail_z = fr["tailZ"] + shift if fr["tailZ"] is not None else None
        front = fr
        fin_top = max(p[1] for p in fin)
        if a.twin_fins:
            fine = tv.clean(crop(boxes["front"]), 0.002, "x")
            fin_sp = twin_fin_spacing(fine, fr["zOf"], cc, s, tail_z, body_hw, tail_half, fin_top)
        # With --clamp-belly, in the nacelles' run (a nacelle hanging below the body hides its bottom in the side
        # view) the body's bottom no lower than its belly head-on.
        belly = fr["zOf"](belly_r + 0.5)
        if nacs and a.clamp_belly:
            f0 = max(nc["x"] for nc in nacs) + 0.1
            b0 = min(nc["back"] for nc in nacs) - 0.1
            kk = (sx < f0) & (sx > b0)
            sb[kk] = np.maximum(sb[kk], belly)
        for nc in nacs:
            wz = wing_z + np.tan(np.radians(dihedral)) * nc["y"]
            tb = front_nacelle(fr, nc["y"], wz)
            if tb:
                nc["top"], nc["bottom"] = round(tb[0], 3), round(tb[1], 3)
                nc["z"] = round((tb[0] + tb[1]) / 2, 3)
                nc["r"] = round((tb[0] - tb[1]) / 2, 3)

    t_edges = edges_of(tail)
    if tail_z is None and t_edges:
        # The tailplane hidden behind the wing head-on: on the spine at its root's middle (the side view).
        tail_z = float(np.interp((t_edges[0][1] + t_edges[0][2]) / 2, sx[::-1], st[::-1])) - 0.1
    xs_st = np.linspace(L / 2, -L / 2, n)
    t_ = tv.resample(sx, side["top"], xs_st)
    b_ = tv.resample(sx, sb, xs_st)
    # Under the fin the body's top is the spine, not the fin.
    t_fin = tv.resample(sx, st, xs_st)
    t_ = np.where(xs_st < L / 2 - fin_x, t_fin, t_)
    # The body's plan: the centre run, straight across the wing's and the tailplane's roots (the nacelles do not
    # touch it, so threeview's own bridging over every wide row is not wanted here).
    cx, chw = centre_run(top)
    if w_edges:
        chw = bridge(cx, chw, w_edges[0][1] + 0.15, w_edges[0][2] - 0.15)
    if w_edges:
        # Behind the wing the body only narrows to the tail (a tailplane's fillet would widen the centre run).
        k = np.where(cx < w_edges[0][2] - 0.2)[0]
        if k.size:
            chw[k] = np.minimum.accumulate(chw[k])
    w_ = tv.resample(cx, chw, xs_st)
    rows_ = [[round(float(x), 3), round(float(t), 3), round(float(b), 3), round(float(w), 3)] for x, t, b, w in zip(xs_st, t_, b_, w_)]
    res = {
        "name": a.name,
        "length": L,
        "span": S,
        "frame": "x forward from the middle, y out, z up from the thrust line; metres",
        "check": {
            "rootLE_fromNose": round(L / 2 - w_edges[0][1], 3) if w_edges else None,
            "rootChord": round(w_edges[0][1] - w_edges[0][2], 3) if w_edges else None,
            "tailLE_fromNose": round(L / 2 - t_edges[0][1], 3) if t_edges else None,
            "finRoot_fromNose": round(fin_x, 3),
        },
        "body": rows_,
        "hood": hood,
        "wing": [[round(e[0], 3), round(e[1], 3), round(e[2], 3)] for e in w_edges],
        "tail": [[round(e[0], 3), round(e[1], 3), round(e[2], 3)] for e in t_edges],
        "fin": tv.r3(fin),
        "wingUp": round(wing_z, 3),
        "dihedral": round(dihedral, 2),
        "tailUp": None if tail_z is None else round(tail_z, 3),
        "twin": None if fin_sp is None else round(fin_sp, 3),
        "nacelles": [{k: v for k, v in nc.items() if k != "band"} for nc in nacs],
    }
    (out / f"{a.name}.json").write_text(json.dumps(res, indent=1))
    overlay(out / f"{a.name}.png", side, top, front, res)
    print(json.dumps(res["check"]), json.dumps({k: res[k] for k in ("wingUp", "dihedral", "tailUp", "twin", "hood")}))
    for nc in res["nacelles"]:
        print(json.dumps({k: v for k, v in nc.items() if k != "halfWidth"}))


def overlay(path: Path, side: dict, top: dict, front: dict | None, res: dict) -> None:
    L = res["length"]
    tiles = []
    tile = lambda mask: Image.fromarray(np.where(mask, 200, 255).astype(np.uint8)).convert("RGB")
    im = tile(side["mask"])
    d = ImageDraw.Draw(im)
    s, c0, r0 = side["scale"], side["c0"], side["rowDatum"]
    P = lambda x, z: (c0 + (L / 2 - x) / s, r0 - z / s)
    d.line([P(r[0], r[1]) for r in res["body"]], fill=(220, 0, 0), width=2)
    d.line([P(r[0], r[2]) for r in res["body"]], fill=(220, 0, 0), width=2)
    d.line([P(*p) for p in res["fin"]], fill=(0, 0, 220), width=2)
    for nc in res["nacelles"]:
        if "top" in nc:
            d.rectangle([P(nc["x"], nc["top"]), P(nc["back"], nc["bottom"])], outline=(0, 160, 0), width=2)
    if res["hood"]:
        for x in res["hood"]:
            d.line([P(x, -0.5), P(x, 2.0)], fill=(0, 160, 0), width=1)
    tiles.append(im)
    im = tile(top["mask"])
    d = ImageDraw.Draw(im)
    sx, sy, cc, r0 = top["scaleX"], top["scaleY"], top["centre"], top["r0"]
    T = lambda x, y: (cc + y / sy, r0 + (L / 2 - x) / sx)
    for sgn in (-1, 1):
        d.line([T(r[0], sgn * r[3]) for r in res["body"]], fill=(220, 0, 0), width=2)
        for key in ("wing", "tail"):
            e = res[key]
            if e:
                d.line([T(l, sgn * y) for y, l, t in e] + [T(t, sgn * y) for y, l, t in e[::-1]], fill=(0, 0, 220), width=2)
        for nc in res["nacelles"]:
            hw = nc["halfWidth"]
            d.line([T(x, sgn * (nc["y"] + w)) for x, w in hw] + [T(x, sgn * (nc["y"] - w)) for x, w in hw[::-1]], fill=(0, 160, 0), width=2)
    tiles.append(im)
    if front:
        im = tile(front["mask"])
        d = ImageDraw.Draw(im)
        s, cc = front["scale"], front["cc"]
        z0 = front["zOf"](0)
        F = lambda y, z: (cc + y / s, (z0 - z) / s)
        tan = np.tan(np.radians(res["dihedral"]))
        for sgn in (-1, 1):
            d.line([F(0, res["wingUp"]), F(sgn * L / 2 * 1.2, res["wingUp"] + tan * L / 2 * 1.2)], fill=(0, 0, 220), width=1)
            for nc in res["nacelles"]:
                if "top" in nc:
                    w = max(w for _, w in nc["halfWidth"])
                    d.rectangle([F(sgn * nc["y"] - w, nc["top"]), F(sgn * nc["y"] + w, nc["bottom"])], outline=(0, 160, 0), width=2)
            if res["twin"]:
                d.line([F(sgn * res["twin"] / 2, 0), F(sgn * res["twin"] / 2, 3)], fill=(220, 0, 0), width=1)
        if res["tailUp"] is not None:
            d.line([F(-3, res["tailUp"]), F(3, res["tailUp"])], fill=(0, 160, 0), width=2)
        tiles.append(im)
    w = sum(t.width for t in tiles) + 10 * len(tiles)
    h = max(t.height for t in tiles)
    sheet = Image.new("RGB", (w, h), "white")
    x = 0
    for t in tiles:
        sheet.paste(t, (x, 0))
        x += t.width + 10
    sheet.save(path)


if __name__ == "__main__":
    main()
