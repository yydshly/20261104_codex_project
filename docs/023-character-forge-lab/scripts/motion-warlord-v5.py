"""V5 contact animation and measured cloth/body/weapon collision bake.

blender --background --python scripts/motion-warlord-v5.py -- --input art.blend --output animated.blend
--verify-only performs the independent signed triangle-distance report without editing the input.
The runtime hook in src/warlord-secondary.js adds world-space foot planting and
capsule corrections after clip blending; the exported clips remain usable alone.
"""
import bpy, bmesh, math, json, argparse, sys, hashlib
import numpy as np
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion
from mathutils.bvhtree import BVHTree

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--input',default=str(ROOT/'assets/warlord/warlord.blend'));p.add_argument('--output',default=str(ROOT/'assets/warlord-v5/animated.blend'));p.add_argument('--verify-only',action='store_true');p.add_argument('--verify-step',type=int,default=5);p.add_argument('--preview',action='store_true');p.add_argument('--repair-action');p.add_argument('--preserve-from');p.add_argument('--repair-report');p.add_argument('--debug-frame',type=int);p.add_argument('--debug-action',default='Attack3')
opt=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
out=Path(opt.output).resolve();out.parent.mkdir(parents=True,exist_ok=True)
preserve=Path(opt.preserve_from).resolve() if opt.preserve_from else out
previous_report=json.loads(preserve.with_suffix('.collision.json').read_text(encoding='utf-8')) if opt.repair_action and preserve.with_suffix('.collision.json').exists() else None
bpy.ops.wm.open_mainfile(filepath=str(Path(opt.input).resolve()));scene=bpy.context.scene;rig=bpy.data.objects['CrimsonWarlord_Rig'];scene.render.fps=100
SCALE=float(rig.scale.x);MARGIN=.008/SCALE
DUR={'Idle':2.,'Walk':1.1,'Run':.8,'Attack1':.72,'Attack2':.82,'Attack3':1.,'Sweep':1.08,'Guard':.32,'LeapSlam':1.28,'Hit':.55,'Death':1.2,'Dodge':.4,'Victory':1.6}
HIT={'Attack1':23,'Attack2':30,'Attack3':40,'Sweep':42,'LeapSlam':92}
NAMES=list(DUR);bone_names=[b.name for b in rig.data.bones];bone_index={n:i for i,n in enumerate(bone_names)}
assert len(bone_names)==100 and all(f'Mantle_{i}_{j}' in bone_index for i in range(5) for j in range(4)), 'V5 expects the existing 100-joint rig'
old_actions={n:bpy.data.actions[n] for n in NAMES if n in bpy.data.actions};inverse_rest=np.array([np.array(b.matrix_local.inverted()) for b in rig.data.bones])
if opt.debug_frame is None:assert set(old_actions)==set(NAMES),'Input must retain all thirteen clips'

def smooth(v):v=max(0,min(1,v));return v*v*(3-2*v)
def curve(t,keys):
    if t<=keys[0][0]:return keys[0][1]
    for (a,v),(b,w) in zip(keys,keys[1:]):
        if t<=b:return v+(w-v)*smooth((t-a)/(b-a))
    return keys[-1][1]
def world_rotate(pb,x=0,y=0,z=0):
    rest=pb.bone.matrix_local.to_quaternion();q=Quaternion((0,0,1),z)@Quaternion((0,1,0),y)@Quaternion((1,0,0),x)
    pb.rotation_quaternion=pb.rotation_quaternion@(rest.inverted()@q@rest)

# No mesh modifier is needed for the measured linear skin evaluation below.
# Removing/rebuilding avoids Blender 4.5 stale armature deform-map caches.
saved=[]
for ob in list(scene.objects):
    if ob.type!='MESH':continue
    for mod in list(ob.modifiers):
        if mod.type=='ARMATURE':saved.append((ob.name,mod.name,mod.use_deform_preserve_volume));ob.modifiers.remove(mod)

def skin_data(ob):
    transform=rig.matrix_world.inverted()@ob.matrix_world
    co=np.array([tuple(transform@v.co)+(1.,) for v in ob.data.vertices],dtype=np.float64)
    influences=[];weights=[];groups={g.index:g.name for g in ob.vertex_groups}
    for v in ob.data.vertices:
        values=sorted([(bone_index[groups[g.group]],g.weight) for g in v.groups if groups.get(g.group) in bone_index and g.weight>1e-8],key=lambda a:-a[1])[:4]
        if not values:values=[(bone_index['root'],1.)]
        total=sum(w for _,w in values);values=[(b,w/total) for b,w in values]
        influences.append([v[0] for v in values]+[0]*(4-len(values)));weights.append([v[1] for v in values]+[0.]*(4-len(values)))
    return {'name':ob.name,'co':co,'indices':np.array(influences,dtype=np.int32),'weights':np.array(weights),'faces':[tuple(p.vertices) for p in ob.data.polygons]}
