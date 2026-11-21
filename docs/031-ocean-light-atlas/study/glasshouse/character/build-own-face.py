"""Facial shapes on the user's own 0597 head. No donor head or facial mesh.

Retains the 3.4 identity/hairstyle/glasses and body. A stitched lip region,
oral interior and sparse morph targets make the face actually deformable.
Microsoft is a reference for separate facial controls, not an appearance source.
"""
import bpy,bmesh,json,math,hashlib
import numpy as np
from pathlib import Path
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
from mathutils.geometry import delaunay_2d_cdt,barycentric_transform
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'character/personal-0597';OUT=ROOT/'assets/personal-guide'
bpy.ops.wm.open_mainfile(filepath=str(WORK/'personal-guide-orbit.blend'))
scene=bpy.context.scene;scene.render.fps=30
body=next(o for o in scene.objects if o.type=='MESH');rig=next(o for o in scene.objects if o.type=='ARMATURE');rig.data.pose_position='REST'
mesh=body.data;positions=[v.co.copy() for v in mesh.vertices];faces=[tuple(p.vertices) for p in mesh.polygons];uv=mesh.uv_layers.active
uvs=[[uv.data[i].uv.copy() for i in p.loop_indices] for p in mesh.polygons];bvh=BVHTree.FromPolygons(positions,faces)
image=next(n.image for n in mesh.materials[0].node_tree.nodes if n.type=='TEX_IMAGE' and n.image.colorspace_settings.name=='sRGB');pixels=np.array(image.pixels[:],dtype=np.float32).reshape(image.size[1],image.size[0],4)
def linear(c):return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
def sample(x,z):
 hit,n,i,d=bvh.ray_cast(Vector((x,0,z)),Vector((0,-1,0)))
 assert hit is not None,(x,z)
 f=faces[i];u=uvs[i];t=barycentric_transform(hit,positions[f[0]],positions[f[1]],positions[f[2]],Vector((*u[0],0)),Vector((*u[1],0)),Vector((*u[2],0)))
 a=max(0,min(image.size[0]-1,t.x*(image.size[0]-1)));b=max(0,min(image.size[1]-1,t.y*(image.size[1]-1)));ix,iy=int(a),int(b);tx,ty=a-ix,b-iy
 colour=((pixels[iy,ix]*(1-tx)+pixels[iy,min(ix+1,image.size[0]-1)]*tx)*(1-ty)+(pixels[min(iy+1,image.size[1]-1),ix]*(1-tx)+pixels[min(iy+1,image.size[1]-1),min(ix+1,image.size[0]-1)]*tx)*ty)[:3]
 return hit.y,colour
