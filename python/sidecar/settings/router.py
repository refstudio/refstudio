from fastapi import APIRouter
from sidecar.settings import service
from sidecar.settings.schemas import FlatSettingsSchema, FlatSettingsSchemaPatch

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)


# Settings API
# --------------
@router.get("/")
async def get_settings() -> FlatSettingsSchema:
    user_id = "user1"
    return service.get_settings_for_user(user_id)


@router.put("/")
async def update_settings(req: FlatSettingsSchemaPatch) -> FlatSettingsSchema:
    user_id = "user1"
    return service.update_settings_for_user(user_id, req)
