import os
from pathlib import Path

from casebook.db import Database
from casebook.localize import ChineseTranslator, report_texts


def main():
    root = Path(__file__).resolve().parent
    database = Database(Path(os.environ.get("CASEBOOK_DB", root / "data" / "casebook.sqlite3")))
    translator = ChineseTranslator(database)
    if not translator.available():
        raise SystemExit("请先安装 requirements-translation.txt 并运行 python setup_translation.py")
    total = 0
    for project in database.projects():
        total += translator.populate([project["description"]])
        for version in database.versions(project["id"]):
            report = database.report(project["id"], version["version"])
            total += translator.populate(report_texts(report))
        print(project["name"], f"中文展示已就绪，累计新增 {total} 条翻译", flush=True)


if __name__ == "__main__":
    main()
