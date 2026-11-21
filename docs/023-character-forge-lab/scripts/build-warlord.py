"""Original adult-proportioned halberd warlord built on Quaternius CC0.
Official free Standard body + locomotion, original armor/weapon and two-hand IK.
Run in Blender 4.5 LTS, no network or paid generation is invoked.
"""
import bpy, math, json, hashlib
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/warlord'; SRC=OUT/'source'
FPS=100
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene; scene.render.fps=FPS

def import_gltf(path):
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    return list(set(bpy.data.objects)-before)

base=import_gltf(SRC/'base/Superhero_Male_FullBody.gltf')
rig=next(o for o in base if o.type=='ARMATURE'); rig.name='CrimsonWarlord_Rig'
body=next(o for o in base if o.name.startswith('SuperHero_Male'))
parts=[o for o in base if o.type=='MESH' and (o==body or o.name.startswith(('Eyes','Eyebrows')))]
for ob in base:
    if ob.type=='MESH' and ob not in [body] and not ob.name.startswith(('Eyes','Eyebrows')): bpy.data.objects.remove(ob,do_unlink=True)

# Load published source motions into separate, hidden rigs for sampling.
old_actions=set(bpy.data.actions)
u1=import_gltf(SRC/'ual1-official.glb'); source1=next(o for o in u1 if o.type=='ARMATURE')
actions1={a.name:a for a in set(bpy.data.actions)-old_actions}
old_actions=set(bpy.data.actions)
u2=import_gltf(SRC/'ual2-official.glb'); source2=next(o for o in u2 if o.type=='ARMATURE')
actions2={a.name:a for a in set(bpy.data.actions)-old_actions}
for ob in u1+u2:
    ob.hide_render=True
    if ob.type=='MESH': ob.hide_set(True)

