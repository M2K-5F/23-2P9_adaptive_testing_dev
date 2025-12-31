package entities

type UserTopicData struct {
	User         User      `json:"user"`
	Topic        Topic     `json:"topic"`
	ByUserGroup  UserGroup `json:"by_user_group"`
	IsCompleted  bool      `json:"is_completed"`
	IsAttempted  bool      `json:"is_attempted"`
	IsAvailable  bool      `json:"is_available"`
	IsActive     bool      `json:"is_active"`
	Progress     float64   `json:"progress"`
	AttemptCount int       `json:"attempt_count"`
}

type UserTopic struct {
	Entity
	UserTopicData
}
