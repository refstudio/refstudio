from sidecar.ai.schemas import RewriteMannerType
from sidecar.pydantic_utils import make_optional
from sidecar.typing import RefStudioModel


class OpenAISettings(RefStudioModel):
    api_key: str = ""
    chat_model: str = "gpt-3.5-turbo"

    # TODO: the params below should not be settings
    # they should be configurable as part of the API request
    manner: RewriteMannerType = RewriteMannerType.SCHOLARLY
    temperature: float = 0.7


class ProjectSettings(RefStudioModel):
    current_directory: str = ""


class LoggingSettings(RefStudioModel):
    enable: bool = False
    filepath: str = "/tmp/refstudio-sidecar.log"


class SidecarSettings(RefStudioModel):
    logging: LoggingSettings = LoggingSettings()


class SettingsSchema(RefStudioModel):
    """@deprecated"""

    project: ProjectSettings = ProjectSettings()
    openai: OpenAISettings = OpenAISettings()
    sidecar: SidecarSettings = SidecarSettings()


class FlatSettingsSchema(RefStudioModel):
    active_project_id: str
    logging_enabled: bool
    logging_filepath: str
    openai_api_key: str
    openai_chat_model: str
    openai_manner: RewriteMannerType
    openai_temperature: float


@make_optional()
class FlatSettingsSchemaPatch(FlatSettingsSchema):
    pass
