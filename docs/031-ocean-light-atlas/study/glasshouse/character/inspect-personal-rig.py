import bpy,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'character/personal-0597/single-person.blend'))
mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/rocket-guide/rocket-guide.glb'))
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
action=next(a for a in bpy.data.actions if a.name=='Idle')
rig.animation_data_create();rig.animation_data.action=action
if action.slots:rig.animation_data.action_slot=action.slots[0]
bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
data={b.name:{'head':list(rig.matrix_world@b.head),'tail':list(rig.matrix_world@b.tail),'parent':b.parent.name if b.parent else None} for b in rig.pose.bones}
(ROOT/'character/personal-0597/source-rig-idle.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
for name,value in data.items():
 if any(n in name for n in ['Pelvis','Spine','Neck','Head','Clavicle','UpperArm','Forearm','Hand','Thigh','Calf','Foot','Toe0'])and not any(n in name for n in ['Finger','Toe0Nub']):print(name,value)
print('MODEL_SLICES',json.dumps({str(z):[min((v.co.x for v in mesh.data.vertices if abs(v.co.z-z)<.025),default=0),max((v.co.x for v in mesh.data.vertices if abs(v.co.z-z)<.025),default=0)] for z in [.1,.5,.85,1.0,1.15,1.4,1.5,1.6]}))
