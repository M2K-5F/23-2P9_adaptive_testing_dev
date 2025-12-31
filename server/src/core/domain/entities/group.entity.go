package entities

import "analtesting/src/core/constants"

type GroupData struct {
	ByCourse          Course                      `json:"by_course"`
	Title             string                      `json:"title"`
	MaxStudentCount   int                         `json:"max_student_count"`
	StudentCount      int                         `json:"student_count"`
	CreatedBy         User                        `json:"created_by"`
	AdaptivityProfile constants.AdaptivityProfile `json:"adaptivity_profile"`
	IsActive          bool                        `json:"is_active"`
	Type              string                      `json:"type"`
	PasskeyEncrypt    string                      `json:"passkey_encrypt"`
}

type Group struct {
	Entity
	GroupData
}
