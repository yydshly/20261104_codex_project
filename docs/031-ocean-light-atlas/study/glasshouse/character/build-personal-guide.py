"""Rig the extracted user character and retarget licensed Rocketbox motions.

Preserves the user's mesh/UV/materials. The donor mesh is never exported.
Anatomical rest bones, heat weights plus explicit head/hand isolation, and
rest-frame rotation conversion accommodate the different proportions/pose.
"""
import bpy,json,math,hashlib
import numpy as np
from pathlib import Path
from mathutils import Vector,Matrix,Quaternion

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'character/personal-0597'
OUT=ROOT/'assets/personal-guide';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(WORK/'single-person.blend'))
scene=bpy.context.scene;scene.render.fps=30
mesh=next(o for o in scene.objects if o.type=='MESH')
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/rocket-guide/rocket-guide.glb'))
donor_objects=[o for o in bpy.data.objects if o not in before]
source=next(o for o in donor_objects if o.type=='ARMATURE')
source_actions={name:next(a for a in bpy.data.actions if a.name==name) for name in ['Idle','Walk','Wave','Point','LookAround']}
for name,action in source_actions.items():action.name='DONOR_'+name
def source_action(action):
 source.animation_data_create();source.animation_data.action=action
 if action.slots:source.animation_data.action_slot=action.slots[0]
source_action(source_actions['Idle']);scene.frame_set(1);bpy.context.view_layer.update()
bind={p.name:source.matrix_world@p.matrix for p in source.pose.bones}
source_heads={p.name:source.matrix_world@p.head for p in source.pose.bones}
parents={p.name:p.parent.name if p.parent else None for p in source.pose.bones}
major={
 'Pelvis':(0,.018,.885),'Spine':(0,.018,.995),'Spine1':(0,.012,1.135),'Spine2':(0,.012,1.285),
 'Neck':(0,.005,1.47),'Head':(0,-.008,1.535),
}
for side,sign in [('L',1),('R',-1)]:
 for part,point in {'Clavicle':(.065,.010,1.415),'UpperArm':(.198,.008,1.375),'Forearm':(.255,.012,1.11),
                    'Hand':(.279,-.008,.865),'Thigh':(.105,.012,.88),'Calf':(.120,-.010,.485),
                    'Foot':(.122,.005,.095),'Toe0':(.122,-.125,.045)}.items():
  major[side+' '+part]=(point[0]*sign,point[1],point[2])
heads={}
for name,p in source_heads.items():
 short=name.removeprefix('Bip01 ')
 if short in major:heads[name]=Vector(major[short])
 elif 'Finger' in short:
  anchor='Bip01 '+short[0]+' Hand';heads[name]=heads.get(anchor,Vector(major[short[0]+' Hand']))+(p-source_heads[anchor])
 elif 'Toe' in short:
  anchor='Bip01 '+short[0]+' Toe0';heads[name]=Vector(major[short[0]+' Toe0'])+(p-source_heads[anchor])
 else:heads[name]=Vector(major['Head'])+(p-source_heads['Bip01 Head'])*1.10

chain={'Pelvis':'Spine','Spine':'Spine1','Spine1':'Spine2','Spine2':'Neck','Neck':'Head'}
for side in ['L','R']:
 for a,b in [('Clavicle','UpperArm'),('UpperArm','Forearm'),('Forearm','Hand'),('Thigh','Calf'),('Calf','Foot'),('Foot','Toe0')]:chain[side+' '+a]=side+' '+b
data=bpy.data.armatures.new('Personal0597_AnatomicalRig')
rig=bpy.data.objects.new('Personal0597_Rig',data);scene.collection.objects.link(rig)
for ob in bpy.context.view_layer.objects:ob.select_set(False)
rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
for name,head in heads.items():
 bone=data.edit_bones.new(name);bone.head=head
 short=name.removeprefix('Bip01 ')
 if short in chain:bone.tail=heads['Bip01 '+chain[short]]
 elif short=='Head':bone.tail=head+Vector((0,0,.15))
 elif short.endswith('Hand'):bone.tail=head+Vector((0,-.004,-.105))
 elif short.endswith('Toe0'):bone.tail=head+Vector((0,-.085,0))
 else:bone.tail=head+Vector((0,0,.025))
 if (bone.tail-bone.head).length<.003:bone.tail.z+=.025
