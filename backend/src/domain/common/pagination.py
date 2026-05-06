from typing import Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar('T')

class CursorPage(BaseModel, Generic[T]):
    items: list[T] = Field(...)
    next_cursor: str | None = Field(None)