def material(name,rgb,rough=.55):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*linear(np.array(rgb)),1);p.inputs['Roughness'].default_value=rough;p.inputs['Specular IOR Level'].default_value=.3;return m
lipmat=material('Own lip surface',(1,1,1),.57);node=lipmat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='OrbitColour';lipmat.node_tree.links.new(node.outputs['Color'],lipmat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
lip_index=len(mesh.materials);mesh.materials.append(lipmat)
cx=.011;cz=1.5412;rx=.0305
def seam(x):return cz+.0032*min(1,abs((x-cx)/rx))**2
bm=bmesh.new();bm.from_mesh(mesh);bm.faces.ensure_lookup_table()
cut=[f for f in bm.faces if f.calc_center_median().y<-.065 and ((f.calc_center_median().x-cx)/.043)**2+((f.calc_center_median().z-cz)/.021)**2<1]
bmesh.ops.delete(bm,geom=cut,context='FACES')
for _ in range(8):
 edges=[e for e in bm.edges if e.is_boundary and all(1.511<v.co.z<1.569 and abs(v.co.x-cx)<.052 and v.co.y<-.06 for v in e.verts)]
 adj={}
 for e in edges:
  a,b=e.verts;adj.setdefault(a,[]).append(b);adj.setdefault(b,[]).append(a)
 assert adj,'No mouth boundary'
 pins=[v for v,neighbours in adj.items() if len(neighbours)!=2]
 if not pins:break
 bmesh.ops.delete(bm,geom=list({f for v in pins for f in v.link_faces}),context='FACES')
assert all(len(v)==2 for v in adj.values()),'Mouth cut must be a simple loop'
loop=[next(iter(adj))];previous=None
while True:
 nxt=next(v for v in adj[loop[-1]] if v!=previous)
 if nxt==loop[0]:break
 previous=loop[-1];loop.append(nxt);assert len(loop)<=len(adj)
assert len(loop)==len(adj),'Unexpected disconnected mouth cuts'
outline=[Vector((v.co.x,v.co.z)) for v in loop]
def inside(p,polygon):
 x,y=p;result=False;j=len(polygon)-1
 for i,q in enumerate(polygon):
  a=polygon[j]
  if (q.y>y)!=(a.y>y) and x<(a.x-q.x)*(y-q.y)/(a.y-q.y)+q.x:result=not result
  j=i
 return result
points=list(outline);constraints=[(i,(i+1)%len(loop)) for i in range(len(loop))];hole=[]
for i in range(96):
 a=2*math.pi*i/96;x=cx+rx*math.cos(a);hole.append(len(points));points.append(Vector((x,seam(x)+.00018*math.sin(a))))
constraints.extend((hole[i],hole[(i+1)%96]) for i in range(96));hole_poly=[points[i] for i in hole]
for z in np.arange(min(p.y for p in outline)+.0008,max(p.y for p in outline),.0011):
 for x in np.arange(min(p.x for p in outline)+.0008,max(p.x for p in outline),.0011):
  p=Vector((float(x),float(z)))
  if inside(p,outline) and not inside(p,hole_poly):points.append(p)
vs,es,fs,orig_v,orig_e,orig_f=delaunay_2d_cdt(points,constraints,[],0,.00000005)
deform=bm.verts.layers.deform.verify();head_group=body.vertex_groups['Bip01 Head'].index;col=bm.loops.layers.float_color.get('OrbitColour');new=[];shared=0
assert col is not None
for p,ids in zip(vs,orig_v):
 old=next((i for i in ids if i<len(loop)),None)
 if old is not None:v=loop[old];shared+=1
 else:v=bm.verts.new((p.x,sample(p.x,p.y)[0],p.y));v[deform][head_group]=1
 new.append(v)
for f in fs:
 centre=sum((vs[i] for i in f),Vector((0,0)))/len(f)
 if not inside(centre,outline) or inside(centre,hole_poly):continue
 face=bm.faces.new([new[i] for i in reversed(f)]);face.material_index=lip_index;face.smooth=True
 for l in face.loops:l[col]=(*linear(sample(l.vert.co.x,l.vert.co.z)[1]),1)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free();mesh.update()
assert shared==len(loop),(shared,len(loop))
extras=[]
def finish(ob,mat):
 ob.data.materials.append(mat);bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 g=ob.vertex_groups.new(name='Bip01 Head');g.add(list(range(len(ob.data.vertices))),1,'REPLACE')
 if not ob.data.color_attributes.get('OrbitColour'):
  attr=ob.data.color_attributes.new(name='OrbitColour',type='FLOAT_COLOR',domain='CORNER')
  for d in attr.data:d.color=(1,1,1,1)
 for p in ob.data.polygons:p.use_smooth=True
 extras.append(ob)
inner=material('Own oral cavity',(.12,.025,.026),.84);teeth=material('Own upper teeth',(.79,.75,.65),.39);lower=material('Own lower teeth',(.79,.75,.65),.39);tongue_mat=material('Own tongue',(.48,.19,.19),.55)
bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=20,radius=1,location=(cx,-.091,cz-.004));oral=bpy.context.object;oral.name='Local oral interior';oral.scale=(.032,.020,.018);finish(oral,inner)
for row,mat,z in [('Upper',teeth,cz-.0018),('Lower',lower,cz-.0058)]:
 for i in range(8):
  x=(i-3.5)*.0045;y=-.115+.006*(abs(x)/.018)**2
  bpy.ops.mesh.primitive_cube_add(size=1,location=(cx+x,y,z+.001*(abs(x)/.018)**2));ob=bpy.context.object;ob.name=f'{row} tooth {i}';ob.scale=(.0041,.0035,.0036)
  bevel=ob.modifiers.new('Rounded tooth edges','BEVEL');bevel.width=.0006;bevel.segments=2;bpy.context.view_layer.objects.active=ob;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);bpy.ops.object.modifier_apply(modifier=bevel.name);finish(ob,mat)
bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=12,radius=1,location=(cx,-.102,cz-.008));tongue=bpy.context.object;tongue.name='Local tongue';tongue.scale=(.015,.009,.003);finish(tongue,tongue_mat)
bpy.ops.object.select_all(action='DESELECT');body.select_set(True)
for o in extras:o.select_set(True)
bpy.context.view_layer.objects.active=body;bpy.ops.object.join();body.name='Own0597_FacialRig'
if mesh.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
mesh=body.data
for p in mesh.polygons:p.use_smooth=True
for e in mesh.edges:e.use_edge_sharp=False
body.shape_key_add(name='Basis');base=[v.co.copy() for v in mesh.vertices];members={}
for p in mesh.polygons:
 name=mesh.materials[p.material_index].name
 for i in p.vertices:members.setdefault(i,set()).add(name)
eye_materials={'Warm sclera','Brown iris','Pupils'};skin_materials={'Connected orbital skin','Original head albedo'}
centres={}
for side,x in [('Left',.047),('Right',-.026)]:
 white=[base[i] for i,names in members.items() if 'Warm sclera' in names and abs(base[i].x-x)<.02]
 centres[side]=Vector(tuple((min(p[k] for p in white)+max(p[k] for p in white))/2 for k in range(3)))
 key=body.shape_key_add(name='eyeBlink'+side)
 for i,p in enumerate(base):
  if not (members.get(i,set())&skin_materials) or abs(p.x-x)>.019 or abs(p.z-1.614)>.018:continue
  dx=p.x-x;span=math.sqrt(max(0,1-(dx/.0148)**2));top=1.614+.0045*span;bottom=1.614-.0036*span;is_top=p.z>=1.614
  edge=top if is_top else bottom;weight=math.exp(-((p.z-edge)/.0065)**2)
  if abs(dx)>.0148:weight*=max(0,1-(abs(dx)-.0148)/.004)
  meet=1.6135+(.00005 if is_top else -.00005)
  q=p.copy();q.z+=(meet-edge)*weight
  radius=.0158;d2=(q.x-centres[side].x)**2+(q.z-centres[side].z)**2
  if d2<radius*radius:q.y=min(q.y,centres[side].y-math.sqrt(max(.000001,radius*radius-d2))-.00025)
  key.data[i].co=q
for name,axis,angle in [('eyeLookLeft','Z',.085),('eyeLookRight','Z',-.085),('eyeLookUp','X',-.065),('eyeLookDown','X',.065)]:
 key=body.shape_key_add(name=name);rot=Matrix.Rotation(angle,3,axis)
 for i,p in enumerate(base):
  if members.get(i,set())&eye_materials:
   centre=centres['Left' if p.x>.011 else 'Right'];key.data[i].co=centre+rot@(p-centre)
