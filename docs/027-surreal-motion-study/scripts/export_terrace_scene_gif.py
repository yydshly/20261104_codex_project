"""Export a real generated scene clip as GIF; never substitutes still versions."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--input',required=True,type=Path)
parser.add_argument('--width',type=int,default=480)
parser.add_argument('--fps',type=int,default=12)
args=parser.parse_args()
if not args.input.is_file(): parser.error('A completed scene video is required')
if not 240<=args.width<=960 or not 5<=args.fps<=24: parser.error('Use a practical preview size and frame rate')
folder=ROOT/'assets/gif-studies'
folder.mkdir(parents=True,exist_ok=True)
target=folder/'terrace-city-approach.gif'
if target.exists(): parser.error('Preserve the current GIF; version it before exporting again')
ffmpeg=shutil.which('ffmpeg')
ffprobe=shutil.which('ffprobe')
probe=json.loads(subprocess.check_output([ffprobe,'-v','error','-show_streams','-show_format','-of','json',str(args.input)],encoding='utf-8'))
filters=f'fps={args.fps},scale={args.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle'
subprocess.run([ffmpeg,'-v','error','-i',str(args.input),'-filter_complex',filters,'-an','-loop','0',str(target)],check=True)
poster=folder/'terrace-city-approach-poster.png'
subprocess.run([ffmpeg,'-v','error','-i',str(args.input),'-frames:v','1','-vf',f'scale={args.width}:-1:flags=lanczos',str(poster)],check=True)
with Image.open(target) as gif:
 duration=0
 for index in range(gif.n_frames): gif.seek(index);duration+=gif.info.get('duration',0)
 metadata={'width':gif.width,'height':gif.height,'frames':gif.n_frames,'duration_ms':duration}
record={'createdOn':'2026-11-13','type':'gif_export_of_scene_video','sourceVideo':str(args.input.resolve()),'sourceVideoSha256':hashlib.sha256(args.input.read_bytes()).hexdigest(),'videoProbe':probe,'gif':target.relative_to(ROOT).as_posix(),'exportFps':args.fps,**metadata,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'loopNote':'Repeats from end to start; not claimed as a seamless scene loop.'}
(ROOT/'reference/terrace-city-scene-gif-export.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(metadata))
