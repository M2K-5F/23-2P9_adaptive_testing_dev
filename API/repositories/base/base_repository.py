from typing import Literal, TypeVar, Generic, List, Optional, Type, Any, Dict, Tuple, overload
from fastapi import HTTPException, status
import models
from peewee import DoesNotExist

T = TypeVar('T', bound=models.Table)

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

        self._400_does_not_exist = HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f'Object not found: {self.model.__name__}'
        )
        self._400_integrity = HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f'Object {self.model.__name__} with this unique field already created'
        )
        self._404_not_fount = HTTPException(
            status.HTTP_404_NOT_FOUND,
            f'Object of type {self.model.__name__} not found'
        )
        self._field_not_exist = lambda field: ValueError(
            f"Field {field} does not exist in {self.model.__name__}"
        )


    @overload
    def get_by_id(self, id: int, auto_error: Literal[True]) -> T: ...

    @overload
    def get_by_id(self, id: int, auto_error: Literal[False]) -> Optional[T]: ...

    def get_by_id(self, id: int, auto_error: bool = False) -> Optional[T]:
        try:
            return self.model.get_by_id(id)
        except DoesNotExist:
            if not auto_error:
                return None
            else:
                raise self._400_does_not_exist

                
    @overload
    def get_or_create(self, auto_error: Literal[True], defaults: Optional[Dict[str, Any]] = None, **kwargs) -> T: ...

    @overload
    def get_or_create(self, auto_error: Literal[False], defaults: Optional[Dict[str, Any]] = None, **kwargs) -> Tuple[T, bool]: ...

    def get_or_create(self, auto_error: bool = False, defaults: Optional[Dict[str, Any]] = None, **kwargs) -> Any:
        instance, is_created = self.model.get_or_create(defaults=defaults, **kwargs)
        if auto_error and not is_created:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f'Already created {self.model.__name__}'
            )
        if auto_error:
            return instance
            
        return (instance, is_created)


    @overload
    def update_by_id(self, id: int, update_data: Dict[str, Any], auto_error: Literal[True]) -> T: ...

    @overload
    def update_by_id(self, id: int, update_data: Dict[str, Any], auto_error: Literal[False]) -> Optional[T]: ...

    def update_by_id(self, id: int,  update_data: Dict[str, Any], auto_error: bool = False) -> Optional[T]:
        try:
            instance = self.model.get_by_id(id)
            for key, value in update_data.items():
                if hasattr(self.model, key):
                    setattr(instance, key, value)
                else: 
                    raise self._field_not_exist(key)
            instance.save()
            return instance
        except DoesNotExist:
            if not auto_error:
                return None
            else:
                raise self._400_does_not_exist


    def update_by_instance(self, instance: T, update_data: Dict[str, Any]) -> T:
        for key, value in update_data.items():
            if hasattr(self.model, key):
                setattr(instance, key, value)
            else: 
                raise self._field_not_exist(key)
        instance.save()
        return instance


    def update(self, instance: T, **fields) -> T:
        for key, value in fields.items():
            if hasattr(self.model, key):
                setattr(instance, key, value)
            else:
                raise self._field_not_exist(key)
        instance.save()
        return instance

    
    def update_all(self, update_data: Dict[str, Any], **where) -> int:
        query = self.model.update(**update_data)
        for field, value in where.items():
            if not hasattr(self.model, field):
                raise self._field_not_exist(field)
            query = query.where(getattr(self.model, field) == value)
        return query.execute()


    @overload
    def get_or_none(self, auto_error: Literal[False], **kwargs) -> Optional[T]: ...

    @overload
    def get_or_none(self, auto_error: Literal[True], **kwargs) -> T: ...
    
    def get_or_none(self, auto_error: bool = False, **kwargs) -> Optional[T]:
        try:
            query = []
            for field, value in kwargs.items():
                if hasattr(self.model, field):
                    query.append(getattr(self.model, field) == value)
                else:
                    raise self._field_not_exist(field)
            instance = self.model.get(*query)
            return instance
        except DoesNotExist:
            if not auto_error:
                return None
            else:
                raise self._400_does_not_exist


    def select_where(self, **kwargs) -> List[T]:
        select = self.model.select()
        for field, value in kwargs.items():
            if hasattr(self.model, field):
                select = select.where(getattr(self.model, field) == value)
            else:
                raise self._field_not_exist(field)
        return list(select)


    def exists(self, **kwargs) -> bool:
        select = self.model.select()
        for field, value in kwargs.items():
            if hasattr(self.model, field):
                select = select.where(getattr(self.model, field) == value)
            else:
                raise self._field_not_exist(field)
        return select.exists()


    def count(self, **kwargs) -> int:
        select = self.model.select()
        for field, value in kwargs.items():
            if hasattr(self.model, field):
                select = select.where(getattr(self.model, field) == value)
            else:
                raise self._field_not_exist(field)
        return select.count()

    def delete_by_instance(self, instance: T) -> None:
        instance.delete_instance()

    
    def delete(self, auto_error: bool, **kwargs):
        instance = self.get_or_none(auto_error, **kwargs)
        if instance:
            instance.delete_instance()
    
    
    def delete_all(self, **where) -> None:
        select = self.model.select()
        for field, value in where.items():
            if hasattr(self.model, field):
                select = select.where(getattr(self.model, field) == value)
            else:
                raise self._field_not_exist(field)
        for instance in select:
            instance.delete_instance()
