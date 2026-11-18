"""Convert the PNG art the game loads at runtime into WebP.

The PNG files stay in the repo as the source art. The game reads the WebP
copies because assets/manifest.json sets "imageFormat": "webp".

Run from the repo root after adding or changing art:

    python tools/to-webp.py

Needs Pillow (pip install pillow).
"""
import json
import re
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "assets"
# Reference sheets and UI icons are never drawn on the canvas.
SKIPPED = re.compile(r"(^ui/|(master|sheet|portrait)\.png$)")
# The menu cover uses Rex's master illustration.
EXTRA = ["characters/rex/master.png"]


def main():
    manifest = json.loads((ASSETS / "manifest.json").read_text(encoding="utf-8"))
    names = [name for name in manifest["assets"] if not SKIPPED.search(name)] + EXTRA
    before = after = 0
    for name in names:
        source = ASSETS / name
        target = source.with_suffix(".webp")
        with Image.open(source) as image:
            image.save(target, "WEBP", quality=90, method=6)
        before += source.stat().st_size
        after += target.stat().st_size
    print(f"{len(names)} files: {before / 1e6:.1f} MB PNG -> {after / 1e6:.1f} MB WebP")


if __name__ == "__main__":
    main()
