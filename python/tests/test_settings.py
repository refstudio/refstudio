import json
import pytest

from sidecar import settings


@pytest.fixture
def create_settings_json(monkeypatch, tmp_path, request):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    filepath = settings.make_settings_json_path(user_id)

    data = {"openAI": {"OPENAI_API_KEY": "1234"}}
    with open(filepath, "w") as f:
        json.dump(data, f)

    def teardown():
        filepath.unlink()

    request.addfinalizer(teardown)


def test_get_settings_for_new_user_should_be_empty(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    # New user should have empty settings
    user_id = "user999"

    response = settings.get_settings_for_user(user_id)
    assert response.settings == {}

    # settings.json should be created
    filepath = settings.make_settings_json_path(user_id)
    assert filepath.exists()


def test_get_settings_for_existing_user(
    monkeypatch, tmp_path, create_settings_json
):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)
    user_id = "user1"

    response = settings.get_settings_for_user(user_id)
    assert response.settings == {"openAI": {"OPENAI_API_KEY": "1234"}}


def test_update_settings_for_user(
    monkeypatch, tmp_path, create_settings_json
):
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    response = settings.get_settings_for_user(user_id)
    assert response.settings != {}

    data = response.settings

    data["foo"] = {"bar": "test"}
    request = settings.UpdateSettingsRequest(settings=data)
    _ = settings.update_settings_for_user(user_id, request)
    
    response = settings.get_settings_for_user(user_id) 
    assert response.settings == data
