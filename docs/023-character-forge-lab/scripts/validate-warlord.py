"""Headless acceptance of the editable rig and an independent runtime GLB import."""
import bpy, json, math, struct, hashlib, argparse, sys
from pathlib import Path
from mathutils import Vector

p=argparse.ArgumentParser();p.add_argument('--asset-dir',default=str(Path(__file__).resolve().parents[1]/'assets/warlord'))
args=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
OUT=Path(args.asset_dir).resolve()
EXPECTED={'Idle':2.,'Walk':1.1,'Run':.8,'Attack1':.72,'Attack2':.82,'Attack3':1.,'Sweep':1.08,'Guard':.32,'LeapSlam':1.28,'Hit':.55,'Death':1.2,'Dodge':.4,'Victory':1.6}
bpy.ops.wm.open_mainfile(filepath=str(OUT/'warlord.blend'))
rig=bpy.data.objects['CrimsonWarlord_Rig'];scene=bpy.context.scene
assert set(a.name for a in bpy.data.actions)==set(EXPECTED)
reach={};root_max=0.
for name,seconds in EXPECTED.items():
    action=bpy.data.actions[name];rig.animation_data.action=action
    if len(action.slots):rig.animation_data.action_slot=action.slots[0]
    distances=[]
    for frame in range(round(seconds*100)+1):
        scene.frame_set(frame)
        root_max=max(root_max,rig.pose.bones['root'].location.length)
        grip=rig.pose.bones['HalberdGrip'].head.copy();tip=rig.pose.bones['HalberdTip'].head.copy();shaft=(tip-grip).normalized()
        for side in ['l','r']:
            d=rig.pose.bones['hand_'+side].head-grip
            distances.append((d-shaft*d.dot(shaft)).length*rig.scale.x)
    reach[name]=round(max(distances),5)
    assert reach[name]<.071,(name,'hand detached from shaft',reach[name])
assert root_max<.00001,root_max
rig.animation_data.action=bpy.data.actions['LeapSlam']
if len(rig.animation_data.action.slots):rig.animation_data.action_slot=rig.animation_data.action.slots[0]
scene.frame_set(92)
landing_tip=(rig.matrix_world@rig.pose.bones['HalberdTip'].head).z
def landing_pose(frame):
    scene.frame_set(frame)
    knees={}
    for side in ['l','r']:
        a=rig.pose.bones['thigh_'+side].head;b=rig.pose.bones['calf_'+side].head;c=rig.pose.bones['foot_'+side].head
        knees[side]=math.degrees((b-a).angle(c-b))
    chest=rig.pose.bones['spine_03'].head-rig.pose.bones['spine_02'].head
    return {'pelvis':rig.pose.bones['pelvis'].head.copy(),'feet':{s:rig.pose.bones['foot_'+s].head.copy() for s in ['l','r']},'knees':knees,'chestTilt':math.degrees(math.atan2(-chest.y,chest.z))}
before=landing_pose(84);contact=landing_pose(92);recovered=landing_pose(128)
landing={'pelvisCompressionMeters':round((before['pelvis'].z-contact['pelvis'].z)*rig.scale.x,5),'kneeBendDegrees':{k:round(v,2) for k,v in contact['knees'].items()},'additionalChestLeanDegrees':round(contact['chestTilt']-before['chestTilt'],2),'ankleDriftMeters':round(max((contact['feet'][s]-before['feet'][s]).length*rig.scale.x for s in ['l','r']),6),'recoveredPelvisHeightMeters':round(recovered['pelvis'].z*rig.scale.x,5)}
assert .17<landing['pelvisCompressionMeters']<.19,landing
assert min(landing['kneeBendDegrees'].values())>25,landing
assert landing['ankleDriftMeters']<.002,landing

data=(OUT/'warlord.glb').read_bytes()
assert data[:4]==b'glTF' and struct.unpack_from('<I',data,4)[0]==2
json_size=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+json_size])
animations=doc['animations'];names={a['name'] for a in animations}
assert names==set(EXPECTED),names
durations={a['name']:max(doc['accessors'][s['input']]['max'][0] for s in a['samplers']) for a in animations}
assert all(abs(durations[k]-v)<.00001 for k,v in EXPECTED.items()),durations
node_names={n.get('name') for n in doc['nodes']}
assert {'HalberdTip','HalberdGrip','Halberd_Control','root'}<=node_names
assert len(doc.get('skins',[]))>0 and len(doc.get('meshes',[]))>0

# An actual fresh importer must accept the delivered GLB and its skin/animations.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps=100
bpy.ops.import_scene.gltf(filepath=str(OUT/'warlord.glb'))
assert set(a.name for a in bpy.data.actions)==set(EXPECTED)
imported_rigs=[o for o in bpy.data.objects if o.type=='ARMATURE']
assert len(imported_rigs)==1
assert {'HalberdTip','HalberdGrip'}<=set(b.name for b in imported_rigs[0].data.bones)
summary={'status':'passed','format':'glTF 2.0 binary','freshBlenderImport':True,'clipCount':len(animations),'durations':durations,'rootMaxLocalTranslation':round(root_max,8),'maxWristDistanceToShaftMeters':reach,'landingTipHeightMeters':round(landing_tip,5),'landingCompression':landing,'attachmentNodes':['HalberdTip','HalberdGrip'],'meshes':len(doc['meshes']),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
(OUT/'validation.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print('WARLORD_VALIDATED',json.dumps(summary),flush=True)
