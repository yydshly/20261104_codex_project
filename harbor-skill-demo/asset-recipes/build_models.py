"""Author the harbor models with asset-maker's real CSG and export helpers."""
import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT = next(parent for parent in Path(__file__).resolve().parents if (parent/'tools'/'asset-maker').is_dir())
sys.path.insert(0, str(ROOT/'tools'/'asset-maker'))
import numpy as np
import trimesh
from asset_pipeline import AssetValidator, Manifest, MeshBuilder, SolidMesh, bake_ground_ao

PALETTE = {'bronze':[184,120,65,255], 'edge':[231,185,108,255], 'iron':[40,67,77,255], 'turquoise':[49,116,124,255], 'light':[123,239,223,255], 'stone':[179,195,187,255]}
SEED = 27

def chassis(guardian=False):
    builder = MeshBuilder(SEED)
    shell = SolidMesh(trimesh.creation.icosphere(subdivisions=1, radius=1)).scale([0.69,0.51,0.32]).translate([0,0,0.74])
    cutter = MeshBuilder(SEED).box([0.56,0.48,0.35], [0,0.42,0.75]).build()
    shell = shell.difference(cutter).set_color(PALETTE['turquoise' if guardian else 'bronze'])
    builder.add_mesh(shell)
    builder.lathe([[0,.3],[.45,.3],[.6,.37],[.6,.49],[.5,.55],[0,.55]],sections=12,color=PALETTE['iron'])
    builder.lathe([[0,.88],[.48,.88],[.53,.96],[.36,1.08],[0,1.08]],sections=12,color=PALETTE['edge'])
    builder.icosphere(.2,1,[0,-.37,.75],PALETTE['light'])
    builder.box([.6,.07,.08],[0,-.48,.66],PALETTE['iron'])
    for sign in [-1,1]:
        builder.cylinder(.055,.24,8,[sign*.24,-.29,1.1],PALETTE['iron'])
        builder.icosphere(.08,1,[sign*.24,-.29,1.24],PALETTE['light'])
        for i in range(3):
            builder.box([.58,.13,.14],[sign*.64,(i-1)*.27,.28],PALETTE['iron'])
            builder.box([.13,.14,.3],[sign*.83,(i-1)*.27,.16],PALETTE['bronze'])
            builder.box([.24,.2,.1],[sign*.86,(i-1)*.27,.05],PALETTE['edge'])
        claw = MeshBuilder(SEED).lathe([[0,0],[.19,0],[.23,.08],[.19,.25],[.12,.32],[0,.32]],sections=8,color=PALETTE['edge']).build()
        claw.rotate([1,0,0],np.pi/2).translate([sign*.73,-.53,.52])
        notch = MeshBuilder(SEED).box([.08,.45,.3],[sign*.73,-.7,.65]).build()
        builder.add_mesh(claw.difference(notch).set_color(PALETTE['edge']))
    if guardian:
        for i in range(6):
            a=i*np.pi/3
            builder.cone(.105,.35,6,[np.cos(a)*.43,np.sin(a)*.33,1.04],PALETTE['bronze'])
        builder.lathe([[0,1.0],[.21,1.0],[.23,1.15],[.13,1.3],[0,1.3]],sections=8,color=PALETTE['light'])
    return builder.build()

def cannon():
    builder=MeshBuilder(SEED)
    builder.lathe([[0,0],[.59,0],[.69,.12],[.62,.32],[.43,.43],[0,.43]],sections=12,color=PALETTE['iron'])
    builder.lathe([[0,.38],[.43,.38],[.5,.58],[.37,.92],[0,.92]],sections=10,color=PALETTE['turquoise'])
    outer=MeshBuilder(SEED).cylinder(.23,.95,12,color=PALETTE['bronze']).build()
    inner=MeshBuilder(SEED).cylinder(.13,1.15,12).build()
    barrel=outer.difference(inner).set_color(PALETTE['bronze']).rotate([1,0,0],np.pi/2).translate([0,-.5,.78])
    builder.add_mesh(barrel)
    for sign in [-1,1]:
        builder.box([.13,.6,.45],[sign*.43,0,.6],PALETTE['edge'])
        builder.icosphere(.08,1,[sign*.34,-.33,.75],PALETTE['light'])
    builder.lathe([[0,.9],[.22,.9],[.27,.97],[.12,1.05],[0,1.05]],sections=10,color=PALETTE['edge'])
    return builder.build()

