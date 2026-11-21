import bpy, json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
source=root.parent/'character-forge-lab/assets/warlord/source/adult-base.glb'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
report={'bones':{b.name:{'head':list(b.head_local),'tail':list(b.tail_local),'rotation':list(b.matrix_local.to_quaternion())} for b in rig.data.bones},'meshes':[{'name':o.name,'dimensions':list(o.dimensions),'materials':[m.name for m in o.data.materials]} for o in bpy.data.objects if o.type=='MESH']}
(root/'glasshouse/character/base-inspection.json').write_text(json.dumps(report,indent=2))
