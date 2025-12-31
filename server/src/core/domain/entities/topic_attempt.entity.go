package entities

type TopicAttemptData struct {
	UserTopic UserTopic `json:"user_topic"`
	IsActive  bool      `json:"is_active"`
}

type TopicAttempt struct {
	Entity
	TopicAttemptData
}
