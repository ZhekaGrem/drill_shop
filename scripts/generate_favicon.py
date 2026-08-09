"""Favicon ye-dril: чорна літера «Є» на білому заокругленому квадраті.

Ручна векторна генерація (PIL shapes + self-hosted шрифт e-UkraineHead-Medium,
конвертований з woff2 у ttf через fontTools — той самий файл, що вантажиться
на сайті), БЕЗ AI-растру. Ніякого тризуба/держсимволіки — проста ворд-марка,
той самий підхід, що й у самого diia.gov.ua (простий чорний текстовий значок).

Пише набір файлів, на які вже посилається src/app/seo.ts /
public/manifest.json / public/site.webmanifest:
  public/assets/favicon/favicon-16x16.png
  public/assets/favicon/favicon-32x32.png
  public/assets/favicon/favicon-96x96.png
  public/assets/favicon/android-chrome-192x192.png
  public/assets/favicon/android-chrome-512x512.png
  public/assets/favicon/apple-touch-icon.png   (180x180, БЕЗ заокруглення —
    iOS сам накладає маску, свій радіус дав би подвійне заокруглення)
  public/assets/favicon/favicon.ico            (16/32/48 у одному .ico)
  public/favicon.ico                            (той самий — Next.js
    роздає /favicon.ico з кореня public/ як браузерний дефолт-фолбек)

Використання (з кореня frontend, через uv):
  uv run --with pillow,fonttools,brotli python scripts/generate_favicon.py
"""
from __future__ import annotations

from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FAVICON_DIR = ROOT / "public" / "assets" / "favicon"
FONT_SRC = ROOT / "public" / "fonts" / "e-ukraine" / "e-UkraineHead-Medium.woff2"
FONT_TMP = ROOT / "scripts" / ".e-UkraineHead-Medium.ttf"

BLACK = (0, 0, 0, 255)
WHITE = (255, 255, 255, 255)
CANVAS = 512
CORNER_RADIUS_RATIO = 0.20  # заокруглення кутів для звичайних favicon-розмірів
GLYPH = "Є"  # Є


def _woff2_to_ttf() -> Path:
    font = TTFont(str(FONT_SRC))
    font.flavor = None
    font.save(str(FONT_TMP))
    return FONT_TMP


def _base_icon(rounded: bool) -> Image.Image:
    img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(CANVAS * CORNER_RADIUS_RATIO) if rounded else 0
    if radius:
        draw.rounded_rectangle([0, 0, CANVAS - 1, CANVAS - 1], radius=radius, fill=WHITE)
    else:
        draw.rectangle([0, 0, CANVAS - 1, CANVAS - 1], fill=WHITE)

    ttf_path = _woff2_to_ttf()
    # Підбір розміру шрифту, щоб гліф займав ~62% висоти канви
    size = int(CANVAS * 0.62)
    font = ImageFont.truetype(str(ttf_path), size=size)
    bbox = draw.textbbox((0, 0), GLYPH, font=font)
    glyph_w, glyph_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (CANVAS - glyph_w) / 2 - bbox[0]
    y = (CANVAS - glyph_h) / 2 - bbox[1]
    draw.text((x, y), GLYPH, font=font, fill=BLACK)
    return img


def _save_png(img: Image.Image, size: int, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.resize((size, size), Image.LANCZOS).save(path, "PNG")
    print(f"  {path.relative_to(ROOT)} ({size}x{size})")


def main() -> None:
    rounded = _base_icon(rounded=True)
    square = _base_icon(rounded=False)

    print("PNG:")
    _save_png(rounded, 16, FAVICON_DIR / "favicon-16x16.png")
    _save_png(rounded, 32, FAVICON_DIR / "favicon-32x32.png")
    _save_png(rounded, 96, FAVICON_DIR / "favicon-96x96.png")
    _save_png(rounded, 192, FAVICON_DIR / "android-chrome-192x192.png")
    _save_png(rounded, 512, FAVICON_DIR / "android-chrome-512x512.png")
    _save_png(square, 180, FAVICON_DIR / "apple-touch-icon.png")

    print("ICO:")
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_path = FAVICON_DIR / "favicon.ico"
    rounded.save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"  {ico_path.relative_to(ROOT)} {ico_sizes}")

    root_ico = ROOT / "public" / "favicon.ico"
    rounded.save(root_ico, format="ICO", sizes=ico_sizes)
    print(f"  {root_ico.relative_to(ROOT)} {ico_sizes}")

    FONT_TMP.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
