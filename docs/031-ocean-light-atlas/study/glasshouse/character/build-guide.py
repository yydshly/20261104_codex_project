"""Build a clothed seaside guide on Quaternius CC0 topology and motions.
Blender 4.5 LTS. No external generation service or reference-image upload.
"""
import bpy, bmesh, math, json, hashlib, struct, random
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion
from mathutils.bvhtree import BVHTree

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'glasshouse/assets/guide'; OUT.mkdir(parents=True,exist_ok=True)
WORK=ROOT/'glasshouse/character'
SOURCE=WORK/'source'
if not SOURCE.exists():SOURCE=ROOT.parent/'character-forge-lab/assets/warlord/source'
FPS=30
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.fps=FPS

def import_glb(path):
    before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));return list(set(bpy.data.objects)-before)
base=import_glb(SOURCE/'adult-base.glb')
rig=next(o for o in base if o.type=='ARMATURE');rig.name='SeasideGuide_Rig'
body=next(o for o in base if o.type=='MESH' and o.name.startswith('SuperHero'))
original_eyes=next(o for o in base if o.type=='MESH' and o.name.startswith('Eyes'))
brows=next(o for o in base if o.type=='MESH' and o.name.startswith('Eyebrows'))
for ob in base:
    if ob.type=='MESH' and ob not in [body,original_eyes,brows]:bpy.data.objects.remove(ob,do_unlink=True)

