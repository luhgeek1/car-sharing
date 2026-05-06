from typing import Literal

from fastapi import Request

from core.errors import ForbiddenError

TokenClient = Literal["web", "mobile"]


def resolve_token_client_mode(request: Request, requested: TokenClient) -> TokenClient:
    if requested == "web":
        return "web"

    browser_headers = (
        "origin",
        "referer",
        "sec-fetch-site",
        "sec-fetch-mode",
    )
    if any(request.headers.get(header) for header in browser_headers):
        raise ForbiddenError("Mobile token mode is not available from browser requests")

    return "mobile"
