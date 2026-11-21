"""V5 sculpted art revision, built on the accepted 100-bone runtime blend.
No rig, action timing, cloth hierarchy or weapon-control changes are made.
"""
import bpy, math, json, sys, time
from pathlib import Path
from mathutils import Vector
import numpy as np
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/warlord-v5';TEX=OUT/'art-textures'
OUT.mkdir(parents=True,exist_ok=True);TEX.mkdir(exist_ok=True)
def stage(text):print('V5_STAGE '+text,flush=True)
stage('load accepted 100-bone model')
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'assets/warlord/warlord.blend'))
scene=bpy.context.scene;rig=bpy.data.objects['CrimsonWarlord_Rig'];before_bones=len(rig.data.bones);before_actions={a.name for a in bpy.data.actions}
assert before_bones==100,before_bones
rig.animation_data.action=None;rig.data.pose_position='REST'
for pb in rig.pose.bones:pb.matrix_basis.identity()
bpy.context.view_layer.update()
M={name:bpy.data.materials[name] for name in ['ArmorDark','ArmorIron','ArmorGold','ArmorGoldEdge','Blade','BladeEdge','UnderArmor','ClothRed','ClothRedTrim','HeroSkin']}

def apply(ob,mod):
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=mod.name)
def skin(ob,name,mat,bone,smooth=True,thickness=0,bevel=0):
 ob.name=name;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 ob.data.materials.append(mat)
 if thickness:
  mod=ob.modifiers.new('Forged plate thickness','SOLIDIFY');mod.thickness=thickness;mod.offset=0;apply(ob,mod)
 if bevel:
  mod=ob.modifiers.new('Machined edge bevel','BEVEL');mod.width=bevel;mod.segments=3;apply(ob,mod)
 for p in ob.data.polygons:p.use_smooth=smooth
 if smooth:
  mod=ob.modifiers.new('Balanced corner normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=40
  try:apply(ob,mod)
  except Exception:pass
 vg=ob.vertex_groups.new(name=bone);vg.add(range(len(ob.data.vertices)),1,'REPLACE');mod=ob.modifiers.new('Existing hero skin','ARMATURE');mod.object=rig;ob.parent=rig
 # A deterministic compact unwrap uses the existing PBR maps, without new maps.
 bpy.context.view_layer.objects.active=ob;bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.012);bpy.ops.object.mode_set(mode='OBJECT')
 return ob

def mesh(name,vs,fs,mat,bone,smooth=True,thickness=0,bevel=0):
 me=bpy.data.meshes.new(name+'Mesh');me.from_pydata(vs,[],fs);me.update();ob=bpy.data.objects.new(name,me);scene.collection.objects.link(ob);return skin(ob,name,mat,bone,smooth,thickness,bevel)

def curve(name,pts,r,mat,bone):
 c=bpy.data.curves.new(name+'Curve','CURVE');c.dimensions='3D';c.resolution_u=10;c.bevel_depth=r;c.bevel_resolution=2
 sp=c.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for p,co in zip(sp.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 ob=bpy.data.objects.new(name,c);scene.collection.objects.link(ob);bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH');return skin(bpy.context.object,name,mat,bone)

def rivet(name,pt,rad,mat,bone):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1,location=pt);ob=bpy.context.object;ob.scale=(rad,rad*.6,rad);return skin(ob,name,mat,bone)

def drop(prefixes):
 for ob in list(bpy.data.objects):
  if ob.type=='MESH' and ob.name.startswith(tuple(prefixes)):bpy.data.objects.remove(ob,do_unlink=True)

def catmull(points,samples=8):
 pts=[Vector(p) for p in points];out=[]
 for i in range(len(pts)):
  p0,p1,p2,p3=pts[(i-1)%len(pts)],pts[i],pts[(i+1)%len(pts)],pts[(i+2)%len(pts)]
  for j in range(samples):
   t=j/samples;out.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
 return out

