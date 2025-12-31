package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type TopicMapper struct{}

func (this TopicMapper) DataToModel(data *entities.TopicData) *models.Topic {
	if data == nil {
		return &models.Topic{}
	}

	model := &models.Topic{
		Title:          data.Title,
		Description:    data.Description,
		IsActive:       data.IsActive,
		NumberInCourse: data.NumberInCourse,
		QuestionCount:  data.QuestionCount,
		ScoreForPass:   data.ScoreForPass,
		ByCourse:       *CourseMapper{}.EntityToModel(&data.ByCourse),
		CreatedBy:      *UserMapper{}.EntityToModel(&data.CreatedBy),
	}

	return model
}

func (this TopicMapper) EntityToModel(entity *entities.Topic) *models.Topic {
	if entity == nil {
		return &models.Topic{}
	}
	model := this.DataToModel(&entity.TopicData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this TopicMapper) ModelToEntity(model *models.Topic) *entities.Topic {
	if model == nil {
		return &entities.Topic{}
	}

	entity := &entities.Topic{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		TopicData: entities.TopicData{
			Title:          model.Title,
			Description:    model.Description,
			IsActive:       model.IsActive,
			NumberInCourse: model.NumberInCourse,
			QuestionCount:  model.QuestionCount,
			ScoreForPass:   model.ScoreForPass,
			ByCourse:       *CourseMapper{}.ModelToEntity(&model.ByCourse),
			CreatedBy:      *UserMapper{}.ModelToEntity(&model.CreatedBy),
		},
	}

	return entity
}
