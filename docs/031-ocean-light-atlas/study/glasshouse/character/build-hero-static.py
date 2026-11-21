"""Static adult character study. MakeHuman CC0 topology and system assets.
Only one outfit and one natural standing pose; no new animation delivery.
"""
import bpy, bmesh, math, json, importlib.util, sys, struct, tempfile
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent;SRC=ROOT/'hero-source';OUT=ROOT.parent/'assets/hero';OUT.mkdir(parents=True,exist_ok=True)
export_temp=ROOT/'hero-export-temp';export_temp.mkdir(exist_ok=True);tempfile.tempdir=str(export_temp)
bpy.context.preferences.filepaths.temporary_directory=str(export_temp)
spec=importlib.util.spec_from_file_location('hero_body',ROOT/'hero-body.py');human=importlib.util.module_from_spec(spec);spec.loader.exec_module(human)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
body,joints=human.load_body();scene=bpy.context.scene;parts=[]

def color(hex):
 vals=[int(hex[i:i+2],16)/255 for i in (1,3,5)]
 return tuple(x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in vals)+(1,)
def material(name,hex,rough=.6,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;s=m.node_tree.nodes.get('Principled BSDF');s.inputs['Base Color'].default_value=color(hex);s.inputs['Roughness'].default_value=rough;s.inputs['Metallic'].default_value=metal
 return m
def texture(m,path,alpha=False,tint=None):
 n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(path),check_existing=True);n.image.pack();s=m.node_tree.nodes.get('Principled BSDF');m.node_tree.links.new(n.outputs['Color'],s.inputs['Base Color'])
 if tint:
  mix=m.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(*tint,1);m.node_tree.links.new(n.outputs['Color'],mix.inputs[1]);m.node_tree.links.new(mix.outputs[0],s.inputs['Base Color'])
 if alpha:
  if alpha=='blend':m.node_tree.links.new(n.outputs['Alpha'],s.inputs['Alpha'])
  else:
   mask=m.node_tree.nodes.new('ShaderNodeMath');mask.operation='GREATER_THAN';mask.inputs[1].default_value=.4;m.node_tree.links.new(n.outputs['Alpha'],mask.inputs[0]);m.node_tree.links.new(mask.outputs[0],s.inputs['Alpha'])
  m.surface_render_method='DITHERED';m.use_transparent_shadow=True
 return n
skin=material('Hero_Skin_2048','#d7aa89',.53)
texture(skin,SRC/'official-system/skins/young_asian_male/young_lightskinned_male_diffuse3.png',tint=(.79,.69,.60))
skin.node_tree.nodes['Principled BSDF'].inputs['Subsurface Weight'].default_value=.085
skin.node_tree.nodes['Principled BSDF'].inputs['Subsurface Radius'].default_value=(.12,.065,.035)
body.data.materials.append(skin)

def finish(ob,mat=None,subdiv=0):
 if mat:ob.data.materials.clear();ob.data.materials.append(mat)
 for p in ob.data.polygons:p.use_smooth=True
 if subdiv:
  m=ob.modifiers.new('Smooth production surface','SUBSURF');m.levels=subdiv
  bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.modifier_apply(modifier=m.name)
 ob['role']='static-hero';parts.append(ob);return ob

def proxy(objpath,clopath,name,mat,subdiv=0):
 vs=[];uv=[];fs=[];fuv=[]
 for line in objpath.read_text().splitlines():
  f=line.split()
  if not f:continue
  if f[0]=='v':vs.append(Vector(tuple(map(float,f[1:4]))))
  elif f[0]=='vt':uv.append(tuple(map(float,f[1:3])))
  elif f[0]=='f':
   t=[x.split('/') for x in f[1:]];fs.append([int(x[0])-1 for x in t]);fuv.append([int(x[1])-1 if len(x)>1 and x[1] else 0 for x in t])
 mappings=[];scales=[1,1,1];reading=False
 for line in clopath.read_text().splitlines():
  f=line.split()
  if not f or f[0].startswith('#'):continue
  if f[0] in ['x_scale','y_scale','z_scale']:
   axis={'x_scale':0,'y_scale':1,'z_scale':2}[f[0]];a,b=int(f[1]),int(f[2]);scales[axis]=abs(human.RAW_POINTS[a][axis]-human.RAW_POINTS[b][axis])/float(f[3])
  elif f[0]=='verts':reading=True
  elif reading:
   if not f[0][0].isdigit():break
   if len(f)==1:mappings.append(human.RAW_POINTS[int(f[0])].copy())
   elif len(f)>=9:
    p=sum((human.RAW_POINTS[int(f[i])]*float(f[i+3]) for i in range(3)),Vector())
    p+=Vector(tuple(float(f[i+6])*scales[i] for i in range(3)));mappings.append(p)
 assert len(mappings)==len(vs),(name,len(mappings),len(vs))
 me=bpy.data.meshes.new(name);me.from_pydata([human.CONVERT_POINT(v) for v in mappings],[],fs);me.update();layer=me.uv_layers.new(name='AssetUV')
 for poly,ids in zip(me.polygons,fuv):
  for li,ui in zip(poly.loop_indices,ids):layer.data[li].uv=uv[ui]
 ob=bpy.data.objects.new(name,me);scene.collection.objects.link(ob);return finish(ob,mat,subdiv)

