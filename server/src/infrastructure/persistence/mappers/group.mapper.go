package mappers

import (
	"analtesting/src/core/constants"
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type GroupMapper struct{}

func (this GroupMapper) DataToModel(data *entities.GroupData) *models.Group {
	if data == nil {
		return &models.Group{}
	}

	return &models.Group{
		ByCourse:          *CourseMapper{}.EntityToModel(&data.ByCourse),
		Title:             data.Title,
		MaxStudentCount:   data.MaxStudentCount,
		StudentCount:      data.StudentCount,
		CreatedBy:         *UserMapper{}.EntityToModel(&data.CreatedBy),
		AdaptivityProfile: data.AdaptivityProfile.Name,
		IsActive:          data.IsActive,
		Type:              data.Type,
		PasskeyEncrypt:    data.PasskeyEncrypt,
	}
}

func (this GroupMapper) EntityToModel(entity *entities.Group) *models.Group {
	if entity == nil {
		return &models.Group{}
	}

	model := this.DataToModel(&entity.GroupData)
	model.CreatedAt = entity.CreatedAt
	model.ID = entity.ID
	return model
}

func (this GroupMapper) ModelToEntity(model *models.Group) *entities.Group {
	if model == nil {
		return &entities.Group{}
	}

	return &entities.Group{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		GroupData: entities.GroupData{
			Title:             model.Title,
			MaxStudentCount:   model.MaxStudentCount,
			StudentCount:      model.StudentCount,
			CreatedBy:         *UserMapper{}.ModelToEntity(&model.CreatedBy),
			ByCourse:          *CourseMapper{}.ModelToEntity(&model.ByCourse),
			AdaptivityProfile: constants.GetAdaptivityProfile(model.AdaptivityProfile),
			IsActive:          model.IsActive,
			Type:              model.Type,
			PasskeyEncrypt:    model.PasskeyEncrypt,
		},
	}
}
