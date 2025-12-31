package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type UserMapper struct{}

func (this UserMapper) DataToModel(data *entities.UserData) *models.User {
	if data == nil {
		return &models.User{}
	}
	model := models.User{
		Name:         data.Name,
		UserName:     data.UserName,
		TelegramLink: data.TelegramLink,
		PasswordHash: data.PasswordHash,
	}
	return &model
}

func (this UserMapper) EntityToModel(entity *entities.User) *models.User {
	if entity == nil {
		return &models.User{}
	}
	model := this.DataToModel(&entity.UserData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this UserMapper) ModelToEntity(model *models.User) *entities.User {
	if model == nil {
		return &entities.User{}
	}
	roles := make([]entities.UserRoles, len(model.Roles))
	for i, Role := range model.Roles {
		roles[i] = entities.UserRoles(Role.Name)
	}

	entity := entities.User{
		ID:        model.ID,
		CreatedAt: model.CreatedAt,
		UserData: entities.UserData{
			TelegramLink: model.TelegramLink,
			Name:         model.Name,
			UserName:     model.UserName,
			PasswordHash: model.PasswordHash,
			Roles:        roles,
		},
	}
	return &entity
}
