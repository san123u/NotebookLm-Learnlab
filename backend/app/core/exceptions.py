"""
Custom exceptions for the application.

Provides a hierarchy of exceptions for different error scenarios.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = 400, code: str = None):
        self.message = message
        self.status_code = status_code
        self.code = code or self.__class__.__name__
        super().__init__(message)


class NotFoundError(AppException):
    """Resource not found error."""

    def __init__(self, message: str = "Resource not found", resource: str = None):
        if resource:
            message = f"{resource} not found"
        super().__init__(message, 404, "NOT_FOUND")


class ValidationError(AppException):
    """Validation error."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, 422, "VALIDATION_ERROR")


class AuthenticationError(AppException):
    """Authentication required error."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, 401, "AUTHENTICATION_ERROR")


class AuthorizationError(AppException):
    """Permission denied error."""

    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, 403, "AUTHORIZATION_ERROR")


class ConflictError(AppException):
    """Resource conflict error."""

    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message, 409, "CONFLICT_ERROR")


def register_exception_handlers(app: FastAPI):
    """Register custom exception handlers with FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.message,
                "code": exc.code,
            },
        )
