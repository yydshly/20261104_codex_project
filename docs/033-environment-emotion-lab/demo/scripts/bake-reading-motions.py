"""Bake official Rocketbox mocap onto our unchanged Male Adult 10 bind rig.

Only the armature and animation are exported; existing mesh/textures stay intact.
The source documents clips are upper-body references, not seated book captures.
"""
import bpy, json, math, hashlib
from pathlib import Path
from mathutils import Matrix
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/motions'
SOURCE=OUT/'source'
MODEL=ROOT.parent/'ocean-light-atlas/glasshouse/assets/hero-candidates/rocketbox/Male_Adult_10-comparison.blend'
PLANS=[
 ('SeatedBreathe','m_sit_chair_breathe_01.max.fbx',1,382),
 ('SeatedNeutral','m_sit_chair_idle_neutral_01.max.fbx',1,361),
 ('SeatedRelaxed','m_sit_chair_idle_relaxed_01.max.fbx',240,540),
 ('SeatedLook','m_sit_chair_idle_look_around.max.fbx',1,261),
 ('ReadBody','m_documents_idle.max.fbx',180,450),
 ('PickBody','m_documents_in.max.fbx',1,111),
 ('PutBody','m_documents_out.max.fbx',1,121),
 ('PageBody','m_documents_check.max.fbx',90,150),
]
bpy.ops.wm.open_mainfile(filepath=str(MODEL))
scene=bpy.context.scene;scene.render.fps=30
target=next(o for o in scene.objects if o.type=='ARMATURE')
target.animation_data_clear()
for p in target.pose.bones:p.matrix_basis=Matrix.Identity(4);p.rotation_mode='QUATERNION'
bpy.context.view_layer.update()
tw=target.matrix_world.copy();inv=tw.inverted()
rest={b.name:b.matrix_local.copy() for b in target.data.bones}
ordered=sorted(target.pose.bones,key=lambda b:len(b.parent_recursive))
baked=[];records=[]
for name,filename,start,end in PLANS:
 before=set(bpy.data.objects);bpy.ops.import_scene.fbx(filepath=str(SOURCE/filename))
 imported=[o for o in bpy.data.objects if o not in before]
 source=max((o for o in imported if o.type=='ARMATURE'),key=lambda o:len(o.data.bones))
 normalize=Matrix.Scale(tw.to_scale().length/source.matrix_world.to_scale().length,4)
 action=bpy.data.actions.new(name);action.use_fake_user=True
 target.animation_data_create();target.animation_data.action=action
 previous={};hip_samples=[]
 for sf in range(start,end+1):
  scene.frame_set(sf);sw=source.matrix_world.copy();hip=sw@source.pose.bones['Bip01 Pelvis'].head
  hip_samples.append(list(hip));posed={}
  for p in ordered:
   world=sw@source.pose.bones[p.name].matrix
   world.translation.x-=hip.x;world.translation.y-=hip.y
   posed[p.name]=inv@normalize@world
  for p in ordered:
   basis=(rest[p.parent.name].inverted()@rest[p.name]).inverted()@posed[p.parent.name].inverted()@posed[p.name] if p.parent else rest[p.name].inverted()@posed[p.name]
   p.matrix_basis=basis
  bpy.context.view_layer.update()
  for p in ordered:
   q=p.rotation_quaternion
   if p.name in previous and q.dot(previous[p.name])<0:q.negate();p.rotation_quaternion=q
   previous[p.name]=q.copy()
   for prop in ['location','rotation_quaternion','scale']:p.keyframe_insert(prop,frame=sf-start+1,group=p.name)
 for fc in action.fcurves:
  for k in fc.keyframe_points:k.interpolation='LINEAR'
 baked.append(action);records.append(dict(name=name,source=filename,sourceFrames=[start,end],duration=(end-start)/30,samples=end-start+1,bones=len(ordered)))
 for obj in imported:bpy.data.objects.remove(obj,do_unlink=True)
 print('BAKED_READING',name,end-start+1,flush=True)
for action in list(bpy.data.actions):
 if action not in baked:bpy.data.actions.remove(action)
target.animation_data.action=baked[0];scene.frame_set(1)
for obj in scene.objects:obj.select_set(False)
target.select_set(True);bpy.context.view_layer.objects.active=target
path=OUT/'reading-mocap.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,
 export_animation_mode='ACTIONS',export_force_sampling=True,
 export_copyright='Microsoft Rocketbox model and mocap, MIT. Reading adaptation by this project.')
(OUT/'manifest.json').write_text(json.dumps(dict(version=1,character='Rocketbox Male Adult 10',license='MIT',
 file=path.name,bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),actions=records,
 notes=['Animation-only export; existing character mesh and textures unchanged.',
 'Seated clips retain the native shoulder, spine and head motion.',
 'Documents clips are adapted upper-body references; book contacts and page gestures are authored for this scene.',
 'Sit/stand weight transfer is a scene-specific transition between same-library standing and sitting poses; not a claimed native sit-down capture.']),indent=2),encoding='utf-8')
print('READING_MOCAP_COMPLETE',path.stat().st_size,flush=True)
