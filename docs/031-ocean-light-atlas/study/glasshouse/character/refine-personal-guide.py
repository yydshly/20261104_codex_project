"""Local portrait repairs to the user's selected person; preserve original inputs.

Eye apertures, fitted spectacles and cuffs are new geometry. Adult hands are
extracted from the project's existing MIT Rocketbox asset. No donor face/body.
"""
import bpy,bmesh,json,math,hashlib
import numpy as np
from pathlib import Path
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'character/personal-0597';OUT=ROOT/'assets/personal-guide'
bpy.ops.wm.open_mainfile(filepath=str(WORK/'personal-guide.blend'))
scene=bpy.context.scene;scene.render.fps=30
body=next(o for o in scene.objects if o.type=='MESH');rig=next(o for o in scene.objects if o.type=='ARMATURE')
rig.data.pose_position='REST';original_material=body.data.materials[0]
bvh=BVHTree.FromPolygons([v.co.copy() for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons])
uv=body.data.uv_layers.active
source_positions=[v.co.copy() for v in body.data.vertices]
source_faces=[list(p.vertices) for p in body.data.polygons]
source_uv=[[uv.data[li].uv.copy() for li in p.loop_indices] for p in body.data.polygons]
def nearby_uv(point):
 hit,n,index,d=bvh.find_nearest(point)
 corner=min(range(len(source_faces[index])),key=lambda i:(source_positions[source_faces[index][i]]-hit).length_squared)
 return source_uv[index][corner]
image=next(n.image for n in original_material.node_tree.nodes if n.type=='TEX_IMAGE' and n.image.colorspace_settings.name=='sRGB')
pixels=np.array(image.pixels[:],dtype=np.float32).reshape(image.size[1],image.size[0],4)
def sample_face(x,z):
 hit,n,idx,d=bvh.ray_cast(Vector((x,-1,z)),Vector((0,1,0)))
 if hit is None:return np.array((.56,.36,.27,1.))
 face=body.data.polygons[idx];loops=list(face.loop_indices);verts=[body.data.vertices[i].co for i in face.vertices]
 # Nearest UV corner is sufficient for the gently varying cheek colour.
 at=min(range(len(verts)),key=lambda i:(verts[i]-hit).length_squared);p=uv.data[loops[at]].uv
 return pixels[min(image.size[1]-1,int(p.y*(image.size[1]-1))),min(image.size[0]-1,int(p.x*(image.size[0]-1)))].copy()
def surface_depth(x,z):
 hit,n,idx,d=bvh.ray_cast(Vector((x,-1,z)),Vector((0,1,0)))
 return hit.y if hit else -.11
def linear(c):return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
skin_colours=[sample_face(-.027,1.557),sample_face(.047,1.557)]
skin_average=np.mean(skin_colours,axis=0);skin_average[3]=1
def material(name,colour,roughness=.55,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*linear(np.array(colour[:3])),1);p.inputs['Roughness'].default_value=roughness;p.inputs['Metallic'].default_value=metal
 return m
