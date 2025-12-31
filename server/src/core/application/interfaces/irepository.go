package interfaces

type IRepository[entityData, entity any] interface {
	Create(data *entityData) (*entity, error)
	Update(entity *entity) error

	Delete(id uint) error

	GetByID(id uint) (*entity, error)
}
