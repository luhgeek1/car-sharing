from core.errors import BadRequestError, NotFoundError


class SiteContentNotFoundError(NotFoundError):
    error_code = "SITE_CONTENT_NOT_FOUND"
    default_detail = "Site content not found"


class UnknownServiceSelectionError(BadRequestError):
    error_code = "UNKNOWN_SERVICE_SELECTION"
    default_detail = "Unknown service selection"


class InvalidContactRequestCursorError(BadRequestError):
    error_code = "INVALID_CONTACT_REQUEST_CURSOR"
    default_detail = "Invalid cursor"
