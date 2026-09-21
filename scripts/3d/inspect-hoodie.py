"""Read-only Blender inventory; run with --disable-autoexec -b <file> -P this.py."""
import bpy,json,sys
from pathlib import Path
objects=[]
for o in bpy.data.objects:
 row={'name':o.name,'type':o.type,'visible':not o.hide_render,'location':list(o.location),'rotation':list(o.rotation_euler),'scale':list(o.scale)}
 if o.type=='MESH':row.update(vertices=len(o.data.vertices),polygons=len(o.data.polygons),materials=[m.name if m else None for m in o.data.materials],uv=[u.name for u in o.data.uv_layers],modifiers=[{'name':m.name,'type':m.type,'viewport':m.show_viewport,'render':m.show_render,**({'levels':m.levels,'render_levels':m.render_levels} if m.type=='SUBSURF' else {})} for m in o.modifiers])
 objects.append(row)
images=[{'name':i.name,'size':list(i.size),'packed':bool(i.packed_file),'path':i.filepath} for i in bpy.data.images]
materials=[]
for m in bpy.data.materials:
 materials.append({'name':m.name,'nodes':[{'name':n.name,'type':n.type,'image':n.image.name if getattr(n,'image',None) else None} for n in m.node_tree.nodes] if m.node_tree else []})
result={'file':bpy.data.filepath,'frame':bpy.context.scene.frame_current,'frames':[bpy.context.scene.frame_start,bpy.context.scene.frame_end],'objects':objects,'images':images,'materials':materials,'actions':[a.name for a in bpy.data.actions],'caches':[{'name':c.name,'filepath':c.filepath} for c in bpy.data.cache_files]}
out=Path(sys.argv[sys.argv.index('--')+1]);out.write_text(json.dumps(result,ensure_ascii=False,indent=2));print('INVENTORY',out)
