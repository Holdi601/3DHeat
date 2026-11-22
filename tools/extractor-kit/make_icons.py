"""
The 3DHeat tool icons: the 3DHeat cube with a small text badge naming the game.

    python make_icons.py --font Montserrat-wght.ttf --base icon-256.png --out <folder> [--sheet sheet.png]

Text badges in 3DHeat's own typeface (Montserrat, SIL Open Font License) and
colours; never a game's logo or symbol. At 16 px the badge alone (its letters
on its colour) stands for the tool, as a cube with a badge is unreadable there.
Writes per tool: <id>.ico (16-256), <id>.icns, <id>-<size>.png (16, 24, 32, 48,
64, 128, 256).
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# id -> (badge text, text at 16 px, badge colour, text colour)
BADGES: dict[str, tuple[str, str, str, str]] = {
    "heat3d-warthunder": ("WT", "WT", "#d8431f", "#ffffff"),
    "heat3d-dcs": ("DCS", "DC", "#2f6fd6", "#ffffff"),
    "heat3d-battlefield": ("BF", "BF", "#f08a00", "#14110a"),
    "heat3d-cs2": ("CS2", "CS", "#e8b511", "#16130a"),
    "heat3d-r6-maps": ("R6M", "R6", "#5a6b82", "#ffffff"),
    "heat3d-r6": ("R6", "R6", "#2b3646", "#ffffff"),
    "heat3d-reforger": ("RF", "RF", "#6b8e23", "#ffffff"),
    "heat3d-arma3": ("A3", "A3", "#4f6b3a", "#ffffff"),
    "heat3d-dota-maps": ("DOTA", "DM", "#b3261e", "#ffffff"),
    "heat3d-dota-replay": ("D2R", "D2", "#7a1a14", "#ffffff"),
    "heat3d-forza": ("FH", "FH", "#e0218a", "#ffffff"),
    "heat3d-wows": ("WOWS", "WS", "#0f7c8c", "#ffffff"),
    "heat3d-wot": ("WOT", "WO", "#8a5a2b", "#ffffff"),
    "heat3d-acrally": ("ACR", "AR", "#c0392b", "#ffffff"),
    "heat3d-assettocorsa": ("AC", "AC", "#ad1457", "#ffffff"),
    "heat3d-beamng": ("BNG", "BN", "#f36f21", "#14110a"),
    "heat3d-il2": ("IL2", "IL", "#5b7c99", "#ffffff"),
    "heat3d-riot": ("LOL", "LO", "#c89b3c", "#14110a"),
    "heat3d-squad": ("SQ", "SQ", "#3d4a2a", "#ffffff"),
    "heat3d-gamefiles": ("GF", "GF", "#6d4bd8", "#ffffff"),
    "heat3d-gamecapture": ("LAP", "LP", "#14a37f", "#ffffff"),
    "heat3d-watcher": ("REC", "RC", "#e5383b", "#ffffff"),
}
SIZES = (16, 20, 24, 32, 40, 48, 64, 128, 256)
PNG_SIZES = (16, 24, 32, 48, 64, 128, 256)


def font(path: str, px: float) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(path, max(6, int(px)))
    try:
        f.set_variation_by_axes([800])  # Montserrat ExtraBold, as the variable font allows
    except Exception:
        pass
    return f


def fit_text(draw, text: str, fpath: str, w: float, h: float) -> ImageFont.FreeTypeFont:
    size = h
    while size > 5:
        f = font(fpath, size)
        l, t, r, b = draw.textbbox((0, 0), text, font=f)
        if r - l <= w and b - t <= h:
            return f
        size -= 1
    return font(fpath, 5)


def draw_badge(img: Image.Image, box: tuple[float, float, float, float], text: str, fill: str, ink: str,
               fpath: str, outline: str | None = None) -> None:
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = box
    h = y1 - y0
    d.rounded_rectangle(box, radius=h * 0.28, fill=fill, outline=outline, width=max(1, int(h * 0.07)) if outline else 0)
    pad_x, pad_y = h * 0.16, h * 0.2
    f = fit_text(d, text, fpath, (x1 - x0) - 2 * pad_x, h - 2 * pad_y)
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    d.text(((x0 + x1) / 2 - (l + r) / 2, (y0 + y1) / 2 - (t + b) / 2), text, font=f, fill=ink)


def icon(base: Image.Image, size: int, badge: tuple[str, str, str, str], fpath: str) -> Image.Image:
    text, small, fill, ink = badge
    s = 4  # draw large, then scale down (smooth edges)
    big = size * s
    if size <= 16:
        img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
        draw_badge(img, (0, big * 0.1, big, big * 0.9), small, fill, ink, fpath)
        return img.resize((size, size), Image.LANCZOS)
    img = base.resize((big, big), Image.LANCZOS)
    bw = big * (0.66 if len(text) >= 3 else 0.5)
    bh = big * 0.36
    x1, y1 = big, big
    draw_badge(img, (x1 - bw, y1 - bh, x1, y1), text if size >= 24 else small, fill, ink, fpath,
               outline="#0b0f15")
    return img.resize((size, size), Image.LANCZOS)


def build(base_path: Path, fpath: str, out: Path, ids=None) -> dict[str, dict[int, Image.Image]]:
    base = Image.open(base_path).convert("RGBA")
    out.mkdir(parents=True, exist_ok=True)
    made = {}
    for tool_id, badge in BADGES.items():
        if ids and tool_id not in ids:
            continue
        imgs = {s: icon(base, s, badge, fpath) for s in SIZES}
        for s in PNG_SIZES:
            imgs[s].save(out / f"{tool_id}-{s}.png", optimize=True)
        imgs[256].save(out / f"{tool_id}.ico", sizes=[(s, s) for s in SIZES], append_images=[imgs[s] for s in SIZES[:-1]])
        big = icon(base, 512, badge, fpath)
        big.save(out / f"{tool_id}.icns")
        made[tool_id] = imgs
    return made


def sheet(made: dict[str, dict[int, Image.Image]], path: Path) -> None:
    sizes = (16, 32, 64, 256)
    cols = 3
    cell_w = sum(sizes) + 16 * len(sizes) + 16
    cell_h = 256 + 24
    rows = (len(made) + cols - 1) // cols
    sh = Image.new("RGB", (cols * cell_w, rows * cell_h), "#07090d")
    for n, (tool_id, imgs) in enumerate(made.items()):
        x = (n % cols) * cell_w + 16
        y = (n // cols) * cell_h + 12
        for s in sizes:
            sh.paste(imgs[s], (x, y + 256 - s), imgs[s])
            x += s + 16
    sh.save(path)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--font", required=True)
    ap.add_argument("--base", required=True, help="the 3DHeat icon, 256 px PNG (public/brand/png/icon-256.png)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--sheet")
    ap.add_argument("ids", nargs="*")
    a = ap.parse_args()
    made = build(Path(a.base), a.font, Path(a.out), a.ids)
    if a.sheet:
        sheet(made, Path(a.sheet))
    print(len(made), "icon sets written to", a.out)
