"""
Digitise an aircraft's three-view silhouette drawing into the outlines the
figure specs use (src/figures/air.ts, FixedWingSpec / piston()).

USAGE (from the repo root; run Python isolated, keep the drawing in its own folder outside the repo):

    python -I tools/figures/threeview.py DRAWING.jpg --panel X0,Y0,X1,Y1 --length 9.02 --span 9.92 \
        --out OUTDIR --name bf-109-g6 [--canopy 2.6,4.3] [--fin 7.6] [--views front,top,side]

  DRAWING   a scan of a silhouette three-view (black solid views on a light ground), e.g. the US War
            Department's FM 30-30 (1943) or the US Army-Navy Journal of Recognition (1943-45), both public
            domain. Only use drawings whose licence allows it (see src/figures/specs/sources.md).
  --panel   pixel box holding the three views of one type. They are split automatically along the empty
            bands between them, top to bottom in the order --views gives (default front, top, side, the
            recognition manuals' layout). Or give each view's box: --front, --top, --side.
  --length / --span   published overall length (spinner tip to rudder) and span, metres: the scale. The side
            and top views are scaled by the length, the front view by the span; the top view's spanwise
            scale by the span, so the half planform reaches the published half span exactly.
  --side-nose left|right, --top-nose up|down   which way the nose points in those views (default left, up).
  --canopy F,B   the windscreen's foot and the hood's back, metres behind the nose (side view): the
            fuselage's top runs straight under the canopy (the deck), the canopy is output on its own.
            Default `auto` (found round the crown, printed); `none` leaves the canopy in the top line.
  --fin X   the fin's root leading edge, metres behind the nose (default: where the spine is lowest in the
            rear 45 %): the fuselage's top runs straight from there to the tail, the fin is output on its own.
  --stations N   fuselage stations (default 32); the planforms get N * 0.75 spanwise stations.
  --hairlines   open away hair lines (an aerial's wire from mast to fin) before the silhouette is filled; off by
            default, as it also opens a canopy drawn as thin frames round white glass.
  --frames  the panel is a framed box (the Journal of Recognition's): measure inside its frame lines.
  --thin S  thin features narrower than S (share of the view's long side, default 0.012) are removed before
            measuring: propeller blades, aerials, pitot tubes.

OUTPUT (OUTDIR/NAME.*):
  .json     every measurement, metres, in the figure frame: x forward from the aircraft's middle (the
            length's half-way point), y out from the centre line, z up from the thrust line (the spinner's
            axis, taken from the side view's nose tip). Fuselage top/bottom/plan; wing and tailplane half
            planforms (forward, out); fin outline (forward, z) with its base; canopy profile; from the front
            view the wing's height along the span, its dihedral and the tailplane's height.
  .ts.txt   the same as TypeScript literals ready to paste into a spec (`draw: { ... }` of piston()).
  .png      the cleaned views with the extracted lines drawn over them, to check by eye.

Other figure groups (twins, bombers, jets) can use the same script; for an aircraft with nacelles or
pods the fuselage plan is still the centre run, the nacelles show in the top view's full width
(`halfWidth`) and want their own bodies.

MIT licence, part of 3DHeat. No drawing data lives here.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi


# ---------------------------------------------------------------- masks


def load_gray(path: str) -> np.ndarray:
    return np.asarray(Image.open(path).convert("L"), dtype=np.float32)


def otsu(values: np.ndarray) -> float:
    hist, edges = np.histogram(values, bins=256, range=(0, 256))
    total = values.size
    sum_all = (hist * np.arange(256)).sum()
    best, thr, w0, s0 = -1.0, 128.0, 0.0, 0.0
    for t in range(256):
        w0 += hist[t]
        if w0 == 0 or w0 == total:
            continue
        s0 += t * hist[t]
        m0 = s0 / w0
        m1 = (sum_all - s0) / (total - w0)
        between = w0 * (total - w0) * (m0 - m1) ** 2
        if between > best:
            best, thr = between, t
    return float(thr)


def inside_frame(dark: np.ndarray) -> tuple[int, int, int, int]:
    """The box inside a panel's frame (x0, y0, x1, y1): upright rules are columns dark over most of the box's
    height; level rules are rows dark over most of its width near its top or bottom edge (a plan view's wing
    can be as wide, but stands in the middle)."""
    h, w = dark.shape
    cols = np.where(dark.mean(axis=0) > 0.6)[0]
    x0, x1 = 0, w
    left = cols[cols < w * 0.15]
    right = cols[cols > w * 0.85]
    if left.size:
        x0 = int(left.max()) + 4
    if right.size:
        x1 = int(right.min()) - 4
    rows = np.where(dark[:, x0:x1].mean(axis=1) > 0.85)[0]
    y0, y1 = 0, h
    top = rows[rows < h * 0.08]
    bottom = rows[rows > h * 0.92]
    if top.size:
        y0 = int(top.max()) + 4
    if bottom.size:
        y1 = int(bottom.min()) - 4
    return x0, y0, x1, y1


HAIRLINES = False


def clean(gray: np.ndarray, thin: float, keep_axis: str) -> np.ndarray:
    """Dark silhouette, white detail lines closed, holes filled, thin parts (props, aerials) opened away, largest part kept."""
    dark = gray < otsu(gray)
    # With --hairlines, hair lines first (an aerial's wire to the fin would close a triangle of sky into the body;
    # but a canopy drawn as thin frames round white glass opens too, so only where needed); then the white detail
    # lines inside the silhouette closed.
    if HAIRLINES:
        dark = ndi.binary_opening(dark, structure=np.ones((3, 3)))
    dark = ndi.binary_closing(dark, structure=np.ones((5, 5)), iterations=1)
    dark = ndi.binary_fill_holes(dark)
    k = max(3, int(round(max(dark.shape) * thin)))
    # Open across the direction thin parts run in: a blade or mast standing up in the side or front view is narrow
    # along x; a blade lying across the top view's nose is narrow along the length (rows).
    # The plan view opens both ways: blades lie across its nose, gun barrels and pitots point forward.
    st = np.ones((1, k)) if keep_axis == "x" else np.ones((k, k)) if keep_axis == "both" else np.ones((k, 1))
    opened = ndi.binary_opening(dark, structure=st)
    lab, n = ndi.label(opened)
    if n == 0:
        raise SystemExit("no silhouette found in a view box")
    sizes = ndi.sum(opened, lab, range(1, n + 1))
    big = int(np.argmax(sizes)) + 1
    # Keep parts at least a twentieth of the largest (a tailplane cut off by a white line stays).
    keep = [i + 1 for i, s in enumerate(sizes) if s >= sizes[big - 1] * 0.05]
    return np.isin(lab, keep)


def split_panel(mask: np.ndarray, n: int, pad: int | None = None) -> list[tuple[int, int, int, int]]:
    """Boxes (x0, y0, x1, y1) of the `n` views in a panel, top to bottom: its largest blobs once each view's
    parts are run together, leaving out rules and lines (thin), text and specks (small)."""
    k = max(5, int(max(mask.shape) * 0.012))
    blobs = ndi.binary_closing(mask, structure=np.ones((k, k)))
    lab, count = ndi.label(blobs)
    found = []
    for i, sl in enumerate(ndi.find_objects(lab)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        area = int((lab[sl] == i + 1).sum())
        if min(h, w) < max(mask.shape) * 0.03 and max(h, w) > 8 * min(h, w) and area < h * w * 0.5:
            continue  # a rule or a frame line
        found.append((area, sl))
    found = sorted(found, key=lambda f: -f[0])
    # The views of one type stand on one vertical axis (the largest, the plan view, gives it); a title or a
    # caption beside them does not.
    if found:
        ref = found[0][1]
        cx = (ref[1].start + ref[1].stop) / 2
        w = ref[1].stop - ref[1].start
        found = [f for f in found if abs((f[1][1].start + f[1][1].stop) / 2 - cx) <= 0.1 * w]
    found = found[:n]
    if len(found) != n:
        raise SystemExit(f"found {len(found)} views in the panel, expected {n}; give --front/--top/--side boxes")
    found.sort(key=lambda f: f[1][0].start)
    pad = k if pad is None else pad
    return [(max(0, sl[1].start - pad), max(0, sl[0].start - pad), min(mask.shape[1], sl[1].stop + pad), min(mask.shape[0], sl[0].stop + pad)) for _, sl in found]


def box(s: str) -> tuple[int, int, int, int]:
    a = [int(float(v)) for v in s.split(",")]
    return a[0], a[1], a[2], a[3]


# ---------------------------------------------------------------- measurements


def runs_of(col: np.ndarray) -> list[tuple[int, int]]:
    """Dark runs (first, last index) in a 1-D mask."""
    d = np.diff(np.concatenate([[0], col.astype(np.int8), [0]]))
    starts = np.where(d == 1)[0]
    ends = np.where(d == -1)[0] - 1
    return list(zip(starts.tolist(), ends.tolist()))


def resample(xs: np.ndarray, vs: np.ndarray, at: np.ndarray) -> np.ndarray:
    order = np.argsort(xs)
    return np.interp(at, xs[order], vs[order])


def side_view(m: np.ndarray, length: float, nose_left: bool) -> dict:
    if not nose_left:
        m = m[:, ::-1]
    cols = np.where(m.any(axis=0))[0]
    c0, c1 = int(cols[0]), int(cols[-1])
    s = length / (c1 - c0 + 1)
    # The thrust line: the nose tip's height (the first few columns' middle).
    tip_rows = np.where(m[:, c0 : c0 + 3].any(axis=1))[0]
    r0 = (tip_rows[0] + tip_rows[-1]) / 2
    xs, top, bot = [], [], []
    for c in range(c0, c1 + 1):
        r = np.where(m[:, c])[0]
        if r.size == 0:
            continue
        xs.append(length / 2 - (c - c0 + 0.5) * s)
        top.append((r0 - r[0] + 0.5) * s)
        bot.append((r0 - r[-1] - 0.5) * s)
    return {"scale": s, "x": np.array(xs), "top": np.array(top), "bottom": np.array(bot), "rowDatum": r0, "c0": c0, "mask": m}


def top_view(m: np.ndarray, length: float, span: float, nose_up: bool, solid: np.ndarray | None = None) -> dict:
    """`m` gives the length and the body's plan; `solid` (thin parts opened away both ways: gun barrels and
    pitots too) the planforms."""
    if not nose_up:
        m = m[::-1, :]
        solid = solid[::-1, :] if solid is not None else None
    if solid is None:
        solid = m
    rows = np.where(m.any(axis=1))[0]
    cols = np.where(m.any(axis=0))[0]
    r0, r1 = int(rows[0]), int(rows[-1])
    sx = length / (r1 - r0 + 1)
    sy = span / (cols[-1] - cols[0] + 1)
    # The centre line: the middle of the widest rows (the wing, symmetric).
    widths = []
    for r in range(r0, r1 + 1):
        c = np.where(m[r])[0]
        widths.append((c[-1] - c[0], (c[0] + c[-1]) / 2) if c.size else (0, 0))
    wsort = sorted(widths, reverse=True)[: max(3, len(widths) // 10)]
    cc = float(np.median([w[1] for w in wsort]))
    ci = int(round(cc))
    x, hw, fhw = [], [], []
    for r in range(r0, r1 + 1):
        c = np.where(m[r])[0]
        x.append(length / 2 - (r - r0 + 0.5) * sx)
        if c.size == 0:
            hw.append(0.0)
            fhw.append(0.0)
            continue
        hw.append((max(abs(c[0] - cc), abs(c[-1] - cc)) + 0.5) * sy)
        # The run through the centre line.
        if m[r, ci]:
            a = ci
            while a > 0 and m[r, a - 1]:
                a -= 1
            b = ci
            while b < m.shape[1] - 1 and m[r, b + 1]:
                b += 1
            fhw.append(((b - a + 1) / 2) * sy)
        else:
            fhw.append(0.0)
    x, hw, fhw = np.array(x), np.array(hw), np.array(fhw)
    # Rows crossed by a wing or a tailplane: wider than a sixth of the half span.
    surface = hw > span / 2 * 0.17
    groups, start = [], None
    for i, v in enumerate(surface):
        if v and start is None:
            start = i
        if not v and start is not None:
            groups.append((start, i - 1))
            start = None
    if start is not None:
        groups.append((start, len(surface) - 1))
    groups = [g for g in groups if g[1] - g[0] >= 2]
    span_of = lambda g: hw[g[0] : g[1] + 1].max()
    wing_g = max(groups, key=span_of)
    tail_g = groups[-1] if groups[-1] != wing_g else None
    # Where a surface's root runs on beyond the rows it is wide in (a swept leading edge, a tapered trailing
    # edge), the centre run is still the surface's: grow the group while the run is much wider than a little
    # further on.
    nr = len(fhw)
    look = max(3, int(0.08 / sx))

    def grow(g):
        a, b = g
        while a - look - 1 >= 0 and fhw[a - 1] > fhw[a - 1 - look] * 1.12 + 0.02:
            a -= 1
        while b + 1 < nr and fhw[b + 1] > fhw[min(nr - 1, b + 1 + look)] * 1.12 + 0.02:
            b += 1
        return a, b

    wing_g = grow(wing_g)
    tail_g = grow(tail_g) if tail_g is not None else None
    # The fuselage's plan across the surfaces: straight between the rows just outside them.
    body = fhw.copy()
    for g in [wing_g, tail_g]:
        if g is None:
            continue
        a, b = max(0, g[0] - 1), min(len(body) - 1, g[1] + 1)
        body[a : b + 1] = np.interp(np.arange(a, b + 1), [a, b], [fhw[a], fhw[b]])
    out = {"scaleX": sx, "scaleY": sy, "aspect": sy / sx, "x": x, "halfWidth": hw, "plan": body, "centre": cc}

    def planform(g, root_hw: float, stations: int) -> list[list[float]]:
        a, b = g
        pad = int((b - a) * 0.6)
        lo, hi = max(r0, r0 + a - pad), min(r1, r0 + b + pad)
        # Keep away from the other surface's rows.
        if g == wing_g and tail_g is not None:
            hi = min(hi, r0 + tail_g[0] - 1)
        if g == tail_g:
            lo = max(lo, r0 + wing_g[1] + 1)
        half = max(hw[a : b + 1])
        # The root at the body's side: as wide as the body just ahead of or behind the surface.
        root_hw = max(root_hw, fhw[max(0, a - 1)] * 1.08, fhw[min(len(fhw) - 1, b + 1)] * 1.08)
        # Denser towards the tip, its last station a pixel inside it; the tip itself is the middle of that cut.
        tip = half - 1.0 * sy
        ys = root_hw + (tip - root_hw) * (1 - np.cos(np.linspace(0, np.pi / 2, stations)))
        le, te, yy = [], [], []
        for y in ys:
            pts = []
            for sgn in (-1, 1):
                c = int(round(cc + sgn * y / sy))
                c = min(max(c, 0), m.shape[1] - 1)
                # The run overlapping the surface's own rows most (not a cowl or a nacelle ahead of it).
                rr = runs_of(solid[lo : hi + 1, c])
                if rr:
                    ov = lambda q: min(q[1] + lo, r0 + b) - max(q[0] + lo, r0 + a)
                    q = max(rr, key=ov)
                    if ov(q) >= 0:
                        pts.append((q[0] + lo, q[1] + lo))
            if not pts:
                continue
            f = np.mean([p[0] for p in pts]) - 0.5
            t = np.mean([p[1] for p in pts]) + 0.5
            le.append(length / 2 - (f - r0) * sx)
            te.append(length / 2 - (t - r0) * sx)
            yy.append(min(y, half))
        if not yy:
            return []
        tip_pt = [[(le[-1] + te[-1]) / 2, half]]
        poly = [[le[0], 0.0]] + [[l, y] for l, y in zip(le, yy)] + tip_pt + [[t, y] for t, y in reversed(list(zip(te, yy)))] + [[te[0], 0.0]]
        return poly

    root_w = float(np.interp(np.mean(x[wing_g[0] : wing_g[1] + 1]), x[::-1], body[::-1]))
    out["_wing_g"] = wing_g
    out["_tail_g"] = tail_g
    out["_planform"] = planform
    out["_root_w"] = root_w
    out["mask"] = m
    out["r0"] = r0
    return out


def front_view(m: np.ndarray, span: float, z_crown: float, z_belly: float, body_hw: float, tail_half: float, tail_z_hint: float | None) -> dict:
    cols = np.where(m.any(axis=0))[0]
    rows = np.where(m.any(axis=1))[0]
    s = span / (cols[-1] - cols[0] + 1)
    cc = (cols[0] + cols[-1]) / 2
    # Heights from the side view's: the canopy's crown is the body's highest point both ways once the thin
    # parts (blades, the fin seen edge on, aerials) are opened away, and its belly (radiators, scoops) the lowest.
    body = ndi.binary_opening(m, structure=np.ones((1, max(3, int(0.3 / s)))))
    ci0 = int(round(cc))
    near = body[:, max(0, ci0 - int(0.2 / s)) : ci0 + int(0.2 / s) + 1].any(axis=1)
    crown_r = int(np.where(near)[0][0]) if near.any() else int(rows[0])
    belly_r = int(np.where(near)[0][-1]) if near.any() else int(rows[-1])
    rb = rows[-1]
    # Both ends of the body give the height (the side view's crown and lowest point); their mean halves either's error.
    off = ((z_crown + (crown_r - 0.5) * s) + (z_belly + (belly_r + 0.5) * s)) / 2
    z = lambda r: off - r * s
    # The wing: outboard of the tailplane each column holds one run, the wing's; inboard, the run nearest the wing's line.
    ys, upper, lower = [], [], []
    # Outboard first, so an inboard column can follow the line the wing has taken so far.
    for c in sorted(range(int(cols[0]), int(cols[-1]) + 1), key=lambda c: -abs(c - cc)):
        y = abs(c - cc) * s
        if y < body_hw * 1.15:
            continue
        rr = runs_of(m[:, c])
        if not rr:
            continue
        if y > tail_half * 1.05 or len(rr) == 1:
            run = max(rr, key=lambda q: q[1] - q[0]) if y <= tail_half * 1.05 else rr[0]
        else:
            ref = upper[-1] if ys else z(rr[0][0])
            run = min(rr, key=lambda q: abs(z(q[0]) - ref))
        ys.append(y)
        upper.append(z(run[0] - 0.5))
        lower.append(z(run[1] + 0.5))
    ys, upper, lower = np.array(ys), np.array(upper), np.array(lower)
    order = np.argsort(ys)
    ys, upper, lower = ys[order], upper[order], lower[order]
    # Both halves at once: the median per bin of span.
    bins = np.linspace(body_hw * 1.15, span / 2, 25)
    wy, wu, wl = [], [], []
    for a, b in zip(bins[:-1], bins[1:]):
        k = (ys >= a) & (ys < b)
        if k.any():
            wy.append(float((a + b) / 2))
            wu.append(float(np.median(upper[k])))
            wl.append(float(np.median(lower[k])))
    wy, wu, wl = np.array(wy), np.array(wu), np.array(wl)
    mid = (wu + wl) / 2
    outer = wy > span / 2 * 0.35
    fit = np.polyfit(wy[outer], mid[outer], 1) if outer.sum() >= 2 else np.array([0.0, float(mid.mean())])
    slope = float(fit[0])
    # The wing's middle on the centre line, the outer panels' line run in (a gull's bend is not followed).
    root_z = float(fit[1])
    # The tailplane: the thin run near the centre beside the body, at its half span.
    tz = None
    yt = tail_half * 0.7
    if tail_half > body_hw * 1.3:
        rr = runs_of(m[:, int(round(cc + yt / s))]) + runs_of(m[:, int(round(cc - yt / s))])
        thin = [q for q in rr if (q[1] - q[0]) * s < 0.35]
        if thin:
            zs = [z((q[0] + q[1]) / 2) for q in thin]
            # The run unlike the wing's height there (the tailplane), nearest the hint if there is one.
            wz = float(np.interp(yt, wy, mid))
            cand = [v for v in zs if abs(v - wz) > 0.12]
            # None when only the wing's run is there (the tailplane hidden behind it).
            tz = (min(cand, key=lambda v: abs(v - tail_z_hint)) if tail_z_hint is not None else max(cand)) if cand else None
    # The body's cross-section: half width of the centre run per height.
    sec = []
    ci = int(round(cc))
    for r in range(int(rows[0]), int(rows[-1]) + 1):
        if not m[r, ci]:
            continue
        a = ci
        while a > 0 and m[r, a - 1]:
            a -= 1
        b = ci
        while b < m.shape[1] - 1 and m[r, b + 1]:
            b += 1
        w = (b - a + 1) / 2 * s
        if w < body_hw * 2.2:
            sec.append([z(r), w])
    return {"zOf": z, "scale": s, "wingY": wy, "wingUpper": wu, "wingLower": wl, "wingMid": mid, "dihedral": float(np.degrees(np.arctan(slope))), "wingRootZ": root_z, "tailZ": tz, "section": sec, "mask": m, "cc": cc, "rb": rb}


# ---------------------------------------------------------------- the parts


def fin_root(nose_dist: np.ndarray, top: np.ndarray, length: float) -> float:
    """The fin's root leading edge: forward from the fin's peak (in the rear 40 %) down its leading edge to
    where the top flattens out into the spine."""
    rear = np.where(nose_dist > length * 0.6)[0]
    peak = rear[int(np.argmax(top[rear]))]
    win = max(2, int(round(0.15 / max(1e-6, nose_dist[1] - nose_dist[0]))))
    slope = lambda i: (top[i] - top[i - win]) / (nose_dist[i] - nose_dist[i - win])
    i = peak
    # Off the rounded top onto the leading edge, then down it to the spine.
    while i - win > 0 and slope(i) < 0.6:
        i -= 1
    while i - win > 0 and slope(i) >= 0.3:
        i -= 1
    return float(nose_dist[i])


def find_canopy(nose_dist: np.ndarray, top: np.ndarray, length: float) -> tuple[float, float]:
    """The canopy's run along the side view's top (metres behind the nose): from the crown (the highest point
    between 15 and 70 % of the length) over its flat top, then down the windscreen ahead and the hood's back
    behind while they fall steeply."""
    k = np.where((nose_dist > length * 0.15) & (nose_dist < length * 0.7))[0]
    c = int(k[np.argmax(top[k])])
    step = max(1e-6, nose_dist[1] - nose_dist[0])
    win = max(2, int(round(0.12 / step)))

    def walk(i: int, d: int) -> int:
        while 0 <= i + d < len(top) and top[c] - top[i + d] < 0.04:
            i += d
        while 0 <= i + d * win < len(top) and (top[i] - top[i + d * win]) / (win * step) >= 0.25:
            i += d
        return i

    return float(nose_dist[walk(c, -1)]), float(nose_dist[walk(c, 1)])


def thin_poly(xs: np.ndarray, vs: np.ndarray, n: int) -> list[list[float]]:
    at = np.linspace(xs.max(), xs.min(), n)
    return [[float(a), float(v)] for a, v in zip(at, resample(xs, vs, at))]


def simplify(poly: list[list[float]], tol: float) -> list[list[float]]:
    """Douglas-Peucker: drop points within `tol` metres of the line through their neighbours."""
    if len(poly) < 3:
        return poly
    p = np.array(poly)
    a, b = p[0], p[-1]
    d = b - a
    nrm = np.hypot(*d) or 1.0
    dist = np.abs(d[0] * (p[:, 1] - a[1]) - d[1] * (p[:, 0] - a[0])) / nrm
    i = int(np.argmax(dist))
    if dist[i] <= tol:
        return [poly[0], poly[-1]]
    return simplify(poly[: i + 1], tol)[:-1] + simplify(poly[i:], tol)


def r3(poly: list[list[float]]) -> list[list[float]]:
    return [[round(a, 3), round(b, 3)] for a, b in poly]


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
    ap.add_argument("--canopy", default="auto")
    ap.add_argument("--fin", type=float)
    ap.add_argument("--stations", type=int, default=32)
    ap.add_argument("--thin", type=float, default=0.012)
    ap.add_argument("--hairlines", action="store_true", help="open away hair lines (an aerial's wire) before filling the silhouette")
    ap.add_argument("--frames", action="store_true", help="the panel is a framed box: measure inside its frame lines")
    ap.add_argument("--tol", type=float, default=0.015, help="simplification tolerance, metres")
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", required=True)
    a = ap.parse_args()

    global HAIRLINES
    HAIRLINES = a.hairlines
    gray = load_gray(a.image)
    boxes: dict[str, tuple[int, int, int, int]] = {}
    if a.panel:
        x0, y0, x1, y1 = box(a.panel)
        sub = gray[y0:y1, x0:x1]
        dark = sub < otsu(sub)
        if a.frames:
            fx0, fy0, fx1, fy1 = inside_frame(dark)
            x0, y0, x1, y1 = x0 + fx0, y0 + fy0, x0 + fx1, y0 + fy1
            sub = gray[y0:y1, x0:x1]
            dark = sub < otsu(sub)
        coarse = ndi.binary_opening(dark, structure=np.ones((3, 3)))
        order = a.views.split(",")
        for name, (bx0, by0, bx1, by1) in zip(order, split_panel(coarse, len(order))):
            boxes[name] = (x0 + bx0, y0 + by0, x0 + bx1, y0 + by1)
    for name in ("front", "top", "side"):
        if getattr(a, name):
            boxes[name] = box(getattr(a, name))
    # Where the views were found, on the drawing, to check the split by eye.
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    page = Image.fromarray(gray.astype(np.uint8)).convert("RGB")
    dr = ImageDraw.Draw(page)
    for name, b in boxes.items():
        dr.rectangle(b, outline=(220, 0, 0), width=6)
        dr.text((b[0] + 8, b[1] + 8), name, fill=(220, 0, 0))
    f = 1200 / max(page.size)
    page.resize((int(page.width * f), int(page.height * f))).save(out / f"{a.name}-boxes.png")
    crop = lambda b: gray[b[1] : b[3], b[0] : b[2]]
    L, S = a.length, a.span
    side = side_view(clean(crop(boxes["side"]), a.thin, "x"), L, a.side_nose == "left")
    top = top_view(clean(crop(boxes["top"]), a.thin, "y"), L, S, a.top_nose == "up", clean(crop(boxes["top"]), a.thin, "both"))

    n = a.stations
    # Fuselage from the side: the canopy and the fin cut away, the spine straight under them.
    sx, st, sb = side["x"], side["top"].copy(), side["bottom"]
    st_raw = side["top"]
    nose_dist = L / 2 - sx
    canopy = None
    if a.canopy != "none":
        f, b = [float(v) for v in a.canopy.split(",")] if a.canopy != "auto" else find_canopy(nose_dist, st, L)
        print(json.dumps({"canopy_fromNose": [round(f, 3), round(b, 3)]}))
        k = (nose_dist >= f) & (nose_dist <= b)
        canopy = {"x": [float(L / 2 - f), float(L / 2 - b)], "top": thin_poly(sx[k], st[k], 12)}
        za, zb = np.interp(f, nose_dist, st), np.interp(b, nose_dist, st)
        st[k] = za + (zb - za) * (nose_dist[k] - f) / (b - f)
        canopy["deck"] = [float(za), float(zb)]
    fin_x = a.fin if a.fin is not None else fin_root(nose_dist, st, L)
    k = nose_dist >= fin_x
    z_root = float(np.interp(fin_x, nose_dist, st))
    # Under the fin the spine falls straight to the tail's end, a little above the bottom there.
    z_end = float(sb[k][-1] + 0.05)
    fin_top = st[k].copy()
    st[k] = z_root + (z_end - z_root) * (nose_dist[k] - fin_x) / max(1e-6, nose_dist[k][-1] - fin_x)
    fin_pts = [[float(x), float(v)] for x, v in zip(sx[k], fin_top)]
    fin = simplify([[float(L / 2 - fin_x), z_root]] + fin_pts, a.tol)

    xs_st = np.linspace(L / 2, -L / 2, n)
    fus_top = [[float(x), float(v)] for x, v in zip(xs_st, resample(sx, st, xs_st))]
    fus_bot = [[float(x), float(v)] for x, v in zip(xs_st, resample(sx, sb, xs_st))]
    fus_plan = [[float(x), float(v)] for x, v in zip(xs_st, resample(top["x"], top["plan"], xs_st))]

    m_planform = top["_planform"]
    wing = m_planform(top["_wing_g"], top["_root_w"] * 1.02, max(12, int(n * 0.75)))
    tail = []
    if top["_tail_g"] is not None:
        g = top["_tail_g"]
        tw = float(np.interp(np.mean(top["x"][g[0] : g[1] + 1]), top["x"][::-1], top["plan"][::-1]))
        tail = m_planform(g, tw * 1.02, max(10, int(n * 0.5)))
    tail_half = max([p[1] for p in tail], default=0.0)
    body_hw = float(top["plan"].max())
    front = None
    if "front" in boxes:
        tail_hint = float(np.interp(-L / 2 + 0.6, sx[::-1], st[::-1]))
        # The crown: the highest point of the side view's top ahead of the fin.
        crown = float(st_raw[nose_dist < fin_x - 0.2].max())
        belly = float(sb[nose_dist < fin_x].min())
        front = front_view(clean(crop(boxes["front"]), a.thin, "x"), S, crown, belly, body_hw, tail_half, tail_hint)

    res = {
        "name": a.name,
        "length": L,
        "span": S,
        "frame": "x forward from the middle, y out, z up from the thrust line; metres",
        "check": {
            "topAspect": round(top["aspect"], 4),
            "sideScale": side["scale"],
            "frontScale": front["scale"] if front else None,
            "rootLE_fromNose": round(L / 2 - max(p[0] for p in wing), 3) if wing else None,
            "rootChord": round(wing[0][0] - wing[-1][0], 3) if wing else None,
            "tailLE_fromNose": round(L / 2 - max(p[0] for p in tail), 3) if tail else None,
            "finRoot_fromNose": round(fin_x, 3),
        },
        "fuselage": {"top": r3(simplify(fus_top, a.tol)), "bottom": r3(simplify(fus_bot, a.tol)), "plan": r3(simplify(fus_plan, a.tol * 0.6))},
        "wing": r3(simplify(wing, a.tol)),
        "tail": r3(simplify(tail, a.tol)),
        "fin": r3(fin),
        "finBase": round(z_root, 3),
        "canopy": canopy,
        "halfWidth": r3(simplify([[float(x), float(v)] for x, v in zip(top["x"], top["halfWidth"])], a.tol)),
    }
    if front:
        res["front"] = {
            "dihedral": round(front["dihedral"], 2),
            "wingRootZ": round(front["wingRootZ"], 3),
            "wingMid": r3([[float(y), float(v)] for y, v in zip(front["wingY"], front["wingMid"])]),
            "wingThick": r3([[float(y), float(u - l)] for y, u, l in zip(front["wingY"], front["wingUpper"], front["wingLower"])]),
            "tailZ": None if front["tailZ"] is None else round(front["tailZ"], 3),
            "section": r3(front["section"]),
        }
    (out / f"{a.name}.json").write_text(json.dumps(res, indent=1))
    ts = lambda p: "[" + ", ".join(f"[{u}, {v}]" for u, v in p) + "]"
    fz = res["fuselage"]
    lines = [
        f"// {a.name}: digitised by tools/figures/threeview.py (see specs/sources.md)",
        "draw: {",
        f"  top: {ts(fz['top'])},",
        f"  bottom: {ts(fz['bottom'])},",
        f"  plan: {ts(fz['plan'])},",
        f"  wing: {ts(res['wing'])},",
        f"  tail: {ts(res['tail'])},",
        f"  fin: {ts(res['fin'])},",
    ]
    if canopy:
        lines.append(f"  canopy: {ts(r3(canopy['top']))},")
    if front:
        lines.append(f"  wingZ: {res['front']['wingRootZ']}, dihedral: {res['front']['dihedral']}, tailZ: {res['front']['tailZ']},")
    lines.append("},")
    (out / f"{a.name}.ts.txt").write_text("\n".join(lines) + "\n")
    overlay(out / f"{a.name}.png", side, top, front, res)
    print(json.dumps(res["check"]))
    if front:
        print(json.dumps({k: res["front"][k] for k in ("dihedral", "wingRootZ", "tailZ")}))


def overlay(path: Path, side: dict, top: dict, front: dict | None, res: dict) -> None:
    """The three cleaned masks side by side, the extracted lines drawn in colour over them."""
    tiles = []
    L = res["length"]

    def tile(mask: np.ndarray) -> Image.Image:
        im = Image.fromarray(np.where(mask, 200, 255).astype(np.uint8)).convert("RGB")
        return im

    # Side: fuselage top/bottom red, fin blue, canopy green.
    im = tile(side["mask"])
    d = ImageDraw.Draw(im)
    s, c0, r0 = side["scale"], side["c0"], side["rowDatum"]
    P = lambda x, z: (c0 + (L / 2 - x) / s, r0 - z / s)
    for key, col in (("top", (220, 0, 0)), ("bottom", (220, 0, 0))):
        d.line([P(*p) for p in res["fuselage"][key]], fill=col, width=2)
    d.line([P(*p) for p in res["fin"]], fill=(0, 0, 220), width=2)
    if res["canopy"]:
        d.line([P(*p) for p in res["canopy"]["top"]], fill=(0, 160, 0), width=2)
    tiles.append(im)
    # Top: plan red, wing and tail blue (both halves).
    im = tile(top["mask"])
    d = ImageDraw.Draw(im)
    sx, sy, cc, r0 = top["scaleX"], top["scaleY"], top["centre"], top["r0"]
    T = lambda x, y: (cc + y / sy, r0 + (L / 2 - x) / sx)
    for sgn in (-1, 1):
        d.line([T(x, sgn * y) for x, y in res["fuselage"]["plan"]], fill=(220, 0, 0), width=2)
        for key in ("wing", "tail"):
            if res[key]:
                d.line([T(x, sgn * y) for x, y in res[key]], fill=(0, 0, 220), width=2)
    tiles.append(im)
    if front:
        im = tile(front["mask"])
        d = ImageDraw.Draw(im)
        s, cc, rb = front["scale"], front["cc"], front["rb"]
        z0 = front["zOf"](0)
        F = lambda y, z: (cc + y / s, (z0 - z) / s)
        for sgn in (-1, 1):
            d.line([F(sgn * y, z) for y, z in res["front"]["wingMid"]], fill=(0, 0, 220), width=2)
        if res["front"]["tailZ"] is not None:
            t = res["front"]["tailZ"]
            half = max([p[1] for p in res["tail"]], default=0)
            d.line([F(-half, t), F(half, t)], fill=(0, 160, 0), width=2)
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
