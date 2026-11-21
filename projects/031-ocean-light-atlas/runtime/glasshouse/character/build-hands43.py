"""Local hand-only repair; retains the accepted own 0597 face and morphs.
Hand surfaces: existing local Microsoft/Rocketbox adult 10 (MIT). No donor
head/body geometry. Original/default/facial files are never overwritten.
"""
import bpy,bmesh,math,json,hashlib
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import numpy as np
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'character/personal-0597';OUT=ROOT/'assets/personal-guide'
bpy.ops.wm.open_mainfile(filepath=str(WORK/'personal-guide-facial.blend'))
bpy.context.preferences.filepaths.save_version=0
scene=bpy.context.scene;rig=next(o for o in scene.objects if o.type=='ARMATURE');body=next(o for o in scene.objects if o.type=='MESH' and o.data.shape_keys)
rig.data.pose_position='REST';original_actions=set(bpy.data.actions)
for k in body.data.shape_keys.key_blocks:k.value=0
original_names=[k.name for k in body.data.shape_keys.key_blocks]
original=np.array([[tuple(p.co) for p in k.data] for k in body.data.shape_keys.key_blocks],dtype=np.float32)
body_bvh=BVHTree.FromPolygons([v.co.copy() for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons])
body_uv=body.data.uv_layers.active
def sleeve_uv(point):
 hit,no,index,d=body_bvh.find_nearest(point);p=body.data.polygons[index]
 li=min(p.loop_indices,key=lambda li:(body.data.vertices[body.data.loops[li].vertex_index].co-hit).length_squared)
 return tuple(body_uv.data[li].uv)
source_id=body.data.attributes.new('Hand43SourceVertex','INT','POINT')
for i,x in enumerate(source_id.data):x.value=i+1

def texture(material):
 return next((n.image for n in material.node_tree.nodes if n.type=='TEX_IMAGE' and n.image and n.image.colorspace_settings.name=='sRGB'),None)
def median_albedo(ob,ids):
 uv=ob.data.uv_layers.active;values=[];cache={}
 for p in ob.data.polygons:
  if not any(i in ids for i in p.vertices):continue
  mat=ob.data.materials[p.material_index];image=texture(mat)
  if image is None:continue
  if image.name not in cache:cache[image.name]=np.array(image.pixels[:],np.float32).reshape(image.size[1],image.size[0],4)
  a=cache[image.name]
  for li in p.loop_indices:
   if ob.data.loops[li].vertex_index not in ids:continue
   u,v=uv.data[li].uv;rgb=a[int(v*(image.size[1]-1))%image.size[1],int(u*(image.size[0]-1))%image.size[0],:3]
   if rgb[0]>.08 and rgb[0]>rgb[2]*1.08:values.append(rgb)
 return np.median(np.array(values),axis=0) if values else np.array([.65,.43,.32])

face_ids={v.index for v in body.data.vertices if 1.53<v.co.z<1.59 and .025<abs(v.co.x)<.058 and v.co.y<-.075}
skin_target=median_albedo(body,face_ids)
cloth_image=texture(body.data.materials[0]);cloth_pixels=np.array(cloth_image.pixels[:],np.float32).reshape(cloth_image.size[1],cloth_image.size[0],4);cloth_values=[]
for p in body.data.polygons:
 if not (.944<p.center.z<.98 and abs(p.center.x)>.24):continue
 for li in p.loop_indices:
  u,v=body_uv.data[li].uv;rgb=cloth_pixels[int(v*(cloth_image.size[1]-1)),int(u*(cloth_image.size[0]-1)),:3]
  if rgb[2]>rgb[0] and rgb[2]<.5:cloth_values.append(rgb)