def srgb(hexcode):
    v=[int(hexcode[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v)
def material(name,color,rough=.65,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*srgb(color),1)
    s=m.node_tree.nodes.get('Principled BSDF');s.inputs['Base Color'].default_value=m.diffuse_color;s.inputs['Roughness'].default_value=rough;s.inputs['Metallic'].default_value=metal
    return m
M={
 'skin':material('Warm natural skin','#d7a180',.53), 'lips':material('Soft lip color','#ae725f',.62),
 'hair':material('Short dark hair','#211d1a',.73), 'strand':material('Combed hair strands','#302821',.8),
 'white':material('Eye whites','#e7dacc',.35), 'iris':material('Brown iris','#4b3021',.3), 'pupil':material('Pupil','#171311',.25),
 'gold':material('Fine bronze spectacles','#9e8060',.25,.75),
 'navy':material('Navy cotton hoodie','#202b43',.87), 'navyEdge':material('Hoodie ribbing','#19253a',.9),
 'linen':material('Warm ivory linen','#d9d2bd',.91), 'sage':material('Dusk sage knit','#71877b',.88),
 'tee':material('Soft blue inner tee','#697e87',.9), 'pants':material('Charcoal trousers','#444548',.88),
 'chino':material('Sand chinos','#b0a18a',.9), 'sole':material('Off white sneaker sole','#ded8c9',.73),
 'shoe':material('Ivory sneaker upper','#e8e0d0',.68), 'heel':material('Navy heel tab','#293b50',.74),
 'logo':material('Cyan code embroidery','#54cedc',.65), 'button':material('Linen buttons','#c6bea8',.56),
}
M['lens']=material('Clear glasses lens','#bad2d7',.12)
M['lens'].node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value=.035
M['lens'].surface_render_method='DITHERED'
parts=[];outfits={k:[] for k in ['hoodie','linen','knit']}

def assign(ob,name,mat,outfit=None,bone=None,subdiv=0):
    ob.name=name;ob.data.materials.clear();ob.data.materials.append(M[mat]);ob['role']='character';ob['outfit']=outfit or 'shared'
    if hasattr(ob.data,'polygons'):
        for p in ob.data.polygons:p.use_smooth=True
    if bone:
        ob['rigidBone']=bone
        bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        vg=ob.vertex_groups.new(name=bone);vg.add(list(range(len(ob.data.vertices))),1,'REPLACE')
        mod=ob.modifiers.new('Guide skeleton','ARMATURE');mod.object=rig;ob.parent=rig
    if subdiv:
        mod=ob.modifiers.new('Smooth animation surface','SUBSURF');mod.levels=subdiv
        # Apply in rest pose, retaining weights for the exported surface.
        bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
        # Subdivision must run before the armature to avoid baking a pose.
        while ob.modifiers.find(mod.name)>0:bpy.ops.object.modifier_move_up(modifier=mod.name)
        bpy.ops.object.modifier_apply(modifier=mod.name)
    parts.append(ob)
    if outfit:outfits[outfit].append(ob)
    return ob

def subset(name,predicate,mat,outfit=None,inflate=0,subdiv=1,loose=False,trousers=False,region=None):
    ob=body.copy();ob.data=body.data.copy();scene.collection.objects.link(ob)
    bm=bmesh.new();bm.from_mesh(ob.data);bm.faces.ensure_lookup_table()
    inv=ob.matrix_world.inverted()
    delete=[];deform=bm.verts.layers.deform.active
    head_index=body.vertex_groups.find('Head');neck_index=body.vertex_groups.find('neck_01')
    for f in bm.faces:
        p=ob.matrix_world@f.calc_center_median()
        keep=predicate(p)
        if region and deform:
            head=sum(v[deform].get(head_index,0) for v in f.verts)/len(f.verts)
            neck=sum(v[deform].get(neck_index,0) for v in f.verts)/len(f.verts)
            if region=='upper' and (head>.08 or neck>.65):keep=False
            if region=='skin' and abs(p.x)<.2 and head+neck<.35:keep=False
        if not keep:delete.append(f)
    bmesh.ops.delete(bm,geom=delete,context='FACES')
    # Remove loose remnants left by a face cut.
    bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS')
    bm.to_mesh(ob.data);bm.free();ob.data.update()
    for v in ob.data.vertices:
        p=ob.matrix_world@v.co
        if inflate:p+=Vector(v.normal)*inflate
        if loose and abs(p.x)<.19 and 1.0<p.z<1.44:
            if p.y<-.015:p.y=min(p.y,-.142)
            elif p.y>.03:p.y=max(p.y,.135)
        if trousers and p.z<.90:
            side=1 if p.x>0 else -1;cx=side*.114
            cy=.036+.051*(1-max(0,min(1,(p.z-.086)/.46)))
            angle=math.atan2(p.y-cy,p.x-cx)
            f=max(0,min(1,(p.z-.075)/.815))
            rx=.053+.034*f;ry=.060+.035*f
            weight=1-max(0,min(1,(p.z-.81)/.09))
            p.x=p.x*(1-weight)+(cx+rx*math.cos(angle))*weight
            p.y=p.y*(1-weight)+(cy+ry*math.sin(angle))*weight
        v.co=inv@p
    return assign(ob,name,mat,outfit,subdiv=subdiv)

# Round the lower jaw slightly; preserve the source's actual facial topology.
for v in body.data.vertices:
    p=body.matrix_world@v.co
    if p.z>1.565 and abs(p.x)<.15:
        jaw=max(0,1-abs(p.z-1.615)/.08)
        p.x*=1.04-.025*jaw
        if p.z<1.65:p.z+=.013*max(0,1-abs(p.z-1.60)/.05)
        if p.y<-.09 and 1.65<p.z<1.73:p.y=-.09+(p.y+.09)*.65
    if 1.48<p.z<1.61 and p.y>-.04:
        blend=max(0,min(1,(p.z-1.55)/.06));rx=.052+.018*blend;ry=.056+.022*blend
        radius=math.sqrt((p.x/rx)**2+((p.y-.025)/ry)**2)
        if radius>1:p.x/=radius;p.y=.025+(p.y-.025)/radius
    v.co=body.matrix_world.inverted()@p
body.data.update()

skin=subset('Skin_Head_Neck_Hands',lambda p:(p.z>1.48 and abs(p.x)<.2) or abs(p.x)>.704,'skin',subdiv=1,region='skin')
forearms=subset('Linen_Exposed_Forearms',lambda p:.415<abs(p.x)<.72,'skin','linen',subdiv=1)
bpy.data.objects.remove(brows,do_unlink=True)
bpy.data.objects.remove(original_eyes,do_unlink=True)

def ellipsoid(name,pos,scale,mat,bone='Head',outfit=None,segments=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=16,location=pos)
    ob=bpy.context.object;ob.scale=scale;return assign(ob,name,mat,outfit,bone)
def rounded(name,pos,size,mat,bone,outfit=None,bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos);ob=bpy.context.object;ob.scale=size
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    mod=ob.modifiers.new('Rounded seams','BEVEL');mod.width=bevel;mod.segments=3;bpy.ops.object.modifier_apply(modifier=mod.name)
    return assign(ob,name,mat,outfit,bone)
def curve_mesh(name,points,radius,mat,bone,outfit=None,closed=False):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=1 if closed else (4 if len(points)>5 else 6);c.bevel_depth=radius;c.bevel_resolution=1
    spl=c.splines.new('BEZIER');spl.bezier_points.add(len(points)-1)
    for bp,p in zip(spl.bezier_points,points):bp.co=p;bp.handle_left_type='AUTO';bp.handle_right_type='AUTO'
    spl.use_cyclic_u=closed
    ob=bpy.data.objects.new(name,c);scene.collection.objects.link(ob);bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.convert(target='MESH')
    return assign(bpy.context.object,name,mat,outfit,bone)
def ring(name,center,rx,ry,radius,mat,bone,outfit=None,axis='Z'):
    points=[]
    for i in range(48):
        a=i/48*math.tau
        if axis=='Y':p=(center[0]+rx*math.cos(a),center[1],center[2]+ry*math.sin(a))
        elif axis=='X':p=(center[0],center[1]+rx*math.cos(a),center[2]+ry*math.sin(a))
        else:p=(center[0]+rx*math.cos(a),center[1]+ry*math.sin(a),center[2])
        points.append(p)
    return curve_mesh(name,points,radius,mat,bone,outfit,True)

def garment_mesh(name,vertices,faces,mat,outfit):
    data=bpy.data.meshes.new(name);data.from_pydata(vertices,[],faces);data.update()
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob)
    for group in body.vertex_groups:ob.vertex_groups.new(name=group.name)
    transfer=ob.modifiers.new('Transfer anatomical weights','DATA_TRANSFER');transfer.object=body
    transfer.use_vert_data=True;transfer.data_types_verts={'VGROUP_WEIGHTS'};transfer.vert_mapping='POLYINTERP_NEAREST'
    transfer.layers_vgroup_select_src='ALL';transfer.layers_vgroup_select_dst='NAME'
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
    bpy.ops.object.modifier_apply(modifier=transfer.name)
    # Correct the transferred shoulder influence explicitly. A loose garment
    # should follow the torso; the sleeve rotates around the real arm joint.
    for group in ob.vertex_groups:group.remove(list(range(len(data.vertices))))
    def weight(vertex,bone,amount):
        if amount<=0:return
        group=ob.vertex_groups.get(bone) or ob.vertex_groups.new(name=bone);group.add([vertex],amount,'REPLACE')
    for vertex in data.vertices:
        p=vertex.co
        if 'Sleeve' in name:
            side='l' if p.x>0 else 'r';mix=max(0,min(1,(abs(p.x)-.42)/.085))
            weight(vertex.index,'upperarm_'+side,1-mix);weight(vertex.index,'lowerarm_'+side,mix)
        elif 'Collar' in name:
            weight(vertex.index,'spine_03',.7);weight(vertex.index,'neck_01',.3)
        else:
            if p.z<1.07:a,b,t='pelvis','spine_01',max(0,min(1,(p.z-1.0)/.07))
            elif p.z<1.24:a,b,t='spine_01','spine_02',(p.z-1.07)/.17
            else:a,b,t='spine_02','spine_03',min(1,(p.z-1.24)/.16)
            weight(vertex.index,a,1-t);weight(vertex.index,b,t)
    mod=ob.modifiers.new('Guide skeleton','ARMATURE');mod.object=rig;ob.parent=rig
    return assign(ob,name,mat,outfit,subdiv=1)

def build_top(key,mat,short):
    rings=[(1.00,.174,.153),(1.045,.179,.155),(1.14,.184,.155),(1.27,.203,.155),(1.40,.222,.151),(1.47,.226,.125),(1.515,.125,.079),(1.545,.061,.053)]
    vertices=[];faces=[];segments=48
    for j,(z,rx,ry) in enumerate(rings):
        for i in range(segments):
            a=i/segments*math.tau;r=1+.009*math.sin(a*7+z*13)
            vertices.append((rx*math.cos(a)*r,.025+ry*math.sin(a)*r,z))
            if j<len(rings)-1:faces.append((j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i))
    top=garment_mesh('Outfit_'+key+'_TailoredTop',vertices,faces,mat,key)
    for side in [-1,1]:
        profile=[(.19,.005),(.22,.075),(.27,.075),(.32,.072),(.40,.065)]
        if short:profile+=[(.43,.063)]
        else:profile+=[(.45,.061),(.48,.059),(.55,.054),(.62,.047),(.695,.038)]
        vertices=[];faces=[]
        for j,(x,radius) in enumerate(profile):
            for i in range(32):
                a=i/32*math.tau;wrinkle=1+.014*math.sin(a*5+x*35)
                vertices.append((side*x,.065+radius*math.cos(a)*wrinkle,1.455+radius*math.sin(a)*wrinkle))
                if j<len(profile)-1:
                    face=(j*32+i,j*32+(i+1)%32,(j+1)*32+(i+1)%32,(j+1)*32+i)
                    faces.append(face if side>0 else tuple(reversed(face)))
        garment_mesh('Outfit_'+key+'_Sleeve_'+str(side),vertices,faces,mat,key)
    return top

# Natural brown eyes, fine round frames and real side arms, all driven by Head.
for side in [-1,1]:
    x=side*.034
    ellipsoid('EyeWhite', (x,-.079,1.697),(.0158,.010,.0065),'white')
    ellipsoid('BrownIris',(x,-.0882,1.697),(.0056,.0018,.0057),'iris')
    ellipsoid('Pupil',(x,-.0897,1.697),(.0027,.001,.0036),'pupil')
    ellipsoid('EyeHighlight',(x-.0018,-.0908,1.700),(.0014,.0007,.0015),'white',segments=16)
    curve_mesh('GentleEyebrow',[(x-.019,-.088,1.718),(x,-.095,1.722),(x+.019,-.088,1.719)],.0018,'hair','Head')
    curve_mesh('UpperEyelid',[(x-.014,-.087,1.698),(x,-.0895,1.703),(x+.014,-.087,1.698)],.0017,'skin','Head')
    ring('RoundSpectacleFrame',(side*.036,-.108,1.699),.030,.022,.0011,'gold','Head',axis='Y')
    lens=ellipsoid('Lens',(side*.036,-.1075,1.699),(.028,.0009,.020),'lens',segments=32)
    curve_mesh('SpectacleTemple',[(side*.067,-.106,1.702),(side*.083,-.060,1.705),(side*.082,.012,1.701),(side*.080,.025,1.690)],.0013,'gold','Head')
curve_mesh('SpectacleBridge',[(-.007,-.110,1.704),(0,-.119,1.709),(.007,-.110,1.704)],.0012,'gold','Head')
curve_mesh('GentleSmile',[(-.026,-.089,1.632),(-.012,-.097,1.628),(0,-.100,1.627),(.012,-.097,1.628),(.026,-.089,1.632)],.00115,'lips','Head')

# Sculpted short cap, raised front and fine swept strands; no picture billboard.
verts=[];faces=[];rings=18;segments=64
head_bvh=BVHTree.FromObject(body,bpy.context.evaluated_depsgraph_get())
def fit_hair(point):
    p=Vector(point);local=body.matrix_world.inverted()@p
    near,normal,_,_=head_bvh.find_nearest(local)
    if near is not None and (local-near).dot(normal)<.004:p=body.matrix_world@(near+normal*.004)
    return p
for j in range(rings+1):
    t=j/rings;theta=t*math.pi*.5
    for i in range(segments):
        a=i/segments*math.tau;front=max(0,-math.sin(a));edge=1.674+.092*front
        x=.086*math.sin(theta)*math.cos(a)
        y=.014+.080*math.sin(theta)*math.sin(a)
        z=edge+(1.827-edge)*math.cos(theta)+.006*max(0,-math.cos(a))*math.sin(theta)*front
        verts.append(tuple(fit_hair((x,y,z))))
        if j<rings:faces.append((j*segments+i,(j+1)*segments+i,(j+1)*segments+(i+1)%segments,j*segments+(i+1)%segments))
mesh=bpy.data.meshes.new('ShortHairSurface');mesh.from_pydata(verts,[],faces);mesh.update();ob=bpy.data.objects.new('Short swept dark hair',mesh);scene.collection.objects.link(ob);assign(ob,ob.name,'hair',bone='Head')
hair_bvh=BVHTree.FromPolygons([Vector(p) for p in verts],faces)
random.seed(23)
for i in range(52):
    startx=-.074+i/51*.148;points=[]
    for j in range(9):
        t=j/8;x=startx+.007*math.sin(t*math.pi)
        extent=math.sqrt(max(.01,1-(x/.086)**2));y=.014+(-.078+.137*t)*extent
        qx=x/.086;qy=(y-.014)/.080;a=math.atan2(qy,qx)
        edge=1.674+.092*max(0,-math.sin(a));r2=qx*qx+qy*qy
        z=edge+(1.827-edge)*math.sqrt(max(0,1-r2))+.006*max(0,-math.cos(a))*math.sqrt(max(0,r2))*max(0,-math.sin(a))+.0005
        near,normal,_,_=hair_bvh.find_nearest(Vector((x,y,z)))
        points.append(tuple(near+normal*.0005))
    curve_mesh('SweptHairStrand',points,.0003,'strand','Head')

# Three actual silhouettes, not three colour presets.
for key,mat,short in [('hoodie','navy',False),('linen','linen',True),('knit','sage',False)]:
    garment=build_top(key,mat,short)
    if key=='linen':
        for side in [-1,1]:
            points=[(0,-.030,1.555),(side*.068,-.022,1.545),(side*.092,-.112,1.466),(side*.018,-.131,1.488)]
            garment_mesh('LinenPointedCollar',points,[(0,1,2),(0,2,3)],'linen',key)
        for z in [1.08,1.18,1.28,1.38]:ellipsoid('ShirtButton',(0,-.133,z),(.0035,.002,.0035),'button','spine_01',key,16)
    pants=subset('Outfit_'+key+'_Trousers',lambda p:.075<p.z<1.025,'chino' if key=='linen' else 'pants',key,inflate=.014,subdiv=1,trousers=True)
    ring(key+'_WaistHem',(0,.025,1.015),.154,.108,.012,'navyEdge' if key=='hoodie' else mat,'pelvis',key)
    for side in [-1,1]:
        bone='upperarm_'+('l' if side>0 else 'r') if short else 'lowerarm_'+('l' if side>0 else 'r')
        ring(key+'_SleeveCuff',(side*(.422 if short else .686),.069,1.455),.055 if short else .036,.056 if short else .035,.009 if short else .012,mat if short else ('navyEdge' if key=='hoodie' else mat),bone,key,axis='X')
    if key in ['hoodie','knit']:ring(key+'NeckSeam',(0,.025,1.535),.062,.055,.013,mat,'neck_01',key)
    for side in [-1,1]:ring(key+'_AnkleHem',(side*.114,.085,.106),.054,.061,.004,'chino' if key=='linen' else 'pants','calf_'+('l' if side>0 else 'r'),key)

# Hoodie cowl, hood lying on the back, pouch pocket, drawstrings and embroidery.
ellipsoid('HoodBack',(0,.132,1.392),(.132,.063,.139),'navy','spine_03','hoodie')
curve_mesh('HoodCowl',[(-.105,.016,1.505),(-.126,.085,1.512),(-.096,.145,1.473),(0,.182,1.417),(.096,.145,1.473),(.126,.085,1.512),(.105,.016,1.505)],.024,'navy','spine_03','hoodie')
rounded('HoodiePouchPocket',(0,-.153,1.108),(.249,.015,.112),'navy','spine_01','hoodie',.023)
for side in [-1,1]:
    curve_mesh('HoodieDrawstring',[(side*.034,-.115,1.479),(side*.039,-.153,1.386),(side*.034,-.159,1.249)],.0024,'navyEdge','spine_03','hoodie')
    rounded('DrawstringTip',(side*.034,-.161,1.242),(.005,.005,.017),'gold','spine_03','hoodie',.0015)
for pts in [[(.089,-.156,1.372),(.077,-.159,1.361),(.089,-.156,1.351)],[(.105,-.157,1.376),(.097,-.159,1.348)],[(.112,-.154,1.372),(.125,-.152,1.361),(.112,-.154,1.351)]]:
    curve_mesh('CodeEmbroidery',pts,.0018,'logo','spine_03','hoodie')

# Sneakers have a shaped upper, separate sole, heel tab and modelled laces.
shoes=[]
for side in [-1,1]:
    x=side*.114;bone='foot_'+('l' if side>0 else 'r')
    sole=rounded('SneakerSole',(x,-.033,.023),(.107,.267,.042),'sole',bone,bevel=.025);shoes.append(sole)
    ellipsoid('SneakerUpper',(x,-.037,.070),(.049,.121,.051),'shoe',bone,segments=32)
    rounded('SneakerHeelTab',(x,.077,.098),(.069,.019,.044),'heel',bone,bevel=.009)
    for j in range(4):
        y=-.075+j*.027;curve_mesh('SneakerLace',[(x-.029,y-.009,.122-j*.003),(x,y,.128-j*.003),(x+.029,y+.009,.122-j*.003)],.0015,'sole',bone)

# Merge rigid pieces sharing a material and joint; the strands stay actual mesh
# geometry while requiring one draw call instead of dozens.
groups={}
for ob in parts:
    if ob.get('rigidBone'):groups.setdefault((ob['outfit'],ob.data.materials[0].name,ob['rigidBone']),[]).append(ob)
for key,group in groups.items():
    if len(group)<2:continue
    parts=[ob for ob in parts if ob not in group]
    bpy.ops.object.select_all(action='DESELECT')
    for ob in group:ob.select_set(True)
    bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();merged=bpy.context.object
    merged.name='Guide_'+key[2]+'_'+key[1];parts.append(merged)

# The covered base remains a data-transfer reference in the editable file only.
body.hide_render=True;body.hide_set(True)
before_actions=set(bpy.data.actions)
source_objects=import_glb(SOURCE/'ual1-official.glb');motion_rig=next(o for o in source_objects if o.type=='ARMATURE')
motion_actions={a.name:a for a in set(bpy.data.actions)-before_actions}
for ob in source_objects:ob.hide_render=True
for pb in rig.pose.bones:pb.rotation_mode='QUATERNION'

def sample(action,t):
    motion_rig.animation_data_create();motion_rig.animation_data.action=motion_actions[action]
    if motion_rig.animation_data.action.slots:motion_rig.animation_data.action_slot=motion_rig.animation_data.action.slots[0]
    a,b=motion_rig.animation_data.action.frame_range;f=a+t*(b-a);scene.frame_set(int(f),subframe=f%1)
    for pb in rig.pose.bones:
        pb.matrix_basis=motion_rig.pose.bones[pb.name].matrix_basis.copy() if pb.name in motion_rig.pose.bones else Matrix.Identity(4)
    rig.pose.bones['root'].location=(0,0,0)
    bpy.context.view_layer.update()
def smooth(t):t=max(0,min(1,t));return t*t*(3-2*t)
def rotate_world(name,axis,angle):
    pb=rig.pose.bones[name];q=pb.bone.matrix_local.to_quaternion();pb.rotation_quaternion=pb.rotation_quaternion@(q.inverted()@Quaternion(axis,angle)@q)

targets={};constraints={}
for name,chain in [('lowerarm_r',2),('calf_l',2),('calf_r',2)]:
    target=bpy.data.objects.new('BakeIK_'+name,None);scene.collection.objects.link(target);targets[name]=target
    con=rig.pose.bones[name].constraints.new('IK');con.target=target;con.chain_count=chain;con.use_tail=True;con.iterations=80;con.influence=0;constraints[name]=con
for pb in rig.pose.bones:pb.matrix_basis=Matrix.Identity(4)
for side,sign in [('l',1),('r',-1)]:
    rotate_world('upperarm_'+side,(0,1,0),sign*1.46)
    rotate_world('lowerarm_'+side,(1,0,0),-.10)
    rotate_world('hand_'+side,(0,0,1),-sign*1.57)
    for pb in rig.pose.bones:
        if pb.name.endswith('_'+side) and any(pb.name.startswith(x) for x in ['index_','middle_','ring_','pinky_']):pb.rotation_quaternion=Quaternion((1,0,0),.35)
bpy.context.view_layer.update();idle={p.name:p.matrix_basis.copy() for p in rig.pose.bones}
sample('Sitting_Idle_Loop',0);sitting={p.name:p.matrix_basis.copy() for p in rig.pose.bones}
specs={'Idle':4.0,'Walk':1.1,'Wave':3.2,'Point':3.0,'SitDown':1.4,'SitIdle':4.0,'StandUp':1.4}
rig.animation_data_create();baked=[]
for name,duration in specs.items():
    frames=round(duration*FPS);poses=[]
    rig.animation_data.action=None
    for frame in range(frames+1):
        t=frame/frames
        for c in constraints.values():c.influence=0
        if name=='Walk':
            sample('Walk_Loop',t)
            for pb in rig.pose.bones:
                if any(pb.name.startswith(x) for x in ['upperarm_','lowerarm_','hand_','Head','neck_']):pb.matrix_basis=idle[pb.name].lerp(pb.matrix_basis,.70)
        elif name in ['SitDown','SitIdle','StandUp']:
            alpha=1 if name=='SitIdle' else smooth(t if name=='SitDown' else 1-t)
            for pb in rig.pose.bones:pb.matrix_basis=idle[pb.name].lerp(sitting[pb.name],alpha)
            if name=='SitIdle':rotate_world('spine_02',(1,0,0),.008*math.sin(t*math.tau))
            bpy.context.view_layer.update()
            pelvis=rig.pose.bones['pelvis'];m=pelvis.matrix.copy();m.translation=Vector((0,.043,.9491)).lerp(Vector((0,.65,.50)),alpha);pelvis.matrix=m
            for side in ['l','r']:
                targets['calf_'+side].location=(.114 if side=='l' else -.114,.0875*(1-alpha)+.22*alpha,.0865)
                constraints['calf_'+side].influence=alpha
            bpy.context.view_layer.update()
            for side in ['l','r']:
                foot=rig.pose.bones['foot_'+side];m=foot.matrix.copy();foot.matrix=Matrix.Translation(m.translation)@foot.bone.matrix_local.to_quaternion().to_matrix().to_4x4()
        else:
            for pb in rig.pose.bones:pb.matrix_basis=idle[pb.name].copy()
            rotate_world('spine_02',(1,0,0),.008*math.sin(t*math.tau))
            rotate_world('Head',(0,0,1),.025*math.sin(t*math.tau))
            if name in ['Wave','Point']:
                alpha=smooth(t/.16)*smooth((1-t)/.16)
                if name=='Wave':
                    targets['lowerarm_r'].location=(-.36-.035*math.sin(t*math.tau*3),-.075,1.79+.025*math.cos(t*math.tau*3))
                    angle=math.pi/2+.20*math.sin(t*math.tau*3)
                    turn=Quaternion((0,1,0),angle)
                else:
                    targets['lowerarm_r'].location=(-.32,-.365,1.46+.03*math.sin(t*math.pi))
                    turn=Quaternion((0,0,1),math.pi/2)
                constraints['lowerarm_r'].influence=alpha;bpy.context.view_layer.update()
                pb=rig.pose.bones['hand_r'];m=pb.matrix.copy();rest=pb.bone.matrix_local.to_quaternion();q=(turn@rest)
                m=Matrix.Translation(m.translation)@m.to_quaternion().slerp(q,alpha).to_matrix().to_4x4();pb.matrix=m
                for p in rig.pose.bones:
                    if p.name.endswith('_r') and any(p.name.startswith(x) for x in ['index_','middle_','ring_','pinky_']):
                        p.rotation_quaternion=Quaternion((1,0,0),.72*alpha if name=='Point' and not p.name.startswith('index_') else 0)
                rotate_world('Head',(0,0,1),-.10*alpha if name=='Point' else .06*math.sin(t*math.tau))
        bpy.context.view_layer.update()
        # Keep sneaker soles at the floor while baking the source locomotion.
        if name in ['Idle','Walk','Wave','Point']:
            deps=bpy.context.evaluated_depsgraph_get()
            low=min((o.evaluated_get(deps).matrix_world@Vector(v)).z for o in shoes for v in o.evaluated_get(deps).bound_box)
            rig.pose.bones['root'].location.z-=low
            bpy.context.view_layer.update()
        evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get());matrices={p.name:p.matrix.copy() for p in evaluated.pose.bones}
        basis={}
        for pb in rig.pose.bones:
            parent=matrices[pb.parent.name] if pb.parent else Matrix.Identity(4)
            rest_parent=pb.parent.bone.matrix_local if pb.parent else Matrix.Identity(4)
            basis[pb.name]=pb.bone.matrix_local.inverted()@rest_parent@parent.inverted()@matrices[pb.name]
        poses.append(basis)
    action=bpy.data.actions.new(name);action.use_fake_user=True;rig.animation_data.action=action
    for frame,basis in enumerate(poses):
        for bone_name,m in basis.items():
            pb=rig.pose.bones[bone_name];pb.matrix_basis=m
            pb.keyframe_insert(data_path='location',frame=frame,group=bone_name);pb.keyframe_insert(data_path='rotation_quaternion',frame=frame,group=bone_name);pb.keyframe_insert(data_path='scale',frame=frame,group=bone_name)
    track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,0,action);track.mute=True;baked.append(action)
    print('BAKED',name,flush=True)
