package interfaces

import "analtesting/src/core/domain/entities"

type UserRepository interface {
	Create(data *entities.UserData) (*entities.User, error)
	Update(entity *entities.User) error

	Delete(id uint) error

	GetByID(id uint) (*entities.User, error)
	GetByUsername(username string) (*entities.User, error)
}
