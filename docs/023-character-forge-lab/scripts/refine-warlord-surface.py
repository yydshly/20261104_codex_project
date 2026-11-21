"""Portable game-facing surface refinement of the existing skinned warlord.
Runs in Blender 4.5 LTS. No source asset, rig, or gameplay timing is overwritten.
All new surface detail is geometry or packed image textures understood by glTF.
"""
import bpy, math, json, os
from pathlib import Path
from mathutils import Vector
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/warlord-premium'; TEX=OUT/'surface-textures'
OUT.mkdir(parents=True,exist_ok=True);TEX.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/warlord/warlord.blend'))
scene=bpy.context.scene;rig=bpy.data.objects['CrimsonWarlord_Rig']
rig.animation_data.action=None;rig.data.pose_position='REST'
for pb in rig.pose.bones:pb.matrix_basis.identity()
bpy.context.view_layer.update()

# Image textures keep the result portable. A restrained, authored finish takes
# precedence over random noise: rolled steel bands, worn gilding and micrograin.
N=1024
u,v=np.meshgrid(np.arange(N,dtype=np.float32)/N,np.arange(N,dtype=np.float32)/N)
rng=np.random.default_rng(19491)
noise=rng.normal(0,1,(N,N)).astype(np.float32)
fine=rng.normal(0,1,(N,N)).astype(np.float32)
wave=(np.sin(u*math.tau*37+np.sin(v*math.tau*3)*1.4)+np.sin(v*math.tau*57))*.5
scratch=(np.sin(u*math.tau*183+v*1.8)>.997).astype(np.float32)*(np.sin(v*math.tau*13)>.2)

def image(name,values,noncolor=False):
 a=np.asarray(values,dtype=np.float32)
 if a.ndim==2:a=np.repeat(a[:,:,None],3,axis=2)
 rgba=np.ones((N,N,4),dtype=np.float32);rgba[:,:,:3]=np.clip(a,0,1)
 im=bpy.data.images.new(name,width=N,height=N,alpha=False)
 if noncolor:im.colorspace_settings.name='Non-Color'
 im.pixels.foreach_set(rgba.ravel())
 im.filepath_raw=str(TEX/(name+'.png'));im.file_format='PNG';im.save();im.pack();return im

def pbr(name,color,metal,rough,amp=.012,cloth=False):
 m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True
 n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');m.node_tree.links.new(bs.outputs['BSDF'],out.inputs['Surface'])
 grain=(wave*.012+noise*.006+scratch*.02) if not cloth else (np.sin(u*math.tau*256)*np.sin(v*math.tau*256)*.022+noise*.004)
 cols=np.clip(np.array(color)[None,None,:]*(1+grain[:,:,None]),0,1)
 tex=n.new('ShaderNodeTexImage');tex.image=image(name+'_Albedo',cols);m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
 rr=np.clip(rough+wave*.025+noise*.009+scratch*.09,0,1)
 orm=np.ones((N,N,3),dtype=np.float32);orm[:,:,1]=rr;orm[:,:,2]=metal
 packed=n.new('ShaderNodeTexImage');packed.image=image(name+'_ORM',orm,True)
 sep=n.new('ShaderNodeSeparateColor');m.node_tree.links.new(packed.outputs['Color'],sep.inputs['Color']);m.node_tree.links.new(sep.outputs['Green'],bs.inputs['Roughness']);m.node_tree.links.new(sep.outputs['Blue'],bs.inputs['Metallic'])
 height=(wave*.12+fine*.07+scratch*.13)*amp
 gy,gx=np.gradient(height*N)
 normal=np.dstack((-gx,-gy,np.ones_like(gx)));normal/=np.linalg.norm(normal,axis=2)[:,:,None];normal=normal*.5+.5
 nt=n.new('ShaderNodeTexImage');nt.image=image(name+'_Normal',normal,True);nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.045 if name.startswith('Blade') else .10 if not cloth else .10;m.node_tree.links.new(nt.outputs['Color'],nm.inputs['Color']);m.node_tree.links.new(nm.outputs['Normal'],bs.inputs['Normal'])
 bs.inputs['Coat Weight'].default_value=.05 if metal>.6 else 0
 bs.inputs['Coat Roughness'].default_value=.25
 m.diffuse_color=(*color,1);return m