def panel_xz(name,outline,center,y,bulge,mat,bone,thick=.009,edge=True):
 # Authored curved shield with an inset crown, no sphere or cube primitives.
 outline=catmull([(a,0,b) for a,b in outline],6);cx,cz=center;nr=8;nc=len(outline);vs=[(cx,y-bulge,cz)];fs=[]
 if sum(outline[i].x*outline[(i+1)%nc].z-outline[(i+1)%nc].x*outline[i].z for i in range(nc))<0:outline.reverse()
 for ring in range(1,nr+1):
  t=ring/nr
  for p in outline:vs.append((cx+(p.x-cx)*t,y-bulge*(1-t*t),cz+(p.z-cz)*t))
 for i in range(nc):fs.append((0,1+i,1+(i+1)%nc))
 for ring in range(nr-1):
  a=1+ring*nc;b=a+nc
  for i in range(nc):j=(i+1)%nc;fs.append((a+i,b+i,b+j,a+j))
 ob=mesh(name,vs,fs,mat,bone,True,thick,.002)
 if edge:curve(name+'_gilded_seam',[(p.x,y-.001,p.z) for p in outline]+[(outline[0].x,y-.001,outline[0].z)],.0023,M['ArmorGoldEdge'],bone)
 return ob

stage('sculpt adult brow cheek jaw neck; repaint existing skin images')
body=next(o for o in scene.objects if o.type=='MESH' and o.name.startswith('SuperHero_Male'))
# Sculpt local mesh coordinates, keeping all existing weights and UV seams.
# The deformation is deliberately anatomical: a wider mandibular angle,
# firmer malar ridge, thicker nasal base and a heavier supraorbital arch.
def gauss(a,c,w):return math.exp(-((a-c)/w)**2)
face_changes=0
for vtx in body.data.vertices:
 co=vtx.co;x,y,z=co.x,co.y,co.z
 if z>1.55:
  front=gauss(y,-.073,.064)
  jaw=gauss(z,1.598,.034)*gauss(abs(x),.062,.041)
  cheek=gauss(z,1.665,.021)*gauss(abs(x),.067,.025)
  brow=gauss(z,1.716,.014)*gauss(abs(x),.035,.031)
  nose=gauss(z,1.654,.016)*gauss(abs(x),.017,.017)
  bridge=gauss(z,1.679,.032)*gauss(x,0,.014)
  co.x+=math.copysign(.0058*jaw+.0038*cheek+.0022*nose,x)
  co.y-=front*(.0038*brow+.0030*cheek+.0022*bridge)
  co.z-=.0055*gauss(z,1.573,.021)*gauss(x,0,.056)
  face_changes+=1
 elif 1.46<z<1.59:
  co.x*=1+.055*gauss(z,1.535,.050)
# Move the color boundary below the collar, removing the saw-tooth neck edge.
skin_i=next(i for i,m in enumerate(body.data.materials) if m and m.name=='HeroSkin')
for p in body.data.polygons:
 co=sum((body.data.vertices[i].co for i in p.vertices),Vector())/len(p.vertices)
 if co.z>1.46 and abs(co.x)<.22:p.material_index=skin_i
uv=body.data.uv_layers.active
for loop in body.data.loops:
 co=body.data.vertices[loop.vertex_index].co
 if co.z>1.44:uv.data[loop.index].uv=((math.atan2(co.x,-co.y)/math.tau+.5)%1,max(0,min(1,(co.z-1.42)/.45)))
for p in body.data.polygons:p.use_smooth=True
# Repaint, do not increase the material/texture count.
N=1024;u,v=np.meshgrid(np.arange(N,dtype=np.float32)/N,np.arange(N,dtype=np.float32)/N);rng=np.random.default_rng(50217)
noise=rng.normal(0,1,(N,N)).astype(np.float32);z=1.42+v*.45;theta=(u-.5)*math.tau;x=np.sin(theta)*.111;front=np.maximum(0,np.cos(theta))**5
base=np.zeros((N,N,3),dtype=np.float32)+np.array([.565,.337,.235])
cheek=np.exp(-((abs(x)-.060)/.024)**2-((z-1.662)/.025)**2)*front
socket=np.exp(-((abs(x)-.036)/.022)**2-((z-1.704)/.015)**2)*front
jawshadow=np.exp(-((z-1.599)/.031)**2)*front
base+=cheek[:,:,None]*np.array([.031,.003,-.002]);base-=socket[:,:,None]*np.array([.041,.031,.022]);base-=jawshadow[:,:,None]*np.array([.024,.017,.010])
base+=noise[:,:,None]*.0022
lip=np.exp(-(x/.031)**8-((z-1.621)/.0038)**2)*front
closure=np.exp(-(x/.029)**8-((z-(1.622+.0005*np.cos(x/.03*math.pi)))/.0007)**2)*front
base=base*(1-.23*lip[:,:,None])+np.array([.35,.145,.11])*.23*lip[:,:,None];base-=closure[:,:,None]*np.array([.14,.075,.045])
furrow=np.exp(-((abs(x)-.010)/.003)**2-((z-1.727)/.013)**2)*front;base-=furrow[:,:,None]*np.array([.009,.006,.004])

