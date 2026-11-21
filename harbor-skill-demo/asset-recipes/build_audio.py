"""Synthesize the harbor's material-aware audio with asset-maker modal banks."""
import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT=next(parent for parent in Path(__file__).resolve().parents if (parent/'tools'/'asset-maker').is_dir())
sys.path.insert(0,str(ROOT/'tools'/'asset-maker'))
import numpy as np
from scipy import signal
from asset_pipeline import AssetValidator, Manifest, Sound, SoundSynthesizer, spatial_stereo_pan

RATE=48000
def shape(sound,fade=.015):
    samples=sound.samples.copy();count=min(int(RATE*fade),len(samples)//3)
    fade_in=np.linspace(0,1,count)
    fade_out=np.linspace(1,0,count)**2
    if samples.ndim==2:
        fade_in=fade_in[:,None]
        fade_out=fade_out[:,None]
    samples[:count]*=fade_in
    samples[-count:]*=fade_out
    samples[0]=0;samples[-1]=0
    return Sound(samples,rate=RATE)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--seed',type=int,default=27);parser.add_argument('--out',type=Path,default=ROOT/'assets'/'forged'/'sfx');args=parser.parse_args()
    out=args.out.resolve();out.mkdir(parents=True,exist_ok=True)
    synth=SoundSynthesizer(rate=RATE,seed=args.seed)
    sounds={}
    body=synth.modal_resonator(.35,[110,258,441],[15,22,30],[1,.55,.2])
    sounds['hit']=Sound(body.samples+.28*synth.transient_click(.35,120).samples,RATE)
    sounds['guard']=synth.tubular_chime_resonator(420,.6)
    sounds['pickup']=synth.glass_resonator(880,1.1)
    sounds['beacon']=synth.bell_resonator(330,2.6)
    sounds['defeat']=synth.modal_resonator(.7,[70,143,290],[7,11,19],[1,.7,.3])
    sounds['damage']=synth.wood_resonator(170,.35)
    sounds['warning']=synth.glass_resonator(510,.25)
    for name,duration,cutoff in [('swing',.2,4200),('dash',.3,1400),('pulse',1.15,1900)]:
        t=synth.time_vector(duration)
        noise=synth.rng.standard_normal(len(t))
        filtered=signal.sosfilt(signal.butter(2,[130,cutoff],btype='bandpass',fs=RATE,output='sos'),noise)
        envelope=np.sin(np.pi*t/duration)**1.4
        if name=='pulse':
            bell=synth.tubular_chime_resonator(130,duration).samples
            filtered=filtered*.35+bell*.3
        sounds[name]=Sound(filtered*envelope,RATE)
    t=synth.time_vector(.12)
    phase=2*np.pi*190*(np.exp(np.log(45/190)*t/.12)-1)/(np.log(45/190)/.12)
    sounds['before-hit']=Sound(np.sign(np.sin(phase))*np.exp(np.log(.001/.03)*t/.12),RATE)
    manifest=Manifest('sfx-hit.wav',parameters={'seed':args.seed,'rate':RATE,'headroomDb':-3,'channels':2,'haasMs':3.5,'bellPrimeHz':330},recipe='generate.py')
    manifest.declare_vault('mathematics/acoustics/church_bells_bronze.md','bell_resonator')
    manifest.declare_vault('mathematics/acoustics/spatial_haas_and_transients.md','spatial_stereo_pan')
    reports={}
    for name,sound in sounds.items():
        mono=shape(sound)
        stereo=shape(Sound(spatial_stereo_pan(mono,pan=0,haas_delay_ms=3.5),RATE))
        path=out/f'sfx-{name}.wav';stereo.export(path,headroom_db=-3)
        report=AssetValidator.validate_wav(path)
        if report.metrics['peak_dbfs']> -2.99 or report.metrics['sample_rate']!=RATE:raise ValueError('audio export contract')
        reports[name]=report.metrics
    shutil.copyfile(__file__,out/'generate.py');manifest.extra['sounds']=reports
    manifest.scan_directory(out,only=['sfx-']);manifest.save(out)
    print(json.dumps({'sounds':len(reports),'rate':RATE,'validated':True}))

if __name__=='__main__':main()
