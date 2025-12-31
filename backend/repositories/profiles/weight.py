from backend.models import WeightProfile
from backend.repositories.base.base_repository import BaseRepository


class WeightProfileRepository(BaseRepository[WeightProfile]):
    def __init__(self):
        super().__init__(WeightProfile)