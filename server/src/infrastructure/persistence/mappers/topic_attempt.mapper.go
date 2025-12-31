package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type TopicAttemptMapper struct{}

func (this TopicAttemptMapper) DataToModel(data *entities.TopicAttemptData) *models.TopicAttempt {
	if data == nil {
		return &models.TopicAttempt{}
	}

	model := &models.TopicAttempt{
		IsActive: data.IsActive,
	}

	if data.UserTopic.ID != 0 {
		model.UserTopicID = data.UserTopic.ID
	}

	return model
}

func (this TopicAttemptMapper) EntityToModel(entity *entities.TopicAttempt) *models.TopicAttempt {
	if entity == nil {
		return &models.TopicAttempt{}
	}
	model := this.DataToModel(&entity.TopicAttemptData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this TopicAttemptMapper) ModelToEntity(model *models.TopicAttempt) *entities.TopicAttempt {
	if model == nil {
		return &entities.TopicAttempt{}
	}

	entity := &entities.TopicAttempt{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		TopicAttemptData: entities.TopicAttemptData{
			IsActive: model.IsActive,
		},
	}

	if model.UserTopic != nil {
		entity.UserTopic = *UserTopicMapper{}.ModelToEntity(model.UserTopic)
	}

	return entity
}
