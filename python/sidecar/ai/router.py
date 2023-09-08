import litellm
from fastapi import APIRouter
from sidecar.ai.chat import ask_question
from sidecar.ai.rewrite import complete_text, rewrite
from sidecar.ai.schemas import (
    ChatRequest,
    ChatResponse,
    RewriteRequest,
    RewriteResponse,
    TextCompletionRequest,
    TextCompletionResponse,
)
from sidecar.settings.service import get_settings_for_user

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
)


@router.post("/rewrite")
async def http_ai_rewrite(req: RewriteRequest) -> RewriteResponse:
    user_id = "user1"
    user_settings = get_settings_for_user(user_id)
    response = await rewrite(req, user_settings=user_settings)
    return response


@router.post("/completion")
async def http_ai_completion(
    req: TextCompletionRequest,
) -> TextCompletionResponse:
    user_id = "user1"
    user_settings = get_settings_for_user(user_id)
    response = complete_text(req, user_settings=user_settings)
    return response


@router.post("/{project_id}/chat")
async def http_ai_chat(
    project_id: str,
    req: ChatRequest,
) -> ChatResponse:
    user_id = "user1"
    user_settings = get_settings_for_user(user_id)
    response = ask_question(req, project_id=project_id, user_settings=user_settings)
    return response
