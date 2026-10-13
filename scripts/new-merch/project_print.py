"""Bake a single frontal image onto the hoodie body and its separate pocket UVs.

The model's X/Y coordinates, rather than UV rectangles, keep the print continuous
across the pocket seam. No model geometry or UV coordinates are changed.
"""
import json, math
from PIL import Image, ImageDraw, ImageChops


def project_front(canvas, mask, art, mesh_file):
    data=json.loads(mesh_file.read_text())
    # World-space print rectangle: below the neckline, across the whole chest
    # and over the kangaroo pocket. Preserve the supplied artwork's aspect ratio.
    width=.76;left=-width/2;top=.19;height=width*art.height/art.width
    projection={'left':left,'top':top,'width':width,'height':height}
    counts={'front':0,'pocket':0};bounds={'front':None,'pocket':None}
    ink=Image.new('RGB',art.size,(8,8,8));ink.paste(art,mask=art.getchannel('A'))
    res=canvas.width
    for indices in zip(*[iter(data['indices'])]*3):
        uv=[data['uv'][i] for i in indices]
        mid=[sum(p[k] for p in uv)*2048/3 for k in range(2)]
        if 580<=mid[0]<=1027 and 555<=mid[1]<=1028:zone='front'
        elif 1594<=mid[0]<=1811 and 739<=mid[1]<=907:zone='pocket'
        else:continue
        pts=[data['position'][i] for i in indices]
        if max(p[0] for p in pts)<left or min(p[0] for p in pts)>left+width:continue
        if min(p[1] for p in pts)>top or max(p[1] for p in pts)<top-height:continue
        dest=[(u*res,v*res) for u,v in uv]
        x0=max(0,math.floor(min(p[0] for p in dest)));y0=max(0,math.floor(min(p[1] for p in dest)))
        x1=min(res,math.ceil(max(p[0] for p in dest))+1);y1=min(res,math.ceil(max(p[1] for p in dest))+1)
        if x1<=x0 or y1<=y0:continue
        (ax,ay),(bx,by),(cx,cy)=dest
        det=(bx-ax)*(cy-ay)-(cx-ax)*(by-ay)
        if abs(det)<1e-6:continue
        source=[((p[0]-left)/width*art.width,(top-p[1])/height*art.height) for p in pts]
        # Affine UV -> source; evaluate only the current triangle's small tile.
        coeff=[]
        for k in range(2):
            sa,sb,sc=[p[k] for p in source]
            a=((sb-sa)*(cy-ay)-(sc-sa)*(by-ay))/det
            b=((sc-sa)*(bx-ax)-(sb-sa)*(cx-ax))/det
            coeff.extend((a,b,sa-a*ax-b*ay+a*x0+b*y0))
        patch=ink.transform((x1-x0,y1-y0),Image.Transform.AFFINE,coeff,
                            Image.Resampling.BICUBIC,fillcolor=(8,8,8))
        tile=Image.new('L',patch.size)
        ImageDraw.Draw(tile).polygon([(x-x0,y-y0) for x,y in dest],fill=255)
        tile=ImageChops.multiply(tile,mask.crop((x0,y0,x1,y1)))
        canvas.paste(patch,(x0,y0),tile)
        counts[zone]+=1
        b=bounds[zone]
        bounds[zone]=[x0,y0,x1,y1] if b is None else [min(b[0],x0),min(b[1],y0),max(b[2],x1),max(b[3],y1)]
    assert all(counts.values()), 'Full-chest print must cover body and pocket'
    return {zone:{'projection':projection,'triangles':counts[zone],
                  'box2048':[v*2048/res for v in bounds[zone]],'outsideUvPixels':0}
            for zone in counts}
