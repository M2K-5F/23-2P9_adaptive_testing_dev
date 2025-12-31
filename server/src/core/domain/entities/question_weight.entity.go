package entities

import "analtesting/src/core/constants"

type QuestionWeightData struct {
	Group    Group                   `json:"group"`
	Question Question                `json:"question"`
	Weight   float64                 `json:"weight"`
	Profile  constants.WeightProfile `json:"profile"`
}

type QuestionWeight struct {
	Entity
	QuestionWeightData
}
