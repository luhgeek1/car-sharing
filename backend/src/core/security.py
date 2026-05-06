import json
from typing import Annotated

import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import get_settings
from core.errors import ForbiddenError, UnauthorizedError
from core.rbac import (
    ROLES_CACHE_TTL_SECONDS,
    roles_cache_key,
    GLOBAL_ROLE_IMPLICATIONS,
)
from database.redis import CacheRepo, get_redis
from database.relational_db import User
from service.auth import TokenService, get_token_service
from service.users import UserService, get_user_service

security = HTTPBearer(
    description="Access token must be passed as Bearer to authorize request"
)
settings = get_settings()
PUBLIC_KEY = settings.JWT_PUBLIC_KEY.encode()


def _request_ip_identifier(request: Request) -> str:
    forwarded_ip = request.headers.get("x-real-ip")
    if forwarded_ip:
        return forwarded_ip.strip()

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()

    if request.client:
        return request.client.host

    return "unknown"


async def refresh_rate_identifier(request: Request) -> str:
    token = request.cookies.get("refresh_token")
    if not token:
        auth = request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]

    if not token:
        return f"refresh:ip:{_request_ip_identifier(request)}"

    try:
        payload = jwt.decode(
            token,
            PUBLIC_KEY,
            algorithms=[settings.JWT_ALGO],
            options={"require": ["exp", "jti", "typ"]},
        )
    except jwt.PyJWTError:
        return f"refresh:ip:{_request_ip_identifier(request)}"

    if payload.get("typ") != "refresh":
        return f"refresh:ip:{_request_ip_identifier(request)}"

    jti = payload.get("jti")
    if not jti:
        return f"refresh:ip:{_request_ip_identifier(request)}"

    return f"refresh:jti:{jti}"

async def parse_token(
    creds: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    token_svc: Annotated[TokenService, Depends(get_token_service)],
) -> dict[str, int | str]:
    payload = await token_svc.verify_access(creds.credentials)
    if payload is None:
        raise UnauthorizedError("Bad access token passed")
    
    return payload

async def auth_user(
    payload: Annotated[dict[str, int | str], Depends(parse_token)],
    svc: Annotated[UserService, Depends(get_user_service)],
) -> User:
    user_id = str(payload["sub"])
    user = await svc.get_user(user_id)
    if user is None:
        raise UnauthorizedError("Not authorized")

    verify_auth_version(payload.get("av"), user)

    if user.banned:
        raise ForbiddenError(
            "Your account is banned, contact support: laughinmee@gmail.com",
        )

    return user


async def load_cached_roles(user: User) -> list[str]:
    cache_repo = CacheRepo(get_redis())

    roles = await cache_repo.get(roles_cache_key(user.id, user.auth_version))
    
    if roles is not None:
        return json.loads(roles)
    
    roles_slugs = user.role_slugs
    await cache_repo.set(roles_cache_key(user.id, user.auth_version), json.dumps(roles_slugs), ttl=ROLES_CACHE_TTL_SECONDS)

    return roles_slugs

def verify_auth_version(token_version: int | str | None, user: User) -> None:
    if token_version is None or int(token_version) != int(user.auth_version):
        raise UnauthorizedError("Access token expired, please sign in again")


def expand_roles(roles: list[str], implications: dict[str, set[str]]) -> set[str]:
    """Expand roles to include all implied roles"""
    base = set(roles)
    
    effective_roles = set(base)
    stack = list(base)
    
    while stack:
        role = stack.pop()
        for implied in implications.get(role, set()):
            if implied not in effective_roles:
                effective_roles.add(implied)
                stack.append(implied)
    
    return effective_roles


def require(
    *roles: str,
    bypass_global: frozenset[str] = frozenset({"admin"}),
):
    expected = set(roles)

    async def dependency(
        payload: Annotated[dict[str, int | str], Depends(parse_token)],
        user: Annotated[User, Depends(auth_user)],
    ) -> None:
        verify_auth_version(payload.get("av"), user)

        global_roles = await load_cached_roles(user)
        eff_roles = expand_roles(list(global_roles), GLOBAL_ROLE_IMPLICATIONS)

        if eff_roles & bypass_global:
            return

        if not expected.issubset(eff_roles):
            raise ForbiddenError("You don't have permission to do this")

    return dependency
