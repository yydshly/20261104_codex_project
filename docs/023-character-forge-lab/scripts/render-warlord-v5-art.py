import bpy,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/warlord-v5'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'art.blend'))
s=bpy.context.scene;r=bpy.data.objects['CrimsonWarlord_Rig'];r.animation_data.action=bpy.data.actions['Idle'];r.animation_data.action_slot=r.animation_data.action.slots[0];s.frame_set(0)
s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=True;s.render.resolution_x=1100;s.render.resolution_y=1300;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX'
s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.055,.075,.12,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.35
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.018));f=bpy.context.object;m=bpy.data.materials.new('V5StudioFloor');m.diffuse_color=(.022,.027,.035,1);f.data.materials.append(m)
def area(pos,power,color,size):
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
area((-3,-4,5),1000,(1,.88,.72),4);area((4,-2,3),750,(.63,.78,1),3);area((1,3,4),1000,(1,.28,.13),3);area((-3,2,3),1100,(.5,.7,1),2)
bpy.ops.object.camera_add();c=bpy.context.object;s.camera=c;c.data.type='ORTHO'
for name,pos,target,scale in [('art-three-quarter',(4,-6,3.1),(0,0,1.48),4.10),('art-face',(4,-6,2.6),(0,-.03,1.87),.67),('art-front',(0,-7,2.8),(0,-.03,1.47),4.10)]:
 print('V5_RENDER_STAGE '+name,flush=True);c.location=pos;c.rotation_euler=(Vector(target)-c.location).to_track_quat('-Z','Y').to_euler();c.data.ortho_scale=scale;s.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
print('V5_RENDER_DONE',flush=True)
