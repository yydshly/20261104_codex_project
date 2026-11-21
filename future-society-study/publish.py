"""Copy the reviewed static study into the repository's GitHub Pages tree."""

from hashlib import sha256
from pathlib import Path
import shutil


SOURCE = Path(__file__).resolve().parent
DESTINATION = SOURCE.parent / "docs" / "010-future-society-study"
FILES = ("index.html", "styles.css", "app.js")
DIRECTORIES = ("media", "demos", "downloads", "source")


def publish():
    files = [SOURCE / name for name in FILES]
    for name in DIRECTORIES:
        directory = SOURCE / name
        if not directory.is_dir():
            raise FileNotFoundError(directory)
        files.extend(path for path in directory.rglob("*") if path.is_file())

    for path in files:
        if path.is_symlink() or path.name.startswith(".env"):
            raise ValueError("Unexpected publication input: " + str(path))
        relative = path.relative_to(SOURCE)
        target = DESTINATION / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        if sha256(path.read_bytes()).digest() != sha256(target.read_bytes()).digest():
            raise RuntimeError("Publication copy differs: " + relative.as_posix())

    print(f"Published and hash-verified {len(files)} files in docs/010-future-society-study/.")


if __name__ == "__main__":
    publish()