pbr('ArmorDark',(.066,.088,.113),.88,.38)
pbr('ArmorIron',(.20,.25,.29),.91,.36)
pbr('ArmorGold',(.62,.43,.19),.87,.40)
pbr('ArmorGoldEdge',(.80,.59,.28),.90,.34)
pbr('Blade',(.48,.58,.65),.98,.25,.006)
pbr('BladeEdge',(.83,.87,.91),.98,.20,.003)
pbr('UnderArmor',(.023,.025,.031),.05,.68,.008,True)
# Cloth is refined by the separate mantle stage, with this portable starting surface.
pbr('ClothRed',(.22,.009,.022),0,.64,.006,True)
pbr('ClothRedTrim',(.40,.022,.041),0,.60,.006,True)

# A cylindrically projected facial skin texture gives the face color variation,
# warmer cheeks, five-o'clock shadow and fine pore roughness, without painting
# the original color-palette atlas onto the whole head.
z=1.50+v*.35;theta=(u-.5)*math.tau;x=np.sin(theta)*.107
front=np.maximum(0,np.cos(theta))**4
cheeks=np.exp(-((np.abs(x)-.057)/.026)**2-((z-1.655)/.035)**2)*front
jaw=np.exp(-((z-1.602)/.035)**2)*front
sockets=np.exp(-((np.abs(x)-.035)/.024)**2-((z-1.695)/.022)**2)*front
base=np.zeros((N,N,3),dtype=np.float32)+np.array([.53,.303,.215])
base+=cheeks[:,:,None]*np.array([.044,-.002,-.004])
base-=jaw[:,:,None]*np.array([.024,.016,.010])
base-=sockets[:,:,None]*np.array([.035,.026,.018])
lipband=np.exp(-(x/.031)**8-((z-1.623)/.0035)**2)*front
closure=np.exp(-(x/.029)**8-((z-(1.623+.0007*np.cos(x/.030*math.pi)))/.00065)**2)*front
base=base*(1-lipband[:,:,None]*.33)+np.array([.34,.135,.10])*lipband[:,:,None]*.33
base-=closure[:,:,None]*np.array([.18,.10,.06])
base+=noise[:,:,None]*.0035
skin=bpy.data.materials.new('HeroSkin');skin.use_nodes=True;bs=skin.node_tree.nodes.get('Principled BSDF')
tex=skin.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image('HeroSkin_Albedo',base);skin.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
rough=skin.node_tree.nodes.new('ShaderNodeTexImage');rough.image=image('HeroSkin_Roughness',np.clip(.47+noise*.012-jaw*.025,.35,.65),True);skin.node_tree.links.new(rough.outputs['Color'],bs.inputs['Roughness'])
# Very small pores affect light, not anatomy.
height=noise*.00015;gy,gx=np.gradient(height*N);normal=np.dstack((-gx,-gy,np.ones_like(gx)));normal/=np.linalg.norm(normal,axis=2)[:,:,None]
nt=skin.node_tree.nodes.new('ShaderNodeTexImage');nt.image=image('HeroSkin_Normal',normal*.5+.5,True);nm=skin.node_tree.nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.12;skin.node_tree.links.new(nt.outputs['Color'],nm.inputs['Color']);skin.node_tree.links.new(nm.outputs['Normal'],bs.inputs['Normal'])
bs.inputs['Subsurface Weight'].default_value=.075;bs.inputs['Subsurface Radius'].default_value=(1,.42,.22)
bs.inputs['Specular IOR Level'].default_value=.32;skin.diffuse_color=(.53,.303,.215,1)

def simple_mat(name,col,metal=0,rough=.4):
 m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough;m.diffuse_color=(*col,1);return m
lip=simple_mat('HeroLips',(.28,.105,.084),0,.45)
hair=simple_mat('HeroHair',(.018,.012,.012),0,.65)
crease=simple_mat('HeroFaceCrease',(.16,.066,.044),0,.62)
iris=simple_mat('HeroIris',(.092,.045,.015),.05,.24)
pupil=simple_mat('HeroPupil',(.006,.004,.003),0,.11)
white=simple_mat('HeroSclera',(.77,.72,.64),0,.26)
body=bpy.data.objects['SuperHero_Male'];body.data.materials.append(skin);skin_idx=len(body.data.materials)-1
# Head topology is retained and refined; body name and stature remain intact.
for p in body.data.polygons:
 if sum(body.data.vertices[i].co.z for i in p.vertices)/len(p.vertices)>1.545:p.material_index=skin_idx
