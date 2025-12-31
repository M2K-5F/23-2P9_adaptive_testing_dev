package mappers

import (
	"analtesting/src/core/constants"
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type QuestionMapper struct{}

func (this QuestionMapper) DataToModel(data *entities.QuestionData) *models.Question {
	if data == nil {
		return &models.Question{}
	}

	model := &models.Question{
		Text:              data.Text,
		QuestionType:      data.QuestionType,
		IsActive:          data.IsActive,
		BaseWeightProfile: data.BaseWeightProfile.Name,
		ByTopic:           *TopicMapper{}.EntityToModel(&data.ByTopic),
	}

	return model
}

func (this QuestionMapper) EntityToModel(entity *entities.Question) *models.Question {
	if entity == nil {
		return &models.Question{}
	}

	model := this.DataToModel(&entity.QuestionData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this QuestionMapper) ModelToEntity(model *models.Question) *entities.Question {
	if model == nil {
		return &entities.Question{}
	}

	entity := &entities.Question{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		QuestionData: entities.QuestionData{
			Text:              model.Text,
			QuestionType:      model.QuestionType,
			IsActive:          model.IsActive,
			BaseWeightProfile: constants.GetWeightProfile(model.BaseWeightProfile),
			ByTopic:           *TopicMapper{}.ModelToEntity(&model.ByTopic),
		},
	}

	return entity
}
