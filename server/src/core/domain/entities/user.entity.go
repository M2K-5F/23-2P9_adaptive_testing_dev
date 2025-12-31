package entities

import (
	"time"
)

type UserRoles string

const (
	AdminRole    UserRoles = "ADMIN"
	CustomerRole UserRoles = "CUSTOMER"
)

type UserData struct {
	Roles        []UserRoles `json:"roles,omitempty"`
	UserName     string      `json:"user_name,omitempty"`
	Name         string      `json:"name,omitempty"`
	TelegramLink string      `json:"telegram_link,omitempty"`
	PasswordHash string      `json:"-"`
}

type User struct {
	ID        uint      `json:"id,omitempty"`
	CreatedAt time.Time `json:"-"`
	UserData  `json:"user_data,omitempty"`
}
