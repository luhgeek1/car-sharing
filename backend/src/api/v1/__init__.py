from fastapi import APIRouter


def get_v1_router() -> APIRouter:
    from .auth import get_auth_routers
    from .users import get_users_router
    from .misc import get_misc_router
    from .admins import get_admins_router
    from .cars import get_cars_router
    from .services import get_services_router
    from .site import get_site_router
    from .contact_requests import get_contact_requests_router

    router = APIRouter(prefix='/v1')

    router.include_router(get_auth_routers())
    router.include_router(get_users_router())
    router.include_router(get_misc_router())
    router.include_router(get_admins_router())
    router.include_router(get_cars_router())
    router.include_router(get_services_router())
    router.include_router(get_site_router())
    router.include_router(get_contact_requests_router())

    return router
