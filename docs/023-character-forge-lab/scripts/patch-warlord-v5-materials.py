"""Material-only glTF interoperability repair for the accepted V5 hero.

Run after motion input has been frozen:
 blender --background --python scripts/patch-warlord-v5-materials.py --
   --input assets/warlord-v5/animated-final.blend
   --output assets/warlord-v5/material-final.blend

The existing skin grayscale image is repacked in place as glTF ORM. No mesh,
rig, action, cloth or pose changes are performed. All maps stay embedded.
"""
import bpy, json, hashlib, array, argparse, sys
from pathlib import Path
import numpy as np

def stage(text):print('V5_MATERIAL_STAGE '+text,flush=True)

def frozen_contract():
    """Hash actual geometry and animation data around this narrow mutation."""
    geom=hashlib.sha256();anim=hashlib.sha256()
    for ob in sorted((o for o in bpy.data.objects if o.type=='MESH'),key=lambda o:o.name):
        geom.update(ob.name.encode());geom.update(str(tuple(ob.matrix_local)).encode())
        values=array.array('f',[0.0])*(len(ob.data.vertices)*3);ob.data.vertices.foreach_get('co',values);geom.update(values.tobytes())
        indices=array.array('i',[0])*len(ob.data.loops);ob.data.loops.foreach_get('vertex_index',indices);geom.update(indices.tobytes())
        for uv in ob.data.uv_layers:
            values=array.array('f',[0.0])*(len(uv.data)*2);uv.data.foreach_get('uv',values);geom.update(values.tobytes())
        for v in ob.data.vertices:
            for group in v.groups:geom.update(f'{v.index},{group.group},{group.weight:.9g};'.encode())
    for rig in sorted((o for o in bpy.data.objects if o.type=='ARMATURE'),key=lambda o:o.name):
        geom.update(rig.name.encode())
        for bone in rig.data.bones:geom.update((bone.name+str(tuple(bone.matrix_local))).encode())
    for action in sorted(bpy.data.actions,key=lambda a:a.name):
        anim.update(action.name.encode())
        curves=[]
        if hasattr(action,'layers'):
            for layer in action.layers:
                for strip in layer.strips:
                    if hasattr(strip,'channelbags'):
                        for bag in strip.channelbags:curves.extend(bag.fcurves)
        if not curves and hasattr(action,'fcurves'):curves=list(action.fcurves)
        for fc in sorted(curves,key=lambda c:(c.data_path,c.array_index)):
            anim.update(f'{fc.data_path}:{fc.array_index}'.encode())
            values=array.array('f',[0.0])*(len(fc.keyframe_points)*2);fc.keyframe_points.foreach_get('co',values);anim.update(values.tobytes())
            for k in fc.keyframe_points:anim.update((k.interpolation+str(tuple(k.handle_left))+str(tuple(k.handle_right))).encode())
    return {'geometry':geom.hexdigest(),'animation':anim.hexdigest(),'meshes':sum(o.type=='MESH' for o in bpy.data.objects),'bones':sum(len(o.data.bones) for o in bpy.data.objects if o.type=='ARMATURE'),'actions':len(bpy.data.actions)}

def apply_material_patch(texture_folder=None):
    mat=bpy.data.materials['HeroSkin'];nodes=mat.node_tree.nodes;links=mat.node_tree.links
    bs=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    texture=next((n for n in nodes if n.type=='TEX_IMAGE' and n.image and n.image.name in ['HeroSkin_Roughness','HeroSkin_ORM']),None)
    if texture is None:raise RuntimeError('Existing HeroSkin roughness/ORM image not found')
    im=texture.image;count=len(bpy.data.images);w,h=im.size
    if min(w,h)<256:raise RuntimeError('Skin texture unexpectedly small')
    rgba=np.empty(w*h*4,dtype=np.float32);im.pixels.foreach_get(rgba);rgba=rgba.reshape(h,w,4)
    rough=rgba[:,:,1].copy() if im.name=='HeroSkin_ORM' else rgba[:,:,0].copy()
    if not np.isfinite(rough).all() or rough.max()<.1:raise RuntimeError('Invalid skin roughness pixel values')
    out=np.ones((h,w,4),dtype=np.float32);out[:,:,1]=rough;out[:,:,2]=0
    im.name='HeroSkin_ORM'
    # Setting data color space must precede writing pixels, since changing it
    # can reset a generated image buffer in Blender.
    im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(out.ravel())
    if texture_folder is not None:
        folder=Path(texture_folder);folder.mkdir(parents=True,exist_ok=True)
        im.filepath_raw=str(folder/'HeroSkin_ORM.png');im.file_format='PNG';im.save()
    im.pack()
    sep=nodes.get('HeroSkin ORM Channels') or nodes.new('ShaderNodeSeparateColor');sep.name='HeroSkin ORM Channels';sep.label='glTF ORM: G roughness / B metallic';sep.mode='RGB'
    for target in [bs.inputs['Roughness'],bs.inputs['Metallic'],sep.inputs['Color']]:
        for link in list(target.links):links.remove(link)
    links.new(texture.outputs['Color'],sep.inputs['Color']);links.new(sep.outputs['Green'],bs.inputs['Roughness']);links.new(sep.outputs['Blue'],bs.inputs['Metallic'])
    bs.inputs['Metallic'].default_value=0
    assert len(bpy.data.images)==count,'Image count changed'
    return {'material':'HeroSkin','image':im.name,'size':[w,h],'imageCountUnchanged':True,'roughnessMin':float(rough.min()),'roughnessMax':float(rough.max()),'roughnessMean':float(rough.mean()),'channelContract':'R=1, G=existing skin roughness, B=0 metallic','nodeContract':'image Color -> Separate Color -> Green Roughness + Blue Metallic'}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--output',required=True)
    args=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
    src=Path(args.input).resolve();dst=Path(args.output).resolve();assert src!=dst,'Repair writes a separate output'
    stage('load frozen motion input');bpy.ops.wm.open_mainfile(filepath=str(src));before=frozen_contract()
    stage('pack existing skin roughness into explicit glTF ORM channels');detail=apply_material_patch(dst.parent/'material-textures');after=frozen_contract();assert before==after,'Material-only repair changed geometry or motion'
    stage('save separate material-final blend');dst.parent.mkdir(parents=True,exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(dst),compress=True)
    report={'status':'passed','input':str(src),'output':str(dst),'geometryUnchanged':True,'animationUnchanged':True,'contract':after,'repair':detail}
    dst.with_suffix('.materials.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print('V5_MATERIAL_DONE '+json.dumps(report),flush=True)
