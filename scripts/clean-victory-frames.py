"""Remove sprite-sheet spill that is disconnected from the victory character."""

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]


def largest_component(alpha: Image.Image, threshold: int = 32) -> tuple[set[int], int]:
    width, height = alpha.size
    opaque = bytes(255 if value >= threshold else 0 for value in alpha.tobytes())
    visited = bytearray(width * height)
    largest: set[int] = set()
    component_count = 0

    for start, value in enumerate(opaque):
        if not value or visited[start]:
            continue
        component_count += 1
        visited[start] = 1
        queue = deque([start])
        component: set[int] = set()
        while queue:
            point = queue.popleft()
            component.add(point)
            x, y = point % width, point // width
            for next_y in range(max(0, y - 1), min(height, y + 2)):
                for next_x in range(max(0, x - 1), min(width, x + 2)):
                    neighbor = next_y * width + next_x
                    if opaque[neighbor] and not visited[neighbor]:
                        visited[neighbor] = 1
                        queue.append(neighbor)
        if len(component) > len(largest):
            largest = component
    return largest, component_count


for file in sorted((ROOT / 'assets/ui').glob('victory-hero-??.png')):
    with Image.open(file) as source:
        rgba = source.convert('RGBA')
    alpha = rgba.getchannel('A')
    component, count = largest_component(alpha)
    core = Image.new('L', rgba.size)
    mask = bytearray(rgba.width * rgba.height)
    for point in component:
        mask[point] = 255
    core.putdata(mask)
    # Keep the original antialiased edge around the connected opaque core.
    keep = core.filter(ImageFilter.MaxFilter(5))
    cleaned_alpha = Image.composite(alpha, Image.new('L', rgba.size), keep)
    rgba.putalpha(cleaned_alpha)
    rgba.save(file, 'PNG', optimize=True)
    print(f'{file.name}: kept {len(component):,} pixels; removed {max(0, count - 1)} components')
