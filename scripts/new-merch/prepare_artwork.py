"""Extract supplied artwork deterministically; never redraw raster artwork."""
from pathlib import Path
from PIL import Image, ImageOps, ImageChops, ImageDraw
import pymupdf

Image.MAX_IMAGE_PIXELS = None
LIGHT = (237, 234, 224)


def trim(im):
    box = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    assert box, 'Empty print asset'
    return im.crop(box)


def load(file, mode='original'):
    im = Image.open(file).convert('RGBA')
    if mode == 'white-paper':
        alpha = ImageOps.invert(im.convert('L'))
        ink = Image.new('RGBA', im.size, (*LIGHT, 255))
        ink.putalpha(ImageChops.multiply(alpha, im.getchannel('A')))
        return trim(ink)
    if mode == 'black-vector':
        ink = Image.new('RGBA', im.size, (*LIGHT, 255))
        ink.putalpha(im.getchannel('A'))
        return trim(ink)
    # Remove only the darkest substrate, retaining colored ink and fine gray detail.
    r, g, b, a = im.split()
    mask = ImageChops.lighter(ImageChops.lighter(r, g), b).point(lambda v: 0 if v <= 12 else 255)
    im.putalpha(ImageChops.multiply(a, mask))
    return trim(im)


def pair(left, right):
    # Viewer's left is wearer's right, matching supplied shirt-4 placement reference.
    board = Image.new('RGBA', (2000, 880))
    for art, box in [(left, (0, 90, 1060, 700)), (right, (1400, 0, 2000, 850))]:
        x0, y0, x1, y1 = box
        scaled = ImageOps.contain(art, (x1-x0, y1-y0), Image.Resampling.LANCZOS)
        board.alpha_composite(scaled, (x0+(x1-x0-scaled.width)//2, y0))
    return trim(board)


def pdf_print(file, region, lighten=False):
    doc = pymupdf.open(file)
    if lighten:
        # The back PDF mixes paths with live text. Rendering the print-only region
        # keeps the exact embedded typefaces and all three text columns.
        pix = doc[0].get_pixmap(matrix=pymupdf.Matrix(8,8), clip=region, alpha=True)
        im = Image.frombytes('RGBA', (pix.width,pix.height), pix.samples)
        # The mockup's neckline/side outlines cross this crop's edges. Remove
        # their connected components; the actual print has a clear margin.
        mask=im.getchannel('A').point(lambda v:255 if v>0 else 0)
        for x in range(mask.width):
            for y in [0,mask.height-1]:
                if mask.getpixel((x,y)):ImageDraw.floodfill(mask,(x,y),0)
        for y in range(mask.height):
            for x in [0,mask.width-1]:
                if mask.getpixel((x,y)):ImageDraw.floodfill(mask,(x,y),0)
        im.putalpha(ImageChops.multiply(im.getchannel('A'),mask))
        def recolor(pixel):
            r,g,b,a=pixel
            if not a: return (0,0,0,0)
            if max(r,g,b)-min(r,g,b)<20:
                return (*LIGHT,a) if max(r,g,b)<200 else (8,8,8,a)
            return pixel
        im.putdata([recolor(pixel) for pixel in im.getdata()])
        return trim(im)
    paths = [p for p in doc[0].get_drawings() if region.contains(p['rect'])]
    assert paths, f'No vector artwork in {file}'
    bounds = pymupdf.Rect(paths[0]['rect'])
    for p in paths: bounds |= p['rect']
    dst = pymupdf.open(); page = dst.new_page(width=bounds.width+2, height=bounds.height+2)
    matrix = pymupdf.Matrix(1, 0, 0, 1, 1-bounds.x0, 1-bounds.y0)
    for p in paths:
        shape = page.new_shape()
        for item in p['items']:
            if item[0] == 'l': shape.draw_line(item[1]*matrix, item[2]*matrix)
            elif item[0] == 'c': shape.draw_bezier(*(point*matrix for point in item[1:5]))
            elif item[0] == 're': shape.draw_quad(item[1].quad*matrix)
            elif item[0] == 'qu': shape.draw_quad(item[1]*matrix)
            else: raise ValueError(item[0])
        def color(c):
            if not lighten or c is None: return c
            if max(c)-min(c) < .08: return tuple(v/255 for v in LIGHT) if max(c)<.5 else (.0314,)*3
            return c
        shape.finish(fill=color(p['fill']), color=color(p['color']),
                     width=p.get('width') or 0, even_odd=p.get('even_odd', False),
                     closePath=p.get('closePath') or False)
        shape.commit()
    pix = page.get_pixmap(matrix=pymupdf.Matrix(8,8), alpha=True)
    return trim(Image.frombytes('RGBA', (pix.width,pix.height), pix.samples))


def prepare(root, out):
    svg = out/'source-svg'; prints = out/'print-assets'; prints.mkdir(exist_ok=True)
    crest = load(svg/'футба 1-права грудь.svg.png', 'black-vector')
    full_crest = load(svg/'футба 3-великий логотип на грудях .svg.png', 'black-vector')
    tracks = load(root/'футба 1 '/'спина.jpg', 'white-paper')
    assets = {
        1: {'front': pair(crest, load(root/'футба 1 '/'ліва грудь.PNG')), 'back': tracks},
        2: {'front': crest, 'back': tracks},
        3: {'front': full_crest, 'back': tracks},
        4: {'front': pair(load(root/'футба 4'/'right-chest.png'), load(root/'футба 4'/'left-chest.png')),
            'back': load(root/'футба 4'/'back.png'), 'sleeve': load(root/'футба 4'/'sleeve.png')},
        5: {'front': load(root/'футба 5 '/'перед 3.png'), 'back': load(root/'футба 5 '/'cпина 2.png')},
        6: {'front': load(root/'футба 6'/'front-print-4096x5120.png'), 'back': load(root/'футба 6'/'back-upscaled-4104x5120.png')},
        7: {'front': pdf_print(root/'футболка 7 '/'берем перід звідси.pdf', pymupdf.Rect(115,205,310,255)),
            'back': pdf_print(root/'футболка 7 '/'звідси берем зад звідси .pdf', pymupdf.Rect(526,148,739,465), True)},
        8: {'front': pair(load(root/'футболка 8'/'права грудь.png'), load(root/'футболка 8'/'ліва грудь.png')),
            'back': load(root/'футболка 8'/'зад.png')},
        10: {'front': load(root/'футболка 10'/'output/print-assets/front-design-4096x5120.png'),
             'back': load(root/'футболка 10'/'output/print-assets/back-design-4096x5120.png')},
    }
    emblem = load(root/'футболка 9'/'output/print-assets/emblem.png')
    lettering = load(root/'футболка 9'/'output/print-assets/lettering.png')
    front = Image.new('RGBA',(2000,2300))
    for art,box in [(lettering,(50,0,1950,375)),(emblem,(150,430,1850,2250))]:
        x0,y0,x1,y1=box
        part=ImageOps.contain(art,(x1-x0,y1-y0),Image.Resampling.LANCZOS)
        front.alpha_composite(part,(x0+(x1-x0-part.width)//2,y0))
    assets[9]={'front':trim(front),'back':load(root/'футболка 9'/'спина.png')}
    for n,sides in assets.items():
        for side,im in sides.items(): im.save(prints/f'{n:02}-{side}.png')
    return assets