def replace_image(name,arr,noncolor=False):
 im=bpy.data.images.get(name)
 if im is None:raise RuntimeError('Existing image missing '+name)
 if im.size[0]!=N or im.size[1]!=N:im.scale(N,N)
 im.colorspace_settings.name='Non-Color' if noncolor else 'sRGB'
 arr=np.asarray(arr,dtype=np.float32)
 if arr.ndim==2:arr=np.repeat(arr[:,:,None],3,axis=2)
 rgba=np.ones((N,N,4),dtype=np.float32);rgba[:,:,:3]=np.clip(arr,0,1);im.pixels.foreach_set(rgba.ravel());im.filepath_raw=str(TEX/(name+'.png'));im.file_format='PNG';im.save();im.pack()
replace_image('HeroSkin_Albedo',base)
replace_image('HeroSkin_Roughness',np.clip(.52+noise*.007-socket*.025,.40,.65),True)
# glTF does not reliably recognize a color-to-scalar Roughness link. Repack
# the existing grayscale image in place and use explicit G/B channel links.
import importlib.util
patch_spec=importlib.util.spec_from_file_location('v5_material_patch',ROOT/'scripts/patch-warlord-v5-materials.py')
patch_module=importlib.util.module_from_spec(patch_spec);patch_spec.loader.exec_module(patch_module)
patch_module.apply_material_patch(TEX)
# Pores are subpixel microstructure rather than paint-like bumps.
gy,gx=np.gradient(noise*.00006*N);normal=np.dstack((-gx,-gy,np.ones_like(gx)));normal/=np.linalg.norm(normal,axis=2)[:,:,None];replace_image('HeroSkin_Normal',normal*.5+.5,True)
# A calm narrow eye; retain the existing iris-in-eye surface and binding.
for ob in scene.objects:
 if ob.type=='MESH' and ob.name.startswith('Eyebrows'):
  for vtx in ob.data.vertices:vtx.co.y-=.006
 if ob.type=='MESH' and ob.name.startswith('HeroEye_'):
  for vtx in ob.data.vertices:vtx.co.z=1.6985+(vtx.co.z-1.6985)*.88
 if ob.type=='MESH' and ob.name.startswith('UpperLid'):
  for vtx in ob.data.vertices:vtx.co.z=1.6985+(vtx.co.z-1.6985)*.88
