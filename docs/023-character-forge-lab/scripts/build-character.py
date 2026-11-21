"""Create an original, editable demonstration character with a real armature.

Run with Blender 4.5 LTS --background --factory-startup --python this_file.
No external generation service or paid API is used.
"""
import bpy
import json
import math
from mathutils import Vector, Quaternion
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets'
OUT.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.fps = 30

def material(name, color, metal=0, rough=.45, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Roughness'].default_value = rough
    if emission:
        bs.inputs['Emission Color'].default_value = (*color, 1)
        bs.inputs['Emission Strength'].default_value = emission
    return m

M = {
    'silver': material('Brushed ivory steel', (.69,.77,.73), .7, .32),
    'edge': material('Warm brass', (.66,.42,.16), .72, .3),
    'jade': material('Deep jade enamel', (.025,.24,.19), .45, .28),
    'cloth': material('Charcoal underlayer', (.035,.064,.066), .05, .8),
    'visor': material('Obsidian visor', (.008,.018,.019), .3, .23),
    'light': material('Mint crest', (.18,.87,.67), .3, .3, 1.4),
    'plume': material('Terracotta ribbon', (.72,.2,.12), .05, .7),
}
parts = []

arm_data = bpy.data.armatures.new('ForgeKnight_Skeleton')
rig = bpy.data.objects.new('ForgeKnight_Rig', arm_data)
scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
bones = {}
def bone(name, head, tail, parent=None):
    b = arm_data.edit_bones.new(name)
    b.head, b.tail = head, tail
    if parent: b.parent = bones[parent]
    bones[name] = b

bone('Root',(0,0,0),(0,0,.2))
bone('Hips',(0,0,1.12),(0,0,1.33),'Root')
bone('Spine',(0,0,1.33),(0,0,1.59),'Hips')
bone('Chest',(0,0,1.59),(0,0,1.89),'Spine')
bone('Neck',(0,0,1.89),(0,0,2.03),'Chest')
bone('Head',(0,0,2.03),(0,0,2.38),'Neck')
for side, sign in [('L',1),('R',-1)]:
    bone('Shoulder.'+side,(0,0,1.82),(.38*sign,0,1.82),'Chest')
    bone('UpperArm.'+side,(.38*sign,0,1.82),(.62*sign,0,1.41),'Shoulder.'+side)
    bone('Forearm.'+side,(.62*sign,0,1.41),(.66*sign,-.035,1.03),'UpperArm.'+side)
    bone('Hand.'+side,(.66*sign,-.035,1.03),(.66*sign,-.035,.91),'Forearm.'+side)
    bone('Thigh.'+side,(.19*sign,0,1.12),(.21*sign,0,.65),'Hips')
    bone('Shin.'+side,(.21*sign,0,.65),(.21*sign,0,.18),'Thigh.'+side)
    bone('Foot.'+side,(.21*sign,0,.18),(.21*sign,-.27,.11),'Shin.'+side)
bpy.ops.object.mode_set(mode='OBJECT')
rig.show_in_front = True
rig['workflow'] = 'Codex > Blender Python > armature + weights + actions > GLB'

def finish(obj, name, mat, bone_name, category='armor', bevel=0):
    obj.name = name
    obj.data.materials.append(M[mat])
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if bevel:
        mod = obj.modifiers.new('Soft forged edges','BEVEL')
        mod.width, mod.segments = bevel, 2
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
        normal = obj.modifiers.new('Weighted plate normals','WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=normal.name)
    vg = obj.vertex_groups.new(name=bone_name)
    vg.add(range(len(obj.data.vertices)),1,'REPLACE')
    mod = obj.modifiers.new('Skeleton deformation','ARMATURE')
    mod.object = rig
    obj.parent = rig
    obj['partCategory'] = category
    obj['attachmentBone'] = bone_name
    parts.append(obj)
    return obj

def cube(name, pos, scale, mat, bone_name, category='armor', bevel=.035):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.scale = scale
    return finish(obj,name,mat,bone_name,category,bevel)

def ico(name,pos,scale,mat,bone_name,category='armor',sub=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=pos)
    obj=bpy.context.object
    obj.scale=scale
    return finish(obj,name,mat,bone_name,category)

def segment(name,a,b,r1,r2,mat,bone_name,category='body',vertices=10):
    va,vb=Vector(a),Vector(b)
    bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=r1,radius2=r2,depth=(vb-va).length,location=(va+vb)/2)
    obj=bpy.context.object
    obj.rotation_euler=(vb-va).to_track_quat('Z','Y').to_euler()
    return finish(obj,name,mat,bone_name,category)

segment('Body_waist',(0,0,1.08),(0,0,1.45),.22,.28,'cloth','Spine',vertices=12)
segment('Body_chest',(0,0,1.35),(0,0,1.89),.25,.34,'cloth','Chest',vertices=12)
cube('Armor_cuirass',(0,-.045,1.65),(.64,.39,.47),'silver','Chest',bevel=.09)
cube('Armor_enamel_front',(0,-.252,1.65),(.38,.04,.31),'jade','Chest',bevel=.04)
crest=cube('Armor_luminous_crest',(0,-.283,1.68),(.105,.018,.105),'light','Chest',bevel=.01)
# Rotate the crest's geometry, preserving its correctly bound mesh transform.
from mathutils import Matrix
center=Vector((0,-.283,1.68))
for v in crest.data.vertices: v.co=center + Matrix.Rotation(math.pi/4,3,'Y') @ (v.co-center)
cube('Armor_belt',(0,-.005,1.22),(.53,.39,.11),'cloth','Hips',bevel=.025)
cube('Armor_buckle',(0,-.215,1.22),(.13,.045,.1),'edge','Hips',bevel=.015)
segment('Body_neck',(0,0,1.87),(0,0,2.07),.1,.1,'cloth','Neck')
ico('Armor_helmet',(0,-.005,2.16),(.263,.231,.279),'silver','Head')
cube('Armor_visor',(0,-.21,2.17),(.432,.055,.105),'visor','Head',bevel=.018)
cube('Armor_eye_slit',(0,-.244,2.178),(.31,.015,.018),'light','Head',bevel=.005)
cube('Armor_helmet_ridge',(0,-.055,2.36),(.065,.32,.075),'edge','Head',bevel=.025)
ico('Armor_helmet_guard',(0,-.19,2.04),(.14,.09,.1),'silver','Head',sub=1)

# A small original plume, deliberately kept rigid for a clear, reproducible sample.
verts=[(-.027,.015,2.37),(.027,.015,2.37),(-.035,.1,2.62),(.035,.1,2.62),(-.025,.32,2.57),(.025,.32,2.57),(-.02,.44,2.35),(.02,.44,2.35)]
me=bpy.data.meshes.new('RibbonMesh'); me.from_pydata(verts,[],[(0,1,3,2),(2,3,5,4),(4,5,7,6),(0,2,4,6),(1,7,5,3)])
ob=bpy.data.objects.new('Armor_plume',me); scene.collection.objects.link(ob)
bpy.context.view_layer.objects.active=ob; ob.select_set(True)
finish(ob,'Armor_plume','plume','Head')

for side,s in [('L',1),('R',-1)]:
    ua,fa,hand='UpperArm.'+side,'Forearm.'+side,'Hand.'+side
    thigh,shin,foot='Thigh.'+side,'Shin.'+side,'Foot.'+side
    segment('Body_upper_arm_'+side,(.39*s,0,1.82),(.62*s,0,1.4),.092,.11,'cloth',ua)
    segment('Body_forearm_'+side,(.62*s,0,1.42),(.66*s,-.035,1.03),.073,.09,'cloth',fa)
    ico('Armor_pauldron_'+side,(.415*s,-.005,1.79),(.237,.23,.19),'edge',ua)
    ico('Armor_shoulder_plate_'+side,(.43*s,-.035,1.81),(.207,.213,.165),'silver',ua)
    ico('Armor_elbow_'+side,(.62*s,0,1.41),(.118,.13,.115),'edge',fa,sub=1)
    segment('Armor_bracer_'+side,(.63*s,-.02,1.33),(.66*s,-.035,1.11),.102,.13,'silver',fa,'armor')
    ico('Body_glove_'+side,(.66*s,-.035,.99),(.09,.09,.115),'cloth',hand,'body')
    segment('Body_thigh_'+side,(.19*s,0,1.12),(.21*s,0,.65),.115,.15,'cloth',thigh)
    segment('Body_shin_'+side,(.21*s,0,.65),(.21*s,0,.18),.08,.11,'cloth',shin)
    cube('Armor_tasset_'+side,(.16*s,-.13,1.075),(.27,.16,.24),'jade',thigh,bevel=.04)
    segment('Armor_thigh_'+side,(.20*s,-.015,.76),(.19*s,-.015,.98),.14,.16,'silver',thigh,'armor')
    ico('Armor_knee_'+side,(.21*s,-.035,.65),(.15,.16,.13),'edge',shin,sub=1)
    segment('Armor_greave_'+side,(.21*s,-.005,.25),(.21*s,-.005,.54),.11,.15,'silver',shin,'armor')
    cube('Body_boot_'+side,(.21*s,-.1,.115),(.255,.39,.20),'cloth',foot,'body',.045)
    cube('Armor_sabatons_'+side,(.21*s,-.18,.16),(.26,.29,.14),'silver',foot,bevel=.04)

# Sword: its blade and hilt share the hand's bone weights.
cube('Weapon_sword_grip',(-.66,-.035,.96),(.065,.07,.19),'cloth','Hand.R','weapon',.012)
cube('Weapon_sword_guard',(-.66,-.035,.875),(.31,.10,.065),'edge','Hand.R','weapon',.02)
ico('Weapon_sword_pommel',(-.66,-.035,1.07),(.07,.07,.06),'edge','Hand.R','weapon',1)
blade_pts=[(-.74,-.055,.85),(-.58,-.055,.85),(-.66,-.055,-.015),(-.74,-.015,.85),(-.58,-.015,.85),(-.66,-.015,-.015)]
me=bpy.data.meshes.new('SwordBladeMesh'); me.from_pydata(blade_pts,[],[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)])
ob=bpy.data.objects.new('Weapon_sword_blade',me); scene.collection.objects.link(ob)
bpy.context.view_layer.objects.active=ob
finish(ob,'Weapon_sword_blade','silver','Hand.R','weapon')