eyes=material('Hero_Brown_Eyes','#efe9de',.28);texture(eyes,SRC/'brown_eye.png',alpha='blend');eyes.use_backface_culling=True
eyes.node_tree.nodes['Principled BSDF'].inputs['Coat Weight'].default_value=.03
eyes.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=.22
proxy(SRC/'high-poly.obj',SRC/'high-poly.mhclo','Brown_Eyes_Anatomical_Fit',eyes)
hairdir=SRC/'official-system/hair/short01'
hair=material('Hero_Short_Hair_Alpha','#29231e',.72);texture(hair,hairdir/'short01_diffuse.png',True,tint=(.075,.06,.045))
hair.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=.22
proxy(hairdir/'short01.obj',hairdir/'short01.mhclo','Short_Combed_Hair',hair)
teethdir=SRC/'official-system/teeth/teeth_base'
if (teethdir/'teeth.png').is_file():
 teeth=material('Hero_Teeth','#eee5d4',.38);texture(teeth,teethdir/'teeth.png');proxy(teethdir/'teeth_base.obj',teethdir/'teeth_base.mhclo','Teeth',teeth)

bronze=material('Fine_Bronze_Frames','#8c7158',.28,.72)
def curve(name,points,radius,mat,closed=False):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=8;data.bevel_depth=radius;data.bevel_resolution=2
 sp=data.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for bp,p in zip(sp.bezier_points,points):bp.co=p;bp.handle_left_type='AUTO';bp.handle_right_type='AUTO'
 sp.use_cyclic_u=closed;ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.convert(target='MESH');return finish(bpy.context.object,mat)
eye_z=(joints['joint-l-eye'].z+joints['joint-r-eye'].z)/2
for sign in [-1,1]:
 cx=sign*.033;cy=-.156
 points=[(cx+.028*math.cos(i/48*math.tau),cy+.003*abs(math.cos(i/48*math.tau)),eye_z+.0205*math.sin(i/48*math.tau)) for i in range(48)]
 curve('Round_Spectacle_Frame',points,.0009,bronze,True)
 curve('Spectacle_Arm',[(sign*.061,-.153,eye_z+.002),(sign*.079,-.09,eye_z+.003),(sign*.082,-.014,eye_z),(sign*.079,.002,eye_z-.014)],.001,bronze)
curve('Spectacle_Bridge',[(-.005,-.158,eye_z+.006),(0,-.173,eye_z+.01),(.005,-.158,eye_z+.006)],.00095,bronze)

# Fine brow hairs follow the real forehead rather than a floating cartoon arc.
from mathutils.bvhtree import BVHTree
forehead=BVHTree.FromObject(body,bpy.context.evaluated_depsgraph_get())
brow=material('Soft_Dark_Eyebrows','#302821',.85)
for sign in [-1,1]:
 for i in range(34):
  t=i/33;x=sign*(.011+t*.046);z=eye_z+.023+.004*math.sin(t*math.pi)-.004*t
  point,normal,_,_=forehead.ray_cast(Vector((x,-.35,z)),Vector((0,1,0)),.6)
  if point is not None:
   point.y-=.0008
   curve('Fine_Eyebrow_Hair',[point,point+Vector((sign*.0011,-.0001,.0018)),point+Vector((sign*.002,-.0001,.003))],.00020,brow)

