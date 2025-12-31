package entities

type UserQuestionData struct {
	User        User      `json:"user"`
	Question    Question  `json:"question"`
	ByUserTopic UserTopic `json:"by_user_topic"`
	Progress    float64   `json:"progress"`
	IsActive    bool      `json:"is_active"`
}

type UserQuestion struct {
	Entity
	UserQuestionData
}
