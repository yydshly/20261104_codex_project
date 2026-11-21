"""Call the installed MCP for Blender server and export the edited project asset."""

import argparse
import asyncio
from hashlib import sha256
import importlib.metadata
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'public' / 'assets'


def asset_info(path, width):
    return {'name': path.name, 'sha256': sha256(path.read_bytes()).hexdigest(), 'openWidth': width}


async def edit(port, directory):
    edited = directory / 'stoma-edited.blend'
    glb = directory / 'stoma-v2.glb'
    code = f'''
import bpy
import json
import math

left, right = [bpy.data.objects[name] for name in ('GuardCell_L', 'GuardCell_R')]
def aperture(cell):
    return cell.data.shape_keys.key_blocks['Aperture']

def opening_width():
    left_middle = [point.co.x for point in aperture(left).data if abs(point.co.y) < .0001]
    right_middle = [point.co.x for point in aperture(right).data if abs(point.co.y) < .0001]
    return round(min(right_middle) - max(left_middle), 3)

before = opening_width()
for cell in (left, right):
    target = aperture(cell)
    basis = cell.data.shape_keys.key_blocks['Basis']
    for point, original in zip(target.data, basis.data):
        profile = max(0, math.cos(original.co.y / 1.43 * math.pi / 2))
        point.co.x += cell['side'] * .21 * profile**1.65
    cell['open_expansion'] = .53

after = opening_width()
bpy.ops.wm.save_as_mainfile(filepath={str(edited)!r})
bpy.ops.export_scene.gltf(filepath={str(glb)!r}, export_format='GLB', export_animations=False, export_extras=True)
print('STOMA_MCP_RESULT ' + json.dumps({{'before': before, 'after': after, 'blender': bpy.app.version_string}}))
'''
    parameters = StdioServerParameters(
        command=sys.executable,
        args=['-c', 'from blender_mcp.server import main; main()'],
        env={**os.environ, 'BLENDER_HOST': '127.0.0.1', 'BLENDER_PORT': str(port),
             'BLENDER_MCP_SAFE_MODE': '1', 'BLENDER_MCP_DISABLE_TELEMETRY': '1'},
    )
    async with stdio_client(parameters) as (incoming, outgoing):
        async with ClientSession(incoming, outgoing) as session:
            await session.initialize()
            await session.list_tools()
            result = await session.call_tool('execute_blender_code', {'code': code})
    output = '\n'.join(item.text for item in result.content if item.type == 'text')
    for line in output.splitlines():
        if 'STOMA_MCP_RESULT ' in line:
            measurement = json.loads(line.split('STOMA_MCP_RESULT ', 1)[1])
            if measurement['after'] <= measurement['before'] or not (edited.is_file() and glb.is_file()):
                raise RuntimeError('The MCP response did not produce the expected geometry change')
            return measurement, edited, glb
    raise RuntimeError(output)


async def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('blender', type=Path)
    args = parser.parse_args()
    package = importlib.util.find_spec('blender_mcp')
    addon = Path(package.origin).parent / 'bundled' / 'addon.py'
    with tempfile.TemporaryDirectory(prefix='atlas-stoma-mcp-', dir=ROOT) as temp:
        directory = Path(temp)
        ready = directory / 'port'
        options = {}
        if os.name == 'nt':
            startup = subprocess.STARTUPINFO()
            startup.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            startup.wShowWindow = subprocess.SW_HIDE
            options['startupinfo'] = startup
        environment = {**os.environ, 'BLENDER_MCP_DISABLE_TELEMETRY': '1', 'BLENDER_USER_CONFIG': str(directory / 'config')}
        with (directory / 'blender.log').open('w+', encoding='utf-8') as log:
            process = subprocess.Popen(
                [str(args.blender.resolve()), '--factory-startup', '--disable-autoexec', str(ROOT / 'stoma-source.blend'),
                 '--python', str(ROOT / 'start_mcp_addon.py'), '--', str(addon), str(ready)],
                stdout=log, stderr=subprocess.STDOUT, env=environment, **options,
            )
            try:
                for _ in range(160):
                    if ready.exists() and ready.stat().st_size:
                        break
                    if process.poll() is not None:
                        break
                    await asyncio.sleep(.25)
                if not ready.exists() or not ready.stat().st_size:
                    log.seek(0)
                    raise RuntimeError('Blender did not open the MCP port\n' + log.read())
                values, edited, glb = await asyncio.wait_for(edit(int(ready.read_text()), directory), timeout=55)
                report = {
                    'server': 'mcp-for-blender', 'serverVersion': importlib.metadata.version('mcp-for-blender'),
                    'tool': 'execute_blender_code', 'blender': values['blender'],
                    'measurement': 'Inner edge separation at the midpoint, in model coordinates.',
                    'before': asset_info(ASSETS / 'stoma-v1.glb', values['before']),
                    'after': asset_info(glb, values['after']),
                }
                edited.replace(ROOT / edited.name)
                glb.replace(ASSETS / glb.name)
                (ASSETS / 'mcp-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
                print(json.dumps(report, indent=2))
            finally:
                if process.poll() is None:
                    process.terminate()
                    process.wait(timeout=10)


if __name__ == '__main__':
    asyncio.run(main())
