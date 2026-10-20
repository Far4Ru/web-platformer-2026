"""Remove known neighbouring-cell fragments from exported animation clips."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'assets/animations'
# Clip, frame index, rectangle in that frame. These regions are detached
# remnants of adjacent atlas cells, confirmed against the source sheet.
REPAIRS = [
    ('explorer/idle', 0, (334, 375, 362, 475)),
    ('explorer-actions/fall', 0, (315, 500, 362, 555)),
    ('explorer-actions/victory', 0, (0, 230, 52, 438)),
    ('guardian/walk', 0, (500, 410, 543, 540)),
    ('guardian/walk', 1, (450, 195, 543, 540)),
    ('pickups/spin', 2, (240, 0, 362, 362)),
]

for name, frame, (left, top, right, bottom) in REPAIRS:
    path = ROOT / f'{name}.png'
    image = Image.open(path).convert('RGBA')
    frame_width = image.width // (2 if name in ('guardian/walk',) else
                                  4 if name == 'pickups/spin' else 1)
    x = frame * frame_width
    image.paste((0, 0, 0, 0), (x + left, top, x + right, bottom))
    image.save(path, optimize=True)
