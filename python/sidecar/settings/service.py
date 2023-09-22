import json
from pathlib import Path

from sidecar.config import WEB_STORAGE_URL
from sidecar.settings.schemas import (
    FlatSettingsSchema,
    FlatSettingsSchemaPatch,
    ModelProvider,
    RewriteMannerType,
)


def make_settings_json_path(user_id: str) -> Path:
    filepath = Path(WEB_STORAGE_URL / user_id / "settings.json")
    return filepath


def default_settings() -> FlatSettingsSchema:
    return FlatSettingsSchema(
        active_project_id="",
        logging_enabled=True,
        logging_filepath="/tmp/refstudio-sidecar.log",
        model_provider=ModelProvider.OPENAI,
        api_key="",
        model="gpt-3.5-turbo",
        temperature=0.8,
        rewrite_manner=RewriteMannerType.SCHOLARLY,
    )


def initialize_settings_for_user(user_id: str) -> None:
    filepath = make_settings_json_path(user_id)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    defaults = default_settings()

    with open(filepath, "w") as f:
        json.dump(defaults.dict(), f)


def get_settings_for_user(user_id: str) -> FlatSettingsSchema:
    """
    Reads a user's settings.json
    """
    filepath = make_settings_json_path(user_id)

    if not filepath.exists():
        initialize_settings_for_user(user_id)

    with open(filepath, "r") as f:
        data = json.load(f)

    return FlatSettingsSchema(**data)


def update_settings_for_user(
    user_id: str, update: FlatSettingsSchemaPatch
) -> FlatSettingsSchema:
    """
    Updates a user's settings.json
    """
    filepath = make_settings_json_path(user_id)

    if not filepath.exists():
        initialize_settings_for_user(user_id)

    response = get_settings_for_user(user_id)

    existing = response.dict()
    existing.update({k: v for k, v in update.dict().items() if v is not None})

    with open(filepath, "w") as f:
        json.dump(existing, f)

    return get_settings_for_user(user_id)
