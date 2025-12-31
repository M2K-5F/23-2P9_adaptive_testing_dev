package entities

type TopicData struct {
	ByCourse       Course  `json:"by_course"`
	CreatedBy      User    `json:"created_by"`
	Title          string  `json:"title"`
	Description    string  `json:"description"`
	IsActive       bool    `json:"is_active"`
	NumberInCourse int     `json:"number_in_course"`
	QuestionCount  int     `json:"question_count"`
	ScoreForPass   float64 `json:"score_for_pass"`
}

type Topic struct {
	Entity
	TopicData
}
