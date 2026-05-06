from fastapi import APIRouter


def get_cars_router() -> APIRouter:
    from .list import router as list_router
    from .get import router as get_router

    router = APIRouter(prefix="/cars", tags=["Cars"])
    router.include_router(list_router)
    router.include_router(get_router)
    return router
