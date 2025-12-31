package entities

type UserGroupData struct {
	User                User    `json:"user"`
	Group               Group   `json:"group"`
	Course              Course  `json:"course"`
	Progress            float64 `json:"progress"`
	CompletedTopicCount int     `json:"completed_topic_count"`
}

type UserGroup struct {
	Entity
	UserGroupData
}