rig.animation_data.action=None
for pb in rig.pose.bones:
    for c in list(pb.constraints):pb.constraints.remove(c)
for ob in source_objects+list(targets.values()):
    if ob.name in bpy.data.objects:bpy.data.objects.remove(ob,do_unlink=True)
for action in list(bpy.data.actions):
    if action not in baked:bpy.data.actions.remove(action,do_unlink=True)

manifest={'name':'海边向导 / Seaside Guide','version':'1.0.0','reference':'User-supplied four-view character image; visual reference, not a scan.',
 'baseAuthor':'Quaternius','baseLicense':'CC0-1.0','baseSource':'https://quaternius.itch.io/universal-base-characters',
 'animationSource':'https://quaternius.itch.io/universal-animation-library','derivedWork':'Original clothing, short hair, round spectacles, face adjustments, seated fitting and guide gesture baking.',
 'up':'+Y','forward':'+Z','heightMeters':1.85,'bones':len(rig.data.bones),
 'animations':[{'name':k,'duration':v,'loop':k in ['Idle','Walk','SitIdle']} for k,v in specs.items()],
 'outfits':[],'limits':['Likeness adaptation, not exact facial reconstruction','No cloth simulation or full-body collision solver','Walking motion is in-place; route controller supplies translation']}
for key,label in [('hoodie','原型 · 深蓝卫衣'),('linen','海边 · 亚麻衫'),('knit','暮色 · 针织衫')]:
    for ob in parts:ob.hide_render=ob.get('outfit') not in ['shared',key]
    rig.animation_data.action=baked[0];scene.frame_set(0);rig.animation_data.action=None
    bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
    for ob in parts:
        if ob.get('outfit') in ['shared',key]:ob.select_set(True)
    bpy.context.view_layer.objects.active=rig
    path=OUT/f'guide-{key}.glb'
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_skins=True,export_extras=True,export_yup=True,export_apply=False)
    raw=path.read_bytes();n=struct.unpack_from('<I',raw,12)[0];gj=json.loads(raw[20:20+n])
    manifest['outfits'].append({'id':key,'label':label,'file':path.name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'meshes':len(gj.get('meshes',[])),'animations':[a['name'] for a in gj.get('animations',[])]})
