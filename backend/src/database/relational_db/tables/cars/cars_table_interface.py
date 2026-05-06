from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .cars_table import Car


class CarInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, car: Car) -> Car:
        self.session.add(car)
        return car

    async def get_by_id(self, car_id: UUID | str) -> Car | None:
        return await self.session.scalar(select(Car).where(Car.id == car_id))

    async def list(
        self,
        *,
        category: str | None = None,
        is_available: bool | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Car]:
        stmt = select(Car)
        if category is not None:
            stmt = stmt.where(Car.category == category)
        if is_available is not None:
            stmt = stmt.where(Car.is_available == is_available)
        stmt = stmt.order_by(Car.created_at.desc(), Car.id.desc()).limit(limit).offset(offset)
        rows = await self.session.scalars(stmt)
        return list(rows.all())

    async def count(
        self,
        *,
        category: str | None = None,
        is_available: bool | None = None,
    ) -> int:
        stmt = select(func.count(Car.id))
        if category is not None:
            stmt = stmt.where(Car.category == category)
        if is_available is not None:
            stmt = stmt.where(Car.is_available == is_available)
        return int(await self.session.scalar(stmt) or 0)

    async def delete(self, car: Car) -> None:
        await self.session.delete(car)
