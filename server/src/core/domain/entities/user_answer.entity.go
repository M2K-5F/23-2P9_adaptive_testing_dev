package entities

type UserChoiceAnswerData struct {
	User           User         `json:"user"`
	Answer         Answer       `json:"answer"`
	ByUserQuestion UserQuestion `json:"by_user_question"`
	IsChoised      bool         `json:"is_choised"`
}

type UserChoiceAnswer struct {
	Entity
	UserChoiceAnswerData
}
