"""
Ship ruler: lays a metric grid over a broadside photo or side-view drawing of a
ship, so its deck line, deckhouses, funnels and masts can be read off in the
figure specs' own coordinates (forward from the ship's middle, up from the
waterline; metres).

    python -I tools/figures/ship_ruler.py IMAGE --bow X,Y --stern X,Y --length L [--crop x0,y0,x1,y1] [--out OUT] [--step 5] [--zoom 2]

--bow / --stern: the stem and the stern at the waterline (image pixels, before
the crop). The waterline between them is levelled, the length scales both axes
(a broadside view: the same scale up as along). The grid is drawn every
`step` metres along (labelled with the spec's x: forward of the middle) and
every metre up (labelled every 5 m).

Only for drawings and photos whose licence allows it (see
src/figures/specs/sources.md); the image itself stays out of the repo.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw


def ends(im: Image.Image, box: list[int], right: bool) -> tuple[float, float, float, float]:
    """A drawn profile's waterline ends: the lowest dark row (the keel line drawn at the waterline) and the
    furthest dark pixels along the band just above it."""
    box = [max(0, box[0]), max(0, box[1]), min(im.width, box[2]), min(im.height, box[3])]
    g = im.convert("L").crop(tuple(box))
    w, h = g.size
    px = g.load()
    dark = [[px[x, y] < 128 for x in range(w)] for y in range(h)]
    rows = [y for y in range(h) if sum(dark[y]) > w * 0.25]
    yb = max(rows)
    # The stem and the stern overhang the waterline: the ends over the hull's depth (the lowest third of the box).
    band = [x for y in range(max(0, yb - h // 3), yb + 1) for x in range(w) if dark[y][x]]
    x0, x1 = min(band), max(band)
    b, s = (x1, x0) if right else (x0, x1)
    return b + box[0], yb + box[1], s + box[0], yb + box[1]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--bow", default="")
    ap.add_argument("--stern", default="")
    ap.add_argument("--auto", default="", help="a drawing: find the hull's ends in this box (x0,y0,x1,y1) from its dark pixels; with --facing")
    ap.add_argument("--facing", default="right", help="with --auto: where the bow points (right or left)")
    ap.add_argument("--length", type=float, required=True)
    ap.add_argument("--crop", default="")
    ap.add_argument("--out", default="")
    ap.add_argument("--step", type=float, default=5)
    ap.add_argument("--zoom", type=float, default=2)
    ap.add_argument("--up", type=float, default=0, help="metres of grid above the waterline (default a third of the length)")
    a = ap.parse_args()
    im = Image.open(a.image).convert("RGB")
    if a.auto:
        bx, by, sx, sy = ends(im, [int(v) for v in a.auto.split(",")], a.facing == "right")
        a.crop = a.crop or ",".join(str(v) for v in (0, 0, im.width, im.height))
        print(f"bow {bx:.0f},{by:.0f} stern {sx:.0f},{sy:.0f}")
    else:
        bx, by = (float(v) for v in a.bow.split(","))
        sx, sy = (float(v) for v in a.stern.split(","))
    # Level the waterline: rotate about the bow so the stern lies on the bow's row.
    ang = math.degrees(math.atan2(by - sy, bx - sx)) if bx > sx else math.degrees(math.atan2(sy - by, sx - bx))
    im = im.rotate(-ang, resample=Image.BICUBIC, center=(bx, by), expand=False, fillcolor=(255, 255, 255))
    span = math.hypot(bx - sx, by - sy)
    ppm = span / a.length
    facing = 1 if bx > sx else -1  # the bow to screen right
    if a.crop:
        x0, y0, x1, y1 = (int(v) for v in a.crop.split(","))
    else:
        up = a.up or a.length / 3
        x0 = int(min(bx, bx - facing * span) - 10 * ppm)
        x1 = int(max(bx, bx - facing * span) + 10 * ppm)
        y0 = int(by - up * ppm)
        y1 = int(by + 3 * ppm)
    im = im.crop((x0, y0, x1, y1))
    z = a.zoom
    im = im.resize((int(im.width * z), int(im.height * z)), Image.LANCZOS)
    dr = ImageDraw.Draw(im)
    mid = bx - facing * span / 2

    def px(xm: float) -> float:
        return (mid + facing * xm * ppm - x0) * z

    def py(zm: float) -> float:
        return (by - zm * ppm - y0) * z

    half = a.length / 2
    k = math.ceil((-half - 10) / a.step)
    while k * a.step <= half + 10:
        xm = k * a.step
        col = (220, 0, 0) if abs(xm) < 1e-6 else (0, 90, 220)
        dr.line([(px(xm), 0), (px(xm), im.height)], fill=col, width=1)
        dr.text((px(xm) + 2, 2), f"{xm:g}", fill=col)
        k += 1
    m = 0
    while py(m) > 0:
        col = (220, 0, 0) if m == 0 else (0, 160, 60) if m % 5 == 0 else (150, 210, 150)
        dr.line([(0, py(m)), (im.width, py(m))], fill=col, width=1)
        if m % 5 == 0:
            dr.text((2, py(m) - 11), f"{m}", fill=col)
        m += 1
    for e in (half, -half):
        dr.line([(px(e), 0), (px(e), im.height)], fill=(220, 0, 0), width=2)
    out = Path(a.out) if a.out else Path(a.image).with_name(Path(a.image).stem + "-ruler.png")
    im.save(out)
    print(out, f"{ppm:.2f} px/m, levelled by {ang:.2f} deg")


if __name__ == "__main__":
    main()
