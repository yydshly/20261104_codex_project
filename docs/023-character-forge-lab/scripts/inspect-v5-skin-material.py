import bpy,json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'assets/warlord-v5/art.blend'))
m=bpy.data.materials['HeroSkin'];print('SKIN_NODES',[(n.name,n.type,n.image.name if n.type=='TEX_IMAGE' else '') for n in m.node_tree.nodes],flush=True)
for l in m.node_tree.links:print('SKIN_LINK',l.from_node.name,l.from_socket.name,'->',l.to_node.name,l.to_socket.name,flush=True)
for n in m.node_tree.nodes:
 if n.type=='TEX_IMAGE':
  im=n.image;print('SKIN_IMAGE',im.name,list(im.size),im.colorspace_settings.name,list(im.pixels[:8]),bool(im.packed_file),flush=True)
print('BSDF',[(i.name,i.default_value) for i in m.node_tree.nodes.get('Principled BSDF').inputs if i.name in ['Roughness','Metallic']],flush=True)
