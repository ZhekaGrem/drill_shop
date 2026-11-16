"""UV islands of a garment mesh exported by scripts/new-merch/export-mesh.cjs.

An island is a set of triangles connected through shared vertices: glTF splits a vertex
wherever its UV jumps, so connected triangles are exactly one piece of the unwrap.
Pure Python + Pillow (no numpy on this machine)."""
import json
from PIL import Image, ImageDraw


def load_mesh(path):
    return json.loads(open(path).read())


def islands(mesh):
    """List of islands, largest first: {tris: [(a,b,c)], box: (u0,v0,u1,v1) in 0..1, area, centre, normal}."""
    uv, pos, nor, idx = mesh['uv'], mesh['position'], mesh['normal'], mesh['indices']
    parent = list(range(len(uv)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for i in range(0, len(idx), 3):
        root = find(idx[i])
        for v in idx[i + 1:i + 3]:
            r = find(v)
            if r != root:
                parent[r] = root
    groups = {}
    for i in range(0, len(idx), 3):
        groups.setdefault(find(idx[i]), []).append(tuple(idx[i:i + 3]))
    out = []
    for tris in groups.values():
        verts = {v for t in tris for v in t}
        us = [uv[v][0] for v in verts]
        vs = [uv[v][1] for v in verts]
        area = sum(abs((uv[b][0] - uv[a][0]) * (uv[c][1] - uv[a][1]) - (uv[c][0] - uv[a][0]) * (uv[b][1] - uv[a][1])) / 2
                   for a, b, c in tris)
        n = len(verts)
        centre = [sum(pos[v][k] for v in verts) / n for k in range(3)]
        normal = [sum(nor[v][k] for v in verts) / n for k in range(3)]
        out.append({'tris': tris, 'box': (min(us), min(vs), max(us), max(vs)), 'area': area,
                    'centre': centre, 'normal': normal})
    return sorted(out, key=lambda d: -d['area'])


def fill(mesh, tris, size, image=None, colour=255, mode='L'):
    """Rasterise triangles into a size×size image (UV origin top-left, as glTF)."""
    image = image or Image.new(mode, (size, size), 0)
    draw = ImageDraw.Draw(image)
    uv = mesh['uv']
    for a, b, c in tris:
        draw.polygon([(uv[v][0] * size, uv[v][1] * size) for v in (a, b, c)], fill=colour)
    return image
