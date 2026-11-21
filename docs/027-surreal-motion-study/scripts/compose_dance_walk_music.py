"""Original local 100 BPM / 16-beat music. No sampled or downloaded music."""
from pathlib import Path
import json,wave,math,subprocess,hashlib
import numpy as np
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/dance-walk';OUT.mkdir(exist_ok=True)
SR=44100;BPM=100;BEAT=60/BPM;DURATION=16*BEAT
rng=np.random.default_rng(2047);audio=np.zeros((round(SR*DURATION),2),np.float64);events=[]
def add(signal,start,gain=.5,pan=.5,kind='note',beat=None):
    offset=round(start*SR);end=min(len(audio),offset+len(signal))
    if end<=offset:return
    signal=signal[:end-offset]*gain
    audio[offset:end,0]+=signal*math.sqrt(1-pan);audio[offset:end,1]+=signal*math.sqrt(pan)
    events.append({'kind':kind,'time':round(start,4),'beat':beat})
def kick():
    t=np.arange(round(SR*.3))/SR
    phase=2*math.pi*(44*t+85*(1-np.exp(-t*32))/32)
    return np.sin(phase)*np.exp(-t*17)+rng.normal(0,.06,len(t))*np.exp(-t*180)
def snare():
    t=np.arange(round(SR*.20))/SR;n=rng.normal(0,1,len(t));n-=np.convolve(n,np.ones(12)/12,'same')
    return n*np.exp(-t*31)*.35+np.sin(2*math.pi*180*t)*np.exp(-t*30)*.14
def hat(opened=False):
    t=np.arange(round(SR*(.14 if opened else .07)))/SR;n=rng.normal(0,1,len(t));n-=np.convolve(n,np.ones(7)/7,'same')
    return n*np.exp(-t*(30 if opened else 78))*.20
def tone(midi,duration,flavor='bass'):
    t=np.arange(round(SR*duration))/SR;freq=440*2**((midi-69)/12)
    if flavor=='bass':
        s=np.sin(2*math.pi*freq*t)+.24*np.sin(4*math.pi*freq*t)+.10*np.sin(6*math.pi*freq*t)
        env=(1-np.exp(-t*360))*np.exp(-t*8)*np.clip((duration-t)/.035,0,1)
    else:
        s=np.sin(2*math.pi*freq*t)+.25*np.sin(4*math.pi*freq*t)+.10*np.sin(2*math.pi*freq*3.002*t)
        env=(1-np.exp(-t*600))*np.exp(-t*11)*np.clip((duration-t)/.03,0,1)
    return s*env
for b in range(16):
    bar=b//4;pos=b%4
    sparse=bar==2
    if pos in (0,2):add(kick(),b*BEAT,.48 if not sparse else .26,kind='kick',beat=b+1)
    if pos in (1,3) and not (sparse and pos==1):add(snare(),b*BEAT,.56 if not sparse else .32,.53,'snare',b+1)
    for half in (0,.5):
        if sparse and b in (8,9) and half==0:continue
        add(hat(opened=(pos==3 and half==.5)),(b+half)*BEAT+(.025 if half else 0),.28 if half else .20,.63,'hat',b+1)
for b in (3.5,7.75,12.75,15.5):add(kick(),b*BEAT,.23,kind='pickup-kick',beat=int(b)+1)
bass=[(0,38),(1.5,38),(2.75,41),(3.5,45),(4,43),(5.5,43),(6.5,41),(7.5,40),(8,38),(10.5,45),(11.5,36),(12,38),(13.5,41),(14.25,45),(15.5,38)]
for b,n in bass:add(tone(n,.32),b*BEAT,.32,.48,'bass',int(b)+1)
for b,chord in [(0.5,[62,65,69,72]),(2.5,[62,65,69]),(4.5,[62,67,70,74]),(6.5,[60,64,67]),(11.5,[60,64,67]),(12.5,[62,65,69]),(14.5,[62,65,69,72])]:
    for n in chord:add(tone(n,.24,'keys'),b*BEAT,.055,.32,'chord',int(b)+1)
for b,n in [(1.75,81),(3.25,79),(5.5,77),(6.25,81),(7.5,74),(10.75,81),(13.25,81),(14.75,84),(15.5,81)]:
    add(tone(n,.23,'keys'),b*BEAT,.085,.68,'melody',int(b)+1)
# Small deterministic stereo room tail, mixed before final gain normalization.
delay=round(SR*.082);dry=audio.copy();audio[delay:]+=dry[:-delay,::-1]*.13
fade=np.minimum(np.clip(np.arange(len(audio))/SR/.018,0,1),np.clip((DURATION-np.arange(len(audio))/SR)/.055,0,1))
audio*=fade[:,None];audio=np.tanh(audio*1.15);audio*=.82/max(np.max(np.abs(audio)),.001)
path=OUT/'dance-walk-100bpm-original.wav'
with wave.open(str(path),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes(np.int16(audio*32767).tobytes())
mp3=OUT/'dance-walk-100bpm-original.mp3'
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-i',str(path),'-c:a','libmp3lame','-b:a','192k',str(mp3)],capture_output=True,check=True)
record={'date':'2026-11-13','type':'original_local_synthesis','bpm':BPM,'beats':16,'seconds':DURATION,'sampleRate':SR,'channels':2,'peak':float(np.max(np.abs(audio))),'externalSamples':False,'events':events,'wav':str(path.relative_to(ROOT)).replace('\\','/'),'mp3':str(mp3.relative_to(ROOT)).replace('\\','/'),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
(ROOT/'reference/dance-walk-music-20261113.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Original music:',BPM,'BPM,',DURATION,'seconds,',len(events),'events',flush=True)