def shield(name,cx,cy,cz,scale,mat):
    outline=[(-.25,.27),(.25,.27),(.29,.02),(0,-.37),(-.29,.02)]
    verts=[(cx+x*scale,cy+y,cz+z*scale) for y in [-.035,.035] for x,z in outline]
    faces=[tuple(range(4,-1,-1)),tuple(range(5,10))]+[(i,(i+1)%5,(i+1)%5+5,i+5) for i in range(5)]
    me=bpy.data.meshes.new(name); me.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new(name,me); scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active=obj
    return finish(obj,name,mat,'Forearm.L','weapon')
shield('Weapon_shield_rim',.69,-.215,1.29,1,'edge')
shield('Weapon_shield_enamel',.69,-.263,1.29,.88,'jade')
cube('Weapon_shield_crest',(.69,-.309,1.29),(.035,.018,.30),'light','Forearm.L','weapon',.009)

for pb in rig.pose.bones: pb.rotation_mode='QUATERNION'
def rotate(name,x=0,y=0,z=0):
    pb=rig.pose.bones[name]
    rest=pb.bone.matrix_local.to_quaternion()
    q=Quaternion((0,0,1),z) @ Quaternion((0,1,0),y) @ Quaternion((1,0,0),x)
    pb.rotation_quaternion=rest.inverted() @ q @ rest