cloth_rgb=np.median(cloth_values,axis=0);cloth_linear=np.where(cloth_rgb<=.04045,cloth_rgb/12.92,((cloth_rgb+.055)/1.055)**2.4);print('SLEEVE_ALBEDO',cloth_rgb,flush=True)
old_hand={};removed=[]
for side,sign in [('L',1),('R',-1)]:
 hand_name='Bip01 '+side+' Hand';hand_id=body.vertex_groups[hand_name].index;anchor=rig.data.bones[hand_name].head_local
 arm_ids={g.index for g in body.vertex_groups if ' '+side+' Hand' in g.name or ' '+side+' Forearm' in g.name}
 ids={v.index for v in body.data.vertices if .64<v.co.z<.939 and (v.co.x*sign>.23 or (v.co.x*sign>.18 and sum(g.weight for g in v.groups if g.group in arm_ids)>.45)) and (v.co-anchor).length<.205}
 assert 1000<len(ids)<6000,(side,len(ids));old_hand[side]={'ids':ids,'colour':skin_target.tolist()};removed.extend(ids)

before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/rocket-guide/rocket-guide.glb'))
donors=[o for o in bpy.data.objects if o not in before];source_rig=next(o for o in donors if o.type=='ARMATURE');source_rig.data.pose_position='REST';bpy.context.view_layer.update()
new_hands=[];records=[]
for side,sign in [('L',1),('R',-1)]:
 name='Bip01 '+side+' Hand';source_hand=source_rig.matrix_world@source_rig.data.bones[name].head_local;source_elbow=source_rig.matrix_world@source_rig.data.bones['Bip01 '+side+' Forearm'].head_local
 target_hand=rig.data.bones[name].head_local;target_elbow=rig.data.bones['Bip01 '+side+' Forearm'].head_local
 rotation=(source_hand-source_elbow).normalized().rotation_difference((target_hand-target_elbow).normalized())
 long=(source_rig.matrix_world@source_rig.data.bones['Bip01 '+side+' Finger2'].head_local-source_hand).normalized()
 across=(source_rig.matrix_world@source_rig.data.bones['Bip01 '+side+' Finger1'].head_local-source_rig.matrix_world@source_rig.data.bones['Bip01 '+side+' Finger4'].head_local).normalized()
 palm=long.cross(across).normalized()*sign;inverse=rig.data.bones[name].matrix_local.to_quaternion().inverted()
 local_fingers=inverse@(rotation@long);local_palm=inverse@(rotation@palm)
 for source in donors:
  if source.type!='MESH':continue
  groups={g.index for g in source.vertex_groups if (' '+side+' Hand') in g.name or (' '+side+' Finger') in g.name}
  chosen={v.index for v in source.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
  fitted={i:target_hand+(rotation@(source.matrix_world@source.data.vertices[i].co-source_hand))*.88 for i in chosen}
  polys=[p for p in source.data.polygons if all(i in chosen and fitted[i].z<.862 for i in p.vertices)]
  if not polys:continue
  used=sorted({i for p in polys for i in p.vertices});mapping={a:i for i,a in enumerate(used)}
  vertices=[fitted[i] for i in used]
  faces=[tuple(mapping[i] for i in p.vertices) for p in polys];uvs=[[tuple(source.data.uv_layers.active.data[li].uv) for li in p.loop_indices] for p in polys]
  # UV seams are per-loop attributes. Weld duplicate positions before
  # finding the true wrist opening; never extrude a texture seam.
  welded=[];keys={};remap={}
  for i,p in enumerate(vertices):
   key=tuple(round(float(c),5) for c in p)
   if key not in keys:keys[key]=len(welded);welded.append(p)
   remap[i]=keys[key]
  vertices=welded;faces=[tuple(remap[i] for i in f) for f in faces]
  # Extend the hidden wrist underneath the unchanged original sleeve.
  edges={}
  for f in faces:
   for a,b in zip(f,f[1:]+f[:1]):key=tuple(sorted((a,b)));edges[key]=edges.get(key,0)+1
  boundary=[e for e,n in edges.items() if n==1];adj={}
  for a,b in boundary:adj.setdefault(a,set()).add(b);adj.setdefault(b,set()).add(a)
  components=[];todo=set(adj)
  while todo:
   stack=[todo.pop()];component=[]
   while stack:
    a=stack.pop();component.append(a)
    for b in adj[a]:
     if b in todo:todo.remove(b);stack.append(b)
   components.append(component)
  wrist=max(components,key=lambda c:sum(vertices[i].z for i in c)/len(c));assert min(vertices[i].z for i in wrist)>.84
  wrist_set=set(wrist);centre=sum((vertices[i] for i in wrist),Vector())/len(wrist);rx=max(abs(vertices[i].x-centre.x) for i in wrist);ry=max(abs(vertices[i].y-centre.y) for i in wrist);prev={i:i for i in wrist}
  # The original wrist ring UV stays on the inner forearm portion of the map.
  uv_lookup={remap[mapping[source.data.loops[li].vertex_index]]:tuple(source.data.uv_layers.active.data[li].uv) for p in polys for li in p.loop_indices}
  for row in range(1,4):
   t=row/3;cur={}
   for i in wrist:
    p=vertices[i];a=math.atan2((p.y-centre.y)/max(.001,ry),(p.x-centre.x)/max(.001,rx));top=Vector((target_hand.x+.022*math.cos(a),-.008+.020*math.sin(a),.916))
    cur[i]=len(vertices);vertices.append(p.lerp(top,t));uv_lookup[cur[i]]=uv_lookup[i]
   for a,b in boundary:
    if a in wrist_set and b in wrist_set:
     f=(prev[a],prev[b],cur[b],cur[a]);faces.append(f);uvs.append([uv_lookup[i] for i in f])
   prev=cur
  mesh=bpy.data.meshes.new('Hand43 '+side);mesh.from_pydata(vertices,[],faces);mesh.update();hand=bpy.data.objects.new('Hand43 '+side,mesh);scene.collection.objects.link(hand)
  layer=mesh.uv_layers.new(name='UVMap')
  for p,uvset in zip(mesh.polygons,uvs):
   for li,uv in zip(p.loop_indices,uvset):layer.data[li].uv=uv
  donor_colour=median_albedo(source,set(used));factor=np.clip(np.array(old_hand[side]['colour'])/np.maximum(.02,donor_colour),.65,1.5)
  material_map={}
  for p in polys:
   if p.material_index in material_map:continue
   mat=source.data.materials[p.material_index].copy();mat.name='Hand43 anatomical skin '+side;bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=.62;bsdf.inputs['Metallic'].default_value=0;bsdf.inputs['Specular IOR Level'].default_value=.28
   # Match the existing hand albedo; retain real nails/knuckle texture detail.
   for node in mat.node_tree.nodes:
    if node.type=='TEX_IMAGE' and node.image and node.image.colorspace_settings.name=='sRGB':
     image=node.image.copy();image.name='Hand43 matched albedo '+side;a=np.array(image.pixels[:],np.float32).reshape(-1,4);a[:,:3]=np.clip(a[:,:3]*factor,0,1)
     red=(a[:,0]>a[:,1]*1.75)&(a[:,0]>a[:,2]*1.4);a[red,:3]=skin_target
     image.pixels.foreach_set(a.ravel());image.pack();node.image=image
   material_map[p.material_index]=len(mesh.materials);mesh.materials.append(mat)
  bridge=bpy.data.materials.new('Hand43 wrist skin '+side);bridge.use_nodes=True;bsdf=bridge.node_tree.nodes.get('Principled BSDF')
  rgb=np.where(skin_target<=.04045,skin_target/12.92,((skin_target+.055)/1.055)**2.4);bsdf.inputs['Base Color'].default_value=(*rgb,1);bsdf.inputs['Roughness'].default_value=.62
  bridge_index=len(mesh.materials);mesh.materials.append(bridge)
  for i,p in enumerate(mesh.polygons):p.material_index=material_map[polys[i].material_index] if i<len(polys) else bridge_index;p.use_smooth=True
  group=hand.vertex_groups.new(name=name);group.add(list(range(len(vertices))),1,'REPLACE');forearm=hand.vertex_groups.new(name='Bip01 '+side+' Forearm')
  for v in mesh.vertices:
   t=max(0,min(1,(v.co.z-.852)/.032))
   if t>0:group.add([v.index],1-t,'REPLACE');forearm.add([v.index],t,'REPLACE')
  arm=hand.modifiers.new('Own 0597 rig','ARMATURE');arm.object=rig
  bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
  # One smoothing pass on this small hand surface; other body mesh untouched.
  bpy.ops.object.select_all(action='DESELECT');hand.select_set(True);bpy.context.view_layer.objects.active=hand
  sub=hand.modifiers.new('Hand surface smoothing','SUBSURF');sub.levels=1;bpy.ops.object.modifier_apply(modifier=sub.name)
  new_hands.append(hand);records.append({'side':side,'sourceVertices':len(vertices),'vertices':len(hand.data.vertices),'colourFactor':factor.tolist(),'skinTarget':skin_target.tolist(),'localFingers':list(local_fingers),'localPalm':list(local_palm),'originalRemovedVertices':len(old_hand[side]['ids'])})

# Finish the terminal 6 cm of each sleeve and the cotton cuff as continuous
# rings. This removes the generated skin shards at the original wrist seam.
for side,sign in [('L',1),('R',-1)]:
 for kind in ['sleeve','cuff']:
  vertices=[];faces=[];uvs=[];n=64;rows=7 if kind=='sleeve' else 4
  for row in range(rows):
   t=row/(rows-1);z=.878+t*.086 if kind=='sleeve' else .855+t*.055
   centre=Vector((sign*(.279-(z-.885)*.10),-.008,z))
   for i in range(n):
    a=i/n*2*math.pi
    if kind=='sleeve':
     hit,no,index,d=body_bvh.ray_cast(Vector((centre.x,centre.y,.959)),Vector((math.cos(a),math.sin(a),0)),.15)
     upper=Vector((hit.x-centre.x,hit.y-centre.y,0)) if hit else Vector((.036*math.cos(a),.032*math.sin(a),0))
     radial=Vector((.0335*math.cos(a),.030*math.sin(a),0)).lerp(upper,t)*1.035
    else:radial=Vector((.0285*math.cos(a),.0255*math.sin(a),0))
    vertices.append(centre+radial)
    uvs.append(sleeve_uv(Vector((vertices[-1].x,vertices[-1].y,.959))))
    if row:q=row*n+i;qn=row*n+(i+1)%n;faces.append((q-n,qn-n,qn,q))
  mesh=bpy.data.meshes.new('Hand43 '+kind+' '+side);mesh.from_pydata(vertices,[],faces);mesh.update();ob=bpy.data.objects.new(mesh.name,mesh);scene.collection.objects.link(ob)
  if kind=='sleeve':
   mat=bpy.data.materials.new('Hand43 navy sleeve terminal');mat.use_nodes=True;bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(*cloth_linear,1);bsdf.inputs['Roughness'].default_value=.78;bsdf.inputs['Metallic'].default_value=.06;bsdf.inputs['Specular IOR Level'].default_value=.28;mesh.materials.append(mat)
  else:
   mat=bpy.data.materials.new('Hand43 ivory cotton cuff');mat.use_nodes=True;bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(.78,.77,.73,1);bsdf.inputs['Roughness'].default_value=.86;mesh.materials.append(mat)
  for p in mesh.polygons:
   p.use_smooth=True
  vg=ob.vertex_groups.new(name='Bip01 '+side+' Forearm');vg.add(list(range(len(vertices))),1,'REPLACE')
  arm=ob.modifiers.new('Own0597 rig','ARMATURE');arm.object=rig
  bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free();new_hands.append(ob)

for o in donors:bpy.data.objects.remove(o,do_unlink=True)
for a in list(bpy.data.actions):
 if a not in original_actions:bpy.data.actions.remove(a)
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
scene.tool_settings.mesh_select_mode=(True,False,False)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='DESELECT');bpy.ops.object.mode_set(mode='OBJECT')
removed_set=set(removed)
for v in body.data.vertices:v.select=v.index in removed_set
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.delete(type='VERT');bpy.ops.object.mode_set(mode='OBJECT')
# Keep the original sleeve/cuff on the forearm when the wrist pronates.
cuff_weights=0
for side,sign in [('L',1),('R',-1)]:
 h=body.vertex_groups['Bip01 '+side+' Hand'].index;f=body.vertex_groups['Bip01 '+side+' Forearm'];anchor=rig.data.bones['Bip01 '+side+' Hand'].head_local
 for v in body.data.vertices:
  if .866<v.co.z<.923 and v.co.x*sign>.232 and (v.co-anchor).length<.085 and sum(g.weight for g in v.groups if g.group==h)>.45:
   for vg in list(v.groups):body.vertex_groups[vg.group].remove([v.index])
   f.add([v.index],1,'REPLACE');cuff_weights+=1
