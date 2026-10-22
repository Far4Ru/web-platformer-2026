"""Cap oversized runtime art while keeping roughly 2x display resolution."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SIZES = {
    'assets/images/earth.png': 256,
    'assets/images/ruins-earth.png': 512,
    'assets/images/temple-earth.png': 512,
    'assets/images/swamp-earth.webp': 512,
    'assets/sprites/objects/moss-platform-base.png': 1086,
    'assets/sprites/objects/ice-platform-base.png': 952,
    'assets/sprites/objects/swamp-platform-base.png': 1086,
    'assets/sprites/objects/ruins-platform-base.png': 1086,
    'assets/sprites/objects/temple-platform-base.png': 1086,
    'assets/sprites/decor/surface-details.png': 768,
    'assets/sprites/decor/grass-wind-v3.png': 600,
    'assets/sprites/decor/vine-wind-v2.png': 1200,
    'assets/ui/ancient-trophy.png': 128,
    'assets/ui/maya-button.png': 768,
}
SIZES.update({str(path.relative_to(ROOT)).replace('\\', '/'): 512
              for path in (ROOT / 'assets/ui').glob('card-art-*.png')})
SIZES.update({str(path.relative_to(ROOT)).replace('\\', '/'): 384
              for path in (ROOT / 'assets/ui').glob('victory-hero-??.png')})

for name, max_width in SIZES.items():
    file = ROOT / name
    with Image.open(file) as source:
        if source.width <= max_width:
            continue
        target_height = round(source.height * max_width / source.width)
        resized = source.resize((max_width, target_height), Image.Resampling.LANCZOS)
        old_size = file.stat().st_size
        output = file.with_name(file.stem + '.resized' + file.suffix)
        if file.suffix == '.webp':
            resized.save(output, 'WEBP', quality=95, method=6)
        else:
            resized.save(output, 'PNG', optimize=True)
    output.replace(file)
    print(f'{name}: {old_size:,} -> {file.stat().st_size:,} bytes '
          f'({max_width} x {target_height})')
