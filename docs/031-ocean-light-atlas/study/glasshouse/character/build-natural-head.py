"""Unselected MakeHuman experiment; current head uses build-rocket-head.py.

The new head has authored facial edge loops and UVs. It is a new fitted head,
not a claim that the generated source face has been manually retopologized.
"""
import bpy,bmesh,json,math,hashlib,importlib.util
import numpy as np
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];CHAR=ROOT/'character';SRC=CHAR/'hero-source';WORK=CHAR/'personal-0597';OUT=ROOT/'assets/personal-guide'
bpy.ops.wm.open_mainfile(filepath=str(WORK/'personal-guide.blend'))
scene=bpy.context.scene;scene.render.fps=30
body=next(o for o in scene.objects if o.type=='MESH');rig=next(o for o in scene.objects if o.type=='ARMATURE');rig.data.pose_position='REST'
source_mat=body.data.materials[0]
image=next(n.image for n in source_mat.node_tree.nodes if n.type=='TEX_IMAGE' and n.image.colorspace_settings.name=='sRGB')
pixels=np.array(image.pixels[:],dtype=np.float32).reshape(image.size[1],image.size[0],4)
uv=body.data.uv_layers.active
def albedo(poly):
 p=sum((uv.data[i].uv for i in poly.loop_indices),Vector((0,0)))/len(poly.loop_indices)
 return pixels[min(image.size[1]-1,max(0,int(p.y*(image.size[1]-1)))),min(image.size[0]-1,max(0,int(p.x*(image.size[0]-1))))][:3]
hair_indices=set()
for p in body.data.polygons:
 x,y,z=p.center
 if z>1.62:
  c=albedo(p)
  if (max(c)<.40 and c[0]<.34) or z>1.7:hair_indices.add(p.index)
bm=bmesh.new();bm.from_mesh(body.data);bm.faces.ensure_lookup_table()
cut=[bm.faces[p.index] for p in body.data.polygons if p.center.z>1.475 and p.index not in hair_indices]
bmesh.ops.delete(bm,geom=cut,context='FACES');bm.to_mesh(body.data);bm.free();body.data.update()
# Keep the generated hairstyle, with restrained dielectric highlights.
hair_mat=source_mat.copy();hair_mat.name='0597 retained hairstyle'
bs=hair_mat.node_tree.nodes.get('Principled BSDF')
for key in ['Normal','Metallic','Roughness','Specular Tint']:
 for l in list(bs.inputs[key].links):hair_mat.node_tree.links.remove(l)
bs.inputs['Metallic'].default_value=0;bs.inputs['Roughness'].default_value=.55;bs.inputs['Specular IOR Level'].default_value=.28
body.data.materials.append(hair_mat)
for p in body.data.polygons:
 if p.center.z>1.475:p.material_index=1

