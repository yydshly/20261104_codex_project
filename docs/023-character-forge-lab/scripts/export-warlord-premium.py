"""Export the staged, refined hero without overwriting the accepted runtime.
Usage: blender --background --python scripts/export-warlord-premium.py -- --input PATH
"""
import bpy, json, hashlib, argparse, sys, tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--input',required=True)
p.add_argument('--output',default=str(ROOT/'assets/warlord-premium/final'))
args=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
export_temp=out/'export-temp';export_temp.mkdir(exist_ok=True);tempfile.tempdir=str(export_temp)
bpy.ops.wm.open_mainfile(filepath=str(Path(args.input).resolve()))
scene=bpy.context.scene;rig=bpy.data.objects['CrimsonWarlord_Rig']
expected={'Idle','Walk','Run','Attack1','Attack2','Attack3','Sweep','Guard','LeapSlam','Hit','Death','Dodge','Victory'}
assert {a.name for a in bpy.data.actions}==expected,[(a.name,a.users) for a in bpy.data.actions]
rig.data.pose_position='POSE';rig.animation_data.action=bpy.data.actions['Idle']
if rig.animation_data.action.slots:rig.animation_data.action_slot=rig.animation_data.action.slots[0]
scene.frame_set(0);bpy.context.view_layer.update();rig.animation_data.action=None
for action in bpy.data.actions:action.use_fake_user=True
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
meshes=[]
for ob in scene.objects:
    if ob.type=='MESH' and any(m.type=='ARMATURE' and m.object==rig for m in ob.modifiers):
        ob.hide_render=False;ob.hide_set(False);ob.select_set(True);meshes.append(ob)
bpy.context.view_layer.objects.active=rig
assert len(meshes)>30
scene.frame_start=0;scene.frame_end=200
bpy.ops.wm.save_as_mainfile(filepath=str(out/'warlord.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=str(out/'warlord.glb'),export_format='GLB',use_selection=True,
 export_animations=True,export_animation_mode='ACTIONS',export_skins=True,export_extras=True,export_yup=True)
data=(out/'warlord.glb').read_bytes();size=int.from_bytes(data[12:16],'little');doc=json.loads(data[20:20+size])
assert {a['name'] for a in doc['animations']}==expected
meta=json.loads((ROOT/'assets/warlord/metadata.json').read_text(encoding='utf-8-sig'))
meta.update({'revision':'04 / refined surfaces and cloth','bones':len(rig.data.bones),'meshes':len(doc['meshes']),
 'sha256':hashlib.sha256(data).hexdigest(),'exportedAnimations':[a['name'] for a in doc['animations']],
 'refinements':['Curved armor silhouettes and machined bevels','Image-based albedo, roughness/metallic and tangent normals',
 'Refined eyelids, lips, iris and skin','Multi-chain mantle and plume secondary animation','Baked two-hand polearm control'],
 'files':['warlord.glb','warlord.blend']})
(out/'metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
summary={'status':'exported','bones':len(rig.data.bones),'meshes':len(doc['meshes']),'materials':len(doc.get('materials',[])),
 'images':len(doc.get('images',[])),'animations':len(doc['animations']),'bytes':len(data),'sha256':meta['sha256']}
print('PREMIUM_EXPORT '+json.dumps(summary),flush=True)
