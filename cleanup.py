import os
import shutil
from pathlib import Path

ROOT = Path("C:/VK224/Hackathons/UNIHACK/Project/UNI-HACK")

targets = [
    ROOT / "DEV/backend/catalogx.db",
    ROOT / "DEV/backend/reports",
    ROOT / "AI-ML/data/reports",
    ROOT / "AI-ML/data/chroma_db",
    ROOT / "AI-ML/data/corrections.json"
]

for target in targets:
    if target.is_file():
        try:
            target.unlink()
            print(f"Deleted file: {target}")
        except Exception as e:
            print(f"Error deleting file {target}: {e}")
    elif target.is_dir():
        try:
            for item in target.iterdir():
                if item.is_file():
                    item.unlink()
                elif item.is_dir():
                    shutil.rmtree(item)
            print(f"Emptied directory: {target}")
        except Exception as e:
            print(f"Error emptying directory {target}: {e}")
    else:
        print(f"Not found: {target}")
