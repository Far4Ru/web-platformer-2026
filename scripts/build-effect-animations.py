"""Build four isolated animation frames from each hand-painted effect sprite."""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/sprites/effects'
OUTPUT = ROOT / 'assets/animations/effects'
OUTPUT.mkdir(parents=True, exist_ok=True)
TINTS = {
    'fireball': (255, 152, 61),
    'ice-shard': (121, 231, 255),
    'wooden-arrow': (255, 225, 151),
    'hostile-projectile': (255, 103, 201),
    'sword-slash': (255, 221, 142),
    'healing-beam': (255, 208, 104),
}

for name, tint in TINTS.items():
    original = Image.open(SOURCE / f'{name}.png').convert('RGBA')
    width, height = original.size
    sheet = Image.new('RGBA', (width * 4, height))
    for index, scale in enumerate((0.92, 0.98, 1, 0.96)):
        frame = Image.new('RGBA', (width, height))
        sprite = original.copy()
        rgb = Image.new('RGBA', sprite.size, tint + (0,))
        rgb.putalpha(sprite.getchannel('A').point(lambda a: int(a * 0.22)))
        sprite = Image.alpha_composite(sprite, rgb)
        sprite = ImageEnhance.Brightness(sprite).enhance((0.85, 1.08, 1.22, 1.03)[index])
        sprite = sprite.resize((int(width * scale), int(height * scale)), Image.Resampling.LANCZOS)
        glow = sprite.filter(ImageFilter.GaussianBlur(9))
        glow.putalpha(glow.getchannel('A').point(lambda a: int(a * 0.28)))
        x = (width - sprite.width) // 2
        y = (height - sprite.height) // 2
        frame.alpha_composite(glow, (x, y))
        frame.alpha_composite(sprite, (x, y))
        sheet.alpha_composite(frame, (index * width, 0))
    sheet.save(OUTPUT / f'{name}.png', optimize=True)
    atlas = {'frames': [dict(x=index * width, y=0, w=width, h=height)
                        for index in range(4)],
             'animations': {name: list(range(4))}}
    (OUTPUT / f'{name}.json').write_text(json.dumps(atlas, indent=2), encoding='utf-8')
