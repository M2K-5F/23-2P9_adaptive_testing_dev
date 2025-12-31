package entities

type UserTextAnswerData struct {
	User            User         `json:"user"`
	Question        Question     `json:"question"`
	ByUserTopic     UserTopic    `json:"by_user_topic"`
	ForUserQuestion UserQuestion `json:"for_user_question"`
	Text            string       `json:"text"`
	Progress        float64      `json:"progress"`
	IsActive        bool         `json:"is_active"`
}

type UserTextAnswer struct {
	Entity
	UserTextAnswerData
}