cloth_objects=[o for o in scene.objects if o.type=='MESH' and o.name.startswith(('PremiumWarMantle','MantleWovenBorder','MantleCloudEmbroidery','PremiumSilkCrest'))]
cloth=[skin_data(o) for o in cloth_objects]
body_objects=[o for o in scene.objects if o.type=='MESH' and o not in cloth_objects and any(g.name in bone_index for g in o.vertex_groups)]
body=[];excluded_open=[];oriented=[]
for ob in body_objects:
    data=skin_data(ob);bm=bmesh.new();bm.from_mesh(ob.data);bm.verts.ensure_lookup_table();original=bm.verts.layers.int.new('originalVertex')
    for v in bm.verts:v[original]=v.index
    transform=rig.matrix_world.inverted()@ob.matrix_world
    for v in bm.verts:v.co=transform@v.co
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000005)
    closed=all(e.is_manifold for e in bm.edges)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));volume=bm.calc_volume(signed=True)
    if volume<0:bmesh.ops.reverse_faces(bm,faces=list(bm.faces))
    coherent_faces=[tuple(v[original] for v in face.verts) for face in bm.faces];bm.free()
    if not closed or abs(volume)<1e-10:excluded_open.append(ob.name);continue
    if coherent_faces!=data['faces']:oriented.append(ob.name)
    data['faces']=coherent_faces
    data['weapon']=any(bone_index['Halberd_Control'] in indices for indices in data['indices']);body.append(data)
assert cloth and body

def skin(data,matrices):
    deform=matrices@inverse_rest
    points=np.zeros((len(data['co']),4))
    for slot in range(4):points+=np.einsum('nij,nj->ni',deform[data['indices'][:,slot]],data['co'])*data['weights'][:,slot,None]
    return points[:,:3]

class SolidGeometry:
    def __init__(self,tree,solids,owners):
        self.tree=tree;self.solids=solids;self.owners=owners
        self.minimum=np.array([solid[1] for solid in solids]) if solids else np.empty((0,3));self.maximum=np.array([solid[2] for solid in solids]) if solids else np.empty((0,3))
    def find_nearest(self,point):return self.tree.find_nearest(point)
    def ray_cast(self,*args):return self.tree.ray_cast(*args)
    def contains(self,point):
        return bool(self.containing(point))
    def containing(self,point):
        if not self.solids:return []
        candidates=np.flatnonzero(np.all(point>=self.minimum-1e-8,axis=1)&np.all(point<=self.maximum+1e-8,axis=1))
        direction=Vector((.853,.371,.366)).normalized();inside=[]
        for index in candidates:
            tree,_,_=self.solids[index];origin=Vector(point);crossings=0
            for _ in range(64):
                hit=tree.ray_cast(origin,direction,8.)
                if hit[0] is None:break
                crossings+=1;origin=hit[0]+direction*.000005
            if crossings%2:inside.append(int(index))
        return inside

def geometry_tree(matrices,include_weapon=True):
    global face_owners
    vertices=[];faces=[];offset=0;face_owners=[];solids=[]
    for data in body:
        if data['weapon'] and not include_weapon:continue
        v=skin(data,matrices);vertices.extend(v.tolist());faces.extend(tuple(offset+i for i in f) for f in data['faces']);face_owners.extend([data['name']]*len(data['faces']));offset+=len(v)
        if include_weapon:solids.append((BVHTree.FromPolygons(v.tolist(),data['faces'],all_triangles=False,epsilon=0.),np.min(v,axis=0),np.max(v,axis=0)))
    return SolidGeometry(BVHTree.FromPolygons(vertices,faces,all_triangles=False,epsilon=0.),solids,face_owners)
def signed_distances(points,tree):
    result=[]
    for point in points:
        hit=tree.find_nearest(Vector(point))
        if hit[0] is None:result.append((1e3,np.zeros(3)))
        else:
            location,normal,_,distance=hit;containing=tree.containing(point);inside=bool(containing)
            if inside:
                # An unrelated external surface may be nearer than the volume
                # containing the point. Its normal is not an escape direction.
                candidates=[tree.solids[index][0].find_nearest(Vector(point)) for index in containing]
                location,normal,_,distance=min(candidates,key=lambda v:v[3])
            signed=-distance if inside else distance
            normal=(np.array(location)-point)/max(1e-9,distance) if inside else (point-np.array(location))/max(1e-9,distance)
            if distance<1e-9:normal=np.array(hit[1])
            result.append((signed,normal))
    return result

