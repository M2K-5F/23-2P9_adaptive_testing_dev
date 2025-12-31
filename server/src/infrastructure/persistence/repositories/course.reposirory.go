package repositories

import (
	"analtesting/src/core/application/interfaces"
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
	"analtesting/src/infrastructure/persistence/mappers"
	"context"

	"gorm.io/gorm"
)

type CourseRepository struct {
	*Repository[entities.CourseData, models.Course, entities.Course]
}

func (this CourseRepository) GetCoursesCreatedByUser(user *entities.User) ([]entities.Course, error) {
	var courses []entities.Course
	if err := this.WithPreloads().Where("created_by = ?", user.ID).Find(&courses).Error; err != nil {
		return nil, err
	}

	return courses, nil
}

func GetCourseRepository(ctx context.Context, db gorm.DB) interfaces.ICourseRepository {
	return &CourseRepository{
		&Repository[entities.CourseData, models.Course, entities.Course]{
			DB:       &db,
			ctx:      ctx,
			Mapper:   mappers.CourseMapper{},
			preloads: []string{"CreatedBy"},
		},
	}
}
