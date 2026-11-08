"""
Measure an armoured vehicle's side, plan and front silhouettes on a recognition drawing, in metres in the ground
figure frame (src/figures/ground.ts: x forward from the hull's middle, up from the ground, out from the centre line),
to write a GroundSpec's outlines from (hull top line, track run, turret profile and plan, widths).

USAGE (from the repo root; run Python isolated, keep the drawing in its own folder outside the repo):

    python -I tools/figures/armourview.py PAGE.png --side X0,Y0,X1,Y1 [--top ...] [--front ...] \
        --length 5.30 [--width 2.87] [--height 2.58] [--nose right] [--top-nose right] --out OUTDIR --name m18

  PAGE      a scan of a recognition drawing: solid dark views with white detail lines, such as the US War
            Department's FM 30-40 Recognition Pictorial Manual on Armored Vehicles (1943-45, public domain). Only use
            drawings whose licence allows it (see src/figures/specs/sources.md).
  --side/--top/--front   pixel boxes of the views (any can be left out).
  --length  the published hull length without the gun, metres: the side and plan views' scale. The hull's ends are
            where the silhouette is at least `--thick` of its tallest column high, so a gun or a machine gun reaching
            past the hull does not count.
  --width   the published width: the front view's scale (default: the side view's scale).
  --height  the published height, printed beside the measured one as a check.
  --nose    which way the vehicle points in the side view (default right, as FM 30-40 draws them); --top-nose for the
            plan view (default the same).
  --stations N   stations along the length (default 48); the front view is measured at N / 2 heights.
  --vfit H  the published height of the drawing's highest point (over a roof machine gun, cupola or sight), metres:
            the side and front views' heights are scaled to it, for drawings not drawn at one scale both ways (FM
            30-40's side and front views stand 7-10 % taller than their own length, width and height figures give).

OUTPUT: NAME.json (every column's envelope and dark runs, metres), NAME.txt (a compact table), NAME.png (the cleaned
views with the measured lines over them, to check by eye).

MIT licence, part of 3DHeat. No drawing data lives here.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi


def box(s: str) -> tuple[int, int, int, int]:
    a = [int(float(v)) for v in s.split(",")]
    return a[0], a[1], a[2], a[3]


def clean(gray: np.ndarray, close: int) -> np.ndarray:
    """The dark silhouette with its white detail lines closed and holes filled; specks, captions and dimension arrows
    (parts under a fiftieth of the largest) left out."""
    dark = gray < 128
    if close > 1:
        dark = ndi.binary_closing(dark, structure=np.ones((close, close)), iterations=1)
    dark = ndi.binary_fill_holes(dark)
    lab, n = ndi.label(dark)
    if n == 0:
        raise SystemExit("no silhouette found in a view box")
    sizes = ndi.sum(dark, lab, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * 0.02]
    return np.isin(lab, keep)


def runs_of(col: np.ndarray) -> list[tuple[int, int]]:
    d = np.diff(np.concatenate([[0], col.astype(np.int8), [0]]))
    return list(zip(np.where(d == 1)[0].tolist(), (np.where(d == -1)[0] - 1).tolist()))


def body_span(m: np.ndarray, thick: float) -> tuple[int, int]:
    """First and last column where the view is at least `thick` of its tallest column: the hull without the gun."""
    h = m.sum(axis=0)
    cols = np.where(h >= h.max() * thick)[0]
    return int(cols[0]), int(cols[-1])


def squeeze(m: np.ndarray, s: float, vfit: float | None) -> np.ndarray:
    """Heights at their own scale: the view resampled upright so its top stands at the published height `vfit` (its
    width scale `s` metres per pixel)."""
    if not vfit:
        return m
    rows = np.where(m.any(axis=1))[0]
    k = vfit / ((rows[-1] + 0.5 - rows[0]) * s)
    m = np.repeat(m, 8, axis=0)
    return m[np.round(np.arange(0, m.shape[0], 8 / k)).astype(int).clip(0, m.shape[0] - 1)]


def side(m: np.ndarray, length: float, thick: float, n: int, vfit: float | None = None) -> dict:
    c0, c1 = body_span(m, thick)
    s = length / (c1 - c0 + 1)
    m = squeeze(m, s, vfit)
    rows = np.where(m.any(axis=1))[0]
    ground = rows[-1] + 0.5
    mid = (c0 + c1 + 1) / 2
    cols = []
    for c in np.where(m.any(axis=0))[0]:
        r = runs_of(m[:, c])
        cols.append({"x": round((c + 0.5 - mid) * s, 3), "top": round((ground - r[0][0]) * s, 3), "bottom": round((ground - r[-1][1] - 1) * s, 3), "runs": [[round((ground - b - 1) * s, 3), round((ground - a) * s, 3)] for a, b in r]})
    at = np.linspace(-length / 2, length / 2, n + 1)
    xs = np.array([c["x"] for c in cols])
    st = []
    for x in at:
        c = cols[int(np.argmin(np.abs(xs - x)))]
        st.append({"x": round(float(x), 3), "top": c["top"], "bottom": c["bottom"], "runs": c["runs"]})
    full = [cols[0]["x"], cols[-1]["x"]]
    return {"scale": s, "px": (c0, c1, mid, ground), "mask": m, "height": round((ground - rows[0]) * s, 3), "reach": full, "stations": st, "columns": cols}


def plan(m: np.ndarray, length: float, thick: float, n: int) -> dict:
    c0, c1 = body_span(m, thick)
    s = length / (c1 - c0 + 1)
    mid = (c0 + c1 + 1) / 2
    # The centre line: the middle of the rows the hull covers at its widest column.
    widths = m.sum(axis=0)
    r = np.where(m[:, int(np.argmax(widths))])[0]
    centre = (r[0] + r[-1] + 1) / 2
    at = np.linspace(-length / 2, length / 2, n + 1)
    st = []
    for x in at:
        c = int(round(mid + x / s - 0.5))
        c = min(max(c, c0), c1)
        rr = np.where(m[:, c])[0]
        if not rr.size:
            continue
        st.append({"x": round(float(x), 3), "left": round((centre - rr[0]) * s, 3), "right": round((rr[-1] + 1 - centre) * s, 3), "runs": [[round((a - centre) * s, 3), round((b + 1 - centre) * s, 3)] for a, b in runs_of(m[:, c])]})
    return {"scale": s, "px": (c0, c1, mid, centre), "width": round(len(r) * s, 3), "stations": st}


def front(m: np.ndarray, scale: float, width: float | None, n: int, vfit: float | None = None) -> dict:
    # The widest row is the tracks' outer faces (or the fenders): the published width.
    w = m.sum(axis=1)
    s = width / w.max() if width else scale
    m = squeeze(m, s, vfit)
    w = m.sum(axis=1)
    cols = np.where(m.any(axis=0))[0]
    rows = np.where(m.any(axis=1))[0]
    ground = rows[-1] + 0.5
    rw = np.where(m[int(np.argmax(w))])[0]
    centre = (rw[0] + rw[-1] + 1) / 2
    hs = np.linspace(0, (ground - rows[0]) * s, n + 1)
    st = []
    for h in hs:
        r = int(round(ground - h / s - 0.5))
        r = min(max(r, rows[0]), rows[-1])
        cc = np.where(m[r])[0]
        if not cc.size:
            continue
        st.append({"up": round(float(h), 3), "left": round((centre - cc[0]) * s, 3), "right": round((cc[-1] + 1 - centre) * s, 3), "runs": [[round((a - centre) * s, 3), round((b + 1 - centre) * s, 3)] for a, b in runs_of(m[r])]})
    return {"scale": s, "px": (centre, ground), "mask": m, "height": round((ground - rows[0]) * s, 3), "width": round((cols[-1] - cols[0] + 1) * s, 3), "stations": st}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("page")
    ap.add_argument("--side", type=box)
    ap.add_argument("--top", type=box)
    ap.add_argument("--front", type=box)
    ap.add_argument("--length", type=float, required=True)
    ap.add_argument("--width", type=float)
    ap.add_argument("--height", type=float)
    ap.add_argument("--nose", default="right")
    ap.add_argument("--top-nose", default=None)
    ap.add_argument("--thick", type=float, default=0.18)
    ap.add_argument("--close", type=int, default=5)
    ap.add_argument("--stations", type=int, default=48)
    ap.add_argument("--vfit", type=float)
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", required=True)
    a = ap.parse_args()
    gray = np.asarray(Image.open(a.page).convert("L"), dtype=np.float32)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    res: dict = {"name": a.name, "length": a.length, "width": a.width, "height": a.height}
    lines: list[str] = []
    shots = []
    sc = None
    if a.side:
        x0, y0, x1, y1 = a.side
        m = clean(gray[y0:y1, x0:x1], a.close)
        if a.nose == "left":
            m = m[:, ::-1]
        sv = side(m, a.length, a.thick, a.stations, a.vfit)
        m = sv.pop("mask")
        sc = sv["scale"]
        res["side"] = {k: v for k, v in sv.items() if k != "px"}
        lines.append(f"SIDE  height {sv['height']:.2f} (published {a.height})  reach {sv['reach'][0]:.2f}..{sv['reach'][1]:.2f}")
        lines.append("  x      top    bottom  runs(lo..hi)")
        for st in sv["stations"]:
            lines.append(f"  {st['x']:6.2f} {st['top']:6.2f} {st['bottom']:6.2f}  " + " ".join(f"{lo:.2f}..{hi:.2f}" for lo, hi in st["runs"]))
        shots.append(("side", m, sv))
    if a.top:
        x0, y0, x1, y1 = a.top
        m = clean(gray[y0:y1, x0:x1], a.close)
        if (a.top_nose or a.nose) == "left":
            m = m[:, ::-1]
        pv = plan(m, a.length, a.thick, a.stations)
        res["top"] = {k: v for k, v in pv.items() if k != "px"}
        lines.append(f"TOP  width {pv['width']:.2f} (published {a.width})")
        lines.append("  x      left   right  runs")
        for st in pv["stations"]:
            lines.append(f"  {st['x']:6.2f} {st['left']:6.2f} {st['right']:6.2f}  " + " ".join(f"{lo:.2f}..{hi:.2f}" for lo, hi in st["runs"]))
        shots.append(("top", m, pv))
    if a.front:
        x0, y0, x1, y1 = a.front
        m = clean(gray[y0:y1, x0:x1], a.close)
        fv = front(m, sc or 1.0, a.width, a.stations // 2, a.vfit)
        m = fv.pop("mask")
        res["front"] = {k: v for k, v in fv.items() if k != "px"}
        lines.append(f"FRONT  height {fv['height']:.2f}  width {fv['width']:.2f}  (scale {fv['scale'] * 1000:.2f} mm/px; side {(sc or 0) * 1000:.2f})")
        lines.append("  up     left   right  runs")
        for st in fv["stations"]:
            lines.append(f"  {st['up']:6.2f} {st['left']:6.2f} {st['right']:6.2f}  " + " ".join(f"{lo:.2f}..{hi:.2f}" for lo, hi in st["runs"]))
        shots.append(("front", m, fv))
    (out / f"{a.name}.json").write_text(json.dumps(res, indent=1))
    (out / f"{a.name}.txt").write_text("\n".join(lines) + "\n")
    # The cleaned views side by side, the hull's ends and the ground (or centre line) marked.
    w = sum(m.shape[1] for _, m, _ in shots) + 20 * len(shots)
    h = max(m.shape[0] for _, m, _ in shots)
    img = Image.new("RGB", (w, h), "white")
    d = ImageDraw.Draw(img)
    x = 0
    for kind, m, v in shots:
        rgb = np.where(m[..., None], np.array([60, 60, 60], np.uint8), np.array([255, 255, 255], np.uint8))
        img.paste(Image.fromarray(rgb.astype(np.uint8)), (x, 0))
        p = v["px"]
        if kind in ("side", "top"):
            for c in p[:2]:
                d.line([(x + c, 0), (x + c, m.shape[0])], fill=(230, 80, 0))
            d.line([(x, p[3]), (x + m.shape[1], p[3])], fill=(0, 120, 230))
        else:
            d.line([(x + p[0], 0), (x + p[0], m.shape[0])], fill=(230, 80, 0))
            d.line([(x, p[1]), (x + m.shape[1], p[1])], fill=(0, 120, 230))
        x += m.shape[1] + 20
    img.save(out / f"{a.name}.png")
    print("\n".join(lines[:1] + [ln for ln in lines if ln.startswith(("TOP", "FRONT"))]))


if __name__ == "__main__":
    main()