specs={'jawOpen':(1,1,0),'viseme_PP':(0,.91,.001),'viseme_FF':(.16,.97,0),'viseme_TH':(.24,1.02,0),'viseme_DD':(.23,1.02,0),'viseme_kk':(.45,1,0),'viseme_CH':(.32,.85,.001),'viseme_SS':(.16,1.06,0),'viseme_nn':(.20,1,0),'viseme_RR':(.32,.83,.002),'viseme_aa':(.9,1,0),'viseme_E':(.43,1.08,0),'viseme_I':(.25,1.12,0),'viseme_O':(.68,.72,.002),'viseme_U':(.38,.62,.004)}
for name,(opening,width,pucker) in specs.items():
 key=body.shape_key_add(name=name)
 for i,p in enumerate(base):
  names=members.get(i,set());q=p.copy()
  if 'Own oral cavity' in names:
   q.x=cx+(p.x-cx)*width;q.y+=.004*(1-width)
  if 'Own lower teeth' in names or 'Own tongue' in names:q.z-=opening*.009
  if 'Own tongue' in names and name=='viseme_TH':q.y-=.005
  if (names&{'Own lip surface','Original head albedo'}) and abs(p.x-cx)<.06 and 1.489<p.z<1.562 and p.y<-.06:
   d=p.z-seam(p.x);horizontal=max(0,1-(abs(p.x-cx)/.049)**4);near=math.exp(-(d/.013)**2)*horizontal
   q.x=cx+(p.x-cx)*(1+(width-1)*near);q.y-=pucker*near
   span=math.sqrt(max(0,1-min(1,abs((p.x-cx)/rx))**2))
   q.z+=(.0017 if d>=0 else -.009)*opening*near*span
   if d<-.008:q.z-=.0035*opening*horizontal*math.exp(-((p.z-1.515)/.018)**2)
   if name=='viseme_FF' and d<0:q.z+=.0016*near
  key.data[i].co=q
for key in body.data.shape_keys.key_blocks:key.value=0
rig.data.pose_position='POSE';rig.animation_data.action=next(a for a in bpy.data.actions if a.name=='Idle');scene.frame_set(1);rig.select_set(True)
options=dict(filepath=str(OUT/'personal-guide-facial.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_extras=True,export_morph=True,export_morph_normal=True,export_copyright='Appearance: user-provided 0597, retained original head identity. Facial geometry and morphs authored locally. Microsoft/Rocketbox: body motion reference only, MIT. No donor face geometry.')
if 'export_try_sparse_sk' in bpy.ops.export_scene.gltf.get_rna_type().properties:options['export_try_sparse_sk']=True
bpy.ops.export_scene.gltf(**options);bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'personal-guide-facial.blend'))
path=OUT/'personal-guide-facial.glb';manifest=json.loads((OUT/'manifest-v30.json').read_text(encoding='utf-8'))
manifest.update({'version':6,'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'vertices':len(mesh.vertices),'triangles':sum(len(p.vertices)-2 for p in mesh.polygons),'character':'User 0597 / own head with local facial morphs','status':'Own face with speech/blink shapes; visual review pending','facial':{'identity':'Own 0597 head, hairstyle, glasses, body and clothes retained; no Microsoft or MakeHuman facial geometry','source':'personal-guide-orbit.blend','shapes':[k.name for k in mesh.shape_keys.key_blocks if k.name!='Basis'],'mouthBoundaryVertices':len(loop),'sharedMouthBoundaryVertices':shared,'mouthCentre':[cx,cz],'reference':'Separate eyelid, eye and lip controls inspired by Rocketbox/Headbox; shapes authored on own mesh','speech':'speech/terrace-intro.json'},'limitations':['Local facial retopology and shapes are a first calibration, not finished photoreal facial performance.','Speech timing quality is reported with its audio data; no conversational AI or microphone recognition.','Original generated face-side, clothing and hands still require art refinement.'],'verification':{'browser':'../../../screenshots/face36-checks.json','independentImport':'import-validation-facial.json'}})
manifest['status']='Own head, blink/gaze and sample speech integrated; art and timing calibration pending'
manifest['limitations'].append('GLB contains the facial shapes and body clips. Automatic blink/gaze/speech and stair contact are website runtime; speech audio and cue JSON are separate assets.')
(OUT/'manifest-facial.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('OWN_FACE_READY',json.dumps({k:manifest[k] for k in ['bytes','vertices','triangles','facial']}),flush=True)