stage('replace primitive pauldrons with layered crown plates and beast relief')
drop(['Pauldron_','Shoulder_chased_band','Knee_guard','Knee_iron','Greave_','Boot_','Sabatons_','Ankle_trim_'])
for side,sg in [('l',1),('r',-1)]:
 bone='upperarm_'+side;cx=sg*.285;cy=.025
 # Six authored corners make a winged, pointed footprint. Its crown is swept
 # down toward the outer arm, with the metal edge following the silhouette.
 outline=catmull([(sg*.15,-.105,1.495),(sg*.31,-.150,1.490),(sg*.52,-.010,1.395),(sg*.42,.155,1.435),(sg*.20,.160,1.495),(sg*.135,.025,1.505)],7)
 nr=9;nc=len(outline);vs=[(cx,cy,1.594)];fs=[]
 for ring in range(1,nr+1):
  t=ring/nr
  for p in outline:vs.append((cx+(p.x-cx)*t,cy+(p.y-cy)*t,1.594*(1-t)+p.z*t+.040*math.sin(t*math.pi)))
 for i in range(nc):fs.append((0,1+i,1+(i+1)%nc))
 for ring in range(nr-1):
  a=1+ring*nc;b=a+nc
  for i in range(nc):j=(i+1)%nc;fs.append((a+i,b+i,b+j,a+j))
 if sg<0:fs=[tuple(reversed(face)) for face in fs]
 mesh('V5_Pauldron_crown_'+side,vs,fs,M['ArmorDark'],bone,True,.011,.0028)
 curve('V5_Pauldron_bound_edge_'+side,[tuple(p) for p in outline]+[tuple(outline[0])],.0036,M['ArmorGoldEdge'],bone)
 # A recessed middle crest and two staggered, downward-sliding lames.
 for j in range(2):
  shift=j*.045
  out=[(sg*.22,1.485-shift),(sg*.37,1.463-shift),(sg*.455,1.390-shift),(sg*.38,1.330-shift),(sg*.265,1.365-shift)]
  panel_xz('V5_Pauldron_lame_'+side+str(j),out,(sg*.335,1.410-shift),-.120+j*.012,.027,M['ArmorIron'] if j else M['ArmorDark'],bone,.008)
 # Taotie-like original embossed mask: narrow horn brows, recessed eyes,
 # a stepped central bridge and mirrored curved jaw. No spherical lion head.
 mc=sg*.293;my=-.166;mz=1.503
 panel_xz('V5_Beast_inset_plate_'+side,[(mc-.060,mz+.040),(mc,mz+.052),(mc+.060,mz+.040),(mc+.064,mz-.028),(mc,mz-.074),(mc-.064,mz-.028)],(mc,mz-.010),my+.006,.018,M['ArmorIron'],bone,.006,False)
 for flip in [-1,1]:
  curve('V5_Beast_brow_'+side+str(flip),[(mc+flip*.063,my+.014,mz+.032),(mc+flip*.034,my-.009,mz+.026),(mc+flip*.012,my-.012,mz+.009)],.0040,M['ArmorGold'],bone)
  eye=[(mc+flip*.047,mz+.013),(mc+flip*.017,mz+.002),(mc+flip*.043,mz-.006)]
  panel_xz('V5_Beast_eye_'+side+str(flip),eye,(mc+flip*.034,mz+.003),my-.011,.0015,M['ArmorGoldEdge'],bone,.002,False)
  curve('V5_Beast_cheek_'+side+str(flip),[(mc+flip*.057,my+.005,mz-.012),(mc+flip*.063,my+.008,mz-.040),(mc+flip*.031,my-.014,mz-.062),(mc+flip*.017,my-.018,mz-.045)],.0030,M['ArmorGold'],bone)
 panel_xz('V5_Beast_nose_'+side,[(mc,mz+.017),(mc+.013,mz-.019),(mc,mz-.042),(mc-.013,mz-.019)],(mc,mz-.012),my-.020,.006,M['ArmorIron'],bone,.006,False)
 for rx,ry,rz in [(sg*.19,-.090,1.493),(sg*.425,.058,1.443),(sg*.25,.136,1.497)]:rivet('V5_Pauldron_pin',(rx,ry,rz),.0042,M['ArmorGoldEdge'],bone)
