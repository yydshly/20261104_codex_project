"""Premium skinned cloth and contact-preserving heavy-weapon animation refinement.

Blender 4.5, headless.  Chain this after refine-warlord-surface.py:
  blender --background --python scripts/refine-warlord-motion.py -- \
    --input assets/warlord-premium/surface.blend --output assets/warlord-premium/refined.blend
All deformation is ordinary skin/bone animation; no runtime cloth simulation.
"""
import bpy, math, json, argparse, sys
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion

ROOT=Path(__file__).resolve().parents[1]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
p=argparse.ArgumentParser();p.add_argument('--input',default=str(ROOT/'assets/warlord/warlord.blend'));p.add_argument('--output',default=str(ROOT/'assets/warlord-premium/motion-test.blend'));p.add_argument('--preview',action='store_true')
opt=p.parse_args(args);out=Path(opt.output).resolve();out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(Path(opt.input).resolve()))
scene=bpy.context.scene;rig=bpy.data.objects['CrimsonWarlord_Rig'];FPS=100
scene.render.fps=FPS
# Armature deformation is irrelevant to sampling pose channels. Removing the
# mesh modifiers here also avoids Blender's stale defnrToBone cache when a
# material/subdivision-heavy input is sampled and its rig gains cloth joints.
saved_armatures=[]
for ob in list(scene.objects):
    if ob.type!='MESH':continue
    for index,mod in reversed(list(enumerate(ob.modifiers))):
        if mod.type=='ARMATURE':
            saved_armatures.append((ob.name,mod.name,index,mod.use_deform_preserve_volume));ob.modifiers.remove(mod)
names=['Idle','Walk','Run','Attack1','Attack2','Attack3','Sweep','Guard','LeapSlam','Hit','Death','Dodge','Victory']
durations={'Idle':2,'Walk':1.1,'Run':.8,'Attack1':.72,'Attack2':.82,'Attack3':1,'Sweep':1.08,'Guard':.32,'LeapSlam':1.28,'Hit':.55,'Death':1.2,'Dodge':.4,'Victory':1.6}
original_actions={n:bpy.data.actions[n] for n in names}
old_bones=[b.name for b in rig.data.bones]

def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
def envelope(t,keys):
    if t<=keys[0][0]:return keys[0][1]
    for (a,v),(b,w) in zip(keys,keys[1:]):
        if t<=b:return v+(w-v)*smooth((t-a)/(b-a))
    return keys[-1][1]
def world_rotate(pb,x=0,y=0,z=0):
    rest=pb.bone.matrix_local.to_quaternion();q=Quaternion((0,0,1),z)@Quaternion((0,1,0),y)@Quaternion((1,0,0),x)
    pb.rotation_quaternion=pb.rotation_quaternion@(rest.inverted()@q@rest)

# Capture authored adult poses before changing actions or adding IK.
cached={}
for name in names:
    a=original_actions[name];rig.animation_data.action=a
    if len(a.slots):rig.animation_data.action_slot=a.slots[0]
    frames=[]
    for f in range(round(durations[name]*FPS)+1):
        scene.frame_set(f);frames.append({n:rig.pose.bones[n].matrix_basis.copy() for n in old_bones})
    cached[name]=frames
    print('CAPTURED',name,len(frames),flush=True)
rig.animation_data.action=None
for track in list(rig.animation_data.nla_tracks):rig.animation_data.nla_tracks.remove(track)
for ob in list(bpy.data.objects):
    if ob.name=='WarMantle' or ob.name.startswith(('Plume_spine_','Plume_')):bpy.data.objects.remove(ob,do_unlink=True)

# 5 continuous cloth columns, 4 longitudinal joints each. The rows share weights
# laterally instead of behaving as independent rigid strips.
def cape_point(u,t):
    width=.235+.205*math.sin(t*math.pi*.5)
    x=u*width
    fold=.024*math.cos(u*math.pi*5)*(0.45+.55*t)
    y=.235+.255*t+.045*math.sin(t*math.pi)+fold
    hem=.055*(1-abs(u))**2 if t>.92 else 0
    z=1.505-1.12*t-hem*smooth((t-.92)/.08)
    return Vector((x,y,z))
def plume_point(side,t):
    return Vector((side*(.070+.19*t),.080+.68*t,1.855+.28*math.sin(t*math.pi)-.13*t))

