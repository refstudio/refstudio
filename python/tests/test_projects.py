import pytest
from pathlib import Path

from sidecar import projects


@pytest.fixture
def setup_project_path_storage(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    projects.create_project(user_id, project_id)
    return user_id, project_id


def test_read_project_path_storage_does_not_exist(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    projects_dict = projects.read_project_path_storage(user_id)
    assert projects_dict == {}


def test_read_project_path_storage_exists(monkeypatch, tmp_path, setup_project_path_storage):
    user_id = "user1"
    projects_dict = projects.read_project_path_storage(user_id)
    assert projects_dict == {"project1": str(tmp_path / user_id / "project1")}


def test_update_project_path_storage_should_be_created(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"
    project_path = tmp_path / user_id / project_id
    project_path.mkdir(parents=True, exist_ok=True)

    projects.update_project_path_storage(user_id, project_id, project_path)

    projects_dict = projects.read_project_path_storage(user_id)
    assert projects_dict == {"project1": str(tmp_path / user_id / "project1")}


def test_update_project_path_storage_should_be_appended_to(monkeypatch, tmp_path, setup_project_path_storage):
    user_id = "user1"
    project_id = "project2"
    project_path = tmp_path / user_id / project_id
    project_path.mkdir(parents=True, exist_ok=True)

    projects.update_project_path_storage(user_id, project_id, project_path)

    projects_dict = projects.read_project_path_storage(user_id)
    assert projects_dict == {
        "project1": str(tmp_path / user_id / "project1"),
        "project2": str(tmp_path / user_id / "project2"),
    }


def test_get_project_path_for_project_that_does_not_exist(tmp_path, setup_project_path_storage):
    user_id = "user1"
    project_id = "project999"
    try:
        _ = projects.get_project_path(user_id, project_id)
    except KeyError:
        assert True


def test_get_project_path_for_project_that_exists(tmp_path, setup_project_path_storage):
    user_id = "user1"
    project_id = "project1"

    path = projects.get_project_path(user_id, project_id)
    assert path == Path(tmp_path / user_id / project_id)


def test_create_project_should_create_project_path(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"

    project_path = projects.create_project(user_id, project_id)

    # correct path should be returned
    assert project_path == tmp_path / user_id / project_id
    assert project_path.exists()

    # project path should be stored in project storage
    projects_dict = projects.read_project_path_storage(user_id)
    assert projects_dict == {"project1": str(tmp_path / user_id / "project1")}


def test_create_project_should_create_provided_project_path(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"
    filepath = tmp_path / "some-fake-path"

    # if the path doesn't actually exist, `create_project` will raise an exception
    filepath.mkdir(parents=True, exist_ok=True)

    project_path = projects.create_project(user_id, project_id, project_path=filepath)

    # correct path should be returned
    assert project_path == filepath
    assert project_path.exists()

    # project path should be stored in project storage
    projects_dict = projects.read_project_path_storage(user_id)
    assert projects_dict == {"project1": str(filepath)}


def test_delete_project_should_raise_exception_if_project_does_not_exist(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"

    try:
        projects.delete_project(user_id, project_id)
    except KeyError:
        assert True


def test_delete_project_should_delete_project(monkeypatch, tmp_path, setup_project_path_storage):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"

    projects.delete_project(user_id, project_id)

    projects_dict = projects.read_project_path_storage(user_id)
    assert projects_dict == {}


def test_get_project_files_should_return_list_of_files(monkeypatch, tmp_path, setup_project_path_storage):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"

    project_path = projects.get_project_path(user_id, project_id)
    (Path(project_path) / "file1.txt").touch()

    files = projects.get_project_files(user_id, project_id)
    assert files == [Path(f"{project_path}/file1.txt")]