stage('replace spherical knees, cylinder greaves and block boots')
for side,sg in [('l',1),('r',-1)]:
 cx=sg*.114;calf='calf_'+side;foot='foot_'+side
 out=[(cx-.065,.588),(cx,.650),(cx+.065,.588),(cx+.054,.521),(cx,.440),(cx-.054,.521)]
 panel_xz('V5_Poleyn_'+side,out,(cx,.553),-.087,.055,M['ArmorDark'],calf,.010)
 curve('V5_Poleyn_ridge_'+side,[(cx,-.147,.614),(cx,-.153,.559),(cx,-.109,.473)],.0036,M['ArmorGold'],calf)
 for sign in [-1,1]:curve('V5_Poleyn_inlay_'+side,[(cx+sign*.043,-.107,.585),(cx+sign*.023,-.143,.556),(cx+sign*.034,-.115,.523)],.0021,M['ArmorIron'],calf)
 out=[(cx-.061,.492),(cx+.060,.492),(cx+.048,.210),(cx+.026,.153),(cx-.035,.156),(cx-.052,.245)]
 panel_xz('V5_Anatomical_greave_'+side,out,(cx,.334),-.066,.043,M['ArmorIron'],calf,.010)
 curve('V5_Greave_spine_'+side,[(cx,-.100,.462),(cx,-.113,.335),(cx,-.078,.183)],.0027,M['ArmorGold'],calf)
 # Segmented sabaton shells. Each transverse arch has a separate overlap;
 # the toe tapers rather than ending in the old rectangular block.
 # A complete dark leather inner boot closes the sole and toe under the
 # articulated metal lames, avoiding a row of hollow floating arches.
 vs=[];fs=[];nx=19;ny=12
 for k in range(ny):
  t=k/(ny-1);yy=.120-t*.337;hh=.104*(1-t)+.044*t
  width=.063+.018*math.exp(-((yy+.045)/.10)**2)-.013*max(0,(-yy-.12)/.10)
  for i in range(nx):
   a=i/(nx-1)*math.pi;vs.append((cx+math.cos(a)*width,yy,.009+math.sin(a)*hh))
  vs.extend([(cx-width,yy,.008),(cx+width,yy,.008)])
 stride=nx+2
 for k in range(ny-1):
  for i in range(stride):a=k*stride+i;b=k*stride+(i+1)%stride;fs.append((a,b,b+stride,a+stride))
 fs.append(tuple(range(stride-1,-1,-1)));fs.append(tuple((ny-1)*stride+i for i in range(stride)))
 mesh('V5_Fitted_leather_boot_'+side,vs,fs,M['UnderArmor'],foot,True,0,.0015)
 sections=[(.108,.055,.105),(.052,-.009,.110),(-.008,-.072,.092),(-.071,-.133,.074),(-.132,-.205,.055)]
 for j,(back,fronty,h) in enumerate(sections):
  vs=[];fs=[];nx=17;ny=5
  for k in range(ny):
   t=k/(ny-1);yy=back+(fronty-back)*t
   width=.070+.018*math.exp(-((yy+.050)/.09)**2)-.019*max(0,(-yy-.12)/.09)
   for i in range(nx):
    a=i/(nx-1)*math.pi;vs.append((cx+math.cos(a)*width,yy,.018+math.sin(a)*(h-.018)+.006*(1-t)))
  for k in range(ny-1):
   for i in range(nx-1):a=k*nx+i;fs.append((a,a+1,a+nx+1,a+nx))
  mesh('V5_Sabaton_segment_'+side+str(j),vs,fs,M['ArmorDark'] if j%2 else M['ArmorIron'],foot,True,.006,.0018)
  curve('V5_Sabaton_seam_'+side+str(j),[(cx+math.cos(i/16*math.pi)*(.070+.018*math.exp(-((fronty+.05)/.09)**2)-.019*max(0,(-fronty-.12)/.09)),fronty-.001,.020+math.sin(i/16*math.pi)*(h-.018)) for i in range(17)],.0018,M['ArmorGold'],foot)
 # A restrained heel spur echoes the pointed shoulder language.
 panel_xz('V5_Ankle_flare_'+side,[(cx-.055,.167),(cx,.194),(cx+.055,.167),(cx+.044,.106),(cx-.044,.106)],(cx,.149),.058,.012,M['ArmorDark'],foot,.007)
stage('flatten forged halberd faces and model thin cutting bevels')
drop(['Halberd_crescent','Halberd_counterhook','Halberd_spearhead','Spearhead_spine','Blade_forged_flute'])
W='Halberd_Control';gx=-.28;gy=-.30
# Real plate cross section: broad plane, bevel strip, thin cutting ridge.
def blade(name,outline,depth=.026):
 pts=[Vector(p) for p in outline];center=sum(pts,Vector())/len(pts);inside=[center+(p-center)*.88 for p in pts];n=len(pts);vs=[]
 for yy,ring in [(gy-depth*.5,inside),(gy,pts),(gy+depth*.5,inside)]:
  for p in ring:vs.append((p.x,yy,p.z))
 fs=[tuple(range(n-1,-1,-1)),tuple(range(2*n,3*n))];ids=[0,0]
 for i in range(n):j=(i+1)%n;fs.extend([(i,j,n+j,n+i),(n+i,n+j,2*n+j,2*n+i)]);ids.extend([1,1])
 ob=mesh(name,vs,fs,M['Blade'],W,False,0,0);ob.data.materials.append(M['BladeEdge'])
 for p,idx in zip(ob.data.polygons,ids):p.material_index=idx
 mod=ob.modifiers.new('Cutting ridge polish','BEVEL');mod.width=.0007;mod.segments=2;mod.material=1;apply(ob,mod)
 return ob