if opt.debug_frame is not None:
    rig.animation_data.action=old_actions[opt.debug_action];rig.animation_data.action_slot=rig.animation_data.action.slots[0];scene.frame_set(opt.debug_frame)
    mats=np.array([np.array(rig.pose.bones[n].matrix) for n in bone_names]);tree=geometry_tree(mats);a=mats[bone_index['HalberdGrip'],:3,3];b=mats[bone_index['HalberdTip'],:3,3];axis=b-a;axis/=np.linalg.norm(axis)
    result=[]
    for data in cloth:
        points=skin(data,mats)
        for vi,(distance,normal) in enumerate(signed_distances(points,tree)):
            if distance>=.002/SCALE:continue
            point=points[vi];delta=point-a;along=np.dot(delta,axis);radial=delta-axis*along;nearest=tree.find_nearest(Vector(point))
            result.append({'mesh':data['name'],'vertex':vi,'point':point.tolist(),'distance':distance*SCALE,'radialToShaft':np.linalg.norm(radial)*SCALE,'alongFromGrip':along*SCALE,'nearestObstacle':tree.owners[nearest[2]],'weights':[(bone_names[int(bone)],float(weight)) for bone,weight in zip(data['indices'][vi],data['weights'][vi]) if weight>.001]})
    out.with_suffix('.debug.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8');print('COLLISION_DEBUG',json.dumps(result),flush=True);sys.exit(0)

# Original matrices are sampled with deform modifiers detached. This also keeps
# the limb contact solve independent of the mesh's current subdivision budget.
cached={};original_world={}
for name in NAMES:
    rig.animation_data.action=old_actions[name]
    if len(old_actions[name].slots):rig.animation_data.action_slot=old_actions[name].slots[0]
    frames=[];worlds=[]
    for frame in range(round(DUR[name]*100)+1):
        scene.frame_set(frame);frames.append({n:rig.pose.bones[n].matrix_basis.copy() for n in bone_names});worlds.append({n:rig.pose.bones[n].matrix.copy() for n in bone_names})
    cached[name]=frames;original_world[name]=worlds;print('CAPTURED',name,len(frames),flush=True)
rig.animation_data.action=None
for track in list(rig.animation_data.nla_tracks):rig.animation_data.nla_tracks.remove(track)
idle_feet={s:original_world['Idle'][0]['foot_'+s].copy() for s in ['l','r']}

targets={};constraints=[]
if not opt.verify_only and not opt.repair_report:
    for role,ends in [('hand',['l','r']),('foot',['l','r'])]:
        for side in ends:
            target=bpy.data.objects.new(f'V5_{role}_{side}',None);scene.collection.objects.link(target);targets[(role,side)]=target
            lower='lowerarm_'+side if role=='hand' else 'calf_'+side
            c=rig.pose.bones[lower].constraints.new('IK');c.target=target;c.chain_count=2;c.use_tail=True;c.iterations=160;c.influence=0;constraints.append((role,side,c))

def feet_contract(name,t):
    if name in ['Idle','Guard','Hit','Attack1','Attack2','Attack3','Sweep','Victory']:return {'l':1.,'r':1.}
    if name=='LeapSlam':
        weight=curve(t,[(0,1),(.18,1),(.30,0),(.76,0),(.84,1),(1.28,1)])
        return {'l':weight,'r':weight}
    return {'l':0.,'r':0.}
def pose_attack(name,t):
    if name not in ['Attack1','Attack2','Attack3','Sweep']:return
    hit=HIT[name]/100;end=DUR[name];sign=-1 if name=='Attack2' else 1
    phase=curve(t,[(0,0),(hit*.60,-1),(hit,0),(min(end*.82,hit+.20),1),(end,0)])
    strength=1.25 if name=='Sweep' else 1.15 if name=='Attack3' else 1
    pelvis=rig.pose.bones['pelvis'];mat=pelvis.matrix.copy();mat.translation+=Vector((0,.035*phase,-.025*abs(phase)))*strength;pelvis.matrix=mat
    world_rotate(rig.pose.bones['spine_02'],z=sign*.10*phase*strength,x=.035*abs(phase))
    world_rotate(rig.pose.bones['spine_03'],z=sign*.08*phase*strength)
    world_rotate(rig.pose.bones['Head'],z=-sign*.045*phase)