def mat(name,color,metal=0,rough=.5,emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    s=m.node_tree.nodes.get('Principled BSDF');s.inputs['Base Color'].default_value=(*color,1);s.inputs['Metallic'].default_value=metal;s.inputs['Roughness'].default_value=rough
    if emission:s.inputs['Emission Color'].default_value=(*color,1);s.inputs['Emission Strength'].default_value=emission
    return m
M={
 'dark':mat('ArmorDark',(.055,.073,.088),.78,.28),
 'iron':mat('ArmorIron',(.17,.20,.22),.8,.29),
 'gold':mat('ArmorGold',(.60,.37,.115),.8,.28),
 'goldLight':mat('ArmorGoldEdge',(.86,.63,.27),.72,.3),
 'red':mat('ClothRed',(.26,.012,.024),0,.82),
 'redEdge':mat('ClothRedTrim',(.53,.028,.045),.15,.55),
 'black':mat('UnderArmor',(.016,.021,.026),.1,.75),
 'blade':mat('Blade',(.46,.52,.55),.88,.21),
 'bladeEdge':mat('BladeEdge',(.79,.84,.82),.85,.17),
 'ember':mat('EmberInlay',(.88,.065,.015),.35,.3,1.8),
}
# Keep the actual adult head/eyes and convert the covered torso into an undersuit.
body.data.materials.append(M['black']); under=len(body.data.materials)-1
for poly in body.data.polygons:
    z=sum((body.matrix_world@body.data.vertices[i].co).z for i in poly.vertices)/len(poly.vertices)
    if z<1.555:poly.material_index=under

def finish(ob,name,material,bone_name,bevel=0):
    ob.name=name
    bpy.context.view_layer.objects.active=ob
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    ob.data.materials.append(M[material])
    if bevel:
        mod=ob.modifiers.new('Forged bevel','BEVEL');mod.width=bevel;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=ob.modifiers.new('Plate normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
    vg=ob.vertex_groups.new(name=bone_name);vg.add(range(len(ob.data.vertices)),1,'REPLACE')
    mod=ob.modifiers.new('Warlord skeleton','ARMATURE');mod.object=rig;ob.parent=rig
    ob['partCategory']='weapon' if bone_name=='Halberd_Control' else 'armor'
    parts.append(ob);return ob
def cube(name,pos,scale,material,bone_name,bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos);ob=bpy.context.object;ob.scale=scale
    return finish(ob,name,material,bone_name,bevel)
def ico(name,pos,scale,material,bone_name,sub=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=pos);ob=bpy.context.object;ob.scale=scale
    return finish(ob,name,material,bone_name)
def tube(name,a,b,r1,r2,material,bone_name,verts=12):
    a,b=Vector(a),Vector(b);bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=(b-a).length,location=(a+b)/2)
    ob=bpy.context.object;ob.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return finish(ob,name,material,bone_name)
def polygon(name,points,depth,material,bone_name,bevel=.008):
    # points live in X/Z, the supplied y defines the front surface.
    n=len(points);verts=points+[(x,y+depth,z) for x,y,z in points]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    ob=bpy.data.objects.new(name,me);scene.collection.objects.link(ob)
    return finish(ob,name,material,bone_name,bevel)
def line(name,points,radius,material,bone_name):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=12;curve.bevel_depth=radius;curve.bevel_resolution=2
    sp=curve.splines.new('POLY');sp.points.add(len(points)-1)
    for p,v in zip(sp.points,points):p.co=(*v,1)
    ob=bpy.data.objects.new(name,curve);scene.collection.objects.link(ob);bpy.context.view_layer.objects.active=ob
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.convert(target='MESH')
    return finish(bpy.context.object,name,material,bone_name)

# Helper bones are exported as named runtime attachment points.
bpy.context.view_layer.objects.active=rig;bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
def add_bone(name,head,tail,parent):
    b=rig.data.edit_bones.new(name);b.head=head;b.tail=tail;b.parent=rig.data.edit_bones[parent];return b
GRIP=Vector((-.28,-.30,1.02))
add_bone('Halberd_Control',GRIP,GRIP+Vector((0,0,1)),'root')
add_bone('HalberdTip',(-.28,-.30,2.91),(-.28,-.30,2.98),'Halberd_Control')
add_bone('HalberdGrip',GRIP,GRIP+Vector((0,0,.07)),'Halberd_Control')
add_bone('CapeUpper',(0,.13,1.48),(0,.25,1.04),'spine_03')
add_bone('CapeLower',(0,.25,1.04),(0,.35,.43),'CapeUpper')
bpy.ops.object.mode_set(mode='OBJECT')
for pb in rig.pose.bones:pb.rotation_mode='QUATERNION'

# Layered cuirass, flared collar and sculpted central crest.
for s in [-1,1]:
    polygon('Cuirass_'+str(s),[(.015*s,-.155,1.46),(.185*s,-.14,1.46),(.25*s,-.12,1.30),(.19*s,-.15,1.12),(.035*s,-.20,1.08)],.11,'dark','spine_03',.018)
    line('Breastplate_gold_'+str(s),[(.025*s,-.18,1.445),(.17*s,-.17,1.43),(.235*s,-.16,1.30),(.18*s,-.19,1.13)],.013,'gold','spine_03')
    polygon('Pectoral_facet_'+str(s),[(.025*s,-.20,1.43),(.17*s,-.185,1.40),(.20*s,-.185,1.32),(.04*s,-.225,1.29)],.025,'iron','spine_03',.007)
    line('Collar_'+str(s),[(.03*s,-.12,1.50),(.10*s,-.10,1.54),(.17*s,-.01,1.52),(.14*s,.10,1.50)],.034,'gold','spine_03')
for z,w in [(1.20,.36),(1.14,.34),(1.08,.31)]:
    cube('Abdominal_lamella',(0,-.165,z),(w,.12,.072),'dark','spine_02',.016)
    cube('Abdominal_gold_edge',(0,-.231,z-.029),(w*.84,.012,.012),'gold','spine_02',.004)
polygon('War_crest',[(0,-.255,1.40),(.065,-.25,1.34),(.045,-.26,1.22),(0,-.27,1.19),(-.045,-.26,1.22),(-.065,-.25,1.34)],.025,'gold','spine_03',.006)
ico('Crest_ember',(0,-.286,1.31),(.024,.012,.034),'ember','spine_03',1)
for s in [-1,1]:
    line('Crest_horn_'+str(s),[(s*.028,-.272,1.36),(s*.09,-.26,1.39),(s*.105,-.25,1.45)],.012,'goldLight','spine_03')
cube('Waist_belt',(0,.025,1.005),(.43,.31,.12),'black','pelvis',.026)
cube('Waist_buckle',(0,-.151,1.006),(.13,.044,.10),'gold','pelvis',.015)
cube('Waist_onyx',(0,-.18,1.009),(.065,.012,.055),'red','pelvis',.008)

# Broad but anatomical shoulder silhouette; gilded layered plate edges.
for side,s in [('l',1),('r',-1)]:
    upper,lower,hand='upperarm_'+side,'lowerarm_'+side,'hand_'+side
    ico('Pauldron_under_'+side,(s*.25,.05,1.48),(.21,.17,.115),'gold',upper)
    ico('Pauldron_dark_'+side,(s*.255,.025,1.50),(.195,.16,.105),'dark',upper)
    for i in range(3):
        cube('Pauldron_lamella_'+side+str(i),(s*(.29+i*.035),.047,1.455-i*.042),(.17,.28,.067),'iron' if i%2 else 'dark',upper,.019)
        line('Pauldron_edge_'+side+str(i),[(s*(.22+i*.035),-.095,1.44-i*.042),(s*(.35+i*.035),-.09,1.44-i*.042)],.009,'gold',upper)
    tube('Pauldron_spike_'+side,(s*.29,.035,1.55),(s*.39,.065,1.70),.055,0,'gold',upper,10)
    a=rig.data.bones[lower].head_local.copy();b=rig.data.bones[lower].tail_local.copy()
    tube('Vambrace_'+side,a.lerp(b,.18),a.lerp(b,.88),.088,.065,'dark',lower)
    tube('Vambrace_cuff_'+side,a.lerp(b,.75),a.lerp(b,.88),.082,.073,'gold',lower)
    a=rig.data.bones[hand].head_local.copy();b=rig.data.bones[hand].tail_local.copy()
    ico('Gauntlet_'+side,a.lerp(b,.5),(.09,.063,.055),'dark',hand,2)
    for j in range(3):
        ico('Gauntlet_knuckle_'+side+str(j),(a.x+s*.065,a.y-.033+j*.027,a.z+.026),(.026,.019,.022),'gold',hand,1)

# Flared hip armor and long red cloth, all bound to the existing adult rig.
for side,s in [('l',1),('r',-1)]:
    thigh,calf,foot='thigh_'+side,'calf_'+side,'foot_'+side
    for j in range(3):
        z=.94-j*.085
        polygon('Tasset_'+side+str(j),[(s*.035,-.12,z+.04),(s*.21,-.11,z+.04),(s*.23,-.13,z-.045),(s*.10,-.18,z-.075),(s*.035,-.17,z-.04)],.055,'dark',thigh,.012)
        line('Tasset_trim_'+side+str(j),[(s*.04,-.178,z-.04),(s*.10,-.188,z-.068),(s*.22,-.147,z-.043)],.009,'gold',thigh)
    a=rig.data.bones[thigh].head_local;b=rig.data.bones[thigh].tail_local
    tube('Thigh_armor_'+side,a.lerp(b,.25),a.lerp(b,.85),.12,.095,'iron',thigh)
    a=rig.data.bones[calf].head_local;b=rig.data.bones[calf].tail_local
    tube('Greave_'+side,a.lerp(b,.12),a.lerp(b,.83),.112,.075,'dark',calf)
    line('Greave_ridge_'+side,[(s*.114,-.075,.49),(s*.114,-.072,.29),(s*.114,-.065,.14)],.012,'gold',calf)
    ico('Knee_guard_'+side,(s*.114,-.01,.55),(.13,.115,.10),'gold',calf,1)
    ico('Knee_iron_'+side,(s*.114,-.055,.55),(.101,.084,.079),'dark',calf,1)
    cube('Boot_'+side,(s*.114,-.005,.075),(.18,.29,.135),'dark',foot,.035)
    polygon('Sabatons_'+side,[(s*.03,-.155,.11),(s*.195,-.155,.11),(s*.18,-.195,.025),(s*.045,-.195,.025)],.12,'iron',foot,.012)
    tube('Ankle_trim_'+side,(s*.114,.04,.14),(s*.114,.04,.18),.089,.09,'gold',calf)
polygon('Red_lappet_front',[(-.065,-.185,.97),(.065,-.185,.97),(.11,-.22,.51),(0,-.245,.43),(-.11,-.22,.51)],.012,'red','pelvis',.003)
line('Lappet_gold_stitch',[(-.048,-.203,.93),(-.08,-.24,.55),(0,-.262,.47),(.08,-.24,.55),(.048,-.203,.93)],.005,'gold','pelvis')

# A curved multi-bone red war mantle, cut into a swallow tail.
verts=[];faces=[];rows=12;cols=9
for j in range(rows):
    t=j/(rows-1);z=1.50-t*1.08
    for i in range(cols):
        u=i/(cols-1)*2-1;x=u*(.20+.17*t);y=.125+.17*t+.045*math.cos(u*math.pi*3)*(t+.2)
        zz=z+(abs(u)*.10 if j==rows-1 else 0)
        verts.append((x,y,zz))
for j in range(rows-1):
    for i in range(cols-1):a=j*cols+i;faces.append((a,a+1,a+1+cols,a+cols))
me=bpy.data.meshes.new('WarMantleMesh');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('WarMantle',me);scene.collection.objects.link(ob)
ob.data.materials.append(M['red']);ob.data.materials.append(M['redEdge'])
vg1=ob.vertex_groups.new(name='CapeUpper');vg2=ob.vertex_groups.new(name='CapeLower')
for i,v in enumerate(verts):t=max(0,min(1,(1.30-v[2])/.67));vg1.add([i],1-t,'REPLACE');vg2.add([i],t,'REPLACE')
mod=ob.modifiers.new('Mantle thickness','SOLIDIFY');mod.thickness=.009
mod=ob.modifiers.new('Mantle skeleton','ARMATURE');mod.object=rig;ob.parent=rig;parts.append(ob)

# Open-face helm: the actual adult face remains readable, with short swept horns.
def helmet_cap():
    verts=[];faces=[];segments=28;levels=6
    for j in range(levels):
        t=j/(levels-1);z=1.66+t*.19
        r=math.sqrt(max(.02,1-((z-1.69)/.19)**2))
        for i in range(segments):
            a=i/segments*math.tau;verts.append((math.cos(a)*.115*r,.025+math.sin(a)*.12*r,z))
    for j in range(levels-1):
        for i in range(segments):
            a=(i+.5)/segments*math.tau
            if math.sin(a)<-.30 and j<3:continue
            k=j*segments+i;n=j*segments+(i+1)%segments;faces.append((k,n,n+segments,k+segments))
    me=bpy.data.meshes.new('OpenHelm');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('OpenHelm',me);scene.collection.objects.link(ob)
    return finish(ob,'OpenHelm','dark','Head',.006)
helmet_cap()
for s in [-1,1]:
    line('Helm_brow_'+str(s),[(0,-.10,1.765),(s*.075,-.096,1.75),(s*.11,-.045,1.71)],.014,'gold','Head')
    polygon('Helm_cheek_'+str(s),[(s*.105,-.035,1.72),(s*.13,.035,1.71),(s*.11,.05,1.56),(s*.072,-.025,1.57)],.025,'iron','Head',.006)
    line('Helm_horn_'+str(s),[(s*.08,.045,1.80),(s*.16,.08,1.89),(s*.21,.10,1.95),(s*.22,.17,2.04)],.022,'gold','Head')
    # Curved crimson plume starts behind the brow and flows backward, never over the face.
    points=[(s*(.065+.16*t),.075+.60*t,1.85+.28*math.sin(t*math.pi)-.15*t) for t in [i/15 for i in range(16)]]
    line('Plume_spine_'+str(s),points,.006,'gold','Head')
    for j in range(14):
        p=Vector(points[j]);q=Vector(points[j+1]);tube('Plume_'+str(s)+'_'+str(j),p,q,.027*(1-j/17),.027*(1-(j+1)/17),'redEdge','Head',6)
polygon('Helm_forehead',[(0,-.09,1.845),(.035,-.105,1.78),(0,-.125,1.745),(-.035,-.105,1.78)],.023,'gold','Head',.006)
ico('Helm_jewel',(0,-.132,1.79),(.015,.007,.024),'ember','Head',1)

# Original asymmetrical battle halberd with a broad crescent blade.
W='Halberd_Control';gx,gy,gz=GRIP
tube('Halberd_shaft',(gx,gy,-.10),(gx,gy,2.56),.024,.024,'dark',W,16)
for z in [-.10,.16,.53,.83,1.02,1.25,1.49,1.82,2.18,2.44,2.55]:
    tube('Halberd_ferrule_'+str(z),(gx,gy,z-.025),(gx,gy,z+.025),.032,.032,'gold',W,12)
for z in [.87,1.32]:
    tube('Halberd_leather_grip_'+str(z),(gx,gy,z-.17),(gx,gy,z+.17),.029,.029,'black',W,16)
    for j in range(6):line('Grip_binding_'+str(z)+'_'+str(j),[(gx+.029*math.cos(a),gy+.029*math.sin(a),z-.15+j*.052) for a in [i/16*math.tau for i in range(17)]],.003,'gold',W)
polygon('Halberd_spearhead',[(gx,gy-.018,2.99),(gx+.065,gy-.018,2.73),(gx+.035,gy-.018,2.54),(gx-.035,gy-.018,2.54),(gx-.065,gy-.018,2.73)],.036,'blade',W,.005)
line('Spearhead_spine',[(gx,gy-.04,2.59),(gx,gy-.04,2.89)],.007,'gold',W)
blade=[(gx+.02,gy-.025,2.58),(gx+.16,gy-.025,2.80),(gx+.40,gy-.025,2.88),(gx+.30,gy-.025,2.65),(gx+.29,gy-.025,2.40),(gx+.42,gy-.025,2.18),(gx+.18,gy-.025,2.27),(gx+.035,gy-.025,2.48)]
polygon('Halberd_crescent',blade,.05,'blade',W,.007)
line('Halberd_crescent_edge',[blade[2],blade[3],blade[4],blade[5]],.012,'bladeEdge',W)
line('Halberd_crescent_gold',[blade[0],blade[1],blade[2]],.012,'gold',W)
polygon('Halberd_counterhook',[(gx-.02,gy-.02,2.57),(gx-.22,gy-.02,2.69),(gx-.30,gy-.02,2.54),(gx-.22,gy-.02,2.56),(gx-.10,gy-.02,2.43)],.04,'blade',W,.005)
ico('Halberd_ember_socket',(gx,gy-.044,2.55),(.05,.025,.07),'ember',W,2)
polygon('Halberd_pennant',[(gx+.03,gy+.015,2.39),(gx+.25,gy+.025,2.34),(gx+.19,gy+.03,1.98),(gx+.075,gy+.02,2.10)],.007,'redEdge',W,.002)

# Two hand IK drives both arms onto the same physical shaft, then bakes the result.
targets={};poles={}
for side,s in [('r',-1),('l',1)]:
    target=bpy.data.objects.new('IK_Target_'+side,None);scene.collection.objects.link(target);targets[side]=target
    pole=bpy.data.objects.new('IK_Pole_'+side,None);scene.collection.objects.link(pole);poles[side]=pole;pole.location=(s*1.0,-.20,1.15)
    constraint=rig.pose.bones['lowerarm_'+side].constraints.new('IK');constraint.target=target;constraint.chain_count=2;constraint.use_tail=True;constraint.iterations=80
    constraint.pole_target=pole;constraint.pole_angle=0 if side=='r' else math.pi

# Landing compression keeps the ankles planted while the pelvis drops.
leg_targets={};leg_constraints={}
for side in ['r','l']:
    target=bpy.data.objects.new('Landing_Ankle_'+side,None);scene.collection.objects.link(target);leg_targets[side]=target
    c=rig.pose.bones['calf_'+side].constraints.new('IK');c.target=target;c.chain_count=2;c.use_tail=True;c.iterations=100;c.influence=0
    leg_constraints[side]=c

def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
def curve(t,keys):
    for (a,v),(b,w) in zip(keys,keys[1:]):
        if a<=t<=b:
            f=smooth((t-a)/(b-a));return tuple(x+(y-x)*f for x,y in zip(v,w))
    return keys[0][1] if t<keys[0][0] else keys[-1][1]
def world_rotate(name,x=0,y=0,z=0):
    pb=rig.pose.bones[name];rest=pb.bone.matrix_local.to_quaternion();q=Quaternion((0,0,1),z)@Quaternion((0,1,0),y)@Quaternion((1,0,0),x)
    pb.rotation_quaternion=pb.rotation_quaternion@(rest.inverted()@q@rest)

def sample_source(source,action,time):
    source.animation_data_create();source.animation_data.action=action
    if len(action.slots):source.animation_data.action_slot=action.slots[0]
    sf=action.frame_range[0]+time*(action.frame_range[1]-action.frame_range[0]);scene.frame_set(int(sf),subframe=sf%1)
    for pb in rig.pose.bones:
        pb.matrix_basis=Matrix.Identity(4)
        if pb.name in source.pose.bones:pb.matrix_basis=source.pose.bones[pb.name].matrix_basis.copy()
    rig.pose.bones['root'].location=(0,0,0)

# Heavy source sword actions contain a full turn and deep lunge. Use their
# readable footwork while retaining an adult, two-hand polearm reach envelope.
sample_source(source1,actions1['Idle_Loop'],0)
idle_basis={pb.name:pb.matrix_basis.copy() for pb in rig.pose.bones}
def settle_polearm_body(name):
    if name not in ['Attack1','Attack2','Attack3','Sweep','LeapSlam']:return
    weight=.28 if name=='Sweep' else .42 if name.startswith('Attack') else .48
    for pb in rig.pose.bones:
        if pb.name in ['root','Halberd_Control','HalberdTip','HalberdGrip','CapeUpper','CapeLower']:continue
        pb.matrix_basis=idle_basis[pb.name].lerp(pb.matrix_basis,weight)
    rig.pose.bones['root'].matrix_basis=Matrix.Identity(4)

IDLE_POS=(-.28,-.31,1.02);IDLE_DIR=(.34,-.10,.94)
def weapon_pose(kind,t):
    if kind in ['Idle','Walk','Run','Victory']:
        phase=t*math.tau
        return (IDLE_POS[0],IDLE_POS[1]+.01*math.sin(phase),IDLE_POS[2]+.008*math.sin(phase)),IDLE_DIR,0
    if kind=='Guard':return (-.05,-.40,1.20),(.95,0,.16),0
    if kind=='Dodge':return (-.22,-.39,.98),(.40,-.20,.89),0
    if kind=='Hit':return (-.24,-.25,1.01),(.15,.1,.98),0
    if kind=='Death':return (-.20,-.35,.66),(.85,-.2,.24),0
    if kind=='LeapSlam':
        pos=curve(t,[(0,IDLE_POS),(.18/1.28,(-.12,-.08,1.50)),(.48/1.28,(-.12,.02,1.65)),(.72/1.28,(-.12,-.16,1.70)),(.92/1.28,(-.10,-.12,1.20)),(1,IDLE_POS)])
        direction=curve(t,[(0,IDLE_DIR),(.18/1.28,(0,.65,.76)),(.72/1.28,(0,.8,.6)),(.92/1.28,(.50,-.587,-.635)),(1,IDLE_DIR)])
        return pos,direction,0
    contact={'Attack1':.23/.72,'Attack2':.30/.82,'Attack3':.4,'Sweep':.42/1.08}[kind]
    sign=-1 if kind=='Attack2' else 1
    if kind=='Attack3':
        pos=curve(t,[(0,IDLE_POS),(.18,(-.10,.0,1.48)),(contact,(-.08,-.46,.94)),(.72,(.20,-.43,.97)),(1,IDLE_POS)])
        direction=curve(t,[(0,IDLE_DIR),(.18,(-.05,.65,.76)),(contact,(.02,-.99,-.08)),(.72,(.58,-.7,.35)),(1,IDLE_DIR)])
    else:
        pos=curve(t,[(0,IDLE_POS),(.18,(-.30*sign,-.15,1.21)),(contact,(-.14,-.26,1.18)),(.70,(.29*sign,-.23,1.18)),(1,IDLE_POS)])
        direction=curve(t,[(0,IDLE_DIR),(.18,(-.95*sign,.2,.22)),(contact,(.55,-.83,.08)),(.70,(.94*sign,.0,.25)),(1,IDLE_DIR)])
    return pos,direction,.1*sign

def apply_weapon(kind,t):
    pos,direction,twist=weapon_pose(kind,t);pos=Vector(pos);direction=Vector(direction).normalized()
    q=Vector((0,0,1)).rotation_difference(direction)
    if twist:q=Quaternion(direction,twist)@q
    # Project the rigid weapon into both arm reach spheres. This moves the
    # complete shaft, never stretches adult anatomy or detaches either hand.
    bpy.context.view_layer.update()
    grip_offsets={side:q@Vector((0,.045,along)) for side,along in [('r',-.02),('l',.20)]}
    for _ in range(14):
        for side in ['l','r']:
            upper=rig.pose.bones['upperarm_'+side];lower=rig.pose.bones['lowerarm_'+side]
            radius=(upper.bone.length+lower.bone.length)*.94
            delta=(pos+grip_offsets[side])-upper.head
            if delta.length>radius:pos-=delta*(1-radius/delta.length)
    control=rig.pose.bones['Halberd_Control'];rest=control.bone.matrix_local.to_quaternion()
    control.matrix=Matrix.Translation(pos)@(q@rest).to_matrix().to_4x4()
    # Wrist targets offset behind the shaft so the curved fingers close around it.
    for side in ['r','l']:
        targets[side].location=pos+grip_offsets[side]
    bpy.context.view_layer.update()
    for side in ['l','r']:
        hand=rig.pose.bones['hand_'+side]
        head=hand.head.copy();forward=q@Vector((0,-1,0));orientation=forward.to_track_quat('Y','Z')
        hand.matrix=Matrix.Translation(head)@orientation.to_matrix().to_4x4()
        for pb in rig.pose.bones:
            if pb.name.endswith('_'+side) and any(pb.name.startswith(x) for x in ['index_','middle_','pinky_','ring_']):
                if 'leaf' not in pb.name:pb.rotation_quaternion=Quaternion((1,0,0),.82)
    world_rotate('CapeUpper',x=.08*math.sin(t*math.tau+.2))
    world_rotate('CapeLower',x=.12*math.sin(t*math.tau+.9),y=.055*math.sin(t*math.tau))
    bpy.context.view_layer.update()

specs={
 'Idle':(2.0,source1,actions1['Idle_Loop']),
 'Walk':(1.1,source1,actions1['Walk_Loop']),
 'Run':(.8,source1,actions1['Sprint_Loop']),
 'Attack1':(.72,source2,actions2['Sword_Heavy_Combo']),
 'Attack2':(.82,source2,actions2['Sword_Heavy_Combo']),
 'Attack3':(1.0,source2,actions2['Sword_Heavy_Combo']),
 'Sweep':(1.08,source2,actions2['Sword_Heavy_Combo']),
 'Guard':(.32,source2,actions2['Sword_Block']),
 'LeapSlam':(1.28,source1,actions1['Jump_Start']),
 'Dodge':(.4,source2,actions2['Shield_Dash']),
 'Hit':(.55,source1,actions1['Hit_Chest']),
 'Death':(1.2,source1,actions1['Death01']),
 'Victory':(1.6,source1,actions1['Idle_Torch_Loop']),
}
rig.animation_data_create();baked=[]
for name,(seconds,source,source_action) in specs.items():
    count=round(seconds*FPS);poses=[]
    for frame in range(count+1):
        t=frame/count
        st=t
        if name=='Attack1':st=t*.31
        elif name=='Attack2':st=.31+t*.33
        elif name=='Attack3':st=.64+t*.36
        elif name=='Sweep':st=.17+t*.52
        elif name=='LeapSlam':st=min(1,t/.3) if t<.3 else .65
        sample_source(source,source_action,st)
        settle_polearm_body(name)
        for c in leg_constraints.values():c.influence=0
        if name=='LeapSlam':
            # Pose the loading/landing; the controller owns the actual airborne Y.
            load=math.sin(min(1,t/.2)*math.pi*.5) if t<.2 else max(0,1-(t-.8)/.2) if t>.8 else .25
            world_rotate('spine_02',x=.14*load)
            seconds=t*1.28
            compression=curve(seconds,[(0,(0,)),(.84,(0,)),(.92,(1,)),(.99,(.80,)),(1.28,(0,))])[0]
            if compression>0:
                bpy.context.view_layer.update()
                foot_matrices={side:rig.pose.bones['foot_'+side].matrix.copy() for side in ['l','r']}
                for side in ['l','r']:
                    leg_targets[side].location=foot_matrices[side].translation
                    leg_constraints[side].influence=1
                pelvis=rig.pose.bones['pelvis']
                pelvis.matrix=Matrix.Translation((0,0,-.16*compression))@pelvis.matrix
                world_rotate('spine_02',x=.21*compression)
                bpy.context.view_layer.update()
                for side in ['l','r']:
                    rig.pose.bones['foot_'+side].matrix=foot_matrices[side]
                bpy.context.view_layer.update()
        apply_weapon(name,t)
        # Snapshot evaluated IK as local bone transforms, including auxiliary bones.
        evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get())
        matrices={pb.name:pb.matrix.copy() for pb in evaluated.pose.bones}
        basis={}
        for pb in rig.pose.bones:
            parent=matrices[pb.parent.name] if pb.parent else Matrix.Identity(4)
            rest_parent=pb.parent.bone.matrix_local if pb.parent else Matrix.Identity(4)
            basis[pb.name]=pb.bone.matrix_local.inverted()@rest_parent@parent.inverted()@matrices[pb.name]
        poses.append(basis)
    action=bpy.data.actions.new('Warlord_'+name);action.use_fake_user=True;rig.animation_data.action=action
    for frame,basis in enumerate(poses):
        for bone_name,matrix in basis.items():
            pb=rig.pose.bones[bone_name];pb.matrix_basis=matrix
            pb.keyframe_insert(data_path='location',frame=frame,group=bone_name);pb.keyframe_insert(data_path='rotation_quaternion',frame=frame,group=bone_name);pb.keyframe_insert(data_path='scale',frame=frame,group=bone_name)
    track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,0,action);track.mute=True
    action.name=name;baked.append(action)
    print('BAKED',name,seconds,flush=True)
