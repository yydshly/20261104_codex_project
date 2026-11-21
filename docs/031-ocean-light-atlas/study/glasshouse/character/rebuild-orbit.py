"""Rebuild the orbital band with connected topology and actual eyeballs.

The original character and prior candidates are untouched. All new skin
boundary vertices are shared with the retained face, not overlaid on it.
"""
import bpy,bmesh,json,math,hashlib
import numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import delaunay_2d_cdt, barycentric_transform
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'character/personal-0597';OUT=ROOT/'assets/personal-guide'
bpy.ops.wm.open_mainfile(filepath=str(WORK/'personal-guide.blend'))
scene=bpy.context.scene;scene.render.fps=30
body=next(o for o in scene.objects if o.type=='MESH');rig=next(o for o in scene.objects if o.type=='ARMATURE');rig.data.pose_position='REST'
oldmat=body.data.materials[0]
positions=[v.co.copy() for v in body.data.vertices];faces=[tuple(p.vertices) for p in body.data.polygons]
uv=body.data.uv_layers.active;uvs=[[uv.data[i].uv.copy() for i in p.loop_indices] for p in body.data.polygons]
bvh=BVHTree.FromPolygons(positions,faces)
image=next(n.image for n in oldmat.node_tree.nodes if n.type=='TEX_IMAGE' and n.image.colorspace_settings.name=='sRGB')
pixels=np.array(image.pixels[:],dtype=np.float32).reshape(image.size[1],image.size[0],4)
def linear(c):return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
def skin_hit(x,z):
 hit,n,index,d=bvh.ray_cast(Vector((x,0,z)),Vector((0,-1,0)))
 if hit is None:raise ValueError(('skin ray outside head',x,z))
 return hit,index
def skin_colour(x,z):
 hit,index=skin_hit(x,z);f=faces[index];tuv=uvs[index]
 p=barycentric_transform(hit,positions[f[0]],positions[f[1]],positions[f[2]],Vector((*tuv[0],0)),Vector((*tuv[1],0)),Vector((*tuv[2],0)))
 u=max(0,min(image.size[0]-1,p.x*(image.size[0]-1)));v=max(0,min(image.size[1]-1,p.y*(image.size[1]-1)))
 a,b=int(u),int(v);tx,ty=u-a,v-b
 return ((pixels[b,a]*(1-tx)+pixels[b,min(a+1,image.size[0]-1)]*tx)*(1-ty)+(pixels[min(b+1,image.size[1]-1),a]*(1-tx)+pixels[min(b+1,image.size[1]-1),min(a+1,image.size[0]-1)]*tx)*ty)[:3]
