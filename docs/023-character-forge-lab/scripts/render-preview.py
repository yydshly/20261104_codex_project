import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/forge-knight.blend'))
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.resolution_x=900
scene.render.resolution_y=900
scene.render.resolution_percentage=100
scene.world.color=(.18,.22,.17)
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.18,.24,.18,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.55

def point(obj,target): obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(3,-5,2.8))
camera=bpy.context.object
camera.data.type='ORTHO'; camera.data.ortho_scale=3.55
point(camera,(0,0,1.32));scene.camera=camera
for pos,power,size,color in [((-3,-4,5),600,4,(1,.88,.71)),((3,1,4),800,3,(.65,1,.81)),((3,-3,2),180,3,(.8,.87,1))]:
    bpy.ops.object.light_add(type='AREA',location=pos)
    light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.data.color=color
    point(light,(0,0,1.3))
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.04))
ground=bpy.context.object
m=bpy.data.materials.new('PreviewStage');m.diffuse_color=(.075,.12,.085,1);m.use_nodes=True
m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.075,.12,.085,1)
m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.85
ground.data.materials.append(m)
scene.render.filepath=str(ROOT/'assets/knight-preview.png')
bpy.ops.render.render(write_still=True)
