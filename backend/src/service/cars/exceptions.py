from core.errors import BadRequestError, NotFoundError, PayloadTooLargeError


class CarNotFoundError(NotFoundError):
    error_code = "CAR_NOT_FOUND"
    default_detail = "Car not found"


class UnsupportedCarImageContentTypeError(BadRequestError):
    error_code = "UNSUPPORTED_CAR_IMAGE_CONTENT_TYPE"

    def __init__(self, allowed: list[str]) -> None:
        allowed_list = ", ".join(sorted(allowed))
        super().__init__(
            detail=f"Unsupported car image content type. Allowed: {allowed_list}"
        )


class CarImageObjectNotFoundError(BadRequestError):
    error_code = "CAR_IMAGE_OBJECT_NOT_FOUND"
    default_detail = "Uploaded car image object was not found"


class CarImageTooLargeError(PayloadTooLargeError):
    error_code = "CAR_IMAGE_TOO_LARGE"

    def __init__(self, max_size_mb: int) -> None:
        super().__init__(detail=f"Car image exceeds {max_size_mb} MB")
