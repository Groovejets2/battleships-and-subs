from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter
from scalenx import scaleNx


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "ship-pack"
ASSETS = ROOT / "assets" / "ships"


def pil_to_nested(img):
    rgba = img.convert("RGBA")
    width, height = rgba.size
    pixels = list(rgba.getdata())
    return [[pixels[(row * width) + col] for col in range(width)] for row in range(height)]


def nested_to_pil(data):
    height = len(data)
    width = len(data[0])
    image = Image.new("RGBA", (width, height))
    image.putdata([tuple(pixel) for row in data for pixel in row])
    return image


def trim_with_padding(image, padding=6):
    bbox = image.getbbox()
    trimmed = image.crop(bbox)
    canvas = Image.new(
        "RGBA",
        (trimmed.width + (padding * 2), trimmed.height + (padding * 2)),
        (0, 0, 0, 0),
    )
    canvas.alpha_composite(trimmed, (padding, padding))
    return canvas


def upscale_sprite(image):
    upscaled = nested_to_pil(scaleNx(pil_to_nested(image), 3, True))
    upscaled = ImageEnhance.Contrast(upscaled).enhance(1.08)
    upscaled = ImageEnhance.Sharpness(upscaled).enhance(1.2)
    return trim_with_padding(upscaled)


def save_sprite_set(source_path, folder, stem, tint=None):
    source_image = Image.open(source_path).convert("RGBA")

    if tint is not None:
        tint_layer = Image.new("RGBA", source_image.size, tint)
        source_image = Image.blend(source_image, tint_layer, 0.16)

    vertical = upscale_sprite(source_image)
    horizontal = trim_with_padding(vertical.rotate(90, expand=True, resample=Image.Resampling.BICUBIC))

    folder.mkdir(parents=True, exist_ok=True)
    vertical.save(folder / f"{stem}.png")
    vertical.save(folder / f"{stem}_Vertical.png")
    horizontal.save(folder / f"{stem}_Horizontal.png")


def main():
    save_sprite_set(SOURCE / "Carrier" / "ShipCarrierHull.png", ASSETS / "Carrier", "ShipCarrierHull")
    save_sprite_set(SOURCE / "Battleship" / "ShipBattleshipHull.png", ASSETS / "Battleship", "ShipBattleshipHull")
    save_sprite_set(SOURCE / "Cruiser" / "ShipCruiserHull.png", ASSETS / "Cruiser", "ShipCruiserHull")
    save_sprite_set(SOURCE / "Destroyer" / "ShipDestroyerHull.png", ASSETS / "Destroyer", "ShipDestroyerHull")
    save_sprite_set(SOURCE / "Submarine" / "ShipSubMarineHull.png", ASSETS / "Submarine", "ShipSubMarineHull")
    save_sprite_set(
        SOURCE / "Submarine" / "ShipSubMarineHull.png",
        ASSETS / "Submarine",
        "ShipNuclearSubHull",
        tint=(70, 86, 108, 255),
    )
    save_sprite_set(
        SOURCE / "Submarine" / "ShipSubMarineHull.png",
        ASSETS / "Submarine",
        "ShipAttackSubHull",
        tint=(108, 84, 84, 255),
    )


if __name__ == "__main__":
    main()
