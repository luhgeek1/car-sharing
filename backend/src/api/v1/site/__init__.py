from fastapi import APIRouter


def get_site_router() -> APIRouter:
    from .content import router as content_router

    router = APIRouter(prefix="/site", tags=["Site"])
    router.include_router(content_router)
    return router
