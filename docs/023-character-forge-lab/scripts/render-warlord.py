"""Headless lighting, visual QA and pose metrics for the original warlord."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/warlord'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'warlord.blend'))
scene=bpy.context.scene;rig=bpy.data.objects['CrimsonWarlord_Rig']
for o in scene.objects:
    if o.type=='ARMATURE' and o!=rig:o.hide_render=True
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.resolution_x=1000;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.world.color=(.04,.04,.04)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.045,.06,.085,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
scene.view_settings.view_transform='AgX'
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.018));floor=bpy.context.object
m=bpy.data.materials.new('Studio charcoal');m.diffuse_color=(.055,.065,.08,1);floor.data.materials.append(m)
def area(name,pos,power,color,size):
    bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size
    o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
area('Warm key',(-3,-4,5),850,(1,.88,.72),4)
area('Cool fill',(4,-2,3),700,(.6,.78,1),3)
area('Red rim',(1,3,4),1100,(1,.25,.1),3)
area('Steel rim',(-3,2,3),1000,(.5,.7,1),2)
bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=4.25
def pose(name,frame):
    rig.animation_data.action=bpy.data.actions[name]
    if len(rig.animation_data.action.slots):rig.animation_data.action_slot=rig.animation_data.action.slots[0]
    scene.frame_set(frame);bpy.context.view_layer.update()
def camera(position,target=(0,0,1.45),scale=4.25):
    cam.location=position;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
for name,action,frame,position,target,scale in [
 ('idle-45','Idle',0,(4,-6,3.1),(0,0,1.50),4.25),
 ('idle-front','Idle',0,(0,-7,2.6),(0,0,1.5),4.25),
 ('sweep-contact','Sweep',42,(4,-6,3.8),(0,-.35,1.35),4.6),
 ('slam-contact','LeapSlam',92,(4,-6,3.3),(0,-.35,1.3),4.6),
]:
    pose(action,frame);camera(position,target,scale)
    scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
    print('RENDERED',name,flush=True)
print('RENDER_DONE',flush=True)
