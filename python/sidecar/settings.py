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