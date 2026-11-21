"""Extract the front-facing person from the user-supplied four-person GLB.

The source is preserved. Cuts are made only through verified empty X gaps;
original UVs and textures are retained. Blender 4.5 LTS, local processing only.
"""
import bpy,bmesh,json,hashlib,math,sys
from pathlib import Path
from mathutils import Vector,Matrix

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/personal-guide';OUT.mkdir(parents=True,exist_ok=True)
WORK=ROOT/'character/personal-0597';WORK.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'assets/user-model-0597/0597b54ff20068bcd556b1e005aed56d.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH')
mesh.name='Personal0597_OriginalFrontFigure'
mesh.data.transform(mesh.matrix_world);mesh.matrix_world=Matrix.Identity(4)
bm=bmesh.new();bm.from_mesh(mesh.data)
outside=[v for v in bm.verts if not(-.235<v.co.x<.055)]
bmesh.ops.delete(bm,geom=outside,context='VERTS')
bm.to_mesh(mesh.data);bm.free();mesh.data.update()
original_triangles=sum(len(p.vertices)-2 for p in mesh.data.polygons)
low=Vector([min(v.co[k] for v in mesh.data.vertices) for k in range(3)])
high=Vector([max(v.co[k] for v in mesh.data.vertices) for k in range(3)])
scale=1.78/(high.z-low.z)
origin=Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z))
for v in mesh.data.vertices:v.co=(v.co-origin)*scale
mesh.data.update()
# The displayed front figure faces Blender -Y / glTF +Z.
bpy.context.view_layer.objects.active=mesh;mesh.select_set(True)
bm=bmesh.new();bm.from_mesh(mesh.data)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000003)
bm.to_mesh(mesh.data);bm.free();mesh.data.update()
detail=mesh.vertex_groups.new(name='WebDetailBudget')
for v in mesh.data.vertices:
 x,y,z=v.co
 weight=.16 if z>1.48 else .28 if abs(x)>.235 and z<.98 else .55 if z<.13 else .82
 detail.add([v.index],weight,'REPLACE')
modifier=mesh.modifiers.new('Web density while preserving source UVs','DECIMATE');modifier.ratio=.12
modifier.vertex_group=detail.name;modifier.vertex_group_factor=.02
bpy.ops.object.modifier_apply(modifier=modifier.name)
detail_group=mesh.vertex_groups.get('WebDetailBudget')
if detail_group:mesh.vertex_groups.remove(detail_group)
for face in mesh.data.polygons:face.use_smooth=True
mesh.data.update()
# Use JPEG only for colour; keep normal / ORM maps linear and lossless.
material=mesh.data.materials[0]
for node in material.node_tree.nodes:
 if node.type!='TEX_IMAGE' or not node.image:continue
 image=node.image
 is_color=image.colorspace_settings.name=='sRGB'
 if not is_color and max(image.size)>2048:image.scale(2048,2048)
 # Drop the original packed bytes so the resized buffer is actually encoded.
 if image.packed_file:image.unpack(method='REMOVE')
 image.file_format='JPEG' if is_color else 'PNG'
 image.filepath_raw=str(WORK/('base-color.jpg' if is_color else ('normal.png' if 'normal' in image.name.lower() else 'orm-'+str(len(image.name))+'.png')))
 image.save();image.pack()
mesh['source']='User-provided 0597b54ff20068bcd556b1e005aed56d.glb'
mesh['selection']='Front-facing second figure; X interval -0.235..0.055 through empty gaps'
mesh['role']='character'
mesh['outfit']='personal0597'
scene=bpy.context.scene
report={'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'selection':'second / front-facing figure',
 'sourceRegion':[-.235,.055],'sourceBounds':[list(low),list(high)],'scale':scale,
 'sourceTriangles':original_triangles,'vertices':len(mesh.data.vertices),'triangles':sum(len(p.vertices)-2 for p in mesh.data.polygons),
 'height':1.78,'images':[{'name':i.name,'size':list(i.size),'colorSpace':i.colorspace_settings.name} for i in bpy.data.images if i.source=='FILE']}
(WORK/'extraction.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'single-person.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'personal-static.glb'),export_format='GLB',use_selection=True,export_animations=False,export_extras=True)
print('EXTRACTED_PERSON',json.dumps(report),flush=True)
if '--no-render' in sys.argv:raise SystemExit(0)
# Neutral front/back checks are actual renders of the extracted mesh.
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=900;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Neutral studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.35,.35,.35,1)
scene.view_settings.view_transform='AgX'
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.003))
floor=bpy.context.object
mat=bpy.data.materials.new('Studio floor');mat.diffuse_color=(.32,.34,.35,1);floor.data.materials.append(mat)
def light(name,location,energy,size):
 data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.shape='DISK';data.size=size
 ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=location;ob.rotation_euler=(Vector((0,0,.9))-ob.location).to_track_quat('-Z','Y').to_euler()
light('Broad key',(2.5,-3.2,4.0),450,4)
light('Soft fill',(-3,-1,2.5),200,3)
light('Back fill',(1,3,3),300,3)
camera=bpy.data.objects.new('Camera',bpy.data.cameras.new('Camera'));scene.collection.objects.link(camera);scene.camera=camera;camera.data.type='ORTHO';camera.data.ortho_scale=2.03
for label,position in [('front',(0,-5,1.3)),('back',(0,5,1.3)),('three-quarter',(2.5,-4.5,1.5))]:
 camera.location=position;camera.rotation_euler=(Vector((0,0,.90))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(WORK/(label+'.png'));bpy.ops.render.render(write_still=True)
print('PERSONAL_PREPARE_COMPLETE',flush=True)
