"""Model-derived UV coverage and safe print placement."""
import json
from PIL import Image, ImageDraw, ImageOps, ImageChops, ImageFilter
from project_print import project_front


def mesh_mask(file):
    mesh=json.loads(file.read_text())
    mask=Image.new('L',(2048,2048));draw=ImageDraw.Draw(mask)
    for i in range(0,len(mesh['indices']),3):
        points=[tuple(v*2048 for v in mesh['uv'][j]) for j in mesh['indices'][i:i+3]]
        draw.polygon(points,fill=255)
    return mask


def place(canvas,mask,art,box,axis,top,print_scale=1):
    scale=canvas.width/2048
    room=(round(box[0]*scale),round(box[1]*scale))
    part=ImageOps.contain(art,room,Image.Resampling.LANCZOS)
    x=round(axis*scale-part.width/2);y=round(top*scale)
    if print_scale != 1:
        width=max(1,round(part.width*print_scale));height=max(1,round(part.height*print_scale))
        x+=round((part.width-width)/2);y+=round((part.height-height)/2)
        part=art.resize((width,height),Image.Resampling.LANCZOS)
    allowed=mask.crop((x,y,x+part.width,y+part.height))
    ink=part.getchannel('A').point(lambda v:255 if v>8 else 0)
    outside=ImageChops.subtract(ink,allowed)
    assert outside.getbbox() is None, f'Print outside UV: {axis},{top}, {part.size}'
    canvas.paste(part,(x,y),part.getchannel('A'))
    return {'box2048':[x/scale,y/scale,(x+part.width)/scale,(y+part.height)/scale], 'outsideUvPixels':0}


def atlas(kind,sides,mask2048,number,mesh_file=None):
    size=7936 if kind=='tshirt' else 8192
    canvas=Image.new('RGB',(size,size),(8,8,8))
    mask=mask2048.resize((size,size),Image.Resampling.NEAREST)
    if kind=='tshirt':
        front_box=(220,150) if number==2 else (490,520)
        front_axis=870/3.875 if number==2 else 1290/3.875
        placement={'front':place(canvas,mask,sides['front'],front_box,front_axis,5480/3.875,.7),
                   'back':place(canvas,mask,sides['back'],(568,605),3855/3.875,5090/3.875,.8)}
        if 'sleeve' in sides:
            placement['sleeve']=place(canvas,mask,sides['sleeve'],(190,110),6775/3.875,2900/3.875)
    else:
        front_box=(110,75) if number==2 else (250,175)
        front_axis=750 if number==2 else 804
        placement={'back':place(canvas,mask,sides['back'],(250,396),813,106)}
        if number==11:
            placement.update(project_front(canvas,mask,sides['front'],mesh_file))
        else:
            placement['front']=place(canvas,mask,sides['front'],front_box,front_axis,662)
        if 'sleeve' in sides:
            placement['sleeve']=place(canvas,mask,sides['sleeve'],(170,105),299,1230)
    return canvas,placement


def guide(texture,mask):
    im=texture.resize((2048,2048),Image.Resampling.LANCZOS)
    edge=ImageChops.subtract(mask.filter(ImageFilter.MaxFilter(3)),mask.filter(ImageFilter.MinFilter(3)))
    im.paste((102,130,146),(0,0,2048,2048),edge)
    return im
