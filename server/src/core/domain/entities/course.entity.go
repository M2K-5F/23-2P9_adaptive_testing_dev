package entities

type CourseData struct {
	Title        string `json:"title"`
	CreatedBy    User   `json:"created_by"`
	IsActive     bool   `json:"is_active"`
	Description  string `json:"description"`
	TopicCount   int    `json:"topic_count"`
	GroupCount   int    `json:"group_count"`
	StudentCount int    `json:"student_count"`
}

type Course struct {
	Entity
	CourseData
}

func (self *Course) Archivate() {
	self.IsActive = false
}

func (self *Course) Activate() {
	self.IsActive = true
}
