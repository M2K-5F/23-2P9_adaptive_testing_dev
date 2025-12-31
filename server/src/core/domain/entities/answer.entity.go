package entities

type AnswerData struct {
	Text       string   `json:"text"`
	IsCorrect  bool     `json:"is_correct"`
	ByQuestion Question `json:"by_question"`
}

type Answer struct {
	Entity
	AnswerData
}
