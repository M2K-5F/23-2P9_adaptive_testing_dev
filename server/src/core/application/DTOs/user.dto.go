package dtos

import "analtesting/src/core/domain/entities"

type CreateUserDTO struct {
	Roles        []entities.UserRoles `json:"roles,omitempty" validate:"required,min=1"`
	UserName     string               `json:"user_name,omitempty" validate:"required,min=6,max=64"`
	Name         string               `json:"name,omitempty" validate:"required,min=6,max=32"`
	TelegramLink string               `json:"telegram_link,omitempty" validate:"required,url,contains=t.me/"`
	Password     string               `json:"password" validate:"required"`
}
