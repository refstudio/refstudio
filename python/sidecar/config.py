import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 1487))

WEB_STORAGE_URL = Path(os.environ.get("WEB_STORAGE_URL", "/tmp/web-storage-url"))
PROJECT_DIR = Path(os.environ.get("PROJECT_DIR", "/tmp/project-x"))
UPLOADS_DIR = Path(os.path.join(PROJECT_DIR, "uploads"))
REFERENCES_JSON_PATH = Path(os.path.join(PROJECT_DIR, ".storage", "references.json"))

logging.root.setLevel(logging.NOTSET)

logger = logging.getLogger()
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

stream_handler = logging.StreamHandler()
file_handler = logging.FileHandler(
    os.path.join(os.environ.get("SIDECAR_LOG_DIR", "/tmp"), "refstudio-sidecar.log")
)

stream_handler.setLevel(logging.INFO)
file_handler.setLevel(logging.INFO)

stream_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

logger.addHandler(stream_handler)
logger.addHandler(file_handler)
logger.disabled = False
