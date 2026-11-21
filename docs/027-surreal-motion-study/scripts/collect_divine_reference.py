"""Collect the exact public HLS observed in the user-linked post for frame analysis."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from collect_references import ROOT, FFMPEG, FFPROBE, collect_track, get, run

source = json.loads((ROOT / 'reference/divine-multiverse-source.json').read_text(encoding='utf-8'))
folder = ROOT / 'assets/divine-multiverse'
folder.mkdir(parents=True, exist_ok=True)
video, v_track = collect_track(source['video_playlist'], folder, 'video')
audio, a_track = collect_track(source['audio_playlist'], folder, 'audio')
complete = folder / 'reference.mp4'
run([FFMPEG, '-y', '-v', 'error', '-i', str(video), '-i', str(audio), '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-movflags', '+faststart', str(complete)])
# The analysis uses decoded frames, so a separate thumbnail download is unnecessary.
probe = json.loads(run([FFPROBE, '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(complete)]))
(folder / 'probe.json').write_text(json.dumps(probe, indent=2), encoding='utf-8')
stream = next(x for x in probe['streams'] if x['codec_type'] == 'video')
duration = float(stream.get('duration', probe['format']['duration']))
if not 9 < duration < 12:
    raise ValueError('Unexpected duration: not the observed ten-second clip')
tone_map = []
if stream.get('color_transfer') in ('arib-std-b67','smpte2084'):
    tone_map = ['-vf','zscale=t=linear:npl=100,format=gbrpf32le,tonemap=tonemap=hable:desat=0,zscale=p=bt709:t=bt709:m=bt709:r=full,format=yuvj420p']
frames = []
for time in [0.1,1,2,3,4,5,6,7,8,9,10]:
    target = folder / f'frame-{time:05.2f}.jpg'
    run([FFMPEG,'-y','-v','error','-ss',str(time),'-i',str(complete),'-frames:v','1',*tone_map,'-q:v','2',str(target)])
    frames.append({'time_seconds':time,'path':target.relative_to(ROOT).as_posix()})
evidence = {**source,'material_type':'complete_original_video_from_observed_public_hls','local_video':complete.relative_to(ROOT).as_posix(),'duration_seconds':duration,'width':stream['width'],'height':stream['height'],'frame_rate':stream.get('avg_frame_rate'),'color_transfer':stream.get('color_transfer'),'color_primaries':stream.get('color_primaries'),'color_space':stream.get('color_space'),'frames':frames,'track_sources':{'video':v_track,'audio':a_track},'sha256':hashlib.sha256(complete.read_bytes()).hexdigest(),'audio_reviewed_by_listener':False,'workflow_confirmed':False,'preview_conversion':'HLG/PQ to SDR tone mapping' if tone_map else 'Direct decoded frame; no exposure or saturation adjustment'}
(folder/'provenance.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf-8')
font = lambda n: ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',n)
sheet = Image.new('RGB',(1270,930),'#101820')
draw = ImageDraw.Draw(sheet)
draw.text((22,14),'The Divine Multiverse · 原片时间序列',font=font(28),fill='#eef2e6')
draw.text((22,56),'同一条原视频的11处完整画幅抽帧 · 未添加曝光或饱和度 · 时间为本地视频轨',font=font(18),fill='#b3bebf')
for i,frame in enumerate(frames):
    x=22+(i%6)*208
    y=94+(i//6)*402
    pic=Image.open(ROOT/frame['path']).convert('RGB')
    pic.thumbnail((194,345),Image.Resampling.LANCZOS)
    sheet.paste(pic,(x,y))
    draw.text((x,y+351),f"{frame['time_seconds']:.2f}s",font=font(19),fill='#e0e8a5')
draw.text((22,905),'来源：@EiiKwesiKay · 2026-11-13 核对 · 不是新生成的画面',font=font(17),fill='#b3bebf')
sheet.save(folder/'temporal-contact-sheet.jpg',quality=94)
print(json.dumps({k:evidence[k] for k in ['duration_seconds','width','height','frame_rate','color_transfer','color_primaries','color_space']},ensure_ascii=False))
