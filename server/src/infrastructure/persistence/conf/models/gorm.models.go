package models

import (
	"analtesting/src/core/constants"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name         string `gorm:"unique"`
	UserName     string `gorm:"unique"`
	PasswordHash string
	TelegramLink string
	IsActive     bool   `gorm:"default:true"`
	Roles        []Role `gorm:"many2many:user_roles"`
}

type Role struct {
	gorm.Model
	Name string `gorm:"unique"`
}

type UserRole struct {
	gorm.Model
	UserID uint
	User   User
	RoleID uint
	Role   Role
}

type Course struct {
	gorm.Model
	Title        string `gorm:"size:64"`
	CreatedByID  uint
	CreatedBy    User
	IsActive     bool   `gorm:"default:true"`
	Description  string `gorm:"size:128"`
	TopicCount   int    `gorm:"default:0"`
	GroupCount   int    `gorm:"default:0"`
	StudentCount int    `gorm:"default:0"`
}

type Group struct {
	gorm.Model
	ByCourseID        uint
	ByCourse          Course
	Title             string `gorm:"size:128"`
	MaxStudentCount   int    `gorm:"default:30"`
	StudentCount      int    `gorm:"default:0"`
	CreatedByID       uint
	CreatedBy         User
	AdaptivityProfile constants.AdaptivityProfileName
	IsActive          bool   `gorm:"default:true"`
	Type              string `gorm:"default:'public'"`
	PasskeyEncrypt    string `gorm:"size:16;default:''"`
}

type Topic struct {
	gorm.Model
	ByCourseID     uint
	ByCourse       Course
	CreatedByID    uint
	CreatedBy      User
	Title          string `gorm:"size:64"`
	Description    string `gorm:"size:128"`
	IsActive       bool   `gorm:"default:true"`
	NumberInCourse int
	QuestionCount  int     `gorm:"default:0"`
	ScoreForPass   float64 `gorm:"default:80"`
}

type Question struct {
	gorm.Model
	Text              string `gorm:"size:128"`
	ByTopicID         uint
	ByTopic           Topic
	QuestionType      string
	IsActive          bool `gorm:"default:true"`
	BaseWeightProfile constants.WeightProfileName
}

type Answer struct {
	gorm.Model
	Text         string `gorm:"size:64"`
	IsCorrect    bool
	ByQuestionID uint
	ByQuestion   Question
}

type UserGroup struct {
	gorm.Model
	UserID              string `gorm:"size:255"`
	User                User   `gorm:"foreignKey:UserID;references:UserName"`
	GroupID             uint
	Group               Group
	CourseID            uint
	Course              Course
	Progress            float64 `gorm:"default:0"`
	CompletedTopicCount int     `gorm:"default:0"`
}

type QuestionWeight struct {
	gorm.Model
	GroupID       uint
	Group         Group
	QuestionID    uint
	Question      Question
	Weight        float64
	Profile       string
	WeightProfile constants.WeightProfileName
}

type UserTopic struct {
	gorm.Model
	UserID        string `gorm:"size:255"`
	User          User   `gorm:"foreignKey:UserID;references:UserName"`
	TopicID       uint
	Topic         Topic
	ByUserGroupID uint
	ByUserGroup   UserGroup
	IsCompleted   bool    `gorm:"default:false"`
	IsAttempted   bool    `gorm:"default:false"`
	IsAvailable   bool    `gorm:"default:false"`
	IsActive      bool    `gorm:"default:true"`
	Progress      float64 `gorm:"default:0"`
	AttemptCount  int     `gorm:"default:0"`
}

type UserQuestion struct {
	gorm.Model
	UserID        string `gorm:"size:255"`
	User          User   `gorm:"foreignKey:UserID;references:UserName"`
	QuestionID    uint
	Question      Question
	ByUserTopicID uint
	ByUserTopic   UserTopic
	Progress      float64 `gorm:"default:0"`
	IsActive      bool    `gorm:"default:true"`
}

type UserChoiceAnswer struct {
	gorm.Model
	UserID           string `gorm:"size:255"`
	User             User   `gorm:"foreignKey:UserID;references:UserName"`
	AnswerID         uint
	Answer           Answer
	ByUserQuestionID uint
	ByUserQuestion   UserQuestion
	IsChoised        bool `gorm:"default:false"`
}

type UserTextAnswer struct {
	gorm.Model
	UserID            string `gorm:"size:255"`
	User              User   `gorm:"foreignKey:UserID;references:UserName"`
	QuestionID        uint
	Question          Question
	ByUserTopicID     uint
	ByUserTopic       UserTopic
	ForUserQuestionID uint
	ForUserQuestion   UserQuestion
	Text              string  `gorm:"size:60"`
	Progress          float64 `gorm:"default:0"`
	IsActive          bool    `gorm:"default:true"`
}

type TopicAttempt struct {
	gorm.Model
	UserTopicID uint
	UserTopic   UserTopic
	IsActive    bool `gorm:"default:true"`
}

type QuestionAttempt struct {
	gorm.Model
	TopicAttemptID uint
	TopicAttempt   TopicAttempt
	QuestionID     uint
	Question       Question
	IsAdaptive     bool
	OrderIndex     int
}
