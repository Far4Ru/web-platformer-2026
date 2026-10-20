"""Build final raster card variants and carved control icons from art sources."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / 'assets/ui'
card = Image.open(ROOT / 'card-base.png').convert('RGBA')
rarities = {
    'common': (168, 196, 201), 'rare': (92, 188, 234),
    'epic': (183, 136, 231), 'legendary': (244, 193, 73),
    'hell': (232, 91, 100),
}
for name, rgb in rarities.items():
    overlay = Image.new('RGBA', card.size, rgb + (0,))
    alpha = card.getchannel('A').point(lambda value: round(value * 0.1))
    overlay.putalpha(alpha)
    art = Image.alpha_composite(card, overlay)
    # The crest gem carries the rarity hue, leaving the parchment readable.
    gem = Image.new('RGBA', art.size, rgb + (0,))
    mask = Image.new('L', art.size)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((art.width * .475, art.height * .005,
                            art.width * .525, art.height * .075), radius=8, fill=95)
    gem.putalpha(mask)
    art = Image.alpha_composite(art, gem)
    art.resize((464, 504), Image.Resampling.LANCZOS).save(
        ROOT / f'card-{name}.png', optimize=True)

medallion = Image.open(ROOT / 'medallion-base.png').convert('RGBA').resize((512, 512),
    Image.Resampling.LANCZOS)

def save_icon(name, mask):
    mask = mask.resize((230, 230), Image.Resampling.LANCZOS)
    full = Image.new('L', medallion.size)
    full.paste(mask, (141, 141))
    shadow = Image.new('RGBA', medallion.size, (42, 26, 15, 0))
    shadow.putalpha(full.filter(ImageFilter.GaussianBlur(4)))
    gold = Image.new('RGBA', medallion.size, (255, 223, 147, 0))
    gold.putalpha(full)
    result = Image.alpha_composite(medallion, shadow)
    result = Image.alpha_composite(result, gold)
    result.resize((128, 128), Image.Resampling.LANCZOS).save(
        ROOT / f'control-{name}.png', optimize=True)

for name in ('pause', 'play', 'restart', 'sound', 'sound-off'):
    original = Image.open(ROOT / f'icon-{name}.png').convert('RGBA')
    crop = original.crop((15, 15, 49, 49))
    pixels = crop.load()
    mask = Image.new('L', crop.size)
    result = mask.load()
    for y in range(crop.height):
        for x in range(crop.width):
            red, green, blue, alpha = pixels[x, y]
            result[x, y] = alpha if red < 205 and green < 155 and blue < 115 else 0
    save_icon(name, mask)

for name in ('left', 'right', 'up'):
    mask = Image.new('L', (100, 100))
    draw = ImageDraw.Draw(mask)
    if name == 'left':
        shape = [(20, 50), (59, 16), (59, 37), (81, 37),
                 (81, 63), (59, 63), (59, 84)]
    elif name == 'right':
        shape = [(80, 50), (41, 16), (41, 37), (19, 37),
                 (19, 63), (41, 63), (41, 84)]
    else:
        shape = [(50, 16), (84, 58), (63, 58), (63, 82),
                 (37, 82), (37, 58), (16, 58)]
    draw.polygon(shape, fill=255)
    save_icon(name, mask)
