import bpy,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'character/personal-0597'
bpy.ops.wm.open_mainfile(filepath=str(WORK/'personal-guide.blend'))
mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
bvh=BVHTree.FromPolygons([v.co for v in mesh.data.vertices],[list(p.vertices) for p in mesh.data.polygons])
samples=[]
for z in [1.565,1.58,1.60,1.614,1.625,1.64,1.655]:
 for x in [-.07,-.055,-.04,-.027,-.01,.01,.025,.045,.06,.078,.09]:
  loc,normal,index,d=bvh.ray_cast(Vector((x,-1,z)),Vector((0,1,0)))
  if loc:samples.append({'x':x,'z':z,'y':round(loc.y,5)})
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/rocket-guide/rocket-guide.glb'))
new=[o for o in bpy.data.objects if o not in before]
rig=next(o for o in new if o.type=='ARMATURE');rig.data.pose_position='REST'
hands=[]
for ob in new:
 if ob.type!='MESH':continue
 for side in ['L','R']:
  groups={v.index for v in ob.vertex_groups if (' '+side+' Hand') in v.name or (' '+side+' Finger') in v.name}
  verts=[ob.matrix_world@v.co for v in ob.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.8]
  if verts:hands.append({'mesh':ob.name,'side':side,'count':len(verts),'bounds':[[min(v[k] for v in verts) for k in range(3)],[max(v[k] for v in verts) for k in range(3)]],'hand':list(rig.matrix_world@rig.data.bones['Bip01 '+side+' Hand'].head_local),'forearm':list(rig.matrix_world@rig.data.bones['Bip01 '+side+' Forearm'].head_local)})
(WORK/'detail-review/regions.json').write_text(json.dumps({'face':samples,'donorHands':hands},indent=2))
print(json.dumps({'face':samples,'donorHands':hands}),flush=True)