uv=body.data.uv_layers.active
for loop in body.data.loops:
 co=body.data.vertices[loop.vertex_index].co
 if co.z>1.53:uv.data[loop.index].uv=((math.atan2(co.x,-co.y)/math.tau+.5)%1,(co.z-1.50)/.35)

# Save source front surface for eyelid/lip fitting before subdivision.
headv=[v.co.copy() for v in body.data.vertices if v.co.z>1.55 and v.co.y<-.035]
def front_y(px,pz):
 near=sorted(headv,key=lambda co:(co.x-px)**2+(co.z-pz)**2)[:5]
 weights=[1/max(1e-7,(co.x-px)**2+(co.z-pz)**2) for co in near]
 return sum(co.y*w for co,w in zip(near,weights))/sum(weights)

def apply_modifier(ob,mod):
 bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.modifier_apply(modifier=mod.name)
def smooth_mesh(ob):
 for p in ob.data.polygons:p.use_smooth=True

# Put subdivision before skin evaluation; avoid baking an animated pose.
sub=body.modifiers.new('Anatomical surface refinement','SUBSURF');sub.levels=1;sub.render_levels=1
bpy.context.view_layer.objects.active=body
bpy.ops.object.modifier_move_up(modifier=sub.name)
apply_modifier(body,sub);smooth_mesh(body)
for name in ['Eyes','Eyebrows']:
 ob=bpy.data.objects[name];smooth_mesh(ob)
 if name=='Eyebrows':
  ob.data.materials.clear();ob.data.materials.append(hair)
  for vtx in ob.data.vertices:vtx.co.z=1.710+(vtx.co.z-1.710)*.65
 if name=='Eyes':bpy.data.objects.remove(ob,do_unlink=True)

# Reproject the old faceted cap shapes to real smooth ellipsoids after adding
# geometry, instead of merely interpolating normals over a 12-point silhouette.
round_names=('Pauldron_dark','Pauldron_under','Knee_guard','Knee_iron','Gauntlet','Crest_ember','Helm_jewel','Halberd_ember_socket')
# Close the old polygonal open crown with a continuous forged dome.
helm=bpy.data.objects['OpenHelm'];verts=[];faces=[];segments=64;levels=23
for j in range(levels):
 zz=1.66+j/(levels-1)*.219;rr=math.sqrt(max(.001,1-((zz-1.69)/.19)**2))
 for i in range(segments):
  aa=i/segments*math.tau;verts.append((math.cos(aa)*.115*rr,.025+math.sin(aa)*.12*rr,zz))
for j in range(levels-1):
 for i in range(segments):
  aa=(i+.5)/segments*math.tau
  if math.sin(aa)<-.30 and j<9:continue
  k=j*segments+i;kn=j*segments+(i+1)%segments;faces.append((k,kn,kn+segments,k+segments))
