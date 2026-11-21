"""Local geometry inspection. Leaves the source blend and GLB untouched."""
import bpy,json,math,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'character/personal-0597'
OUT=WORK/('detail-after' if '--detail' in sys.argv else 'detail-review');OUT.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(WORK/('personal-guide-detail.blend' if '--detail' in sys.argv else 'personal-guide.blend')))
scene=bpy.context.scene
mesh=next(o for o in scene.objects if o.type=='MESH')
rig=next(o for o in scene.objects if o.type=='ARMATURE')
rig.data.pose_position='REST'
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1000;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Detail review world');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.18,.20,.23,1)
scene.view_settings.view_transform='AgX'
def light(name,p,energy,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size
 o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=p;o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
light('Key',(-1.5,-2.5,3),130,2.1);light('Fill',(2,-1.5,2),60,2.5)
cam=bpy.data.objects.new('Detail camera',bpy.data.cameras.new('Detail camera'));scene.collection.objects.link(cam);scene.camera=cam;cam.data.type='ORTHO'
original=list(mesh.data.materials);original_indices=[p.material_index for p in mesh.data.polygons]
clay=bpy.data.materials.new('Inspection clay');clay.diffuse_color=(.35,.39,.42,1);clay.use_nodes=True;clay.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.35,.39,.42,1)
for label,position,target,scale,clay_mode in [
 ('head-front',(0,-2,1.655),(0,0,1.655),.29,False),
 ('head-clay',(0,-2,1.655),(0,0,1.655),.29,True),
 ('head-quarter',(.8,-1.8,1.66),(0,0,1.655),.29,False),
 ('hands-front',(0,-2,.86),(0,0,.86),.73,False),
 ('sleeve-side',(.9,-1.8,1.03),(.235,0,1.03),.34,False)]:
 if '--quick' in sys.argv and label not in ['head-front','hands-front']:continue
 mesh.data.materials.clear()
 for mat in ([clay] if clay_mode else original):mesh.data.materials.append(mat)
 for p,i in zip(mesh.data.polygons,original_indices):p.material_index=0 if clay_mode else i
 cam.location=position;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
 scene.render.filepath=str(OUT/(label+'.png'));bpy.ops.render.render(write_still=True)
points=[list(v.co) for v in mesh.data.vertices if v.co.z>1.54]
(OUT/'inspection.json').write_text(json.dumps({'vertices':len(mesh.data.vertices),'headBounds':[[min(p[k] for p in points) for k in range(3)],[max(p[k] for p in points) for k in range(3)]],'materials':[m.name for m in original],'objects':[(o.name,o.type) for o in scene.objects]},indent=2))
print('DETAIL_INSPECTED',str(OUT),flush=True)
