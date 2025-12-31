package entities

type QuestionAttemptData struct {
	TopicAttempt TopicAttempt `json:"topic_attempt"`
	Question     Question     `json:"question"`
	IsAdaptive   bool         `json:"is_adaptive"`
	OrderIndex   int          `json:"order_index"`
}

type QuestionAttempt struct {
	Entity
	QuestionAttemptData
}
