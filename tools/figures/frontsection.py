"""
A body's cross-section from the head-on view of a digitised three-view, as the `section` / `frontW` fields of a
drawn outline (`Drawn` in src/figures/specs/aircraft.ts, `Body` in src/figures/air.ts) take it.

USAGE (from the repo root, on the JSON that tools/figures/threeview.py wrote):

    python -I tools/figures/frontsection.py OUTDIR/NAME.json

The head-on view's half width per height along the body's middle run (threeview.py's `front.section`) is kept
between the deepest station's belly and the highest point of the deck (the canopy is a glass body of its own),
rows as wide as the wing's root or the tailplane seen behind are dropped, and the rest is binned into ten bands
of height. Prints the section as [height -1 (bottom) .. 1 (top), half width as a share of the greatest] and
`frontW`, the body's greatest half width head on: a plan wider than that is the wing's root fillet or a
radiator seen from above (the builder cuts the plan to it).

Check the result on the drawing: a band can still catch a radiator, a gear fairing or a wing root.

MIT licence, part of 3DHeat. No drawing data lives here.
"""

from __future__ import annotations

import json
import sys

import numpy as np


def interp(poly: np.ndarray, xs: np.ndarray) -> np.ndarray:
    p = poly[np.argsort(poly[:, 0])]
    return np.interp(xs, p[:, 0], p[:, 1])


def section(d: dict, bands: int = 10) -> tuple[list[list[float]], float]:
    f = d["fuselage"]
    top, bot = np.array(f["top"]), np.array(f["bottom"])
    xs = np.linspace(max(top[:, 0].min(), bot[:, 0].min()), min(top[:, 0].max(), bot[:, 0].max()), 200)
    t, b = interp(top, xs), interp(bot, xs)
    k = int(np.argmax(t - b))
    zt, zb = float(t.max()), float(b[k])
    zc, zh = (zt + zb) / 2, (zt - zb) / 2
    w_plan = float(np.array(f["plan"])[:, 1].max())
    sec = np.array(d["front"]["section"])
    sec = sec[(sec[:, 0] <= zt + 0.02) & (sec[:, 0] >= zb - 0.02)]
    med = float(np.median(sec[:, 1]))
    sec = sec[sec[:, 1] <= max(w_plan * 1.05, med * 1.25)]
    widest = float(sec[:, 1].max())
    v, u = (sec[:, 0] - zc) / zh, sec[:, 1] / widest
    edges = np.linspace(-1, 1, bands + 1)
    out = []
    for a, c in zip(edges[:-1], edges[1:]):
        m = (v >= a) & (v < c)
        if m.any():
            out.append([round(float((a + c) / 2), 2), float(np.median(u[m]))])
    # The widest band is the body's greatest width: one stray row does not set it.
    peak = max(q[1] for q in out)
    out = [[a, round(c / peak, 2)] for a, c in out]
    out = [[-1, out[0][1]]] + out + [[1, out[-1][1]]]
    return out, round(widest * peak, 3)


def main() -> None:
    d = json.load(open(sys.argv[1]))
    sec, w = section(d)
    pts = ", ".join(f"[{a:g}, {c:g}]" for a, c in sec)
    print(f"section: [{pts}], frontW: {w},")


if __name__ == "__main__":
    main()
