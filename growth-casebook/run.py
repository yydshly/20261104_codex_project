import argparse
import webbrowser
from threading import Timer

import uvicorn


def main():
    parser = argparse.ArgumentParser(description="启动 Growth Casebook 本地研究台")
    parser.add_argument("--port", type=int, default=8766)
    parser.add_argument("--open", action="store_true", help="在浏览器中打开研究台")
    args = parser.parse_args()
    if args.open:
        Timer(1.5, lambda: webbrowser.open(f"http://127.0.0.1:{args.port}")).start()
    uvicorn.run("casebook.app:app", host="127.0.0.1", port=args.port, log_level="info")


if __name__ == "__main__":
    main()
