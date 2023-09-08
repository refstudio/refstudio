from pathlib import Path

from sidecar.projects import service
from sidecar.projects.schemas import ProjectFileTreeResponse


def test_read_project_path_storage_does_not_exist(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    stored_projects = service.read_project_path_storage(user_id)
    assert stored_projects.dict() == {"projects": {}}


def test_read_project_path_storage_exists(
    monkeypatch, tmp_path, setup_project_path_storage
):
    user_id = "user1"
    stored_projects = service.read_project_path_storage(user_id)
    expected = {
        "projects": {
            "project1": {
                "name": "project1name",
                "path": str(tmp_path / user_id / "project1"),
            }
        }
    }
    assert stored_projects.dict() == expected


def test_update_project_path_storage_should_be_created(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = tmp_path / user_id / project_id
    project_path.mkdir(parents=True, exist_ok=True)

    service.update_project_path_storage(user_id, project_id, project_name, project_path)

    stored_projects = service.read_project_path_storage(user_id)
    expected = {
        "project1": {
            "name": project_name,
            "path": str(project_path),
        }
    }
    assert stored_projects.dict()["projects"] == expected


def test_update_project_path_storage_should_be_appended_to(
    monkeypatch, tmp_path, setup_project_path_storage
):
    user_id = "user1"
    project_id = "project2"
    project_name = "project2name"
    project_path = tmp_path / user_id / project_id
    project_path.mkdir(parents=True, exist_ok=True)

    service.update_project_path_storage(user_id, project_id, project_name, project_path)

    stored_projects = service.read_project_path_storage(user_id)
    assert stored_projects.dict() == {
        "projects": {
            "project1": {
                "name": "project1name",
                "path": str(tmp_path / user_id / "project1"),
            },
            "project2": {
                "name": project_name,
                "path": str(project_path),
            },
        }
    }


def test_get_project_path_for_project_that_does_not_exist(
    tmp_path, setup_project_path_storage
):
    user_id = "user1"
    project_id = "project999"
    try:
        _ = service.get_project_path(user_id, project_id)
    except KeyError:
        assert True


def test_get_project_path_for_project_that_exists(tmp_path, setup_project_path_storage):
    user_id = "user1"
    project_id = "project1"

    path = service.get_project_path(user_id, project_id)
    assert path == Path(tmp_path / user_id / project_id)


def test_create_project_should_create_project_path(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"

    project_item = service.create_project(user_id, project_id, project_name)

    # correct path should be returned
    assert project_item.path == str(tmp_path / user_id / project_id)
    assert Path(project_item.path).exists()

    # project path should be stored in project storage
    stored_projects = service.read_project_path_storage(user_id)
    expected = {
        "projects": {
            "project1": {
                "name": project_name,
                "path": project_item.path,
            }
        }
    }
    assert stored_projects.dict() == expected


def test_create_project_should_create_provided_project_path(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    filepath = tmp_path / "some-fake-path"

    # if the path doesn't actually exist, `create_project` will raise an exception
    filepath.mkdir(parents=True, exist_ok=True)

    project_item = service.create_project(
        user_id, project_id, project_name, project_path=filepath
    )

    # correct path should be returned
    assert project_item.path == str(filepath)
    assert Path(project_item.path).exists()

    # project path should be stored in project storage
    stored_projects = service.read_project_path_storage(user_id)
    expected = {
        "projects": {
            "project1": {
                "name": project_name,
                "path": str(filepath),
            }
        }
    }
    assert stored_projects.dict() == expected


def test_delete_project_should_raise_exception_if_project_does_not_exist(
    monkeypatch, tmp_path
):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"

    try:
        service.delete_project(user_id, project_id)
    except KeyError:
        assert True


def test_delete_project_should_delete_project(
    monkeypatch, tmp_path, setup_project_path_storage
):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"

    service.delete_project(user_id, project_id)

    stored_projects = service.read_project_path_storage(user_id)
    assert stored_projects.dict() == {"projects": {}}


def test_get_project_files(monkeypatch, tmp_path, setup_project_path_storage):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"

    # setup project files
    project_path = service.get_project_path(user_id, project_id)

    # hidden dirs/files should be ignored
    (project_path / "file1.refstudio").touch()
    (project_path / ".ignoreme").touch()
    (project_path / "uploads").mkdir()
    (project_path / "uploads" / "file2.pdf").touch()
    (project_path / ".storage").mkdir()
    (project_path / ".storage" / "references.json").touch()
    (project_path / "empty").mkdir()
    (project_path / "another" / "nested").mkdir(parents=True, exist_ok=True)
    (project_path / "another" / "file3.pdf").touch()
    (project_path / "another" / "nested" / "file4.pdf").touch()

    response = service.get_project_files(user_id, project_id)

    expected = {
        "contents": [
            {
                "name": "file1.refstudio",
                "path": "file1.refstudio",
                "file_extension": ".refstudio",
            },
            {
                "name": "uploads",
                "path": "uploads",
                "children": [
                    {
                        "name": "file2.pdf",
                        "path": "uploads/file2.pdf",
                        "file_extension": ".pdf",
                    }
                ],
            },
            {
                "name": "empty",
                "path": "empty",
                "children": [],
            },
            {
                "name": "another",
                "path": "another",
                "children": [
                    {
                        "name": "file3.pdf",
                        "path": "another/file3.pdf",
                        "file_extension": ".pdf",
                    },
                    {
                        "name": "nested",
                        "path": "another/nested",
                        "children": [
                            {
                                "name": "file4.pdf",
                                "path": "another/nested/file4.pdf",
                                "file_extension": ".pdf",
                            }
                        ],
                    },
                ],
            },
        ],
    }

    assert isinstance(response, ProjectFileTreeResponse)
    assert sorted(response.dict()) == sorted(expected)
