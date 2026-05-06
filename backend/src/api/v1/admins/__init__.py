from fastapi import APIRouter


def get_admins_router() -> APIRouter:
    from .users import get_users_router
    from .stats import get_stats_router
    from .cars import get_admin_cars_router
    from .contact_requests import get_admin_contact_requests_router

    router = APIRouter(prefix='/admins', tags=['Admins'])

    router.include_router(get_users_router())
    router.include_router(get_stats_router())
    router.include_router(get_admin_cars_router())
    router.include_router(get_admin_contact_requests_router())

    return router
