package repositories

import (
	"analtesting/src/core/application/interfaces"
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
	"analtesting/src/infrastructure/persistence/mappers"
	"context"
	"fmt"

	"gorm.io/gorm"
)

type UserRepository struct {
	*Repository[entities.UserData, models.User, entities.User]
}

func (this UserRepository) UpdateRelations(model *models.User, roleList []entities.UserRoles) error {
	roleNames := make([]string, len(roleList))
	for i, role := range roleList {
		roleNames[i] = string(role)
	}

	var existing []models.Role

	if err := this.WithContext().Where("name IN ?", roleNames).Find(&existing).Error; err != nil {
		return err
	}

	if len(existing) != len(roleList) {
		return fmt.Errorf("Some roles not found")
	}

	if err := this.WithContext().Model(model).Association("Roles").Replace(existing); err != nil {
		return err
	}

	model.Roles = existing

	return nil
}

func (this UserRepository) Create(data *entities.UserData) (*entities.User, error) {
	model := this.Mapper.DataToModel(data)
	if err := this.WithContext().Create(model).Error; err != nil {
		return nil, err
	}

	err := this.UpdateRelations(model, data.Roles)
	if err != nil {
		return nil, err
	}

	entity := this.Mapper.ModelToEntity(model)
	return entity, nil
}

func (this UserRepository) Update(entity *entities.User) error {
	model := this.Mapper.EntityToModel(entity)

	if err := this.WithContext().Save(model).Error; err != nil {
		return err
	}

	if err := this.UpdateRelations(model, entity.Roles); err != nil {
		return err
	}

	return nil
}

func (this UserRepository) GetByUsername(username string) (*entities.User, error) {
	var model *models.User
	err := this.WithPreloads().Model(model).Where("user_name = ?", username).First(model).Error
	if err != nil {
		return nil, err
	}

	entity := this.Mapper.ModelToEntity(model)

	return entity, nil
}

// DI container method
func GetUserRepo(ctx context.Context, db *gorm.DB) interfaces.UserRepository {
	return &UserRepository{
		&Repository[entities.UserData, models.User, entities.User]{
			DB:       db,
			Mapper:   mappers.UserMapper{},
			ctx:      ctx,
			preloads: []string{"Roles"},
		},
	}
}