faces.append(tuple((levels-1)*segments+i for i in range(segments)))
me=bpy.data.meshes.new('Continuous forged helm');me.from_pydata(verts,[],faces);me.update();me.materials.append(bpy.data.materials['ArmorDark']);helm.data=me
helm.vertex_groups.clear();vg=helm.vertex_groups.new(name='Head');vg.add(range(len(verts)),1,'REPLACE');smooth_mesh(helm)
for ob in list(bpy.data.objects):
 if ob.type!='MESH' or ob==body:continue
 if ob.name.startswith(round_names):
  coords=[v.co.copy() for v in ob.data.vertices];lo=Vector([min(p[i] for p in coords) for i in range(3)]);hi=Vector([max(p[i] for p in coords) for i in range(3)]);center=(hi+lo)/2;r=(hi-lo)/2
  mod=ob.modifiers.new('Sculpted round silhouette','SUBSURF');mod.subdivision_type='SIMPLE';mod.levels=2;apply_modifier(ob,mod)
  for vert in ob.data.vertices:
   q=Vector([(vert.co[i]-center[i])/max(.0001,r[i]) for i in range(3)])
   if q.length:q.normalize();vert.co=center+Vector([q[i]*r[i] for i in range(3)])
  smooth_mesh(ob)
 elif ob.name.startswith(('Halberd_shaft','Halberd_ferrule','Halberd_leather','Grip_binding','Helm_horn','Plume','Collar','Breastplate_gold','Crest_horn','Greave_ridge')):
  # Smooth tubular details retain existing flat metal planes elsewhere.
  smooth_mesh(ob)
 elif ob.name.startswith(('Cuirass','Pectoral_facet','Abdominal_lamella','Pauldron_lamella','Tasset','Boot','Helm_cheek','Halberd_crescent','Halberd_spearhead','Halberd_counterhook','Sabatons')):
  # Extra micro-bevels form a readable machined highlight along each plate.
  mod=ob.modifiers.new('Fine machined highlights','BEVEL');mod.width=.003;mod.segments=3;mod.affect='EDGES'
  try:apply_modifier(ob,mod)
  except Exception:pass
  smooth_mesh(ob)
  mod=ob.modifiers.new('Stable plate normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=50
  try:apply_modifier(ob,mod)
  except Exception:pass
 # All hard surfaces get local meter-scaled smart UVs for the PBR finish.
 if ob.name not in ['Eyes','Eyebrows'] and ob.name!='WarMantle':
  bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
  bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.012);bpy.ops.object.mode_set(mode='OBJECT')

# New features are skinned rigidly to the existing head, no extra bones or
# runtime constraints are needed.
def finish(ob,name,mat,bone):
 ob.name=name;bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 ob.data.materials.append(mat);vg=ob.vertex_groups.new(name=bone);vg.add(range(len(ob.data.vertices)),1,'REPLACE')
 mod=ob.modifiers.new('Existing hero skeleton','ARMATURE');mod.object=rig;ob.parent=rig;smooth_mesh(ob);return ob

def tube_curve(name,pts,r,material,bone='Head'):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12;c.bevel_depth=r;c.bevel_resolution=3
 sp=c.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for p,co in zip(sp.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 ob=bpy.data.objects.new(name,c);scene.collection.objects.link(ob);bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.convert(target='MESH');return finish(bpy.context.object,name,material,bone)

def sphere(name,pos,scale,mat,bone='Head'):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=1,location=pos);ob=bpy.context.object;ob.scale=scale;return finish(ob,name,mat,bone)
# Eyelids trace the real face, not drawn-on eye highlights.
for s in [-1,1]:
 cx=s*.0335
 # A narrow almond surface clips the iris at the lids. This avoids a white
 # eyeball protruding through the face or an iris glued above the eye.
 ev=[];ef=[];em=[];nx=49;ny=13
 for i in range(nx):
  tt=i/(nx-1);px=cx+(tt-.5)*.032;sin=math.sin(tt*math.pi)
  for j in range(ny):
   rr=j/(ny-1);pz=1.6985+sin*(-.0036+rr*.0073)
   ev.append((px,-.0808-.0008*sin*math.sin(rr*math.pi),pz))
 for i in range(nx-1):
  for j in range(ny-1):
   k=i*ny+j;ef.append((k,k+ny,k+ny+1,k+1))
   px=sum(ev[ix][0] for ix in ef[-1])/4;pz=sum(ev[ix][2] for ix in ef[-1])/4
   dist=((px-cx)/.0060)**2+((pz-1.6985)/.0062)**2
   em.append(2 if abs(px-cx)<.0025 else 1 if dist<1 else 0)
 me=bpy.data.meshes.new('Narrow almond eye');me.from_pydata(ev,[],ef);me.update();ob=bpy.data.objects.new('HeroEye_'+str(s),me);scene.collection.objects.link(ob);finish(ob,'HeroEye_'+str(s),white,'Head');me.materials.append(iris);me.materials.append(pupil)
 for p,mi in zip(me.polygons,em):p.material_index=mi
 for upper in [True]:
  pts=[]
  for i in range(9):
   t=i/8;px=cx+(t-.5)*.032;pz=1.6985+math.sin(t*math.pi)*.0038
   pts.append((px,-.0811,pz))
  tube_curve('UpperLid',pts,.00050,skin)
 # Fine swept sideburns break the bald mannequin silhouette beneath the helm.
 for j in range(5):
  pts=[(s*(.085+.001*j),-.030-j*.002,1.746),(s*(.091+.001*j),-.027-j*.002,1.690),(s*(.083+.001*j),-.042-j*.002,1.651-j*.002)]
  tube_curve('Swept_temporal_hair',pts,.0019,hair)
