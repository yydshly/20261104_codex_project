from pathlib import Path
import json,hashlib
import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import butter,sosfiltfilt
root=Path('glasshouse/assets/ambience');data,rate=sf.read(root/'ocean-surf.ogg',always_2d=True)
x=data[20*rate:32*rate].copy();x=sosfiltfilt(butter(2,[80,11000],btype='bandpass',fs=rate,output='sos'),x,axis=0)
rms=np.sqrt(np.maximum(1e-8,uniform_filter1d(np.mean(x*x,axis=1),size=int(rate*.20))))
gain=uniform_filter1d(np.clip(.095/rms,.25,8),size=int(rate*.10));x*=gain[:,None]
n=rate;t=np.linspace(0,np.pi/2,n)[:,None];join=x[-n:]*np.cos(t)+x[:n]*np.sin(t);x=np.concatenate([x[n:-n],join])
x*=min(1,.75/max(.001,np.max(np.abs(x))));sf.write(root/'surf-texture43.wav',x,rate,subtype='PCM_24')
info={'source':'ocean-surf.ogg','sourceSha256':hashlib.sha256((root/'ocean-surf.ogg').read_bytes()).hexdigest(),'sourceRangeSeconds':[20,32],'processing':'80 Hz–11 kHz bandpass, local 200ms RMS levelling, 100ms gain smoothing, 1s equal-power loop join. This is a steady surf texture; visible wave phase supplies its macro envelope at runtime.','sampleRate':rate,'channels':x.shape[1],'duration':len(x)/rate,'rmsDbfs':float(20*np.log10(np.sqrt(np.mean(x*x)))),'license':'CC0-1.0; derived from the already recorded SamsterBirdies source in manifest.json'}
(root/'surf-texture43.json').write_text(json.dumps(info,indent=2));print(json.dumps(info))