def subset(name,predicate,mat,inflate=0,subdiv=1,exclude_arms=False):
 ob=body.copy();ob.data=body.data.copy();scene.collection.objects.link(ob);ob.name=name
 bm=bmesh.new();bm.from_mesh(ob.data);layer=bm.verts.layers.deform.active
 forbidden=[g.index for g in ob.vertex_groups if g.name.startswith(('rig_upperarm_','rig_lowerarm_','rig_hand_','rig_thumb_','rig_index_','rig_middle_','rig_ring_','rig_pinky_'))] if exclude_arms else []
 def keep(face):
  if not predicate(face.calc_center_median()):return False
  return not(layer and forbidden and any(sum(v[layer].get(i,0) for i in forbidden)>.015 for v in face.verts))
 bmesh.ops.delete(bm,geom=[f for f in bm.faces if not keep(f)],context='FACES');bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(ob.data);bm.free();ob.data.update()
 if inflate:
  for v in ob.data.vertices:v.co+=v.normal*inflate
 return finish(ob,mat,subdiv)

head_only='--head' in sys.argv
if not head_only:
 clothed=importlib.util.spec_from_file_location('hero_hoodie',ROOT/'hero-hoodie.py');hoodie=importlib.util.module_from_spec(clothed);clothed.loader.exec_module(hoodie)
 result=hoodie.build_hoodie(body=body,waist_z=.955,wrist_z=joints['joint-l-hand'].z,wrist_x=abs(joints['joint-l-hand'].x),wrist_y=joints['joint-l-hand'].y)
 for ob in result['objects']:ob['role']='static-hero';parts.append(ob)
 pantsdir=SRC/'official-system/clothes/toigo_wool_pants'
 pants=material('Charcoal_Wool_Trousers','#47484b',.86);texture(pants,pantsdir/'Pants_wool.png',tint=(.64,.64,.64))
 trousers=proxy(pantsdir/'pants_wool.obj',pantsdir/'toigo_wool_pants.mhclo','Charcoal_Tailored_Trousers',pants,1)
 # A real trouser asset supplies the crotch, pockets, seam and fabric shape.
 # Apply only the same closed-leg static pose and under-sweatshirt waist fit.
 for v in trousers.data.vertices:
  p=v.co
  if p.z<.95:p.x-=(1 if p.x>0 else -1)*.085*(1-human.smooth(.08,.95,p.z))
  if p.z>.86:
   amount=human.smooth(.86,.97,p.z);a=math.atan2((p.y-.012)/.105,p.x/.147)
   radius=math.sqrt((p.x/.147)**2+((p.y-.012)/.105)**2)
   if radius>1:
    target=Vector((.147*math.cos(a),.012+.105*math.sin(a),p.z));p.x=p.x*(1-amount)+target.x*amount;p.y=p.y*(1-amount)+target.y*amount
 trousers.data.update()
 sole=material('Ivory_Rubber_Sole','#dedbd0',.72);upper=material('Ivory_Leather_Sneaker','#e8e3d6',.59);heel=material('Navy_Heel_Detail','#293b4a',.74)
 def last(name,cx,profiles,mat):
  vs=[];fs=[];n=48
  for j,(z,rx,front,back) in enumerate(profiles):
   for i in range(n):
    a=i/n*math.tau;s=math.sin(a);vs.append((cx+rx*math.cos(a),-.075+(front if s<0 else back)*s,z))
    if j:fs.append(((j-1)*n+i,(j-1)*n+(i+1)%n,j*n+(i+1)%n,j*n+i))
  fs.append(tuple(reversed(tuple(range(n)))));fs.append(tuple((len(profiles)-1)*n+i for i in range(n)))
  me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();ob=bpy.data.objects.new(name,me);scene.collection.objects.link(ob);return finish(ob,mat,1)
 for side in [-1,1]:
  cx=side*.112
  last('Sneaker_Rubber_Sole',cx,[(.0,.052,.17,.125),(.006,.057,.177,.13),(.033,.057,.177,.13),(.042,.052,.172,.124)],sole)
  last('Sneaker_Shaped_Upper',cx,[(.035,.051,.169,.12),(.06,.052,.159,.119),(.094,.046,.113,.114),(.124,.038,.041,.105),(.13,.032,.027,.078)],upper)
  shoe_bvh=BVHTree.FromObject(parts[-1],bpy.context.evaluated_depsgraph_get())
  for i in range(5):
   y=-.14+i*.022;points=[]
   for x,dy in [(-.031,-.006),(0,0),(.031,.006)]:
    hit,_,_,_=shoe_bvh.ray_cast(Vector((cx+x,y+dy,.30)),Vector((0,0,-1)),.4)
    if hit is not None:points.append(hit+Vector((0,0,.0025)))
   if len(points)==3:curve('Cotton_Shoelace',points,.0014,sole)
  curve('Sneaker_Toe_Seam',[(cx-.045,-.17,.066),(cx,-.204,.079),(cx+.045,-.17,.066)],.00065,sole)
 # Visible anatomy only: neckline, head and complete naturally posed hands.
 skin_ob=subset('Head_Neck_Hands',lambda p:(p.z>1.48 and (p.z>1.57 or abs(p.x)<.07)) or (abs(p.x)>.22 and p.z<.93 and p.z>.65),skin,0,1)
