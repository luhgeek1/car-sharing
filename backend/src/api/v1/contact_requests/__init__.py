from fastapi import APIRouter


def get_contact_requests_router() -> APIRouter:
    from .create import router as create_router

    router = APIRouter(prefix="/contact-requests", tags=["Contact Requests"])
    router.include_router(create_router)
    return router
