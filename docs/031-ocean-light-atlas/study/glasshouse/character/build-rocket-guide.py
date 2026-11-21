"""Bake same-library mocap onto the finished Rocketbox Male Adult 10 character.

All input model and motion data: Microsoft/Rocketbox, MIT. World transforms are
transferred across the shared 80 named joints; the 121-joint motion rig is not
mistaken for the character's bind skeleton. Scene travel is handled at runtime.
"""
import bpy, json, math, hashlib
from pathlib import Path
from mathutils import Matrix,Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/rocket-guide'
SOURCE=OUT/'source'
records=json.loads((SOURCE/'animation-sources.json').read_text())
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/hero-candidates/rocketbox/Male_Adult_10-comparison.blend'))
scene=bpy.context.scene
scene.render.fps=30
target=next(o for o in scene.objects if o.type=='ARMATURE')
target.animation_data_clear()
for p in target.pose.bones:
 p.matrix_basis=Matrix.Identity(4)
 p.rotation_mode='QUATERNION'
bpy.context.view_layer.update()
target_objects=list(scene.objects)
target_world=target.matrix_world.copy()
target_inverse=target_world.inverted()
rest={b.name:b.matrix_local.copy() for b in target.data.bones}
ordered=sorted(target.pose.bones,key=lambda b:len(b.parent_recursive))
mesh=next(o for o in scene.objects if o.type=='MESH')
root=next(p for p in ordered if p.parent is None)
clips=[]
baked=[]
for record in records:
 before=set(bpy.data.objects)
 bpy.ops.import_scene.fbx(filepath=str(SOURCE/record['filename']))
 imported=[o for o in bpy.data.objects if o not in before]
 source=max((o for o in imported if o.type=='ARMATURE'),key=lambda o:len(o.data.bones))
 source_action=source.animation_data.action
 start,end=map(round,source_action.frame_range)
 if record['action']=='Point':end=min(end,start+120)
 scene.frame_set(start)
 scale=target_world.to_scale().length/source.matrix_world.to_scale().length
 normalize=Matrix.Scale(scale,4)
 action=bpy.data.actions.new(record['action'])
 action.use_fake_user=True
 target.animation_data_create()
 target.animation_data.action=action
 previous_quaternions={}
 floor_samples=[]
 hip_samples=[]
 for source_frame in range(start,end+1):
  frame=source_frame-start+1
  scene.frame_set(source_frame)
  source_world=source.matrix_world.copy()
  pelvis_world=source_world@source.pose.bones['Bip01 Pelvis'].head
  hip_samples.append(list(pelvis_world))
  posed={}
  for p in ordered:
   if p.name not in source.pose.bones:raise RuntimeError(f'Missing source joint {p.name}')
   world=source_world@source.pose.bones[p.name].matrix
   # Strip horizontal root travel from every joint. Preserve vertical motion.
   world.translation.x-=pelvis_world.x
   world.translation.y-=pelvis_world.y
   posed[p.name]=target_inverse@normalize@world
  for p in ordered:
   if p.parent:
    local_rest=rest[p.parent.name].inverted()@rest[p.name]
    basis=local_rest.inverted()@posed[p.parent.name].inverted()@posed[p.name]
   else:basis=rest[p.name].inverted()@posed[p.name]
   p.matrix_basis=basis
  bpy.context.view_layer.update()
  # The clips contain no jumps. Keep at least one sole on the local ground.
  evaluated=mesh.evaluated_get(bpy.context.evaluated_depsgraph_get())
  bottom=min((evaluated.matrix_world@v.co).z for v in evaluated.data.vertices)
  correction=target_inverse.to_3x3()@Vector((0,0,-bottom))
  root.location+=rest[root.name].inverted().to_3x3()@correction
  bpy.context.view_layer.update()
  evaluated=mesh.evaluated_get(bpy.context.evaluated_depsgraph_get())
  floor_samples.append(min((evaluated.matrix_world@v.co).z for v in evaluated.data.vertices))
  for p in ordered:
   q=p.rotation_quaternion
   if p.name in previous_quaternions and q.dot(previous_quaternions[p.name])<0:
    q.negate();p.rotation_quaternion=q
   previous_quaternions[p.name]=q.copy()
   p.keyframe_insert('location',frame=frame,group=p.name)
   p.keyframe_insert('rotation_quaternion',frame=frame,group=p.name)
   p.keyframe_insert('scale',frame=frame,group=p.name)
 for fc in action.fcurves:
  for key in fc.keyframe_points:key.interpolation='LINEAR'
 duration=(end-start)/30
 travel=Vector(hip_samples[-1])-Vector(hip_samples[0])
 clips.append({'name':record['action'],'source':record['filename'],'sourceFrames':[start,end],
               'duration':duration,'samples':end-start+1,'groundErrorMax':max(abs(v) for v in floor_samples),
               'sourcePlanarTravel':math.hypot(travel.x,travel.y)*scale})
 baked.append(action)
 for obj in imported:bpy.data.objects.remove(obj,do_unlink=True)
 print('BAKED',record['action'],duration,flush=True)

for action in list(bpy.data.actions):
 if action not in baked:bpy.data.actions.remove(action)
target.animation_data.action=baked[0]
scene.frame_start=1
scene.frame_end=max(round(action.frame_range[1]) for action in baked)
scene.frame_set(1)
for obj in bpy.context.view_layer.objects:obj.select_set(False)
for obj in target_objects:obj.select_set(True)
bpy.context.view_layer.objects.active=target
path=OUT/'rocket-guide.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,
 export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,
 export_copyright='Copyright (c) 2020 Microsoft. MIT License. Model and mocap: Microsoft/Rocketbox.',export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'character/rocket-guide.blend'))
manifest={'version':1,'character':'Rocketbox Male Adult 10','license':'MIT',
 'source':'https://github.com/microsoft/Microsoft-Rocketbox','file':'rocket-guide.glb',
 'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
 'bones':len(target.data.bones),'actions':clips,
 'walkSpeed':next(c['sourcePlanarTravel']/c['duration'] for c in clips if c['name']=='Walk'),
 'height':1.78,'status':'animated-first-version; user visual acceptance pending',
 'notes':['Finished author model, author textures and same-library mocap.',
          'No prototype likeness or clothing matching required for this version.',
          'Horizontal root travel removed; scene paths control movement.',
          'Point is a 4-second presentation gesture, not exact index-finger targeting.',
          'Base GLB contains flat-ground clips; website foot-placement.js supplies runtime stair IK and contact.']}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('ROCKET_GUIDE_COMPLETE',path.stat().st_size)
