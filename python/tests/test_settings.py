import json
import pytest

from sidecar import settings, typing


@pytest.fixture
def create_settings_json(monkeypatch, tmp_path, request):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    filepath = settings.make_settings_json_path(user_id)

    settings.initialize_settings_for_user(user_id)

    defaults = typing.SettingsSchema()
    defaults.openai.api_key = "1234"

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
    assert response.dict() == typing.SettingsSchema().dict()

    # settings.json should be created
    filepath = settings.make_settings_json_path(user_id)
    assert filepath.exists()


def test_get_settings_for_existing_user(monkeypatch, tmp_path, create_settings_json):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)
    user_id = "user1"

    response = settings.get_settings_for_user(user_id)
    assert response.openai.api_key == "1234"


def test_update_settings_for_user(monkeypatch, tmp_path, create_settings_json):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    response = settings.get_settings_for_user(user_id)

    # should be default settings
    assert response.dict() != typing.SettingsSchema().dict()

    data = response.dict()

    data["openai"] = {"temperature": 100.0}
    request = typing.SettingsSchema(**data)
    response = settings.update_settings_for_user(user_id, request)

    # should be updated settings
    assert response.dict() == request.dict()
