from sidecar.ai.schemas import RewriteMannerType
from sidecar.pydantic_utils import make_optional
from sidecar.typing import RefStudioModel

try:
    # introduced in Python 3.11 ...
    from enum import StrEnum
except ImportError:
    # ... but had some breaking changes
    # https://github.com/python/cpython/issues/100458
    # Python 3.10 and below
    from strenum import StrEnum


class ModelProvider(StrEnum):
    OPENAI = "openai"
    OLLAMA = "ollama"


class FlatSettingsSchema(RefStudioModel):
    active_project_id: str
    logging_enabled: bool
    logging_filepath: str
    model_provider: ModelProvider
    api_key: str
    model: str
    temperature: float
    rewrite_manner: RewriteMannerType


@make_optional()
class FlatSettingsSchemaPatch(FlatSettingsSchema):
    pass