spec=importlib.util.spec_from_file_location('adult_head_source',CHAR/'hero-body.py');mh=importlib.util.module_from_spec(spec);spec.loader.exec_module(mh)
head,joints=mh.load_body();head.name='Fitted continuous adult head'
head.data.uv_layers.active.name=body.data.uv_layers.active.name
eye_ref=joints['joint-l-eye'];sx=.0365/abs(eye_ref.x);dz=1.614-eye_ref.z;dy=-.085-eye_ref.y
def fit(p):return Vector((p.x*sx+.0105,p.y+dy,p.z+dz))
for v in head.data.vertices:v.co=fit(v.co)
bm=bmesh.new();bm.from_mesh(head.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<1.425 or (v.co.z<1.49 and abs(v.co.x-.0105)>.055)],context='VERTS');bm.to_mesh(head.data);bm.free()
def linear(c):return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c)
def material(name,colour,rough=.5,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*linear(colour),1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;p.inputs['Specular IOR Level'].default_value=.3;return m
skin=material('Continuous adult facial skin',(1,1,1),.56)
node=skin.node_tree.nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(str(SRC/'official-system/skins/young_asian_male/young_lightskinned_male_diffuse3.png'),check_existing=True);node.image.pack()
skin.node_tree.links.new(node.outputs['Color'],skin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
skin.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.035
head.data.materials.clear();head.data.materials.append(skin)
head.vertex_groups.clear();g=head.vertex_groups.new(name='Bip01 Head');g.add(list(range(len(head.data.vertices))),1,'REPLACE')
for p in head.data.polygons:p.use_smooth=True
bpy.context.view_layer.objects.active=head;bpy.ops.object.select_all(action='DESELECT');head.select_set(True)
sub=head.modifiers.new('Facial surface subdivision','SUBSURF');sub.levels=1;bpy.ops.object.modifier_apply(modifier=sub.name)
extras=[head]
def bind(ob):
 bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
 if ob.type=='CURVE':bpy.ops.object.convert(target='MESH')
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 group=ob.vertex_groups.new(name='Bip01 Head');group.add(list(range(len(ob.data.vertices))),1,'REPLACE')
 for p in ob.data.polygons:p.use_smooth=True
 extras.append(ob)
# Use MakeHuman's anatomical eye mesh and its preserved UV/alpha cornea.
vs=[];tex=[];faces=[];face_uv=[]
for line in (SRC/'high-poly.obj').read_text().splitlines():
 f=line.split()
 if not f:continue
 if f[0]=='v':vs.append(tuple(map(float,f[1:4])))
 elif f[0]=='vt':tex.append(tuple(map(float,f[1:3])))
 elif f[0]=='f':
  tokens=[s.split('/') for s in f[1:]];faces.append([int(t[0])-1 for t in tokens]);face_uv.append([int(t[1])-1 for t in tokens])
mapped=[];reading=False;scales=[1,1,1]
for line in (SRC/'high-poly.mhclo').read_text().splitlines():
 f=line.split()
 if not f or f[0].startswith('#'):continue
 if f[0] in ['x_scale','y_scale','z_scale']:
  axis={'x_scale':0,'y_scale':1,'z_scale':2}[f[0]];a,b=int(f[1]),int(f[2]);scales[axis]=abs(mh.RAW_POINTS[a][axis]-mh.RAW_POINTS[b][axis])/float(f[3])
 elif f[0]=='verts':reading=True
 elif reading:
  if not f[0][0].isdigit():break
  if len(f)==1:p=mh.RAW_POINTS[int(f[0])].copy()
  else:p=sum((mh.RAW_POINTS[int(f[i])]*float(f[i+3]) for i in range(3)),Vector())+Vector(tuple(float(f[i+6])*scales[i] for i in range(3)))
  mapped.append(fit(mh.CONVERT_POINT(p)))
data=bpy.data.meshes.new('Anatomical eye surface');data.from_pydata(mapped,[],faces);data.update();layer=data.uv_layers.new(name=body.data.uv_layers.active.name)
for p,ids in zip(data.polygons,face_uv):
 for li,ui in zip(p.loop_indices,ids):layer.data[li].uv=tex[ui]
eyes=bpy.data.objects.new('Fitted brown eyes',data);scene.collection.objects.link(eyes)
eye_mat=material('Anatomical brown eyes',(1,1,1),.25);node=eye_mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(str(SRC/'brown_eye.png'),check_existing=True);node.image.pack()
bs=eye_mat.node_tree.nodes.get('Principled BSDF');eye_mat.node_tree.links.new(node.outputs['Color'],bs.inputs['Base Color']);eye_mat.node_tree.links.new(node.outputs['Alpha'],bs.inputs['Alpha']);eye_mat.surface_render_method='DITHERED';eye_mat.use_backface_culling=True;bs.inputs['Coat Weight'].default_value=.12
data.materials.append(eye_mat);bind(eyes)
gold=material('Fine bronze spectacles',(.42,.31,.19),.34,.65)
def tube(name,points,depth,closed=False):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=depth;data.bevel_resolution=3
 spline=data.splines.new('POLY');spline.points.add(len(points)-1)
 for p,co in zip(spline.points,points):p.co=(*co,1)
 spline.use_cyclic_u=closed;ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);data.materials.append(gold);bind(ob)
def frame(cx,a):
 x=cx+.0305*math.cos(a);return (x,-.123+.014*((x-.0105)/.08)**2,1.603+.026*math.sin(a))
for cx in [-.026,.047]:tube('Fine rim',[frame(cx,2*math.pi*i/128) for i in range(128)],.0008,True)
tube('Bridge',[frame(-.026,.42),(.0105,-.128,1.618),frame(.047,math.pi-.42)],.00075)
tube('Left temple',[frame(-.026,math.pi-.42),(-.078,-.055,1.623),(-.084,.01,1.61)],.00085)
tube('Right temple',[frame(.047,.42),(.099,-.055,1.623),(.105,.01,1.61)],.00085)
bpy.ops.object.select_all(action='DESELECT');body.select_set(True)
for ob in extras:ob.select_set(True)
bpy.context.view_layer.objects.active=body;bpy.ops.object.join();body.name='Personal0597_FittedAdultHead'
if body.data.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
for e in body.data.edges:e.use_edge_sharp=False
for p in body.data.polygons:p.use_smooth=True
rig.data.pose_position='POSE';rig.animation_data.action=next(a for a in bpy.data.actions if a.name=='Idle');scene.frame_set(1);rig.select_set(True)
path=OUT/'personal-guide-head-mh-trial.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_extras=True,export_copyright='0597 body/hairstyle: user-provided. Fitted adult head/skin/eyes: MakeHuman CC0. Motions: Microsoft/Rocketbox MIT.')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'personal-guide-head-mh-trial.blend'))
manifest=json.loads((OUT/'manifest-v30.json').read_text(encoding='utf-8'))
manifest.update({'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'vertices':len(body.data.vertices),'triangles':sum(len(p.vertices)-2 for p in body.data.polygons),'status':'Fitted mature head candidate; static visual review pending','headSource':{'geometry':'MakeHuman CC0 adult facial topology, Asian male shape and matching anatomical eyes','albedo':'MakeHuman CC0 young_asian_male','preserved':'User 0597 body, clothing and hairstyle','identity':'New fitted head; does not preserve exact original facial identity','licenseEvidence':'../../character/hero-source/SOURCES.json'},'limitations':['Static facial fitting; no speech, blink or expression animation implemented.','Retained body actions do not constitute facial animation.','Head identity and neck/hairstyle fit require visual review.'],'verification':{'browser':'../../../screenshots/head35-checks.json','independentImport':'import-validation-head.json'}})
(OUT/'manifest-head-mh-trial.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('HEAD_READY',json.dumps({k:manifest[k] for k in ['file','bytes','vertices','triangles']}),flush=True)