def smooth(v): return v*v*(3-2*v)
def between(t,points):
    for (a,v),(b,w) in zip(points,points[1:]):
        if a<=t<=b: return v+(w-v)*smooth((t-a)/(b-a))
    return points[-1][1]

def pose(kind,t):
    for pb in rig.pose.bones:
        pb.rotation_quaternion=Quaternion()
        pb.location=(0,0,0)
    phase=t*math.tau
    if kind=='Idle':
        rotate('Chest',x=.018*math.sin(phase))
        rotate('Head',z=.035*math.sin(phase),x=.025*math.cos(phase))
        rotate('UpperArm.R',x=-.09+.015*math.sin(phase))
        rotate('Forearm.L',x=-.25)
    elif kind=='Walk':
        for side,offset in [('L',0),('R',math.pi)]:
            p=phase+offset
            rotate('Thigh.'+side,x=.48*math.sin(p))
            rotate('Shin.'+side,x=.68*max(0,-math.cos(p)))
            rotate('Foot.'+side,x=-.1*math.sin(p))
            rotate('UpperArm.'+side,x=-.28*math.sin(p))
            rotate('Forearm.'+side,x=-.12-.1*max(0,math.sin(p)))
        rotate('Chest',z=.055*math.sin(phase))
        rig.pose.bones['Root'].location.z=.018*(1-math.cos(2*phase))
    else:
        lift=between(t,[(0,-.09),(.23,-2.5),(.38,-2.7),(.58,-.8),(.8,-.25),(1,-.09)])
        twist=between(t,[(0,0),(.3,-.42),(.6,.48),(1,0)])
        rotate('UpperArm.R',x=lift,y=.22*math.sin(math.pi*t))
        rotate('Forearm.R',x=-.35*math.sin(math.pi*t))
        rotate('Chest',z=twist,x=.1*math.sin(math.pi*t))
        rotate('Hips',z=twist*.3)
        rotate('Forearm.L',x=-.35)
        rotate('Thigh.L',x=-.12*math.sin(math.pi*t))
        rotate('Shin.L',x=.2*math.sin(math.pi*t))
        rotate('Thigh.R',x=.09*math.sin(math.pi*t))
        rotate('Shin.R',x=.12*math.sin(math.pi*t))

