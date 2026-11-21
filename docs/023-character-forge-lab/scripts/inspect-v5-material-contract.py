import bpy,importlib.util,json,time
from pathlib import Path
R=Path(__file__).resolve().parents[1];bpy.ops.wm.open_mainfile(filepath=str(R/'assets/warlord-v5/art.blend'))
s=importlib.util.spec_from_file_location('v5mat',R/'scripts/patch-warlord-v5-materials.py');p=importlib.util.module_from_spec(s);s.loader.exec_module(p)
t=time.time();a=p.frozen_contract();print('MATERIAL_CONTRACT_PROBE',json.dumps({'signature':a,'elapsed':round(time.time()-t,2)}),flush=True)
