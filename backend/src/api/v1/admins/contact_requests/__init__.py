from fastapi import APIRouter


def get_admin_contact_requests_router() -> APIRouter:
    from .list import router as list_router

    router = APIRouter(prefix="/contact-requests")
    router.include_router(list_router)
    return router
