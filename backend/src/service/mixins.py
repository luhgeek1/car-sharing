from redis.asyncio import Redis

from database.relational_db import UoW


class EnsureUoW:
    """A mixin class ensuring unit of work dependency"""
    def __init__(self, *args, uow: UoW, **kwargs):
        super().__init__(*args, **kwargs)
        self.uow = uow


class EnsureRedis:
    """A mixin class ensuring redis dependency"""
    def __init__(self, *args, redis: Redis, **kwargs):
        super().__init__(*args, **kwargs)
        self.redis = redis