blade('V5_Halberd_crescent',[(gx+.02,0,2.58),(gx+.16,0,2.80),(gx+.40,0,2.88),(gx+.30,0,2.65),(gx+.29,0,2.40),(gx+.42,0,2.18),(gx+.18,0,2.27),(gx+.035,0,2.48)],.027)
blade('V5_Halberd_counterhook',[(gx-.02,0,2.57),(gx-.22,0,2.69),(gx-.30,0,2.54),(gx-.22,0,2.56),(gx-.10,0,2.43)],.022)
blade('V5_Halberd_spear',[(gx,0,2.99),(gx+.065,0,2.73),(gx+.035,0,2.54),(gx-.035,0,2.54),(gx-.065,0,2.73)],.022)
# Fine blade spine, not a round tube lying along the cutting edge.
curve('V5_Halberd_spine',[(gx,gy-.014,2.59),(gx,gy-.014,2.89)],.0020,M['ArmorGoldEdge'],W)
# Existing image maps are repainted to a restrained linear forged finish.
brushed=np.sin(v*math.tau*192)*.0015+rng.normal(0,.0008,(N,N));normal=np.dstack((brushed,np.zeros_like(brushed),np.ones_like(brushed)));normal/=np.linalg.norm(normal,axis=2)[:,:,None]
for name in ['Blade','BladeEdge']:
 col=np.array([.43,.50,.57] if name=='Blade' else [.72,.77,.82])
 lineargrain=np.sin(v*math.tau*192)*.002+rng.normal(0,.0005,(N,N))
 replace_image(name+'_Albedo',col[None,None,:]*(1+lineargrain[:,:,None]))
 replace_image(name+'_Normal',normal*.5+.5,True)
 orm=np.ones((N,N,3),dtype=np.float32);orm[:,:,1]=(.24 if name=='Blade' else .16)+np.sin(v*math.tau*31)*.004;orm[:,:,2]=.98;replace_image(name+'_ORM',orm,True)
for material in bpy.data.materials:
 if material.name in ['ArmorDark','ArmorIron','ArmorGold','ArmorGoldEdge']:
  for node in material.node_tree.nodes:
   if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.055
# Dark red inset reads as cut stone, not a flat glowing toy button.
if 'EmberInlay' in bpy.data.materials:
 bs=bpy.data.materials['EmberInlay'].node_tree.nodes.get('Principled BSDF')
 if bs:
  bs.inputs['Base Color'].default_value=(.20,.008,.017,1);bs.inputs['Metallic'].default_value=.25;bs.inputs['Roughness'].default_value=.22;bs.inputs['Emission Strength'].default_value=.18
stage('save frozen art blend; preserve 100 bones 13 actions and cloth data')
assert len(rig.data.bones)==before_bones and {a.name for a in bpy.data.actions}==before_actions
rig.data.pose_position='POSE';rig.animation_data.action=bpy.data.actions['Idle']
if rig.animation_data.action.slots:rig.animation_data.action_slot=rig.animation_data.action.slots[0]
scene.frame_set(0);bpy.context.view_layer.update()
for im in bpy.data.images:
 if im.has_data:
  try:im.pack()
  except Exception:pass
scene.frame_start=0;scene.frame_end=200
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'art.blend'),compress=True)
summary={'stage':'art-v5','status':'ready','bones':len(rig.data.bones),'actions':len(bpy.data.actions),'images':len(bpy.data.images),'meshes':sum(o.type=='MESH' for o in scene.objects),'faceVerticesSculpted':face_changes,'output':str(OUT/'art.blend')}
(OUT/'art-report.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8');print('V5_ART_DONE '+json.dumps(summary),flush=True)
