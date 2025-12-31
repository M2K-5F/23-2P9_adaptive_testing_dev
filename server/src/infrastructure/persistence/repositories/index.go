package repositories

import (
	"context"

	"gorm.io/gorm"
)

type IMapper[TData, TModel, TEntity any] interface {
	DataToModel(*TData) *TModel
	ModelToEntity(*TModel) *TEntity
	EntityToModel(*TEntity) *TModel
}

type HasID struct {
	ID uint
}

type Repository[TData any, TModel any, TEntity any] struct {
	ctx      context.Context
	DB       *gorm.DB
	Mapper   IMapper[TData, TModel, TEntity]
	preloads []string
}

func (r *Repository[TData, TModel, TEntity]) WithPreloads() *gorm.DB {
	result := r.WithContext()
	for _, preload := range r.preloads {
		result = result.Preload(preload)
	}
	return result
}

func (r *Repository[TData, TModel, TEntity]) WithContext() *gorm.DB {
	result := r.WithContext()

	return result
}

func (r *Repository[TData, TModel, TEntity]) Create(data *TData) (*TEntity, error) {
	model := r.Mapper.DataToModel(data)

	if err := r.WithContext().Create(model).Error; err != nil {
		return nil, err
	}

	hasID := any(model).(HasID)

	if err := r.WithPreloads().First(model, hasID.ID).Error; err != nil {
		return nil, err
	}

	entity := r.Mapper.ModelToEntity(model)
	return entity, nil
}

func (r *Repository[TData, TModel, TEntity]) GetByID(id uint) (*TEntity, error) {
	var model TModel
	if err := r.WithPreloads().First(&model, id).Error; err != nil {
		return nil, err
	}

	entity := r.Mapper.ModelToEntity(&model)
	return entity, nil
}

func (r *Repository[TData, TModel, TEntity]) Delete(id uint) error {
	var model TModel
	return r.WithContext().Delete(&model, id).Error
}

func (r *Repository[TData, TModel, TEntity]) Update(entity *TEntity) error {
	model := r.Mapper.EntityToModel(entity)

	if err := r.WithContext().Save(model).Error; err != nil {
		return err
	}

	hasID := any(model).(HasID)

	if err := r.WithPreloads().First(model, hasID.ID).Error; err != nil {
		return err
	}

	*entity = *r.Mapper.ModelToEntity(model)
	return nil
}
