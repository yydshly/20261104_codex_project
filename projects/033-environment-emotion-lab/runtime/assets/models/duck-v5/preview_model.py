"""Local review of a downloaded CC-BY model; run with --disable-autoexec."""
import bpy, json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT / "mallard-preview.glb"))
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
coords = [o.matrix_world @ Vector(v) for o in objects for v in o.bound_box]
low = Vector(tuple(min(v[i] for v in coords) for i in range(3)))
high = Vector(tuple(max(v[i] for v in coords) for i in range(3)))
center = (low + high) * .5
size = high - low
report = {
    "blender": bpy.app.version_string,
    "bounds_min": list(low), "bounds_max": list(high), "size": list(size),
    "meshes": len(objects), "triangles": sum(len(o.data.polygons) for o in objects),
    "bones": sum(len(o.data.bones) for o in bpy.context.scene.objects if o.type == 'ARMATURE'),
    "actions": [a.name for a in bpy.data.actions],
    "images": [{"name": i.name, "width": i.size[0], "height": i.size[1]} for i in bpy.data.images if i.type == 'IMAGE'],
}
(ROOT / 'blender-inspection.json').write_text(json.dumps(report, indent=2), encoding='utf-8')

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 1000
scene.render.resolution_y = 850
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world = bpy.data.worlds.new('Review neutral world')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.30, .34, .39, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .65
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'

radius = max(size)
bpy.ops.mesh.primitive_plane_add(size=radius * 200, location=(center.x, center.y, low.z - .005))
floor = bpy.context.object
floor.name = 'Review ground'
mat = bpy.data.materials.new('Matte gray backdrop')
mat.diffuse_color = (.16, .18, .19, 1)
mat.use_nodes = True
mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.16, .18, .19, 1)
mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .9
floor.data.materials.append(mat)

def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

for name, offset, energy, light_size in [
    ('Large soft key', (1.5, -1.5, 3), 420, 2),
    ('Cool fill', (-2, -1, 1), 120, 2),
    ('Rim', (1, 2, 2.2), 280, 1.7),
]:
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy * radius * radius
    data.shape = 'DISK'
    data.size = light_size * radius
    light = bpy.data.objects.new(name, data)
    scene.collection.objects.link(light)
    light.location = center + Vector(offset) * radius
    look_at(light, center)

camera_data = bpy.data.cameras.new('Model review camera')
camera = bpy.data.objects.new('Model review camera', camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
camera_data.type = 'ORTHO'
camera_data.ortho_scale = radius * 1.35
for name, offset in [
    ('quarter', (1.5, -2.3, 1.1)),
    ('side', (2.8, 0, .65)),
    ('rear', (-1.5, 2.3, .9)),
]:
    camera.location = center + Vector(offset) * radius
    look_at(camera, center)
    scene.render.filepath = str(ROOT / ('preview-' + name + '.png'))
    bpy.ops.render.render(write_still=True)

print('DUCK_ASSET_INSPECTION ' + json.dumps(report))
