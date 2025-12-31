package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type UserTextAnswerMapper struct{}

func (this UserTextAnswerMapper) DataToModel(data *entities.UserTextAnswerData) *models.UserTextAnswer {
	if data == nil {
		return &models.UserTextAnswer{}
	}

	model := &models.UserTextAnswer{
		UserID:   data.UserID,
		Text:     data.Text,
		Progress: data.Progress,
		IsActive: data.IsActive,
	}

	if data.Question.ID != 0 {
		model.QuestionID = data.Question.ID
	}

	if data.ByUserTopic.ID != 0 {
		model.ByUserTopicID = data.ByUserTopic.ID
	}

	if data.ForUserQuestion.ID != 0 {
		model.ForUserQuestionID = data.ForUserQuestion.ID
	}

	return model
}

func (this UserTextAnswerMapper) EntityToModel(entity *entities.UserTextAnswer) *models.UserTextAnswer {
	if entity == nil {
		return &models.UserTextAnswer{}
	}
	model := this.DataToModel(&entity.UserTextAnswerData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this UserTextAnswerMapper) ModelToEntity(model *models.UserTextAnswer) *entities.UserTextAnswer {
	if model == nil {
		return &entities.UserTextAnswer{}
	}

	entity := &entities.UserTextAnswer{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		UserTextAnswerData: entities.UserTextAnswerData{
			UserID:   model.UserID,
			Text:     model.Text,
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

	if model.ForUserQuestion != nil {
		entity.ForUserQuestion = *UserQuestionMapper{}.ModelToEntity(model.ForUserQuestion)
	}

	return entity
}
