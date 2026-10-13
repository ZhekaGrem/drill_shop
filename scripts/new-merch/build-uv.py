"""node scripts/new-merch/export-mesh.cjs; python scripts/new-merch/build-uv.py"""
from pathlib import Path
import json,hashlib,unicodedata
from PIL import ImageDraw,ImageFont
from prepare_artwork import prepare
from uv_layout import mesh_mask,atlas,guide

FRONT=Path(__file__).resolve().parents[2]
ROOT=next(p for p in FRONT.parent.iterdir() if unicodedata.normalize('NFC',p.name)=='новий мерч' and p.is_dir())
OUT=FRONT/'3d/artists/prokliatyi/new-merch'
FULL=ROOT/'готові розгортки'
NAMES=['Рок департамент / два принти','Рок департамент / мала емблема','Рок департамент / велика емблема',
       'Суко, ми українці','Ганстерський режим','Проклятий вершник','Щільний Дріл / Ніжна Оксана',
       'Прокляті / жовтий і червоний','Проклятий / кістяна емблема','Ми українці, суко']
PRODUCTION_NOTE='Виготовлення боб — до 7 днів під обстрілами, але ми вас любимо.'


def main():
    FULL.mkdir(exist_ok=True)
    sources=prepare(ROOT,OUT)
    report={'cloth':[8,8,8],'shirtResolution':[7936,7936],'hoodieResolution':[8192,8192],
            'webResolution':[4096,4096],'sourceDirectory':ROOT.name,
            'printScale':{'tshirt':{'front':.7,'back':.8},'hoodie':{'front':1,'back':1}},
            'tshirtAdjustments':{'6':{'frontScale':1.15,'frontShiftUp2048':32},
                                 '9':{'frontShiftUp2048':32},'8':{'backScale':.8},'4':{'sleeveScale':.7}},
            'printAnchor':'original print center','designs':[]}
    collections=[]
    font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',24)
    for kind,title,description in [('tshirt','футболяроки','Прокляті футболки для святих людей'),
                                   ('hoodie','бобчанскі','Прокляті боби для святих людей')]:
        description=f'{description}. {PRODUCTION_NOTE}'
        mask=mesh_mask(OUT/f'{kind}-mesh.json');mask.save(OUT/f'{kind}-uv-mask.png')
        public=FRONT/f'public/3d/textures/prokliatyi/new-merch';public.mkdir(parents=True,exist_ok=True)
        items=[]
        for number in range(1,12 if kind=='hoodie' else 11):
            texture,placements=atlas(kind,sources[6 if number==11 else number],mask,number,
                                     OUT/f'{kind}-mesh.json')
            stem=f'{kind}-{number:02}'
            full=FULL/f'{stem}-UV.png';texture.save(full)
            runtime=public/f'{stem}.webp'
            texture.resize((4096,4096)).save(runtime,'WEBP',quality=94,method=6)
            preview=guide(texture,mask)
            d=ImageDraw.Draw(preview)
            labels=[('ПЕРЕД',(160,1210)),('СПИНА',(800,1210))] if kind=='tshirt' else [('СПИНА',(690,10)),('ПЕРЕД',(690,525))]
            for text,xy in labels:d.text(xy,text,font=font,fill='white')
            d.text((30,20),f'{title.upper()} / {number:02} / КОНТУРИ ЛИШЕ ДЛЯ ПЕРЕВІРКИ',font=font,fill='white')
            preview.save(FULL/f'{stem}-UV-guide.png')
            entry={'kind':kind,'number':number,'file':str(full.relative_to(ROOT)),
                   'sha256':hashlib.sha256(full.read_bytes()).hexdigest(),
                   'runtimeSha256':hashlib.sha256(runtime.read_bytes()).hexdigest(),'placements':placements}
            report['designs'].append(entry)
            product_kind='tee' if kind=='tshirt' else 'hoodie'
            label=NAMES[number-1] if number<=10 else 'Проклятий вершник / на всі груди'
            items.append({'key':f'prokliatyi-new-{product_kind}-{number:02}','label':label,
                          'mapUrl':f'/3d/textures/prokliatyi/new-merch/{stem}.webp?v={entry["runtimeSha256"][:12]}',
                          'fallback':f'/assets/img/prokliatyi/new-merch/{stem}.webp'})
            print(f'{stem}: full UV {texture.width}, WebP {runtime.stat().st_size:,} bytes, coverage OK',flush=True)
        collections.append({'key':f'prokliatyi-new-{kind}','title':title,'description':description,
                            'modelUrl':f'/3d/models/{"tshirt" if kind=="tshirt" else "hoodie-3"}.glb','items':items})
    layout=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
    (OUT/'layout.json').write_text(layout);(FULL/'layout.json').write_text(layout)
    (FRONT/'src/shared/config/new-merch.json').write_text(json.dumps({'collections':collections},ensure_ascii=False,indent=2)+'\n')


if __name__=='__main__': main()