for name,parent in parents.items():
 if parent:data.edit_bones[name].parent=data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
deform=set('Bip01 '+name for name in major)|{'Bip01 L Toe0','Bip01 R Toe0'}
for bone in data.bones:bone.use_deform=bone.name in deform
rest={b.name:b.matrix_local.copy() for b in data.bones}
for ob in bpy.context.view_layer.objects:ob.select_set(False)
mesh.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=rig
try:bpy.ops.object.parent_set(type='ARMATURE_AUTO')
except RuntimeError as error:print('HEAT_WARNING',error,flush=True)
weighted=sum(any(g.weight>1e-5 for g in v.groups) for v in mesh.data.vertices)
print('HEAT_WEIGHTED',weighted,len(mesh.data.vertices),flush=True)
assert weighted/len(mesh.data.vertices)>.99,'Automatic binding could not weight this mesh; do not export an unbound model'
def weights(vertex,values):
 for group in list(vertex.groups):mesh.vertex_groups[group.group].remove([vertex.index])
 for name,weight in values.items():
  if weight<1e-6:continue
  vg=mesh.vertex_groups.get(name) or mesh.vertex_groups.new(name=name);vg.add([vertex.index],weight,'REPLACE')
# Keep spectacles, ears, hair and facial surfaces together. No fake face rig.
for v in mesh.data.vertices:
 x,y,z=v.co
 if z>1.52:weights(v,{'Bip01 Head':1})
 elif z>1.45 and abs(x)<.115:
  t=max(0,min(1,(z-1.45)/.07));weights(v,{'Bip01 Head':t,'Bip01 Neck':1-t})
 elif abs(x)>.235 and z<.91:
  side='L' if x>0 else 'R';t=max(0,min(1,(z-.84)/.07))
  weights(v,{'Bip01 '+side+' Hand':1-t*.30,'Bip01 '+side+' Forearm':t*.30})
 # Keep left/right trouser legs independent below the crotch.
 elif z<.77:
  side='L' if x>0 else 'R';allowed={'Bip01 '+side+' '+p for p in ['Thigh','Calf','Foot','Toe0']}
  values={mesh.vertex_groups[g.group].name:g.weight for g in v.groups if mesh.vertex_groups[g.group].name in allowed}
  total=sum(values.values())
  if total>1e-7:weights(v,{k:w/total for k,w in values.items()})
for v in mesh.data.vertices:
 influences=sorted((g for g in v.groups if g.weight>1e-6),key=lambda g:g.weight,reverse=True)[:4]
 values={mesh.vertex_groups[g.group].name:g.weight for g in influences};total=sum(values.values())
 assert total>0
 weights(v,{k:w/total for k,w in values.items()})