rig.animation_data.action=None
for pb in rig.pose.bones:
    for c in list(pb.constraints):pb.constraints.remove(c)

# The public motion libraries are sampling inputs, never runtime clips.
for ob in u1+u2+list(targets.values())+list(poles.values())+list(leg_targets.values()):
    if ob.name in bpy.data.objects:bpy.data.objects.remove(ob,do_unlink=True)
for action in list(bpy.data.actions):
    if action not in baked:bpy.data.actions.remove(action,do_unlink=True)
bpy.data.orphans_purge(do_recursive=True)

# One uniform scale preserves true adult proportions and exactly 2.05m body height.
scale=2.05/1.8195866346359253;rig.scale=(scale,scale,scale)
for action in baked:action.use_fake_user=True
rig.animation_data.action=baked[0];scene.frame_set(0);rig.animation_data.action=None
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for ob in parts:
    if ob.name in bpy.data.objects:ob.select_set(True)
bpy.context.view_layer.objects.active=rig
scene.frame_start=0;scene.frame_end=200
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'warlord.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'warlord.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_skins=True,export_extras=True,export_yup=True)

# Rename through the GLB JSON only if an exporter prefixes the action names.
glb=(OUT/'warlord.glb').read_bytes();length=int.from_bytes(glb[12:16],'little');gj=json.loads(glb[20:20+length]);anim_names=[a['name'] for a in gj.get('animations',[])]
metadata={
 'name':'赤霄 / CHIXIAO','bodyHeight':2.05,'height':2.05,'forward':'+Z','up':'+Y','groundOffset':0,
 'bodyProportion':'Adult muscular body; original Quaternius Superhero Male proportions, not a stretched chibi.',
 'sourceAuthor':'Quaternius','bodySource':'https://quaternius.com/packs/universalbasecharacters.html','animationSource':['https://quaternius.com/packs/universalanimationlibrary.html','https://quaternius.com/packs/universalanimationlibrary2.html'],
 'license':'CC0-1.0','armorAndWeapon':'Original Blender-created dark iron/red/brass armor and asymmetrical halberd.',
 'bones':len(rig.data.bones),'meshes':len(gj.get('meshes',[])),
 'tipNode':'HalberdTip','gripNode':'HalberdGrip','weaponControl':'Halberd_Control',
 'materials':['ArmorDark','ArmorGold','ClothRed','Blade'],
 'animations':[{'name':name,'duration':specs[name][0],'hitTime':{'Attack1':.23,'Attack2':.30,'Attack3':.40,'Sweep':.42,'LeapSlam':.92}.get(name),'loop':name in ['Idle','Walk','Run'],**({'takeoffTime':.18,'landingTime':.92,'worldJumpOwner':'game'} if name=='LeapSlam' else {})} for name in specs],
 'exportedAnimations':anim_names,
 'baking':'Both hand targets constrain the same halberd shaft; evaluated 2-bone arm IK baked into pose keys. Root motion controlled by game.',
 'files':['warlord.glb','warlord.blend'],'sha256':hashlib.sha256(glb).hexdigest(),
}
(OUT/'metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
print('WARLORD_DONE',json.dumps(metadata,ensure_ascii=False),flush=True)
