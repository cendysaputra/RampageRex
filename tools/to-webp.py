# Konversi WebP
import json
import re
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "assets"
# Dilewati
SKIPPED = re.compile(r"(^ui/|(master|sheet|portrait)\.png$)")
# Sampul menu
EXTRA = ["characters/rex/master.png"]


def main():
    manifest = json.loads((ASSETS / "manifest.json").read_text(encoding="utf-8"))
    names = [name for name in manifest["assets"] if not SKIPPED.search(name)] + EXTRA
    sources = [ASSETS / name for name in names if (ASSETS / name).exists()]
    before = after = 0
    for source in sources:
        target = source.with_suffix(".webp")
        with Image.open(source) as image:
            image.save(target, "WEBP", quality=90, method=6)
        before += source.stat().st_size
        after += target.stat().st_size
    print(f"{len(sources)} files: {before / 1e6:.1f} MB PNG -> {after / 1e6:.1f} MB WebP")


if __name__ == "__main__":
    main()