def simple(name,colour,rough=.55,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*linear(np.array(colour)),1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;p.inputs['Specular IOR Level'].default_value=.32
 return m
headmat=oldmat.copy();headmat.name='Original head albedo'
principled=headmat.node_tree.nodes.get('Principled BSDF')
for key in ['Normal','Metallic','Roughness','Specular Tint']:
 for link in list(principled.inputs[key].links):headmat.node_tree.links.remove(link)
principled.inputs['Metallic'].default_value=0;principled.inputs['Roughness'].default_value=.62;principled.inputs['Specular IOR Level'].default_value=.32;principled.inputs['Specular Tint'].default_value=(1,1,1,1)
skinmat=simple('Connected orbital skin',(1,1,1),.62)
node=skinmat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='OrbitColour';skinmat.node_tree.links.new(node.outputs['Color'],skinmat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
white=simple('Warm sclera',(.81,.79,.75),.30)
iris=simple('Brown iris',(1,1,1),.26)
node=iris.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='OrbitColour';iris.node_tree.links.new(node.outputs['Color'],iris.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
iris.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.4
dark=simple('Pupils',(.016,.010,.007),.16)
gold=simple('Fine bronze spectacles',(.56,.43,.27),.3,.65)
materials=[headmat,skinmat,white,iris,dark,gold];indices={m.name:len(body.data.materials)+i for i,m in enumerate(materials)}
for m in materials:body.data.materials.append(m)
head_index=indices[headmat.name];skin_index=indices[skinmat.name]

# Find the actual skin from inside the head. Disconnected raised frame
# surfaces lie farther away than this first exit and can be removed separately.
remove=set();shells=0
for p in body.data.polygons:
 x,y,z=p.center
 if z>1.48:p.material_index=head_index
 if not (1.563<z<1.643 and -.106<x<.117 and y<.03):continue
 origin=Vector((.011,.015,z));radial=Vector((x-.011,y-.015,0));length=radial.length
 ring_distance=min(abs(math.sqrt(((x-cx)/.0305)**2+((z-1.603)/.026)**2)-1) for cx in [-.026,.047])
 rim_zone=ring_distance<.24 and y<-.08
 temple_zone=1.611<z<1.632 and -.082<x<.102 and (x<-.056 or x>.078) and -.13<y<-.025
 if length>.001 and (rim_zone or temple_zone):
  hit,n,idx,d=bvh.ray_cast(origin,radial.normalized())
  if hit and length>(hit-origin).length+.0018:remove.add(p.index);shells+=1
 if -.064<x<.086 and 1.570<z<1.638 and y<-.045:remove.add(p.index)
bm=bmesh.new();bm.from_mesh(body.data);bm.faces.ensure_lookup_table()
bmesh.ops.delete(bm,geom=[bm.faces[i] for i in remove],context='FACES')
for attempt in range(8):
 edges=[e for e in bm.edges if e.is_boundary and all(1.55<v.co.z<1.66 and v.co.y<.04 for v in e.verts)]
 adj={}
 for e in edges:
  a,b=e.verts;adj.setdefault(a,[]).append(b);adj.setdefault(b,[]).append(a)
 components=[];pending=set(adj)
 while pending:
  stack=[pending.pop()];part=[]
  while stack:
   v=stack.pop();part.append(v)
   for q in adj[v]:
    if q in pending:pending.remove(q);stack.append(q)
  components.append(part)
 main=max(components,key=lambda c:max(v.co.x for v in c)-min(v.co.x for v in c))
 pinches=[v for v in main if len(adj[v])!=2]
 if not pinches:break
 # Expand the cut by one face at a touching-wire junction. A single simple
 # boundary is required for a stitched skin patch, not intersecting loops.
 bmesh.ops.delete(bm,geom=list({f for v in pinches for f in v.link_faces}),context='FACES')
assert all(len(adj[v])==2 for v in main),('non-simple skin boundary',[(v.index,len(adj[v])) for v in main if len(adj[v])!=2])
loop=[main[0]];previous=None
while True:
 choices=[v for v in adj[loop[-1]] if v!=previous];nxt=choices[0]
 if nxt==loop[0]:break
 previous=loop[-1];loop.append(nxt)
 assert len(loop)<=len(main),'invalid boundary walk'
assert len(loop)==len(main)
outline=[Vector((v.co.x,v.co.z)) for v in loop]
def inside(p,poly):
 x,y=p;result=False;j=len(poly)-1
 for i,q in enumerate(poly):
  a=poly[j]
  if (q.y>y)!=(a.y>y) and x<(a.x-q.x)*(y-q.y)/(a.y-q.y)+q.x:result=not result
  j=i
 return result

centres=[-.026,.047];cz=1.614;rx=.0148;upper=.0045;lower=.0036;radius=.0158
eye_centres=[Vector((cx,skin_hit(cx,cz)[0].y+radius-.0015,cz)) for cx in centres]
def eye_q(x,z,cx):return math.sqrt(((x-cx)/rx)**2+((z-cz)/(upper if z>=cz else lower))**2)
def sphere_y(x,z,i):
 c=eye_centres[i];return c.y-math.sqrt(max(.000001,radius*radius-(x-c.x)**2-(z-c.z)**2))
def patch_depth(x,z):
 y=skin_hit(x,z)[0].y
 # The fused source frames left narrow trenches in the generated skin.
 # Reconstruct their support surface from neighbouring skin samples rather
 # than transferring those trenches to the new connected cheek surface.
 if abs(x-.011)>.018:
  samples=[skin_hit(x+dx,z+dz)[0].y for dx in [-.004,0,.004] for dz in [-.004,0,.004]]
  y=float(np.median(samples))
 for i,cx in enumerate(centres):
  dx,dz=x-cx,z-cz;h=upper if dz>=0 else lower;q=eye_q(x,z,cx)
  if q>=.998:
   gradient=math.sqrt((dx/(rx*rx))**2+(dz/(h*h))**2)/max(q,.001);distance=max(0,(q-1)/max(gradient,.001))
   if distance<.0045:
    a=math.atan2(dz/h,dx/rx);bx=cx+rx*math.cos(a);bz=cz+h*math.sin(a)
    t=max(0,1-distance/.0045);t=t*t*(3-2*t)
    y=y*(1-t)+(sphere_y(bx,bz,i)-.00025)*t
    y-=.00055*math.exp(-((distance-.0011)/.0008)**2)
   if dx*dx+dz*dz<radius*radius:
    # The lid must lie outside its underlying eyeball everywhere, including
    # the lower lid where the original closed-eye surface was recessed.
    y=min(y,sphere_y(x,z,i)-.00035)
 return y
def patch_colour(x,z):
 raw=skin_colour(x,z)
 for cx in centres:
  q=eye_q(x,z,cx)
  if q<2.0:
   clean=(skin_colour(x,1.597)+skin_colour(x,1.633))*.5
   t=max(0,min(1,(2-q)/.7));t=t*t*(3-2*t);raw=raw*(1-t)+clean*t
 return raw
points=list(outline);constraints=[(i,(i+1)%len(loop)) for i in range(len(loop))]
hole_loops=[]
for cx in centres:
 hole=[]
 for i in range(96):
  a=2*math.pi*i/96;sa=math.sin(a);p=Vector((cx+rx*math.cos(a),cz+(upper if sa>=0 else lower)*sa))
  hole.append(len(points));points.append(p)
 constraints.extend((hole[i],hole[(i+1)%96]) for i in range(96));hole_loops.append(hole)
xmin,xmax=min(p.x for p in outline),max(p.x for p in outline);zmin,zmax=min(p.y for p in outline),max(p.y for p in outline)
for z in np.arange(zmin+.001,zmax,.0013):
 for x in np.arange(xmin+.001,xmax,.0013):
  p=Vector((float(x),float(z)))
  if inside(p,outline) and all(eye_q(x,z,cx)>1.025 for cx in centres):points.append(p)
vs,es,fs,orig_v,orig_e,orig_f=delaunay_2d_cdt(points,constraints,[],0,.0000002)
deform=bm.verts.layers.deform.verify();head_group=body.vertex_groups['Bip01 Head'].index
col_layer=bm.loops.layers.float_color.get('OrbitColour') or bm.loops.layers.float_color.new('OrbitColour')
for face in bm.faces:
 for l in face.loops:l[col_layer]=(1,1,1,1)
newverts=[];shared=0
for p,origin_ids in zip(vs,orig_v):
 existing=next((i for i in origin_ids if i<len(loop)),None)
 if existing is not None:v=loop[existing];shared+=1
 else:
  v=bm.verts.new((p.x,patch_depth(p.x,p.y),p.y));v[deform][head_group]=1
 newverts.append(v)
created=0
for f in fs:
 centre=sum((vs[i] for i in f),Vector((0,0)))/len(f)
 if not inside(centre,outline) or any(inside(centre,[points[i] for i in hole]) for hole in hole_loops):continue
 try:face=bm.faces.new([newverts[i] for i in reversed(f)])
 except ValueError:continue
 face.material_index=skin_index;face.smooth=True;created+=1
 for l in face.loops:
  colour=patch_colour(l.vert.co.x,l.vert.co.z);l[col_layer]=(*linear(colour),1)
# Fill only tiny attachment holes outside the new orbital boundary.
main_set=set(loop);small=[e for e in edges if not any(v in main_set for v in e.verts) and e.is_valid and e.is_boundary]
if small:
 result=bmesh.ops.holes_fill(bm,edges=small,sides=20)
 for face in result['faces']:
  face.material_index=skin_index;face.smooth=True
  for l in face.loops:l[col_layer]=(*linear(skin_colour(l.vert.co.x,l.vert.co.z)),1)
# The input is one connected character. After excising the old spectacles,
# tiny detached wire remnants must not survive as floating skin triangles.
pending=set(bm.verts);pieces=[]
while pending:
 stack=[pending.pop()];piece=[]
 while stack:
  v=stack.pop();piece.append(v)
  for e in v.link_edges:
   q=e.other_vert(v)
   if q in pending:pending.remove(q);stack.append(q)
 pieces.append(piece)
main_piece=max(pieces,key=len);keep=set(main_piece);debris=[v for v in bm.verts if v not in keep]
debris_count=len(debris)
if debris:bmesh.ops.delete(bm,geom=debris,context='VERTS')
pending_faces=set(bm.faces);face_pieces=[]
while pending_faces:
 stack=[pending_faces.pop()];piece=[]
 while stack:
  face=stack.pop();piece.append(face)
  for edge in face.edges:
   for adjacent in edge.link_faces:
    if adjacent in pending_faces:pending_faces.remove(adjacent);stack.append(adjacent)
 face_pieces.append(piece)
largest_faces=set(max(face_pieces,key=len));fins=[f for f in bm.faces if f not in largest_faces]
fin_count=len(fins)
if fins:bmesh.ops.delete(bm,geom=fins,context='FACES')
# Rebuild the two old welded temple contacts as simple skin disks. The old
# generated attachment has intersecting sheets, so filling its existing edge
# chain alone cannot make a valid skin surface.
temple_contacts=[Vector((-.0714,-.0474,1.6252)),Vector((.098,-.043,1.6247))]
contact_faces={face for face in bm.faces if any(any((v.co-c).length<.009 for v in face.verts) for c in temple_contacts)}
if contact_faces:bmesh.ops.delete(bm,geom=list(contact_faces),context='FACES')
attachments=[e for e in bm.edges if e.is_boundary and all(v.co.z>1.5 for v in e.verts) and not any(all(eye_q(v.co.x,v.co.z,cx)<1.05 for v in e.verts) for cx in centres)]
attachment_faces=0
if attachments:
 filled=bmesh.ops.holes_fill(bm,edges=attachments,sides=0)['faces']
 triangles=bmesh.ops.triangulate(bm,faces=filled)['faces'];attachment_faces=len(triangles)
 for face in triangles:
  face.material_index=skin_index;face.smooth=True
  for l in face.loops:l[col_layer]=(*linear(skin_colour(l.vert.co.x,l.vert.co.z)),1)
remaining=[e for e in bm.edges if e.is_boundary and all(v.co.z>1.5 for v in e.verts) and not any(all(eye_q(v.co.x,v.co.z,cx)<1.05 for v in e.verts) for cx in centres)]
attachment_adj={}
for e in remaining:
 a,b=e.verts;attachment_adj.setdefault(a,[]).append(b);attachment_adj.setdefault(b,[]).append(a)
todo=set(attachment_adj);attachment_vertices=0
while todo:
 stack=[todo.pop()];ring=[]
 while stack:
  v=stack.pop();ring.append(v)
  for q in attachment_adj[v]:
   if q in todo:todo.remove(q);stack.append(q)
 assert len(ring)<=32,'unexpected large attachment defect'
 centre=sum((v.co for v in ring),Vector())/len(ring);centre.y=skin_hit(centre.x,centre.z)[0].y
 bmesh.ops.pointmerge(bm,verts=ring,merge_co=centre);attachment_vertices+=len(ring)
bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=.0000001)
boundary_count=sum(e.is_boundary for e in bm.edges)
if boundary_count!=192:print('REMAINING_ATTACHMENT',[(tuple(e.verts[0].co),tuple(e.verts[1].co),[f.calc_area() for f in e.link_faces]) for e in bm.edges if e.is_boundary and not any(all(eye_q(v.co.x,v.co.z,cx)<1.05 for v in e.verts) for cx in centres)],flush=True)
assert boundary_count==192,('only two authored eye openings may remain',boundary_count)
smooth_skin=[v for v in bm.verts if -.079<v.co.x<.109 and 1.563<v.co.z<1.642 and v.co.y<-.028 and not (abs(v.co.x-.011)<.018 and v.co.z<1.606) and all(eye_q(v.co.x,v.co.z,cx)>1.45 for cx in centres)]
for _ in range(50):
 bmesh.ops.smooth_vert(bm,verts=smooth_skin,factor=.55,use_axis_x=False,use_axis_y=True,use_axis_z=False)
 for v in smooth_skin:
  for i,cx in enumerate(centres):
   if (v.co.x-cx)**2+(v.co.z-cz)**2<radius*radius:v.co.y=min(v.co.y,sphere_y(v.co.x,v.co.z,i)-.00035)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(body.data);bm.free();body.data.update()
if body.data.has_custom_normals:body.data.normals_split_custom_set([(0,0,0)]*len(body.data.loops))

extras=[]
def bind(ob):
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
 if ob.type=='CURVE':bpy.ops.object.convert(target='MESH')
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 group=ob.vertex_groups.new(name='Bip01 Head');group.add(list(range(len(ob.data.vertices))),1,'REPLACE')
 extras.append(ob)
for i,c in enumerate(eye_centres):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,radius=radius,location=c)
 eye=bpy.context.object;eye.name=f'Actual eyeball {i}';eye.data.materials.append(white)
 for p in eye.data.polygons:p.use_smooth=True
 bind(eye)
 # A curved iris cap follows the real eyeball, viewed through the skin opening.
 verts=[(c.x,c.y-radius-.00004,c.z)];colours=[(.016,.010,.007)];quads=[];mat_ids=[];n=128
 radii=[.0013,.0021,.0022,.003,.004,.0052,.0058,.0060]
 for row,r in enumerate(radii):
  for j in range(n):
   a=2*math.pi*j/n;x=c.x+r*math.cos(a);z=c.z+r*math.sin(a);verts.append((x,sphere_y(x,z,i)-.00004,z))
   fibres=.76+.24*math.sin(a*47+i)*math.sin(a*17+.8);shade=.65 if r>.0058 else 1
   colours.append((.27*fibres*shade,.15*fibres*shade,.073*fibres*shade))
   q=1+row*n+j;qn=1+row*n+(j+1)%n
   if not row:quads.append((0,q,qn))
   else:quads.append((q-n,q,qn,qn-n))
   mat_ids.append(0 if r<=.0021 else 1)
 data=bpy.data.meshes.new(f'Iris {i}');data.from_pydata(verts,[],quads);data.update();ob=bpy.data.objects.new(f'Iris {i}',data);scene.collection.objects.link(ob);data.materials.append(dark);data.materials.append(iris)
 attr=data.color_attributes.new(name='OrbitColour',type='FLOAT_COLOR',domain='CORNER')
 for p,mi in zip(data.polygons,mat_ids):
  p.material_index=mi;p.use_smooth=True
  for li in p.loop_indices:attr.data[li].color=(*linear(np.array(colours[data.loops[li].vertex_index])),1) if mi else (1,1,1,1)
 bind(ob)
def tube(name,points,depth,closed=False):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=depth;data.bevel_resolution=3
 spline=data.splines.new('POLY');spline.points.add(len(points)-1)
 for p,co in zip(spline.points,points):p.co=(*co,1)
 spline.use_cyclic_u=closed;ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);data.materials.append(gold);bind(ob)
