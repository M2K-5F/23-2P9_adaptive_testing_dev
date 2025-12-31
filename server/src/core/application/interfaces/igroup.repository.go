package interfaces

import "analtesting/src/core/domain/entities"

type IGroupRepository interface {
	IRepository[entities.GroupData, entities.Group]
}
