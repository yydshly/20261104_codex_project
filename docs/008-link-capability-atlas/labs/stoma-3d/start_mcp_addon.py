"""Load the published Blender add-on into the project's isolated Blender process."""

import importlib.util
from pathlib import Path
import sys


addon_path, ready_path = sys.argv[sys.argv.index('--') + 1:]
spec = importlib.util.spec_from_file_location('stoma_blender_mcp_addon', addon_path)
addon = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = addon
spec.loader.exec_module(addon)
addon.register()

server = addon.BlenderMCPServer(host='127.0.0.1', port=0)
server.start()
if not server.running or not server.socket:
    raise RuntimeError('The Blender MCP add-on did not start')
Path(ready_path).write_text(str(server.socket.getsockname()[1]), encoding='ascii')