cloth_indices={bone_index[n] for n in bone_names if n.startswith(('Mantle_','SilkCrest_'))}
def collide_cloth(mats,tree,max_iterations=8,body_tree=None):
    before_min=1e3;before_count=0;iterations=0
    def posterior_project(obstacles):
        shifts={}
        for data in cloth:
            points=skin(data,mats)
            for vi,point in enumerate(points):
                hit=obstacles.ray_cast(Vector((point[0],4.,point[2])),Vector((0,-1,0)),8.)
                if hit[0] is None:continue
                needed=hit[0].y+MARGIN*1.5-point[1]
                if needed<=0:continue
                for bone,weight in zip(data['indices'][vi],data['weights'][vi]):
                    if bone in cloth_indices and weight>.001:shifts[int(bone)]=max(shifts.get(int(bone),0),needed)
        for bone,shift in shifts.items():mats[bone,1,3]+=min(.8/SCALE,shift)
        return max(shifts.values(),default=0)*SCALE
    # A ray from behind the character finds the actual posterior surface even
    # when a fast windup has carried a cloth vertex deeply through a cuirass.
    # Per-joint conservative max corrections prevent opposing surface normals
    # from averaging to zero inside nested body/armor volumes.
    if body_tree and max_iterations:
        for data in cloth:
            for distance,_ in signed_distances(skin(data,mats),tree):before_min=min(before_min,distance);before_count+=int(distance<0)
        posterior_project(body_tree)
    for iteration in range(max_iterations):
        corrections={};denom={};penetrations=0;minimum=1e3
        for data in cloth:
            points=skin(data,mats);distances=signed_distances(points,tree)
            for vi,(distance,normal) in enumerate(distances):
                minimum=min(minimum,distance)
                if distance>=MARGIN-.001/SCALE:continue
                penetrations+=int(distance<0)
                # Correct the skin's actual vertices through their existing
                # deform joints, rather than merely testing cloth bone nodes.
                depth=min(.10/SCALE,MARGIN-distance);shift=normal*depth
                active=[(int(b),float(w)) for b,w in zip(data['indices'][vi],data['weights'][vi]) if b in cloth_indices and w>.001]
                weight2=sum(w*w for _,w in active)
                for b,w in active:
                    correction=shift*w/max(.05,weight2)
                    corrections[b]=corrections.get(b,np.zeros(3))+correction;denom[b]=denom.get(b,0)+1
        if iteration==0 and not body_tree:before_min=minimum;before_count=penetrations
        iterations=iteration+1
        if not corrections:break
        for b,shift in corrections.items():
            # Weighted Jacobi correction of the actual linear skin. A soft
            # root limit keeps shoulder attachments connected to the body.
            delta=shift/max(1,denom[b])*.94
            old=mats[b,:3,3].copy();delta=np.clip(delta,-.05/SCALE,.05/SCALE)
            mats[b,:3,3]=old+delta
    posterior_max=posterior_project(body_tree) if body_tree and max_iterations else 0
    def shaft_clearance():
        a=mats[bone_index['HalberdGrip'],:3,3];b=mats[bone_index['HalberdTip'],:3,3];axis=b-a;length=np.linalg.norm(axis);axis/=max(1e-9,length);low=-1.26/SCALE;high=length-.12/SCALE
        normal=np.array((0.,1.,0.))-axis*axis[1]
        for _ in range(6):
            shifts={};directions={}
            for data in cloth:
                points=skin(data,mats);n=normal.copy()
                if np.linalg.norm(n)<.10:
                    center=np.mean(points,axis=0);n=np.array((-1. if center[0]<a[0] else 1.,0.,0.));n-=axis*np.dot(n,axis)
                n/=max(1e-9,np.linalg.norm(n))
                if n[1]<0:n=-n
                for vi,point in enumerate(points):
                    delta=point-a;along=np.dot(delta,axis)
                    if along<low or along>high:continue
                    radial=delta-axis*along
                    if np.linalg.norm(radial)>.05/SCALE:continue
                    needed=.048/SCALE-np.dot(radial,n)
                    if needed<=0:continue
                    for bone,weight in zip(data['indices'][vi],data['weights'][vi]):
                        if bone in cloth_indices and weight>.001:
                            bone=int(bone)
                            if needed>shifts.get(bone,0):shifts[bone]=needed;directions[bone]=n
            if not shifts:break
            for bone,shift in shifts.items():mats[bone,:3,3]+=directions[bone]*min(.15/SCALE,shift)
    if body_tree and max_iterations:shaft_clearance()
    local_corrections=0
    if body_tree and max_iterations:
        # Thin weapons should produce a small local deflection, not throw a
        # complete cape/ribbon behind the far end of a nearly parallel shaft.
        # Minimum-norm weighted joint corrections follow the actual containing
        # solid's escape normal, not an unrelated nearer ornament's normal.
        for _ in range(28):
            worst=(1e3,None,None,None)
            for data in cloth:
                for vi,(distance,normal) in enumerate(signed_distances(skin(data,mats),tree)):
                    if distance<worst[0]:worst=(distance,normal,data,vi)
            distance,normal,data,vi=worst
            if distance>=.004/SCALE:break
            correction=normal*min(.08/SCALE,.006/SCALE-distance)
            active=[(int(bone),float(weight)) for bone,weight in zip(data['indices'][vi],data['weights'][vi]) if bone in cloth_indices and weight>.001];weight2=sum(weight*weight for _,weight in active)
            for bone,weight in active:mats[bone,:3,3]+=correction*(weight/max(.01,weight2))
            posterior_project(body_tree);local_corrections+=1
        shaft_clearance()
    after_min=1e3;after_count=0;surface_contacts=0;mesh_details=[]
    for data in cloth:
        points=skin(data,mats);distances=signed_distances(points,tree);local_min=min(d[0] for d in distances);local_inside=sum(d[0]<-.002/SCALE for d in distances);worst=min(range(len(distances)),key=lambda i:distances[i][0]);nearest=tree.find_nearest(Vector(points[worst]))
        mesh_details.append({'mesh':data['name'],'minimum':local_min*SCALE,'inside':local_inside,'nearestObstacle':tree.owners[nearest[2]] if nearest[2] is not None else None,'vertex':worst})
        for distance,_ in distances:after_min=min(after_min,distance);after_count+=int(distance<-.002/SCALE);surface_contacts+=int(distance<MARGIN)
    return mats,{'beforeMinimumSignedDistanceMeters':before_min*SCALE,'beforeInsideVertices':before_count,'minimumSignedDistanceMeters':after_min*SCALE,'insideVerticesBeyond2mm':after_count,'nearContactVertices':surface_contacts,'iterations':iterations,'posteriorCorrectionMeters':posterior_max,'localCollisionCorrections':local_corrections,'meshes':mesh_details}

