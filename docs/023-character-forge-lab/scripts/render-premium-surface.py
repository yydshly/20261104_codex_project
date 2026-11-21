import bpy, math
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[1];O=R/'assets/warlord-premium'
bpy.ops.wm.open_mainfile(filepath=str(O/'surface.blend'))
s=bpy.context.scene;r=bpy.data.objects['CrimsonWarlord_Rig'];r.animation_data.action=bpy.data.actions['Idle'];r.animation_data.action_slot=r.animation_data.action.slots[0];s.frame_set(0)
s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=True;s.render.resolution_x=1200;s.render.resolution_y=1350;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX'
s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.055,.075,.12,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.4
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.018));f=bpy.context.object;m=bpy.data.materials.new('PremiumStage');m.diffuse_color=(.022,.027,.035,1);f.data.materials.append(m)
def area(pos,power,color,size):
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
area((-3,-4,5),1100,(1,.88,.72),4);area((4,-2,3),850,(.63,.78,1),3);area((1,3,4),1200,(1,.28,.13),3);area((-3,2,3),1300,(.5,.7,1),2)
bpy.ops.object.camera_add();c=bpy.context.object;s.camera=c;c.data.type='ORTHO'
for name,pos,target,scale in [('surface-full',(4,-6,3.1),(0,0,1.50),4.15),('surface-face',(4,-6,2.6),(0,-.03,1.87),.67)]:
 c.location=pos;c.rotation_euler=(Vector(target)-c.location).to_track_quat('-Z','Y').to_euler();c.data.ortho_scale=scale;s.render.filepath=str(O/(name+'.png'));bpy.ops.render.render(write_still=True);print('RENDERED',name,flush=True)
