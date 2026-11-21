"""Compatibility entry for the current game prototype verification."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name("offline_v3.py")),run_name="__main__")
