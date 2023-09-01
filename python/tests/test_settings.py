import json

import pytest
from sidecar import settings, typing


@pytest.fixture
def create_settings_json(monkeypatch, tmp_path, request):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    filepath = settings.make_settings_json_path(user_id)

    settings.initialize_settings_for_user(user_id)

    defaults = settings.default_settings()
    defaults.openai_api_key = "1234"

    with open(filepath, "w") as f:
        json.dump(defaults.dict(), f)

    def teardown():
        filepath.unlink()

    request.addfinalizer(teardown)


def test_initialize_settings_for_user(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    filepath = settings.make_settings_json_path(user_id)

    assert not filepath.exists()

    settings.initialize_settings_for_user(user_id)

    assert filepath.exists()


def test_get_settings_for_new_user_should_be_empty(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    # New user should have default settings
    user_id = "user999"

    response = settings.get_settings_for_user(user_id)
    assert response.dict() == settings.default_settings()

    # settings.json should be created
    filepath = settings.make_settings_json_path(user_id)
    assert filepath.exists()


def test_get_settings_for_existing_user(monkeypatch, tmp_path, create_settings_json):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)
    user_id = "user1"

    response = settings.get_settings_for_user(user_id)
    assert response.openai_api_key == "1234"


def test_update_settings_for_user(monkeypatch, tmp_path, create_settings_json):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    response = settings.get_settings_for_user(user_id)
    init_settings = response.dict()

    # should not be default settings (the fixture updates a field)
    assert init_settings != settings.default_settings()

    patch = typing.FlatSettingsSchemaPatch()
    patch.openai_temperature = 100.0
    response = settings.update_settings_for_user(user_id, patch)

    # should be updated settings
    assert response.dict() == {**init_settings, "openai_temperature": 100.0}


def test_migrate_settings():
    old_settings = typing.SettingsSchema()
    old_settings.openai.api_key = "abcd"
    old_settings.sidecar.logging.enable = True
    old_settings.project.current_directory = "/var/tmp"

    new_settings = settings.migrate_settings(old_settings.dict())
    assert new_settings.logging_enabled
    assert new_settings.openai_api_key == "abcd"
    assert new_settings.current_directory == "/var/tmp"
