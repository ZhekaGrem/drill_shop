"""Radio Tsybulia tees: key the supplied prints and lay them onto tshirt.glb UVs.

/opt/homebrew/bin/python3.14 scripts/radio-tsybulia/build-textures.py

Needs 3d/artists/prokliatyi/new-merch/tshirt-mesh.json (node scripts/new-merch/export-mesh.cjs).

The chest colour is random, so the site cycles five chest prints over one atlas per tee:
  public/3d/textures/radio-tsybulia/<tee>.webp       full atlas, first chest colour baked in
  public/3d/textures/radio-tsybulia/chest-<colour>.webp  the chest rectangle of each colour
Five full atlases per tee would cost ~450 MB of GPU memory; the chest crops cost a few MB.
Every colour's full atlas still goes to 3d/artists/radio-tsybulia/atlases/ for the Blender renders.
"""
from pathlib import Path
import hashlib, json, sys, unicodedata
from PIL import Image, ImageChops, ImageMath

FRONT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(FRONT / 'scripts/new-merch'))
from uv_layout import mesh_mask, place  # noqa: E402

SOURCE = next(p for p in FRONT.parent.iterdir() if unicodedata.normalize('NFC', p.name).strip() == 'радіо цибуля')
MESH = FRONT / '3d/artists/prokliatyi/new-merch/tshirt-mesh.json'
LOCAL = FRONT / '3d/artists/radio-tsybulia'
PUBLIC = FRONT / 'public/3d/textures/radio-tsybulia'
URL = '/3d/textures/radio-tsybulia'
MANIFEST = FRONT / 'src/shared/config/radio-tsybulia.json'
CLOTH = 8  # the shirt is (8,8,8), same as every other tee atlas
SIZE, WEB = 7936, 4096
PAD = 12  # cloth margin around the chest crop, in 2048 UV units: the seam lands on plain cloth

# Chest colours in the order the 3D model cycles them; the first one is baked into the atlas.
CHESTS = [('rozheva', 'груди 2.png'), ('zhovta', 'груди 5.png'), ('biruzova', 'груди 3.png'),
          ('fioletova', 'груди 1.png'), ('bila', 'груди 4.png')]
PRODUCTS = [
    {'slug': 'radio-tsybulia-shchilnyi-salut', 'stem': 'shchilnyi-salut', 'name': 'Щільний салют',
     'back': 'спина 2.png'},
    {'slug': 'radio-tsybulia-holos-andehraunda', 'stem': 'holos-andehraunda', 'name': 'Голос андеграунда',
     'back': 'спина 1.png'},
]
# Same zones as the other tees on this model (scripts/new-merch/uv_layout.py), in 2048 UV units.
CHEST = {'box': (490, 520), 'axis': 1290 / 3.875, 'top': 5480 / 3.875, 'scale': .6}
BACK = {'box': (568, 605), 'axis': 3855 / 3.875, 'top': 5090 / 3.875, 'scale': .8}


def source(name):
    return next(p for p in SOURCE.iterdir() if unicodedata.normalize('NFC', p.name) == name)


def key(file):
    """Ink over the black shirt: everything at or below the cloth level becomes transparent.

    The prints come on black (or transparent) paper. Flatten onto the cloth colour, take the
    brightest channel above it as alpha and un-premultiply, so compositing back onto the
    cloth reproduces the artwork exactly while the paper disappears.
    """
    im = Image.open(file).convert('RGBA')
    flat = Image.new('RGB', im.size, (CLOTH,) * 3)
    flat.paste(im, mask=im.getchannel('A'))
    lift = [c.point(lambda v: max(0, v - CLOTH) * 255 // (255 - CLOTH)) for c in flat.split()]
    alpha = ImageChops.lighter(ImageChops.lighter(lift[0], lift[1]), lift[2])
    ink = [ImageMath.lambda_eval(lambda a: a['convert'](
        a['min'](a['c'] * 255 / a['max'](a['al'], 1), 255), 'L'), c=c, al=alpha) for c in lift]
    ink = [c.point(lambda v: CLOTH + v * (255 - CLOTH) // 255) for c in ink]
    out = Image.merge('RGBA', (*ink, alpha))
    box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    assert box, f'{file.name}: empty print'
    return out.crop(box)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def versioned(path):
    return f'{URL}/{path.name}?v={digest(path)[:12]}'


def main():
    atlases_dir = LOCAL / 'atlases'
    atlases_dir.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    full_mask = mesh_mask(MESH).resize((SIZE, SIZE), Image.Resampling.NEAREST)
    chests = {colour: key(source(name)) for colour, name in CHESTS}
    report = {'source': SOURCE.name, 'cloth': [CLOTH] * 3, 'chest': CHEST, 'back': BACK, 'atlases': []}
    atlases = {}  # (product stem, colour) -> web-size atlas
    chest_boxes = []
    for product in PRODUCTS:
        back = key(source(product['back']))
        for colour, chest_file in CHESTS:
            canvas = Image.new('RGB', (SIZE, SIZE), (CLOTH,) * 3)
            placed = {
                'chest': place(canvas, full_mask, chests[colour], CHEST['box'], CHEST['axis'], CHEST['top'],
                               CHEST['scale']),
                'back': place(canvas, full_mask, back, BACK['box'], BACK['axis'], BACK['top'], BACK['scale']),
            }
            chest_boxes.append(placed['chest']['box2048'])
            web = canvas.resize((WEB, WEB), Image.Resampling.LANCZOS)
            atlases[product['stem'], colour] = web
            web.save(atlases_dir / f"{product['stem']}-{colour}.webp", 'WEBP', quality=94, method=6)
            report['atlases'].append({'product': product['stem'], 'chest': chest_file, 'back': product['back'],
                                      'placements': placed})
        print(f"{product['stem']}: 5 atlases, prints inside UV", flush=True)

    # One chest rectangle for every colour (the white print has its own outline), padded with cloth
    left, top = (min(b[i] for b in chest_boxes) - PAD for i in (0, 1))
    right, bottom = (max(b[i] for b in chest_boxes) + PAD for i in (2, 3))
    scale = WEB / 2048
    crop = tuple(round(v * scale) for v in (left, top, right, bottom))
    rect = [crop[0] / WEB, crop[1] / WEB, crop[2] / WEB, crop[3] / WEB]
    chest_urls = []
    for colour, _ in CHESTS:
        pieces = [atlases[p['stem'], colour].crop(crop) for p in PRODUCTS]
        # The backs never reach the chest, so every tee has the same chest crop
        assert all(ImageChops.difference(pieces[0], piece).getbbox() is None for piece in pieces[1:])
        out = PUBLIC / f'chest-{colour}.webp'
        pieces[0].save(out, 'WEBP', lossless=True, method=6)
        chest_urls.append(versioned(out))
    print(f'chest crops: {crop[2] - crop[0]}x{crop[3] - crop[1]} px, rect {[round(v, 4) for v in rect]}')

    products = []
    for product in PRODUCTS:
        out = PUBLIC / f"{product['stem']}.webp"
        atlases[product['stem'], CHESTS[0][0]].save(out, 'WEBP', quality=94, method=6)
        products.append({'slug': product['slug'], 'name': product['name'], 'mapUrl': versioned(out)})
        print(f"{out.name}: {out.stat().st_size:,} bytes")

    report['chestRect'] = rect
    (LOCAL / 'layout.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    manifest = json.loads(MANIFEST.read_text())
    manifest['chest'] = {'rect': rect, 'urls': chest_urls}
    manifest['products'] = products
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
