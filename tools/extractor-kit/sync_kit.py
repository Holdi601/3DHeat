"""
Copy the shared tool app (the window, the command line, updates, the look) into a tool repository.

    python sync_kit.py <repo> [<repo> ...]

Each 3DHeat tool repository keeps its own copy (it must build on its own);
this folder is where the copies come from. A repo's `standalone.json` names
its spec module, and so the package the app goes into.
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parent
BRAND = KIT.parent.parent / "public" / "brand" / "png"  # the 3DHeat logo the window draws (*.png is not kept in tools/)
BRAND_FILES = ("icon-32.png", "icon-64.png", "icon-256.png", "lockup-32.png", "lockup-64.png", "logo-128.png")
FILES = {  # kit path -> repo path ({pkg} = the tool's package)
    "app": "{pkg}/app",
    "tools/build_standalone.py": "tools/build_standalone.py",
    "tests/test_standalone.py": "tests/test_standalone.py",
    "workflows/standalone.yml": ".github/workflows/standalone.yml",
}


def tool_id(repo: Path, pkg: str) -> str:
    import re

    text = (repo / pkg / "standalone_spec.py").read_text(encoding="utf-8")
    m = re.search(r'^\s*id\s*=\s*"([^"]+)"', text, re.M) or re.search(r'^TOOL_ID\s*=\s*"([^"]+)"', text, re.M)
    return m.group(1)


def sync(repo: Path, icons: Path | None = None) -> list[Path]:
    pkg = json.loads((repo / "standalone.json").read_text(encoding="utf-8"))["spec"].split(".")[0]
    written = []
    if icons is not None:  # the tool's own icon set (make_icons.py): app/assets/tool.ico, tool-<size>.png, tool.icns
        tid = tool_id(repo, pkg)
        dest = repo / pkg / "app" / "assets"
        dest.mkdir(parents=True, exist_ok=True)
        for f in sorted(icons.glob(f"{tid}*")):
            rest = f.name[len(tid):]
            if rest in (".ico", ".icns") or (rest.startswith("-") and rest[1:-4].isdigit() and rest.endswith(".png")):
                shutil.copyfile(f, dest / ("tool" + rest))
                written.append(dest / ("tool" + rest))
    for src, dst in FILES.items():
        s, d = KIT / src, repo / dst.format(pkg=pkg)
        if s.is_dir():
            for f in sorted(s.rglob("*")):
                if f.is_file() and "__pycache__" not in f.parts:
                    t = d / f.relative_to(s)
                    t.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(f, t)
                    written.append(t)
        else:
            d.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(s, d)
            written.append(d)
    for name in BRAND_FILES:
        if (BRAND / name).is_file():
            d = repo / pkg / "app" / "assets" / name
            d.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(BRAND / name, d)
            written.append(d)
    return written


if __name__ == "__main__":
    args = sys.argv[1:]
    icons = None
    if "--icons" in args:
        i = args.index("--icons")
        icons = Path(args[i + 1])
        del args[i:i + 2]
    for r in args:
        print(r, len(sync(Path(r), icons)), "files")
