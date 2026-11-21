"""Publish the static atlas into the research repository's GitHub Pages folder."""
from hashlib import sha256
from pathlib import Path
import os
import shutil

SOURCE = Path(__file__).resolve().parent
DESTINATION = SOURCE.parent / "docs/008-link-capability-atlas"
EXCLUDED = {"node_modules", "__pycache__", ".git", ".venv", ".cache"}
DESTINATION.mkdir(parents=True, exist_ok=True)
copied = 0
for directory, folders, filenames in os.walk(SOURCE, followlinks=False):
    folders[:] = [name for name in folders if name not in EXCLUDED and not (Path(directory) / name).is_symlink()]
    for name in filenames:
        path = Path(directory) / name
        if path.is_symlink() or path.suffix in {".log", ".pyc"} or name.startswith(".env"):
            continue
        relative = path.relative_to(SOURCE)
        target = DESTINATION / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        if sha256(path.read_bytes()).digest() != sha256(target.read_bytes()).digest():
            raise RuntimeError("Publication copy differs: " + relative.as_posix())
        copied += 1
print(f"Published and hash-verified {copied} files in docs/008-link-capability-atlas/.")
