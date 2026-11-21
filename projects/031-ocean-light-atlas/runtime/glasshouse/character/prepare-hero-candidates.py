"""Inspect and prepare explicitly labelled, licensed finished-character candidates.

These are quality comparisons, not likeness-matched replacements for the prototype.
Source: Microsoft/Rocketbox, MIT. No animation is played or authored here.
"""
import bpy, json, hashlib
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets' / 'hero-candidates' / 'rocketbox'
report = []
exports = []
for avatar in ['Male_Adult_10', 'Male_Adult_17']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=str(SOURCE / avatar / 'Export' / f'{avatar}.fbx'))
    report.append({
        'id': avatar,
        'objects': [{'name': o.name, 'type': o.type, 'vertices': len(o.data.vertices) if o.type == 'MESH' else None,
                     'materials': [m.name for m in o.data.materials] if o.type == 'MESH' else []}
                    for o in bpy.data.objects],
        'materials': [{'name': m.name, 'nodes': [{'type': n.type, 'image': n.image.filepath if n.type == 'TEX_IMAGE' and n.image else None} for n in m.node_tree.nodes] if m.use_nodes else []} for m in bpy.data.materials],
        'armatures': [{'name': o.name, 'bones': [{'name': b.name, 'head': list(b.head), 'tail': list(b.tail)} for b in o.pose.bones]} for o in bpy.data.objects if o.type == 'ARMATURE'],
    })
    # Relink the author's textures; FBX stores workstation-relative paths.
    for material in bpy.data.materials:
        prefix = material.name
        color_file = SOURCE / avatar / 'Textures' / f'{prefix}_color.tga'
        if not color_file.exists():
            raise RuntimeError(f'Missing licensed source color map: {prefix}')
        material.use_nodes = True
        nodes = material.node_tree.nodes
        nodes.clear()
        output = nodes.new('ShaderNodeOutputMaterial')
        shader = nodes.new('ShaderNodeBsdfPrincipled')
        material.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
        shader.inputs['Roughness'].default_value = .63 if 'head' in prefix else .86
        shader.inputs['Metallic'].default_value = 0
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = bpy.data.images.load(str(color_file), check_existing=False)
        material.node_tree.links.new(tex.outputs['Color'], shader.inputs['Base Color'])
        if 'opacity' in prefix:
            material.node_tree.links.new(tex.outputs['Alpha'], shader.inputs['Alpha'])
            material.surface_render_method = 'DITHERED'
            material.use_backface_culling = False
        normal_file = SOURCE / avatar / 'Textures' / f'{prefix}_normal.tga'
        if normal_file.exists():
            normal_tex = nodes.new('ShaderNodeTexImage')
            normal_tex.image = bpy.data.images.load(str(normal_file), check_existing=False)
            normal_tex.image.colorspace_settings.name = 'Non-Color'
            normal = nodes.new('ShaderNodeNormalMap')
            normal.inputs['Strength'].default_value = .65
            material.node_tree.links.new(normal_tex.outputs['Color'], normal.inputs['Color'])
            material.node_tree.links.new(normal.outputs['Normal'], shader.inputs['Normal'])

    # One relaxed still pose using the finished asset's actual author rig.
    armature = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    for side, sign in [('L', 1), ('R', -1)]:
        upper = armature.pose.bones[f'Bip01 {side} UpperArm']
        forearm = armature.pose.bones[f'Bip01 {side} Forearm']
        direction = (forearm.head - upper.head).normalized()
        destination = Vector((.025, sign*.16, -.987)).normalized()
        rotation = direction.rotation_difference(destination).to_matrix().to_4x4()
        pivot = upper.head.copy()
        upper.matrix = Matrix.Translation(pivot) @ rotation @ Matrix.Translation(-pivot) @ upper.matrix
        bpy.context.view_layer.update()

    # Normalize the complete posed asset while retaining the licensed rig.
    depsgraph = bpy.context.evaluated_depsgraph_get()
    coordinates = []
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        evaluated = obj.evaluated_get(depsgraph)
        coordinates.extend(evaluated.matrix_world @ v.co for v in evaluated.data.vertices)
    bottom = min(v.z for v in coordinates)
    height = max(v.z for v in coordinates) - bottom
    scale = 1.78 / height
    wrapper = bpy.data.objects.new('Finished character source comparison', None)
    bpy.context.collection.objects.link(wrapper)
    roots = [o for o in bpy.context.scene.objects if o != wrapper and o.parent is None]
    for obj in roots:
        obj.parent = wrapper
    wrapper.scale = (scale, scale, scale)
    wrapper.location.z = -bottom * scale
    # Preserve authored orientation initially; browser inspection verifies facing.
    wrapper['source'] = 'Microsoft/Rocketbox, MIT licensed finished character'
    wrapper['prototype_likeness'] = 'Not adapted. Candidate comparison only.'
    out = SOURCE.parent / f'{avatar.lower()}.glb'
    kwargs = dict(filepath=str(out), export_format='GLB', export_animations=False, export_yup=True, export_extras=True)
    if 'export_rest_position_armature' in bpy.ops.export_scene.gltf.get_rna_type().properties:
        kwargs['export_rest_position_armature'] = False
    bpy.ops.export_scene.gltf(**kwargs)
    exports.append({'id': avatar, 'file': out.name, 'bytes': out.stat().st_size,
                    'sha256': hashlib.sha256(out.read_bytes()).hexdigest(), 'bones': len(armature.data.bones),
                    'staticPose': 'arms relaxed using author rig', 'animations': 0,
                    'license': 'MIT', 'source': 'https://github.com/microsoft/Microsoft-Rocketbox',
                    'processing': 'Author diffuse/normal maps relinked; fixed roughness approximation. Not likeness-matched or original-outfit matched.'})
    bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE / f'{avatar}-comparison.blend'))
(SOURCE / 'blender-source-inspection.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
(SOURCE.parent / 'prepared-candidates.json').write_text(json.dumps(exports, indent=2), encoding='utf-8')
print('CANDIDATE_INSPECTION_COMPLETE')