durations={'Idle':3,'Walk':1.2,'Slash':2.4}
rig.animation_data_create()
for kind,seconds in durations.items():
    action=bpy.data.actions.new(kind)
    action.use_fake_user=True
    rig.animation_data.action=action
    count=round(seconds*30)
    for frame in range(0,count+1,2):
        scene.frame_set(frame)
        pose(kind,frame/count)
        for pb in rig.pose.bones:
            pb.keyframe_insert(data_path='rotation_quaternion',frame=frame,group=pb.name)
        rig.pose.bones['Root'].keyframe_insert(data_path='location',frame=frame,group='Root')
    track=rig.animation_data.nla_tracks.new(); track.name=kind
    track.strips.new(kind,0,action)
    track.mute=True
rig.animation_data.action=None
pose('Idle',0)
scene.frame_start,scene.frame_end=0,90
scene.frame_set(0)

# Save an editing file and export only the character, with all three stashed actions.
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True)
for ob in parts: ob.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'forge-knight.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'forge-knight.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_extras=True,export_skins=True,export_yup=True)
bpy.ops.export_scene.fbx(filepath=str(OUT/'forge-knight.fbx'),use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=True,bake_anim_use_nla_strips=False,axis_forward='-Z',axis_up='Y')

report={
    'name':'Jade Sentinel / 青铜守卫',
    'created':'2026-11-12',
    'generator':'Blender '+bpy.app.version_string+' / scripts/build-character.py',
    'provenance':'Original procedural demonstration. No Tripo or Seedance generation was invoked.',
    'rig':'Custom armature with explicit vertex-group weights; not Rigify.',
    'bones':len(rig.data.bones),
    'meshes':len(parts),
    'vertices':sum(len(ob.data.vertices) for ob in parts),
    'triangles':sum(sum(len(p.vertices)-2 for p in ob.data.polygons) for ob in parts),
    'actions':[{'name':k,'duration':v,'fps':30} for k,v in durations.items()],
    'categories':{c:sum(ob.get('partCategory')==c for ob in parts) for c in ['body','armor','weapon']},
    'files':['forge-knight.blend','forge-knight.glb','forge-knight.fbx'],
    'limitations':['Segmented rigid armor with explicit bone weights; no automatic weight quality benchmark.','Walk is an in-place cycle; foot locking and root motion need further refinement.','The FBX export has not been validated in Unity.']
}
(OUT/'character-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('FORGE_REPORT',json.dumps(report,ensure_ascii=False))