bpy.context.view_layer.objects.active=rig;bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
cloth_columns=[-.9,-.45,0,.45,.9];cloth_bones=[];plume_bones=[]
for i,u in enumerate(cloth_columns):
    parent='spine_03'
    for j in range(4):
        n=f'Mantle_{i}_{j}';b=rig.data.edit_bones.new(n);b.head=cape_point(u,j/4);b.tail=cape_point(u,(j+1)/4);b.parent=rig.data.edit_bones[parent]
        cloth_bones.append(n);parent=n
for side in [-1,1]:
    parent='Head'
    for j in range(5):
        n=f'SilkCrest_{side}_{j}';b=rig.data.edit_bones.new(n);b.head=plume_point(side,j/5);b.tail=plume_point(side,(j+1)/5);b.parent=rig.data.edit_bones[parent]
        plume_bones.append(n);parent=n
bpy.ops.object.mode_set(mode='OBJECT')
for pb in rig.pose.bones:pb.rotation_mode='QUATERNION';pb.matrix_basis=Matrix.Identity(4)

red=bpy.data.materials.get('ClothRed');red_trim=bpy.data.materials.get('ClothRedTrim') or red
lining=red.copy();lining.name='CapeLining';bs=lining.node_tree.nodes.get('Principled BSDF')
# Keep the real PBR cloth images but darken their color using a multiply node.
if bs:
    input=bs.inputs['Base Color']
    if input.is_linked:
        link=input.links[0];source=link.from_socket;lining.node_tree.links.remove(link)
        mix=lining.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.40,.27,.30,1)
        lining.node_tree.links.new(source,mix.inputs[1]);lining.node_tree.links.new(mix.outputs[0],input)
    else:input.default_value=(.075,.008,.016,1)
emb=bpy.data.materials.new('PremiumEmbroidery');emb.use_nodes=True
es=emb.node_tree.nodes.get('Principled BSDF');es.inputs['Base Color'].default_value=(.40,.21,.055,1);es.inputs['Metallic'].default_value=.35;es.inputs['Roughness'].default_value=.48

def mesh_object(name,vertices,faces,material):
    me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(vertices,[],faces);me.update();ob=bpy.data.objects.new(name,me);scene.collection.objects.link(ob);ob.data.materials.append(material)
    for poly in me.polygons:poly.use_smooth=True
    uv=me.uv_layers.new(name='UVMap')
    for poly in me.polygons:
        for loop in poly.loop_indices:
            v=me.vertices[me.loops[loop].vertex_index].co;t=max(0,min(1,(1.505-v.z)/1.12));width=.235+.205*math.sin(t*math.pi*.5);uv.data[loop].uv=((v.x/max(.01,width)+1)/2,t)
    ob.parent=rig;return ob
def cloth_weights(ob,parameters):
    groups={n:ob.vertex_groups.new(name=n) for n in cloth_bones}
    for vi,(u,t) in enumerate(parameters):
        col=max(0,min(4,(u+.9)/1.8*4));a=int(math.floor(col));b=min(4,a+1);blend=col-a
        row=max(0,min(3,t*4-.5));c=int(math.floor(row));d=min(3,c+1);rb=row-c
        weights={}
        for ci,cw in [(a,1-blend),(b,blend)]:
            for ri,rw in [(c,1-rb),(d,rb)]:
                n=f'Mantle_{ci}_{ri}';weights[n]=weights.get(n,0)+cw*rw
        for n,w in weights.items():
            if w>1e-7:groups[n].add([vi],w,'REPLACE')
    mod=ob.modifiers.new('Baked mantle skeleton','ARMATURE');mod.object=rig;mod.show_viewport=False

rows=49;cols=37;vertices=[];params=[];faces=[]
for j in range(rows):
    for i in range(cols):
        u=i/(cols-1)*2-1;t=j/(rows-1);vertices.append(tuple(cape_point(u,t)));params.append((u,t))
for j in range(rows-1):
    for i in range(cols-1):
        a=j*cols+i;faces.append((a,a+1,a+cols+1,a+cols))
cape=mesh_object('PremiumWarMantle',vertices,faces,red);cape.data.materials.append(lining)
cloth_weights(cape,params)
solid=cape.modifiers.new('Woven double layer','SOLIDIFY');solid.thickness=.004;solid.material_offset=1;solid.use_even_offset=True

# A restrained embroidered perimeter with smooth curved corners follows the
# actual cloth skin. It is a woven strip rather than a thick metal tube.
trim_vertices=[];trim_faces=[];trim_params=[]
def trim_path(points,width=.005):
    first=len(trim_vertices)
    for u,t,axis in points:
        for s in [-1,1]:
            uu=u+s*width if axis=='u' else u;tt=t+s*width if axis=='t' else t
            point=cape_point(uu,tt);point.y+=.0028
            trim_vertices.append(tuple(point));trim_params.append((uu,tt))
    for k in range(len(points)-1):
        a=first+k*2;trim_faces.append((a,a+1,a+3,a+2))