else:finish(body,skin,1)
body.hide_render=not head_only;body.hide_set(not head_only)

if not head_only:
 # Static accessory strands share surfaces/materials and need no separate calls.
 groups={}
 for ob in parts:
  if len(ob.data.materials)==1 and ob.data.materials[0].name in ['Soft_Dark_Eyebrows','Fine_Bronze_Frames']:
   groups.setdefault(ob.data.materials[0].name,[]).append(ob)
 for name,objects in groups.items():
  if len(objects)<2:continue
  parts=[ob for ob in parts if ob not in objects];bpy.ops.object.select_all(action='DESELECT')
  for ob in objects:ob.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();parts.append(bpy.context.object)
 bpy.ops.object.select_all(action='DESELECT')
 for ob in parts:ob.select_set(True)
 bpy.context.view_layer.objects.active=parts[0]
 bpy.ops.export_scene.gltf(filepath=str(OUT/'hero-static.glb'),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_extras=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'hero-static.blend'),compress=True)
 # Ensure web card hair uses an explicit coverage mask, avoiding sorting halos.
 path=OUT/'hero-static.glb';raw=path.read_bytes();jn=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+jn]);other=raw[20+jn:]
 for m in g.get('materials',[]):
  if m.get('name')=='Hero_Short_Hair_Alpha':
   m['alphaMode']='MASK';m['alphaCutoff']=.40;m['doubleSided']=True;m['pbrMetallicRoughness']['baseColorFactor']=[.075,.06,.045,1]
  if m.get('name')=='Hero_Skin_2048':m['pbrMetallicRoughness']['baseColorFactor']=[.79,.69,.60,1]
  if m.get('name')=='Charcoal_Wool_Trousers':m['pbrMetallicRoughness']['baseColorFactor']=[.64,.64,.64,1]
 data=json.dumps(g,separators=(',',':')).encode();data+=b' '*((-len(data))%4);total=12+8+len(data)+len(other);path.write_bytes(struct.pack('<III',0x46546c67,2,total)+struct.pack('<II',len(data),0x4e4f534a)+data+other)
 report={'status':'static-study-awaiting-visual-review','source':'MakeHuman / MPFB CC0 basemesh and official system assets','outfit':'navy hoodie only','animations':0,'meshes':len(g.get('meshes',[])),'materials':len(g.get('materials',[])),'images':len(g.get('images',[])),'bytes':path.stat().st_size}
 (OUT/'manifest.json').write_text(json.dumps(report,indent=2));print('HERO_STATIC_EXPORTED',json.dumps(report),flush=True)

# Diagnostic render: actual model in neutral light, never substituted for web.
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.63,.69,.75,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.4
def area(name,pos,power,size,target=(0,0,1.1)):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=pos;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
area('Large_Neutral_Key',(2,-3,3),320,3);area('Soft_Fill',(-2,-1,2),150,3);area('Rim',(1,2,3),250,2)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.003));floor=bpy.context.object;floor.data.materials.append(material('Studio_Background','#b8bec0',.9))
data=bpy.data.cameras.new('StudyCamera');camera=bpy.data.objects.new('StudyCamera',data);scene.collection.objects.link(camera);scene.camera=camera
if head_only:camera.location=(.38,-1.14,1.72);target=Vector((0,-.03,1.655));data.lens=72;scene.render.resolution_x=800;scene.render.resolution_y=800;name='hero-head-neutral.png'
else:camera.location=(2.1,-4.7,2.0);target=Vector((0,-.02,.94));data.lens=80;scene.render.resolution_x=700;scene.render.resolution_y=1000;name='hero-fullbody-neutral.png'
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.resolution_percentage=100;scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ROOT/name);bpy.ops.render.render(write_still=True)