for ob in parts:ob.hide_render=ob.get('outfit') not in ['shared','hoodie'];ob.hide_set(ob.hide_render)
rig.animation_data.action=baked[0];scene.frame_set(0)
deps=bpy.context.evaluated_depsgraph_get()
active=[o for o in parts if o.get('outfit') in ['shared','hoodie']]
bound=[o.evaluated_get(deps).matrix_world@Vector(v) for o in active for v in o.evaluated_get(deps).bound_box]
manifest['heightMeters']=round(max(p.z for p in bound)-min(p.z for p in bound),4)
scene.frame_start=0;scene.frame_end=120
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'seaside-guide.blend'),compress=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('GUIDE_EXPORTED',json.dumps(manifest,ensure_ascii=False),flush=True)

# Actual Blender studio renders for silhouette/face QA, separate from web proof.
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.world.color=(.35,.35,.35)
world=scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.74,.79,.82,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.5
def area(name,pos,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=pos;ob.rotation_euler=(Vector((0,0,1.1))-ob.location).to_track_quat('-Z','Y').to_euler()
area('StudioKey',(3,-4,4),450,4);area('StudioFill',(-3,-1,2.5),260,3);area('StudioRim',(1,3,3.5),500,3)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.005));floor=bpy.context.object;floor.data.materials.append(material('StudioFloor','#ddd3c5',.8))
data=bpy.data.cameras.new('GuideStudioCamera');cam=bpy.data.objects.new('GuideStudioCamera',data);scene.collection.objects.link(cam);scene.camera=cam
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG'
def render(name,pos,target,resolution,lens):
    cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=lens
    scene.render.resolution_x,scene.render.resolution_y=resolution;scene.render.resolution_percentage=100;scene.render.filepath=str(WORK/name);bpy.ops.render.render(write_still=True)
render('guide-fullbody.png',(2.6,-4.4,2.1),(0,0,.98),(600,900),72)
render('guide-face.png',(.35,-1.0,1.79),(0,-.015,1.69),(700,700),72)
