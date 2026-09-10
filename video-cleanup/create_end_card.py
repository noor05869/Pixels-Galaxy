from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "video-cleanup" / "ku-string-end-card.png"
PRODUCT = ROOT / "public" / "photos" / "p-4.jpg"
LOGO = ROOT / "public" / "brand" / "pixels-galaxy-logo.png"

W, H = 1080, 1920


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "arialbd.ttf" if bold else "arial.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    scale = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - size[0]) // 2
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def centered(draw: ImageDraw.ImageDraw, text: str, y: int, text_font: ImageFont.FreeTypeFont, fill: str, stroke: int = 0) -> None:
    box = draw.textbbox((0, 0), text, font=text_font, stroke_width=stroke)
    x = (W - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=text_font, fill=fill, stroke_width=stroke, stroke_fill="#071326")


product = Image.open(PRODUCT).convert("RGB")
background = fit_cover(product, (W, H)).filter(ImageFilter.GaussianBlur(32))
background = ImageEnhance.Brightness(background).enhance(0.28)

card = background.convert("RGBA")
overlay = Image.new("RGBA", (W, H), (4, 14, 35, 92))
card = Image.alpha_composite(card, overlay)
draw = ImageDraw.Draw(card)

# Neon border and soft glow.
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
for width, alpha in ((30, 20), (18, 35), (7, 210)):
    glow_draw.rounded_rectangle((55, 70, W - 55, H - 70), 38, outline=(94, 231, 239, alpha), width=width)
card = Image.alpha_composite(card, glow.filter(ImageFilter.GaussianBlur(7)))
draw = ImageDraw.Draw(card)

# Brand logo on its native dark background.
logo = Image.open(LOGO).convert("RGBA")
logo.thumbnail((610, 205), Image.Resampling.LANCZOS)
card.alpha_composite(logo, ((W - logo.width) // 2, 105))

# Product image with a clean white frame.
photo = fit_cover(product, (760, 760)).convert("RGBA")
shadow = Image.new("RGBA", (820, 820), (0, 0, 0, 0))
ImageDraw.Draw(shadow).rounded_rectangle((30, 30, 790, 790), 34, fill=(0, 0, 0, 185))
shadow = shadow.filter(ImageFilter.GaussianBlur(22))
card.alpha_composite(shadow, (130, 300))
mask = Image.new("L", photo.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, 759, 759), 30, fill=255)
photo.putalpha(mask)
card.alpha_composite(photo, (160, 320))
draw = ImageDraw.Draw(card)
draw.rounded_rectangle((156, 316, 924, 1084), 34, outline="#5ee7ef", width=7)

centered(draw, "KU STRING", 1145, font(92, True), "#F8F6EE", 2)
centered(draw, "PKR 1,999", 1260, font(118, True), "#D9FF57", 2)
centered(draw, "RECHARGEABLE  •  GLOWING ROPE", 1418, font(36, True), "#5EE7EF")

# Call-to-action button.
button = (190, 1535, W - 190, 1685)
draw.rounded_rectangle(button, 28, fill="#D9FF57")
centered(draw, "DM TO ORDER", 1570, font(58, True), "#071326")
centered(draw, "pixelsgalaxy.com", 1730, font(42, True), "#5EE7EF")

card.convert("RGB").save(OUT, quality=96)
print(OUT)