def frame_point(cx,a):
 x=cx+.0305*math.cos(a);return (x,-.128+.009*((x-.011)/.08)**2,1.603+.026*math.sin(a))
for cx in centres:
 tube('Independent fine rim',[frame_point(cx,a) for a in np.linspace(0,2*math.pi,128,endpoint=False)],.00085,True)
tube('Nose bridge',[frame_point(centres[0],.42),(.007,-.131,1.616),(.011,-.132,1.618),(.015,-.131,1.616),frame_point(centres[1],math.pi-.42)],.00075)
tube('Left temple',[frame_point(centres[0],math.pi-.42),(-.075,-.079,1.622),(-.084,-.012,1.62),(-.083,.014,1.602)],.0009)
tube('Right temple',[frame_point(centres[1],.42),(.097,-.077,1.622),(.102,-.008,1.62),(.100,.013,1.602)],.0009)
bpy.ops.object.select_all(action='DESELECT');body.select_set(True)
for ob in extras:ob.select_set(True)
bpy.context.view_layer.objects.active=body;bpy.ops.object.join();body.name='Personal0597_ConnectedOrbit'
if body.data.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
for edge in body.data.edges:edge.use_edge_sharp=False
for face in body.data.polygons:face.use_smooth=True
rig.data.pose_position='POSE';rig.animation_data.action=next(a for a in bpy.data.actions if a.name=='Idle');scene.frame_set(1);rig.select_set(True)
path=OUT/'personal-guide-orbit.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_extras=True,
 export_copyright='Appearance: user-provided 0597. Motion reference: Microsoft/Rocketbox, MIT. Connected orbital topology and independent eyes/eyewear authored locally.')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'personal-guide-orbit.blend'))
