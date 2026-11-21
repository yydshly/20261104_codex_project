"""MakeHuman CC0 adult topology -> static reference-based adult study.
No animation and no clothing variants in this study.
"""
import bpy, math, gzip, json
from pathlib import Path
from mathutils import Vector, Quaternion
ROOT=Path(__file__).resolve().parent
SRC=ROOT/'hero-source'

def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)

def load_body():
 global RAW_POINTS,POSED_POINTS,NATIVE_SCALE,CONVERT_POINT,PROXY_SCALES
 verts=[];uv=[];faces=[];face_uv=[];group=''
 for line in (SRC/'base.obj').read_text().splitlines():
  fields=line.split()
  if not fields:continue
  if fields[0]=='v':verts.append(Vector(tuple(map(float,fields[1:4]))))
  elif fields[0]=='vt':uv.append(tuple(map(float,fields[1:3])))
  elif fields[0]=='g':group=fields[1]
  elif fields[0]=='f' and group=='body':
   tokens=[s.split('/') for s in fields[1:]]
   faces.append([int(t[0])-1 for t in tokens]);face_uv.append([int(t[1])-1 for t in tokens])
 for filename,amount in [('asian-male-young.target.gz',.88),('caucasian-male-young.target.gz',.12)]:
  for line in gzip.decompress((SRC/filename).read_bytes()).decode().splitlines():
   if not line or line.startswith('#'):continue
   i,*delta=line.split();verts[int(i)]+=Vector(tuple(map(float,delta)))*amount
 for filename,amount in [('head-round',.32),('head-fat-incr',.18),('chin-width-incr',.23),('chin-height-decr',.12),('l-cheek-volume-incr',.25),('r-cheek-volume-incr',.25),('mouth-corner-puller',.12),('mouth-compression',.28),('mouth-scale-vert-decr',.12),('eye-left-opened-up',.60),('eye-right-opened-up',.60),('l-eye-height2-incr',.4),('r-eye-height2-incr',.4)]:
  path=SRC/'targets'/(filename+'.target.gz')
  if not path.is_file():continue
  for line in gzip.decompress(path.read_bytes()).decode().splitlines():
   if not line or line.startswith('#'):continue
   i,*delta=line.split();verts[int(i)]+=Vector(tuple(map(float,delta)))*amount
 groups=json.loads((SRC/'basemesh_vertex_groups.json').read_text())
 rigweights=json.loads((SRC/'weights.game_engine.json').read_text())['weights']
 used=sorted({i for f in faces for i in f});floor=min(verts[i].y for i in used);top=max(verts[i].y for i in used);scale=1.765/(top-floor)
 def convert(p):return Vector((p.x*scale,-p.z*scale,(p.y-floor)*scale+.018))
 RAW_POINTS=verts;NATIVE_SCALE=scale;CONVERT_POINT=convert
 allpoints=[convert(p) for p in verts]
 joints={}
 for name,ranges in groups.items():
  if not name.startswith('joint-'):continue
  ids=[i for a,b in ranges for i in range(a,b+1)]
  joints[name]=sum((allpoints[i] for i in ids),Vector())/len(ids)
 # Retain the adult surface topology and UV. Pose the shoulder/elbow chains
 # into a relaxed stance, avoiding the prior mannequin/fisted hand posture.
 for side,sign in [('l',1),('r',-1)]:
  shoulder=joints['joint-'+side+'-shoulder'];elbow=joints['joint-'+side+'-elbow'];wrist=joints['joint-'+side+'-hand']
  new_elbow=Vector((sign*.238,-.018,1.155));new_wrist=Vector((sign*.273,-.043,.91))
  new_elbow=shoulder+(new_elbow-shoulder).normalized()*(elbow-shoulder).length
  new_wrist=new_elbow+(new_wrist-new_elbow).normalized()*(wrist-elbow).length
  qa=(elbow-shoulder).rotation_difference(new_elbow-shoulder)
  qb=(wrist-elbow).rotation_difference(new_wrist-new_elbow)
  upperweights=dict(rigweights['upperarm_'+side]);lowerweights=dict(rigweights['lowerarm_'+side]);handweights={}
  for name,weights in rigweights.items():
   if name.endswith('_'+side) and any(name.startswith(s) for s in ['hand_','index_','middle_','ring_','pinky_','thumb_']):
    for i,w in weights:handweights[i]=handweights.get(i,0)+w
  for i,p in enumerate(allpoints):
   wu=upperweights.get(i,0);wl=lowerweights.get(i,0)+handweights.get(i,0);arm=min(1,wu+wl)
   if arm<.00001:continue
   upper=shoulder+qa@(p-shoulder)
   lower=new_elbow+qb@(p-elbow)
   allpoints[i]=p*(1-arm)+upper*wu+lower*wl
  joints['joint-'+side+'-elbow']=new_elbow;joints['joint-'+side+'-hand']=new_wrist
 # Bring the default abducted legs into an easy, natural standing width.
 for i,p in enumerate(allpoints):
  if p.z<.95:
   sign=1 if p.x>0 else -1;p.x-=sign*.085*(1-smooth(.08,.95,p.z))
 remap={old:new for new,old in enumerate(used)}
 mesh=bpy.data.meshes.new('Adult_Continuous_Quad_Topology')
 mesh.from_pydata([allpoints[i] for i in used],[],[[remap[i] for i in face] for face in faces]);mesh.update()
 layer=mesh.uv_layers.new(name='MakeHumanUV')
 for polygon,indices in zip(mesh.polygons,face_uv):
  for loop_index,uv_index in zip(polygon.loop_indices,indices):layer.data[loop_index].uv=uv[uv_index]
 body=bpy.data.objects.new('Hero_Adult_Body',mesh);bpy.context.scene.collection.objects.link(body)
 for polygon in mesh.polygons:polygon.use_smooth=True
 for name,ranges in groups.items():
  ids=[remap[i] for a,b in ranges for i in range(a,b+1) if i in remap]
  if ids:vg=body.vertex_groups.new(name=name);vg.add(ids,1,'REPLACE')
 for name,weights in rigweights.items():
  vg=body.vertex_groups.new(name='rig_'+name)
  for i,w in weights:
   if i in remap:vg.add([remap[i]],w,'REPLACE')
 body['source']='MakeHuman/MPFB CC0 basemesh';body['study']='Static pose, no animation approval'
 POSED_POINTS=allpoints
 return body,joints

if __name__=='__main__':
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 body,joints=load_body()
 bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'hero-posed-body.blend'),compress=True)
 (ROOT/'hero-body-joints.json').write_text(json.dumps({k:list(v) for k,v in joints.items()},indent=2))
 print('BODY_READY',len(body.data.vertices),len(body.data.polygons),flush=True)