for s in [-1,1]:trim_path([(s*.97,.05+.92*j/64,'u') for j in range(65)],.010)
trim_path([(-.97+1.94*j/96,.966,'t') for j in range(97)],.006)
trim=mesh_object('MantleWovenBorder',trim_vertices,trim_faces,emb);cloth_weights(trim,trim_params)

# Flowing cloud stitch across the lower cloth. Individual ribbons are narrow
# enough to read as a textile detail under the PBR material in the close view.
vs=[];fs=[];ps=[]
for sign in [-1,1]:
    start=len(vs)
    for k in range(161):
        u=-.85+1.7*k/160;t=.83+sign*.022*math.sin(u*math.pi*5)
        for offset in [-.0017,.0017]:
            v=cape_point(u,t+offset);v.y+=.003;vs.append(tuple(v));ps.append((u,t+offset))
    for k in range(160):a=start+k*2;fs.append((a,a+1,a+3,a+2))
stitch=mesh_object('MantleCloudEmbroidery',vs,fs,emb);cloth_weights(stitch,ps)

for side in [-1,1]:
    vs=[];fs=[];pt=[];r=65
    for j in range(r):
        t=j/(r-1);center=plume_point(side,t);width=.030*(1-.70*t)
        for sign in [-1,1]:vs.append(tuple(center+Vector((sign*width,0,0))));pt.append(t)
    for j in range(r-1):a=j*2;fs.append((a,a+1,a+3,a+2))
    ob=mesh_object('PremiumSilkCrest_'+str(side),vs,fs,red_trim)
    for poly in ob.data.polygons:
        for loop in poly.loop_indices:
            vi=ob.data.loops[loop].vertex_index;ob.data.uv_layers.active.data[loop].uv=(vi%2,pt[vi])
    groups={j:ob.vertex_groups.new(name=f'SilkCrest_{side}_{j}') for j in range(5)}
    for vi,t in enumerate(pt):
        row=max(0,min(4,t*5-.5));a=int(row);b=min(4,a+1);f=row-a
        if a==b:groups[a].add([vi],1,'REPLACE')
        else:groups[a].add([vi],1-f,'REPLACE');groups[b].add([vi],f,'REPLACE')
    mod=ob.modifiers.new('Baked silk crest','ARMATURE');mod.object=rig;mod.show_viewport=False
    mod=ob.modifiers.new('Silk thickness','SOLIDIFY');mod.thickness=.001

# Re-solve arms after authored torso follow-through so both adult hands remain
# on the same rigid weapon. Never stretch the upper/lower arm bones.
targets={};constraints=[]
for side in ['l','r']:
    target=bpy.data.objects.new('PremiumHandTarget_'+side,None);scene.collection.objects.link(target);targets[side]=target
    c=rig.pose.bones['lowerarm_'+side].constraints.new('IK');c.target=target;c.chain_count=2;c.use_tail=True;c.iterations=120;constraints.append(c)
def yaw_for(name,t):
    if name not in ['Attack1','Attack2','Attack3','Sweep']:return 0
    hit={'Attack1':.23/.72,'Attack2':.30/.82,'Attack3':.4,'Sweep':.42/1.08}[name]
    amount=.18 if name=='Sweep' else .13 if name=='Attack3' else .11
    sign=-1 if name=='Attack2' else 1
    return sign*envelope(t,[(0,0),(.16,-amount*.75),(hit,0),(min(.82,hit+.24),amount),(1,0)])
