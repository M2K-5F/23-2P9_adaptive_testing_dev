package mappers

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
)

type QuestionWeightMapper struct{}

func (this QuestionWeightMapper) DataToModel(data *entities.QuestionWeightData) *models.QuestionWeight {
	if data == nil {
		return &models.QuestionWeight{}
	}

	model := &models.QuestionWeight{
		Weight:        data.Weight,
		Profile:       data.Profile,
		WeightProfile: data.WeightProfile,
	}

	if data.Group.ID != 0 {
		model.GroupID = data.Group.ID
	}

	if data.Question.ID != 0 {
		model.QuestionID = data.Question.ID
	}

	return model
}

func (this QuestionWeightMapper) EntityToModel(entity *entities.QuestionWeight) *models.QuestionWeight {
	if entity == nil {
		return &models.QuestionWeight{}
	}
	model := this.DataToModel(&entity.QuestionWeightData)
	model.ID = entity.ID
	model.CreatedAt = entity.CreatedAt
	return model
}

func (this QuestionWeightMapper) ModelToEntity(model *models.QuestionWeight) *entities.QuestionWeight {
	if model == nil {
		return &entities.QuestionWeight{}
	}

	entity := &entities.QuestionWeight{
		Entity: entities.Entity{
			ID:        model.ID,
			CreatedAt: model.CreatedAt,
		},
		QuestionWeightData: entities.QuestionWeightData{
			Weight:        model.Weight,
			Profile:       model.Profile,
			WeightProfile: model.WeightProfile,
		},
	}

	if model.Group != nil {
		entity.Group = *GroupMapper{}.ModelToEntity(model.Group)
	}

	if model.Question != nil {
		entity.Question = *QuestionMapper{}.ModelToEntity(model.Question)
	}

	return entity
}