report={'status':'checking','mode':'independent-read-only' if opt.verify_only else 'bake-and-measure','input':str(Path(opt.input).resolve()),'output':None if opt.verify_only else str(out),'bones':len(bone_names),'geometryMethod':'Ordinary linear blend skin evaluated from real mesh vertices, weights and pose/inverse-bind matrices; ray-parity solid-inside classification and nearest triangle distance on consistently outward closed skinned body/armor/weapon solids. UV seams are welded only for closed-solid classification. Open decorative sheets/trim cannot define an inside volume and are listed separately. Outer cloth surface vertices are measured; solidified shell thickness is 4 mm.','orientedMirroredColliderWinding':oriented,'excludedOpenDecorativeMeshes':excluded_open,'sampling':f'Every {max(1,opt.verify_step)} frame(s) at 100 fps plus exact contact frames'+(' on the independently reopened baked file' if opt.verify_only else '; corrections interpolated into 100 Hz bone keys'),'bodyMeshes':len(body),'bodyVertices':sum(len(d['co']) for d in body),'bodyPolygons':sum(len(d['faces']) for d in body),'clothMeshes':len(cloth),'clothVertices':sum(len(d['co']) for d in cloth),'clearanceTargetMeters':MARGIN*SCALE,'actions':{}}
report['locomotion']={}
report['inputBlendSha256']=hashlib.sha256(Path(opt.input).read_bytes()).hexdigest()
for locomotion in ['Walk','Run']:
    amplitude={side:(max(m['foot_'+side].translation.y for m in original_world[locomotion])-min(m['foot_'+side].translation.y for m in original_world[locomotion]))*SCALE for side in ['l','r']}
    stride=sum(amplitude.values())
    report['locomotion'][locomotion]={'cycleSeconds':DUR[locomotion],'ankleForeAftRangeMeters':amplitude,'suggestedStrideMeters':stride,'naturalSpeedMetersPerSecond':stride/DUR[locomotion],'estimation':'twice average single-ankle fore/aft travel per full left-right gait cycle'}
