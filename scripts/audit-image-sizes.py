"""List the biggest runtime images and their native pixel dimensions."""

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'assets/json/game.json').read_text(encoding='utf-8'))


def paths(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from paths(item)
    elif isinstance(value, dict):
        if 'base' in value and 'clips' in value:
            for clip in value['clips']:
                yield f"{value['base']}/{clip}.png"
        elif 'sheet' in value:
            yield value['sheet']


rows = []
for source in paths(list(CONFIG['images'].values())):
    file = ROOT / source
    if file.suffix.lower() not in ('.png', '.webp', '.jpg', '.jpeg'):
        continue
    with Image.open(file) as image:
        rows.append((file.stat().st_size, image.width, image.height, source))

for size, width, height, name in sorted(rows, reverse=True)[:50]:
    print(f'{size / 1024 / 1024:5.2f} MiB  {width:5} x {height:<5} {name}')
