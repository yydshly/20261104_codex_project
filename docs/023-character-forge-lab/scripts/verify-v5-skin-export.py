import bpy,importlib.util,json
from pathlib import Path
R=Path(__file__).resolve().parents[1];O=R/'assets/warlord-v5'
bpy.ops.wm.open_mainfile(filepath=str(O/'art.blend'))
spec=importlib.util.spec_from_file_location('v5_material_patch',R/'scripts/patch-warlord-v5-materials.py');p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
print('PROBE_PATCH',json.dumps(p.apply_material_patch(O/'material-probe-textures')),flush=True)
me=bpy.data.meshes.new('SkinMaterialProbe');me.from_pydata([(0,0,0),(1,0,0),(0,1,0)],[],[(0,1,2)]);me.update();ob=bpy.data.objects.new('SkinMaterialProbe',me);bpy.context.scene.collection.objects.link(ob);me.materials.append(bpy.data.materials['HeroSkin']);uv=me.uv_layers.new(name='UVMap')
for lp in me.loops:uv.data[lp.index].uv=[(0,0),(1,0),(0,1)][lp.vertex_index]
bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
path=O/'material-probe.glb';bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=False)
b=path.read_bytes();n=int.from_bytes(b[12:16],'little');g=json.loads(b[20:20+n]);m=next(m for m in g['materials'] if m['name']=='HeroSkin');tex=m['pbrMetallicRoughness'].get('metallicRoughnessTexture');assert tex,'HeroSkin roughness was not exported';im=g['images'][g['textures'][tex['index']]['source']];assert im.get('bufferView') is not None
assert m.get('normalTexture') and m['pbrMetallicRoughness'].get('baseColorTexture')
print('PROBE_EXPORTED',json.dumps({'status':'passed','material':m,'ormImage':im['name'],'embeddedImages':len(g['images'])}),flush=True)
