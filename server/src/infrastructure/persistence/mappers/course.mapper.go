package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"

	"gorm.io/gorm"
)

type CourseMapper struct{}

func (this CourseMapper) DataToModel(data *entities.CourseData) *models.Course {
	if data == nil {
		return &models.Course{}
	}
	return &models.Course{
		Title:       data.Title,
		CreatedBy:   *UserMapper{}.EntityToModel(&data.CreatedBy),
		IsActive:    data.IsActive,
		Description: data.Description,
	}
}

func (this CourseMapper) EntityToModel(entity *entities.Course) *models.Course {
	if entity == nil {
		return &models.Course{}
	}
	return &models.Course{
		Model: gorm.Model{
			ID:        entity.ID,
			CreatedAt: entity.CreatedAt,
		},
		Title:        entity.Title,
		CreatedBy:    *UserMapper{}.EntityToModel(&entity.CreatedBy),
		IsActive:     entity.IsActive,
		Description:  entity.Description,
		TopicCount:   entity.TopicCount,
		GroupCount:   entity.GroupCount,
		StudentCount: entity.StudentCount,
	}
}

func (this CourseMapper) ModelToEntity(model *models.Course) *entities.Course {
	if model == nil {
		return &entities.Course{}
	}
	return &entities.Course{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		CourseData: entities.CourseData{
			Title:        model.Title,
			Description:  model.Description,
			IsActive:     model.IsActive,
			CreatedBy:    *UserMapper{}.ModelToEntity(&model.CreatedBy),
			TopicCount:   model.TopicCount,
			StudentCount: model.StudentCount,
			GroupCount:   model.GroupCount,
		},
	}
}
