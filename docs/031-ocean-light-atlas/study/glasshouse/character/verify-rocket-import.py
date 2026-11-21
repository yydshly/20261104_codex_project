"""Independent GLB reimport: exported skin, actions and ground contact samples."""
import bpy,json,math,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.fps=30
directory='personal-guide' if '--personal' in sys.argv else 'rocket-guide'
variant='-facial' if '--facial' in sys.argv else '-head' if '--head' in sys.argv else '-orbit' if '--orbit' in sys.argv else '-detail' if '--detail' in sys.argv else ''
asset=json.loads((ROOT/'assets'/directory/f'manifest{variant}.json').read_text(encoding='utf-8'))['file']
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets'/directory/asset))
arm=max((o for o in scene.objects if o.type=='ARMATURE'),key=lambda o:len(o.data.bones))
meshes=[o for o in scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' and m.object==arm for m in o.modifiers)]
assert len(meshes)==1,[o.name for o in meshes]
records=[]
for action in bpy.data.actions:
 arm.animation_data_create();arm.animation_data.action=action
 if hasattr(action,'slots') and len(action.slots):arm.animation_data.action_slot=action.slots[0]
 start,end=action.frame_range
 samples=[]
 for factor in [0,.125,.25,.375,.5,.625,.75,.875,1]:
  at=float(start+(end-start)*factor);scene.frame_set(math.floor(at),subframe=at%1)
  deps=bpy.context.evaluated_depsgraph_get()
  vertices=[obj.evaluated_get(deps).matrix_world@v.co for obj in meshes for v in obj.evaluated_get(deps).data.vertices]
  assert all(all(math.isfinite(c) for c in v) for v in vertices)
  hand=next(b for b in arm.pose.bones if b.name.replace('_',' ')=='Bip01 R Hand')
  samples.append({'frame':at,'minZ':min(v.z for v in vertices),'maxZ':max(v.z for v in vertices),'hand':list(arm.matrix_world@hand.head)})
 assert max(abs(s['minZ']) for s in samples)<.02,(action.name,samples)
 records.append({'action':action.name,'frames':[start,end],'samples':samples})
assert len(records)==5,len(records)
assert len(arm.data.bones)==80
wave=next(r for r in records if r['action'].endswith('Wave'))
assert max(sum((a-b)**2 for a,b in zip(s['hand'],wave['samples'][0]['hand']))**.5 for s in wave['samples'])>.1
result={'bones':len(arm.data.bones),'meshes':len(meshes),'actions':records,'note':'Sampled exported animation; not a general foot-IK or no-intersection guarantee.'}
if '--facial' in sys.argv:
 keys=meshes[0].data.shape_keys;assert keys is not None
 shape_names=[k.name for k in keys.key_blocks if k.name!='Basis'];assert len(shape_names)==21,shape_names
 basis=keys.key_blocks['Basis'];changes={}
 for name in shape_names:
  shape=keys.key_blocks[name];deltas=[(a.co-b.co).length for a,b in zip(shape.data,basis.data)]
  assert all(math.isfinite(v) for v in deltas);assert max(deltas)>.0002,(name,max(deltas))
  assert all(deltas[i]<.000001 for i,v in enumerate(basis.data) if v.co.z<1.4),(name,'body must stay unchanged')
  changes[name]={'maxDisplacement':max(deltas),'changedVertices':sum(v>.000001 for v in deltas)}
 result['ownFacialShapes']={'count':len(shape_names),'shapes':changes,'note':'Shapes authored on own 0597 head. Displacement checks do not certify speech naturalness.'}
if '--head' in sys.argv:
 facial={}
 for name in ['REye','LEye','MJaw','MUpperLip','MBottomLip','REyeBlinkTop','LEyeBlinkTop','ROuterEyebrow','LOuterEyebrow']:
  key='Bip01 '+name
  count=sum(any(obj.vertex_groups[g.group].name.replace('_',' ')==key and g.weight>.001 for g in v.groups) for obj in meshes for v in obj.data.vertices)
  facial[name]=count
 assert all(facial.values()),facial
 def sampled():
  bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
  return [obj.evaluated_get(deps).matrix_world@v.co for obj in meshes for v in obj.evaluated_get(deps).data.vertices]
 before=sampled();jaw=next(b for b in arm.pose.bones if b.name.replace('_',' ')=='Bip01 MJaw');saved=jaw.location.copy();jaw.location.y+=.002;after=sampled();jaw.location=saved;bpy.context.view_layer.update()
 displacement=max((a-b).length for a,b in zip(before,after));assert displacement>.0001,displacement
 result['facialSkin']={'weightedVertexCounts':facial,'jawControlDisplacement':displacement,'morphTargets':sum(len(o.data.shape_keys.key_blocks)-1 if o.data.shape_keys else 0 for o in meshes),'note':'Mechanical skin check only. Speech, visemes and facial performance not implemented or visually accepted.'}
(ROOT/'assets'/directory/f'import-validation{variant}.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({'bones':result['bones'],'actions':[(r['action'],min(s['minZ'] for s in r['samples']),max(s['minZ'] for s in r['samples'])) for r in records]}))
