package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type UserQuestionMapper struct{}

func (this UserQuestionMapper) DataToModel(data *entities.UserQuestionData) *models.UserQuestion {
	if data == nil {
		return &models.UserQuestion{}
	}

	model := &models.UserQuestion{
		UserID:   data.UserID,
		Progress: data.Progress,
		IsActive: data.IsActive,
	}

	if data.Question.ID != 0 {
		model.QuestionID = data.Question.ID
	}

	if data.ByUserTopic.ID != 0 {
		model.ByUserTopicID = data.ByUserTopic.ID
	}

	return model
}

func (this UserQuestionMapper) EntityToModel(entity *entities.UserQuestion) *models.UserQuestion {
	if entity == nil {
		return &models.UserQuestion{}
	}
	model := this.DataToModel(&entity.UserQuestionData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this UserQuestionMapper) ModelToEntity(model *models.UserQuestion) *entities.UserQuestion {
	if model == nil {
		return &entities.UserQuestion{}
	}

	entity := &entities.UserQuestion{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		UserQuestionData: entities.UserQuestionData{
			UserID:   model.UserID,
			Progress: model.Progress,
			IsActive: model.IsActive,
		},
	}

	if model.User != nil {
		entity.User = *UserMapper{}.ModelToEntity(model.User)
	}

	if model.Question != nil {
		entity.Question = *QuestionMapper{}.ModelToEntity(model.Question)
	}

	if model.ByUserTopic != nil {
		entity.ByUserTopic = *UserTopicMapper{}.ModelToEntity(model.ByUserTopic)
	}

	return entity
}