def cloth_pose(name,t):
    sec=t*durations[name];phase=t*math.tau
    locomotion=.055 if name=='Idle' else .16 if name=='Walk' else .33 if name=='Run' else .08
    shock=0
    if name=='LeapSlam':shock=envelope(sec,[(0,0),(.18,.22),(.66,.34),(.84,.24),(.94,-.22),(1.07,.15),(1.28,0)])
    if name=='Dodge':shock=.26*math.sin(t*math.pi)
    if name=='Hit':shock=-.13*math.sin(t*math.pi)
    for i,u in enumerate(cloth_columns):
        for j in range(4):
            if j==0:
                # Heavy fabric keeps a gravity direction instead of inheriting
                # all of the chest's forward lean as a rigid shoulder board.
                pb=rig.pose.bones[f'Mantle_{i}_{j}'];head=pb.head.copy()
                orientation=pb.bone.matrix_local.to_quaternion().slerp(pb.matrix.to_quaternion(),.24)
                pb.matrix=Matrix.Translation(head)@orientation.to_matrix().to_4x4()
                if name in ['Run','Walk']:world_rotate(pb,x=.14 if name=='Run' else .065)
            delay=.045*(j+1);lag=yaw_for(name,t)-yaw_for(name,max(0,t-delay))
            angle=locomotion*.25+(.016+locomotion*.17)*(j+1)/4*math.sin(phase-1.1*j+.65*u)+shock*(j+1)/7
            sway=.014*math.sin(phase-.8*j+u)+lag*(j+1)*.65
            world_rotate(rig.pose.bones[f'Mantle_{i}_{j}'],x=angle,y=.006*math.cos(phase-j+u),z=sway)
    for side in [-1,1]:
        for j in range(5):
            bend=.035*math.sin(phase-j*.62+side*.35)+locomotion*.11*math.sin(phase*2-j*.55)+shock*.12
            world_rotate(rig.pose.bones[f'SilkCrest_{side}_{j}'],x=bend,z=.022*math.sin(phase-j*.8+side))

all_bones=[b.name for b in rig.data.bones];baked=[];metrics={};max_wrist=0
for name in names:
    poses=[];errors=[];rig.animation_data.action=None
    for f,base in enumerate(cached[name]):
        t=f/(len(cached[name])-1)
        for c in constraints:c.influence=0
        scene.frame_set(f)
        for n in all_bones:rig.pose.bones[n].matrix_basis=base[n] if n in base else Matrix.Identity(4)
        bpy.context.view_layer.update()
        cm=rig.pose.bones['Halberd_Control'].matrix.copy();hand_mats={side:rig.pose.bones['hand_'+side].matrix.copy() for side in ['l','r']}
        offsets={side:cm.inverted()@hand_mats[side].translation for side in ['l','r']}
        yaw=yaw_for(name,t)
        if yaw:
            world_rotate(rig.pose.bones['spine_02'],z=yaw*.55,x=-abs(yaw)*.12)
            world_rotate(rig.pose.bones['spine_03'],z=yaw*.45)
            world_rotate(rig.pose.bones['Head'],z=-yaw*.25)
        # A small windup/follow-through augmentation preserves the authored
        # exact contact direction at the same gameplay event frame.
        weapon_yaw=yaw*.5;q=Quaternion((0,0,1),weapon_yaw)
        newcm=Matrix.Translation(cm.translation)@(q@cm.to_quaternion()).to_matrix().to_4x4()
        bpy.context.view_layer.update()
        pos=newcm.translation.copy();newq=newcm.to_quaternion()
        for _ in range(16):
            for side in ['l','r']:
                upper=rig.pose.bones['upperarm_'+side];lower=rig.pose.bones['lowerarm_'+side];radius=(upper.bone.length+lower.bone.length)*.98
                delta=(pos+newq@offsets[side])-upper.head
                if delta.length>radius:pos-=delta*(1-radius/delta.length)
        newcm.translation=pos;rig.pose.bones['Halberd_Control'].matrix=newcm
        for side in ['l','r']:targets[side].location=rig.matrix_world@(newcm@offsets[side])
        for c in constraints:c.influence=1
        bpy.context.view_layer.update()
        for side in ['l','r']:
            pb=rig.pose.bones['hand_'+side];head=pb.head.copy();pb.matrix=Matrix.Translation(head)@(q@hand_mats[side].to_quaternion()).to_matrix().to_4x4()
        cloth_pose(name,t);bpy.context.view_layer.update()
        evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get());mats={pb.name:pb.matrix.copy() for pb in evaluated.pose.bones}
        shaft0=mats['HalberdGrip'].translation;shaft1=mats['HalberdTip'].translation;axis=(shaft1-shaft0).normalized()
        for side in ['l','r']:
            delta=mats['hand_'+side].translation-shaft0;errors.append((delta-axis*delta.dot(axis)).length*rig.scale.x)
        basis={}
        for pb in rig.pose.bones:
            pm=mats[pb.parent.name] if pb.parent else Matrix.Identity(4);pr=pb.parent.bone.matrix_local if pb.parent else Matrix.Identity(4)
            basis[pb.name]=pb.bone.matrix_local.inverted()@pr@pm.inverted()@mats[pb.name]
        basis['root']=Matrix.Identity(4);poses.append(basis)
    for c in constraints:c.influence=0
    action=bpy.data.actions.new('Premium_'+name);rig.animation_data.action=action
    rig.pose.bones['root'].keyframe_insert(data_path='location',frame=0)
    bag=action.layers[0].strips[0].channelbag(action.slots[0])
    for fc in list(bag.fcurves):bag.fcurves.remove(fc)
    for n in all_bones:
        values={'location':[],'rotation_quaternion':[],'scale':[]};previous=None
        for basis in poses:
            loc,rot,scale=basis[n].decompose()
            if previous and previous.dot(rot)<0:rot.negate()
            previous=rot.copy();values['location'].append(tuple(loc));values['rotation_quaternion'].append(tuple(rot));values['scale'].append(tuple(scale))
        for field,array in values.items():
            for index in range(len(array[0])):
                fc=bag.fcurves.new(data_path=f'pose.bones["{n}"].{field}',index=index);fc.keyframe_points.add(len(array))
                co=[]
                for frame,value in enumerate(array):co.extend((frame,value[index]))
                fc.keyframe_points.foreach_set('co',co)
                for k in fc.keyframe_points:k.interpolation='LINEAR'
                fc.update()
    action.use_fake_user=True;baked.append(action);metrics[name]={'frames':len(poses),'maxWristShaftDistance':round(max(errors),6)};max_wrist=max(max_wrist,max(errors))
    print('REFINED',name,metrics[name],flush=True)
