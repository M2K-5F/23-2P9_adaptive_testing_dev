package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type AnswerMapper struct{}

func (this AnswerMapper) DataToModel(data *entities.AnswerData) *models.Answer {
	if data == nil {
		return &models.Answer{}
	}

	model := &models.Answer{
		Text:       data.Text,
		IsCorrect:  data.IsCorrect,
		ByQuestion: *QuestionMapper{}.EntityToModel(&data.ByQuestion),
	}

	return model
}

func (this AnswerMapper) EntityToModel(entity *entities.Answer) *models.Answer {
	if entity == nil {
		return &models.Answer{}
	}
	model := this.DataToModel(&entity.AnswerData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this AnswerMapper) ModelToEntity(model *models.Answer) *entities.Answer {
	if model == nil {
		return &entities.Answer{}
	}

	entity := &entities.Answer{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		AnswerData: entities.AnswerData{
			Text:       model.Text,
			IsCorrect:  model.IsCorrect,
			ByQuestion: *QuestionMapper{}.ModelToEntity(&model.ByQuestion),
		},
	}

	return entity
}
