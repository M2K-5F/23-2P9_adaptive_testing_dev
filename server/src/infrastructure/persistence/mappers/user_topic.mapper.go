package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type UserTopicMapper struct{}

func (this UserTopicMapper) DataToModel(data *entities.UserTopicData) *models.UserTopic {
	if data == nil {
		return &models.UserTopic{}
	}

	model := &models.UserTopic{
		UserID:       data.UserID,
		IsCompleted:  data.IsCompleted,
		IsAttempted:  data.IsAttempted,
		IsAvailable:  data.IsAvailable,
		IsActive:     data.IsActive,
		Progress:     data.Progress,
		AttemptCount: data.AttemptCount,
	}

	if data.Topic.ID != 0 {
		model.TopicID = data.Topic.ID
	}

	if data.ByUserGroup.ID != 0 {
		model.ByUserGroupID = data.ByUserGroup.ID
	}

	return model
}

func (this UserTopicMapper) EntityToModel(entity *entities.UserTopic) *models.UserTopic {
	if entity == nil {
		return &models.UserTopic{}
	}
	model := this.DataToModel(&entity.UserTopicData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this UserTopicMapper) ModelToEntity(model *models.UserTopic) *entities.UserTopic {
	if model == nil {
		return &entities.UserTopic{}
	}

	entity := &entities.UserTopic{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		UserTopicData: entities.UserTopicData{
			UserID:       model.UserID,
			IsCompleted:  model.IsCompleted,
			IsAttempted:  model.IsAttempted,
			IsAvailable:  model.IsAvailable,
			IsActive:     model.IsActive,
			Progress:     model.Progress,
			AttemptCount: model.AttemptCount,
		},
	}

	if model.User != nil {
		entity.User = *UserMapper{}.ModelToEntity(model.User)
	}

	if model.Topic != nil {
		entity.Topic = *TopicMapper{}.ModelToEntity(model.Topic)
	}

	if model.ByUserGroup != nil {
		entity.ByUserGroup = *UserGroupMapper{}.ModelToEntity(model.ByUserGroup)
	}

	return entity
}
