import bpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/rocket-guide/source'
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/hero-candidates/rocketbox/Male_Adult_10-comparison.blend'))
target=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
rest={b.name:b.matrix_local.copy() for b in target.data.bones}
print('TARGET_WORLD',list(target.matrix_world),[(n,list(target.matrix_world@target.pose.bones[n].head)) for n in ['Bip01 Pelvis','Bip01 Head','Bip01 L Foot','Bip01 R Foot']])
report=[]
for source in json.loads((SOURCE/'animation-sources.json').read_text()):
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.fbx(filepath=str(SOURCE/source['filename']))
 arms=[o for o in bpy.context.scene.objects if o.type=='ARMATURE']
 arm=max(arms,key=lambda a:len(a.data.bones))
 action=arm.animation_data.action
 bpy.context.scene.frame_set(int(action.frame_range[0]))
 print('SOURCE_WORLD',source['action'],list(arm.matrix_world),[(n,list(arm.matrix_world@arm.pose.bones[n].head)) for n in ['Bip01 Pelvis','Bip01 Head','Bip01 L Foot','Bip01 R Foot']])
 names={b.name for b in arm.data.bones}
 diffs={b.name:max(abs(b.matrix_local[i][j]-rest[b.name][i][j]) for i in range(4) for j in range(4)) for b in arm.data.bones if b.name in rest}
 report.append({'id':source['action'],'fps':bpy.context.scene.render.fps,'range':list(action.frame_range),'action':action.name,'bones':len(names),'matched':len(names&set(rest)),'maxRestDifference':max(diffs.values()),'rootBones':[b.name for b in arm.data.bones if b.parent is None],'objects':[(o.name,o.type) for o in bpy.context.scene.objects],'rootTracks':[f.data_path for f in action.fcurves if not f.data_path.startswith('pose.bones')],'sample':[(b.name,list(b.location)) for b in arm.pose.bones if b.parent is None]})
(SOURCE/'animation-inspection.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
