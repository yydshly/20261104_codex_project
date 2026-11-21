import bpy
from pathlib import Path
R=Path(__file__).resolve().parents[1];bpy.ops.wm.open_mainfile(filepath=str(R/'assets/warlord-premium/surface.blend'))
for name in ['ArmorGold_ORM','ClothRed_ORM','HeroSkin_Roughness']:
 im=bpy.data.images[name];print(name,im.colorspace_settings.name,list(im.pixels[:12]),flush=True)
for name in ['ArmorGold','ClothRed','HeroSkin']:
 m=bpy.data.materials[name];print(name,[(n.type,n.image.name if n.type=='TEX_IMAGE' else '') for n in m.node_tree.nodes],flush=True)
