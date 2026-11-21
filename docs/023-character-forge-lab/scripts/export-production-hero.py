"""Organize the free CC0 GLB into an editable derivative .blend and game FBX.
This does not reproduce or claim the paid author SOURCE tier.
"""
from pathlib import Path
import bpy, json, math
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/game'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.fps=30
bpy.context.preferences.filepaths.save_version=0
bpy.ops.import_scene.gltf(filepath=str(OUT/'hero.glb'))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
hero=bpy.data.objects.get('Hero')
rig['asset_author']='Kay Lousberg / KayKit'
rig['license']='CC0-1.0'
rig['working_file']='Imported/organized from the free GLB. Not the paid KayKit SOURCE pack.'
hero['game_forward']='Source glTF +Z; Blender imported forward -Y'
hero['game_height_m']=1.85
hero['game_planar_motion']='Controller driven / in-place'
for tr in rig.animation_data.nla_tracks: tr.mute=True
idle=bpy.data.actions.get('Idle')
rig.animation_data.action=idle
scene.frame_set(0)
for a in bpy.data.actions: a.use_fake_user=True
bpy.ops.file.pack_all()
# Export only the character hierarchy; importer-created custom bone-shape helpers
# are not gameplay geometry.
def descend(obj):
    yield obj
    for c in obj.children: yield from descend(c)
objects=list(descend(hero))
bpy.ops.object.select_all(action='DESELECT')
for o in objects: o.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'hero.blend'))
bpy.ops.export_scene.fbx(filepath=str(OUT/'hero.fbx'),use_selection=True,object_types={'ARMATURE','MESH','EMPTY'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=True,bake_anim_use_nla_strips=False,axis_forward='-Z',axis_up='Y',path_mode='COPY',embed_textures=True)

# Measure the evaluated pose and verify animations can all be evaluated.
checks=[]
for name in ['Idle','Walk','Run','Attack1','Attack2','Attack3','Block','BlockHit','Hit','Death','Dodge','Victory']:
    a=bpy.data.actions.get(name)
    assert a is not None, name
    rig.animation_data.action=a
    scene.frame_set(round((a.frame_range.x+a.frame_range.y)/2))
    bpy.context.view_layer.update()
    checks.append({'name':name,'duration':(a.frame_range.y-a.frame_range.x)/30,'frameRange':list(a.frame_range),'bones':len(rig.data.bones)})
(OUT/'blender-import-check.json').write_text(json.dumps({'status':'passed','blender':bpy.app.version_string,'actions':checks,'workFileProvenance':'Editable derivative imported from free KayKit GLB; not author SOURCE pack.'},indent=2),encoding='utf-8')
rig.animation_data.action=idle
scene.frame_set(0)

# Render a genuine asset preview without modifying the delivered character file.
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=800;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.06,.08,.12,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.55
def point(obj,target):obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(3,-5,2.5));camera=bpy.context.object
camera.data.type='ORTHO';camera.data.ortho_scale=2.8
point(camera,(0,0,.95));scene.camera=camera
for loc,power,size,color in [((-3,-4,5),500,4,(1,.82,.63)),((3,2,3),650,3,(.42,.68,1)),((3,-3,2),160,3,(.78,.88,1))]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;point(o,(0,0,.9))
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.02));ground=bpy.context.object
mat=bpy.data.materials.new('Preview Ground');mat.use_nodes=True
mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.035,.05,.065,1)
mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.85
ground.data.materials.append(mat)
for name,fraction,file in [('Idle',0,'hero-preview.png'),('Run',.22,'hero-run-preview.png'),('Attack2',.45,'hero-attack-preview.png')]:
    rig.animation_data.action=bpy.data.actions[name]
    a=rig.animation_data.action
    scene.frame_set(round(a.frame_range.x+(a.frame_range.y-a.frame_range.x)*fraction))
    camera.data.ortho_scale=3.2 if name.startswith('Attack') else 2.8
    scene.render.filepath=str(OUT/file)
    bpy.ops.render.render(write_still=True)
print('PRODUCTION_HERO_EXPORT_COMPLETE')
