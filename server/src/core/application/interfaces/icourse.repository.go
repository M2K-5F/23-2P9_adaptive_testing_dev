package interfaces

import "analtesting/src/core/domain/entities"

type ICourseRepository interface {
	IRepository[entities.CourseData, entities.Course]
	GetCoursesCreatedByUser(user *entities.User) ([]entities.Course, error)
}
