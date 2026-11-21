import bpy,json
from pathlib import Path
from mathutils import Vector
OUT=Path(__file__).resolve().parents[1]/'assets/warlord'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'warlord.blend'))
r=bpy.data.objects['CrimsonWarlord_Rig']
for name,frame in [('Idle',0),('Sweep',42),('LeapSlam',92),('Attack1',23)]:
 a=bpy.data.actions[name];r.animation_data.action=a
 if len(a.slots):r.animation_data.action_slot=a.slots[0]
 bpy.context.scene.frame_set(frame)
 result={}
 for bone in ['root','pelvis','spine_03','Head','Halberd_Control','HalberdTip','upperarm_l','upperarm_r','lowerarm_l','lowerarm_r','hand_l','hand_r']:
  b=r.pose.bones[bone];result[bone]={'head':list(b.head),'euler':list(b.matrix.to_euler())}
 print('POSE',name,json.dumps(result),flush=True)
