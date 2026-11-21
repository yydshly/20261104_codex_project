import io
import json
from pathlib import Path
from zipfile import ZipFile

import httpx

from casebook.localize import MODEL_DIRECTORY


MODEL_URL = "https://argos-net.com/v1/translate-en_zh-1_9.argosmodel"


def main():
    if (MODEL_DIRECTORY / "model" / "model.bin").exists():
        print("英译中模型已就绪。")
        return
    print("正在下载 Argos 英译中模型，约 71 MB。", flush=True)
    with httpx.Client(timeout=120, follow_redirects=True) as client:
        response = client.get(MODEL_URL)
        response.raise_for_status()
    with ZipFile(io.BytesIO(response.content)) as archive:
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            parts = Path(entry.filename).parts
            relative = Path(*parts[1:])
            destination = (MODEL_DIRECTORY / relative).resolve()
            if not destination.is_relative_to(MODEL_DIRECTORY.resolve()):
                raise ValueError("模型包包含不合法路径")
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(archive.read(entry))
    if not (MODEL_DIRECTORY / "model" / "model.bin").exists():
        raise ValueError("模型包缺少 model.bin")
    metadata = json.loads((MODEL_DIRECTORY / "metadata.json").read_text(encoding="utf-8"))
    print(f"模型已就绪。{metadata['from_name']} → {metadata['to_name']}")


if __name__ == "__main__":
    main()
