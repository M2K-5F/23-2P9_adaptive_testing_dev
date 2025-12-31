package usecases

import (
	dtos "analtesting/src/core/application/DTOs"
	"analtesting/src/core/application/interfaces"
	"analtesting/src/core/domain/entities"
	"fmt"
)

type CreateCourse struct {
	CurrentUser *entities.User
	CourseRepo  interfaces.ICourseRepository
}

func (this CreateCourse) Execute(data dtos.CreateCourseDTO) (*entities.Course, error) {
	createdCourse, err := this.CourseRepo.Create(
		&entities.CourseData{
			Title:       data.CourseTitle,
			Description: data.CourseDescription,
			IsActive:    true,
			CreatedBy:   *this.CurrentUser,
		},
	)

	if err != nil {
		return nil, err
	}

	return createdCourse, nil
}

type ArchivateCourse struct {
	CourseRepo  interfaces.ICourseRepository
	CurrentUser entities.User
}

func (this ArchivateCourse) Execute(CourseId uint) error {
	course, err := this.CourseRepo.GetByID(CourseId)

	if err != nil {
		return err
	}

	if !course.IsActive {
		return fmt.Errorf("Course already archivated")
	}

	if course.CreatedBy.ID != this.CurrentUser.ID {
		return fmt.Errorf("You not a course creator")
	}

	course.Archivate()

	if err := this.CourseRepo.Update(course); err != nil {
		return err
	}

	return nil
}

type ActivateCourse struct {
	CourseRepo  interfaces.ICourseRepository
	CurrentUser *entities.User
}

func (this ActivateCourse) Execute(CourseID uint) error {
	course, err := this.CourseRepo.GetByID(CourseID)

	if err != nil {
		return err
	}

	if course.IsActive {
		return fmt.Errorf("Course already active")
	}

	if course.CreatedBy.ID != this.CurrentUser.ID {
		return fmt.Errorf("You not a course creator")
	}

	course.Activate()

	if err := this.CourseRepo.Update(course); err != nil {
		return err
	}

	return nil
}

type GetTeacherCourses struct {
	CourseRepo interfaces.ICourseRepository
	UserRepo   interfaces.UserRepository
}

func (this GetTeacherCourses) Execute(userID uint) ([]entities.Course, error) {
	user, err := this.UserRepo.GetByID(userID)

	if err != nil {
		return nil, err
	}

	courses, err := this.CourseRepo.GetCoursesCreatedByUser(user)

	if err != nil {
		return nil, err
	}

	return courses, nil
}

type GetCourseById struct {
	CourseRepo interfaces.ICourseRepository
}

func (this GetCourseById) Execute(courseId uint) (*entities.Course, error) {
	course, err := this.CourseRepo.GetByID(courseId)

	if err != nil {
		return nil, err
	}

	return course, nil
}
