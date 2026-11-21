"""Build deterministic four-stage tide/impact flipbooks using asset-maker."""
import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT=next(parent for parent in Path(__file__).resolve().parents if (parent/'tools'/'asset-maker').is_dir())
sys.path.insert(0,str(ROOT/'tools'/'asset-maker'))
import numpy as np
from PIL import Image
from asset_pipeline import AssetValidator, Easing, EmitterStack, Flipbook, Manifest

def make_flipbook(seed,size,variant):
    rng=np.random.default_rng(seed)
    axis=np.linspace(-1,1,size)
    x,y=np.meshgrid(axis,axis);radius=np.hypot(x,y);angle=np.arctan2(y,x)
    sparks=[(rng.uniform(0,2*np.pi),rng.uniform(.6,.95),rng.uniform(.008,.017)) for _ in range(30)]
    clouds=[(rng.uniform(0,2*np.pi),rng.uniform(.22,.48),rng.uniform(.08,.16)) for _ in range(9)]
    palette=np.array([65,215,237]) if variant=='tide' else np.array([255,169,69])
    def rgba(intensity,color=palette):
        alpha=np.clip(intensity,0,1)*np.clip((.98-radius)/.04,0,1)
        rgb=np.broadcast_to(color,(size,size,3)).copy()
        image=np.dstack([rgb,alpha*255]).astype(np.uint8)
        image[image[:,:,3]==0,:3]=0
        return Image.fromarray(image)
    def flash(phase,_size):
        return rgba(np.exp(-radius**2/.025)*max(0,1-phase/.14),np.array([230,255,249]))
    def wave(phase,_size):
        position=.06+.82*Easing.ease_out(phase)
        irregular=position+.014*np.sin(angle*9-phase*12)
        energy=np.exp(-((radius-irregular)/(.015+.025*phase))**2)*(1-phase)**.8
        energy+=.28*np.exp(-((radius-position*.74)/.012)**2)*(1-phase)
        return rgba(energy)
    def plume(phase,_size):
        amount=np.zeros_like(radius)
        for direction,orbit,scale in clouds:
            px=np.cos(direction)*orbit*Easing.ease_out(phase)
            py=np.sin(direction)*orbit*Easing.ease_out(phase)-phase*.11
            amount+=np.exp(-((x-px)**2+(y-py)**2)/(scale*(.6+phase))**2)
        turbulence=.65+.35*np.sin(x*33+y*21+phase*5)*np.sin(y*29-phase*3)
        return rgba(amount*turbulence*np.sin(np.pi*phase)**1.3*.18)
    def embers(phase,_size):
        amount=np.zeros_like(radius)
        for direction,speed,scale in sparks:
            travel=.06+Easing.ease_out(phase)*speed
            px=np.cos(direction)*travel;py=np.sin(direction)*travel
            amount+=np.exp(-((x-px)**2+(y-py)**2)/scale**2)*(1-phase)**1.3
        return rgba(amount,np.array([210,251,237]) if variant=='tide' else np.array([255,221,136]))
    stack=EmitterStack(size=size)
    for layer in [flash,wave,plume,embers]:stack.add_layer(layer)
    flipbook=Flipbook(fps=24)
    flipbook.generate_frames(count=24,frame_generator=stack.composite_frame)
    # One-shot effects extinguish instead of leaving a persistent final frame.
    flipbook.frames[-1]=Image.new('RGBA',(size,size),(0,0,0,0))
    return flipbook

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--seed',type=int,default=27);parser.add_argument('--out',type=Path,default=ROOT/'assets'/'forged'/'vfx');args=parser.parse_args()
    out=args.out.resolve();out.mkdir(parents=True,exist_ok=True)
    manifest=Manifest('vfx-tide.png',parameters={'seed':args.seed,'frames':24,'fps':24,'grid':[6,4],'frameSize':192,'gutter':1,'loop':False},recipe='generate.py')
    manifest.declare_vault('techniques/hybrid_vfx/four_stage_emitter_architecture.md','EmitterStack')
    manifest.declare_vault('techniques/hybrid_vfx/smoke_and_pyroclastic_plumes.md','ease_out')
    reports={}
    for name in ['tide','impact']:
        book=make_flipbook(args.seed,192,name)
        path=out/f'vfx-{name}.png';book.export_atlas(path,columns=6)
        book.export_preview(out/f'vfx-{name}-preview.png');book.export_gif(out/f'vfx-{name}.gif')
        reports[name]={'png':AssetValidator.validate_png(path,require_alpha=True,columns=6,rows=4).metrics,'animation':AssetValidator.validate_animation(path,columns=6,rows=4).metrics}
    shutil.copyfile(__file__,out/'generate.py');manifest.extra['validation']=reports
    manifest.scan_directory(out,only=['vfx-']);manifest.save(out)
    print(json.dumps({'frames':24,'atlases':2,'validated':list(reports)}))

if __name__=='__main__':main()
