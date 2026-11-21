import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
report=[]
for outfit in ['hoodie','linen','knit']:
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for a in list(bpy.data.actions):bpy.data.actions.remove(a,do_unlink=True)
    bpy.context.scene.render.fps=30
    bpy.ops.import_scene.gltf(filepath=str(root/f'assets/guide/guide-{outfit}.glb'))
    rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
    meshes=[o for o in bpy.data.objects if o.type=='MESH' and o.get('role')=='character'];actions=list(bpy.data.actions)
    samples=[]
    for wanted,t in [('Idle',0),('Walk',.25),('Walk',.5),('Wave',1.4),('Point',1.3),('SitIdle',1),('StandUp',1.4)]:
        action=next(a for a in actions if a.name.startswith(wanted))
        rig.animation_data_create();rig.animation_data.action=action
        if action.slots:rig.animation_data.action_slot=action.slots[0]
        bpy.context.scene.frame_set(round(t*30));bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
        points=[o.evaluated_get(deps).matrix_world@Vector(v) for o in meshes for v in o.evaluated_get(deps).bound_box]
        samples.append({'action':wanted,'time':t,'minZ':min(p.z for p in points),'maxZ':max(p.z for p in points)})
    report.append({'outfit':outfit,'bones':len(rig.data.bones),'meshes':len(meshes),'actions':[a.name for a in actions],'samples':samples})
    print('POSE_REPORT',json.dumps(report[-1]),flush=True)
    (root/'assets/guide/import-validation.json').write_text(json.dumps({'freshBlenderImport':True,'passed':False,'report':report},indent=2))
    assert len(rig.data.bones)>=60 and len(actions)==7
    assert all(abs(s['minZ'])<.08 for s in samples), 'Inspect foot-floor contact'
(root/'assets/guide/import-validation.json').write_text(json.dumps({'freshBlenderImport':True,'passed':True,'report':report},indent=2))
print('GUIDE_IMPORT_VERIFIED',json.dumps(report),flush=True)