rig.animation_data.action=None
for pb in rig.pose.bones:
    for c in list(pb.constraints):pb.constraints.remove(c)
for ob in targets.values():bpy.data.objects.remove(ob,do_unlink=True)
for a in original_actions.values():bpy.data.actions.remove(a,do_unlink=True)
for name,action in zip(names,baked):action.name=name
assert max_wrist<.072, f'Wrist contact lost: {max_wrist}'
for obname,modname,index,preserve in saved_armatures:
    ob=bpy.data.objects.get(obname)
    if not ob:continue
    mod=ob.modifiers.new(modname,'ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=preserve
for ob in scene.objects:
    if ob.type=='MESH':
        for mod in ob.modifiers:
            if mod.type=='ARMATURE':mod.show_viewport=True
rig.animation_data.action=bpy.data.actions['Idle'];scene.frame_set(0);rig.animation_data.action=None
bpy.context.view_layer.objects.active=rig;bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for ob in scene.objects:
    if ob.type=='MESH':ob.select_set(True)
scene.frame_start=0;scene.frame_end=200
bpy.ops.wm.save_as_mainfile(filepath=str(out),compress=True)
report={'status':'passed','input':str(Path(opt.input).resolve()),'output':str(out),'boneCount':len(rig.data.bones),'newClothBones':len(cloth_bones)+len(plume_bones),'skinnedClothVertices':len(vertices),'maxWristDistanceToShaftMeters':max_wrist,'actions':metrics,'method':'Five four-joint cloth chains; two five-joint silk crests; ordinary skinned, baked action curves; torso impulse and dual hand IK; fixed contact time and zero root translation.'}
out.with_suffix('.motion.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('MOTION_COMPLETE',json.dumps(report),flush=True)

if opt.preview:
    scene.render.engine='CYCLES';scene.cycles.samples=20;scene.cycles.use_denoising=True;scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
    scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.07,.09,.12,1);scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.4
    def light(pos,power,color,size):
        bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,1.2))-o.location).to_track_quat('-Z','Y').to_euler()
    light((-3,-4,5),900,(1,.85,.68),4);light((4,-2,3),850,(.65,.8,1),3);light((1,3,4),1100,(1,.35,.12),3)
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.02));floor=bpy.context.object;m=bpy.data.materials.new('Premium cloth studio floor');m.diffuse_color=(.045,.052,.065,1);floor.data.materials.append(m)
    bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=3.9
    for label,action,frame,pos in [('cloth-idle','Idle',0,(3.2,5.5,2.8)),('cloth-back','Run',32,(3.2,5.5,2.8)),('cloth-sweep','Sweep',42,(3,-5,3)),('cloth-slam','LeapSlam',92,(3,-5,3))]:
        rig.animation_data.action=bpy.data.actions[action];rig.animation_data.action_slot=rig.animation_data.action.slots[0];scene.frame_set(frame)
        cam.location=pos;cam.rotation_euler=(Vector((0,0,1.4))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(out.parent/(label+'.png'));bpy.ops.render.render(write_still=True)
        print('PREVIEW',label,flush=True)