# Lip planes have volume and a narrow central closure, no cartoon black outline.
for dz,rr in []:
 pts=[]
 for i in range(13):
  px=(i/12-.5)*.065;pz=1.623+dz+.0014*math.cos(px/.0325*math.pi)
  pts.append((px,front_y(px,pz)-.0018,pz))
 tube_curve('Vermilion_lip',pts,rr,lip)
pts=[(px,front_y(px,1.623)-.003,1.623+.0008*math.cos(px/.031*math.pi)) for px in np.linspace(-.030,.030,13)]
# The closure is in the packed skin texture, with no floating mouth curve.
# Delicate nasolabial fold and lower lid sculpt cues, scaled for close views.
for s in []:
 pts=[]
 for px,pz in [(s*.023,1.655),(s*.033,1.640),(s*.038,1.628)]:pts.append((px,front_y(px,pz)-.0007,pz))
 tube_curve('Face_expression_fold',pts,.0005,skin)

# Raised chased-metal motifs: tapered curls and slotted ribs, designed on the
# cuirass rather than scattered random detail. They remain legible at MOBA scale.
gold=bpy.data.materials['ArmorGold'];dark=bpy.data.materials['ArmorDark']
for s in [-1,1]:
 for row in range(3):
  zc=1.395-row*.055
  pts=[(s*.060,-.235,zc),(s*.090,-.226,zc+.024),(s*.135,-.213,zc+.015),(s*.154,-.204,zc-.006),(s*.136,-.216,zc-.019)]
  tube_curve('Cuirass_chased_cloud',pts,.0026,gold,'spine_03')
 # Tiny rivets and hammer pins convey assembly at the broad outer plate edge.
 for px,pz,py in [(s*.17,1.42,-.190),(s*.215,1.31,-.188),(s*.18,1.17,-.212)]:
  sphere('Cuirass_rivet',(px,py,pz),(.0055,.003,.0055),gold,'spine_03')
 # Embossed inlaid bands on the now round shoulder cap.
 for j in range(3):
  pts=[]
  for i in range(15):
   a=-1.0+i/14*2.0
   pts.append((s*(.25+.167*math.sin(a)),.025-.139*math.cos(a),1.51+j*.018))
  tube_curve('Shoulder_chased_band',pts,.0022,gold,'upperarm_'+('l' if s==1 else 'r'))
# Deliberately fine steel engraving in the blade, parallel to its cutting edge.
W='Halberd_Control';gx=-.28;gy=-.30
for dx in [.025,.040]:
 pts=[(gx+.17+dx,gy-.054,2.74),(gx+.22+dx,gy-.054,2.64),(gx+.215+dx,gy-.054,2.46),(gx+.30+dx,gy-.054,2.32)]
 tube_curve('Blade_forged_flute',pts,.0015,bpy.data.materials['ArmorGold'],W)
# Pack all new maps so a relocated blend can be edited offline.
for im in bpy.data.images:
 if im.has_data:
  try:im.pack()
  except Exception:pass
rig.data.pose_position='POSE';rig.animation_data.action=bpy.data.actions['Idle'];scene.frame_set(0)
if len(rig.animation_data.action.slots):rig.animation_data.action_slot=rig.animation_data.action.slots[0]
scene.frame_start=0;scene.frame_end=200
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'surface.blend'),compress=True)
print('SURFACE_DONE',json.dumps({'meshes':sum(o.type=='MESH' for o in scene.objects),'bones':len(rig.data.bones),'actions':len(bpy.data.actions),'textures':len(list(TEX.glob('*.png'))),'blend':str(OUT/'surface.blend')}),flush=True)
