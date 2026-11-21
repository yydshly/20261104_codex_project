"""Local Chinese sample timing, with explicit approximation boundaries.

Known clauses are aligned at measured pauses and sub-word timing is estimated
from audio energy and pinyin. This is not ASR or phoneme forced alignment.
"""
import json,re,wave,hashlib
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1];folder=root/'glasshouse/assets/personal-guide/speech';path=folder/'terrace-intro.json'
data=json.loads(path.read_text(encoding='utf-8-sig'));wav=folder/data['audio']
with wave.open(str(wav),'rb') as f:
 rate=f.getframerate();signal=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(np.float32)/32768;duration=len(signal)/rate
step=int(rate*.02);envelope=[float(np.sqrt(np.mean(signal[i:i+step]**2))) for i in range(0,len(signal),step)]
# Offline OneCore exposes no native viseme events here. Anchor known clauses
# at actual audio pauses, then estimate sub-word timing from accumulated energy.
# Do not label this known-text estimate as speech recognition/forced alignment.
active=np.array(envelope)>.008;first=int(np.flatnonzero(active)[0]);last=int(np.flatnonzero(active)[-1]);gaps=[];start=None
for i in range(first,last+1):
 if not active[i] and start is None:start=i
 if active[i] and start is not None:
  if i-start>=4:gaps.append((start,i))
  start=None
clauses=[s for s in re.split(r'[，。！？]',data['text']) if s];selected=sorted(sorted(gaps,key=lambda p:p[1]-p[0],reverse=True)[:len(clauses)-1])
assert len(selected)==len(clauses)-1,('Insufficient clause pauses',len(selected))
spans=list(zip([first]+[b for a,b in selected],[a for a,b in selected]+[last+1]));words=[]
for clause,(a,b) in zip(clauses,spans):
 weights=np.sqrt(np.array(envelope[a:b])+1e-5);cumulative=np.cumsum(weights);cumulative/=cumulative[-1]
 chars=re.findall(r'[\u4e00-\u9fff]',clause)
 bounds=[a*.02]+[(a+int(np.searchsorted(cumulative,i/len(chars))))*.02 for i in range(1,len(chars))]+[b*.02]
 for i,c in enumerate(chars):words.append({'text':c,'start':bounds[i],'end':bounds[i+1]})
expected=re.findall(r'[\u4e00-\u9fff]',data['text']);assert len(expected)==len(words)
mapped={i:(w['start'],w['end']) for i,w in enumerate(words)}
spell=dict(zip('你好欢迎来到海边玻璃屋我们先在露台停一下看金色的阳光怎样随着浪轻移动','ni hao huan ying lai dao hai bian bo li wu wo men xian zai lu tai ting yi xia kan jin se de yang guang zen yang sui zhe lang qing yi dong'.split()))
def phonemes(p):
 initial=next((s for s in ['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','z','c','s','r'] if p.startswith(s)),None)
 head={'b':'PP','p':'PP','m':'PP','f':'FF','d':'DD','t':'DD','n':'nn','l':'nn','g':'kk','k':'kk','h':'kk','zh':'CH','ch':'CH','sh':'CH','j':'CH','q':'CH','x':'CH','z':'SS','c':'SS','s':'SS','r':'RR'}.get(initial)
 final=p[len(initial):] if initial else p
 vowel='aa' if 'a' in final else 'O' if 'o' in final else 'U' if 'u' in final or p=='wu' else 'E' if 'e' in final else 'I'
 return head,vowel
cues=[]
for i,c in enumerate(expected):
 start,end=mapped[i]
 if end-start<.035:continue
 onset,vowel=phonemes(spell[c]);split=start+min(.065,(end-start)*.28)
 if onset:cues.append({'time':round(start,4),'end':round(split,4),'shape':'viseme_'+onset,'text':c})
 cues.append({'time':round(split if onset else start,4),'end':round(end,4),'shape':'viseme_'+vowel,'text':c})
data.update({'duration':duration,'sha256':hashlib.sha256(wav.read_bytes()).hexdigest(),'source':'Locally synthesized Windows Kangkang Chinese sample; no cloud call','nativeVisemeEvents':len(data.get('visemes',[])),'timingMethod':'Known text aligned at measured audio clause pauses; approximate energy-weighted character and pinyin-to-viseme timing. No ASR or phoneme forced alignment.','wordAlignment':words,'visemeCues':cues,'envelopeStep':.02,'envelope':envelope,'limitations':['Character timing and pinyin-to-viseme mapping are approximate and need visual calibration.','Installed Windows voice is a local test voice, not an expressive or cloned voice.']})
data['sampleRate']=rate
path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'duration':duration,'clauses':len(clauses),'cues':len(cues),'rmsMax':max(envelope)},ensure_ascii=False))