rig.animation_data_create()
ordered=sorted(rig.pose.bones,key=lambda b:len(b.parent_recursive))
bind_quats={name:matrix.to_quaternion() for name,matrix in bind.items()}
world_object_quat=source.matrix_world.to_quaternion()
parent_bind={name:bind_quats[parent] if parent else world_object_quat for name,parent in parents.items()}
source_local_bind={name:parent_bind[name].inverted()@q for name,q in bind_quats.items()}
target_quats={name:matrix.to_quaternion() for name,matrix in rest.items()}
clips=[];baked=[];buffer=np.empty(len(mesh.data.vertices)*3,dtype=np.float32)
root=next(p for p in ordered if not p.parent)
root_inverse=rest[root.name].to_quaternion().inverted()
for name,donor in source_actions.items():
 source_action(donor);start,end=map(round,donor.frame_range)
 action=bpy.data.actions.new(name);action.use_fake_user=True;rig.animation_data.action=action
 previous={};floor_errors=[]
 for frame in range(start,end+1):
  scene.frame_set(frame)
  globals={p.name:(source.matrix_world@p.matrix).to_quaternion() for p in source.pose.bones}
  for p in ordered:
   parent=parents[p.name];parent_current=globals[parent] if parent else world_object_quat
   local_delta=(parent_current.inverted()@globals[p.name])@source_local_bind[p.name].inverted()
   q=target_quats[p.name].inverted()@parent_bind[p.name]@local_delta@parent_bind[p.name].inverted()@target_quats[p.name]
   if name=='Walk' and p.name in ['Bip01 L UpperArm','Bip01 R UpperArm']:
    # The suit is wider than the mocap donor's jacket; leave a small clearance
    # for the relaxed hands rather than letting them swing into the coat.
    angle=-.04 if ' L ' in p.name else .04
    q=(target_quats[p.name].inverted()@Quaternion((0,1,0),angle)@target_quats[p.name])@q
   p.rotation_mode='QUATERNION';p.rotation_quaternion=q
   p.location=(0,0,0);p.scale=(1,1,1)
  displacement=(source.matrix_world@source.pose.bones[root.name].head)-source_heads[root.name]
  root.location=root_inverse@displacement
  bpy.context.view_layer.update()
  evaluated=mesh.evaluated_get(bpy.context.evaluated_depsgraph_get());evaluated.data.vertices.foreach_get('co',buffer)
  bottom=float(buffer.reshape(-1,3)[:,2].min());root.location+=root_inverse@Vector((0,0,-bottom));bpy.context.view_layer.update()
  evaluated=mesh.evaluated_get(bpy.context.evaluated_depsgraph_get());evaluated.data.vertices.foreach_get('co',buffer)
  floor_errors.append(float(buffer.reshape(-1,3)[:,2].min()))
  for p in ordered:
   if p.name in previous and p.rotation_quaternion.dot(previous[p.name])<0:p.rotation_quaternion.negate()
   previous[p.name]=p.rotation_quaternion.copy()
   p.keyframe_insert('rotation_quaternion',frame=frame-start+1,group=p.name)
   if p==root:p.keyframe_insert('location',frame=frame-start+1,group=p.name)
 for fc in action.fcurves:
  for key in fc.keyframe_points:key.interpolation='LINEAR'
 clips.append({'name':name,'frames':end-start+1,'duration':(end-start)/30,'floorErrorMax':max(map(abs,floor_errors))})
 baked.append(action);print('PERSONAL_BAKED',name,flush=True)
for ob in donor_objects:bpy.data.objects.remove(ob,do_unlink=True)
for action in list(bpy.data.actions):
 if action not in baked:bpy.data.actions.remove(action)
rig.animation_data.action=baked[0];scene.frame_set(1);bpy.context.view_layer.update()
for ob in bpy.context.view_layer.objects:ob.select_set(False)
mesh.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=rig
mesh['source']='User provided 0597b54ff20068bcd556b1e005aed56d.glb, front-facing figure'
mesh['rigging']='Locally fitted humanoid rig and skin weights; Rocketbox motion retargeted to this mesh'
path=OUT/'personal-guide.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,
 export_animation_mode='ACTIONS',export_force_sampling=True,export_extras=True,
 export_copyright='Character appearance: user-provided asset, original terms retained. Animation and rig reference: Copyright (c) 2020 Microsoft, MIT License.')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'personal-guide.blend'))
manifest={'version':1,'character':'User 0597 / single front-facing figure','file':path.name,'bytes':path.stat().st_size,
 'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bones':len(data.bones),'vertices':len(mesh.data.vertices),'triangles':sum(len(p.vertices)-2 for p in mesh.data.polygons),
 'height':1.78,'actions':clips,'walkSpeed':1.310632639339958,'sourceModel':'../user-model-0597/manifest.json',
 'sourceSha256':json.loads((ROOT/'assets/user-model-0597/manifest.json').read_text(encoding='utf-8'))['sha256'],
 'selection':'Second / front-facing figure, extracted through empty X gaps','maxWeightsPerVertex':4,
 'motionSource':'https://github.com/microsoft/Microsoft-Rocketbox','motionLicense':'MIT','modelLicense':'User-provided; original generation terms not independently verified',
 'status':'rigged implementation; browser and user visual review required','limitations':['No facial expression or individual finger animation.','Original generated eye detail retained.','Runtime stairs/contact require the website controller.']}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('PERSONAL_GUIDE_COMPLETE',json.dumps({'bytes':path.stat().st_size,'bones':len(data.bones),'clips':clips}),flush=True)
