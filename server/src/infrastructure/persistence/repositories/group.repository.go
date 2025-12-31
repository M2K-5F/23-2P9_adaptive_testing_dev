package repositories

import (
	"analtesting/src/core/application/interfaces"
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
	"analtesting/src/infrastructure/persistence/mappers"
	"context"

	"gorm.io/gorm"
)

type GroupRepository struct {
	*Repository[entities.GroupData, models.Group, entities.Group]
}

func GetGroupRepository(ctx context.Context, db gorm.DB) interfaces.IGroupRepository {
	return &GroupRepository{
		Repository: &Repository[entities.GroupData, models.Group, entities.Group]{
			DB:       &db,
			ctx:      ctx,
			Mapper:   mappers.GroupMapper{},
			preloads: []string{"ByCourse", "CreatedBy"},
		},
	}
}
