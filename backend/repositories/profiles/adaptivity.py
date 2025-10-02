from backend.models import AdaptivityProfile, WeightProfile
from backend.repositories.base.base_repository import BaseRepository


class AdaptivityProfileRepository(BaseRepository[AdaptivityProfile]):
    def __init__(self):
        super().__init__(AdaptivityProfile)