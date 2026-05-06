from fastapi import APIRouter


def get_services_router() -> APIRouter:
    from .list import router as list_router

    router = APIRouter(prefix="/services", tags=["Services"])
    router.include_router(list_router)
    return router
