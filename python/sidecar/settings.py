import logging
import os
import json
from pathlib import Path

from dotenv import load_dotenv

from sidecar.typing import SettingsSchema

load_dotenv()


WEB_STORAGE_URL = Path(
    os.environ.get(
        'WEB_STORAGE_URL', '/tmp/web-storage-url'
    )
)
PROJECT_DIR = Path(
    os.environ.get('PROJECT_DIR', '/tmp/project-x')
)
UPLOADS_DIR = Path(
    os.path.join(PROJECT_DIR, 'uploads')
)
REFERENCES_JSON_PATH = Path(
    os.path.join(
        PROJECT_DIR, '.storage', 'references.json'
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


def make_settings_json_path(user_id: str) -> Path:
    filepath = Path(WEB_STORAGE_URL / user_id / "settings.json")
    return filepath


def initialize_settings_for_user(user_id: str) -> None:
    filepath = make_settings_json_path(user_id)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    defaults = SettingsSchema()

    with open(filepath, "w") as f:
        json.dump(defaults.dict(), f)


def get_settings_for_user(user_id: str) -> SettingsSchema:
    """
    Reads a user's settings.json
    """
    filepath = make_settings_json_path(user_id)

    if not filepath.exists():
        initialize_settings_for_user(user_id)

    with open(filepath, "r") as f:
        data = json.load(f)
    return SettingsSchema(
        openai=data.get("openai"),
        project=data.get("project"),
        sidecar=data.get("sidecar"),
    )


def update_settings_for_user(
    user_id: str,
    settings: SettingsSchema 
) -> SettingsSchema:
    """
    Updates a user's settings.json
    """
    filepath = make_settings_json_path(user_id)

    if not filepath.exists():
        initialize_settings_for_user(user_id)

    response = get_settings_for_user(user_id)

    existing = response.dict()
    existing.update(settings.dict())

    with open(filepath, "w") as f:
        json.dump(existing, f)

    return get_settings_for_user(user_id)