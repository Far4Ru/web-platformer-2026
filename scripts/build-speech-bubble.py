"""Build the four reusable speech bubble pieces (requires Pillow)."""

from pathlib import Path

from PIL import Image, ImageDraw


OUT = Path(__file__).resolve().parents[1] / "assets" / "ui"

panel = Image.new("RGBA", (160, 48))
draw = ImageDraw.Draw(panel)
draw.rounded_rectangle((0, 2, 159, 47), radius=9, fill="#382819")
draw.rounded_rectangle((2, 3, 157, 44), radius=7, fill="#b87939")
draw.rounded_rectangle((4, 5, 155, 42), radius=6, fill="#f9e6b9")
draw.line((20, 8, 139, 8), fill="#e4c891", width=1)
draw.line((20, 39, 139, 39), fill="#e4c891", width=1)
for x in (14, 145):
    draw.polygon(((x, 8), (x + 3, 11), (x, 14), (x - 3, 11)), fill="#9c6530")
    draw.ellipse((x - 1, 10, x + 1, 12), fill="#f4d696")

for name, box in {
    "speech_left.png": (0, 0, 24, 48),
    "speech_middle.png": (76, 0, 84, 48),
    "speech_right.png": (136, 0, 160, 48),
}.items():
    panel.crop(box).save(OUT / name)

connector = Image.new("RGBA", (22, 22))
draw = ImageDraw.Draw(connector)
draw.ellipse((0, 0, 21, 21), fill="#382819")
draw.ellipse((2, 2, 19, 19), fill="#b87939")
draw.ellipse((4, 4, 17, 17), fill="#f9e6b9")
connector.save(OUT / "speech_connector.png")

# Key prompts use the same brown ink as the dialogue text.
scale = 4
key = Image.new("RGBA", (64 * scale, 64 * scale))
draw = ImageDraw.Draw(key)
draw.rounded_rectangle((7 * scale, 7 * scale, 57 * scale, 57 * scale),
                       radius=10 * scale, fill="#b87939")
draw.rounded_rectangle((10 * scale, 10 * scale, 54 * scale, 54 * scale),
                       radius=7 * scale, fill="#e8ce99")
arrow = [(19, 32), (37, 18), (37, 26), (45, 26),
         (45, 38), (37, 38), (37, 46)]
draw.polygon([(x * scale, y * scale) for x, y in arrow], fill="#44301e")
left = key.resize((64, 64), Image.Resampling.LANCZOS)
left.save(OUT / "speech_key_left.png")
left.transpose(Image.Transpose.FLIP_LEFT_RIGHT).save(OUT / "speech_key_right.png")
left.rotate(-90).save(OUT / "speech_key_up.png")
