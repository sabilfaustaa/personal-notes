"""Generate PWA PNG icons for Notes (Apple-Notes-style yellow note)."""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
os.makedirs(OUT, exist_ok=True)

TOP = (255, 226, 122)      # #FFE27A
BOTTOM = (247, 201, 72)    # #F7C948
WHITE = (255, 255, 255)
BAND = (252, 233, 166)     # #FCE9A6
LINE = (201, 162, 39)      # #C9A227


def vgradient(size):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        r = int(TOP[0] + (BOTTOM[0] - TOP[0]) * t)
        g = int(TOP[1] + (BOTTOM[1] - TOP[1]) * t)
        b = int(TOP[2] + (BOTTOM[2] - TOP[2]) * t)
        for x in range(size):
            px[x, y] = (r, g, b)
    return img.convert("RGBA")


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def draw_note(draw, size, card):
    x0, y0, x1, y1 = card
    w = x1 - x0
    r = int(w * 0.10)
    # card
    draw.rounded_rectangle(card, radius=r, fill=WHITE)
    # header band (top portion clipped to rounded top via overlay rect)
    band_h = int((y1 - y0) * 0.20)
    draw.rounded_rectangle([x0, y0, x1, y0 + band_h * 2], radius=r, fill=BAND)
    draw.rectangle([x0, y0 + band_h, x1, y1], fill=WHITE)
    # lines
    lx0 = x0 + int(w * 0.16)
    lx1 = x1 - int(w * 0.16)
    lw = max(2, int(w * 0.055))
    gap = int((y1 - y0) * 0.16)
    ys = y0 + band_h + gap
    for i in range(3):
        y = ys + i * gap
        end = lx1 if i < 2 else lx0 + int((lx1 - lx0) * 0.62)
        draw.line([(lx0, y), (end, y)], fill=LINE, width=lw)


def make_standard(size):
    img = vgradient(size)
    img.putalpha(rounded_mask(size, int(size * 0.22)))
    d = ImageDraw.Draw(img)
    pad = int(size * 0.22)
    top = int(size * 0.16)
    draw_note(d, size, (pad, top, size - pad, size - int(size * 0.16)))
    return img


def make_maskable(size):
    img = vgradient(size)  # full bleed, no rounding (safe zone aware)
    d = ImageDraw.Draw(img)
    # keep note inside ~64% safe zone
    inset = int(size * 0.30)
    top = int(size * 0.26)
    draw_note(d, size, (inset, top, size - inset, size - int(size * 0.26)))
    return img


make_standard(192).save(os.path.join(OUT, "icon-192.png"))
make_standard(512).save(os.path.join(OUT, "icon-512.png"))
make_standard(180).save(os.path.join(OUT, "apple-touch-icon.png"))
make_maskable(512).save(os.path.join(OUT, "maskable-512.png"))
make_standard(32).save(os.path.join(OUT, "favicon-32.png"))
print("icons generated in", os.path.abspath(OUT))
