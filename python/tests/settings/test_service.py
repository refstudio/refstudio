from sidecar import config
from sidecar.settings import schemas
from sidecar.settings.service import (
    default_settings,
    get_settings_for_user,
    initialize_settings_for_user,
    make_settings_json_path,
    migrate_settings,
    update_settings_for_user,
)


def test_initialize_settings_for_user(monkeypatch, tmp_path):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    filepath = make_settings_json_path(user_id)

    assert not filepath.exists()

    initialize_settings_for_user(user_id)

    assert filepath.exists()


def test_get_settings_for_new_user_should_be_empty(monkeypatch, tmp_path):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    # New user should have default settings
    user_id = "user999"
    filepath = make_settings_json_path(user_id)

    if filepath.exists():
        filepath.unlink()

    response = get_settings_for_user(user_id)
    assert response.dict() == default_settings()

    # settings.json should be created
    filepath = make_settings_json_path(user_id)
    assert filepath.exists()

    if filepath.exists():
        filepath.unlink()


def test_get_settings_for_existing_user(monkeypatch, tmp_path, create_settings_json):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)
    user_id = "user1"

    response = get_settings_for_user(user_id)
    assert response.openai_api_key == "1234"


def test_update_settings_for_user(monkeypatch, tmp_path, create_settings_json):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    response = get_settings_for_user(user_id)
    init_settings = response.dict()

    # should not be default settings (the fixture updates a field)
    assert init_settings != default_settings()

    patch = schemas.FlatSettingsSchemaPatch()
    patch.openai_temperature = 100.0
    response = update_settings_for_user(user_id, patch)

    # should be updated settings
    assert response.dict() == {**init_settings, "openai_temperature": 100.0}


def test_migrate_settings():
    old_settings = schemas.SettingsSchema()
    old_settings.openai.api_key = "abcd"
    old_settings.sidecar.logging.enable = True
    old_settings.project.current_directory = "/var/tmp"

    new_settings = migrate_settings(old_settings.dict())
    assert new_settings.logging_enabled
    assert new_settings.openai_api_key == "abcd"
    assert new_settings.current_directory == "/var/tmp"
