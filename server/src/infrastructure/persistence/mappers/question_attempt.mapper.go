package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type QuestionAttemptMapper struct{}

func (this QuestionAttemptMapper) DataToModel(data *entities.QuestionAttemptData) *models.QuestionAttempt {
	if data == nil {
		return &models.QuestionAttempt{}
	}

	model := &models.QuestionAttempt{
		IsAdaptive: data.IsAdaptive,
		OrderIndex: data.OrderIndex,
	}

	if data.TopicAttempt.ID != 0 {
		model.TopicAttemptID = data.TopicAttempt.ID
	}

	if data.Question.ID != 0 {
		model.QuestionID = data.Question.ID
	}

	return model
}

func (this QuestionAttemptMapper) EntityToModel(entity *entities.QuestionAttempt) *models.QuestionAttempt {
	if entity == nil {
		return &models.QuestionAttempt{}
	}
	model := this.DataToModel(&entity.QuestionAttemptData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this QuestionAttemptMapper) ModelToEntity(model *models.QuestionAttempt) *entities.QuestionAttempt {
	if model == nil {
		return &entities.QuestionAttempt{}
	}

	entity := &entities.QuestionAttempt{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		QuestionAttemptData: entities.QuestionAttemptData{
			IsAdaptive: model.IsAdaptive,
			OrderIndex: model.OrderIndex,
		},
	}

	if model.TopicAttempt != nil {
		entity.TopicAttempt = *TopicAttemptMapper{}.ModelToEntity(model.TopicAttempt)
	}

	if model.Question != nil {
		entity.Question = *QuestionMapper{}.ModelToEntity(model.Question)
	}

	return entity
}
