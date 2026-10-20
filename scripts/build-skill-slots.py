"""Render the three stone socket images used behind skill art."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / 'assets/ui'
COLORS = [(142, 108, 61), (173, 194, 184), (233, 183, 73)]

for level, metal in enumerate(COLORS, 1):
    image = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((3, 3, 92, 92), radius=14, fill=(69, 58, 43),
                           outline=metal, width=5)
    draw.rounded_rectangle((10, 10, 85, 85), radius=9, fill=(22, 44, 42),
                           outline=(103, 135, 106), width=3)
    for offset in range(level):
        x = 25 + offset * 22 - (level - 1) * 11
        draw.polygon([(x, 5), (x + 6, 12), (x, 19), (x - 6, 12)], fill=metal)
        draw.polygon([(x, 76), (x + 6, 83), (x, 90), (x - 6, 83)], fill=metal)
    for x, y in ((8, 8), (88, 8), (8, 88), (88, 88)):
        draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(51, 129, 109))
    image.save(ROOT / f'skill-slot-{level}.png', optimize=True)
