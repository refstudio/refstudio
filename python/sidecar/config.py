import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


WEB_STORAGE_URL = Path(os.environ.get("WEB_STORAGE_URL", "/tmp/web-storage-url"))
PROJECT_DIR = Path(os.environ.get("PROJECT_DIR", "/tmp/project-x"))
UPLOADS_DIR = Path(os.path.join(PROJECT_DIR, "uploads"))
REFERENCES_JSON_PATH = Path(os.path.join(PROJECT_DIR, ".storage", "references.json"))

logging.root.setLevel(logging.NOTSET)

logger = logging.getLogger()
handler = logging.FileHandler(
    os.path.join(os.environ.get("SIDECAR_LOG_DIR", "/tmp"), "refstudio-sidecar.log")
)
handler.setLevel(logging.INFO)

formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)

logger.addHandler(handler)
logger.disabled = os.environ.get("SIDECAR_ENABLE_LOGGING", "false").lower() != "true"
