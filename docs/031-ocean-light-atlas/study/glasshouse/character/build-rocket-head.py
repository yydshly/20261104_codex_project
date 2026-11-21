"""Fit the existing MIT Rocketbox head and its facial skin weights to 0597.

Uses the already installed asset. No external upload, no generated-face
identity claim, and no change to the default asset or earlier candidates.
"""
import bpy,bmesh,json,hashlib,math
import numpy as np
from pathlib import Path
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/personal-guide';WORK=ROOT/'character/personal-0597'
bpy.ops.wm.open_mainfile(filepath=str(WORK/'personal-guide.blend'))
scene=bpy.context.scene;scene.render.fps=30
body=next(o for o in scene.objects if o.type=='MESH');rig=next(o for o in scene.objects if o.type=='ARMATURE');rig.data.pose_position='REST'
original_actions=list(bpy.data.actions)
for a in original_actions:a.name='RECIPIENT_'+a.name
with bpy.data.libraries.load(str(ROOT/'character/rocket-guide.blend'),link=False) as (src,dst):
 dst.objects=list(src.objects);dst.actions=list(src.actions)
loaded=list(dst.objects)
for ob in loaded:
 if ob:scene.collection.objects.link(ob)
donor=next(o for o in loaded if o.type=='MESH');source=next(o for o in loaded if o.type=='ARMATURE')
source.data.pose_position='POSE';source.animation_data.action=next(a for a in bpy.data.actions if a.name=='Idle');scene.frame_set(1);bpy.context.view_layer.update()
deps=bpy.context.evaluated_depsgraph_get();head=donor.copy();head.data=bpy.data.meshes.new_from_object(donor.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps);scene.collection.objects.link(head)
head.name='Rocketbox fitted head with facial weights';head.modifiers.clear();head.parent=None
source_head=source.matrix_world@source.pose.bones['Bip01 Head'].head;target_head=rig.data.bones['Bip01 Head'].head_local.copy()
for v in head.data.vertices:v.co=target_head+(donor.matrix_world@v.co-source_head)*1.1
head.matrix_world=Matrix.Identity(4);head.data.uv_layers.active.name=body.data.uv_layers.active.name
bm=bmesh.new();bm.from_mesh(head.data)
# The donor's high red jacket collar is not part of its head or neck.
bmesh.ops.delete(bm,geom=[f for f in bm.faces if 'body' in head.data.materials[f.material_index].name.lower()],context='FACES')
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,plane_co=(0,0,1.475),plane_no=(0,0,1),clear_inner=True,clear_outer=False)
neck=[e for e in bm.edges if e.is_boundary and all(v.co.z<1.535 for v in e.verts)]
ring=bmesh.ops.extrude_edge_only(bm,edges=neck)['geom'];new=[v for v in ring if isinstance(v,bmesh.types.BMVert)]
for v in new:
 angle=math.atan2(v.co.y-.012,v.co.x)
 v.co=Vector((.043*math.cos(angle),.012+.038*math.sin(angle),1.38))
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(head.data);bm.free();head.data.update()
for ob in loaded:
 if ob:bpy.data.objects.remove(ob,do_unlink=True)
for a in list(bpy.data.actions):
 if a not in original_actions:bpy.data.actions.remove(a)
for a in original_actions:a.name=a.name.removeprefix('RECIPIENT_')
# Keep the complete original shirt collar; warm white is not a skin mask.
cut=[p.index for p in body.data.polygons if p.center.z>1.475]
image=next(n.image for n in body.data.materials[0].node_tree.nodes if n.type=='TEX_IMAGE' and n.image.colorspace_settings.name=='sRGB')
pixels=np.array(image.pixels[:],dtype=np.float32).reshape(image.size[1],image.size[0],4);uv=body.data.uv_layers.active
for p in body.data.polygons:
 if 1.41<p.center.z<=1.475 and abs(p.center.x)<.073:
  q=sum((uv.data[i].uv for i in p.loop_indices),Vector((0,0)))/len(p.loop_indices)
  c=pixels[min(image.size[1]-1,max(0,int(q.y*(image.size[1]-1)))),min(image.size[0]-1,max(0,int(q.x*(image.size[0]-1))))]
  if c[0]>c[1]*1.23 and c[1]>c[2]*1.10:cut.append(p.index)
bm=bmesh.new();bm.from_mesh(body.data);bm.faces.ensure_lookup_table();bmesh.ops.delete(bm,geom=[bm.faces[i] for i in cut],context='FACES');bm.to_mesh(body.data);bm.free()
# Source facial weights now deform the actual face, rather than a rigid Head group.
for bone in rig.data.bones:bone.use_deform=True
for mat in head.data.materials:
 if mat.use_nodes:
  bs=mat.node_tree.nodes.get('Principled BSDF')
  if bs:
   bs.inputs['Metallic'].default_value=0;bs.inputs['Specular IOR Level'].default_value=.28
   if 'head' in mat.name:
    bs.inputs['Roughness'].default_value=.58
    for l in list(bs.inputs['Normal'].links):mat.node_tree.links.remove(l)
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);head.select_set(True);bpy.context.view_layer.objects.active=body;bpy.ops.object.join();body.name='Personal0597_RocketboxFacialHead'
for v in body.data.vertices:
 active=sorted([g for g in v.groups if g.weight>1e-6],key=lambda g:g.weight,reverse=True)[:4];total=sum(g.weight for g in active)
 values=[(g.group,g.weight/total) for g in active]
 for g in list(v.groups):body.vertex_groups[g.group].remove([v.index])
 for i,w in values:body.vertex_groups[i].add([v.index],w,'REPLACE')
if body.data.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
for p in body.data.polygons:p.use_smooth=True
rig.data.pose_position='POSE';rig.animation_data.action=next(a for a in original_actions if a.name=='Idle');scene.frame_set(1);rig.select_set(True)
path=OUT/'personal-guide-head.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_extras=True,export_copyright='0597 body/clothes: user-provided. Head/face weights: Microsoft/Rocketbox Male Adult 10, MIT. Motions: Microsoft/Rocketbox MIT.')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'personal-guide-head.blend'))
manifest=json.loads((OUT/'manifest-v30.json').read_text(encoding='utf-8'))
manifest.update({'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'vertices':len(body.data.vertices),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'status':'Rocketbox mature head fitted to 0597 body; static review pending','headSource':{'geometry':'Microsoft/Rocketbox Male Adult 10 mature head, eyebrows, eyes, hair and original facial skin weights','license':'MIT','source':'https://github.com/microsoft/Microsoft-Rocketbox','preserved':'User 0597 body and clothes','identity':'Different mature face; not a restoration of the generated 0597 facial identity'},'limitations':['No speech audio or viseme driver implemented. Existing facial bones and weights are a foundation, not a completed speech feature.','Static head fitting requires visual review.','Retained body actions do not constitute facial animation.'],'verification':{'browser':'../../../screenshots/head35-checks.json','independentImport':'import-validation-head.json'}})
manifest['character']='User 0597 body / Microsoft Rocketbox Male Adult 10 head'
manifest['modelLicense']='User-provided body/clothes; Microsoft Rocketbox head and facial weights MIT'
manifest['verification']['review']='../../../screenshots/head35-review-checks.json'
manifest['headSource']['licenseFile']='HEAD-LICENSE.txt'
(OUT/'manifest-head.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('ROCKET_HEAD_READY',json.dumps({k:manifest[k] for k in ['file','bytes','vertices','triangles']}),flush=True)
