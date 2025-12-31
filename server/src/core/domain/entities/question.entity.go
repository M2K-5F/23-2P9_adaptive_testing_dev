package entities

import "analtesting/src/core/constants"

type QuestionData struct {
	Text              string                  `json:"text"`
	ByTopic           Topic                   `json:"by_topic"`
	QuestionType      string                  `json:"question_type"`
	IsActive          bool                    `json:"is_active"`
	BaseWeightProfile constants.WeightProfile `json:"base_weight_profile"`
}

type Question struct {
	Entity
	QuestionData
}
