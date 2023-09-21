from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from sidecar.ai.chat import ask_question, stream_response, yield_response
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
    response = await complete_text(req, user_settings=user_settings)
    return response


@router.post("/{project_id}/chat")
async def http_ai_chat(
    project_id: str,
    req: ChatRequest,
) -> ChatResponse:
    user_id = "user1"
    user_settings = get_settings_for_user(user_id)
    response = await ask_question(
        req, project_id=project_id, user_settings=user_settings
    )
    return response


@router.post(
    "/{project_id}/chat_stream",
    responses={
        200: {
            "content": {
                "application/json": {},
                "text/event-stream": {"schema": {"type": "string"}},
            },
            "description": "Stream chat reply.",
        }
    },
)
async def http_ai_chat_stream(
    project_id: str,
    req: ChatRequest,
) -> StreamingResponse:
    user_id = "user1"
    user_settings = get_settings_for_user(user_id)
    response = yield_response(req, project_id=project_id, user_settings=user_settings)
    return StreamingResponse(
        response,
        media_type="text/event-stream",
    )
