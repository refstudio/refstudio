import json
from pathlib import Path

from sidecar.config import WEB_STORAGE_URL
from sidecar.settings.schemas import (
    FlatSettingsSchema,
    FlatSettingsSchemaPatch,
    RewriteMannerType,
    SettingsSchema,
)


def make_settings_json_path(user_id: str) -> Path:
    filepath = Path(WEB_STORAGE_URL / user_id / "settings.json")
    return filepath


def default_settings() -> FlatSettingsSchema:
    return FlatSettingsSchema(
        current_directory="",
        logging_enabled=False,
        logging_filepath="/tmp/refstudio-sidecar.log",
        openai_api_key="",
        openai_chat_model="gpt-3.5-turbo",
        openai_manner=RewriteMannerType.SCHOLARLY,
        openai_temperature=0.7,
    )


def initialize_settings_for_user(user_id: str) -> None:
    filepath = make_settings_json_path(user_id)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    defaults = default_settings()

    with open(filepath, "w") as f:
        json.dump(defaults.dict(), f)


def migrate_settings(old_settings: dict) -> FlatSettingsSchema:
    old_schema = SettingsSchema(
        openai=old_settings.get("openai"),
        project=old_settings.get("project"),
        sidecar=old_settings.get("sidecar"),
    )
    return FlatSettingsSchema(
        current_directory=old_schema.project.current_directory,
        logging_enabled=old_schema.sidecar.logging.enable,
        logging_filepath=old_schema.sidecar.logging.filepath,
        openai_api_key=old_schema.openai.api_key,
        openai_chat_model=old_schema.openai.chat_model,
        openai_manner=old_schema.openai.manner,
        openai_temperature=old_schema.openai.temperature,
    )


def get_settings_for_user(user_id: str) -> FlatSettingsSchema:
    """
    Reads a user's settings.json
    """
    filepath = make_settings_json_path(user_id)

    if not filepath.exists():
        initialize_settings_for_user(user_id)

    with open(filepath, "r") as f:
        data = json.load(f)

    if "openai" in data:
        return migrate_settings(data)
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