manifest=json.loads((OUT/'manifest-v30.json').read_text(encoding='utf-8'))
manifest.update({'version':3,'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'vertices':len(body.data.vertices),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'status':'connected orbital reconstruction; visual review pending','orbitReconstruction':{'removedFaces':len(remove),'separateShellFaces':shells,'retainedBoundaryVertices':len(loop),'sharedBoundaryVertices':shared,'newSkinFaces':created,'detachedDebrisVerticesRemoved':debris_count,'attachmentTriangles':attachment_faces,'skinBoundaryEdges':boundary_count,'actualEyeballs':2},'limitations':['Static orbital reconstruction; no blink, facial expression or independent finger animation.','Hands/body remain the 3.2 asset in this focused eye study.','Runtime stairs/contact require the website controller.']})
manifest['status']='static orbital candidate; rigid gaze and face-side repair marks remain; not visually accepted'
manifest['verification']={'scope':'Static review and retained exported clips; no new motion acceptance','browser':'../../../screenshots/orbit34-review-checks.json','views':'../../../screenshots/orbit34-checks.json','independentImport':'import-validation-orbit.json'}
(OUT/'manifest-orbit.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('ORBIT_REBUILT',json.dumps({k:manifest[k] for k in ['bytes','triangles','orbitReconstruction']}),flush=True)
