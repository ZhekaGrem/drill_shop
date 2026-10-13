"""Generate front/rear contact sheets beside the owner's full-resolution UVs."""
from pathlib import Path
import unicodedata
from PIL import Image,ImageOps,ImageDraw,ImageFont

FRONT=Path(__file__).resolve().parents[2]
ROOT=next(p for p in FRONT.parent.iterdir() if unicodedata.normalize('NFC',p.name)=='новий мерч')
OUT=ROOT/'готові розгортки'
RENDERS=FRONT/'3d/artists/prokliatyi/new-merch/renders'
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',22)
for kind,title,file in [('tshirt','10 НОВИХ ФУТБОЛОК / ПЕРЕД І СПИНА','футболки-превʼю.jpg'),
                        ('hoodie','11 НОВИХ ХУДІ / ПЕРЕД І СПИНА','худі-превʼю.jpg')]:
    count=11 if kind=='hoodie' else 10
    columns=6 if kind=='hoodie' else 5
    board=Image.new('RGB',(columns*300,1500),(218,222,225));d=ImageDraw.Draw(board)
    d.text((25,15),title,font=font,fill=(20,24,27))
    for n in range(1,count+1):
        x=((n-1)%columns)*300;row=((n-1)//columns)*710+60
        d.text((x+15,row),f'ДИЗАЙН {n:02}',font=font,fill=(20,24,27))
        for side,y in [('front',row+30),('back',row+365)]:
            im=Image.open(RENDERS/f'{kind}-{n:02}-{side}.png').convert('RGBA')
            box=im.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox()
            im=ImageOps.contain(im.crop(box),(270,320),Image.Resampling.LANCZOS)
            board.paste(im,(x+15+(270-im.width)//2,y),im)
    board.save(OUT/file,quality=94)
    print(OUT/file)