print('LOCOMOTION_STRIDE',json.dumps(report['locomotion']),flush=True)
if opt.repair_report:
    source_report=json.loads(Path(opt.repair_report).read_text(encoding='utf-8'));repairs={};remaining=0
    for name,details in source_report['actions'].items():
        contacts=details if isinstance(details,list) else details['contacts']
        bad=sorted({v['frame'] for v in contacts if v['insideVerticesBeyond2mm']>0 or v['minimumSignedDistanceMeters']<.001})
        if not bad:continue
        action=old_actions[name];rig.animation_data.action=action;rig.animation_data.action_slot=action.slots[0];entries=[]
        for frame in bad:
            scene.frame_set(frame);mats=np.array([np.array(rig.pose.bones[n].matrix) for n in bone_names]);posterior=geometry_tree(mats,include_weapon=False);tree=geometry_tree(mats)
            mats,result=collide_cloth(mats,tree,max_iterations=12,body_tree=posterior)
            for n in bone_names:
                if bone_index[n] not in cloth_indices:continue
                pb=rig.pose.bones[n];matrix=Matrix(mats[bone_index[n]].tolist());parent=Matrix(mats[bone_index[pb.parent.name]].tolist()) if pb.parent else Matrix.Identity(4);rest_parent=pb.parent.bone.matrix_local if pb.parent else Matrix.Identity(4)
                basis=pb.bone.matrix_local.inverted()@rest_parent@parent.inverted()@matrix;location,rotation,scale=basis.decompose()
                if pb.rotation_quaternion.dot(rotation)<0:rotation.negate()
                pb.location=location;pb.rotation_quaternion=rotation;pb.scale=scale
                for field in ['location','rotation_quaternion','scale']:pb.keyframe_insert(data_path=field,frame=frame,group=n)
            result['frame']=frame;entries.append(result);remaining+=result['insideVerticesBeyond2mm']
            print('REPAIRED_FRAME',name,frame,round(result['minimumSignedDistanceMeters'],6),result['insideVerticesBeyond2mm'],flush=True)
        repairs[name]=entries
    for obname,modname,preserve_volume in saved:
        ob=bpy.data.objects.get(obname)
        if ob:mod=ob.modifiers.new(modname,'ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=preserve_volume
    for action in bpy.data.actions:action.use_fake_user=True
    rig.animation_data.action=old_actions['Idle'];rig.animation_data.action_slot=rig.animation_data.action.slots[0];scene.frame_set(0);rig.animation_data.action=None
    assert set(bpy.data.actions.keys())==set(NAMES)
    bpy.ops.wm.save_as_mainfile(filepath=str(out),compress=True)
    patch_report={'status':'passed' if remaining==0 else 'needs-review','input':str(Path(opt.input).resolve()),'output':str(out),'scope':'Only cloth/plume keys at independently identified bad 100-Hz frames are replaced; all good frames, body, feet, hands, weapon, timings and thirteen action names remain unchanged.','remainingInsideBeyond2mm':remaining,'actions':repairs}
    out.with_suffix('.repairs.json').write_text(json.dumps(patch_report,ensure_ascii=False,indent=2),encoding='utf-8');print('BAD_FRAME_REPAIR_COMPLETE',json.dumps({'status':patch_report['status'],'frames':sum(len(v) for v in repairs.values()),'remaining':remaining}),flush=True);sys.exit(0)
baked=[];process_names=[opt.repair_action] if opt.repair_action else NAMES
assert set(process_names)<=set(NAMES)
for name in process_names:
    poses=[];samples=[];foot_samples={s:[] for s in ['l','r']};wrist=[];raw_frames=[];correction_frames={}
    rig.animation_data.action=None
    for frame,base in enumerate(cached[name]):
        seconds=frame/100;t=seconds/DUR[name]
        for _,_,c in constraints:c.influence=0
        scene.frame_set(frame)
        for n in bone_names:rig.pose.bones[n].matrix_basis=base[n]
        bpy.context.view_layer.update()
        control=rig.pose.bones['Halberd_Control'].matrix.copy();hands={s:rig.pose.bones['hand_'+s].matrix.copy() for s in ['l','r']};offsets={s:control.inverted()@hands[s].translation for s in ['l','r']}
        if not opt.verify_only:
            pose_attack(name,seconds);bpy.context.view_layer.update();feet=feet_contract(name,seconds)
            lower=0
            for side in ['l','r']:
                if feet[side]<.999:continue
                hip=rig.pose.bones['thigh_'+side].head;target=idle_feet[side].translation;reach=(rig.data.bones['thigh_'+side].length+rig.data.bones['calf_'+side].length)*.985
                horizontal=(hip.x-target.x)**2+(hip.y-target.y)**2;maximum_height=math.sqrt(max(.001,reach*reach-horizontal))
                lower=max(lower,hip.z-target.z-maximum_height)
            if lower>0:
                pelvis=rig.pose.bones['pelvis'];lowered=pelvis.matrix.copy();lowered.translation.z-=min(.08,lower);pelvis.matrix=lowered;bpy.context.view_layer.update()
            for side in ['l','r']:
                target=idle_feet[side].translation
                targets[('foot',side)].location=rig.matrix_world@target
            for role,side,c in constraints:
                if role=='foot':c.influence=feet[side]
            bpy.context.view_layer.update()
            for side in ['l','r']:
                if feet[side]>.001:
                    pb=rig.pose.bones['foot_'+side];desired=pb.matrix.copy();desired.translation=pb.head;desired=Matrix.Translation(desired.translation)@pb.matrix.to_quaternion().slerp(idle_feet[side].to_quaternion(),feet[side]).to_matrix().to_4x4();pb.matrix=desired
            pos=control.translation.copy();q=control.to_quaternion()
            for _ in range(18):
                for side in ['l','r']:
                    upper=rig.pose.bones['upperarm_'+side];lower=rig.pose.bones['lowerarm_'+side];radius=(upper.bone.length+lower.bone.length)*.985
                    delta=pos+q@offsets[side]-upper.head
                    if delta.length>radius:pos-=delta*(1-radius/delta.length)
            control.translation=pos;rig.pose.bones['Halberd_Control'].matrix=control
            for side in ['l','r']:targets[('hand',side)].location=rig.matrix_world@(control@offsets[side])
            for role,side,c in constraints:
                if role=='hand':c.influence=1
            bpy.context.view_layer.update()
            for side in ['l','r']:
                hand=rig.pose.bones['hand_'+side];hand.matrix=Matrix.Translation(hand.head)@hands[side].to_quaternion().to_matrix().to_4x4()
            bpy.context.view_layer.update()
        evaluated=rig.evaluated_get(bpy.context.evaluated_depsgraph_get());mats=np.array([np.array(evaluated.pose.bones[n].matrix) for n in bone_names])
        if not opt.verify_only and name=='Attack3':
            # The rear shaft passes the left middle mantle during recovery.
            # Author an inertial wing deflection rather than relying on an
            # oscillating nearest-point solve at that thin, fast contact.
            impulse=curve(seconds,[(0,0),(.15,0),(.30,1),(.62,1),(.83,0),(1,0)])
            shaft_a=mats[bone_index['HalberdGrip'],:3,3];shaft_axis=mats[bone_index['HalberdTip'],:3,3]-shaft_a;shaft_axis/=max(1e-9,np.linalg.norm(shaft_axis))
            outward=np.array((0.,1.,0.))-shaft_axis*shaft_axis[1]
            if np.linalg.norm(outward)<.1:outward=np.array((-1.,0.,0.))-shaft_axis*(-shaft_axis[0])
            outward/=max(1e-9,np.linalg.norm(outward))
            for column in [0,1]:
                for row in [1,2,3]:
                    joint=bone_index[f'Mantle_{column}_{row}'];delta=mats[joint,:3,3]-shaft_a;radial=delta-shaft_axis*np.dot(delta,shaft_axis)
                    needed=max(0,(.22 if column==0 else .18)/SCALE-np.dot(radial,outward))
                    mats[joint,:3,3]+=outward*needed*impulse
        raw_frames.append(mats.copy())
        measure=frame%max(1,opt.verify_step)==0 or frame in [HIT.get(name,-1),84,92,len(cached[name])-1]
        if measure:
            posterior_tree=geometry_tree(mats,include_weapon=False) if not opt.verify_only else None
            tree=geometry_tree(mats)
            if opt.verify_only:_,collision=collide_cloth(mats.copy(),tree,max_iterations=0)
            else:mats,collision=collide_cloth(mats,tree,body_tree=posterior_tree)
            correction_frames[frame]={b:mats[b,:3,3]-raw_frames[-1][b,:3,3] for b in cloth_indices}
            collision['frame']=frame;collision['time']=seconds;samples.append(collision)
            if frame%25==0:print('COLLISION_SAMPLE',name,frame,round(collision['minimumSignedDistanceMeters'],5),collision['insideVerticesBeyond2mm'],flush=True)
        # Direct measured skin corrections are converted back to local pose
        # transforms using explicit parent matrices, so no deform cache is used.
        basis={}
        for n in bone_names:
            pb=rig.pose.bones[n];i=bone_index[n];matrix=Matrix(mats[i].tolist());pm=Matrix(mats[bone_index[pb.parent.name]].tolist()) if pb.parent else Matrix.Identity(4);pr=pb.parent.bone.matrix_local if pb.parent else Matrix.Identity(4)
            basis[n]=pb.bone.matrix_local.inverted()@pr@pm.inverted()@matrix
        basis['root']=Matrix.Identity(4);poses.append(basis)
        grip=Vector(mats[bone_index['HalberdGrip'],:3,3]);tip=Vector(mats[bone_index['HalberdTip'],:3,3]);axis=(tip-grip).normalized()
        for side in ['l','r']:
            foot=Vector(mats[bone_index['foot_'+side],:3,3]);foot_samples[side].append(foot)
            delta=Vector(mats[bone_index['hand_'+side],:3,3])-grip;wrist.append((delta-axis*delta.dot(axis)).length*SCALE)
    for _,_,c in constraints:c.influence=0
    if not opt.verify_only:
        # Bake corrections at 20 Hz plus exact event frames, then linearly
        # interpolate all 100-Hz skin joints. This avoids stepped collision
        # offsets while retaining the measured solution at every sample.
        keys=sorted(correction_frames)
        cursor=0
        for frame,mats in enumerate(raw_frames):
            while cursor+1<len(keys) and keys[cursor+1]<frame:cursor+=1
            a=keys[cursor];b=keys[min(cursor+1,len(keys)-1)];blend=(frame-a)/(b-a) if b>a else 0
            for joint in cloth_indices:mats[joint,:3,3]+=correction_frames[a][joint]*(1-blend)+correction_frames[b][joint]*blend
            for n in bone_names:
                pb=rig.pose.bones[n];matrix=Matrix(mats[bone_index[n]].tolist());pm=Matrix(mats[bone_index[pb.parent.name]].tolist()) if pb.parent else Matrix.Identity(4);pr=pb.parent.bone.matrix_local if pb.parent else Matrix.Identity(4)
                poses[frame][n]=pb.bone.matrix_local.inverted()@pr@pm.inverted()@matrix
            poses[frame]['root']=Matrix.Identity(4)
    locked=name in ['Idle','Guard','Hit','Attack1','Attack2','Attack3','Sweep','Victory']
    drift={s:max((point-foot_samples[s][0]).length*SCALE for point in foot_samples[s]) for s in ['l','r']} if locked else None
    result={'duration':DUR[name],'frames':len(poses),'maxWristToShaftMeters':max(wrist),'plantedAnkleDriftMeters':drift,'minimumSignedClothGeometryDistanceMeters':min(v['minimumSignedDistanceMeters'] for v in samples),'maximumInsideClothVerticesBeyond2mm':max(v['insideVerticesBeyond2mm'] for v in samples),'maximumInputInsideVertices':max(v['beforeInsideVertices'] for v in samples),'contacts':[v for v in samples if v['nearContactVertices'] or v['beforeInsideVertices']],'measuredFrames':len(samples)}
    report['actions'][name]=result
    print('V5_ACTION',name,json.dumps({k:v for k,v in result.items() if k!='contacts'}),flush=True)
    if not opt.verify_only:
        action=bpy.data.actions.new('V5_'+name);rig.animation_data.action=action;rig.pose.bones['root'].keyframe_insert(data_path='location',frame=0);bag=action.layers[0].strips[0].channelbag(action.slots[0])
        for fc in list(bag.fcurves):bag.fcurves.remove(fc)
        for n in bone_names:
            values={'location':[],'rotation_quaternion':[],'scale':[]};previous=None
            for pose in poses:
                loc,rot,scale=pose[n].decompose()
                if previous and previous.dot(rot)<0:rot.negate()
                previous=rot.copy();values['location'].append(tuple(loc));values['rotation_quaternion'].append(tuple(rot));values['scale'].append(tuple(scale))
            for field,array in values.items():
                for index in range(len(array[0])):
                    fc=bag.fcurves.new(data_path=f'pose.bones["{n}"].{field}',index=index);fc.keyframe_points.add(len(array));co=[]
                    for f,v in enumerate(array):co.extend((f,v[index]))
                    fc.keyframe_points.foreach_set('co',co)
                    for key in fc.keyframe_points:key.interpolation='LINEAR'
                    fc.update()
        action.use_fake_user=True;baked.append(action)

if previous_report:
    combined=previous_report['actions'];combined.update(report['actions']);report['actions']=combined;report['focusedRepairAction']=opt.repair_action
report['status']='passed' if max(v['maximumInsideClothVerticesBeyond2mm'] for v in report['actions'].values())==0 else 'needs-review'
report['maximumWristDistanceMeters']=max(v['maxWristToShaftMeters'] for v in report['actions'].values())
report['runtimeHook']='createWarlordSecondary(THREE, actorRoot, {groundHeight}); each frame prepare() before mixer, then update(dt,{action,actionTime,grounded}) after mixer and actor world transform, before weapon FX sampling. reset() on trial reset. World-space 2-bone feet remain planted while root step/turn changes; body/leg/weapon capsule checks protect mixed poses.'
assert report['maximumWristDistanceMeters']<.071,report['maximumWristDistanceMeters']
if not opt.verify_only:
    rig.animation_data.action=None
    for pb in rig.pose.bones:
        for c in list(pb.constraints):pb.constraints.remove(c)
    for ob in targets.values():bpy.data.objects.remove(ob,do_unlink=True)
    for action in old_actions.values():bpy.data.actions.remove(action,do_unlink=True)
    if opt.repair_action:
        assert preserve.exists(),'Focused repair preserves the other twelve clips from the existing output'
        assert preserve!=out,'Use a different output path when appending preserved actions'
        with bpy.data.libraries.load(str(preserve),link=False) as (source,target):target.actions=[n for n in NAMES if n!=opt.repair_action]
        for action in target.actions:
            if action:action.use_fake_user=True
    for name,action in zip(process_names,baked):action.name=name
    assert set(bpy.data.actions.keys())==set(NAMES),list(bpy.data.actions.keys())
    for obname,modname,preserve in saved:
        ob=bpy.data.objects.get(obname)
        if ob:mod=ob.modifiers.new(modname,'ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=preserve
    rig.animation_data.action=bpy.data.actions['Idle'];scene.frame_set(0);rig.animation_data.action=None
    bpy.ops.wm.save_as_mainfile(filepath=str(out),compress=True)
report_path=out.with_suffix('.collision.json');report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('V5_MOTION_COMPLETE',json.dumps({'status':report['status'],'output':str(out),'report':str(report_path),'maxWrist':report['maximumWristDistanceMeters']}),flush=True)