skin=original_material.copy();skin.name='0597 local eyelid retouch'
skin.node_tree.nodes.get('Principled BSDF').inputs['Specular Tint'].default_value=(1,1,1,1)
skin.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.28
skin.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.03
colour_node=skin.node_tree.nodes.new('ShaderNodeVertexColor');colour_node.layer_name='PortraitColour'
skin.node_tree.links.new(colour_node.outputs['Color'],skin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
sclera=material('Warm ivory sclera',(.77,.75,.70),.26)
iris=material('Brown iris radial colour',(.16,.095,.052),.29)
iris.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.35
iris_colour=iris.node_tree.nodes.new('ShaderNodeVertexColor');iris_colour.layer_name='PortraitColour'
iris.node_tree.links.new(iris_colour.outputs['Color'],iris.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
pupil=material('Natural dark pupils',(.018,.013,.011),.18)
gold=material('Brushed bronze spectacle wire',(.56,.43,.27),.33,.65)
cuff_mat=material('Ivory cotton cuff',(.90,.90,.85),.86)
sleeve_mat=material('Navy sleeve finishing',np.mean([sample_face(-.277,.956),sample_face(.277,.956)],axis=0),.87)
hand_skin=material('Hands skin',skin_average,.57)
hand_skin.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.035
hand_colour=hand_skin.node_tree.nodes.new('ShaderNodeVertexColor');hand_colour.layer_name='PortraitColour'
hand_skin.node_tree.links.new(hand_colour.outputs['Color'],hand_skin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
for n in original_material.node_tree.nodes:
 if n.type=='BSDF_PRINCIPLED':
  n.inputs['Specular Tint'].default_value=(1,1,1,1);n.inputs['Specular IOR Level'].default_value=.28
  n.inputs['Metallic'].default_value=.03
 if n.type=='NORMAL_MAP':n.inputs['Strength'].default_value=.45

extras=[]
def assign(o,bone):
 group=o.vertex_groups.new(name=bone);group.add(list(range(len(o.data.vertices))),1,'REPLACE');extras.append(o)
def mesh_object(name,vertices,faces,materials,colours=None,indices=None):
 data=bpy.data.meshes.new(name);data.from_pydata(vertices,[],faces);data.update();o=bpy.data.objects.new(name,data);scene.collection.objects.link(o)
 for mat in materials:data.materials.append(mat)
 if indices:
  for p,i in zip(data.polygons,indices):p.material_index=i
 for p in data.polygons:p.use_smooth=True
 if colours:
  attr=data.color_attributes.new(name='PortraitColour',type='FLOAT_COLOR',domain='CORNER')
  for loop in data.loops:
   c=colours[loop.vertex_index];attr.data[loop.index].color=(*linear(np.array(c[:3])),1)
 return o
def tube(name,points,radius,bone,mat=gold,cyclic=False):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=radius;data.bevel_resolution=3;data.resolution_u=16
 spline=data.splines.new('POLY');spline.points.add(len(points)-1)
 for p,co in zip(spline.points,points):p.co=(*co,1)
 spline.use_cyclic_u=cyclic;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);data.materials.append(mat)
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');assign(o,bone)

centres=[-.026,.047]
def repair_mask(x,z):
 return max(max(0,1-(((x-cx)/.022)**2+((z-1.614)/.010)**2)) for cx in centres)
def face_depth(x):return -.020-.105*math.sqrt(max(.02,1-((x-.011)/.096)**2))
# Preserve the existing orbital curve. Repair only the small painted eye zone.
skin_index=len(body.data.materials);body.data.materials.append(skin)
attr=body.data.color_attributes.new(name='PortraitColour',type='FLOAT_COLOR',domain='CORNER')
for polygon in body.data.polygons:
 affected=False;loop_colours=[]
 for li in polygon.loop_indices:
  vertex=body.data.vertices[body.data.loops[li].vertex_index];x,y,z=vertex.co
  uvp=uv.data[li].uv;old=pixels[min(image.size[1]-1,int(uvp.y*(image.size[1]-1))),min(image.size[0]-1,int(uvp.x*(image.size[0]-1)))].copy()
  mask=repair_mask(x,z) if y<-.06 else 0
  weight=min(1,max(0,mask*2));target=(sample_face(x,1.597)+sample_face(x,1.633))*.5 if mask>0 else old
  col=old*(1-weight)+target*weight
  loop_colours.append((li,(*linear(col[:3]),1)))
  affected|=mask>0
 if affected:
  polygon.material_index=skin_index
  for li,c in loop_colours:attr.data[li].color=c
 else:
  for li,c in loop_colours:attr.data[li].color=(1,1,1,1)

# Open almond-shaped apertures, with real sclera / iris / pupil surfaces and
# a fitted lid margin. Existing face geometry remains behind the eye surfaces.
for eye_index,cx in enumerate(centres):
 cz=1.614;cy=surface_depth(cx,cz)
 vertices=[(cx,cy-.0022,cz)];colours=[(.018,.013,.011)];faces=[];mat_ids=[]
 count=96;radii=[.0015,.0021,.0023,.0031,.0037,.0043,.0052,.0058,1]
 for ring,r in enumerate(radii):
  for i in range(count):
   a=2*math.pi*i/count;ca,sa=math.cos(a),math.sin(a);height=.0042 if sa>0 else .0035
   boundary=1/math.sqrt((ca/.0165)**2+(sa/height)**2)
   radius=boundary if r==1 else min(r,boundary*.995)
   x=cx+radius*ca;z=cz+radius*sa
   depth=surface_depth(x,z)-.0015-.0007*(1-radius/boundary)
   vertices.append((x,depth,z));grain=.75+.25*math.sin(a*29+eye_index)*math.sin(a*13+.7)
   colours.append((.30*grain,.17*grain,.080*grain))
   current=1+ring*count+i;nxt=1+ring*count+(i+1)%count
   index=2 if r<=.0021 else 1 if r<=.0058 else 0
   if ring==0:faces.append((0,nxt,current));mat_ids.append(index)
   else:
    prev=1+(ring-1)*count+i;pn=1+(ring-1)*count+(i+1)%count
    faces.append((prev,pn,nxt,current));mat_ids.append(index)
 eye=mesh_object(f'Open eye {eye_index}',vertices,faces,[sclera,iris,pupil],colours,mat_ids);assign(eye,'Bip01 Head')
 for face in eye.data.polygons:
  if face.material_index!=1:
   for li in face.loop_indices:eye.data.color_attributes['PortraitColour'].data[li].color=(1,1,1,1)
 # Skin lid strip blends from the eye opening into the corrected local face.
 verts=[];cols=[];quads=[]
 for row in range(5):
  t=row/4
  for i in range(count):
   a=2*math.pi*i/count;ca,sa=math.cos(a),math.sin(a);h=.0042 if sa>0 else .0035
   x=cx+(.0165+t*.002)*ca;z=cz+(h+t*.002)*sa
   y=surface_depth(x,z)-.0015*(1-t)-.0003*math.sin(math.pi*t)
   verts.append((x,y,z));shade=1-.06*(1-t);cols.append(tuple(float(c)*shade for c in ((sample_face(x,1.597)+sample_face(x,1.633))*.5)[:3]))
   if row:
    q=row*count+i;qn=row*count+(i+1)%count;quads.append((q-count,qn-count,qn,q))
 lid=mesh_object(f'Fitted lids {eye_index}',verts,quads,[skin],cols);assign(lid,'Bip01 Head')
# A ray through an old rim meets front/back wire surfaces, then intact skin.
# Delete only that forward shell, preserving the actual face behind it.
old_rim_faces=set()
for p in body.data.polygons:
 x,y,z=p.center
 if not (1.568<z<1.639 and -.1<x<.112 and y<.025):continue
 radius=min(abs(math.sqrt(((x-cx)/.0305)**2+((z-1.603)/.026)**2)-1) for cx in centres)
 if radius>.27 and not ((x<-.060 or x>.080) and 1.612<z<1.630):continue
 hits=[];origin=Vector((x,-1,z))
 for _ in range(5):
  hit,no,index,d=bvh.ray_cast(origin,Vector((0,1,0)))
  if not hit:break
  hits.append(hit.y);origin=hit+Vector((0,.00002,0))
 if len(hits)>=4 and hits[2]-hits[1]>.0035 and hits[1]-hits[0]<.015 and y<(hits[1]+hits[2])*.5:old_rim_faces.add(p.index)
for eye_index,cx in enumerate(centres):
 points=[]
 for i in range(128):
  a=2*math.pi*i/128;x=cx+.0305*math.cos(a);z=1.603+.026*math.sin(a)
  points.append((x,-.140+.009*((x-.011)/.08)**2,z))
 tube(f'Spectacle rim {eye_index}',points,.00082,'Bip01 Head',cyclic=True)
tube('Spectacle bridge',[(.003,-.141,1.612),(.007,-.145,1.616),(.012,-.145,1.617),(.017,-.144,1.615),(.019,-.141,1.612)],.00075,'Bip01 Head')
tube('Left temple',[(-.057,-.133,1.617),(-.075,-.079,1.622),(-.084,-.012,1.620),(-.083,.014,1.602)],.00095,'Bip01 Head')
tube('Right temple',[(.078,-.133,1.617),(.097,-.077,1.622),(.102,-.008,1.620),(.100,.013,1.602)],.00095,'Bip01 Head')

# Adult hand geometry from the already licensed local donor. Cut by actual
# skin weights, not world height alone; no donor face, clothes or body exported.
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/rocket-guide/rocket-guide.glb'))
donor_objects=[o for o in bpy.data.objects if o not in before];donor_rig=next(o for o in donor_objects if o.type=='ARMATURE');donor_rig.data.pose_position='REST'
hand_records=[]
for side,sign in [('L',1),('R',-1)]:
 bone_name='Bip01 '+side+' Hand'
 source_hand=donor_rig.matrix_world@donor_rig.data.bones[bone_name].head_local
 source_elbow=donor_rig.matrix_world@donor_rig.data.bones['Bip01 '+side+' Forearm'].head_local
 target_hand=rig.data.bones[bone_name].head_local;target_elbow=rig.data.bones['Bip01 '+side+' Forearm'].head_local
 rotation=(source_hand-source_elbow).normalized().rotation_difference((target_hand-target_elbow).normalized())
 for ob in donor_objects:
  if ob.type!='MESH':continue
  groups={g.index for g in ob.vertex_groups if (' '+side+' Hand') in g.name or (' '+side+' Finger') in g.name}
  chosen={v.index for v in ob.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
  chosen_faces=[p for p in ob.data.polygons if all(i in chosen for i in p.vertices)]
  if not chosen_faces:continue
  used=sorted({i for p in chosen_faces for i in p.vertices});mapping={old:new for new,old in enumerate(used)}
  vertices=[target_hand+(rotation@(ob.matrix_world@ob.data.vertices[i].co-source_hand))*.88 for i in used]
  faces=[tuple(mapping[i] for i in p.vertices) for p in chosen_faces]
  # glTF duplicates UV seam vertices. Weld those before finding a wrist loop;
  # an unwelded UV seam must never be extruded as if it were the wrist.
  welded=[];keys={};remap={}
  for i,p in enumerate(vertices):
   key=tuple(round(float(c),5) for c in p)
   if key not in keys:keys[key]=len(welded);welded.append(p)
   remap[i]=keys[key]
  vertices=welded;faces=[tuple(remap[i] for i in f) for f in faces]
  faces=[f for f in faces if len(set(f))>=3]
  edges={}
  for face in faces:
   for a,b in zip(face,face[1:]+face[:1]):edges[tuple(sorted((a,b)))]=edges.get(tuple(sorted((a,b))),0)+1
  boundary=[e for e,n in edges.items() if n==1];adj={}
  for a,b in boundary:adj.setdefault(a,set()).add(b);adj.setdefault(b,set()).add(a)
  components=[];unvisited=set(adj)
  while unvisited:
   stack=[unvisited.pop()];part=[]
   while stack:
    a=stack.pop();part.append(a)
    for b in adj[a]:
     if b in unvisited:unvisited.remove(b);stack.append(b)
   components.append(part)
  wrist=max(components,key=lambda c:sum(vertices[i].z for i in c)/len(c));wrist_set=set(wrist)
  assert min(vertices[i].z for i in wrist)>.84,('not a wrist loop',side,[(len(c),min(vertices[i].z for i in c),max(vertices[i].z for i in c)) for c in components])
  wrist_centre=sum((vertices[i] for i in wrist),Vector())/len(wrist)
  wx=max(abs(vertices[i].x-wrist_centre.x) for i in wrist);wy=max(abs(vertices[i].y-wrist_centre.y) for i in wrist)
  previous={i:i for i in wrist}
  for row in range(1,5):
   t=row/4;current={}
   for i in wrist:
    p=vertices[i];angle=math.atan2((p.y-wrist_centre.y)/max(.001,wy),(p.x-wrist_centre.x)/max(.001,wx))
    top=Vector((target_hand.x+.0245*math.cos(angle),target_hand.y+.0225*math.sin(angle),.916))
    current[i]=len(vertices);vertices.append(p.lerp(top,t))
   for a,b in boundary:
    if a in wrist_set and b in wrist_set:faces.append((previous[a],previous[b],current[b],current[a]))
   previous=current
  # Fit the covered wrist beneath the cotton cuff, including the donor's
  # asymmetric palm cross-section, rather than letting skin poke through it.
  for p in vertices:
   if p.z>.866:
    t=max(0,min(1,(p.z-.866)/.012));dx=p.x-target_hand.x;dy=p.y+.008
    radius=math.sqrt((dx/.024)**2+(dy/.021)**2)
    if radius>1:
     factor=1-t+t/radius;p.x=target_hand.x+dx*factor;p.y=-.008+dy*factor
  colours=[tuple(float(c)*(.96+.04*math.sin(v.z*120+v.x*38)) for c in skin_average[:3]) for v in vertices]
  hand=mesh_object(f'Anatomical {side} hand',vertices,faces,[hand_skin],colours);assign(hand,bone_name)
  forearm_group=hand.vertex_groups.new(name='Bip01 '+side+' Forearm');hand_group=hand.vertex_groups[bone_name]
  for vertex in hand.data.vertices:
   t=max(0,min(1,(vertex.co.z-.858)/.020))
   if t>0:
    hand_group.add([vertex.index],1-t,'REPLACE');forearm_group.add([vertex.index],t,'REPLACE')
  hm=bmesh.new();hm.from_mesh(hand.data);bmesh.ops.recalc_face_normals(hm,faces=list(hm.faces));hm.to_mesh(hand.data);hm.free()
  hand_records.append({'side':side,'vertices':len(vertices),'triangles':sum(len(f)-2 for f in faces)})
for ob in donor_objects:bpy.data.objects.remove(ob,do_unlink=True)
# Remove the original mitten-like hands, leaving the original forearms intact.
bm=bmesh.new();bm.from_mesh(body.data)
bm.faces.ensure_lookup_table();bmesh.ops.delete(bm,geom=[bm.faces[i] for i in old_rim_faces],context='FACES')
head_boundary=[e for e in bm.edges if e.is_boundary and all(v.co.z>1.52 for v in e.verts)]
if head_boundary:
 filled=bmesh.ops.holes_fill(bm,edges=head_boundary,sides=32)
 colour_layer=bm.loops.layers.float_color.get('PortraitColour')
 for face in filled['faces']:
  face.material_index=skin_index;face.smooth=True
  for loop in face.loops:
   col=sample_face(loop.vert.co.x,loop.vert.co.z-.006)
   loop[colour_layer]=(*linear(col[:3]),1)
arm_groups={g.index for g in body.vertex_groups if any(p in g.name for p in [' Hand',' Forearm'])}
deform_layer=bm.verts.layers.deform.active
remove=[v for v in bm.verts if .64<v.co.z<.939 and (abs(v.co.x)>.23 or (abs(v.co.x)>.18 and sum(w for g,w in v[deform_layer].items() if g in arm_groups)>.45))]
bmesh.ops.delete(bm,geom=remove,context='VERTS');bm.to_mesh(body.data);bm.free();body.data.update()
for side,sign in [('L',1),('R',-1)]:
 # Continuous terminal sleeve with UVs sampled from the original sleeve.
 sleeve_vertices=[];sleeve_faces=[];sleeve_uv=[];n=64
 for row in range(7):
  t=row/6;z=.878+t*.086;centre=Vector((sign*(.279-(z-.885)*.10),-.008,z))
  for i in range(n):
   a=i/n*2*math.pi;direction=Vector((math.cos(a),math.sin(a),0))
   hit,no,idx,d=bvh.ray_cast(Vector((centre.x,centre.y,.959)),direction,.15)
   radial=(Vector((hit.x,hit.y,z))-centre) if hit else Vector((.036*math.cos(a),.032*math.sin(a),0))
   lower=Vector((.0335*math.cos(a),.030*math.sin(a),0));point=centre+lower.lerp(radial,t)
   sleeve_vertices.append(point);sleeve_uv.append((a/(2*math.pi),t))
   if row:q=row*n+i;qn=row*n+(i+1)%n;sleeve_faces.append((q-n,qn-n,qn,q))
 sleeve=mesh_object(f'Clean {side} sleeve terminal',sleeve_vertices,sleeve_faces,[sleeve_mat]);assign(sleeve,'Bip01 '+side+' Forearm')
 layer=sleeve.data.uv_layers.new(name='UVMap')
 for loop in sleeve.data.loops:
  point=sleeve_vertices[loop.vertex_index];layer.data[loop.index].uv=nearby_uv(Vector((point.x,point.y,.959)))
 # A small, continuous cotton cuff conceals the wrist seam inside the sleeve.
 vertices=[];faces=[];n=64
 for row in range(4):
  z=.856+row*.018;cx=sign*(.279-(z-.885)*.10)
  for i in range(n):
   a=i/n*2*math.pi;vertices.append((cx+.0285*math.cos(a),-.008+.0255*math.sin(a),z))
   if row:q=row*n+i;qn=row*n+(i+1)%n;faces.append((q-n,qn-n,qn,q))
 cuff=mesh_object(f'Clean {side} cotton cuff',vertices,faces,[cuff_mat]);assign(cuff,'Bip01 '+side+' Forearm')

# Join the repairs into the same skinned mesh and original eighty-joint rig.
bpy.ops.object.select_all(action='DESELECT');body.select_set(True)
for ob in extras:ob.select_set(True)
bpy.context.view_layer.objects.active=body;bpy.ops.object.join();body.name='Personal0597_PortraitRefined'
for p in body.data.polygons:p.use_smooth=True
if body.data.has_custom_normals:body.data.normals_split_custom_set([(0,0,0)]*len(body.data.loops))
for v in body.data.vertices:
 influences=sorted((g for g in v.groups if g.weight>1e-6),key=lambda g:g.weight,reverse=True)[:4]
 total=sum(g.weight for g in influences);assert total>0
 values={g.group:g.weight/total for g in influences}
 for g in list(v.groups):body.vertex_groups[g.group].remove([v.index])
 for i,w in values.items():body.vertex_groups[i].add([v.index],w,'REPLACE')
rig.data.pose_position='POSE'
original_actions=[a for a in bpy.data.actions if a.name in ['Idle','Walk','Wave','Point','LookAround']]
for a in list(bpy.data.actions):
 if a not in original_actions:bpy.data.actions.remove(a)
rig.animation_data.action=next(a for a in original_actions if a.name=='Idle');scene.frame_set(1)
rig.select_set(True);body.select_set(True)
scene.render.fps=30
path=OUT/'personal-guide-detail.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_extras=True,
 export_copyright='Appearance: user-provided 0597. Adult hand geometry / motion reference: Copyright (c) 2020 Microsoft, MIT. Local eye, eyewear, cuff and portrait repairs.')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'personal-guide-detail.blend'))
manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
manifest.update({'version':2,'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'vertices':len(body.data.vertices),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'status':'portrait repair candidate; browser review required','detailRepairs':{'eyes':'local sclera, iris, pupil and fitted lid geometry','eyewear':'separate bronze wire geometry','hands':hand_records,'handGeometrySource':'Microsoft/Rocketbox Male Adult 10, MIT','cuffs':'fitted cotton wrist geometry'},'limitations':['No facial expression or individual finger animation.','Original face silhouette retained; local reconstructed eye detail.','Runtime stairs/contact require the website controller.']})
(OUT/'manifest-detail.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('PORTRAIT_REFINED',json.dumps({'bytes':path.stat().st_size,'vertices':len(body.data.vertices),'hands':hand_records}),flush=True)
