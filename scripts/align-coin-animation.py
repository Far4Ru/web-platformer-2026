"""Center each visible coin silhouette within its atlas cell."""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[1] / 'assets/animations/pickups'
image_path = ROOT / 'spin.png'
sheet = Image.open(image_path).convert('RGBA')
frames = json.loads((ROOT / 'spin.json').read_text(encoding='utf-8'))['frames']
aligned = Image.new('RGBA', sheet.size)

for frame in frames:
    x, y, width, height = (frame[key] for key in ('x', 'y', 'w', 'h'))
    cell = sheet.crop((x, y, x + width, y + height))
    box = cell.getchannel('A').point(lambda alpha: 255 if alpha >= 10 else 0).getbbox()
    if box:
        shift_x = round(width / 2 - (box[0] + box[2]) / 2)
        shift_y = round(height / 2 - (box[1] + box[3]) / 2)
        centered = Image.new('RGBA', (width, height))
        centered.alpha_composite(cell, (shift_x, shift_y))
        aligned.alpha_composite(centered, (x, y))
    else:
        aligned.alpha_composite(cell, (x, y))

aligned.save(image_path, optimize=True)
