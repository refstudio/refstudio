from fastapi.testclient import TestClient
from sidecar import config
from sidecar.api import api
from sidecar.settings.service import get_settings_for_user

client = TestClient(api)


# ruff gets confused here:
# create_settings_json is a pytest fixture
def test_get_settings(monkeypatch, tmp_path, create_settings_json):  # noqa: F811
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    response = client.get("/api/settings")
    assert response.status_code == 200
    assert response.json()["openai_api_key"] == "1234"


# ruff gets confused here:
# create_settings_json is a pytest fixture
def test_update_settings(monkeypatch, tmp_path, create_settings_json):  # noqa: F811
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)
    user_id = "user1"

    response = get_settings_for_user(user_id)
    assert response.openai_api_key != "test"

    response = client.put("/api/settings", json={"openai_api_key": "test"})

    assert response.status_code == 200
    assert response.json()["openai_api_key"] == "test"
