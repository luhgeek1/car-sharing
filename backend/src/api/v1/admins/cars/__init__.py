from fastapi import APIRouter


def get_admin_cars_router() -> APIRouter:
    from .create import router as create_router
    from .update import router as update_router
    from .delete import router as delete_router
    from .upload import router as upload_router

    router = APIRouter(prefix="/cars")
    router.include_router(upload_router)
    router.include_router(create_router)
    router.include_router(update_router)
    router.include_router(delete_router)
    return router