def beacon():
    builder=MeshBuilder(SEED)
    builder.lathe([[0,0],[1.02,0],[1.07,.14],[.9,.3],[.77,.36],[.7,.52],[0,.52]],sections=12,color=PALETTE['iron'],subdivide=2)
    builder.lathe([[0,.45],[.68,.45],[.66,.7],[.52,3.3],[.57,3.45],[0,3.45]],sections=10,color=PALETTE['stone'],subdivide=2)
    for z,r in [(.65,.7),(1.1,.66),(2.7,.59),(3.4,.65)]:
        builder.lathe([[0,z],[r,z],[r+.05,z+.09],[r,z+.18],[0,z+.18]],sections=10,color=PALETTE['bronze'])
    frame=MeshBuilder(SEED).cylinder(.75,1.08,12,[0,0,4.13]).build()
    frame=frame.difference(MeshBuilder(SEED).cylinder(.55,1.3,12,[0,0,4.13]).build())
    for angle in [0,np.pi/3,2*np.pi/3]:
        cut=MeshBuilder(SEED).box([.64,2,.7],[0,0,4.13]).build().rotate([0,0,1],angle)
        frame=frame.difference(cut)
    builder.add_mesh(frame.set_color(PALETTE['bronze']))
    builder.lathe([[0,3.52],[.84,3.52],[.88,3.64],[.75,3.76],[0,3.76]],sections=12,color=PALETTE['edge'])
    builder.lathe([[0,4.65],[.76,4.65],[1.0,4.8],[.9,4.96],[.23,5.4],[0,5.4]],sections=12,color=PALETTE['turquoise'])
    builder.cylinder(.04,.44,8,[0,0,5.52],PALETTE['edge'])
    for sign in [-1,1]:
        builder.box([.08,.12,2.35],[sign*.45,-.49,1.96],PALETTE['turquoise'])
    return builder.build()

def main():
    global SEED
    parser=argparse.ArgumentParser();parser.add_argument('--seed',type=int,default=SEED);parser.add_argument('--out',type=Path,default=ROOT/'assets'/'forged'/'models')
    args=parser.parse_args();out=args.out.resolve();out.mkdir(parents=True,exist_ok=True)
    SEED = args.seed
    manifest=Manifest('models-sentinel.glb',parameters={'seed':args.seed,'trianglesPerAsset':3000,'sourceAxis':'Z','runtimeAxis':'Y'},recipe='generate.py')
    manifest.declare_vault('techniques/art_styles/vertex_color_gradient_baking.md','bake_ground_ao')
    manifest.declare_vault('techniques/art_styles/bevels_and_edge_weight.md','lathe')
    reports={}
    for name,model in [('sentinel',chassis()),('guardian',chassis(True)),('cannon',cannon()),('beacon',beacon())]:
        bake_ground_ao(model,height=.5,strength=.55)
        model.ensure_watertight()
        path=out/f'models-{name}.glb'
        export_model=SolidMesh(model.raw.copy())
        colors=np.array(export_model.raw.visual.face_colors,dtype=np.float64)
        rgb=colors[:,:3]/255
        colors[:,:3]=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4)*255
        export_model.raw.visual.face_colors=colors.astype(np.uint8)
        export_model.export_glb(path)
        model.render_preview(out/f'models-{name}.png',size=(320,320))
        reports[name]=AssetValidator.validate_mesh(path,max_triangles=3000,watertight=True).metrics
        reports[name]['shading']=AssetValidator.validate_mesh_shading(model.raw).metrics
    shutil.copyfile(__file__,out/'generate.py')
    manifest.extra.update({'models':reports,'vertexColorSpace':'linear RGB, converted from source sRGB palette','provenance':'Original harbor designs constructed with asset-maker MeshBuilder, SolidMesh and Manifold CSG; no skeletal animation.'})
    manifest.scan_directory(out,only=['models-']);manifest.save(out)
    print(json.dumps(reports))

if __name__=='__main__':main()
