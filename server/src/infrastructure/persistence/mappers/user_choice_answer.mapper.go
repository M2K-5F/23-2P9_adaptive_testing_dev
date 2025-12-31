package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type UserChoiceAnswerMapper struct{}

func (this UserChoiceAnswerMapper) DataToModel(data *entities.UserChoiceAnswerData) *models.UserChoiceAnswer {
	if data == nil {
		return &models.UserChoiceAnswer{}
	}

	model := &models.UserChoiceAnswer{
		UserID:    data.UserID,
		IsChoised: data.IsChoised,
	}

	if data.Answer.ID != 0 {
		model.AnswerID = data.Answer.ID
	}

	if data.ByUserQuestion.ID != 0 {
		model.ByUserQuestionID = data.ByUserQuestion.ID
	}

	return model
}

func (this UserChoiceAnswerMapper) EntityToModel(entity *entities.UserChoiceAnswer) *models.UserChoiceAnswer {
	if entity == nil {
		return &models.UserChoiceAnswer{}
	}
	model := this.DataToModel(&entity.UserChoiceAnswerData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this UserChoiceAnswerMapper) ModelToEntity(model *models.UserChoiceAnswer) *entities.UserChoiceAnswer {
	if model == nil {
		return &entities.UserChoiceAnswer{}
	}

	entity := &entities.UserChoiceAnswer{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		UserChoiceAnswerData: entities.UserChoiceAnswerData{
			UserID:    model.UserID,
			IsChoised: model.IsChoised,
		},
	}

	if model.User != nil {
		entity.User = *UserMapper{}.ModelToEntity(model.User)
	}

	if model.Answer != nil {
		entity.Answer = *AnswerMapper{}.ModelToEntity(model.Answer)
	}

	if model.ByUserQuestion != nil {
		entity.ByUserQuestion = *UserQuestionMapper{}.ModelToEntity(model.ByUserQuestion)
	}

	return entity
}