bpy.ops.object.select_all(action='DESELECT');body.select_set(True)
for o in new_hands:o.select_set(True)
bpy.context.view_layer.objects.active=body;bpy.ops.object.join();body.name='Own0597_FacialWithLocalHands43'
assert [k.name for k in body.data.shape_keys.key_blocks]==original_names
retained=0;max_error=0
for v,sid in zip(body.data.vertices,body.data.attributes['Hand43SourceVertex'].data):
 if sid.value<1:continue
 retained+=1
 for k,key in enumerate(body.data.shape_keys.key_blocks):max_error=max(max_error,(key.data[v.index].co-Vector(original[k,sid.value-1])).length)
assert max_error<1e-7,max_error
assert retained==original.shape[1]-len(removed_set),(retained,original.shape[1],len(removed_set))
body.data.attributes.remove(body.data.attributes['Hand43SourceVertex'])
rig.data.pose_position='POSE';rig.animation_data.action=next(a for a in original_actions if a.name=='Idle');scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=body
path=OUT/'personal-guide-hands43.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_extras=True,export_morph=True,export_morph_normal=True,export_copyright='Own 0597 face, body and clothing retained. Local hand surfaces: Microsoft/Rocketbox adult 10, MIT, colour matched and fitted. No donor head geometry.')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'personal-guide-hands43.blend'))
manifest=json.loads((OUT/'manifest-facial.json').read_text(encoding='utf-8'))
manifest['version']=7;manifest['status']='Own 0597 face preserved; local hand and cuff repair used by the seaside demo. Runtime seating and phase-linked ambience.'
manifest.update({'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'vertices':len(body.data.vertices),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'hands':{'source':'Microsoft/Rocketbox Male Adult 10 hand surfaces only, local MIT asset','sourceFile':'../rocket-guide/rocket-guide.glb','license':'../rocket-guide/LICENSE.txt','sourceFace':'personal-guide-facial.glb','sourceFaceSha256':'69927e9fb807a1e63d9d901166c2167d740d2efd8997cdf08295b2c095969f94','originalSourceVertices':original.shape[1],'removedOriginalVertices':len(removed_set),'retainedOriginalVertices':retained,'maxRetainedShapePositionError':max_error,'cuffWeightVertices':cuff_weights,'records':records,'independentFingerAnimation':False}})
manifest['facial']['identity']='Own 0597 head, hairstyle, glasses, body and clothes retained. No donor face geometry. Only hand surfaces locally replaced with MIT adult hand geometry.'
manifest['limitations']=['Hands are relaxed anatomical surfaces driven by the wrist, without individual finger performance.','Seated palm contact and surf sound envelopes are website runtime.']
(OUT/'manifest-hands43.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');print('HANDS43_READY',json.dumps(manifest['hands']),flush=True)
