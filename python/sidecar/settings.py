import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


APPDATA_DIR = Path(
    os.environ.get('APP_DATA_DIR', '/tmp')
)
PROJECT_NAME = Path(
    os.environ.get('PROJECT_NAME', 'project-x')
)
UPLOADS_DIR = Path(
    os.path.join(APPDATA_DIR, PROJECT_NAME, 'uploads')
)
REFERENCES_JSON_PATH = Path(
    os.path.join(
        APPDATA_DIR, PROJECT_NAME, '.storage', 'references.json'
    )
)

logging.root.setLevel(logging.NOTSET)

logger = logging.getLogger()
handler = logging.FileHandler(
    os.path.join(
        os.environ.get("SIDECAR_LOG_DIR", "/tmp"), "refstudio-sidecar.log"
    )
)
handler.setLevel(logging.INFO)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

logger.addHandler(handler)
logger.disabled = os.environ.get("SIDECAR_ENABLE_LOGGING", "false").lower() == "true"